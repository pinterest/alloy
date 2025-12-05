import { Children, isComponentCreator, isRefkey, memo } from "@alloy-js/core";
import { ref } from "../symbols/reference.js";
import { TypeReference } from "./TypeReference.js";

/**
 * Validates that a root type is an object type.
 * Only validates refkey references - non-refkey types can't be validated
 * at generation time. The GraphQL schema validation will catch these errors.
 */
export function validateRootType(
  type: Children | undefined,
  operationType: string,
): void {
  if (!type || !isRefkey(type)) return;

  const reference = ref(type);
  const [typeName, symbol] = reference();

  const kind = symbol?.metadata?.kind;
  if (kind && kind !== "object") {
    throw new Error(
      `Schema ${operationType} type must be an object type, but "${typeName}" is a ${kind}.`,
    );
  }
}

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
 * Validates union members: must have at least one member, and all must be object types.
 * @param members - The union members array
 * @param unionName - The union name for error messaging
 * @throws {Error} If the union has no members or any member is not an object type
 */
export function validateUnionMembers(
  members: Children[] | undefined,
  unionName: string,
): void {
  if (!members || members.length === 0) {
    throw new Error(
      `Union "${unionName}" must have at least one member type. ` +
        `Per the GraphQL spec, unions cannot be empty.`,
    );
  }

  for (const member of members) {
    // Only validate refkey references - string literals can't be validated
    // at generation time. The GraphQL schema validation will catch these errors.
    if (!isRefkey(member)) continue;

    const reference = ref(member);
    const [name, symbol] = reference();

    if (symbol?.metadata?.kind && symbol.metadata.kind !== "object") {
      throw new Error(
        `Union "${unionName}" cannot include "${name}". ` +
          `Per the GraphQL spec, union members must be object types.`,
      );
    }
  }
}

/**
 * Validates that the type prop is a TypeReference component.
 *
 * @param type - The type prop value
 * @param fieldName - The field/argument name for error messaging
 * @param context - The context for error messaging (e.g., "Field", "Argument")
 * @throws {Error} If type is not a TypeReference component
 */
export function validateTypeReference(
  type: Children,
  fieldName: string,
  context: string,
): void {
  if (!isComponentCreator(type, TypeReference)) {
    throw new Error(
      `${context} "${fieldName}" type must be a TypeReference component. ` +
        `Use <TypeReference type={...} /> to specify the type.`,
    );
  }
}

/**
 * Extracts the base type (innermost refkey or string) from a TypeReference.
 * Traverses nested TypeReference components to find the base type.
 */
function getBaseType(type: Children): Children {
  if (isComponentCreator(type, TypeReference)) {
    return getBaseType(type.props.type);
  }
  return type;
}

/**
 * Validates that a type is valid for output positions (field return types).
 * Output types can be: Scalars, Objects, Interfaces, Unions, Enums
 * But not: Input Objects
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
  // Extract base type from TypeReference
  const baseType = getBaseType(type);

  // Only validate refkey references - string types can't be validated
  // at generation time. The GraphQL schema validation will catch these errors.
  if (!isRefkey(baseType)) return;

  const reference = ref(baseType);
  const [typeName, symbol] = reference();

  if (symbol?.metadata?.kind === "input") {
    throw new Error(
      `Field "${fieldName}" on ${contextType} cannot use input object type "${typeName}". ` +
        `Input objects can only be used in input positions (arguments, input fields).`,
    );
  }
}

/**
 * Validates that a type is valid for input positions (arguments, input fields).
 * Input types can be: Scalars, Enums, Input Objects
 * But not: Objects, Interfaces, Unions
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
  // Extract base type from TypeReference
  const baseType = getBaseType(type);

  // Only validate refkey references - string types can't be validated
  // at generation time. The GraphQL schema validation will catch these errors.
  if (!isRefkey(baseType)) return;

  const reference = ref(baseType);
  const [typeName, symbol] = reference();

  const kind = symbol?.metadata?.kind;
  if (kind && kind !== "scalar" && kind !== "enum" && kind !== "input") {
    throw new Error(
      `${context} "${fieldName}" cannot use ${kind} type "${typeName}". ` +
        `Only scalars, enums, and input objects can be used in input positions.`,
    );
  }
}

/**
 * Validates that a fragment type condition is a valid composite output type.
 * Fragment type conditions can be: Objects, Interfaces
 * But NOT: Scalars, Enums, Input Objects, Unions
 *
 * @param typeCondition - The type condition to validate
 * @param fragmentName - The fragment name for error messaging
 * @throws {Error} If an invalid type is used as a fragment type condition
 */
export function validateFragmentTypeCondition(
  typeCondition: Children,
  fragmentName: string,
): void {
  // Only validate refkey references - non-refkey types can't be validated
  // at generation time. The GraphQL schema validation will catch these errors.
  if (!isRefkey(typeCondition)) return;

  const reference = ref(typeCondition);
  const [typeName, symbol] = reference();

  const kind = symbol?.metadata?.kind;

  // Fragments can only be on composite types (object, interface, union)
  if (kind === "scalar" || kind === "enum" || kind === "input") {
    const kindDisplay =
      kind === "input" ? "input object type"
      : kind === "scalar" ? "scalar type"
      : "enum type";
    throw new Error(
      `Fragment "${fragmentName}" cannot have type condition "${typeName}" (${kindDisplay}). ` +
        `Per the GraphQL spec, fragments can only be used on object types, interfaces, and unions.`,
    );
  }
}
