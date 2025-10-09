import { Children, List, Show, code, childrenArray } from "@alloy-js/core";
import { dataclassesModule } from "../builtins/python.js";
import { Atom } from "./Atom.jsx";
import { ClassDeclaration } from "./ClassDeclaration.js";
import type { ClassDeclarationProps } from "./ClassDeclaration.js";
import { StatementList } from "./StatementList.js";
import { VariableDeclaration } from "./VariableDeclaration.js";

export interface DataclassDeclarationProps extends ClassDeclarationProps {
  /** Keyword arguments to pass to `@dataclass(...)`, e.g., `{ frozen: true, slots: true, kw_only: true }`. */
  decoratorKwargs?: Record<string, unknown>;
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
 */
export function DataclassDeclaration(props: DataclassDeclarationProps) {
  const hasDecoratorArgs = Boolean(props.decoratorKwargs) &&
    Object.keys(props.decoratorKwargs as Record<string, unknown>).length > 0;
  const hasBodyChildren =
    childrenArray(() => props.children).filter((c) => Boolean(c)).length > 0;

  return (
    <>
      {"@"}
      {dataclassesModule["."].dataclass}
      <Show when={hasDecoratorArgs}>
        {"("}
        <List comma space>
          {Object.entries(props.decoratorKwargs ?? {}).map(([k, v]) => (
            <>
              {k}={<Atom jsValue={v} />}
            </>
          ))}
        </List>
        {")"}
      </Show>
      <hbr />
      <ClassDeclaration name={props.name} bases={props.bases} doc={props.doc}>
        {hasBodyChildren ? <StatementList>{props.children}</StatementList> : undefined}
      </ClassDeclaration>
    </>
  );
}

/**
 * Emits the `KW_ONLY` sentinel line inside a dataclass body.
 */
export function DataclassKWOnly() {
  return (
    <>
      {"_"}: {dataclassesModule["."].KW_ONLY}
    </>
  );
}


