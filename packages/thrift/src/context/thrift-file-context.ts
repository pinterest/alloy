import {
  ComponentContext,
  NamePolicy,
  createNamedContext,
  shallowReactive,
  useContext,
} from "@alloy-js/core";
import { basename } from "pathe";
import type { ThriftNameKind } from "../name-policy.js";
import type { ThriftFileScope } from "../symbols/scopes.js";

/**
 * Indicates how an include was registered.
 *
 * @remarks
 * - `"manual"` — explicitly declared via the {@link Include} component.
 * - `"auto"` — added automatically when a cross-file refkey reference is resolved.
 */
export type IncludeSource = "manual" | "auto";

/**
 * A record representing a single `include` directive in a Thrift source file.
 */
export interface ThriftIncludeRecord {
  /** The path to the included `.thrift` file. */
  path: string;
  /** The alias used to qualify references from this include (e.g. `shared`). */
  alias: string;
  /** Whether this include was added manually or automatically. */
  source: IncludeSource;
}

/**
 * Options passed when registering an include.
 */
export interface RegisterIncludeOptions {
  /** Override the default alias derived from the filename. */
  alias?: string;
  /** Whether this include is manual or automatically resolved. */
  source: IncludeSource;
}

/**
 * Context provided by {@link SourceFile} to all descendant components.
 *
 * @remarks
 * Exposes the current file's scope, include registry, and name policy so that
 * child components can register includes and resolve symbols.
 */
export interface ThriftFileContext {
  /** The path of the current `.thrift` source file. */
  filePath: string;
  /** The file-level scope for symbol resolution. */
  scope: ThriftFileScope;
  /** The current set of registered includes, keyed by path. */
  includes: Map<string, ThriftIncludeRecord>;
  /** The active name policy for this file. */
  namePolicy: NamePolicy<ThriftNameKind>;
  /**
   * Register an include for this file.
   *
   * @remarks
   * If an include for the given path already exists, manual registrations
   * upgrade the source and alias; automatic registrations are ignored.
   *
   * @param path - The path of the `.thrift` file to include.
   * @param options - Registration options.
   * @returns The include record.
   */
  registerInclude(
    path: string,
    options: RegisterIncludeOptions,
  ): ThriftIncludeRecord;
}

export const ThriftFileContext: ComponentContext<ThriftFileContext> =
  createNamedContext("@alloy-js/thrift SourceFile");

/**
 * Retrieve the current Thrift file context.
 *
 * @remarks
 * Must be called within a {@link SourceFile} component tree.
 *
 * @returns The Thrift file context for the enclosing source file.
 */
export function useThriftFile() {
  return useContext(ThriftFileContext)!;
}

/**
 * Create a reactive include registry for a Thrift source file.
 *
 * @remarks
 * The registry tracks both manual and automatic includes. Manual includes
 * take precedence: if an auto-include already exists for a path, a subsequent
 * manual registration for the same path upgrades the record's alias and source.
 * Duplicate auto-includes for the same path are deduplicated.
 *
 * @returns An object containing the reactive `includes` map and a
 *   `registerInclude` function.
 */
export function createIncludeRegistry() {
  const includes = shallowReactive(new Map<string, ThriftIncludeRecord>());

  function registerInclude(
    path: string,
    options: RegisterIncludeOptions,
  ): ThriftIncludeRecord {
    const alias = options.alias ?? deriveIncludeAlias(path);
    const existing = includes.get(path);
    if (existing) {
      if (options.source === "manual") {
        existing.alias = alias;
        existing.source = options.source;
      }
      return existing;
    }

    const record: ThriftIncludeRecord = {
      path,
      alias,
      source: options.source,
    };
    includes.set(path, record);
    return record;
  }

  return { includes, registerInclude };
}

/**
 * Derive an include alias from a file path.
 *
 * @remarks
 * Strips the directory and `.thrift` extension from the path. For example,
 * `"shared/types.thrift"` becomes `"types"`.
 *
 * @param path - The include file path.
 * @returns The derived alias string.
 */
export function deriveIncludeAlias(path: string): string {
  const base = basename(path, ".thrift");
  return base.length > 0 ? base : path;
}
