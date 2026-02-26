import { computed, emitSymbol, Refkey } from "@alloy-js/core";
import { ref } from "../symbols/reference.js";

export interface ReferenceProps {
  /** The refkey to resolve and render. */
  refkey: Refkey;
}

/**
 * Emit a reference to a refkey, adding includes as needed.
 *
 * @remarks
 * Use when referencing symbols defined in another file; the renderer will add
 * the appropriate `include` and namespace prefix.
 *
 * @example Cross-file reference
 * ```tsx
 * const userRef = refkey();
 *
 * <SourceFile path="user.thrift">
 *   <Struct name="User" refkey={userRef} />
 * </SourceFile>
 *
 * <SourceFile path="service.thrift">
 *   <Service name="UserService">
 *     <ServiceFunction name="getUser" returnType={userRef} />
 *   </Service>
 * </SourceFile>
 * ```
 */
export function Reference({ refkey }: ReferenceProps) {
  const reference = ref(refkey);
  const symbolRef = computed(() => reference()[1]);
  emitSymbol(symbolRef);
  return <>{reference()[0]}</>;
}
