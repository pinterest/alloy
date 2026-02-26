import { createSymbol, Refkey } from "@alloy-js/core";
import { type ThriftNameKind, useThriftNamePolicy } from "../name-policy.js";
import { useThriftFileScope } from "./scopes.js";
import type { ThriftSymbolKind } from "./thrift-output-symbol.js";
import { ThriftOutputSymbol } from "./thrift-output-symbol.js";

/**
 * Options for creating a Thrift output symbol.
 */
export interface CreateThriftSymbolOptions {
  /** An optional refkey to associate with the symbol for cross-file references. */
  refkey?: Refkey;
  /** The name kind used to select the correct name policy formatting rule. */
  nameKind: ThriftNameKind;
  /** The declaration kind stored on the resulting symbol. */
  kind?: ThriftSymbolKind;
}

/**
 * Create a {@link ThriftOutputSymbol} and register it in the current file scope.
 *
 * @remarks
 * This is the low-level factory used by the higher-level helpers
 * ({@link createTypeSymbol}, {@link createConstSymbol},
 * {@link createServiceSymbol}). It must be called within a {@link SourceFile}
 * component tree.
 *
 * @param name - The identifier for the symbol.
 * @param options - Symbol creation options including refkey, name kind, and
 *   declaration kind.
 * @returns The created `ThriftOutputSymbol`.
 * @throws If called outside a `SourceFile` component tree.
 */
export function createThriftSymbol(
  name: string,
  options: CreateThriftSymbolOptions,
): ThriftOutputSymbol {
  const scope = useThriftFileScope();
  if (!scope) {
    throw new Error("Thrift declarations must be inside a SourceFile.");
  }

  const symbol = createSymbol(ThriftOutputSymbol, name, scope.symbols, {
    refkeys: options.refkey,
    namePolicy: useThriftNamePolicy().for(options.nameKind),
    metadata: {
      kind: options.kind,
    },
  });
  if (options.kind) {
    symbol.kind = options.kind;
  }
  return symbol;
}

/**
 * Create a Thrift type symbol (for structs, unions, exceptions, enums, and
 * typedefs).
 *
 * @param name - The type name.
 * @param refkey - Optional refkey for cross-file references.
 * @returns A `ThriftOutputSymbol` with kind `"type"`.
 */
export function createTypeSymbol(
  name: string,
  refkey?: Refkey,
): ThriftOutputSymbol {
  return createThriftSymbol(name, { nameKind: "type", kind: "type", refkey });
}

/**
 * Create a Thrift constant symbol.
 *
 * @param name - The constant name.
 * @param refkey - Optional refkey for cross-file references.
 * @returns A `ThriftOutputSymbol` with kind `"const"`.
 */
export function createConstSymbol(
  name: string,
  refkey?: Refkey,
): ThriftOutputSymbol {
  return createThriftSymbol(name, { nameKind: "const", kind: "const", refkey });
}

/**
 * Create a Thrift service symbol.
 *
 * @param name - The service name.
 * @param refkey - Optional refkey for cross-file references.
 * @returns A `ThriftOutputSymbol` with kind `"service"`.
 */
export function createServiceSymbol(
  name: string,
  refkey?: Refkey,
): ThriftOutputSymbol {
  return createThriftSymbol(name, {
    nameKind: "service",
    kind: "service",
    refkey,
  });
}
