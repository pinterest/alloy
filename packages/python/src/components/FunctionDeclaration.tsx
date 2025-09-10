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
import {
  Atom,
  LexicalScope,
  NoNamePolicy,
  TypeExpressionProps,
} from "./index.js";

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

export interface FunctionDeclarationProps
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
 * parameters, and return types. It supports async functions, different function types
 * (regular, instance, class, static), and can reuse existing symbols. The function automatically
 * handles symbol creation and emission unless an existing symbol is provided. It also
 * automatically adds the appropriate first parameter (self, cls) based on the functionType.
 */
export function FunctionDeclaration(props: FunctionDeclarationProps) {
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

export interface MethodDeclarationBaseProps extends FunctionDeclarationProps {}

/**
 * A Python method declaration base component.
 *
 * @example
 * ```tsx
 * <MethodDeclarationBase
 *   name="my_method"
 *   returnType={{ children: "int" }}
 *   parameters={[{ name: "value", type: { children: "str" } }]}
 * >
 *   return len(value)
 * </MethodDeclarationBase>
 * ```
 * This will generate:
 * ```python
 * def my_method(self, value: str) -> int:
 *   return len(value)
 * ```
 *
 * @remarks
 * This is the base component for method declarations that handles validation
 * and ensures the method is declared within a class (member scope).
 */
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
  const nonEmptyOrUndefined = (
    children: Children | undefined,
  ): Children | undefined => {
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
  const deleterChildren = nonEmptyOrUndefined(
    deleterComponent?.props?.children,
  );
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
            <SetterPropertyMethodDeclaration
              type={setterComponent?.props?.type ?? props.property.type}
            >
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

/**
 * A Python property method declaration component.
 *
 * @example
 * ```tsx
 * <PropertyMethodDeclaration
 *   name="my_property"
 *   returnType={{ children: "int" }}
 * >
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

export interface SetterPropertyMethodDeclarationProps
  extends PropertyMethodDeclarationProps {
  /**
   * The type of the property. Overrides the PropertyDeclaration type.
   */
  type?: TypeExpressionProps;
}

/**
 * A Python property setter method declaration.
 *
 * @example
 * ```tsx
 * <py.SetterPropertyMethodDeclaration type={{ children: "int" }}>
 *   {py.code`self._value = value`}
 * </py.SetterPropertyMethodDeclaration>
 * ```
 * This will generate:
 * ```python
 * @property_name.setter
 * def property_name(self, value: int) -> None:
 *     self._value = value
 * ```
 *
 * @remarks
 * This component is used within a PropertyDeclaration to define the setter method
 * for a Python property. It automatically generates the appropriate decorator and
 * method signature with a 'value' parameter. The setter method should contain the
 * logic to set the property value.
 */
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

export interface DeleterPropertyMethodDeclarationProps
  extends Omit<PropertyMethodDeclarationProps, "returnType"> {}

/**
 * A Python property deleter method declaration.
 *
 * @example
 * ```tsx
 * <py.DeleterPropertyMethodDeclaration>
 *   {py.code`del self._value`}
 * </py.DeleterPropertyMethodDeclaration>
 * ```
 * This will generate:
 * ```python
 * @property_name.deleter
 * def property_name(self):
 *     del self._value
 * ```
 *
 * @remarks
 * This component is used within a PropertyDeclaration to define the deleter method
 * for a Python property. It automatically generates the appropriate decorator and
 * method signature. The deleter method should contain the logic to delete the property.
 */
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

export function createPropertyMethodComponent<
  P extends { children?: any; type?: any },
>(tag: symbol) {
  return taggedComponent(tag, function Parameters(props: P) {
    const declarationContext = useContext(
      DeclarationContext,
    ) as PythonOutputSymbol;
    if (props.children) {
      return props.children;
    }

    // Special handling for setter which needs a "value" parameter with the specified type
    const parameters =
      props.type ? [{ name: "value", type: props.type }] : undefined;

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
  });
}

PropertyDeclaration.Setter =
  createPropertyMethodComponent<SetterPropertyMethodDeclarationProps>(
    setterTag,
  );
PropertyDeclaration.Deleter =
  createPropertyMethodComponent<DeleterPropertyMethodDeclarationProps>(
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
 */
export function ConstructorDeclaration(props: ConstructorDeclarationProps) {
  // __new__ is a special method, as, despite having cls as the first parameter,
  // it isn't decorated with @classmethod.
  return (
    <NoNamePolicy>
      <MethodDeclaration {...props} name="__new__" functionType={"class"} />
    </NoNamePolicy>
  );
}
