import { Children, isRefkey, List, memo, Refkey } from "@alloy-js/core";
import { ref } from "../symbols/reference.js";

export interface ImplementsInterfacesProps {
  /**
   * Interfaces to implement (refkeys or string names)
   */
  interfaces: Children[];
}

/**
 * Renders the implements clause for GraphQL object types and interface types.
 * Automatically includes transitive interfaces (if interface B implements interface C,
 * and a type implements B, it will render "implements B & C").
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

  // Compute the flattened list of interfaces including transitive ones
  const allInterfaces = memo(() => {
    const seen = new Set<string>();
    const result: Children[] = [];

    function collectInterfaces(interfaces: Children[]) {
      for (const iface of interfaces) {
        // Try to resolve if it's a refkey
        if (isRefkey(iface)) {
          const reference = ref(iface as Refkey);
          const [name, symbol] = reference();

          // Track by name to avoid duplicates
          const nameStr = String(name);
          if (seen.has(nameStr)) {
            continue;
          }
          seen.add(nameStr);
          result.push(iface);

          // Recursively collect parent interfaces
          if (symbol?.metadata.implements) {
            const parentInterfaces = symbol.metadata.implements as Children[];
            if (
              Array.isArray(parentInterfaces) &&
              parentInterfaces.length > 0
            ) {
              collectInterfaces(parentInterfaces);
            }
          }
        } else {
          // String literal interface name
          const nameStr = String(iface);
          if (!seen.has(nameStr)) {
            seen.add(nameStr);
            result.push(iface);
          }
        }
      }
    }

    collectInterfaces(props.interfaces);
    return result;
  });

  return (
    <>
      {" "}
      implements <List children={allInterfaces} joiner=" & " />
    </>
  );
}
