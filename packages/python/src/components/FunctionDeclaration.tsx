import {
  Children,
  childrenArray,
  code,
  createContext,
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
import {
  Atom,
  LexicalScope,
  NoNamePolicy,
  TypeExpressionProps,
} from "./index.js";

const setterTag = Symbol();
const deleterTag = Symbol();

/**
 * Context to provide property type information within a PropertyDeclaration
 */
const PropertyContext = createContext<TypeExpressionProps | undefined>();

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

// Internal interface with all properties - not exported to keep implementation details private
interface BaseFunctionDeclarationProps
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
 * Internal base function declaration component that handles functionType logic.
 * This component is not exported to keep implementation details private.
 */
function BaseFunctionDeclaration(props: BaseFunctionDeclarationProps) {
  const asyncKwd = props.async ? "async " : "";
  // Add self/cls parameter if instance or class function
  let parameters;
  switch (props.functionType) {
    case "instance":
      parameters = [{ name: "self" }, ...(props.parameters || [])];
      break;
    case "class":
      parameters = [{ name: "cls" }, ...(props.parameters || [])];
      break;
    default:
      parameters = props.parameters;
  }
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
          <CallSignature
            {...getCallSignatureProps(props, {})}
            parameters={parameters}
          />
          <PythonBlock opener=":">
            <Show when={Boolean(props.doc)}>{props.doc}</Show>
            {props.children ?? "pass"}
          </PythonBlock>
        </LexicalScope>
      </Declaration>
    </>
  );
}

// Not inheriting from BaseFunctionDeclarationProps to keep implementation details private
export interface FunctionDeclarationProps
  extends BaseDeclarationProps,
    CallSignatureProps {
  /**
   * Indicates that the function is async.
   */
  async?: boolean;
}

/**
 * A Python function declaration.
 *
 * @example
 * ```tsx
 * <FunctionDeclaration
 *   name="my_function"
 *   returnType={{ children: "int" }}
 *   parameters={[{ name: "a", type: { children: "int" } }, { name: "b", type: { children: "str" } }]}
 * >
 *   return a + b
 * </FunctionDeclaration>
 * ```
 * This will generate:
 * ```python
 * def my_function(a: int, b: str) -> int:
 *     return a + b
 * ```
 *
 * @remarks
 * This component creates a Python function declaration with optional type annotations,
 * parameters, and return types. It supports async functions and automatically
 * handles symbol creation and emission.
 */
export function FunctionDeclaration(props: FunctionDeclarationProps) {
  return <BaseFunctionDeclaration {...props} />;
}

/**
 * Internal method declaration base component that handles validation
 * and ensures the method is declared within a class (member scope).
 * This component is not exported to keep implementation details private.
 */
function MethodDeclarationBase(props: BaseFunctionDeclarationProps) {
  // Only validate if we don't have an existing symbol (which implies validation already happened)
  if (!props.sym) {
    validateMemberScope(props.name);
  }

  return (
    <>
      <BaseFunctionDeclaration {...props} />
    </>
  );
}

export interface MethodDeclarationProps extends FunctionDeclarationProps {
  abstract?: boolean;
}

/**
 * A Python method declaration component.
 *
 * @example
 * ```tsx
 * <MethodDeclaration
 *   name="my_method"
 *   returnType={{ children: "int" }}
 *   parameters={[{ name: "value", type: { children: "str" } }]}
 * >
 *   return len(value)
 * </MethodDeclaration>
 * ```
 * This will generate:
 * ```python
 * def my_method(self, value: str) -> int:
 *   return len(value)
 * ```
 *
 * @example Abstract method:
 * ```tsx
 * <MethodDeclaration
 *   name="abstract_method"
 *   abstract={true}
 *   returnType={{ children: "str" }}
 * />
 * ```
 * This will generate:
 * ```python
 * @abstractmethod
 * def abstract_method(self) -> str:
 *   pass
 * ```
 *
 * @remarks
 * This component automatically adds the `self` parameter as the first parameter
 * for instance methods. Set `abstract={true}` to generate an abstract method
 * with the `@abstractmethod` decorator. The method must be declared within a class.
 */

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

  /**
   * Indicates that the property is abstract.
   */
  abstract?: boolean;

  /**
   * Documentation for this declaration
   */
  doc?: Children;
}

/**
 * Declares a Python property with optional getter, setter, and deleter methods.
 *
 * @example
 * ```tsx
 * <PropertyDeclaration property={{ name: "name", type: "str" }}>
 *   return self._name
 * </PropertyDeclaration>
 * ```
 * This will generate:
 * ```python
 * @property
 * def name(self) -> str:
 *   return self._name
 * ```
 *
 * @example
 * With setter and deleter:
 * ```tsx
 * <PropertyDeclaration property={{ name: "value", type: "int" }}>
 *   return self._value
 *   <PropertyDeclaration.Setter type={{ children: [{ children: "int" }, { children: "float" }, { children: "str" }] }}>
 *     self._value = int(value)
 *   </PropertyDeclaration.Setter>
 *   <PropertyDeclaration.Deleter>
 *     del self._value
 *   </PropertyDeclaration.Deleter>
 * </PropertyDeclaration>
 * ```
 * This will generate:
 * ```python
 * @property
 * def value(self) -> int:
 *   return self._value
 *
 * @value.setter
 * def value(self, value: int | float | str) -> None:
 *   self._value = int(value)
 *
 * @value.deleter
 * def value(self) -> None:
 *   del self._value
 * ```
 *
 * @remarks
 * The property must be declared within a class. The getter method is automatically
 * generated with the `@property` decorator. Optional setter and deleter methods
 * can be added using the `PropertyDeclaration.Setter` and `PropertyDeclaration.Deleter`
 * child components.
 */
export function PropertyDeclaration(props: PropertyDeclarationProps) {
  // Utility function to format the children output
  // If we pass an empty array to a component, it will treat as if valid children
  // were passed, and thus "pass" will not be rendered.
  const nonEmptyOrNotImplemented = (
    children: Children | undefined,
  ): Children => {
    if (!children) return [code`raise NotImplementedError`];
    const childArray = childrenArray(() => children);
    return childArray.length > 0 ? children : [code`raise NotImplementedError`];
  };

  const children = childrenArray(() => props.children);
  const setterComponent =
    findKeyedChild(children, PropertyDeclaration.Setter.tag) ?? undefined;
  const deleterComponent =
    findKeyedChild(children, PropertyDeclaration.Deleter.tag) ?? undefined;

  const setterChildren = nonEmptyOrNotImplemented(
    setterComponent?.props?.children,
  );
  const deleterChildren = nonEmptyOrNotImplemented(
    deleterComponent?.props?.children,
  );
  const unkeyedChildren = nonEmptyOrNotImplemented(
    findUnkeyedChildren(children),
  );

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
        <PropertyContext.Provider value={props.property.type}>
          <List hardline enderPunctuation>
            <PropertyMethodDeclaration
              abstract={props.abstract}
            >
              <Show when={Boolean(props.doc)}>{props.doc}</Show>
              {unkeyedChildren}
            </PropertyMethodDeclaration>
            <Show when={Boolean(setterComponent)}>
              <PropertyDeclaration.Setter
                type={setterComponent?.props?.type ?? props.property.type}
                abstract={props.abstract}
                doc={setterComponent?.props.doc}
              >
                {setterChildren}
              </PropertyDeclaration.Setter>
            </Show>
            <Show when={Boolean(deleterComponent)}>
              <PropertyDeclaration.Deleter 
                abstract={props.abstract}
                doc={deleterComponent?.props.doc}
              >
                {deleterChildren}
              </PropertyDeclaration.Deleter>
            </Show>
          </List>
        </PropertyContext.Provider>
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
   * Indicates that the property is abstract.
   */
  abstract?: boolean;

  /**
   * Documentation for this declaration
   */
  doc?: Children;
}

/**
 * A Python property method declaration component.
 *
 * @remarks
 * This component is used within a PropertyDeclaration to define the getter method.
 * The property name is automatically obtained from the parent PropertyDeclaration context.
 * It automatically generates the `@property` decorator.
 *
 * @example
 * ```tsx
 * <PropertyMethodDeclaration>
 *   return self._my_property
 * </PropertyMethodDeclaration>
 * ```
 */
export function PropertyMethodDeclaration(
  props: PropertyMethodDeclarationProps,
) {
  const declarationContext = useContext(
    DeclarationContext,
  ) as PythonOutputSymbol;
  const propertyType = useContext(PropertyContext);

  const abstractMethod =
    props.abstract ? code`@${abcModule["."].abstractmethod}` : undefined;

  return (
    <>
      {code`@property`}
      <hbr />
      {abstractMethod}
      {abstractMethod && <hbr />}
      <MethodDeclarationBase
        {...props}
        name={declarationContext.name}
        functionType="instance"
        returnType={propertyType}
        sym={declarationContext}
      >
        {props.children}
      </MethodDeclarationBase>
    </>
  );
}



export function createPropertyMethodComponent<
  P extends { children?: any; type?: any; abstract?: boolean; doc?: Children },
>(tag: symbol) {
  return taggedComponent(tag, function Parameters(props: P) {
    const declarationContext = useContext(
      DeclarationContext,
    ) as PythonOutputSymbol;
    
    // Determine if this is a setter or deleter based on the tag
    const isSetter = tag === setterTag;
    const isDeleter = tag === deleterTag;
    
    // Special handling for setter which always needs a "value" parameter
    const parameters = isSetter ? [{ name: "value", type: props.type }] : undefined;
    
    const abstractMethod =
      props.abstract ? code`@${abcModule["."].abstractmethod}` : undefined;

    return (
      <>
        {isSetter && (
          <>
            {code`@${declarationContext.name}.setter`}
            <hbr />
          </>
        )}
        {isDeleter && (
          <>
            {code`@${declarationContext.name}.deleter`}
            <hbr />
          </>
        )}
        {abstractMethod}
        {abstractMethod && <hbr />}
        <MethodDeclarationBase
          {...props}
          name={declarationContext.name}
          functionType="instance"
          parameters={parameters}
          returnType={{ children: <Atom jsValue={null} /> }}
          sym={declarationContext}
        >
          {props.children}
        </MethodDeclarationBase>
      </>
    );
  });
}

PropertyDeclaration.Setter =
  createPropertyMethodComponent<PropertyMethodDeclarationProps & { type?: TypeExpressionProps }>(
    setterTag,
  );
PropertyDeclaration.Deleter =
  createPropertyMethodComponent<Omit<PropertyMethodDeclarationProps, "returnType">>(
    deleterTag,
  );

/**
 * A Python class method declaration component.
 *
 * @example
 * ```tsx
 * <ClassMethodDeclaration
 *   name="create_instance"
 *   returnType={{ children: "MyClass" }}
 *   parameters={[{ name: "value", type: { children: "str" } }]}
 * >
 *   return cls(value)
 * </ClassMethodDeclaration>
 * ```
 * This will generate:
 * ```python
 * @classmethod
 * def create_instance(cls, value: str) -> MyClass:
 *   return cls(value)
 * ```
 *
 * @remarks
 * This component automatically adds the `@classmethod` decorator and the `cls`
 * parameter as the first parameter. The method must be declared within a class.
 */
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

/**
 * A Python static method declaration component.
 *
 * @example
 * ```tsx
 * <StaticMethodDeclaration
 *   name="create_instance"
 *   returnType={{ children: "str" }}
 *   parameters={[{ name: "value", type: { children: "str" } }]}
 * >
 *   return value
 * </StaticMethodDeclaration>
 * ```
 * This will generate:
 * ```python
 * @staticmethod
 * def create_instance(value: str) -> str:
 *   return value
 * ```
 *
 * @remarks
 * This component automatically adds the `@staticmethod` decorator and the `cls`
 * parameter as the first parameter. The method must be declared within a class. It
 * does not have a `self` parameter.
 */
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
  extends FunctionDeclarationProps {}

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
 */
export function ConstructorDeclaration(props: ConstructorDeclarationProps) {
  // __new__ is a special method, as, despite having cls as the first parameter,
  // it isn't decorated with @classmethod.
  return (
    <NoNamePolicy>
      <MethodDeclarationBase {...props} name="__new__" functionType={"class"} />
    </NoNamePolicy>
  );
}
