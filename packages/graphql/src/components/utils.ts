import { Children, isRefkey, memo, Refkey } from "@alloy-js/core";
import { ref } from "../symbols/reference.js";

/**
 * Wraps a description string in GraphQL triple-quote format (BlockString).
 *
 * This function:
 * 1. Converts literal \n sequences to actual newlines
 * 2. Trims leading/trailing whitespace
 * 3. Wraps the content in multi-line format: """\ncontent\n"""
 *
 * @param description - The description content to wrap
 * @returns A memoized function that returns the wrapped description or null
 */
export function wrapDescription(description: Children | undefined) {
  return memo(() => {
    if (!description) return null;

    const desc = String(description);
    // Replace literal \n with actual newlines
    const withNewlines = desc.replace(/\\n/g, "\n");
    const trimmed = withNewlines.trim();

    // Always use multi-line format with triple quotes on separate lines
    return `"""\n${trimmed}\n"""`;
  });
}

/**
 * Checks if a type string represents a non-null type (ends with !).
 *
 * @param type - The type string to check
 * @returns true if the type is non-null
 */
export function isNonNullType(type: Children): boolean {
  const typeStr = String(type).trim();
  return typeStr.endsWith("!");
}

/**
 * Validates that a default value is not null for a non-null type.
 *
 * @param type - The type of the argument/input field
 * @param defaultValue - The default value to validate
 * @param name - The name of the argument/input field for error message
 * @param context - Context for error message (e.g., "argument", "input field")
 * @throws {Error} If a null default value is provided for a non-null type
 */
export function validateNonNullDefault(
  type: Children,
  defaultValue: unknown,
  name: string,
  context: string,
): void {
  if (defaultValue === null && isNonNullType(type)) {
    throw new Error(
      `${context} "${name}" has a non-null type but a null default value. Non-null types cannot have null defaults.`,
    );
  }
}

/**
 * Validates that a union has at least one member type
 * @param members - The union members array
 * @param unionName - The union name for error messaging
 * @throws {Error} If the union has no members
 */
export function validateUnionHasMembers(
  members: Children[] | undefined,
  unionName: string,
): void {
  if (!members || members.length === 0) {
    throw new Error(
      `Union "${unionName}" must have at least one member type. ` +
        `Per the GraphQL spec, unions cannot be empty.`,
    );
  }
}

/**
 * Validates that all union members are object types
 * This checks refkey symbols for their type metadata
 * @param members - The union members array
 * @param unionName - The union name for error messaging
 * @throws {Error} If any member is not an object type
 */
export function validateUnionMemberTypes(
  members: Children[],
  unionName: string,
): void {
  for (const member of members) {
    // If it's a refkey, we can check the symbol metadata
    if (isRefkey(member)) {
      try {
        const reference = ref(member as Refkey);
        const [name, symbol] = reference();

        // Check if the symbol has type metadata indicating it's not an object type
        // The kind should be "object" for object types
        // Interfaces, scalars, enums, and input objects have different kinds
        if (symbol?.metadata?.kind) {
          const kind = symbol.metadata.kind as string;

          if (kind === "interface") {
            throw new Error(
              `Union "${unionName}" cannot include interface "${name}". ` +
                `Per the GraphQL spec, union members must be object types, not interfaces.`,
            );
          }

          if (kind === "scalar") {
            throw new Error(
              `Union "${unionName}" cannot include scalar "${name}". ` +
                `Per the GraphQL spec, union members must be object types, not scalars.`,
            );
          }

          if (kind === "enum") {
            throw new Error(
              `Union "${unionName}" cannot include enum "${name}". ` +
                `Per the GraphQL spec, union members must be object types, not enums.`,
            );
          }

          if (kind === "input") {
            throw new Error(
              `Union "${unionName}" cannot include input object "${name}". ` +
                `Per the GraphQL spec, union members must be object types, not input objects.`,
            );
          }

          if (kind === "union") {
            throw new Error(
              `Union "${unionName}" cannot include union "${name}". ` +
                `Per the GraphQL spec, union members must be object types, not other unions.`,
            );
          }
        }
      } catch (error) {
        // If we can't resolve the reference, skip validation
        // This might happen if the reference hasn't been defined yet
        if (error instanceof Error && !error.message.includes("Union")) {
          // Re-throw our own validation errors
          continue;
        } else {
          throw error;
        }
      }
    }
    // For string literals, we can't validate the type without more context
    // We trust the user knows what they're doing
  }
}

/**
 * Validates that a type is valid for output positions (field return types).
 * Output types can be: Scalars, Objects, Interfaces, Unions, Enums
 * But NOT: Input Objects
 *
 * @param type - The type to validate
 * @param fieldName - The field name for error messaging
 * @param contextType - The type that contains this field (for error messaging)
 * @throws {Error} If an input object type is used in an output position
 */
export function validateOutputType(
  type: Children,
  fieldName: string,
  contextType: string,
): void {
  // Check if this is a refkey we can resolve
  if (isRefkey(type)) {
    try {
      const reference = ref(type as Refkey);
      const [typeName, symbol] = reference();

      if (symbol?.metadata?.kind === "input") {
        throw new Error(
          `Field "${fieldName}" on ${contextType} cannot use input object type "${typeName}". ` +
            `Input objects can only be used in input positions (arguments, input fields).`,
        );
      }
    } catch (error) {
      // If we can't resolve the reference, skip validation
      if (
        error instanceof Error &&
        !error.message.includes("cannot use input object")
      ) {
        return;
      }
      throw error;
    }
  }
  // For non-refkey types, we can't validate at generation time
  // The GraphQL schema validation will catch these errors
}

/**
 * Validates that a type is valid for input positions (arguments, input fields).
 * Input types can be: Scalars, Enums, Input Objects
 * But NOT: Objects, Interfaces, Unions
 *
 * @param type - The type to validate
 * @param fieldName - The field/argument name for error messaging
 * @param context - The context for error messaging (e.g., "argument", "input field")
 * @throws {Error} If an output-only type is used in an input position
 */
export function validateInputType(
  type: Children,
  fieldName: string,
  context: string,
): void {
  // Check if this is a refkey we can resolve
  if (isRefkey(type)) {
    try {
      const reference = ref(type as Refkey);
      const [typeName, symbol] = reference();

      const kind = symbol?.metadata?.kind as string | undefined;

      if (kind === "object") {
        throw new Error(
          `${context} "${fieldName}" cannot use object type "${typeName}". ` +
            `Object types can only be used in output positions (field return types).`,
        );
      }

      if (kind === "interface") {
        throw new Error(
          `${context} "${fieldName}" cannot use interface type "${typeName}". ` +
            `Interfaces can only be used in output positions (field return types).`,
        );
      }

      if (kind === "union") {
        throw new Error(
          `${context} "${fieldName}" cannot use union type "${typeName}". ` +
            `Unions can only be used in output positions (field return types).`,
        );
      }
    } catch (error) {
      // If we can't resolve the reference, skip validation
      if (error instanceof Error && !error.message.includes("cannot use")) {
        return;
      }
      throw error;
    }
  }
  // For non-refkey types, we can't validate at generation time
  // The GraphQL schema validation will catch these errors
}
