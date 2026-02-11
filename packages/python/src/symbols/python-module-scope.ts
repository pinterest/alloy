import { createSymbol, reactive, shallowReactive } from "@alloy-js/core";
import { PythonLexicalScope } from "./python-lexical-scope.js";
import {
  PythonOutputSymbol,
  PythonSymbolFlags,
} from "./python-output-symbol.js";

// Lazy-initialized typing module scope for TYPE_CHECKING imports
let typingModuleScope: PythonModuleScope | undefined;
let typeCheckingSymbol: PythonOutputSymbol | undefined;

function getTypingModuleScope(): PythonModuleScope {
  if (!typingModuleScope) {
    typingModuleScope = new PythonModuleScope("typing", undefined);
  }
  return typingModuleScope;
}

function getTypeCheckingSymbol(): PythonOutputSymbol {
  if (!typeCheckingSymbol) {
    const scope = getTypingModuleScope();
    typeCheckingSymbol = new PythonOutputSymbol(
      "TYPE_CHECKING",
      scope.symbols,
      {},
    );
  }
  return typeCheckingSymbol;
}

export class ImportedSymbol {
  local: PythonOutputSymbol;
  target: PythonOutputSymbol;

  constructor(target: PythonOutputSymbol, local: PythonOutputSymbol) {
    this.target = target;
    this.local = local;
  }

  static from(target: PythonOutputSymbol, local: PythonOutputSymbol) {
    return new ImportedSymbol(target, local);
  }
}

export interface ImportRecordProps {
  symbols: Set<ImportedSymbol>;
}

export class ImportRecords extends Map<PythonModuleScope, ImportRecordProps> {}

export interface AddImportOptions {
  /**
   * If true, this import is only used in type annotation contexts.
   * Such imports will be guarded with `if TYPE_CHECKING:`.
   */
  type?: boolean;
}

export class PythonModuleScope extends PythonLexicalScope {
  #importedSymbols: Map<PythonOutputSymbol, PythonOutputSymbol> =
    shallowReactive(new Map());
  get importedSymbols() {
    return this.#importedSymbols;
  }

  #importedModules: ImportRecords = reactive(new Map());
  get importedModules() {
    return this.#importedModules;
  }

  addImport(
    targetSymbol: PythonOutputSymbol,
    targetModule: PythonModuleScope,
    options?: AddImportOptions,
  ) {
    const existing = this.importedSymbols.get(targetSymbol);
    if (existing) {
      // If existing is type-only but now used as value, upgrade it
      if (!options?.type && existing.isTypeOnly) {
        existing.markAsValue();
      }
      return existing;
    }

    if (!this.importedModules.has(targetModule)) {
      this.importedModules.set(targetModule, {
        symbols: new Set<ImportedSymbol>(),
      });
    }

    const flags =
      options?.type ?
        PythonSymbolFlags.LocalImportSymbol | PythonSymbolFlags.TypeOnly
      : PythonSymbolFlags.LocalImportSymbol;

    const localSymbol = createSymbol(
      PythonOutputSymbol,
      targetSymbol.name,
      this.symbols,
      { binder: this.binder, aliasTarget: targetSymbol, flags },
    );

    this.importedSymbols.set(targetSymbol, localSymbol);
    this.importedModules.get(targetModule)!.symbols?.add({
      local: localSymbol,
      target: targetSymbol,
    });

    return localSymbol;
  }

  /**
   * Add the type only import from the typing module.
   * This is used when there are type-only imports that need to be guarded.
   */
  addTypeImport() {
    return this.addImport(getTypeCheckingSymbol(), getTypingModuleScope(), {
      type: false,
    });
  }

  override get debugInfo(): Record<string, unknown> {
    return {
      ...super.debugInfo,
      importedSymbolCount: this.#importedSymbols.size,
      importedModuleCount: this.#importedModules.size,
    };
  }
}
