import { Children, List } from "@alloy-js/core";

export interface ImplementsInterfacesProps {
  /**
   * Interfaces to implement (refkeys or string names)
   */
  interfaces: Children[];
}

/**
 * Renders the implements clause for GraphQL object types and interface types.
 *
 * @example
 * ```tsx
 * <ImplementsInterfaces interfaces={[nodeRef, timestampedRef]} />
 * ```
 * renders to
 * ```graphql
 * implements Node & Timestamped
 * ```
 */
export function ImplementsInterfaces(props: ImplementsInterfacesProps) {
  if (!props.interfaces || props.interfaces.length === 0) {
    return null;
  }

  return (
    <>
      {" "}
      implements <List children={props.interfaces} joiner=" & " />
    </>
  );
}
