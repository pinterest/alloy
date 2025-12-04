import { Children, isRefkey, OutputSymbol } from "@alloy-js/core";
import { GraphQLOutputSymbol } from "../symbols/graphql-output-symbol.js";
import { ref } from "../symbols/reference.js";

interface FieldInfo {
  name: string;
  type: string;
}

/**
 * A Set of FieldInfo objects, keyed by name for lookup.
 * Provides set equality comparison for validating argument lists.
 */
class FieldInfoSet extends Set<FieldInfo> {
  private byName = new Map<string, FieldInfo>();

  add(field: FieldInfo): this {
    if (!this.byName.has(field.name)) {
      this.byName.set(field.name, field);
      super.add(field);
    }
    return this;
  }

  get(name: string): FieldInfo | undefined {
    return this.byName.get(name);
  }

  /**
   * Checks if this set equals another set.
   * Returns null if equal, or an error message describing the first difference.
   */
  equals(other: FieldInfoSet, context: string): string | null {
    // Check for missing fields
    for (const field of this) {
      const otherField = other.get(field.name);
      if (!otherField) {
        return `${context}: missing argument "${field.name}"`;
      }
      if (field.type && otherField.type && field.type !== otherField.type) {
        return `${context}: argument "${field.name}" type must be "${field.type}", found "${otherField.type}"`;
      }
    }

    // Check for extra fields
    for (const field of other) {
      if (!this.byName.has(field.name)) {
        return `${context}: unexpected argument "${field.name}"`;
      }
    }

    return null;
  }
}

interface ObjectFieldInfo extends FieldInfo {
  args: FieldInfoSet;
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
 * Extract FieldInfo (name and type) from a symbol
 */
function toFieldInfo(name: string, symbol: OutputSymbol): FieldInfo {
  const type = symbol.metadata.type;
  return {
    name,
    type: type ? String(type).replace(/\s/g, "") : "",
  };
}

/**
 * Extract field information from a symbol's member space
 */
function extractFieldInfo(symbol: GraphQLOutputSymbol): ObjectFieldInfo[] {
  const fields: ObjectFieldInfo[] = [];

  for (const [fieldName, fieldSymbol] of symbol.members.symbolNames.entries()) {
    const { name, type } = toFieldInfo(fieldName, fieldSymbol);

    // Extract arguments from the field symbol's own members
    const args = new FieldInfoSet();
    const fieldMembers = fieldSymbol.memberSpaceFor("members");

    if (fieldMembers) {
      for (const [argName, argSymbol] of fieldMembers.symbolNames.entries()) {
        args.add(toFieldInfo(argName, argSymbol));
      }
    }

    fields.push({ name, type, args });
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
      if (isRefkey(iface)) {
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
 *
 * @internal
 */
export function runPendingValidations(): void {
  const validations = pendingValidations;
  pendingValidations = [];
  validationErrors = [];

  for (const { typeName, typeSymbol, interfaces } of validations) {
    // Extract field information now that all members have been added
    const typeFields = extractFieldInfo(typeSymbol);

    try {
      // Validate each resolved interface
      for (const { symbol: interfaceSymbol } of interfaces) {
        validateTypeImplementsInterface(typeName, typeFields, interfaceSymbol);
      }
    } catch (e) {
      if (e instanceof Error) {
        validationErrors.push(e);
      }
    }
  }
}

/**
 * Validates that a type correctly implements a single interface
 */
function validateTypeImplementsInterface(
  typeName: string,
  typeFields: ObjectFieldInfo[],
  interfaceSymbol: GraphQLOutputSymbol,
): void {
  const interfaceName = String(interfaceSymbol.name);
  const interfaceFields = extractFieldInfo(interfaceSymbol);

  // Create a map of type fields for quick lookup
  const typeFieldMap = new Map(typeFields.map((f) => [f.name, f]));

  for (const interfaceField of interfaceFields) {
    const typeField = typeFieldMap.get(interfaceField.name);

    // Check if field exists
    if (!typeField) {
      throw new Error(
        `Type "${typeName}" must implement field "${interfaceField.name}" from interface "${interfaceName}".`,
      );
    }

    // Validate return types
    if (
      interfaceField.type &&
      typeField.type &&
      interfaceField.type !== typeField.type
    ) {
      throw new Error(
        `Type "${typeName}" field "${interfaceField.name}" return type must be "${interfaceField.type}" to match interface "${interfaceName}", but found "${typeField.type}".`,
      );
    }

    // Validate arguments by name (not position)
    const argsError = interfaceField.args.equals(
      typeField.args,
      `Type "${typeName}" field "${interfaceField.name}"`,
    );
    if (argsError) {
      throw new Error(`${argsError} to match interface "${interfaceName}".`);
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
