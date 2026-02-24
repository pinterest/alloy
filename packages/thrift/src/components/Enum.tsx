import {
  Block,
  Children,
  Declaration,
  List,
  Name,
  Refkey,
  createNamedContext,
  useContext,
} from "@alloy-js/core";
import { useThriftNamePolicy } from "../name-policy.js";
import { createTypeSymbol } from "../symbols/factories.js";
import { DocWhen } from "./DocComment.js";

export interface EnumProps {
  name: string;
  refkey?: Refkey;
  children?: Children;
  doc?: Children;
}

export interface EnumValueProps {
  name: string;
  value?: number;
  doc?: Children;
}

interface EnumRegistry {
  register(name: string): void;
}

const EnumValueContext = createNamedContext<EnumRegistry | undefined>(
  "@alloy-js/thrift EnumValueContext",
);

/**
 * Define a Thrift enum.
 *
 * @remarks
 * Enum values must be unique within the enum.
 *
 * @example Basic enum
 * ```tsx
 * <Enum name="Role">
 *   <EnumValue name="ADMIN" value={1} />
 *   <EnumValue name="USER" value={2} />
 * </Enum>
 * ```
 */
export function Enum(props: EnumProps) {
  const symbol = createTypeSymbol(props.name, props.refkey);
  const registryNames = new Set<string>();
  const registry: EnumRegistry = {
    register(name) {
      if (registryNames.has(name)) {
        throw new Error(`Enum has duplicate value '${name}'.`);
      }
      registryNames.add(name);
    },
  };

  return (
    <>
      <DocWhen doc={props.doc} />
      <Declaration symbol={symbol}>
        enum <Name />{" "}
        <EnumValueContext.Provider value={registry}>
          <Block>
            <List comma hardline>
              {props.children}
            </List>
          </Block>
        </EnumValueContext.Provider>
      </Declaration>
    </>
  );
}

/**
 * Define a value inside a {@link Enum}.
 *
 * @remarks
 * This component must be used as a child of `Enum`.
 *
 * @example Enum value
 * ```tsx
 * <Enum name="Status">
 *   <EnumValue name="OK" value={0} />
 * </Enum>
 * ```
 */
export function EnumValue(props: EnumValueProps) {
  const registry = useContext(EnumValueContext);
  if (!registry) {
    throw new Error("EnumValue must be used inside an Enum.");
  }

  const name = useThriftNamePolicy().getName(props.name, "enum-value");
  registry.register(name);

  return (
    <>
      <DocWhen doc={props.doc} />
      {name}
      {props.value !== undefined ? ` = ${props.value}` : ""}
    </>
  );
}
