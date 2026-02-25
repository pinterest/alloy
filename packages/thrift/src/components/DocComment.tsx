import { Children, For, childrenArray } from "@alloy-js/core";

function splitLines(value: string): string[] {
  const lines = value.split(/\r?\n/);
  if (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }
  return lines;
}

function normalizeCommentChildren(children: Children): Children {
  if (typeof children === "string") {
    return splitLines(children);
  }
  if (Array.isArray(children)) {
    return children.flatMap<Children[]>((child) =>
      typeof child === "string" ? splitLines(child) : [child],
    );
  }
  return children;
}

function renderCommentLines(content: Children) {
  const lines = childrenArray(() => content, { preserveFragments: true });
  return (
    <For each={lines} joiner="">
      {(line, index) => (
        <>
          {index > 0 ? <hbr /> : null}
          {line}
        </>
      )}
    </For>
  );
}

export interface DocCommentProps {
  children: Children;
}

/**
 * Render a Thrift-style doc comment block (`/** ... *\/`).
 *
 * @remarks
 * Prefer the `doc` prop on other components; this is the low-level building block.
 *
 * @example Doc comment
 * ```tsx
 * <DocComment>Returns a user by id.</DocComment>
 * ```
 */
export function DocComment(props: DocCommentProps) {
  const content = normalizeCommentChildren(props.children);
  return (
    <>
      {"/**"}
      <hbr />
      {" * "}
      <align string=" * ">
        {renderCommentLines(content)}
      </align>
      <hbr />
      {" */"}
    </>
  );
}

export interface DocWhenProps {
  doc: Children | undefined;
}

/**
 * Conditionally render a doc comment when `doc` is provided.
 *
 * @remarks
 * Used internally by most Thrift components to keep `doc` optional.
 *
 * @example Conditional doc
 * ```tsx
 * <DocWhen doc="Optional documentation." />
 * ```
 */
export function DocWhen(props: DocWhenProps) {
  return (
    <>
      {props.doc ?
        <>
          <DocComment>{props.doc}</DocComment>
          <hbr />
        </>
      : null}
    </>
  );
}

export interface BlockCommentProps {
  children: Children;
}

/**
 * Render a Thrift-style block comment (`/* ... *\/`).
 *
 * @example Block comment
 * ```tsx
 * <BlockComment>License header</BlockComment>
 * ```
 */
export function BlockComment(props: BlockCommentProps) {
  const content = normalizeCommentChildren(props.children);
  return (
    <>
      {"/*"}
      <hbr />
      {" * "}
      <align string=" * ">
        {renderCommentLines(content)}
      </align>
      <hbr />
      {" */"}
    </>
  );
}

export interface LineCommentProps {
  children: Children;
  prefix?: string;
}

/**
 * Render a Thrift line comment (`//` or `#`).
 *
 * @example Line comment
 * ```tsx
 * <LineComment>TODO: add docs</LineComment>
 * ```
 */
export function LineComment(props: LineCommentProps) {
  const prefix = props.prefix ?? "//";
  const lines = childrenArray(() => normalizeCommentChildren(props.children), {
    preserveFragments: true,
  });
  return (
    <For each={lines} hardline>
      {(line) => (
        <>
          {prefix}
          {line === "" ? "" : " "}
          {line}
        </>
      )}
    </For>
  );
}
