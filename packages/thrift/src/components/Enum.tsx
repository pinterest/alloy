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
  /** The name of the enum type. */
  name: string;
  /** Optional refkey for cross-file references to this enum. */
  refkey?: Refkey;
  /** {@link EnumValue} children defining the members of this enum. */
  children?: Children;
  /** Doc comment rendered above the enum declaration. */
  doc?: Children;
}

export interface EnumValueProps {
  /** The name of the enum member. */
  name: string;
  /**
   * The integer value assigned to this member.
   *
   * @remarks
   * Must be a 32-bit signed integer (-2147483648 to 2147483647). Values
   * must be unique within the enclosing enum.
   */
  value: number;
  /** Doc comment rendered above this enum value. */
  doc?: Children;
}

interface EnumRegistry {
  register(name: string, value: number): void;
}

const EnumValueContext = createNamedContext<EnumRegistry | undefined>(
  "@alloy-js/thrift EnumValueContext",
);

/**
 * Define a Thrift enum.
 *
 * @remarks
 * Both names and numeric values must be unique within the enum. Values must
 * be 32-bit signed integers.
 *
 * @example Basic enum
 * ```tsx
 * <Enum name="Role">
 *   <EnumValue name="ADMIN" value={1} />
 *   <EnumValue name="USER" value={2} />
 * </Enum>
 * ```
 *
 * Produces:
 * ```thrift
 * enum Role {
 *   ADMIN = 1,
 *   USER = 2,
 * }
 * ```
 */
export function Enum(props: EnumProps) {
  const symbol = createTypeSymbol(props.name, props.refkey);
  const registryNames = new Set<string>();
  const registryValues = new Set<number>();
  const registry: EnumRegistry = {
    register(name, value) {
      if (registryNames.has(name)) {
        throw new Error(`Enum has duplicate value '${name}'.`);
      }
      if (!Number.isInteger(value)) {
        throw new Error(`Enum value '${name}' must be an integer.`);
      }
      if (value < -2147483648 || value > 2147483647) {
        throw new Error(
          `Enum value '${name}' must be a 32-bit signed integer.`,
        );
      }
      if (registryValues.has(value)) {
        throw new Error(`Enum has duplicate value number ${value}.`);
      }
      registryNames.add(name);
      registryValues.add(value);
    },
  };

  return (
    <>
      <DocWhen doc={props.doc} />
      <Declaration symbol={symbol}>
        enum <Name />{" "}
        <EnumValueContext.Provider value={registry}>
          <Block>
            <List comma hardline enderPunctuation>
              {props.children}
            </List>
          </Block>
        </EnumValueContext.Provider>
      </Declaration>
    </>
  );
}

/**
 * Define a value inside an {@link Enum}.
 *
 * @remarks
 * Must be used as a child of {@link Enum}. The name is validated against the
 * active name policy, and both the name and numeric value are checked for
 * uniqueness within the parent enum.
 *
 * @example Enum values
 * ```tsx
 * <Enum name="Status">
 *   <EnumValue name="ACTIVE" value={0} />
 *   <EnumValue name="INACTIVE" value={1} />
 * </Enum>
 * ```
 *
 * Produces:
 * ```thrift
 * enum Status {
 *   ACTIVE = 0,
 *   INACTIVE = 1,
 * }
 * ```
 */
export function EnumValue(props: EnumValueProps) {
  const registry = useContext(EnumValueContext);
  if (!registry) {
    throw new Error("EnumValue must be used inside an Enum.");
  }

  const name = useThriftNamePolicy().getName(props.name, "enum-value");
  registry.register(name, props.value);

  return (
    <>
      <DocWhen doc={props.doc} />
      {name}
      {` = ${props.value}`}
    </>
  );
}
