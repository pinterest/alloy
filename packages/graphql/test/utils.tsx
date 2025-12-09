import {
  Children,
  ContentOutputFile,
  NamePolicy,
  Output,
  OutputDirectory,
  OutputFile,
  PrintTreeOptions,
} from "@alloy-js/core";
import { dedent } from "@alloy-js/core/testing";
import { expect } from "vitest";
import * as gql from "../src/components/index.js";
import { createGraphQLNamePolicy } from "../src/name-policy.js";
import { renderGraphQLWithErrors } from "../src/render.js";

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
  const { output } = renderGraphQLWithErrors(content, printOptions);
  return output;
}

export function toGraphQLTextWithErrors(
  c: Children,
  {
    policy,
    printOptions,
  }: {
    policy?: NamePolicy<string>;
    printOptions?: PrintTreeOptions;
  } = {},
): { text: string; errors: Error[] } {
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

  const content = (
    <Output namePolicy={policy}>
      <gql.SourceFile path="schema.graphql">{c}</gql.SourceFile>
    </Output>
  );

  const { output, errors } = renderGraphQLWithErrors(content, printOptions);
  const file = findFile(output, "schema.graphql");
  return { text: file.contents, errors };
}

export function toGraphQLText(
  c: Children,
  options: {
    policy?: NamePolicy<string>;
    printOptions?: PrintTreeOptions;
  } = {},
): string {
  return toGraphQLTextWithErrors(c, options).text;
}
