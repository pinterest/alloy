import { createNamePolicy, NamePolicy, useNamePolicy } from "@alloy-js/core";
import { camelCase, constantCase, pascalCase } from "change-case";
import { BuiltInScalarName, builtInScalarNames } from "./builtins/scalars.js";

export type GraphQLElements =
  | "type" // Type names (ObjectType, InterfaceType, etc.)
  | "field" // Field names
  | "argument" // Argument names
  | "enum" // Enum type names
  | "enumValue" // Enum value names
  | "directive" // Directive names
  | "scalar"; // Scalar type names

// Keywords that are reserved in GraphQL SDL
const GRAPHQL_RESERVED_WORDS = new Set([
  "fragment",
  "on",
  "true",
  "false",
  "null",
  "query",
  "mutation",
  "subscription",
  "type",
  "interface",
  "union",
  "enum",
  "input",
  "scalar",
  "schema",
  "extend",
  "directive",
  "implements",
  "repeatable",
]);

const BUILTIN_SCALARS = new Set(builtInScalarNames);

/**
 * Regular expression for valid GraphQL names per the spec:
 * - Must start with a letter (A-Z, a-z) or underscore (_)
 * - Can contain letters, digits (0-9), and underscores
 * @see https://spec.graphql.org/September2025/#Name
 */
const VALID_NAME_REGEX = /^[_A-Za-z][_0-9A-Za-z]*$/;

/**
 * Validates that a name follows the GraphQL specification format.
 * Names must start with a letter or underscore, and can only contain
 * letters, digits, and underscores.
 *
 * Note: Double underscore check is performed separately in preserveLeadingUnderscore
 * after name transformation, as we need to check the ORIGINAL name, not the transformed one.
 *
 * @param name - The name to validate (after transformation)
 * @throws {Error} If the name is invalid
 */
function validateGraphQLName(name: string): void {
  if (!VALID_NAME_REGEX.test(name)) {
    // Determine the specific issue for a better error message
    if (/^[0-9]/.test(name)) {
      throw new Error(
        `Invalid GraphQL name "${name}": names cannot start with a digit. ` +
          `Names must start with a letter (A-Z, a-z) or underscore (_).`,
      );
    } else if (!/^[_A-Za-z0-9]+$/.test(name)) {
      throw new Error(
        `Invalid GraphQL name "${name}": names can only contain letters (A-Z, a-z), ` +
          `digits (0-9), and underscores (_).`,
      );
    } else {
      throw new Error(
        `Invalid GraphQL name "${name}": names must start with a letter (A-Z, a-z) ` +
          `or underscore (_), and can only contain letters, digits, and underscores.`,
      );
    }
  }
}

/**
 * Ensures a valid GraphQL identifier by adding a suffix if needed.
 * @param name - The transformed name to validate.
 * @param element - The element type (used to determine which reserved words apply).
 * @returns A GraphQL-safe name.
 */
function ensureNonReservedName(
  name: string,
  element?: GraphQLElements,
): string {
  const suffix = "_";

  // First, validate that the name follows GraphQL spec format
  validateGraphQLName(name);

  // Check for conflicts that require renaming:
  // - Transformed name is a built-in scalar (Int, Float, String, Boolean, ID)
  if (BUILTIN_SCALARS.has(name as BuiltInScalarName)) {
    return `${name}${suffix}`;
  }

  // Check if the lowercase version is a reserved word
  // This catches all SDL keywords regardless of casing
  const lowerName = name.toLowerCase();
  if (GRAPHQL_RESERVED_WORDS.has(lowerName)) {
    // Query, Mutation, and Subscription are allowed ONLY as object type names
    // (they are the conventional root operation types in GraphQL schemas)
    if (
      (lowerName === "query" ||
        lowerName === "mutation" ||
        lowerName === "subscription") &&
      element === "type"
    ) {
      return name; // Allow Query/Mutation/Subscription as object type names
    }
    return `${name}${suffix}`;
  }

  return name;
}

/**
 * Validates GraphQL names and handles leading underscores.
 *
 * This function:
 * 1. Rejects names starting with __ (reserved for introspection)
 * 2. Preserves single leading underscores
 * 3. Returns the transformed name
 *
 * @param name - The original name
 * @param transformed - The transformed name (after pascalCase/camelCase)
 * @returns The validated name with leading underscore preserved if present
 * @throws {Error} If the name starts with double underscore (reserved for introspection)
 */
function handleLeadingUnderscore(name: string, transformed: string): string {
  // Check if original name starts with double underscore (reserved)
  if (name.startsWith("__")) {
    throw new Error(
      `Invalid GraphQL name "${name}": names starting with "__" (double underscore) ` +
        `are reserved for GraphQL introspection system.`,
    );
  }

  // Preserve single leading underscore if present
  if (name.startsWith("_") && !transformed.startsWith("_")) {
    return "_" + transformed;
  }

  return transformed;
}

/**
 * Creates a name policy for GraphQL with appropriate naming conventions:
 * - Types: PascalCase
 * - Fields: camelCase
 * - Arguments: camelCase
 * - Enums: PascalCase
 * - Enum values: UPPER_SNAKE_CASE
 * - Directives: camelCase
 *
 * Note: Single leading underscores are preserved per GraphQL spec.
 * Double underscores (__) are reserved for introspection.
 */
export function createGraphQLNamePolicy(): NamePolicy<GraphQLElements> {
  return createNamePolicy((name, element) => {
    let transformedName: string;

    switch (element) {
      case "type":
      case "enum":
      case "scalar":
        transformedName = pascalCase(name);
        break;
      case "enumValue":
        transformedName = constantCase(name);
        break;
      case "field":
      case "argument":
      case "directive":
        transformedName = camelCase(name);
        break;
      default:
        transformedName = camelCase(name);
        break;
    }

    // Handle leading underscore preservation
    transformedName = handleLeadingUnderscore(name, transformedName);

    return ensureNonReservedName(transformedName, element);
  });
}

export function useGraphQLNamePolicy(): NamePolicy<GraphQLElements> {
  return useNamePolicy();
}
