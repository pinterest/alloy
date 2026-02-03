import {
  childrenArray,
  findKeyedChild,
  findKeyedChildren,
  isKeyedChild,
  taggedComponent,
  type Children,
  type Component,
  type ComponentCreator,
} from "@alloy-js/core";
import type { TypeReference } from "../schema.js";
import { wrapListType, wrapNonNullType } from "../schema/refs.js";

interface BaseListSlotProps {
  nonNull?: boolean;
  children?: Children;
}

interface ListSlotOptions {
  listName: string;
}

interface ListSlotFactory<TProps extends BaseListSlotProps> {
  tag: symbol;
  List: Component<TProps> & Required<Pick<Component<TProps>, "tag">>;
  findListSlot: (
    children: Children[],
    ownerLabel: string,
  ) => ComponentCreator<TProps> | null;
  assertOnlyListChildren: (children: Children[], ownerLabel: string) => void;
  applyListType: (
    type: TypeReference,
    listSlot: ComponentCreator<TProps> | null,
  ) => TypeReference;
}

export function createListSlot<TProps extends BaseListSlotProps>(
  options: ListSlotOptions,
): ListSlotFactory<TProps> {
  const tag = Symbol(options.listName);
  const List = taggedComponent(tag, (_props: TProps) => undefined);

  function findListSlot(children: Children[], ownerLabel: string) {
    const listSlot = findKeyedChild(
      children,
      tag,
    ) as ComponentCreator<TProps> | null;
    const listSlots = findKeyedChildren(
      children,
      tag,
    ) as ComponentCreator<TProps>[];
    if (listSlots.length > 1) {
      throw new Error(
        `${ownerLabel} only supports a single ${options.listName} child.`,
      );
    }
    return listSlot;
  }

  function assertOnlyListChildren(children: Children[], ownerLabel: string) {
    const extraChildren = children.filter((child) => {
      if (!isKeyedChild(child)) {
        return true;
      }
      return child.tag !== tag;
    });
    if (extraChildren.length > 0) {
      throw new Error(
        `${ownerLabel} only supports ${options.listName} children.`,
      );
    }
  }

  function applyListType(
    type: TypeReference,
    listSlot: ComponentCreator<TProps> | null,
  ): TypeReference {
    if (!listSlot) {
      return type;
    }

    const listChildren = childrenArray(() => listSlot.props.children);
    const nestedListSlot = findKeyedChild(
      listChildren,
      tag,
    ) as ComponentCreator<TProps> | null;
    const nestedListSlots = findKeyedChildren(
      listChildren,
      tag,
    ) as ComponentCreator<TProps>[];
    if (nestedListSlots.length > 1) {
      throw new Error(
        `${options.listName} only supports a single ${options.listName} child.`,
      );
    }
    const extraChildren = listChildren.filter((child) => {
      if (!isKeyedChild(child)) {
        return true;
      }
      return child.tag !== tag;
    });
    if (extraChildren.length > 0) {
      throw new Error(
        `${options.listName} only supports ${options.listName} as a child.`,
      );
    }

    const innerType =
      nestedListSlot ? applyListType(type, nestedListSlot) : type;
    const listType = wrapListType(innerType);
    return listSlot.props.nonNull ? wrapNonNullType(listType) : listType;
  }

  return {
    tag,
    List,
    findListSlot,
    assertOnlyListChildren,
    applyListType,
  };
}
