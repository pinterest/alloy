import {
  ContentOutputFile,
  Output,
  OutputDirectory,
  OutputFile,
  createNamePolicy,
  render,
} from "@alloy-js/core";
import { JSX } from "@alloy-js/core/jsx-runtime";
import { readFileSync } from "node:fs";

export interface SnapshotFile {
  path: string;
  file: JSX.Element;
}

export const permissiveNamePolicy = createNamePolicy((name) => name);

export function loadFixture(path: string): string {
  return readFileSync(new URL(`./fixtures/${path}`, import.meta.url), "utf8");
}

export function renderThriftFiles(files: SnapshotFile[]) {
  const entries = [...files].sort((a, b) => a.path.localeCompare(b.path));

  const result = render(
    <Output namePolicy={permissiveNamePolicy}>
      {entries.map((entry) => entry.file)}
    </Output>,
    { insertFinalNewLine: false },
  );

  const output: Record<string, string> = {};
  for (const entry of entries) {
    output[entry.path] = findFile(result, entry.path).contents;
  }
  return output;
}

function findFile(res: OutputDirectory, path: string): ContentOutputFile {
  const result = findFileWorker(res, path);

  if (!result || result.kind !== "file" || !("contents" in result)) {
    throw new Error("Expected to find file " + path);
  }
  return result;

  function findFileWorker(
    res: OutputDirectory,
    path: string,
  ): OutputFile | undefined {
    for (const item of res.contents) {
      if (item.kind === "file" && item.path === path) {
        return item;
      } else if (item.kind === "directory") {
        const found = findFileWorker(item, path);
        if (found) {
          return found;
        }
      }
    }
  }
}
