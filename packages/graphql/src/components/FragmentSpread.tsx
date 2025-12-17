import { Children, Show } from "@alloy-js/core";

export interface FragmentSpreadProps {
  /**
   * The name of the fragment to spread (or a refkey to a fragment)
   */
  name: Children;
  /**
   * Directives to apply to the fragment spread
   */
  directives?: Children;
}

/**
 * A fragment spread in a GraphQL operation.
 *
 * @example
 * ```tsx
 * import { refkey } from "@alloy-js/core";
 *
 * const userFragmentRef = refkey();
 *
 * // Using fragment name directly
 * <FragmentSpread name="UserFields" />
 *
 * // Using refkey
 * <FragmentSpread name={userFragmentRef} />
 *
 * // With directives
 * <FragmentSpread
 *   name="UserFields"
 *   directives={<Directive name="include" args={{ if: <Variable name="includeUser" /> }} />}
 * />
 * ```
 * renders to
 * ```graphql
 * ...UserFields
 * ...UserFields @include(if: $includeUser)
 * ```
 */
export function FragmentSpread(props: FragmentSpreadProps) {
  return (
    <>
      ...{props.name}
      <Show when={Boolean(props.directives)}>{props.directives}</Show>
    </>
  );
}
