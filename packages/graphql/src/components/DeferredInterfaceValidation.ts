import { Children, isRefkey, OutputSymbol } from "@alloy-js/core";
import { GraphQLOutputSymbol } from "../symbols/graphql-output-symbol.js";
import { ref } from "../symbols/reference.js";

interface FieldInfo {
  name: string;
  type: string;
}

interface ObjectFieldInfo extends FieldInfo {
  args: FieldInfoSet<FieldInfo>;
}

/**
 * Generates a unique key for a FieldInfo, including type and nested args.
 * Enables Set-based comparisons when needed.
 */
function generateKey(field: FieldInfo | ObjectFieldInfo): string {
  const parts = [field.name, field.type];
  if ("args" in field) {
    parts.push(
      ...[...field.args.fields()]
        .toSorted((a, b) => a.name.localeCompare(b.name))
        .map(generateKey),
    );
  }
  return parts.join("\0");
}

/**
 * A Set of FieldInfo objects.
 */
class FieldInfoSet<T extends FieldInfo = FieldInfo> extends Set<string> {
  #byName = new Map<string, T>();

  add(field: T | string): this {
    if (typeof field === "string") {
      throw new Error("FieldInfoSet.add() does not support raw strings");
    }
    const key = generateKey(field);
    if (!super.has(key)) {
      super.add(key);
      this.#byName.set(field.name, field);
    }
    return this;
  }

  get(name: string): T | undefined {
    return this.#byName.get(name);
  }

  hasName(name: string): boolean {
    return this.#byName.has(name);
  }

  fields(): IterableIterator<T> {
    return this.#byName.values();
  }

  /**
   * Checks if this set equals another set.
   * Returns null if equal, or an error message describing the first difference.
   */
  equals(other: FieldInfoSet<T>, context: string): string | null {
    // Check for missing fields
    for (const field of this.fields()) {
      const otherField = other.get(field.name);
      if (!otherField) {
        return `${context}: missing argument "${field.name}"`;
      }
      if (field.type && otherField.type && field.type !== otherField.type) {
        return `${context}: argument "${field.name}" type must be "${field.type}", found "${otherField.type}"`;
      }
    }

    // Check for extra fields
    for (const field of other.fields()) {
      if (!this.hasName(field.name)) {
        return `${context}: unexpected argument "${field.name}"`;
      }
    }

    return null;
  }

  isSupersetOf(
    other: FieldInfoSet<T>,
    context: { typeName: string; interfaceName: string },
  ): string | null {
    const { typeName, interfaceName } = context;

    for (const otherField of other.fields()) {
      const thisField = this.get(otherField.name);

      // Check if field exists
      if (!thisField) {
        return `Type "${typeName}" must implement field "${otherField.name}" from interface "${interfaceName}".`;
      }

      // Validate return types
      if (
        otherField.type &&
        thisField.type &&
        otherField.type !== thisField.type
      ) {
        return `Type "${typeName}" field "${otherField.name}" return type must be "${otherField.type}" to match interface "${interfaceName}", but found "${thisField.type}".`;
      }

      // Validate arguments if present
      if ("args" in otherField && "args" in thisField) {
        const argsError = (otherField.args as FieldInfoSet).equals(
          thisField.args as FieldInfoSet,
          `Type "${typeName}" field "${otherField.name}"`,
        );
        if (argsError) {
          return `${argsError} to match interface "${interfaceName}".`;
        }
      }
    }

    return null;
  }
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
function toFieldInfo(symbol: OutputSymbol): FieldInfo {
  const type = symbol.metadata.type;
  return {
    name: symbol.name,
    type: type ? String(type).replace(/\s/g, "") : "",
  };
}

/**
 * Extract field information from a symbol's member space
 */
function extractFieldInfo(
  symbol: GraphQLOutputSymbol,
): FieldInfoSet<ObjectFieldInfo> {
  const fields = new FieldInfoSet<ObjectFieldInfo>();

  for (const fieldSymbol of symbol.members.symbolNames.values()) {
    const { name, type } = toFieldInfo(fieldSymbol);

    // Extract arguments from the field symbol's own members
    const args = new FieldInfoSet<FieldInfo>();
    const fieldMembers = fieldSymbol.memberSpaceFor("members");

    if (fieldMembers) {
      for (const argSymbol of fieldMembers.symbolNames.values()) {
        args.add(toFieldInfo(argSymbol));
      }
    }

    fields.add({ name, type, args });
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
  typeFields: FieldInfoSet<ObjectFieldInfo>,
  interfaceSymbol: GraphQLOutputSymbol,
): void {
  const interfaceName = String(interfaceSymbol.name);
  const interfaceFields = extractFieldInfo(interfaceSymbol);

  const error = typeFields.isSupersetOf(interfaceFields, {
    typeName,
    interfaceName,
  });
  if (error) {
    throw new Error(error);
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
