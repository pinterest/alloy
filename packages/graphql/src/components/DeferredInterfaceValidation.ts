import {
  Children,
  isComponentCreator,
  isRefkey,
  OutputSymbol,
} from "@alloy-js/core";
import { GraphQLOutputSymbol } from "../symbols/graphql-output-symbol.js";
import { ref } from "../symbols/reference.js";
import { TypeReference, TypeReferenceProps } from "./TypeReference.js";

/**
 * Generates a unique key for a field, encoding name, type, and args.
 */
function generateFieldKey(
  name: string,
  type: string,
  args: Set<string> = new Set(),
): string {
  return [name, type, ...[...args].sort()].join("\0");
}

/**
 * Check if setA is a superset of setB (all items in B are in A).
 */
function isSupersetOf(setA: Set<string>, setB: Set<string>): boolean {
  for (const item of setB) {
    if (!setA.has(item)) return false;
  }
  return true;
}

interface ResolvedInterface {
  symbol: GraphQLOutputSymbol;
}

interface PendingValidation {
  typeName: string;
  typeSymbol: GraphQLOutputSymbol;
  interfaces: ResolvedInterface[];
}

// Global registry for types that need validation
let pendingValidations: PendingValidation[] = [];
let validationErrors: Error[] = [];

/**
 * Resolve a symbol's type annotation to a string.
 * Expects the symbol's typeAnnotation metadata to be a TypeReference component.
 */
export function resolveTypeAnnotation(symbol: OutputSymbol): string {
  const { binder } = symbol;

  function resolve(type: Children): string {
    // TypeReference - recursively resolve props
    if (isComponentCreator(type, TypeReference)) {
      const props = type.props as TypeReferenceProps;
      let result = resolve(props.type);
      if (props.list) result = `[${result}]`;
      if (props.required) result = `${result}!`;
      return result;
    }

    // Refkey - resolve to symbol name
    if (isRefkey(type)) {
      return binder!.getSymbolForRefkey(type).value?.name ?? "";
    }

    // String - use directly
    if (typeof type === "string") {
      return type;
    }

    throw new Error(`Invalid type annotation: ${typeof type}`);
  }

  return resolve(symbol.metadata.typeAnnotation as Children);
}

/**
 * Extract field keys from a symbol's member space as a Set.
 */
function extractFieldKeys(symbol: GraphQLOutputSymbol): Set<string> {
  const fields = new Set<string>();

  for (const fieldSymbol of symbol.members.symbolNames.values()) {
    const name = fieldSymbol.name;
    const type = resolveTypeAnnotation(fieldSymbol).replace(/\s/g, "");

    // Extract argument keys
    const args = new Set<string>();
    const fieldMembers = fieldSymbol.memberSpaceFor("members");
    if (fieldMembers) {
      for (const argSymbol of fieldMembers.symbolNames.values()) {
        const argName = argSymbol.name;
        const argType = resolveTypeAnnotation(argSymbol).replace(/\s/g, "");
        args.add(generateFieldKey(argName, argType));
      }
    }

    fields.add(generateFieldKey(name, type, args));
  }

  return fields;
}

/**
 * Register a type for deferred interface implementation validation.
 * Resolves interface refkeys immediately while we're still in the render context with access to the binder.
 * Field extraction is deferred until validation time to ensure all members have been added.
 */
export function registerForValidation(
  typeName: string,
  symbol: GraphQLOutputSymbol,
  interfaces: Children[],
): void {
  // Resolve interfaces immediately while we have binder context, including transitive ones
  const resolvedInterfaces: Record<string, ResolvedInterface> = {};

  function resolveInterfacesRecursively(interfaces: Children[]) {
    for (const iface of interfaces) {
      // An interface can be either a refkey or a string literal, only validate refkey references,
      // as string literal interfaces are already validated and rendered as is.
      if (!isRefkey(iface)) continue;

      const reference = ref(iface);
      const [, ifaceSymbol] = reference();
      const nameStr = String(ifaceSymbol?.name);

      if (ifaceSymbol && !(nameStr in resolvedInterfaces)) {
        resolvedInterfaces[nameStr] = { symbol: ifaceSymbol };

        // Recursively resolve parent interfaces
        const parentInterfaces = ifaceSymbol.metadata.implements as
          | Children[]
          | undefined;
        if (parentInterfaces?.length) {
          resolveInterfacesRecursively(parentInterfaces);
        }
      }
    }
  }

  resolveInterfacesRecursively(interfaces);

  pendingValidations.push({
    typeName,
    typeSymbol: symbol,
    interfaces: Object.values(resolvedInterfaces),
  });
}

/**
 * Run all pending interface implementation validations
 *
 * This is called automatically by the SourceFile component after rendering is complete.
 * Users don't need to call this manually - it's handled by the framework.
 *
 * Errors are collected rather than thrown, and can be retrieved with getValidationErrors().
 */
export function runPendingValidations(): void {
  const validations = pendingValidations;
  resetValidationState();

  for (const { typeName, typeSymbol, interfaces } of validations) {
    const typeFields = extractFieldKeys(typeSymbol);

    for (const { symbol: interfaceSymbol } of interfaces) {
      const interfaceName = String(interfaceSymbol.name);
      const interfaceFields = extractFieldKeys(interfaceSymbol);

      if (!isSupersetOf(typeFields, interfaceFields)) {
        validationErrors.push(
          new Error(
            `Type "${typeName}" does not correctly implement interface "${interfaceName}".`,
          ),
        );
      }
    }
  }
}

/**
 * Get all validation errors collected during the last validation run
 */
export function getValidationErrors(): Error[] {
  return validationErrors;
}

/**
 * Clear all pending validations and errors (useful for testing)
 */
export function resetValidationState(): void {
  pendingValidations = [];
  validationErrors = [];
}
