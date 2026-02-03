import type { Children, Refkey } from "@alloy-js/core";
import { ID } from "../builtins/graphql.js";
import { Node } from "../builtins/node.js";
import { Field } from "./Field.js";
import { InterfaceType } from "./InterfaceType.js";

const DEFAULT_ID_DESCRIPTION = "The ID of an object";

interface NodeIdProps {
  description?: string;
}

function NodeId(props: NodeIdProps) {
  return <Field name="id" type={ID} nonNull description={props.description} />;
}

export interface NodeInterfaceProps {
  description?: string;
  idDescription?: string;
  refkey?: Refkey | Refkey[];
  children?: Children;
}

/**
 * Declares the canonical `Node` interface.
 *
 * @example
 * ```tsx
 * <NodeInterface>
 *   <Field name="id" type={ID} nonNull />
 * </NodeInterface>
 * ```
 */
export function NodeInterface(props: NodeInterfaceProps) {
  return (
    <InterfaceType
      name="Node"
      description={props.description}
      refkey={props.refkey ?? Node}
    >
      <NodeId description={props.idDescription ?? DEFAULT_ID_DESCRIPTION} />
      {props.children}
    </InterfaceType>
  );
}
