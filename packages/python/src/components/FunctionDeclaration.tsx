import { code, emitSymbol, Name, Show } from "@alloy-js/core";
import { abcModule } from "../builtins/python.js";
import { PythonOutputSymbol } from "../index.js";
import { ParameterDescriptor } from "../parameter-descriptor.js";
import { createPythonSymbol } from "../symbol-creation.js";
import { getCallSignatureProps } from "../utils.js";
import { CallSignature, CallSignatureProps } from "./CallSignature.jsx";
import { BaseDeclarationProps, Declaration } from "./Declaration.js";
import { PythonBlock } from "./PythonBlock.jsx";
import { LexicalScope, NoNamePolicy } from "./index.js";

export interface FunctionDeclarationPropsBase
  extends BaseDeclarationProps,
    CallSignatureProps {
  /**
   * Indicates that the function is async.
   */
  async?: boolean;
  /**
   * Indicates the type of function.
   */
  functionType?: "instance" | "class" | "static";
  /**
   * The symbol for the function. Mostly used for property methods.
   */
  skipSymbolCreation?: boolean;
}

/**
 * A Python function declaration.
 *
 * @example
 * ```tsx
 * <FunctionDeclaration
 *  name="my_function"
 *  returnType={{ children:"int" }}
 *  parameters=[{name: "a", type: { children:"int" }},{name: "b", type: { children:"str" }}]>
 *   return a + b
 * </FunctionDeclaration>
 * ```
 * This will generate:
 * ```python
 * def my_function(a: int, b: str) -> int:
 *   return a + b
 * ```
 */
function FunctionDeclarationBase(props: FunctionDeclarationPropsBase) {
  const asyncKwd = props.async ? "async " : "";
  let callSignatureProps = getCallSignatureProps(props, {});
  let extraParameters: ParameterDescriptor[] = [];
  // Add self/cls parameter if instance or class function
  if (props.functionType == "instance") {
    extraParameters.push({
      name: "self",
    });
  } else if (props.functionType == "class") {
    extraParameters.push({
      name: "cls",
    });
  }
  callSignatureProps = {
    ...callSignatureProps,
    parameters: [...extraParameters, ...(callSignatureProps.parameters || [])],
  };
  let sym: PythonOutputSymbol = createPythonSymbol(
    props.name,
    {
      instance: props.functionType !== undefined,
      refkeys: props.refkey,
      reuseExisting: props.skipSymbolCreation,
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

export interface FunctionDeclarationProps
  extends FunctionDeclarationPropsBase {}

export function FunctionDeclaration(props: FunctionDeclarationProps) {
  return <FunctionDeclarationBase {...props} />;
}

export interface MethodDeclarationProps extends FunctionDeclarationProps {
  abstract?: boolean;
  property?: "property" | "getter" | "setter" | "deleter";
}

export function MethodDeclarationBase(props: MethodDeclarationProps) {
  const abstractMethod =
    props.abstract ? code`@${abcModule["."].abstractmethod}` : undefined;
  let propertyMethod;
  switch (props.property) {
    case "property":
      propertyMethod = code`@property`;
      break;
    case "getter":
      propertyMethod = code`@${props.name}.getter`;
      break;
    case "setter":
      propertyMethod = code`@${props.name}.setter`;
      break;
    case "deleter":
      propertyMethod = code`@${props.name}.deleter`;
      break;
    default:
      break;
  }
  let skipSymbolCreation: boolean = false;
  if (propertyMethod) {
    const parametersAmount = props.parameters?.length ?? 0;
    if (props.property == "setter" && parametersAmount > 1) {
      throw new Error(
        "Setter property methods must have exactly one parameter",
      );
    }
    if (props.property !== "setter" && parametersAmount > 0) {
      throw new Error("Property methods cannot have parameters");
    }
    // In case we are creating a property method other than the @property decorated method,
    // we want to skip symbol creation.
    if (props.property !== "property") {
      skipSymbolCreation = true;
    }
  }
  return (
    <>
      {propertyMethod}
      {propertyMethod && <hbr />}
      {abstractMethod}
      {abstractMethod && <hbr />}
      <FunctionDeclaration {...props} skipSymbolCreation={skipSymbolCreation} />
    </>
  );
}

export function MethodDeclaration(props: MethodDeclarationProps) {
  return (
    <>
      <MethodDeclarationBase functionType={"instance"} {...props} />
    </>
  );
}

export function ClassMethodDeclaration(props: MethodDeclarationProps) {
  return (
    <>
      {"@classmethod"}
      <hbr />
      <MethodDeclarationBase functionType={"class"} {...props} />
    </>
  );
}

export function StaticMethodDeclaration(props: MethodDeclarationProps) {
  return (
    <>
      {"@staticmethod"}
      <hbr />
      <MethodDeclarationBase functionType={"static"} {...props} />
    </>
  );
}

export interface DunderMethodDeclarationProps
  extends Omit<FunctionDeclarationProps, "functionType"> {}

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

export interface NewDunderClassMethodDeclarationProps
  extends Omit<DunderMethodDeclarationProps, "name"> {}

export function NewDunderClassMethodDeclaration(
  props: NewDunderClassMethodDeclarationProps,
) {
  // __new__ is a special method, as, despite having cls as the first parameter,
  // it isn't decorated with @classmethod.
  return (
    <NoNamePolicy>
      <MethodDeclaration {...props} name="__new__" functionType={"class"} />
    </NoNamePolicy>
  );
}
