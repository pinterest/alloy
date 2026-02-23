import {
  OutputScope,
  OutputScopeOptions,
  useScope,
} from "@alloy-js/core";

export class ThriftOutputScope extends OutputScope {
  public static readonly declarationSpaces: readonly string[] = ["symbols"];

  get symbols() {
    return this.spaceFor("symbols")!;
  }

  get ownerSymbol(): undefined {
    return undefined;
  }
}

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
