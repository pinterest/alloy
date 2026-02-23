import {
  OutputSpace,
  OutputSymbol,
  OutputSymbolOptions,
  createSymbol,
  track,
  TrackOpTypes,
  trigger,
  TriggerOpTypes,
} from "@alloy-js/core";

export type ThriftSymbolKind = "type" | "service" | "const";

export interface ThriftSymbolOptions extends OutputSymbolOptions {
  kind?: ThriftSymbolKind;
}

export class ThriftOutputSymbol extends OutputSymbol {
  #kind: ThriftSymbolKind | undefined;

  constructor(
    name: string,
    spaces: OutputSpace[] | OutputSpace | undefined,
    options: ThriftSymbolOptions = {},
  ) {
    super(name, spaces, options);
    this.#kind = options.kind;
  }

  get kind() {
    track(this, TrackOpTypes.GET, "kind");
    return this.#kind;
  }

  set kind(value: ThriftSymbolKind | undefined) {
    const old = this.#kind;
    if (old === value) return;
    this.#kind = value;
    trigger(this, TriggerOpTypes.SET, "kind", value, old);
  }

  copy(): OutputSymbol {
    const options = this.getCopyOptions();
    const binder = this.binder;
    const copy = createSymbol(ThriftOutputSymbol, this.name, undefined, {
      ...options,
      binder,
      kind: this.#kind,
    });
    this.initializeCopy(copy);
    return copy;
  }

  override get debugInfo(): Record<string, unknown> {
    return {
      ...super.debugInfo,
      kind: this.#kind,
    };
  }
}
