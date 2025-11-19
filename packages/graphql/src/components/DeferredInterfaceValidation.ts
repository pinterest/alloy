import { Children, isRefkey, Refkey } from "@alloy-js/core";
import { GraphQLOutputSymbol } from "../symbols/graphql-output-symbol.js";
import { ref } from "../symbols/reference.js";

interface FieldInfo {
  name: string;
  type: string;
  args: Array<{ name: string; type: string }>;
}

interface ResolvedInterface {
  name: string;
  symbol: GraphQLOutputSymbol;
}

interface PendingValidation {
  typeName: string;
  typeSymbol: GraphQLOutputSymbol;
  interfaces: ResolvedInterface[];
}

// Global registry for types that need validation
const pendingValidations: PendingValidation[] = [];
const validationErrors: Error[] = [];

/**
 * Extract field information from a symbol's member space
 * Note: symbolNames map values are actually OutputSymbol objects, not refkeys
 */
function extractFieldInfo(symbol: GraphQLOutputSymbol): FieldInfo[] {
  const fields: FieldInfo[] = [];

  // Iterate through member names and their symbols
  // The map values are OutputSymbol objects, not refkeys
  for (const [fieldName, fieldSymbol] of symbol.members.symbolNames.entries()) {
    try {
      // fieldSymbol is already an OutputSymbol, not a refkey
      if (fieldSymbol && (fieldSymbol as any).metadata) {
        const metadata = (fieldSymbol as any).metadata;
        const type =
          metadata.type ? String(metadata.type).replace(/\s/g, "") : "";

        // Extract arguments from the field symbol's own members
        // Arguments are stored in fieldSymbol.members when rendered in the argScope
        const args: Array<{ name: string; type: string }> = [];
        const fieldMembers = (fieldSymbol as any).members;

        if (fieldMembers && fieldMembers.symbolNames) {
          // Iterate over arguments in the field's member space
          for (const [
            argName,
            argSymbol,
          ] of fieldMembers.symbolNames.entries()) {
            if (argSymbol && (argSymbol as any).metadata) {
              const argMetadata = (argSymbol as any).metadata;
              const argType =
                argMetadata.type ?
                  String(argMetadata.type).replace(/\s/g, "")
                : "";
              args.push({ name: argName, type: argType });
            }
          }
        }

        fields.push({
          name: fieldName,
          type,
          args,
        });
      }
    } catch (e) {
      // Skip fields that can't be processed
    }
  }

  return fields;
}

/**
 * Register a type for deferred interface implementation validation.
 * Resolves interface refkeys immediately while we're still in the render context with access to the binder.
 * Field extraction is deferred until validation time to ensure all members have been added.
 */
export function registerForValidation(
  typeName: string,
  symbol: GraphQLOutputSymbol,
  interfaces: Children[],
): void {
  // Resolve interfaces immediately while we have binder context, including transitive ones
  const resolvedInterfaces: ResolvedInterface[] = [];
  const seen = new Set<string>();

  function resolveInterfacesRecursively(interfaces: Children[]) {
    for (const iface of interfaces) {
      if (isRefkey(iface)) {
        try {
          const reference = ref(iface as Refkey);
          const [name, ifaceSymbol] = reference();
          const nameStr = String(name);

          if (ifaceSymbol && !seen.has(nameStr)) {
            seen.add(nameStr);

            resolvedInterfaces.push({
              name: nameStr,
              symbol: ifaceSymbol,
            });

            // Recursively resolve parent interfaces
            if (ifaceSymbol.metadata.implements) {
              const parentInterfaces = ifaceSymbol.metadata
                .implements as Children[];
              if (
                Array.isArray(parentInterfaces) &&
                parentInterfaces.length > 0
              ) {
                resolveInterfacesRecursively(parentInterfaces);
              }
            }
          }
        } catch (e) {
          // Skip interfaces that can't be resolved
        }
      }
    }
  }

  resolveInterfacesRecursively(interfaces);

  pendingValidations.push({
    typeName,
    typeSymbol: symbol,
    interfaces: resolvedInterfaces,
  });
}

/**
 * Run all pending interface implementation validations
 *
 * This is called automatically by the SourceFile component after rendering is complete.
 * Users don't need to call this manually - it's handled by the framework.
 *
 * Errors are collected rather than thrown, and can be retrieved with getValidationErrors().
 *
 * @internal
 */
export function runPendingValidations(): void {
  const validations = [...pendingValidations];
  pendingValidations.length = 0; // Clear for next render

  for (const { typeName, typeSymbol, interfaces } of validations) {
    // Extract field information now that all members have been added
    const typeFields = extractFieldInfo(typeSymbol);

    try {
      // Validate each resolved interface
      for (const {
        name: interfaceName,
        symbol: interfaceSymbol,
      } of interfaces) {
        const interfaceFields = extractFieldInfo(interfaceSymbol);
        validateTypeImplementsInterface(
          typeName,
          typeFields,
          interfaceName,
          interfaceFields,
        );
      }
    } catch (e) {
      if (e instanceof Error) {
        validationErrors.push(e);
      }
    }
  }
}

/**
 * Validates that a type correctly implements a single interface
 */
function validateTypeImplementsInterface(
  typeName: string,
  typeFields: FieldInfo[],
  interfaceName: string,
  interfaceFields: FieldInfo[],
): void {
  // Create a map of type fields for quick lookup
  const typeFieldMap = new Map(typeFields.map((f) => [f.name, f]));

  for (const interfaceField of interfaceFields) {
    const typeField = typeFieldMap.get(interfaceField.name);

    // Check if field exists
    if (!typeField) {
      throw new Error(
        `Type "${typeName}" must implement field "${interfaceField.name}" from interface "${interfaceName}".`,
      );
    }

    // Validate return types
    if (
      interfaceField.type &&
      typeField.type &&
      interfaceField.type !== typeField.type
    ) {
      throw new Error(
        `Type "${typeName}" field "${interfaceField.name}" return type must be "${interfaceField.type}" to match interface "${interfaceName}", but found "${typeField.type}".`,
      );
    }

    // Validate arguments
    if (interfaceField.args.length !== typeField.args.length) {
      throw new Error(
        `Type "${typeName}" field "${interfaceField.name}" must have ${interfaceField.args.length} argument(s) to match interface "${interfaceName}", but has ${typeField.args.length}.`,
      );
    }

    for (let i = 0; i < interfaceField.args.length; i++) {
      const interfaceArg = interfaceField.args[i];
      const typeArg = typeField.args[i];

      if (interfaceArg.name !== typeArg.name) {
        throw new Error(
          `Type "${typeName}" field "${interfaceField.name}" argument at position ${i + 1} must be named "${interfaceArg.name}" to match interface "${interfaceName}", but found "${typeArg.name}".`,
        );
      }

      if (interfaceArg.type !== typeArg.type) {
        throw new Error(
          `Type "${typeName}" field "${interfaceField.name}" argument "${interfaceArg.name}" must have type "${interfaceArg.type}" to match interface "${interfaceName}", but found "${typeArg.type}".`,
        );
      }
    }
  }
}

/**
 * Get all validation errors collected during the last validation run
 */
export function getValidationErrors(): Error[] {
  return [...validationErrors];
}

/**
 * Clear all pending validations and errors (useful for testing)
 */
export function clearPendingValidations(): void {
  pendingValidations.length = 0;
  validationErrors.length = 0;
}
