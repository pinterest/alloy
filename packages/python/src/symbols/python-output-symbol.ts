import {
  Namekey,
  OutputSpace,
  OutputSymbol,
  OutputSymbolOptions,
  track,
  TrackOpTypes,
  trigger,
  TriggerOpTypes,
} from "@alloy-js/core";

// prettier-ignore
export enum PythonSymbolFlags {
  None               = 0,
  LocalImportSymbol  = 1 << 0,
  TypeOnly           = 1 << 1,  // Only used in type annotation contexts
}

export interface PythonOutputSymbolOptions extends OutputSymbolOptions {
  module?: string;
  flags?: PythonSymbolFlags;
}

export interface CreatePythonSymbolFunctionOptions
  extends PythonOutputSymbolOptions {
  name: string;
}

/**
 * Represents an 'exported' symbol from a .py file. Class, enum, interface etc.
 */
export class PythonOutputSymbol extends OutputSymbol {
  static readonly memberSpaces = ["static", "instance"] as const;

  constructor(
    name: string | Namekey,
    spaces: OutputSpace[] | OutputSpace | undefined,
    options: PythonOutputSymbolOptions,
  ) {
    super(name, spaces, options);
    this.#module = options.module ?? undefined;
    this.#flags = options.flags ?? PythonSymbolFlags.None;
  }

  // The module in which the symbol is defined
  #module?: string;

  get module() {
    return this.#module;
  }

  #flags: PythonSymbolFlags;

  get flags() {
    track(this, TrackOpTypes.GET, "flags");
    return this.#flags;
  }

  set flags(value: PythonSymbolFlags) {
    const oldValue = this.#flags;
    if (oldValue === value) {
      return;
    }
    this.#flags = value;
    trigger(this, TriggerOpTypes.SET, "flags", value, oldValue);
  }

  /**
   * Returns true if this symbol is only used in type annotation contexts.
   * Such symbols can be imported inside a TYPE_CHECKING block.
   */
  get isTypeOnly() {
    return !!(this.flags & PythonSymbolFlags.TypeOnly);
  }

  /**
   * Returns true if this symbol is a local import symbol.
   */
  get isLocalImportSymbol() {
    return !!(this.flags & PythonSymbolFlags.LocalImportSymbol);
  }

  /**
   * Mark this symbol as also being used as a value (not just a type).
   * This removes the TypeOnly flag if present.
   */
  markAsValue() {
    this.flags &= ~PythonSymbolFlags.TypeOnly;
  }

  get staticMembers() {
    return this.memberSpaceFor("static")!;
  }

  get instanceMembers() {
    return this.memberSpaceFor("instance")!;
  }

  get isStaticMemberSymbol() {
    return !this.isInstanceMemberSymbol;
  }

  get isInstanceMemberSymbol() {
    return this.spaces.some((s) => s.key === "instance");
  }

  copy() {
    const copy = new PythonOutputSymbol(this.name, undefined, {
      binder: this.binder,
      aliasTarget: this.aliasTarget,
      module: this.module,
      metadata: this.metadata,
      flags: this.flags,
    });

    this.initializeCopy(copy);

    return copy;
  }
}
