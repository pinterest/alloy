import {
  Children,
  memo,
  Refkey,
  resolve,
  unresolvedRefkey,
} from "@alloy-js/core";
import { GraphQLOutputSymbol } from "./graphql-output-symbol.js";
import { GraphQLOutputScope } from "./scopes.js";

export function ref(
  refkey: Refkey,
): () => [Children, GraphQLOutputSymbol | undefined] {
  const resolveResult = resolve<GraphQLOutputScope, GraphQLOutputSymbol>(
    refkey as Refkey,
  );

  return memo(() => {
    if (resolveResult.value === undefined) {
      return [unresolvedRefkey(refkey), undefined];
    }

    const { symbol } = resolveResult.value;

    // For GraphQL, we just return the name of the symbol
    // (GraphQL doesn't natively supports imports or complex module systems like other languages)
    return [symbol.name, symbol];
  });
}
