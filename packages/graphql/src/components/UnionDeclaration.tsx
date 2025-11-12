import {
  Children,
  Declaration as CoreDeclaration,
  List,
  Name,
  Show,
} from "@alloy-js/core";
import { createGraphQLSymbol } from "../symbol-creation.js";
import { BaseDeclarationProps } from "./common-props.js";

export interface UnionDeclarationProps extends BaseDeclarationProps {
  /**
   * Union member types (refkeys or type names)
   */
  members: Children[];
}

/**
 * A union type declaration for GraphQL schemas.
 *
 * @example
 * ```tsx
 * import { refkey } from "@alloy-js/core";
 *
 * const userRef = refkey();
 * const postRef = refkey();
 * const commentRef = refkey();
 *
 * <>
 *   <UnionDeclaration
 *     name="SearchResult"
 *     members={[userRef, postRef, commentRef]}
 *     description='"""Search result types"""'
 *   />
 *   <UnionDeclaration
 *     name="Node"
 *     members={["User", "Post", "Comment"]}
 *   />
 * </>
 * ```
 * renders to
 * ```graphql
 * """
 * Search result types
 * """
 * union SearchResult = User | Post | Comment
 * union Node = User | Post | Comment
 * ```
 */
export function UnionDeclaration(props: UnionDeclarationProps) {
  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
    },
    "type",
  );

  return (
    <>
      <Show when={Boolean(props.description)}>
        {props.description}
        <hbr />
      </Show>
      <CoreDeclaration symbol={sym}>
        union <Name />
        <Show when={Boolean(props.directives)}>{props.directives}</Show>
        {" = "}
        <List children={props.members} joiner=" | " />
      </CoreDeclaration>
    </>
  );
}
