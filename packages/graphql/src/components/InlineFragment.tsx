import { Children, Indent, List } from "@alloy-js/core";

export interface InlineFragmentProps {
  /**
   * Optional type condition for the inline fragment
   */
  typeCondition?: Children;
  /**
   * Directives to apply to the inline fragment
   */
  directives?: Children;
  /**
   * Field selections in the inline fragment
   */
  children?: Children;
}

/**
 * An inline fragment in a GraphQL operation.
 *
 * @example
 * ```tsx
 * // Inline fragment with type condition
 * <FieldSelection name="search">
 *   <InlineFragment typeCondition="User">
 *     <FieldSelection name="name" />
 *     <FieldSelection name="email" />
 *   </InlineFragment>
 *   <InlineFragment typeCondition="Post">
 *     <FieldSelection name="title" />
 *     <FieldSelection name="content" />
 *   </InlineFragment>
 * </FieldSelection>
 *
 * // Inline fragment without type condition (for directives)
 * <InlineFragment directives={<Directive name="include" arguments={<Argument name="if" value={<Variable name="showDetails" />} />} />}>
 *   <FieldSelection name="details" />
 * </InlineFragment>
 * ```
 * renders to
 * ```graphql
 * search {
 *   ... on User {
 *     name
 *     email
 *   }
 *   ... on Post {
 *     title
 *     content
 *   }
 * }
 *
 * ... @include(if: $showDetails) {
 *   details
 * }
 * ```
 */
export function InlineFragment(props: InlineFragmentProps) {
  const hasTypeCondition = Boolean(props.typeCondition);
  const hasDirectives = Boolean(props.directives);

  return (
    <>
      ...
      {hasTypeCondition && <> on {props.typeCondition}</>}
      {hasDirectives && <>{props.directives}</>}
      {" {"}
      <Indent hardline>
        <List children={props.children} joiner={<hardline />} />
      </Indent>
      <hardline />
      {"}"}
    </>
  );
}
