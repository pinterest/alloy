import { refkey } from "@alloy-js/core";
import { ObjectType } from "./ObjectType.js";
import { type RootTypeProps, useRootType } from "./root-type.js";

const subscriptionRef = refkey("Subscription");

/**
 * Declares the `Subscription` root type.
 *
 * @example
 * ```tsx
 * <Subscription>
 *   <Field name="userChanged" type={User} />
 * </Subscription>
 * ```
 */
export function Subscription(props: RootTypeProps) {
  useRootType("subscription", "Subscription");
  return (
    <ObjectType
      name="Subscription"
      description={props.description}
      refkey={props.refkey ?? subscriptionRef}
    >
      {props.children}
    </ObjectType>
  );
}
