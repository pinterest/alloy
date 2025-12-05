export interface VariableProps {
  /**
   * The name of the variable (without the $ prefix)
   */
  name: string;
}

/**
 * A variable reference in a GraphQL operation.
 *
 * @example
 * ```tsx
 * <Variable name="userId" />
 * <Variable name="limit" />
 * <Variable name="includeDeleted" />
 * ```
 * renders to
 * ```graphql
 * $userId
 * $limit
 * $includeDeleted
 * ```
 */
export function Variable(props: VariableProps) {
  return <>${props.name}</>;
}
