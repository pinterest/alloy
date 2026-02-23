import { NamePolicy, createNamePolicy, useNamePolicy } from "@alloy-js/core";

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

export interface ThriftNamePolicyOptions {
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

export const defaultThriftNamePolicy = createThriftNamePolicy();

export function useThriftNamePolicy(): NamePolicy<ThriftNameKind> {
  return useNamePolicy() as NamePolicy<ThriftNameKind>;
}
