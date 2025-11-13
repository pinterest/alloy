import { OutputScope } from "@alloy-js/core";

export class GraphQLLexicalScope extends OutputScope {
  public static readonly declarationSpaces: readonly string[] = ["symbols"];

  get symbols() {
    return this.spaceFor("symbols")!;
  }

  get ownerSymbol(): undefined {
    return undefined;
  }
}
