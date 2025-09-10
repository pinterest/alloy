import {
  Children,
  childrenArray,
  code,
  DeclarationContext,
  emitSymbol,
  findKeyedChild,
  findUnkeyedChildren,
  List,
  Name,
  Refkey,
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
import { Atom, LexicalScope, NoNamePolicy, TypeExpressionProps } from "./index.js";

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

export interface PropertyDeclarationProps {
  /**
   * The name of the property.
   */
  property: ParameterDescriptor;

  /**
   * The children of the property.
   */
  children?: Children;

  /**
   * The refkey of the property.
   */
  refkey?: Refkey;
}

export function PropertyDeclaration(props: PropertyDeclarationProps) {
  // Utility function to format the children output
  // If we pass an empty array to a component, it will treat as if valid children
  // were passed, and thus "pass" will not be rendered.
  const nonEmptyOrUndefined = (children: Children | undefined): Children | undefined => {
    if (!children) return undefined;
    const childArray = childrenArray(() => children);
    return childArray.length > 0 ? children : undefined;
  };

  const children = childrenArray(() => props.children);
  const setterComponent =
    findKeyedChild(children, PropertyDeclaration.Setter.tag) ?? undefined;
  const deleterComponent =
    findKeyedChild(children, PropertyDeclaration.Deleter.tag) ?? undefined;

  const setterChildren = nonEmptyOrUndefined(setterComponent?.props?.children);
  const deleterChildren = nonEmptyOrUndefined(deleterComponent?.props?.children);
  const unkeyedChildren = nonEmptyOrUndefined(findUnkeyedChildren(children));

  validateMemberScope(props.property.name, "PropertyDeclaration");

  const sym: PythonOutputSymbol = createPythonSymbol(
    props.property.name,
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
          <PropertyMethodDeclaration returnType={props.property.type}>
            {unkeyedChildren}
          </PropertyMethodDeclaration>
          <Show when={Boolean(setterComponent)}>
            <SetterPropertyMethodDeclaration type={setterComponent?.props?.type ?? props.property.type}>
              {setterChildren}
            </SetterPropertyMethodDeclaration>
          </Show>
          <Show when={Boolean(deleterComponent)}>
            <DeleterPropertyMethodDeclaration>
              {deleterChildren}
            </DeleterPropertyMethodDeclaration>
          </Show>
        </List>
      </DeclarationContext.Provider>
    </>
  );
}

export interface PropertyMethodDeclarationProps {
  /**
   * The children of the property.
   */
  children?: Children;

  /**
   * The return type of the property.
   */
  returnType?: TypeExpressionProps;
}

export function PropertyMethodDeclaration(
  props: PropertyMethodDeclarationProps,
) {
  const declarationContext = useContext(
    DeclarationContext,
  ) as PythonOutputSymbol;

  return (
    <>
      {code`@property`}
      <hbr />
      <MethodDeclarationBase
        {...props}
        name={declarationContext.name}
        functionType="instance"
        returnType={props.returnType}
        sym={declarationContext}
      >
        {props.children}
      </MethodDeclarationBase>
    </>
  );
}

export interface SetterPropertyMethodDeclarationProps extends PropertyMethodDeclarationProps {
  /**
   * The type of the property. Overrides the PropertyDeclaration type.
   */
  type?: TypeExpressionProps;
}

export function SetterPropertyMethodDeclaration(
  props: SetterPropertyMethodDeclarationProps,
) {
  const declarationContext = useContext(
    DeclarationContext,
  ) as PythonOutputSymbol;

  return (
    <>
      {code`@${declarationContext.name}.setter`}
      <hbr />
      <MethodDeclarationBase
        {...props}
        name={declarationContext.name}
        functionType="instance"
        parameters={[{ name: "value", type: props.type }]}
        returnType={{ children: <Atom jsValue={null} /> }}
        sym={declarationContext}
      />
    </>
  );
}

export interface DeleterPropertyMethodDeclarationProps extends Omit<PropertyMethodDeclarationProps, "returnType"> {}

export function DeleterPropertyMethodDeclaration(
  props: DeleterPropertyMethodDeclarationProps,
) {
  const declarationContext = useContext(
    DeclarationContext,
  ) as PythonOutputSymbol;

  return (
    <>
      {code`@${declarationContext.name}.deleter`}
      <hbr />
      <MethodDeclarationBase
        {...props}
        name={declarationContext.name}
        functionType="instance"
        returnType={{ children: <Atom jsValue={null} /> }}
        sym={declarationContext}
      />
    </>
  );
}

export function createPropertyMethodComponent<P extends { children?: any; type?: any }>(tag: symbol) {
  return taggedComponent(
    tag,
    function Parameters(props: P) {
      const declarationContext = useContext(
        DeclarationContext,
      ) as PythonOutputSymbol;
      if (props.children) {
        return props.children;
      }

      // Special handling for setter which needs a "value" parameter with the specified type
      const parameters = props.type ? [{ name: "value", type: props.type }] : undefined;

      return (
        <>
          <MethodDeclarationBase
            {...props}
            name={declarationContext.name}
            functionType="instance"
            parameters={parameters}
            returnType={{ children: <Atom jsValue={null} /> }}
            sym={declarationContext}
          />
        </>
      );
    },
  );
}

PropertyDeclaration.Setter = createPropertyMethodComponent<SetterPropertyMethodDeclarationProps>(setterTag);
PropertyDeclaration.Deleter = createPropertyMethodComponent<DeleterPropertyMethodDeclarationProps>(deleterTag);

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

export interface ConstructorDeclarationProps
  extends Omit<DunderMethodDeclarationProps, "name"> {}

/**
 * A Python constructor declaration (__new__).
 *
 * @example
 * ```tsx
 * <ConstructorDeclaration args kwargs>
 *   pass
 * </ConstructorDeclaration>
 * ```
 * This will generate:
 * ```python
 * def __new__(cls, *args, **kwargs):
 *   pass
 * ```
 * @param props 
 * @returns 
 */
export function ConstructorDeclaration(
  props: ConstructorDeclarationProps,
) {
  // __new__ is a special method, as, despite having cls as the first parameter,
  // it isn't decorated with @classmethod.
  return (
    <NoNamePolicy>
      <MethodDeclaration {...props} name="__new__" functionType={"class"} />
    </NoNamePolicy>
  );
}
