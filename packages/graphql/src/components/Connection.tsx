import type { Children, Component, Refkey } from "@alloy-js/core";
import {
  childrenArray,
  findKeyedChild,
  findKeyedChildren,
  findUnkeyedChildren,
  isNamekey,
  namekey,
  refkey,
  taggedComponent,
} from "@alloy-js/core";
import { PageInfo } from "../builtins/page-info.js";
import { useConnectionOptions } from "../connection-options.js";
import { type NameInput, type TypeReference } from "../schema.js";
import { Field } from "./Field.js";
import { ObjectType } from "./ObjectType.js";
import { normalizeRefkeys } from "./utils.js";

const DEFAULT_DESCRIPTIONS = {
  connection: "A connection to a list of items.",
  edge: "An edge in a connection.",
  pageInfo: "Information to aid in pagination.",
  edges: "A list of edges.",
  node: "The item at the end of the edge",
  cursor: "A cursor for use in pagination",
};

export interface ConnectionProps {
  name: NameInput;
  type: TypeReference;
  refkey?: Refkey | Refkey[];
  edgeRefkey?: Refkey | Refkey[];
  children?: Children;
}

export interface ConnectionEdgeProps {
  description?: string;
  children?: Children;
}

export interface ConnectionFieldsProps {
  children?: Children;
}

export interface ConnectionPageInfoProps {
  description?: string;
}

interface ConnectionEdgeDefinitionProps {
  name: NameInput;
  nodeType: TypeReference;
  cursorType: TypeReference;
  refkey: Refkey | Refkey[];
  description?: string;
  children?: Children;
}

const connectionEdgeTag = Symbol("Connection.Edge");
const connectionFieldsTag = Symbol("Connection.Fields");
const connectionPageInfoTag = Symbol("Connection.PageInfo");

const ConnectionEdgeSlot = taggedComponent(
  connectionEdgeTag,
  (_props: ConnectionEdgeProps) => undefined,
);

const ConnectionFieldsSlot = taggedComponent(
  connectionFieldsTag,
  (_props: ConnectionFieldsProps) => undefined,
);

const ConnectionPageInfoSlot = taggedComponent(
  connectionPageInfoTag,
  (_props: ConnectionPageInfoProps) => undefined,
);

function ConnectionEdge(props: ConnectionEdgeDefinitionProps) {
  return (
    <ObjectType
      name={props.name}
      refkey={props.refkey}
      description={props.description ?? DEFAULT_DESCRIPTIONS.edge}
    >
      <>
        <Field
          name="node"
          type={props.nodeType}
          description={DEFAULT_DESCRIPTIONS.node}
        />
        <Field
          name="cursor"
          type={props.cursorType}
          nonNull
          description={DEFAULT_DESCRIPTIONS.cursor}
        />
      </>
      {props.children}
    </ObjectType>
  );
}

function ConnectionBase(props: ConnectionProps) {
  const pagination = useConnectionOptions();
  const baseName = unwrapNameInput(props.name);
  const connectionName = deriveNameInput(props.name, "Connection");
  const edgeName = deriveNameInput(props.name, "Edge");
  const connectionRefkeys = normalizeRefkeys(props.refkey);
  const edgeRefkeys = normalizeRefkeys(props.edgeRefkey);
  const connectionNameString = `${baseName}Connection`;
  const edgeNameString = `${baseName}Edge`;
  const connectionRefkey =
    connectionRefkeys.length > 0 ?
      connectionRefkeys
    : refkey(connectionNameString);
  const edgeTypeRef = edgeRefkeys[0] ?? refkey(edgeNameString);
  const edgeRefkey = edgeRefkeys.length > 0 ? edgeRefkeys : edgeTypeRef;
  const children = childrenArray(() => props.children);
  const edgeSlot = findKeyedChild(children, connectionEdgeTag);
  const edgeSlots = findKeyedChildren(children, connectionEdgeTag);
  const fieldsSlots = findKeyedChildren(children, connectionFieldsTag);
  const pageInfoSlot = findKeyedChild(children, connectionPageInfoTag);
  const pageInfoSlots = findKeyedChildren(children, connectionPageInfoTag);
  if (edgeSlots.length > 1) {
    throw new Error("Connection only supports a single Connection.Edge child.");
  }
  if (pageInfoSlots.length > 1) {
    throw new Error(
      "Connection only supports a single Connection.PageInfo child.",
    );
  }
  const fieldsChildren = fieldsSlots.flatMap((slot) =>
    childrenArray(() => slot.props.children),
  );
  const unkeyedChildren = findUnkeyedChildren(children);
  const extraFields = [...fieldsChildren, ...unkeyedChildren];
  const pageInfoProps = pageInfoSlot?.props;
  const pageInfoField = (
    <Field
      name="pageInfo"
      type={PageInfo}
      nonNull
      description={pageInfoProps?.description ?? DEFAULT_DESCRIPTIONS.pageInfo}
    />
  );
  return (
    <>
      <ObjectType
        name={connectionName}
        refkey={connectionRefkey}
        description={DEFAULT_DESCRIPTIONS.connection}
      >
        {pageInfoField}
        <Field
          name="edges"
          type={edgeTypeRef}
          description={DEFAULT_DESCRIPTIONS.edges}
        >
          <Field.List />
        </Field>
        {extraFields}
      </ObjectType>
      <ConnectionEdge
        name={edgeName}
        refkey={edgeRefkey}
        nodeType={props.type}
        cursorType={pagination.cursorType}
        description={edgeSlot?.props.description}
        children={edgeSlot?.props.children}
      />
    </>
  );
}

export interface ConnectionComponent {
  (props: ConnectionProps): Children;
  Edge: Component<ConnectionEdgeProps> &
    Required<Pick<Component<ConnectionEdgeProps>, "tag">>;
  Fields: Component<ConnectionFieldsProps> &
    Required<Pick<Component<ConnectionFieldsProps>, "tag">>;
  PageInfo: Component<ConnectionPageInfoProps> &
    Required<Pick<Component<ConnectionPageInfoProps>, "tag">>;
}

/**
 * Creates a Relay-style connection and edge type.
 *
 * @example
 * ```tsx
 * <Connection name="User" type={User}>
 *   <Connection.Fields>
 *     <Field name="totalCount" type={Int} />
 *   </Connection.Fields>
 * </Connection>
 * ```
 *
 * @remarks
 * Use `Connection.Edge` to customize the generated edge type and
 * `Connection.PageInfo` to customize the pageInfo field.
 */
export function Connection(props: ConnectionProps) {
  return ConnectionBase(props);
}

/**
 * Adds fields to the generated edge type.
 *
 * @example
 * ```tsx
 * <Connection name="User" type={User}>
 *   <Connection.Edge>
 *     <Field name="addedAt" type={DateTime} />
 *   </Connection.Edge>
 * </Connection>
 * ```
 */
Connection.Edge = ConnectionEdgeSlot;
/**
 * Adds fields to the generated connection type.
 *
 * @example
 * ```tsx
 * <Connection name="User" type={User}>
 *   <Connection.Fields>
 *     <Field name="totalCount" type={Int} />
 *   </Connection.Fields>
 * </Connection>
 * ```
 */
Connection.Fields = ConnectionFieldsSlot;
/**
 * Overrides the `pageInfo` field on the generated connection type.
 *
 * @example
 * ```tsx
 * <Connection name="User" type={User}>
 *   <Connection.PageInfo description="Pagination information." />
 * </Connection>
 * ```
 *
 * @remarks
 * Relay requires `pageInfo: PageInfo!`, so this slot only customizes the
 * field description.
 */
Connection.PageInfo = ConnectionPageInfoSlot;

function unwrapNameInput(value: NameInput): string {
  return isNamekey(value) ? value.name : value;
}

function deriveNameInput(base: NameInput, suffix: string): NameInput {
  if (isNamekey(base)) {
    return namekey(`${base.name}${suffix}`, { ...base.options });
  }
  return `${base}${suffix}`;
}
