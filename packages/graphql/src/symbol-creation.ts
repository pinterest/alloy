import { Namekey, OutputSpace, useBinder } from "@alloy-js/core";
import { GraphQLElements, useGraphQLNamePolicy } from "./name-policy.js";
import {
  GraphQLOutputSymbol,
  GraphQLOutputSymbolOptions,
} from "./symbols/graphql-output-symbol.js";
import { useGraphQLScope } from "./symbols/scopes.js";

export interface CreateGraphQLSymbolOptions extends GraphQLOutputSymbolOptions {
  space?: OutputSpace;
}

/**
 * Creates a symbol for a GraphQL declaration in the current scope.
 *
 * Automatically determines the appropriate space based on the current scope:
 * - In a lexical scope: adds to scope.symbols
 * - In a member scope: adds to ownerSymbol.members
 */
export function createGraphQLSymbol(
  name: string | Namekey,
  options: CreateGraphQLSymbolOptions = {},
  kind?: GraphQLElements,
): GraphQLOutputSymbol {
  const currentScope = useGraphQLScope();
  let targetSpace = options.space ?? undefined;
  if (!options.space && currentScope) {
    if (currentScope.ownerSymbol) {
      targetSpace = currentScope.ownerSymbol.members;
    } else if ("symbols" in currentScope) {
      targetSpace = currentScope.symbols;
    }
  }

  const binder = options.binder ?? currentScope?.binder ?? useBinder();

  return new GraphQLOutputSymbol(name, targetSpace, {
    binder: binder,
    aliasTarget: options.aliasTarget,
    refkeys: options.refkeys,
    metadata: options.metadata,
    type: options.type,
    ignoreNameConflict: options.ignoreNameConflict,
    namePolicy: useGraphQLNamePolicy().for(kind),
  });
}
