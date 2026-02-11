import { computed, emitSymbol, Refkey } from "@alloy-js/core";
import { isTypeRefContext } from "../context/type-ref-context.js";
import { ref } from "../symbols/index.js";

export interface ReferenceProps {
  refkey: Refkey;

  /**
   * Whether this is a reference to a type.
   *
   * @remarks
   * When true, the import will be guarded with `if TYPE_CHECKING:`.
   * If not specified, this is automatically determined by whether the
   * reference is inside a type annotation context (e.g., return type,
   * parameter type).
   */
  type?: boolean;
}

/**
 * A Python reference to a symbol, such as a variable, function, or class.
 *
 * @remarks
 * This component is used to render references to symbols in Python code.
 * It takes a `refkey` prop which is the key of the symbol to reference.
 *
 * When used inside a type annotation context (or with `type={true}`),
 * the import will be placed inside a `if TYPE_CHECKING:` block.
 */
export function Reference({ refkey, type }: ReferenceProps) {
  const inTypeRef = isTypeRefContext();
  const reference = ref(refkey, { type: type ?? inTypeRef });
  const symbolRef = computed(() => reference()[1]);

  emitSymbol(symbolRef);
  return <>{reference()[0]}</>;
}
