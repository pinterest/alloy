import {
  For,
  Show,
  childrenArray,
  findKeyedChild,
  taggedComponent,
} from "@alloy-js/core";
import { dataclassesModule } from "../builtins/python.js";
import { Atom } from "./Atom.jsx";
import type { ClassDeclarationProps } from "./ClassDeclaration.js";
import { ClassDeclaration } from "./ClassDeclaration.js";
import { StatementList } from "./StatementList.js";

/**
 * Allowed keyword arguments for the Python `@dataclass(...)` decorator.
 * Showcases arguments valid for Python 3.11+.
 */
export const DATACLASS_KWARG_KEYS = [
  "init",
  "repr",
  "eq",
  "order",
  "unsafe_hash",
  "frozen",
  "match_args",
  "kw_only",
  "slots",
  "weakref_slot",
] as const;

export type DataclassDecoratorKwargs = Partial<
  Record<(typeof DATACLASS_KWARG_KEYS)[number], boolean>
>;

export interface DataclassDeclarationProps extends ClassDeclarationProps {
  /** Keyword arguments to pass to `@dataclass(...)` (only valid dataclass params). */
  decoratorKwargs?: DataclassDecoratorKwargs;
}

/**
 * Renders a Python dataclass. Uses ClassDeclaration component internally.
 *
 * Example:
 * ```tsx
 * <py.DataclassDeclaration name="User" decoratorKwargs={{ kw_only: true }}>
 *   <py.VariableDeclaration instanceVariable omitNone name="id" type="int" />
 *   <py.DataclassKWOnly />
 *   <py.VariableDeclaration
 *     instanceVariable
 *     name="name"
 *     type="str"
 *     initializer={"Anonymous"}
 *   />
 * </py.DataclassDeclaration>
 * ```
 * Will render as:
 * ```py
 * from dataclasses import dataclass
 * from dataclasses import KW_ONLY
 *
 * @dataclass(kw_only=True)
 * class User:
 *     id: int
 *     _: KW_ONLY
 *     name: str = "Anonymous"
 * ```
 */
export function DataclassDeclaration(props: DataclassDeclarationProps) {
  const kwargs = props.decoratorKwargs;
  const hasDecoratorArgs =
    kwargs !== undefined && Object.keys(kwargs).length > 0;

  // Ensure only supported dataclass parameters are provided
  if (props.decoratorKwargs) {
    const allowed = new Set<string>(DATACLASS_KWARG_KEYS as readonly string[]);
    for (const key of Object.keys(props.decoratorKwargs)) {
      if (!allowed.has(key)) {
        throw new Error(`Unsupported dataclass parameter: ${key}`);
      }
    }

    // Validates that, if weakref_slot=True, it requires slots=True
    if (
      props.decoratorKwargs.weakref_slot === true &&
      props.decoratorKwargs.slots !== true
    ) {
      throw new Error(
        "weakref_slot=True requires slots=True in @dataclass decorator",
      );
    }
  }
  const hasBodyChildren =
    childrenArray(() => props.children).filter((c) => Boolean(c)).length > 0;

  // Validate at most one KW_ONLY sentinel in children
  if (hasBodyChildren) {
    const children = childrenArray(() => props.children);
    let kwOnlyCount = 0;
    for (const child of children) {
      if (findKeyedChild([child], DataclassKWOnly.tag)) {
        kwOnlyCount++;
      }
    }
    if (kwOnlyCount > 1) {
      throw new Error(
        "Only one KW_ONLY sentinel is allowed per dataclass body",
      );
    }
  }

  return (
    <>
      {"@"}
      {dataclassesModule["."].dataclass}
      <Show when={hasDecoratorArgs}>
        {"("}
        <For each={Object.entries(kwargs ?? {})} comma space>
          {([k, v]) => (
            <>
              {k}=<Atom jsValue={v} />
            </>
          )}
        </For>
        {")"}
      </Show>
      <hbr />
      <ClassDeclaration name={props.name} bases={props.bases} doc={props.doc}>
        {hasBodyChildren ?
          <StatementList>{props.children}</StatementList>
        : undefined}
      </ClassDeclaration>
    </>
  );
}

/**
 * Emits the `KW_ONLY` sentinel line inside a dataclass body.
 */
const kwOnlyTag = Symbol();
// Tagging DataclassKWOnly allows us to use findKeyedChild to accurately detect and
// count occurrences, ensuring the “only one KW_ONLY” rule is enforced.
export const DataclassKWOnly = taggedComponent(
  kwOnlyTag,
  function DataclassKWOnly() {
    return (
      <>
        {"_"}: {dataclassesModule["."].KW_ONLY}
      </>
    );
  },
);
