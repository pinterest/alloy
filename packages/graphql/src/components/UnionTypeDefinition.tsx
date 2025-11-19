import {
  Children,
  Declaration as CoreDeclaration,
  List,
  Name,
  Show,
} from "@alloy-js/core";
import { createGraphQLSymbol } from "../symbol-creation.js";
import { BaseDeclarationProps } from "./common-props.js";
import {
  validateUnionHasMembers,
  validateUnionMemberTypes,
  wrapDescription,
} from "./utils.js";

export interface UnionTypeDefinitionProps extends BaseDeclarationProps {
  /**
   * Union member types (refkeys or type names)
   */
  members: Children[];
}

/**
 * A union type definition for GraphQL schemas.
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
 *   <UnionTypeDefinition
 *     name="SearchResult"
 *     members={[userRef, postRef, commentRef]}
 *     description="Search result types"
 *   />
 *   <UnionTypeDefinition
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
export function UnionTypeDefinition(props: UnionTypeDefinitionProps) {
  // Validate union has at least one member
  validateUnionHasMembers(props.members, props.name);

  // Validate that all members are object types (if they're refkeys)
  validateUnionMemberTypes(props.members, props.name);

  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
      metadata: {
        kind: "union",
      },
    },
    "type",
  );

  const wrappedDescription = wrapDescription(props.description);

  return (
    <>
      <Show when={Boolean(wrappedDescription())}>
        {wrappedDescription()}
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
