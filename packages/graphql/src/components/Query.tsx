import { refkey } from "@alloy-js/core";
import { ObjectType } from "./ObjectType.js";
import { type RootTypeProps, useRootType } from "./root-type.js";

const queryRef = refkey("Query");

/**
 * Declares the `Query` root type.
 *
 * @example
 * ```tsx
 * <Query>
 *   <Field name="user" type={User} />
 * </Query>
 * ```
 */
export function Query(props: RootTypeProps) {
  useRootType("query", "Query");
  return (
    <ObjectType
      name="Query"
      description={props.description}
      refkey={props.refkey ?? queryRef}
    >
      {props.children}
    </ObjectType>
  );
}
