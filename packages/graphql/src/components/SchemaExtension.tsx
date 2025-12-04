import { Children, Show } from "@alloy-js/core";
import { validateRootType } from "./utils.js";

export interface SchemaExtensionProps {
  /**
   * Additional root query type or override
   */
  query?: Children;
  /**
   * Additional root mutation type or override
   */
  mutation?: Children;
  /**
   * Additional root subscription type or override
   */
  subscription?: Children;
  /**
   * Directives to add to the schema
   */
  directives?: Children;
}

/**
 * A schema extension for GraphQL schemas.
 * Extends an existing schema with additional operation types or directives.
 *
 * @example
 * ```tsx
 * import { refkey } from "@alloy-js/core";
 *
 * const subscriptionRef = refkey();
 *
 * <>
 *   <SchemaExtension
 *     subscription={subscriptionRef}
 *   />
 *   <SchemaExtension
 *     directives={
 *       <Directive
 *         name="link"
 *         args={{ url: "https://specs.apollo.dev/federation/v2.0" }}
 *       />
 *     }
 *   />
 * </>
 * ```
 * renders to
 * ```graphql
 * extend schema {
 *   subscription: Subscription
 * }
 * extend schema @link(url: "https://specs.apollo.dev/federation/v2.0")
 * ```
 */
export function SchemaExtension(props: SchemaExtensionProps) {
  const hasOperations = Boolean(
    props.query || props.mutation || props.subscription,
  );

  // Validate that root types are object types
  validateRootType(props.query, "query");
  validateRootType(props.mutation, "mutation");
  validateRootType(props.subscription, "subscription");

  return (
    <>
      extend schema
      <Show when={Boolean(props.directives)}>{props.directives}</Show>
      <Show when={hasOperations}>
        {" {"}
        <hardline />
        <Show when={Boolean(props.query)}>
          {"  "}query: {props.query}
          <hardline />
        </Show>
        <Show when={Boolean(props.mutation)}>
          {"  "}mutation: {props.mutation}
          <hardline />
        </Show>
        <Show when={Boolean(props.subscription)}>
          {"  "}subscription: {props.subscription}
          <hardline />
        </Show>
        {"}"}
      </Show>
    </>
  );
}
