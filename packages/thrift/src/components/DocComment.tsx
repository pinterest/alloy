import { Children, List } from "@alloy-js/core";

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
  return (
    <>
      {"/**"}
      <hbr />
      {" * "}
      <align string=" * ">
        <List>{props.children}</List>
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
