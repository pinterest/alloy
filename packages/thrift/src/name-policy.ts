import { NamePolicy, createNamePolicy, useNamePolicy } from "@alloy-js/core";

/**
 * The kinds of named declarations in a Thrift IDL file.
 *
 * @remarks
 * Used by the name policy to apply per-kind formatting and validation rules.
 */
export type ThriftNameKind =
  | "type"
  | "service"
  | "const"
  | "field"
  | "enum"
  | "enum-value"
  | "typedef"
  | "namespace"
  | "function";

/**
 * Options for creating a custom Thrift name policy.
 */
export interface ThriftNamePolicyOptions {
  /**
   * An optional formatting function applied before validation.
   *
   * @remarks
   * Use this to enforce naming conventions (e.g. PascalCase for types,
   * UPPER_SNAKE for enum values). The formatted name is then validated
   * against Thrift identifier rules and reserved words.
   *
   * @example
   * ```ts
   * createThriftNamePolicy({
   *   format: (name, kind) =>
   *     kind === "enum-value" ? name.toUpperCase() : name,
   * });
   * ```
   */
  format?: (name: string, kind: ThriftNameKind) => string;
}

const IDENTIFIER_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;

const RESERVED_WORDS = new Set([
  "namespace",
  "include",
  "typedef",
  "const",
  "enum",
  "struct",
  "union",
  "exception",
  "service",
  "extends",
  "throws",
  "required",
  "optional",
  "oneway",
  "void",
  "bool",
  "byte",
  "i16",
  "i32",
  "i64",
  "double",
  "string",
  "binary",
  "list",
  "set",
  "map",
]);

/**
 * Create a Thrift name policy that validates and optionally formats identifiers.
 *
 * @remarks
 * The returned policy enforces two rules on every identifier:
 *
 * 1. It must match `[A-Za-z_][A-Za-z0-9_]*` (the Thrift identifier grammar).
 * 2. It must not be a Thrift reserved word (keywords and builtin type names).
 *
 * If an optional `format` function is provided, it is applied before validation.
 *
 * @param options - Options for customizing name formatting.
 * @returns A `NamePolicy` scoped to {@link ThriftNameKind}.
 *
 * @example Default policy
 * ```ts
 * const policy = createThriftNamePolicy();
 * policy.getName("UserId", "type"); // "UserId"
 * policy.getName("void", "type");   // throws: reserved word
 * ```
 *
 * @example Custom formatting
 * ```ts
 * const policy = createThriftNamePolicy({
 *   format: (name, kind) =>
 *     kind === "enum-value" ? name.toUpperCase() : name,
 * });
 * policy.getName("active", "enum-value"); // "ACTIVE"
 * ```
 */
export function createThriftNamePolicy(
  options: ThriftNamePolicyOptions = {},
): NamePolicy<ThriftNameKind> {
  return createNamePolicy((name, kind) => {
    const formatted = options.format ? options.format(name, kind) : name;

    if (!IDENTIFIER_REGEX.test(formatted)) {
      throw new Error(`Invalid Thrift identifier '${formatted}'.`);
    }

    if (RESERVED_WORDS.has(formatted)) {
      throw new Error(
        `Thrift identifier '${formatted}' is a reserved word and cannot be used for ${kind}.`,
      );
    }

    return formatted;
  });
}

/**
 * The default Thrift name policy.
 *
 * @remarks
 * Validates identifiers against Thrift grammar and reserved words without
 * applying any formatting transformations. This is the policy used by
 * {@link SourceFile} when no custom `namePolicy` prop is provided.
 */
export const defaultThriftNamePolicy = createThriftNamePolicy();

/**
 * Retrieve the current Thrift name policy from context.
 *
 * @remarks
 * Must be called within a component tree that has a {@link SourceFile} ancestor,
 * which provides the name policy via context.
 *
 * @returns The active `NamePolicy<ThriftNameKind>`.
 */
export function useThriftNamePolicy(): NamePolicy<ThriftNameKind> {
  return useNamePolicy() as NamePolicy<ThriftNameKind>;
}
