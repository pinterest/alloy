import {
  Children,
  For,
  childrenArray,
  isComponentCreator,
} from "@alloy-js/core";

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
      typeof child === "string" ?
        child === "" ?
          [""] // make sure we preserve empty lines
        : splitLines(child)
      : [child],
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
          {index > 0 ?
            <hbr />
          : null}
          {line}
        </>
      )}
    </For>
  );
}

export interface DocCommentProps {
  /** The content to render inside the doc comment block. */
  children: Children;
}

/**
 * Render a Thrift-style doc comment block.
 *
 * @remarks
 * Most components accept a `doc` prop that wraps content in a `DocComment`
 * automatically. Use this component directly when you need full control over
 * comment placement or formatting.
 *
 * Single-line content is rendered inline. Multi-line content
 * uses the standard block format with ` * ` prefixed lines.
 *
 * @example Single-line
 * ```tsx
 * <DocComment>Returns a user by id.</DocComment>
 * ```
 *
 * @example Multi-line
 * ```tsx
 * <DocComment>{"Get a user by id.\nReturns null if not found."}</DocComment>
 * ```
 */
export function DocComment(props: DocCommentProps) {
  const content = normalizeCommentChildren(props.children);

  if (
    Array.isArray(content) &&
    content.length === 1 &&
    typeof content[0] === "string"
  ) {
    return <>{`/** ${content[0]} */`}</>;
  }

  return (
    <>
      {"/**"}
      <hbr />
      {" * "}
      <align string=" * ">{renderCommentLines(content)}</align>
      <hbr />
      {" */"}
    </>
  );
}

export interface DocWhenProps {
  /**
   * The doc content to render, or `undefined` to render nothing.
   *
   * @remarks
   * If the value is already a `DocComment` component creator, it is rendered
   * as-is. Otherwise the content is wrapped in a {@link DocComment}.
   */
  doc: Children | undefined;
}

/**
 * Conditionally render a doc comment when `doc` is provided.
 *
 * @remarks
 * Used internally by most Thrift components to make the `doc` prop optional.
 * When `doc` is `undefined`, nothing is rendered. When `doc` is a string or
 * other children, it is wrapped in a {@link DocComment} and followed by a
 * line break.
 *
 * @example Conditional doc
 * ```tsx
 * <DocWhen doc="Optional documentation." />
 * ```
 */
export function DocWhen(props: DocWhenProps) {
  if (!props.doc) return null;

  const content =
    isComponentCreator(props.doc) ?
      props.doc
    : <DocComment>{props.doc}</DocComment>;

  return (
    <>
      {content}
      <hbr />
    </>
  );
}

export interface BlockCommentProps {
  /** The content to render inside the block comment. */
  children: Children;
}

/**
 * Render a Thrift-style block comment.
 *
 * @remarks
 * Unlike {@link DocComment}, block comments use `/*` instead of `/**` and are
 * not treated as documentation by Thrift tooling. Useful for license headers
 * or internal notes.
 *
 * @example Block comment
 * ```tsx
 * <BlockComment>{"Copyright 2025\nAll rights reserved."}</BlockComment>
 * ```
 */
export function BlockComment(props: BlockCommentProps) {
  const content = normalizeCommentChildren(props.children);
  return (
    <>
      {"/*"}
      <hbr />
      {" * "}
      <align string=" * ">{renderCommentLines(content)}</align>
      <hbr />
      {" */"}
    </>
  );
}

export interface LineCommentProps {
  /** The content to render as one or more line comments. */
  children: Children;
  /**
   * The comment prefix character(s).
   *
   * @remarks
   * Defaults to `"//"`. Thrift also supports `"#"` as a line comment prefix.
   */
  prefix?: string;
}

/**
 * Render one or more Thrift line comments.
 *
 * @remarks
 * Multi-line content is split and each line is prefixed independently.
 * Use the `prefix` prop to switch between `//` (default) and `#` style.
 *
 * @example Double-slash comment
 * ```tsx
 * <LineComment>TODO: add docs</LineComment>
 * ```
 *
 * Produces:
 * ```thrift
 * // TODO: add docs
 * ```
 *
 * @example Hash-style comment
 * ```tsx
 * <LineComment prefix="#">Deprecated</LineComment>
 * ```
 *
 * Produces:
 * ```thrift
 * # Deprecated
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
