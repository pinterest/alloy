import {
  Children,
  memo,
  Refkey,
  resolve,
  unresolvedRefkey,
  useContext,
} from "@alloy-js/core";
import { ThriftFileContext } from "../context/thrift-file-context.js";
import { ThriftFileScope, ThriftOutputScope } from "./scopes.js";
import { ThriftOutputSymbol } from "./thrift-output-symbol.js";

/**
 * Resolve a refkey to a Thrift symbol reference.
 *
 * @remarks
 * Returns a memo that lazily resolves the refkey. When the target symbol lives
 * in a different file, the resolver automatically registers an `include`
 * directive in the current file and returns a qualified name
 * (e.g. `shared.UserType`). For same-file references, the bare name is returned.
 *
 * If the refkey cannot be resolved, the unresolved refkey placeholder is
 * returned.
 *
 * @param refkey - The refkey to resolve.
 * @returns A memo function returning a `[renderedName, symbol]` tuple.
 */
export function ref(
  refkey: Refkey,
): () => [Children, ThriftOutputSymbol | undefined] {
  const sourceFile = useContext(ThriftFileContext);
  const resolveResult = resolve<ThriftOutputScope, ThriftOutputSymbol>(
    refkey as Refkey,
  );

  return memo(() => {
    if (resolveResult.value === undefined) {
      return [unresolvedRefkey(refkey), undefined];
    }

    const { lexicalDeclaration, pathDown, symbol } = resolveResult.value;

    const targetFileScope =
      pathDown[0] instanceof ThriftFileScope ? pathDown[0] : undefined;

    if (sourceFile && targetFileScope && targetFileScope !== sourceFile.scope) {
      const include = sourceFile.registerInclude(targetFileScope.filePath, {
        source: "auto",
      });
      return [`${include.alias}.${lexicalDeclaration.name}`, symbol];
    }

    return [lexicalDeclaration.name, symbol];
  });
}
