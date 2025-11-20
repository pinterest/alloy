import { Children, createContext, useContext } from "@alloy-js/core";
import { builtInDirectiveMetadata } from "../builtins/directives.js";
import { useGraphQLScope } from "../symbols/scopes.js";
import type { DirectiveLocation } from "./DirectiveDefinition.js";

export interface DirectivesProps {
  /**
   * The GraphQL location where these directives are being applied
   */
  location: DirectiveLocation;
  /**
   * The directive components to validate and render
   */
  children: Children;
}

interface DirectiveValidationContext {
  location: DirectiveLocation;
  usedDirectives: Map<string, number>;
}

const DirectiveValidationContext =
  createContext<DirectiveValidationContext | null>(null);

/**
 * Hook for directives to register themselves for validation
 */
export function runDirectiveValidation(
  directiveName: string,
  providedArgs?: Record<string, unknown>,
) {
  const context = useContext(DirectiveValidationContext);
  if (!context) {
    // No validation context, skip validation
    return;
  }

  // Get directive metadata
  const metadata = getDirectiveMetadata(directiveName);
  if (!metadata) {
    // Unknown directive, skip validation
    return;
  }

  // Check location validity
  if (!metadata.locations.includes(context.location)) {
    throw new Error(
      `Directive @${directiveName} cannot be used on ${context.location}. ` +
        `Valid locations: ${metadata.locations.join(", ")}`,
    );
  }

  // Check repeatability
  const currentCount = context.usedDirectives.get(directiveName) || 0;
  context.usedDirectives.set(directiveName, currentCount + 1);

  if (!metadata.repeatable && currentCount > 0) {
    throw new Error(
      `Directive @${directiveName} is not repeatable and has been used multiple times on this ${context.location}`,
    );
  }

  // Validate arguments if metadata is available
  if (metadata.arguments) {
    validateDirectiveArguments(
      directiveName,
      providedArgs || {},
      metadata.arguments,
    );
  }
}

/**
 * A wrapper component that validates directives are used correctly.
 *
 * This component ensures that:
 * - Directives are only used in valid locations as defined in their schema
 * - Non-repeatable directives are not applied multiple times
 * - Required arguments are provided
 * - No unknown arguments are passed
 *
 * @remarks
 * This component should wrap all directive usage in GraphQL components.
 * It will throw an error during code generation if validation fails,
 * preventing invalid schemas from being generated.
 *
 * @example
 * ```tsx
 * <Directives location="FIELD_DEFINITION">
 *   <Directive name="deprecated" args={{ reason: "Use newField" }} />
 *   <Directive name="auth" args={{ requires: "ADMIN" }} />
 * </Directives>
 * ```
 *
 * @throws \{Error\} If a directive is used in an invalid location
 * @throws \{Error\} If a non-repeatable directive is used multiple times
 * @throws \{Error\} If required arguments are missing
 * @throws \{Error\} If unknown arguments are provided
 */
export function Directives(props: DirectivesProps) {
  const context: DirectiveValidationContext = {
    location: props.location,
    usedDirectives: new Map(),
  };

  return (
    <DirectiveValidationContext.Provider value={context}>
      {props.children}
    </DirectiveValidationContext.Provider>
  );
}

/**
 * Metadata for directive arguments
 */
export interface DirectiveArgumentMetadata {
  name: string;
  required: boolean;
}

/**
 * Gets directive metadata from built-in directives or custom directive definitions
 */
function getDirectiveMetadata(directiveName: string): {
  locations: DirectiveLocation[];
  repeatable: boolean;
  arguments?: DirectiveArgumentMetadata[];
} | null {
  // Check built-in directives first
  // All built-in directives are non-repeatable
  if (builtInDirectiveMetadata[directiveName]) {
    return {
      locations: builtInDirectiveMetadata[directiveName].locations,
      repeatable: false,
      // Built-in directives don't enforce required arguments in this implementation
      arguments: undefined,
    };
  }

  // Look up custom directives in the current scope
  const scope = useGraphQLScope();
  if (!scope) {
    return null;
  }

  // Search through the scope hierarchy for the directive definition
  let currentScope = scope;
  while (currentScope) {
    // Check if this scope has a symbols space (lexical scopes do, member scopes don't)
    if ("symbols" in currentScope) {
      const symbol = currentScope.symbols.symbolNames.get(directiveName);
      if (
        symbol &&
        symbol.metadata.locations &&
        symbol.metadata.repeatable !== undefined
      ) {
        // Extract argument metadata from the symbol's members
        const argumentMetadata: DirectiveArgumentMetadata[] = [];
        for (const memberSpace of symbol.memberSpaces) {
          for (const argSymbol of memberSpace) {
            // Check if the argument type ends with ! (non-null = required)
            const typeStr = String(argSymbol.metadata.type || "");
            const required = typeStr.endsWith("!");
            argumentMetadata.push({
              name: String(argSymbol.name),
              required,
            });
          }
        }

        return {
          locations: symbol.metadata.locations as DirectiveLocation[],
          repeatable: symbol.metadata.repeatable as boolean,
          // Always return arguments array (empty if no arguments) to enable validation
          arguments: argumentMetadata,
        };
      }
    }

    // Move up to parent scope
    currentScope = currentScope.parent as any;
  }

  // Directive not found, skip validation
  return null;
}

/**
 * Validates directive arguments
 */
function validateDirectiveArguments(
  directiveName: string,
  providedArgs: Record<string, unknown>,
  expectedArgs: DirectiveArgumentMetadata[],
) {
  const providedArgNames = Object.keys(providedArgs);
  const expectedArgNames = expectedArgs.map((arg) => arg.name);

  // Check for missing required arguments
  const requiredArgs = expectedArgs.filter((arg) => arg.required);
  for (const requiredArg of requiredArgs) {
    if (!providedArgNames.includes(requiredArg.name)) {
      throw new Error(
        `Directive @${directiveName} is missing required argument "${requiredArg.name}"`,
      );
    }
  }

  // Check for unknown arguments
  for (const providedArgName of providedArgNames) {
    if (!expectedArgNames.includes(providedArgName)) {
      throw new Error(
        `Directive @${directiveName} does not accept argument "${providedArgName}". ` +
          `Valid arguments: ${expectedArgNames.join(", ") || "none"}`,
      );
    }
  }
}
