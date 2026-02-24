import { createSymbol, Refkey } from "@alloy-js/core";
import { useThriftNamePolicy } from "../name-policy.js";
import { useThriftFileScope } from "./scopes.js";
import { ThriftOutputSymbol } from "./thrift-output-symbol.js";

export interface CreateThriftSymbolOptions {
  refkey?: Refkey;
  nameKind:
    | "type"
    | "service"
    | "const"
    | "field"
    | "enum"
    | "enum-value"
    | "typedef"
    | "function";
  kind?: "type" | "service" | "const";
}

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

export function createTypeSymbol(
  name: string,
  refkey?: Refkey,
): ThriftOutputSymbol {
  return createThriftSymbol(name, { nameKind: "type", kind: "type", refkey });
}

export function createConstSymbol(
  name: string,
  refkey?: Refkey,
): ThriftOutputSymbol {
  return createThriftSymbol(name, { nameKind: "const", kind: "const", refkey });
}

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
