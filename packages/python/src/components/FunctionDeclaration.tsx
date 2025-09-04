import { emitSymbol, Name, Show } from "@alloy-js/core";
import { createPythonSymbol } from "../symbol-creation.js";
import { getCallSignatureProps } from "../utils.js";
import { CallSignature, CallSignatureProps } from "./CallSignature.jsx";
import { BaseDeclarationProps, Declaration } from "./Declaration.js";
import { PythonBlock } from "./PythonBlock.jsx";
import { LexicalScope, NoNamePolicy } from "./index.js";

export interface FunctionDeclarationProps
  extends BaseDeclarationProps,
    CallSignatureProps {
  async?: boolean;
}

/**
 * A Python function declaration.
 *
 * @example
 * ```tsx
 * <FunctionDeclaration
 *  name="my_function"
 *  returnType="int"
 *  parameters=[{name: "a", type: "int"},{name: "b", type: "str"}]>
 *   return a + b
 * </FunctionDeclaration>
 * ```
 * This will generate:
 * ```python
 * def my_function(a: int, b: str) -> int:
 *   return a + b
 * ```
 */
function FunctionDeclarationBase(props: FunctionDeclarationProps) {
  const asyncKwd = props.async ? "async " : "";
  const callSignatureProps = getCallSignatureProps(props, {});
  const sym = createPythonSymbol(
    props.name,
    {
      instance:
        props.instanceFunction || props.staticFunction || props.classFunction,
      refkeys: props.refkey,
    },
    "function",
  );
  emitSymbol(sym);

  return (
    <>
      <Declaration {...props} nameKind="function" symbol={sym}>
        {asyncKwd}def <Name />
        <LexicalScope name={sym.name}>
          <CallSignature {...callSignatureProps} />
          <PythonBlock opener=":">
            <Show when={Boolean(props.doc)}>{props.doc}</Show>
            {props.children ?? "pass"}
          </PythonBlock>
        </LexicalScope>
      </Declaration>
    </>
  );
}

export function FunctionDeclaration(props: FunctionDeclarationProps) {
  return <FunctionDeclarationBase {...props} />;
}

export function MethodDeclaration(props: FunctionDeclarationProps) {
  return <FunctionDeclarationBase instanceFunction={true} {...props} />;
}

export function ClassMethodDeclaration(props: FunctionDeclarationProps) {
  return (
    <>
      {"@classmethod"}
      <hbr />
      <FunctionDeclarationBase classFunction={true} {...props} />
    </>
  );
}

export function StaticMethodDeclaration(props: FunctionDeclarationProps) {
  return (
    <>
      {"@staticmethod"}
      <hbr />
      <FunctionDeclarationBase staticFunction={true} {...props} />
    </>
  );
}

export interface DunderMethodDeclarationProps
  extends Omit<
    FunctionDeclarationProps,
    "instanceFunction" | "classFunction" | "staticFunction"
  > {}

/**
 * A Python dunder method declaration.
 *
 * @example
 * ```tsx
 * <DunderMethodDeclaration name="__init__">
 *   self.attribute = "value"
 * </DunderMethodDeclaration>
 * ```
 * This will generate:
 * ```python
 * def __init__(self: MyClass) -> None:
 *     self.attribute = "value"
 * ```
 *
 * @remarks
 *
 * This is a convenience component for dunder methods.
 */
export function DunderMethodDeclaration(props: DunderMethodDeclarationProps) {
  return (
    <NoNamePolicy>
      <MethodDeclaration {...props} />
    </NoNamePolicy>
  );
}
