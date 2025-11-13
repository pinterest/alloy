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

// Operation keywords that are only reserved in lowercase
// Query, Mutation, Subscription are conventional type names and should be allowed
const OPERATION_KEYWORDS = new Set(["query", "mutation", "subscription"]);

const BUILTIN_SCALARS = new Set(builtInScalarNames);

/**
 * Ensures a valid GraphQL identifier by adding a suffix if needed.
 * @param name - The transformed name to validate.
 * @param originalName - The original name before transformation.
 * @returns A GraphQL-safe name.
 */
function ensureNonReservedName(name: string, originalName: string): string {
  const suffix = "_";

  // Check if the original name (before transformation) is exactly a lowercase operation keyword
  // This ensures 'query', 'mutation', 'subscription' get renamed but 'Query', 'Mutation', 'Subscription' don't
  if (OPERATION_KEYWORDS.has(originalName)) {
    return `${name}${suffix}`;
  }

  // Check if the name is a built-in scalar (case-sensitive)
  if (BUILTIN_SCALARS.has(name as BuiltInScalarName)) {
    return `${name}${suffix}`;
  }

  // Check if it's an exact match for operation keywords (case-sensitive)
  // This is a fallback in case the transformed name itself is an operation keyword
  if (OPERATION_KEYWORDS.has(name)) {
    return `${name}${suffix}`;
  }

  // Check if the lowercase version is a reserved word
  // This catches all SDL keywords regardless of casing
  if (GRAPHQL_RESERVED_WORDS.has(name.toLowerCase())) {
    return `${name}${suffix}`;
  }

  return name;
}

/**
 * Creates a name policy for GraphQL with appropriate naming conventions:
 * - Types: PascalCase
 * - Fields: camelCase
 * - Arguments: camelCase
 * - Enums: PascalCase
 * - Enum values: UPPER_SNAKE_CASE
 * - Directives: camelCase
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

    return ensureNonReservedName(transformedName, name);
  });
}

export function useGraphQLNamePolicy(): NamePolicy<GraphQLElements> {
  return useNamePolicy();
}
