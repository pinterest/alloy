import { Children, For, List, childrenArray } from "@alloy-js/core";

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
    return children.reduce<Children[]>(
      (normalized, child) =>
        normalized.concat(
          ...(typeof child === "string" ? splitLines(child) : [child]),
        ),
      [],
    );
  }
  return children;
}

export interface DocCommentProps {
  children: Children;
}

function renderDocComment(props: {
  children: Children;
  linePrefix: string;
  closingLine: string;
  alignWidth?: number;
}) {
  const content = normalizeCommentChildren(props.children);
  const body = (
    <>
      {props.linePrefix}
      <align string={props.linePrefix}>
        <List>{content}</List>
      </align>
      <hbr />
      {props.closingLine}
    </>
  );

  return (
    <>
      {"/**"}
      <hbr />
      {props.alignWidth !== undefined ?
        <align width={props.alignWidth}>{body}</align>
      : body}
    </>
  );
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
  return renderDocComment({
    children: props.children,
    linePrefix: " * ",
    closingLine: " */",
  });
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
        <List>{content}</List>
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
