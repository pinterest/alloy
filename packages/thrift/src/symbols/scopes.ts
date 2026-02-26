import { OutputScope, OutputScopeOptions, useScope } from "@alloy-js/core";

/**
 * A Thrift output scope containing a single `"symbols"` declaration space.
 *
 * @remarks
 * All Thrift top-level declarations (types, constants, services) are registered
 * in the `symbols` space.
 */
export class ThriftOutputScope extends OutputScope {
  public static readonly declarationSpaces: readonly string[] = ["symbols"];

  get symbols() {
    return this.spaceFor("symbols")!;
  }

  /** Thrift scopes have no owner symbol — required by the OutputScope contract. */
  get ownerSymbol(): undefined {
    return undefined;
  }
}

/**
 * A file-level Thrift scope that tracks the source file path.
 *
 * @remarks
 * Created by {@link SourceFile} to represent a single `.thrift` output file.
 * The `filePath` property is used by the reference resolver to determine whether
 * a cross-file include is needed.
 */
export class ThriftFileScope extends ThriftOutputScope {
  readonly filePath: string;

  constructor(
    name: string,
    filePath: string,
    parent?: ThriftOutputScope,
    options?: OutputScopeOptions,
  ) {
    super(name, parent, options);
    this.filePath = filePath;
  }

  override get debugInfo(): Record<string, unknown> {
    return {
      ...super.debugInfo,
      filePath: this.filePath,
    };
  }
}

/**
 * Walk up the scope chain to find the nearest {@link ThriftFileScope}.
 *
 * @returns The enclosing `ThriftFileScope`, or `undefined` if there is none.
 */
export function useThriftFileScope(): ThriftFileScope | undefined {
  let scope: OutputScope | undefined = useScope();
  while (scope) {
    if (scope instanceof ThriftFileScope) {
      return scope;
    }
    scope = scope.parent;
  }

  return undefined;
}
