import { describe, expect, it } from "vitest";
import {
  Const,
  Enum,
  EnumValue,
  Exception,
  Field,
  Namespace,
  Service,
  ServiceFunction,
  SourceFile,
  Struct,
  Throws,
  Typedef,
  Union,
  listOf,
  mapOf,
  setOf,
} from "../src/index.js";
import {
  SnapshotFile,
  loadFixture,
  permissiveNamePolicy,
  renderThriftFiles,
} from "./snapshot-utils.jsx";

const files: SnapshotFile[] = [
  {
    path: "ThriftTest.thrift",
    file: (
      <SourceFile
        path="ThriftTest.thrift"
        namePolicy={permissiveNamePolicy}
        namespaces={[
          <Namespace lang="c_glib" value="TTest" />,
          <Namespace lang="cpp" value="thrift.test" />,
          <Namespace lang="delphi" value="Thrift.Test" />,
          <Namespace lang="go" value="thrifttest" />,
          <Namespace lang="java" value="thrift.test" />,
          <Namespace lang="js" value="ThriftTest" />,
          <Namespace lang="lua" value="ThriftTest" />,
          <Namespace lang="netstd" value="ThriftTest" />,
          <Namespace lang="perl" value="ThriftTest" />,
          <Namespace lang="php" value="ThriftTest" />,
          <Namespace lang="py" value="ThriftTest" />,
          <Namespace lang="py.twisted" value="ThriftTest" />,
          <Namespace lang="rb" value="Thrift.Test" />,
          <Namespace lang="st" value="ThriftTest" />,
          <Namespace lang="noexist" value="ThriftTest" />,
          <Namespace lang="cpp.noexist" value="ThriftTest" />,
        ]}
      >
        <Enum name="Numberz">
          <EnumValue name="ONE" value={1} />
          <EnumValue name="TWO" />
          <EnumValue name="THREE" />
          <EnumValue name="FIVE" value={5} />
          <EnumValue name="SIX" />
          <EnumValue name="EIGHT" value={8} />
        </Enum>
        <Typedef name="UserId" type="i64" />
        <Typedef name="MapType" type={mapOf("string", "Bonk")} />
        <Const name="myNumberz" type="Numberz" value={1} />
        <Struct name="Bonk">
          <Field id={1} type="string" name="message" />
          <Field id={2} type="i32" name="type" />
        </Struct>
        <Struct name="Bools">
          <Field id={1} type="bool" name="im_true" />
          <Field id={2} type="bool" name="im_false" />
        </Struct>
        <Struct name="Xtruct">
          <Field id={1} type="string" name="string_thing" />
          <Field id={4} type="i8" name="byte_thing" />
          <Field id={9} type="i32" name="i32_thing" />
          <Field id={11} type="i64" name="i64_thing" />
        </Struct>
        <Struct name="Xtruct2">
          <Field id={1} type="i8" name="byte_thing" />
          <Field id={2} type="Xtruct" name="struct_thing" />
          <Field id={3} type="i32" name="i32_thing" />
        </Struct>
        <Struct name="Xtruct3">
          <Field id={1} type="string" name="string_thing" />
          <Field id={4} type="i32" name="changed" />
          <Field id={9} type="i32" name="i32_thing" />
          <Field id={11} type="i64" name="i64_thing" />
        </Struct>
        <Struct name="Insanity">
          <Field id={1} type={mapOf("Numberz", "UserId")} name="userMap" />
          <Field id={2} type={listOf("Xtruct")} name="xtructs" />
        </Struct>
        <Struct name="CrazyNesting">
          <Field id={1} type="string" name="string_field" />
          <Field
            id={2}
            required={false}
            type={setOf("Insanity")}
            name="set_field"
          />
          <Field
            id={3}
            required
            type={listOf(
              mapOf(
                setOf("i32", { "python.immutable": "" }),
                mapOf(
                  "i32",
                  setOf(
                    listOf(
                      mapOf("Insanity", "string", { "python.immutable": "" }),
                      { "python.immutable": "" },
                    ),
                  ),
                ),
              ),
            )}
            name="list_field"
          />
          <Field id={4} type="binary" name="binary_field" />
          <Field id={5} type="uuid" name="uuid_field" />
        </Struct>
        <Struct name="EmptyStruct"></Struct>
        <Struct name="OneField">
          <Field id={1} type="EmptyStruct" name="field" />
        </Struct>
        <Struct name="VersioningTestV1">
          <Field id={1} type="i32" name="begin_in_both" />
          <Field id={3} type="string" name="old_string" />
          <Field id={12} type="i32" name="end_in_both" />
        </Struct>
        <Struct name="VersioningTestV2">
          <Field id={1} type="i32" name="begin_in_both" />
          <Field id={2} type="i32" name="newint" />
          <Field id={3} type="i8" name="newbyte" />
          <Field id={4} type="i16" name="newshort" />
          <Field id={5} type="i64" name="newlong" />
          <Field id={6} type="double" name="newdouble" />
          <Field id={7} type="Bonk" name="newstruct" />
          <Field id={8} type={listOf("i32")} name="newlist" />
          <Field id={9} type={setOf("i32")} name="newset" />
          <Field id={10} type={mapOf("i32", "i32")} name="newmap" />
          <Field id={11} type="string" name="newstring" />
          <Field id={12} type="i32" name="end_in_both" />
        </Struct>
        <Struct name="ListTypeVersioningV1">
          <Field id={1} type={listOf("i32")} name="myints" />
          <Field id={2} type="string" name="hello" />
        </Struct>
        <Struct name="ListTypeVersioningV2">
          <Field id={1} type={listOf("string")} name="strings" />
          <Field id={2} type="string" name="hello" />
        </Struct>
        <Struct name="GuessProtocolStruct">
          <Field id={7} type={mapOf("string", "string")} name="map_field" />
        </Struct>
        <Struct name="LargeDeltas">
          <Field id={1} type="Bools" name="b1" />
          <Field id={10} type="Bools" name="b10" />
          <Field id={100} type="Bools" name="b100" />
          <Field id={500} type="bool" name="check_true" />
          <Field id={1000} type="Bools" name="b1000" />
          <Field id={1500} type="bool" name="check_false" />
          <Field id={2000} type="VersioningTestV2" name="vertwo2000" />
          <Field id={2500} type={setOf("string")} name="a_set2500" />
          <Field id={3000} type="VersioningTestV2" name="vertwo3000" />
          <Field id={4000} type={listOf("i32")} name="big_numbers" />
        </Struct>
        <Struct name="NestedListsI32x2">
          <Field id={1} type={listOf(listOf("i32"))} name="integerlist" />
        </Struct>
        <Struct name="NestedListsI32x3">
          <Field
            id={1}
            type={listOf(listOf(listOf("i32")))}
            name="integerlist"
          />
        </Struct>
        <Struct name="NestedMixedx2">
          <Field id={1} type={listOf(setOf("i32"))} name="int_set_list" />
          <Field
            id={2}
            type={mapOf("i32", setOf("string"))}
            name="map_int_strset"
          />
          <Field
            id={3}
            type={listOf(mapOf("i32", setOf("string")))}
            name="map_int_strset_list"
          />
        </Struct>
        <Struct name="ListBonks">
          <Field id={1} type={listOf("Bonk")} name="bonk" />
        </Struct>
        <Struct name="NestedListsBonk">
          <Field id={1} type={listOf(listOf(listOf("Bonk")))} name="bonk" />
        </Struct>
        <Struct name="BoolTest">
          <Field id={1} required={false} type="bool" name="b" default={true} />
          <Field
            id={2}
            required={false}
            type="string"
            name="s"
            default={"true"}
          />
        </Struct>
        <Struct name="StructA">
          <Field id={1} required type="string" name="s" />
        </Struct>
        <Struct name="StructB">
          <Field id={1} required={false} type="StructA" name="aa" />
          <Field id={2} required type="StructA" name="ab" />
        </Struct>
        <Struct name="OptionalSetDefaultTest">
          <Field
            id={1}
            required={false}
            type={setOf("string")}
            name="with_default"
            default={["test"]}
          />
        </Struct>
        <Struct name="OptionalBinary">
          <Field
            id={1}
            required={false}
            type={setOf("binary")}
            name="bin_set"
            default={[]}
          />
          <Field
            id={2}
            required={false}
            type={mapOf("binary", "i32")}
            name="bin_map"
            default={[]}
          />
        </Struct>
        <Union name="SomeUnion">
          <Field
            id={1}
            required={false}
            type={mapOf("Numberz", "UserId")}
            name="map_thing"
          />
          <Field id={2} required={false} type="string" name="string_thing" />
          <Field id={3} required={false} type="i32" name="i32_thing" />
          <Field id={4} required={false} type="Xtruct3" name="xtruct_thing" />
          <Field
            id={5}
            required={false}
            type="Insanity"
            name="insanity_thing"
          />
        </Union>
        <Exception name="Xception">
          <Field id={1} type="i32" name="errorCode" />
          <Field id={2} type="string" name="message" />
        </Exception>
        <Exception name="Xception2">
          <Field id={1} type="i32" name="errorCode" />
          <Field id={2} type="Xtruct" name="struct_thing" />
        </Exception>
        <Service name="ThriftTest">
          <ServiceFunction name="testVoid"></ServiceFunction>
          <ServiceFunction name="testString" returnType="string">
            <Field id={1} type="string" name="thing" />
          </ServiceFunction>
          <ServiceFunction name="testBool" returnType="bool">
            <Field id={1} type="bool" name="thing" />
          </ServiceFunction>
          <ServiceFunction name="testByte" returnType="i8">
            <Field id={1} type="i8" name="thing" />
          </ServiceFunction>
          <ServiceFunction name="testI32" returnType="i32">
            <Field id={1} type="i32" name="thing" />
          </ServiceFunction>
          <ServiceFunction name="testI64" returnType="i64">
            <Field id={1} type="i64" name="thing" />
          </ServiceFunction>
          <ServiceFunction name="testDouble" returnType="double">
            <Field id={1} type="double" name="thing" />
          </ServiceFunction>
          <ServiceFunction name="testBinary" returnType="binary">
            <Field id={1} type="binary" name="thing" />
          </ServiceFunction>
          <ServiceFunction name="testUuid" returnType="uuid">
            <Field id={1} type="uuid" name="thing" />
          </ServiceFunction>
          <ServiceFunction name="testStruct" returnType="Xtruct">
            <Field id={1} type="Xtruct" name="thing" />
          </ServiceFunction>
          <ServiceFunction name="testNest" returnType="Xtruct2">
            <Field id={1} type="Xtruct2" name="thing" />
          </ServiceFunction>
          <ServiceFunction name="testMap" returnType={mapOf("i32", "i32")}>
            <Field id={1} type={mapOf("i32", "i32")} name="thing" />
          </ServiceFunction>
          <ServiceFunction
            name="testStringMap"
            returnType={mapOf("string", "string")}
          >
            <Field id={1} type={mapOf("string", "string")} name="thing" />
          </ServiceFunction>
          <ServiceFunction name="testSet" returnType={setOf("i32")}>
            <Field id={1} type={setOf("i32")} name="thing" />
          </ServiceFunction>
          <ServiceFunction name="testList" returnType={listOf("i32")}>
            <Field id={1} type={listOf("i32")} name="thing" />
          </ServiceFunction>
          <ServiceFunction name="testEnum" returnType="Numberz">
            <Field id={1} type="Numberz" name="thing" />
          </ServiceFunction>
          <ServiceFunction name="testTypedef" returnType="UserId">
            <Field id={1} type="UserId" name="thing" />
          </ServiceFunction>
          <ServiceFunction
            name="testMapMap"
            returnType={mapOf("i32", mapOf("i32", "i32"))}
          >
            <Field id={1} type="i32" name="hello" />
          </ServiceFunction>
          <ServiceFunction
            name="testInsanity"
            returnType={mapOf("UserId", mapOf("Numberz", "Insanity"))}
          >
            <Field id={1} type="Insanity" name="argument" />
          </ServiceFunction>
          <ServiceFunction name="testMulti" returnType="Xtruct">
            <Field id={1} type="i8" name="arg0" />
            <Field id={2} type="i32" name="arg1" />
            <Field id={3} type="i64" name="arg2" />
            <Field id={4} type={mapOf("i16", "string")} name="arg3" />
            <Field id={5} type="Numberz" name="arg4" />
            <Field id={6} type="UserId" name="arg5" />
          </ServiceFunction>
          <ServiceFunction name="testException">
            <Field id={1} type="string" name="arg" />
            <Throws>
              <Field id={1} type="Xception" name="err1" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="testMultiException" returnType="Xtruct">
            <Field id={1} type="string" name="arg0" />
            <Field id={2} type="string" name="arg1" />
            <Throws>
              <Field id={1} type="Xception" name="err1" />
              <Field id={2} type="Xception2" name="err2" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="testOneway" oneway>
            <Field id={1} type="i32" name="secondsToSleep" />
          </ServiceFunction>
        </Service>
        <Service name="SecondService">
          <ServiceFunction name="secondtestString" returnType="string">
            <Field id={1} type="string" name="thing" />
          </ServiceFunction>
        </Service>
      </SourceFile>
    ),
  },
];

describe("Thrift snapshots", () => {
  it("renders ThriftTest.thrift", () => {
    const output = renderThriftFiles(files);

    expect(output).toEqual({
      "ThriftTest.thrift": loadFixture("ThriftTest.thrift"),
    });
    expect(output).toMatchSnapshot();
  });
});
