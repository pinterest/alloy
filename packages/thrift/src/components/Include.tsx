import { Children, useContext } from "@alloy-js/core";
import { ThriftFileContext } from "../context/thrift-file-context.js";

export interface IncludeProps {
  /** Path to the `.thrift` file to include. */
  path: string;
  /**
   * Override the default alias derived from the filename.
   *
   * @remarks
   * By default the alias is the filename without the `.thrift` extension
   * (e.g. `"shared.thrift"` becomes `"shared"`). Cross-file references use
   * this alias as a qualifier (e.g. `shared.UserType`).
   */
  alias?: string;
  children?: Children;
}

/**
 * Register a manual include.
 *
 * @remarks
 * Pass this as the `includes` prop of {@link SourceFile}. The component
 * registers the include in the file's include registry but renders no output
 * by itself — the `SourceFile` emits all `include` directives.
 *
 * Manual includes take precedence over auto-includes: if a refkey reference
 * would add the same path, the manual alias and source are preserved.
 *
 * @example Manual include
 * ```tsx
 * <SourceFile
 *   path="api.thrift"
 *   includes={<Include path="shared.thrift" alias="shared" />}
 * >
 *   <Service name="UserService">...</Service>
 * </SourceFile>
 * ```
 *
 * Produces:
 * ```thrift
 * include "shared.thrift"
 *
 * service UserService {
 * }
 * ```
 */
export function Include(props: IncludeProps) {
  const file = useContext(ThriftFileContext);
  if (!file) {
    throw new Error("Include must be used inside a Thrift SourceFile.");
  }

  file.registerInclude(props.path, { source: "manual", alias: props.alias });
  return null;
}
