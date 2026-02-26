import {
  createSymbol,
  OutputSpace,
  OutputSymbol,
  OutputSymbolOptions,
  track,
  TrackOpTypes,
  trigger,
  TriggerOpTypes,
} from "@alloy-js/core";

/**
 * The category of a Thrift top-level declaration.
 *
 * @remarks
 * Used to classify symbols so the reference resolver can emit the correct
 * qualified name.
 */
export type ThriftSymbolKind = "type" | "service" | "const";

/**
 * Options for constructing a {@link ThriftOutputSymbol}.
 */
export interface ThriftSymbolOptions extends OutputSymbolOptions {
  /** The declaration kind for this symbol. */
  kind?: ThriftSymbolKind;
}

/**
 * An output symbol representing a Thrift top-level declaration.
 *
 * @remarks
 * Extends the core `OutputSymbol` with a reactive {@link ThriftSymbolKind}
 * property so that the reference resolver can distinguish types, services,
 * and constants.
 */
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
