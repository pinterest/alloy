import {
  Children,
  memo,
  Refkey,
  resolve,
  unresolvedRefkey,
  useContext,
} from "@alloy-js/core";
import { ThriftFileContext } from "../context/thrift-file-context.js";
import { ThriftOutputScope } from "./scopes.js";
import { ThriftFileScope } from "./scopes.js";
import { ThriftOutputSymbol } from "./thrift-output-symbol.js";

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
