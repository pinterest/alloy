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
      // Member scope
      targetSpace = currentScope.ownerSymbol.members;

      // Check for duplicate members (fields, enum values, arguments, etc.)
      // Only check if we're not explicitly ignoring conflicts
      if (!options.ignoreNameConflict && targetSpace) {
        const nameStr = typeof name === "string" ? name : name.name;
        const existingSymbol = targetSpace.symbolNames.get(nameStr);
        if (existingSymbol) {
          const ownerName = currentScope.ownerSymbol.name;
          throw new Error(
            `Duplicate ${kind} name "${nameStr}" in ${ownerName}. ` +
              `Each ${kind} must have a unique name within its parent type.`,
          );
        }
      }
    } else if ("symbols" in currentScope) {
      // Lexical scope
      targetSpace = currentScope.symbols;
    }
  }

  const binder = options.binder ?? currentScope?.binder ?? useBinder();

  return new GraphQLOutputSymbol(name, targetSpace, {
    binder: binder,
    aliasTarget: options.aliasTarget,
    refkeys: options.refkeys,
    metadata: kind ? { kind, ...options.metadata } : options.metadata,
    type: options.type,
    ignoreNameConflict: options.ignoreNameConflict,
    namePolicy: useGraphQLNamePolicy().for(kind),
  });
}
