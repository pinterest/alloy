import { Children, createContext, isComponentCreator, useContext } from "@alloy-js/core";
import { TypeReference, TypeReferenceProps } from "./TypeReference.js";

/**
 * Context to track if we're inside a @oneOf input object
 */
const OneOfInputContext = createContext<boolean>(false);

/**
 * Hook to check if we're inside a @oneOf input object
 */
export function useOneOfInputContext(): boolean {
  return useContext(OneOfInputContext) ?? false;
}

/**
 * Provider component to mark that we're inside a @oneOf input object
 */
export interface OneOfInputProviderProps {
  children: Children;
}

export function OneOfInputProvider(props: OneOfInputProviderProps) {
  return (
    <OneOfInputContext.Provider value={true}>
      {props.children}
    </OneOfInputContext.Provider>
  );
}

/**
 * Validates that a field type is nullable (doesn't end with !)
 * @param type - The type to check (must be a TypeReference component)
 * @param fieldName - The field name for error messaging
 * @throws {Error} If the type is non-nullable
 */
export function validateOneOfFieldNullable(
  type: Children,
  fieldName: string,
): void {
  if (isComponentCreator(type, TypeReference)) {
    const props = type.props as TypeReferenceProps;
    if (props.required) {
      throw new Error(
        `Input field "${fieldName}" in a @oneOf input object must be nullable. ` +
          `Remove the "!" or "required" from the type. `,
      );
    }
  }
}

/**
 * Validates that a field doesn't have a default value
 * @param defaultValue - The default value to check
 * @param fieldName - The field name for error messaging
 * @throws {Error} If a default value is provided
 */
export function validateOneOfFieldNoDefault(
  defaultValue: unknown,
  fieldName: string,
): void {
  if (defaultValue !== undefined) {
    throw new Error(
      `Input field "${fieldName}" in a @oneOf input object cannot have a default value. `,
    );
  }
}
