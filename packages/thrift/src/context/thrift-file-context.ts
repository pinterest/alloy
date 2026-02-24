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

export type IncludeSource = "manual" | "auto";

export interface ThriftIncludeRecord {
  path: string;
  alias: string;
  source: IncludeSource;
}

export interface RegisterIncludeOptions {
  alias?: string;
  source: IncludeSource;
}

export interface ThriftFileContext {
  filePath: string;
  scope: ThriftFileScope;
  includes: Map<string, ThriftIncludeRecord>;
  namePolicy: NamePolicy<ThriftNameKind>;
  registerInclude(
    path: string,
    options: RegisterIncludeOptions,
  ): ThriftIncludeRecord;
}

export const ThriftFileContext: ComponentContext<ThriftFileContext> =
  createNamedContext("@alloy-js/thrift SourceFile");

export function useThriftFile() {
  return useContext(ThriftFileContext)!;
}

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

export function deriveIncludeAlias(path: string): string {
  const base = basename(path, ".thrift");
  return base.length > 0 ? base : path;
}
