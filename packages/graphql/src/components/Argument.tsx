import { childrenArray, type Children, type Component } from "@alloy-js/core";
import {
  addArgToTarget,
  createArgDefinition,
  resolveDeprecationReason,
  useArgTargetContext,
  useSchemaContext,
  type DeprecatedProps,
  type TypeReference,
} from "../schema.js";
import { applyNonNullType } from "../schema/refs.js";
import { createListSlot } from "./ListSlot.js";

export interface ArgumentProps extends DeprecatedProps {
  name: string;
  type: TypeReference;
  nonNull?: boolean;
  description?: string;
  defaultValue?: unknown;
  children?: Children;
}

export interface ArgumentListProps {
  nonNull?: boolean;
  children?: Children;
}

const argumentList = createListSlot<ArgumentListProps>({
  listName: "Argument.List",
});
const ArgumentListSlot = argumentList.List;

function resolveArgumentType(
  type: TypeReference,
  itemNonNull: boolean | undefined,
  listSlot: ReturnType<typeof argumentList.findListSlot>,
): TypeReference {
  const baseType = applyNonNullType(type, itemNonNull);
  return argumentList.applyListType(baseType, listSlot);
}

function ArgumentBase(props: ArgumentProps) {
  const state = useSchemaContext();
  const target = useArgTargetContext();
  const children = childrenArray(() => props.children);
  const listSlot = argumentList.findListSlot(children, "Argument");
  argumentList.assertOnlyListChildren(children, "Argument");
  const type = resolveArgumentType(props.type, props.nonNull, listSlot);
  const arg = createArgDefinition(
    state,
    props.name,
    type,
    props.description,
    props.defaultValue,
    resolveDeprecationReason(props),
  );
  addArgToTarget(target, arg);
  return undefined;
}

export interface ArgumentComponent {
  (props: ArgumentProps): Children;
  List: Component<ArgumentListProps> &
    Required<Pick<Component<ArgumentListProps>, "tag">>;
}

/**
 * Adds an argument to the nearest Field or Directive.
 *
 * @example
 * ```tsx
 * <Field name="user" type={User}>
 *   <Argument name="id" type={ID} nonNull />
 * </Field>
 * ```
 *
 * @remarks
 * This component must be used within a `Field` or `Directive`.
 */
export function Argument(props: ArgumentProps) {
  return ArgumentBase(props);
}

/**
 * Marks the argument type as a list.
 *
 * @example
 * ```tsx
 * <Argument name="ids" type={ID}>
 *   <Argument.List />
 * </Argument>
 * ```
 */
Argument.List = ArgumentListSlot;

export type ArgProps = ArgumentProps;
