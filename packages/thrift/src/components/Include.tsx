import { Children, useContext } from "@alloy-js/core";
import { ThriftFileContext } from "../context/thrift-file-context.js";

export interface IncludeProps {
  path: string;
  alias?: string;
  children?: Children;
}

/**
 * Register a manual include.
 *
 * @remarks
 * Intended to be used within {@link SourceFile} `includes`. This component
 * registers the include and renders no output by itself.
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
 */
export function Include(props: IncludeProps) {
  const file = useContext(ThriftFileContext);
  if (!file) {
    throw new Error("Include must be used inside a Thrift SourceFile.");
  }

  file.registerInclude(props.path, { source: "manual", alias: props.alias });
  return null;
}
