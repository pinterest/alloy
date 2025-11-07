import {
  Namekey,
  OutputSpace,
  OutputSymbol,
  OutputSymbolOptions,
} from "@alloy-js/core";

export interface GraphQLOutputSymbolOptions extends OutputSymbolOptions {}

/**
 * Represents a GraphQL output symbol (type, field, enum, etc.)
 */
export class GraphQLOutputSymbol extends OutputSymbol {
  static readonly memberSpaces = ["members"] as const;

  constructor(
    name: string | Namekey,
    spaces: OutputSpace[] | OutputSpace | undefined,
    options: GraphQLOutputSymbolOptions,
  ) {
    super(name, spaces, options);
  }

  get members() {
    return this.memberSpaceFor("members")!;
  }

  copy() {
    const copy = new GraphQLOutputSymbol(this.name, undefined, {
      binder: this.binder,
      aliasTarget: this.aliasTarget,
      metadata: this.metadata,
    });

    this.initializeCopy(copy);

    return copy;
  }
}
