import {
  Children,
  Declaration as CoreDeclaration,
  Name,
  Show,
  createSymbolSlot,
  memo,
} from "@alloy-js/core";
import { createPythonSymbol } from "../symbol-creation.js";
import { Atom } from "./Atom.jsx";
import { BaseDeclarationProps } from "./Declaration.jsx";
import { SimpleCommentBlock } from "./PyDoc.jsx";

export interface VariableDeclarationProps extends BaseDeclarationProps {
  /**
   * The initial value of the variable.
   */
  initializer?: Children;
  /**
   * The type of the variable. Used only for type annotation. Optional.
   */
  type?: Children;
  /**
   * Indicates if we should omit the None assignment. Optional.
   */
  omitNone?: boolean;
  /**
   * Indicates if this variable is an instance variable. Optional.
   * This is used to handle cases where the variable is part of a class instance.
   */
  instanceVariable?: boolean;
}

/**
 * A variable declaration component for Python.
 *
 * @example
 * ```tsx
 * <VariableDeclaration
 *   name="myVar"
 *   type="int"
 *   initializer={42}  // Initial value
 * />
 * <VariableDeclaration
 *   name="myOtherVar"
 *   type="str"
 *   omitNone={true}
 * />
 * ```
 * renders to
 * ```py
 * myVar: int = 42
 * myOtherVar: str
 * ```
 */
export function VariableDeclaration(props: VariableDeclarationProps) {
  const TypeSymbolSlot = createSymbolSlot();
  const ValueTypeSymbolSlot = createSymbolSlot();

  const sym = createPythonSymbol(
    props.name,
    {
      instance: props.instanceVariable,
      refkeys: props.refkey,
      type: props.type ? TypeSymbolSlot.firstSymbol : undefined,
    },
    "variable",
  );

  if (!props.type) {
    ValueTypeSymbolSlot.moveMembersTo(sym);
  }

  // Handle optional type annotation
  const type = memo(() => {
    if (!props.type) return undefined;
    return (
      <>
        : <TypeSymbolSlot>{props.type}</TypeSymbolSlot>
      </>
    );
  });

  // If we receive a symbol, resolve it to a name
  const value =
    typeof props.initializer === "object" ?
      memo(() => props.initializer)
    : props.initializer;

  const omitAssignment = props.omitNone && props.initializer === undefined;

  const rightSide = memo(() =>
    value === null || value === undefined ?
      <>None</>
    : <ValueTypeSymbolSlot>
        <Atom jsValue={value} />
      </ValueTypeSymbolSlot>,
  );

  return (
    <>
      <Show when={Boolean(props.doc)}>
        <SimpleCommentBlock children={props.doc} />
        <hbr />
      </Show>
      <CoreDeclaration symbol={sym}>
        <Name />
        {type}
        <Show when={!omitAssignment}>
          {" = "}
          {rightSide}
        </Show>
      </CoreDeclaration>
    </>
  );
}
