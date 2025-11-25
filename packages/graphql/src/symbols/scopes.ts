import { useScope } from "@alloy-js/core";
import { GraphQLLexicalScope } from "./graphql-lexical-scope.js";
import { GraphQLMemberScope } from "./graphql-member-scope.js";
import { GraphQLModuleScope } from "./graphql-module-scope.js";

export type GraphQLOutputScope =
  | GraphQLLexicalScope
  | GraphQLModuleScope
  | GraphQLMemberScope;

export function useGraphQLScope() {
  return useScope() as GraphQLOutputScope;
}
