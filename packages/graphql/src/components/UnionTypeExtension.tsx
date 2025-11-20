import {
  Children,
  Declaration as CoreDeclaration,
  List,
  Name,
  Show,
} from "@alloy-js/core";
import { createGraphQLSymbol } from "../symbol-creation.js";
import { NamedDeclarationProps } from "./common-props.js";

export interface UnionTypeExtensionProps extends NamedDeclarationProps {
  /**
   * Additional union member types (refkeys or type names)
   */
  members?: Children[];
  /**
   * Directives to add to the union
   */
  directives?: Children;
}

/**
 * A union type extension for GraphQL schemas.
 * Extends an existing union type with additional members or directives.
 *
 * @example
 * ```tsx
 * import { refkey } from "@alloy-js/core";
 *
 * const commentRef = refkey();
 * const articleRef = refkey();
 *
 * <>
 *   <UnionTypeExtension
 *     name="SearchResult"
 *     members={[commentRef, articleRef]}
 *   />
 *   <UnionTypeExtension
 *     name="Node"
 *     directives={<Directive name="key" args={{ fields: "id" }} />}
 *   />
 * </>
 * ```
 * renders to
 * ```graphql
 * extend union SearchResult = Comment | Article
 * extend union Node @key(fields: "id")
 * ```
 */
export function UnionTypeExtension(props: UnionTypeExtensionProps) {
  const sym = createGraphQLSymbol(
    props.name,
    {
      refkeys: props.refkey,
    },
    "type",
  );

  const hasMembers = props.members && props.members.length > 0;

  return (
    <CoreDeclaration symbol={sym}>
      extend union <Name />
      <Show when={Boolean(props.directives)}>{props.directives}</Show>
      <Show when={hasMembers}>
        {" = "}
        <List children={props.members!} joiner=" | " />
      </Show>
    </CoreDeclaration>
  );
}
