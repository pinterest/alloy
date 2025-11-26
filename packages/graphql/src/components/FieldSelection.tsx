import { Children, Indent, List } from "@alloy-js/core";

export interface FieldSelectionProps {
  /**
   * The name of the field to select
   */
  name: string;
  /**
   * Optional alias for the field
   */
  alias?: string;
  /**
   * Arguments to pass to the field
   */
  arguments?: Children;
  /**
   * Directives to apply to this field selection
   */
  directives?: Children;
  /**
   * Nested field selections (selection set)
   */
  children?: Children;
}

/**
 * A field selection in a GraphQL operation.
 *
 * @example
 * ```tsx
 * // Simple field selection
 * <FieldSelection name="id" />
 * <FieldSelection name="name" />
 *
 * // Field with alias
 * <FieldSelection name="name" alias="userName" />
 *
 * // Field with arguments
 * <FieldSelection
 *   name="user"
 *   arguments={
 *     <Argument name="id" value="123" />
 *   }
 * >
 *   <FieldSelection name="id" />
 *   <FieldSelection name="name" />
 * </FieldSelection>
 *
 * // Field with variable argument
 * <FieldSelection
 *   name="user"
 *   arguments={
 *     <Argument name="id" value={<Variable name="userId" />} />
 *   }
 * >
 *   <FieldSelection name="id" />
 *   <FieldSelection name="email" />
 * </FieldSelection>
 * ```
 * renders to
 * ```graphql
 * id
 * name
 * userName: name
 * user(id: "123") {
 *   id
 *   name
 * }
 * user(id: $userId) {
 *   id
 *   email
 * }
 * ```
 */
export function FieldSelection(props: FieldSelectionProps) {
  const hasArguments = Boolean(props.arguments);
  const hasDirectives = Boolean(props.directives);
  const hasSelectionSet = Boolean(props.children);

  return (
    <>
      {props.alias && <>{props.alias}: </>}
      {props.name}
      {hasArguments && (
        <>
          (
          <List children={props.arguments} joiner=", " />)
        </>
      )}
      {hasDirectives && <>{props.directives}</>}
      {hasSelectionSet && (
        <>
          {" {"}
          <Indent hardline>
            <List children={props.children} joiner={<hardline />} />
          </Indent>
          <hardline />
          {"}"}
        </>
      )}
    </>
  );
}
