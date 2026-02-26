import {
  ContentOutputFile,
  Output,
  OutputDirectory,
  OutputFile,
  createNamePolicy,
  render,
} from "@alloy-js/core";
import { JSX } from "@alloy-js/core/jsx-runtime";
export interface SnapshotFile {
  path: string;
  file: JSX.Element;
}

export const permissiveNamePolicy = createNamePolicy((name) => name);

export function renderThriftFiles(files: SnapshotFile[]) {
  const entries = [...files].sort((a, b) => a.path.localeCompare(b.path));

  const result = render(
    <Output namePolicy={permissiveNamePolicy}>
      {entries.map((entry) => entry.file)}
    </Output>,
    { insertFinalNewLine: true, tabWidth: 2 },
  );

  const output: Record<string, string> = {};
  for (const entry of entries) {
    output[entry.path] = findFile(result, entry.path).contents;
  }
  return output;
}

export function lines(text: string): string[] {
  let source = text;
  if (source.startsWith("\n")) {
    source = source.slice(1);
  }
  if (source.endsWith("\n")) {
    source = source.slice(0, -1);
  }
  const rawLines = source.split(/\r?\n/);
  const indents = rawLines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^\s*/)?.[0].length ?? 0);
  const minIndent = indents.length > 0 ? Math.min(...indents) : 0;
  const result = rawLines.map((line) => line.slice(minIndent));
  while (result.length > 0 && result[result.length - 1] === "") {
    result.pop();
  }
  return result;
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
