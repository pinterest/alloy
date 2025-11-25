import { OutputScope } from "@alloy-js/core";
import { GraphQLOutputSymbol } from "./graphql-output-symbol.js";

export class GraphQLMemberScope extends OutputScope {
  get ownerSymbol() {
    return super.ownerSymbol as GraphQLOutputSymbol;
  }
}
