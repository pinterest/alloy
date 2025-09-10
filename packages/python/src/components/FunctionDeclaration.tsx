import {
  childrenArray,
  code,
  DeclarationContext,
  emitSymbol,
  findKeyedChild,
  findUnkeyedChildren,
  List,
  Name,
  Show,
  taggedComponent,
  useContext,
} from "@alloy-js/core";
import { abcModule } from "../builtins/python.js";
import { PythonOutputSymbol } from "../index.js";
import { ParameterDescriptor } from "../parameter-descriptor.js";
import { createPythonSymbol } from "../symbol-creation.js";
import { usePythonScope } from "../symbols/scopes.js";
import { getCallSignatureProps } from "../utils.js";
import { CallSignature, CallSignatureProps } from "./CallSignature.jsx";
import { BaseDeclarationProps, Declaration } from "./Declaration.js";
import { PythonBlock } from "./PythonBlock.jsx";
import { LexicalScope, NoNamePolicy } from "./index.js";

const setterTag = Symbol();
const deleterTag = Symbol();

/**
 * Validates that the current scope is a member scope (inside a class).
 * Throws an error if not in a member scope.
 */
function validateMemberScope(name: string, type: string = "Method") {
  const currentScope = usePythonScope();
  if (!currentScope?.isMemberScope) {
    throw new Error(
      `${type} "${name}" must be declared inside a class (member scope)`,
    );
  }
}

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
   * Optional existing symbol to use instead of creating a new one.
   */
  sym?: PythonOutputSymbol;
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
  const extraParameters: ParameterDescriptor[] = [];
  // Add self/cls parameter if instance or class function
  if (props.functionType === "instance") {
    extraParameters.push({
      name: "self",
    });
  } else if (props.functionType === "class") {
    extraParameters.push({
      name: "cls",
    });
  }
  callSignatureProps = {
    ...callSignatureProps,
    parameters: [...extraParameters, ...(callSignatureProps.parameters || [])],
  };
  const currentScope = usePythonScope();
  const sym: PythonOutputSymbol =
    props.sym ??
    createPythonSymbol(
      props.name,
      {
        instance:
          props.functionType !== undefined && currentScope?.isMemberScope,
        refkeys: props.refkey,
      },
      "function",
    );

  // Only emit symbol if we created it (not if using existing one)
  if (!props.sym) {
    emitSymbol(sym);
  }

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

export interface MethodDeclarationBaseProps extends FunctionDeclarationProps {}

export function MethodDeclarationBase(props: MethodDeclarationBaseProps) {
  // Only validate if we don't have an existing symbol (which implies validation already happened)
  if (!props.sym) {
    validateMemberScope(props.name);
  }

  return (
    <>
      <FunctionDeclaration {...props} />
    </>
  );
}

export interface MethodDeclarationProps extends FunctionDeclarationProps {
  abstract?: boolean;
}

export function MethodDeclaration(props: MethodDeclarationProps) {
  const abstractMethod =
    props.abstract ? code`@${abcModule["."].abstractmethod}` : undefined;

  return (
    <>
      {abstractMethod}
      {abstractMethod && <hbr />}
      <MethodDeclarationBase functionType={"instance"} {...props} />
    </>
  );
}

export function PropertyDeclaration(props: FunctionDeclarationProps) {
  const children = childrenArray(() => props.children);
  const setterComponent =
    findKeyedChild(children, PropertyDeclaration.Setter.tag) ?? undefined;
  const deleterComponent =
    findKeyedChild(children, PropertyDeclaration.Deleter.tag) ?? undefined;
  const setterChildren = setterComponent?.props?.children;
  const deleterChildren = deleterComponent?.props?.children;
  const unkeyedChildren = findUnkeyedChildren(children);

  validateMemberScope(props.name, "PropertyDeclaration");

  const sym: PythonOutputSymbol = createPythonSymbol(
    props.name,
    {
      instance: true,
      refkeys: props.refkey,
    },
    "function",
  );
  emitSymbol(sym);
  return (
    <>
      <DeclarationContext.Provider value={sym}>
        <List hardline enderPunctuation>
          <>
            {code`@property`}
            <hbr />
            <PropertyMethodDeclaration
              functionType={"instance"}
              children={unkeyedChildren}
            />
          </>
          <>
            <Show when={Boolean(setterComponent)}>
              {code`@${props.name}.setter`}
              <hbr />
              <PropertyMethodDeclaration
                parameters={[{ name: "value" }]}
                children={setterChildren}
              />
            </Show>
          </>
          <>
            <Show when={Boolean(deleterComponent)}>
              {code`@${props.name}.deleter`}
              <hbr />
              <PropertyMethodDeclaration children={deleterChildren} />
            </Show>
          </>
        </List>
      </DeclarationContext.Provider>
    </>
  );
}

export interface PropertyMethodDeclarationProps
  extends Omit<FunctionDeclarationProps, "name"> {}

export function PropertyMethodDeclaration(
  props: PropertyMethodDeclarationProps,
) {
  const declarationContext = useContext(
    DeclarationContext,
  ) as PythonOutputSymbol;

  return (
    <MethodDeclarationBase
      {...props}
      name={declarationContext.name}
      functionType="instance"
      sym={declarationContext}
    />
  );
}

export function createPropertyMethodComponent(tag: symbol) {
  return taggedComponent(
    tag,
    function Parameters(props: PropertyMethodDeclarationProps) {
      const declarationContext = useContext(
        DeclarationContext,
      ) as PythonOutputSymbol;
      if (props.children) {
        return props.children;
      }

      return (
        <>
          <FunctionDeclaration
            functionType={"instance"}
            {...props}
            name={declarationContext.name}
          />
        </>
      );
    },
  );
}

PropertyDeclaration.Setter = createPropertyMethodComponent(setterTag);
PropertyDeclaration.Deleter = createPropertyMethodComponent(deleterTag);

export function ClassMethodDeclaration(props: MethodDeclarationProps) {
  const abstractMethod =
    props.abstract ? code`@${abcModule["."].abstractmethod}` : undefined;

  return (
    <>
      {"@classmethod"}
      <hbr />
      {abstractMethod}
      {abstractMethod && <hbr />}
      <MethodDeclarationBase functionType={"class"} {...props} />
    </>
  );
}

export function StaticMethodDeclaration(props: MethodDeclarationProps) {
  const abstractMethod =
    props.abstract ? code`@${abcModule["."].abstractmethod}` : undefined;

  return (
    <>
      {"@staticmethod"}
      <hbr />
      {abstractMethod}
      {abstractMethod && <hbr />}
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
