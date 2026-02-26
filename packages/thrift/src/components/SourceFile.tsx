import {
  Children,
  childrenArray,
  computed,
  SourceFile as CoreSourceFile,
  createScope,
  For,
  List,
  NamePolicy,
  NamePolicyContext,
  Scope,
  Show,
  SourceDirectoryContext,
  useContext,
} from "@alloy-js/core";
import { join } from "pathe";
import {
  createIncludeRegistry,
  ThriftFileContext,
} from "../context/thrift-file-context.js";
import { defaultThriftNamePolicy, ThriftNameKind } from "../name-policy.js";
import { ThriftFileScope } from "../symbols/scopes.js";
import { DocComment } from "./DocComment.js";
import { Reference } from "./Reference.js";

export interface SourceFileProps {
  /** Output file path, typically ending in `.thrift`. */
  path: string;
  /** Top-level declarations (structs, enums, services, etc.). */
  children?: Children;
  /**
   * Content placed at the very top of the file, before includes.
   *
   * @remarks
   * Useful for license headers or auto-generated file warnings.
   */
  header?: Children;
  /**
   * A doc comment rendered after the header and before includes.
   *
   * @remarks
   * Wrapped in a doc comment block automatically.
   */
  headerComment?: Children;
  /**
   * Manual {@link Include} components for this file.
   *
   * @remarks
   * Auto-includes from refkey references are merged with these. Manual
   * includes take precedence when both exist for the same path.
   */
  includes?: Children;
  /** {@link Namespace} directives placed after includes. */
  namespaces?: Children;
  /**
   * Override the default Thrift name policy for this file.
   *
   * @see {@link createThriftNamePolicy}
   */
  namePolicy?: NamePolicy<ThriftNameKind>;
}

/**
 * Define a Thrift source file.
 *
 * @remarks
 * The component lays out sections in the standard Thrift file order: header,
 * header comment, includes, namespaces, then top-level declarations. Includes
 * added automatically via refkey references are merged with explicit
 * {@link Include} components, sorted alphabetically, and deduplicated.
 *
 * @example Basic file
 * ```tsx
 * <SourceFile path="user.thrift">
 *   <Struct name="User">
 *     <Field id={1} type={i64} name="id" />
 *   </Struct>
 * </SourceFile>
 * ```
 *
 * Produces:
 * ```thrift
 * struct User {
 *   1: i64 id,
 * }
 * ```
 *
 * @example Includes and namespaces
 * ```tsx
 * <SourceFile
 *   path="api.thrift"
 *   includes={<Include path="shared.thrift" />}
 *   namespaces={<Namespace lang="js" value="example.api" />}
 * >
 *   <Service name="UserService">...</Service>
 * </SourceFile>
 * ```
 *
 * Produces:
 * ```thrift
 * include "shared.thrift"
 *
 * namespace js example.api
 *
 * service UserService {
 * }
 * ```
 */
export function SourceFile(props: SourceFileProps) {
  const directoryContext = useContext(SourceDirectoryContext)!;
  const scopeName = join(directoryContext.path, props.path);
  const scope = createScope(ThriftFileScope, scopeName, props.path);
  const { includes, registerInclude } = createIncludeRegistry();
  const namePolicy = props.namePolicy ?? defaultThriftNamePolicy;

  const namespaceChildren = computed(() =>
    childrenArray(() => props.namespaces, { preserveFragments: true }),
  );
  const headerChildren = computed(() =>
    childrenArray(() => props.header, { preserveFragments: true }),
  );
  const declarationChildren = computed(() =>
    childrenArray(() => props.children, { preserveFragments: true }),
  );

  const includeRecords = computed(() =>
    Array.from(includes.values()).sort((a, b) => a.path.localeCompare(b.path)),
  );

  const hasIncludes = computed(() => includeRecords.value.length > 0);
  const hasNamespaces = computed(() => namespaceChildren.value.length > 0);
  const hasHeader = computed(() => headerChildren.value.length > 0);
  const hasDeclarations = computed(() => declarationChildren.value.length > 0);
  return (
    <CoreSourceFile path={props.path} filetype="thrift" reference={Reference}>
      <NamePolicyContext.Provider value={namePolicy}>
        <ThriftFileContext.Provider
          value={{
            filePath: props.path,
            scope,
            includes,
            namePolicy,
            registerInclude,
          }}
        >
          <Show when={hasHeader.value}>
            <List hardline>{headerChildren.value}</List>
            <Show
              when={
                props.headerComment !== undefined ||
                hasIncludes.value ||
                hasNamespaces.value ||
                hasDeclarations.value
              }
            >
              <hbr />
              <hbr />
            </Show>
          </Show>
          {props.includes}
          <Show when={props.headerComment !== undefined}>
            <DocComment>{props.headerComment}</DocComment>
            <Show
              when={
                hasIncludes.value ||
                hasNamespaces.value ||
                hasDeclarations.value
              }
            >
              <hbr />
              <hbr />
            </Show>
          </Show>
          <Show when={hasIncludes.value}>
            <For each={includeRecords} hardline>
              {(record) => `include "${record.path}"`}
            </For>
            <Show when={hasNamespaces.value || hasDeclarations.value}>
              <hbr />
              <hbr />
            </Show>
          </Show>
          <Show when={hasNamespaces.value}>
            <List hardline>{namespaceChildren.value}</List>
            <Show when={hasDeclarations.value}>
              <hbr />
              <hbr />
            </Show>
          </Show>
          <Scope value={scope}>
            <Show when={hasDeclarations.value}>
              <List doubleHardline>{declarationChildren.value}</List>
            </Show>
          </Scope>
        </ThriftFileContext.Provider>
      </NamePolicyContext.Provider>
    </CoreSourceFile>
  );
}
