import { refkey } from "@alloy-js/core";
import { ObjectType } from "./ObjectType.js";
import { type RootTypeProps, useRootType } from "./root-type.js";

const mutationRef = refkey("Mutation");

/**
 * Declares the `Mutation` root type.
 *
 * @example
 * ```tsx
 * <Mutation>
 *   <Field name="updateUser" type={User} />
 * </Mutation>
 * ```
 */
export function Mutation(props: RootTypeProps) {
  useRootType("mutation", "Mutation");
  return (
    <ObjectType
      name="Mutation"
      description={props.description}
      refkey={props.refkey ?? mutationRef}
    >
      {props.children}
    </ObjectType>
  );
}
