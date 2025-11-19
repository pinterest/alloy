import {
  Children,
  ContentOutputFile,
  NamePolicy,
  Output,
  OutputDirectory,
  OutputFile,
  PrintTreeOptions,
  render,
} from "@alloy-js/core";
import { dedent } from "@alloy-js/core/testing";
import { expect } from "vitest";
import {
  clearPendingValidations,
  getValidationErrors,
  runPendingValidations,
} from "../src/components/DeferredInterfaceValidation.js";
import * as gql from "../src/components/index.js";
import { createGraphQLNamePolicy } from "../src/name-policy.js";

export function findFile(
  res: OutputDirectory,
  path: string,
): ContentOutputFile {
  const result = findFileWorker(res, path);

  if (!result) {
    throw new Error("Expected to find file " + path);
  }
  return result as ContentOutputFile;

  function findFileWorker(
    res: OutputDirectory,
    path: string,
  ): OutputFile | null {
    for (const item of res.contents) {
      if (item.kind === "file") {
        if (item.path === path) {
          return item;
        }
        continue;
      } else {
        const found = findFileWorker(item, path);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
}

export function assertFileContents(
  res: OutputDirectory,
  expectedFiles: Record<string, string>,
) {
  for (const [path, contents] of Object.entries(expectedFiles)) {
    const file = findFile(res, path);
    expect(file.contents).toBe(dedent(contents));
  }
}

export function toGraphQLTextMultiple(
  sourceFiles: Children[],
  {
    policy,
    printOptions,
  }: {
    policy?: NamePolicy<string>;
    printOptions?: PrintTreeOptions;
  } = {},
): OutputDirectory {
  if (!policy) {
    policy = createGraphQLNamePolicy();
  }
  if (printOptions === undefined) {
    printOptions = {
      printWidth: 80,
      tabWidth: 2,
      insertFinalNewLine: false,
    };
  } else {
    printOptions.insertFinalNewLine = false;
    printOptions.tabWidth = 2;
  }
  const content = <Output namePolicy={policy}>{sourceFiles}</Output>;
  return render(content, printOptions);
}

export function toGraphQLText(
  c: Children,
  {
    policy,
    printOptions,
  }: {
    policy?: NamePolicy<string>;
    printOptions?: PrintTreeOptions;
  } = {},
): string {
  clearPendingValidations(); // Clear any previous errors and pending validations
  const content = <gql.SourceFile path="schema.graphql">{c}</gql.SourceFile>;
  const res = toGraphQLTextMultiple([content], {
    policy,
    printOptions,
  });

  // Run interface implementation validations after rendering is complete
  runPendingValidations();

  const file = findFile(res, "schema.graphql");
  return file.contents;
}

/**
 * Get validation errors from the last render.
 * This is useful for testing validation logic.
 */
export function getLastValidationErrors(): Error[] {
  return getValidationErrors();
}
