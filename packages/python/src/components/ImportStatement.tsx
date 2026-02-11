import { computed, mapJoin, memo } from "@alloy-js/core";
import {
  ImportedSymbol,
  ImportRecords,
  PythonModuleScope,
} from "../symbols/index.js";

/**
 * Check if a module is from the typing standard library.
 */
function isTypingModule(module: PythonModuleScope): boolean {
  return module.name === "typing";
}

export interface ImportStatementsProps {
  records: ImportRecords;
  joinImportsFromSameModule?: boolean;
  /**
   * Filter imports by type-only status.
   * - `true`: only include type-only imports
   * - `false`: only include non-type-only imports
   * - `undefined`: include all imports (default)
   */
  typeAnnotationOnly?: boolean;
  /**
   * Filter for the typing standard library module.
   * - `true`: only include typing module imports
   * - `false`: exclude typing module imports
   * - `undefined`: include all (default)
   */
  typingStdlib?: boolean;
}

interface FilterOptions {
  typeAnnotationOnly?: boolean;
  /**
   * Filter for the typing standard library module.
   * - `true`: only include typing module
   * - `false`: exclude typing module
   * - `undefined`: include all
   */
  typingStdlib?: boolean;
}

/**
 * Filter import records based on typeAnnotationOnly flag and typing stdlib filter.
 * Returns a new ImportRecords with only the matching symbols.
 */
function filterImportRecords(
  records: ImportRecords,
  options: FilterOptions = {},
): ImportRecords {
  const { typeAnnotationOnly, typingStdlib } = options;

  if (typeAnnotationOnly === undefined && typingStdlib === undefined) {
    return records;
  }

  const filtered = new Map() as ImportRecords;

  for (const [module, properties] of records) {
    const isTyping = isTypingModule(module);

    // Filter by typing stdlib if specified
    if (typingStdlib !== undefined) {
      if (typingStdlib && !isTyping) continue; // only typing, skip non-typing
      if (!typingStdlib && isTyping) continue; // exclude typing, skip typing
    }

    if (typeAnnotationOnly === undefined) {
      // No type filtering, just module filtering
      filtered.set(module, properties);
      continue;
    }

    if (!properties.symbols || properties.symbols.size === 0) {
      // Module-level imports without symbols - include only if not filtering for type-only
      if (!typeAnnotationOnly) {
        filtered.set(module, properties);
      }
      continue;
    }

    const matchingSymbols = new Set<ImportedSymbol>();
    for (const sym of properties.symbols) {
      const isTypeOnly = sym.local.isTypeOnly;
      if (typeAnnotationOnly === isTypeOnly) {
        matchingSymbols.add(sym);
      }
    }

    if (matchingSymbols.size > 0) {
      filtered.set(module, { symbols: matchingSymbols });
    }
  }

  return filtered;
}

/**
 * Check if there are any imports matching the filter options.
 */
export function hasImports(
  records: ImportRecords,
  typeAnnotationOnly?: boolean,
  typingStdlib?: boolean,
): boolean {
  const filtered = filterImportRecords(records, { typeAnnotationOnly, typingStdlib });
  return filtered.size > 0;
}

/**
 * A component that renders import statements based on the provided import records.
 *
 * @remarks
 * This component will render import statements for each module and its symbols.
 * If `joinImportsFromSameModule` is true, it will group imports from the same module
 * into a single statement.
 *
 * Use `typeAnnotationOnly` to filter:
 * - `typeAnnotationOnly={true}`: only render type-only imports (for TYPE_CHECKING block)
 * - `typeAnnotationOnly={false}`: only render regular imports
 * - `typeAnnotationOnly={undefined}`: render all imports
 */
export function ImportStatements(props: ImportStatementsProps) {
  // Filter and sort the import records by module name
  const imports = computed(() => {
    const filtered = filterImportRecords(props.records, {
      typeAnnotationOnly: props.typeAnnotationOnly,
      typingStdlib: props.typingStdlib,
    });
    return [...filtered].sort(([a], [b]) => {
      return a.name.localeCompare(b.name);
    });
  });

  return mapJoin(
    () => imports.value,
    ([module, properties]) => {
      // Only handling absolute imports for now
      const targetPath = module.name;

      if (properties.symbols && properties.symbols.size > 0) {
        // Sort the symbols in a module by the imported name
        const sortedSymbols = Array.from(properties.symbols).sort((a, b) =>
          a.local.name.localeCompare(b.local.name),
        );
        if (props.joinImportsFromSameModule) {
          // If joinImportsFromSameModule is true, we will group imports from the same module
          return (
            <ImportStatement
              path={targetPath}
              symbols={new Set(sortedSymbols)}
            />
          );
        } else {
          return sortedSymbols.map((symbol, idx, arr) => (
            <>
              <ImportStatement path={targetPath} symbols={new Set([symbol])} />
              {idx < arr.length - 1 && <hbr />}
            </>
          ));
        }
      } else {
        // If no symbols are specified, it's either a wildcard import or a module import
        return (
          <ImportStatement path={targetPath} symbols={properties.symbols} />
        );
      }
    },
  );
}

export interface ImportStatementProps {
  path: string;
  symbols?: Set<ImportedSymbol>;
}

/**
 * A Python import statement.
 *
 * @remarks
 * This component renders an import statement for a given path and symbols.
 * If no symbols are provided, it will render a simple import statement.
 * If symbols are provided, it will render an import statement with the specified symbols.
 *
 * @example
 * ```tsx
 * <ImportStatement path="os" />
 * <ImportStatement path="math" symbols={new Set([new ImportedSymbol("sqrt", "sqrt")])} />
 * ```
 * This will generate:
 * ```python
 * import os
 * from math import sqrt
 * ```
 */
export function ImportStatement(props: ImportStatementProps) {
  return memo(() => {
    const { path, symbols } = props;
    const importSymbols: ImportedSymbol[] = [];

    if (symbols && symbols.size > 0) {
      for (const sym of symbols) {
        importSymbols.push(sym);
      }
    }

    const parts: any[] = [];

    if (!symbols || symbols.size === 0) {
      parts.push(`import ${path}`);
    } else {
      importSymbols.sort((a, b) => {
        return a.target.name.localeCompare(b.target.name);
      });
      parts.push(`from ${path} import `);
      parts.push(
        mapJoin(
          () => importSymbols,
          (nis) => <ImportBinding importedSymbol={nis} />,
          { joiner: ", " },
        ),
      );
    }
    return parts;
  });
}

interface ImportBindingProps {
  importedSymbol: ImportedSymbol;
}

function ImportBinding(props: Readonly<ImportBindingProps>) {
  const text = memo(() => {
    const localName = props.importedSymbol.local.name;
    const targetName = props.importedSymbol.target.name;
    if (localName === targetName) {
      return targetName;
    } else {
      return `${targetName} as ${localName}`;
    }
  });

  return <>{text()}</>;
}
