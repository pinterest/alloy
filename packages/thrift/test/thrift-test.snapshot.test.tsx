import { refkey } from "@alloy-js/core";
import { expect, it } from "vitest";
import {
  BlockComment,
  Const,
  Enum,
  EnumValue,
  Exception,
  Field,
  LineComment,
  Namespace,
  Service,
  ServiceFunction,
  SourceFile,
  Struct,
  Throws,
  Typedef,
  Union,
  binary,
  bool,
  constRef,
  double,
  i16,
  i32,
  i64,
  i8,
  listOf,
  mapOf,
  rawAnnotation,
  rawConst,
  setOf,
  string,
} from "../src/index.js";
import {
  SnapshotFile,
  lines,
  permissiveNamePolicy,
  renderThriftFiles,
} from "./snapshot-utils.jsx";

// Based on https://github.com/apache/thrift/blob/32776c0f46f5fd79b296391d66236c23b20af072/test/ThriftTest.thrift

const numberz = refkey();
const userId = refkey();
const mapType = refkey();
const bonk = refkey();
const bools = refkey();
const xtruct = refkey();
const xtruct2 = refkey();
const xtruct3 = refkey();
const insanity = refkey();
const crazyNesting = refkey();
const emptyStruct = refkey();
const oneField = refkey();
const versioningTestV1 = refkey();
const versioningTestV2 = refkey();
const listTypeVersioningV1 = refkey();
const listTypeVersioningV2 = refkey();
const guessProtocolStruct = refkey();
const largeDeltas = refkey();
const nestedListsI32x2 = refkey();
const nestedListsI32x3 = refkey();
const nestedMixedx2 = refkey();
const listBonks = refkey();
const nestedListsBonk = refkey();
const boolTest = refkey();
const structA = refkey();
const structB = refkey();
const optionalSetDefaultTest = refkey();
const optionalBinary = refkey();
const someUnion = refkey();
const xception = refkey();
const xception2 = refkey();
const thriftTest = refkey();
const secondService = refkey();

const thriftTestLicense = lines(`
  Licensed to the Apache Software Foundation (ASF) under one
  or more contributor license agreements. See the NOTICE file
  distributed with this work for additional information
  regarding copyright ownership. The ASF licenses this file
  to you under the Apache License, Version 2.0 (the
  "License"); you may not use this file except in compliance
  with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing,
  software distributed under the License is distributed on an
  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, either express or implied. See the License for the
  specific language governing permissions and limitations
  under the License.

  Contains some contributions under the Thrift Software License.
  Please see doc/old-thrift-license.txt in the Thrift distribution for
  details.
`);

const serviceDocs = {
  testVoid: lines(`
    Prints "testVoid()" and returns nothing.
  `),
  testString: lines(`
    Prints 'testString("%s")' with thing as '%s'
    @param string thing - the string to print
    @return string - returns the string 'thing'
  `),
  testBool: lines(`
    Prints 'testBool("%s")' where '%s' with thing as 'true' or 'false'
    @param bool  thing - the bool data to print
    @return bool  - returns the bool 'thing'
  `),
  testByte: lines(`
    Prints 'testByte("%d")' with thing as '%d'
    The types i8 and byte are synonyms, use of i8 is encouraged, byte still exists for the sake of compatibility.
    @param byte thing - the i8/byte to print
    @return i8 - returns the i8/byte 'thing'
  `),
  testI32: lines(`
    Prints 'testI32("%d")' with thing as '%d'
    @param i32 thing - the i32 to print
    @return i32 - returns the i32 'thing'
  `),
  testI64: lines(`
    Prints 'testI64("%d")' with thing as '%d'
    @param i64 thing - the i64 to print
    @return i64 - returns the i64 'thing'
  `),
  testDouble: lines(`
    Prints 'testDouble("%f")' with thing as '%f'
    @param double thing - the double to print
    @return double - returns the double 'thing'
  `),
  testBinary: lines(`
    Prints 'testBinary("%s")' where '%s' is a hex-formatted string of thing's data
    @param binary  thing - the binary data to print
    @return binary  - returns the binary 'thing'
  `),
  testUuid: lines(`
    Prints 'testUuid("%s")' where '%s' is the uuid given. Note that the uuid byte order should be correct.
    @param uuid  thing - the uuid to print
    @return uuid  - returns the uuid 'thing'
  `),
  testStruct: lines(`
    Prints 'testStruct("{%s}")' where thing has been formatted into a string of comma separated values
    @param Xtruct thing - the Xtruct to print
    @return Xtruct - returns the Xtruct 'thing'
  `),
  testNest: lines(`
    Prints 'testNest("{%s}")' where thing has been formatted into a string of the nested struct
    @param Xtruct2 thing - the Xtruct2 to print
    @return Xtruct2 - returns the Xtruct2 'thing'
  `),
  testMap: lines(`
    Prints 'testMap("{%s")' where thing has been formatted into a string of 'key => value' pairs
     separated by commas and new lines
    @param map<i32,i32> thing - the map<i32,i32> to print
    @return map<i32,i32> - returns the map<i32,i32> 'thing'
  `),
  testStringMap: lines(`
    Prints 'testStringMap("{%s}")' where thing has been formatted into a string of 'key => value' pairs
     separated by commas and new lines
    @param map<string,string> thing - the map<string,string> to print
    @return map<string,string> - returns the map<string,string> 'thing'
  `),
  testSet: lines(`
    Prints 'testSet("{%s}")' where thing has been formatted into a string of values
     separated by commas and new lines
    @param set<i32> thing - the set<i32> to print
    @return set<i32> - returns the set<i32> 'thing'
  `),
  testList: lines(`
    Prints 'testList("{%s}")' where thing has been formatted into a string of values
     separated by commas and new lines
    @param list<i32> thing - the list<i32> to print
    @return list<i32> - returns the list<i32> 'thing'
  `),
  testEnum: lines(`
    Prints 'testEnum("%d")' where thing has been formatted into its numeric value
    @param Numberz thing - the Numberz to print
    @return Numberz - returns the Numberz 'thing'
  `),
  testTypedef: lines(`
    Prints 'testTypedef("%d")' with thing as '%d'
    @param UserId thing - the UserId to print
    @return UserId - returns the UserId 'thing'
  `),
  testMapMap: lines(`
    Prints 'testMapMap("%d")' with hello as '%d'
    @param i32 hello - the i32 to print
    @return map<i32,map<i32,i32>> - returns a dictionary with these values:
      {-4 => {-4 => -4, -3 => -3, -2 => -2, -1 => -1, }, 4 => {1 => 1, 2 => 2, 3 => 3, 4 => 4, }, }
  `),
  testInsanity: lines(`
    So you think you've got this all worked out, eh?

    Creates a map with these values and prints it out:
      { 1 => { 2 => argument,
               3 => argument,
             },
        2 => { 6 => <empty Insanity struct>, },
      }
    @return map<UserId, map<Numberz,Insanity>> - a map with the above values
  `),
  testMulti: lines(`
    Prints 'testMulti()'
    @param i8 arg0 -
    @param i32 arg1 -
    @param i64 arg2 -
    @param map<i16, string> arg3 -
    @param Numberz arg4 -
    @param UserId arg5 -
    @return Xtruct - returns an Xtruct with string_thing = "Hello2, byte_thing = arg0, i32_thing = arg1
       and i64_thing = arg2
  `),
  testException: lines(`
    Print 'testException(%s)' with arg as '%s'
    @param string arg - a string indication what type of exception to throw
    if arg == "Xception" throw Xception with errorCode = 1001 and message = arg
    else if arg == "TException" throw TException
    else do not throw anything
  `),
  testMultiException: lines(`
    Print 'testMultiException(%s, %s)' with arg0 as '%s' and arg1 as '%s'
    @param string arg - a string indicating what type of exception to throw
    if arg0 == "Xception" throw Xception with errorCode = 1001 and message = "This is an Xception"
    else if arg0 == "Xception2" throw Xception2 with errorCode = 2002 and struct_thing.string_thing = "This is an Xception2"
    else do not throw anything
    @return Xtruct - an Xtruct with string_thing = arg1
  `),
  testOneway: lines(`
    Print 'testOneway(%d): Sleeping...' with secondsToSleep as '%d'
    sleep 'secondsToSleep'
    Print 'testOneway(%d): done sleeping!' with secondsToSleep as '%d'
    @param i32 secondsToSleep - the number of seconds to sleep
  `),
  secondtestString: lines(`
    Prints 'testString("%s")' with thing as '%s'
    @param string thing - the string to print
    @return string - returns the string 'thing'
  `),
};

export const files: SnapshotFile[] = [
  {
    path: "ThriftTest.thrift",
    file: (
      <SourceFile
        path="ThriftTest.thrift"
        namePolicy={permissiveNamePolicy}
        header={<BlockComment>{thriftTestLicense}</BlockComment>}
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
          <Namespace
            lang="xsd"
            value="test"
            annotations={{
              uri: rawAnnotation("'http://thrift.apache.org/ns/ThriftTest'"),
            }}
          />,
          <>
            <hbr />
            <LineComment>
              Presence of namespaces and sub-namespaces for which there is
            </LineComment>
            <LineComment>
              no generator should compile with warnings only
            </LineComment>
          </>,
          <Namespace lang="noexist" value="ThriftTest" />,
          <Namespace lang="cpp.noexist" value="ThriftTest" />,
          <>
            <hbr />
            <Namespace lang="*" value="thrift.test" />
          </>,
        ]}
      >
        <Enum name="Numberz" refkey={numberz} doc="Docstring!">
          <EnumValue name="ONE" value={1} />
          <EnumValue name="TWO" value={2} />
          <EnumValue name="THREE" value={3} />
          <EnumValue name="FIVE" value={5} />
          <EnumValue name="SIX" value={6} />
          <EnumValue name="EIGHT" value={8} />
        </Enum>
        <Const
          name="myNumberz"
          type={numberz}
          value={constRef("Numberz.ONE")}
        />
        <LineComment>
          {lines(`
            the following is expected to fail:
            const Numberz urNumberz = ONE;
          `)}
        </LineComment>
        <Typedef name="UserId" type={i64} refkey={userId} />
        <Struct name="Bonk" refkey={bonk}>
          <Field id={1} type={string} name="message" />
          <Field id={2} type={i32} name="type" />
        </Struct>
        <Typedef name="MapType" type={mapOf(string, bonk)} refkey={mapType} />
        <Struct name="Bools" refkey={bools}>
          <Field id={1} type={bool} name="im_true" />
          <Field id={2} type={bool} name="im_false" />
        </Struct>
        <Struct name="Xtruct" refkey={xtruct}>
          <Field id={1} type={string} name="string_thing" />
          <Field id={4} type={i8} name="byte_thing" />
          <Field id={9} type={i32} name="i32_thing" />
          <Field id={11} type={i64} name="i64_thing" />
        </Struct>
        <Struct name="Xtruct2" refkey={xtruct2}>
          <Field
            id={1}
            type={i8}
            name="byte_thing"
            comment="used to be byte, hence the name"
          />
          <Field id={2} type={xtruct} name="struct_thing" />
          <Field id={3} type={i32} name="i32_thing" />
        </Struct>
        <Struct name="Xtruct3" refkey={xtruct3}>
          <Field id={1} type={string} name="string_thing" />
          <Field id={4} type={i32} name="changed" />
          <Field id={9} type={i32} name="i32_thing" />
          <Field id={11} type={i64} name="i64_thing" />
        </Struct>
        <Struct
          name="Insanity"
          refkey={insanity}
          annotations={{ "python.immutable": "" }}
        >
          <Field id={1} type={mapOf(numberz, userId)} name="userMap" />
          <Field id={2} type={listOf(xtruct)} name="xtructs" />
        </Struct>
        <Struct name="CrazyNesting" refkey={crazyNesting}>
          <Field id={1} type={string} name="string_field" />
          <Field id={2} optional type={setOf(insanity)} name="set_field" />
          <LineComment>
            Do not insert line break as test/go/Makefile.am is removing this
            line with pattern match
          </LineComment>
          <Field
            id={3}
            required
            type={listOf(
              mapOf(
                setOf(i32, { "python.immutable": "" }),
                mapOf(
                  i32,
                  setOf(
                    listOf(
                      mapOf(insanity, string, { "python.immutable": "" }),
                      { "python.immutable": "" },
                    ),
                  ),
                ),
              ),
            )}
            name="list_field"
          />
          <Field id={4} type={binary} name="binary_field" />
          <Field id={5} type="uuid" name="uuid_field" />
        </Struct>
        <Union name="SomeUnion" refkey={someUnion}>
          <Field id={1} type={mapOf(numberz, userId)} name="map_thing" />
          <Field id={2} type={string} name="string_thing" />
          <Field id={3} type={i32} name="i32_thing" />
          <Field id={4} type={xtruct3} name="xtruct_thing" />
          <Field id={5} type={insanity} name="insanity_thing" />
        </Union>
        <Exception name="Xception" refkey={xception}>
          <Field id={1} type={i32} name="errorCode" />
          <Field id={2} type={string} name="message" />
        </Exception>
        <Exception name="Xception2" refkey={xception2}>
          <Field id={1} type={i32} name="errorCode" />
          <Field id={2} type={xtruct} name="struct_thing" />
        </Exception>
        <Struct name="EmptyStruct" refkey={emptyStruct}></Struct>
        <Struct name="OneField" refkey={oneField}>
          <Field id={1} type={emptyStruct} name="field" />
        </Struct>
        <Service name="ThriftTest" refkey={thriftTest}>
          <>
            <hbr />
            <ServiceFunction
              name="testVoid"
              doc={serviceDocs.testVoid}
            ></ServiceFunction>
          </>
          <ServiceFunction
            name="testString"
            returnType={string}
            doc={serviceDocs.testString}
          >
            <Field id={1} type={string} name="thing" />
          </ServiceFunction>
          <ServiceFunction
            name="testBool"
            returnType={bool}
            doc={serviceDocs.testBool}
          >
            <Field id={1} type={bool} name="thing" />
          </ServiceFunction>
          <ServiceFunction
            name="testByte"
            returnType={i8}
            doc={serviceDocs.testByte}
          >
            <Field id={1} type={i8} name="thing" />
          </ServiceFunction>
          <ServiceFunction
            name="testI32"
            returnType={i32}
            doc={serviceDocs.testI32}
          >
            <Field id={1} type={i32} name="thing" />
          </ServiceFunction>
          <ServiceFunction
            name="testI64"
            returnType={i64}
            doc={serviceDocs.testI64}
          >
            <Field id={1} type={i64} name="thing" />
          </ServiceFunction>
          <ServiceFunction
            name="testDouble"
            returnType={double}
            doc={serviceDocs.testDouble}
          >
            <Field id={1} type={double} name="thing" />
          </ServiceFunction>
          <ServiceFunction
            name="testBinary"
            returnType={binary}
            doc={serviceDocs.testBinary}
          >
            <Field id={1} type={binary} name="thing" />
          </ServiceFunction>
          <ServiceFunction
            name="testUuid"
            returnType="uuid"
            doc={serviceDocs.testUuid}
          >
            <Field id={1} type="uuid" name="thing" />
          </ServiceFunction>
          <ServiceFunction
            name="testStruct"
            returnType={xtruct}
            doc={serviceDocs.testStruct}
          >
            <Field id={1} type={xtruct} name="thing" />
          </ServiceFunction>
          <ServiceFunction
            name="testNest"
            returnType={xtruct2}
            doc={serviceDocs.testNest}
          >
            <Field id={1} type={xtruct2} name="thing" />
          </ServiceFunction>
          <ServiceFunction
            name="testMap"
            returnType={mapOf(i32, i32)}
            doc={serviceDocs.testMap}
          >
            <Field id={1} type={mapOf(i32, i32)} name="thing" />
          </ServiceFunction>
          <ServiceFunction
            name="testStringMap"
            returnType={mapOf(string, string)}
            doc={serviceDocs.testStringMap}
          >
            <Field id={1} type={mapOf(string, string)} name="thing" />
          </ServiceFunction>
          <ServiceFunction
            name="testSet"
            returnType={setOf(i32)}
            doc={serviceDocs.testSet}
          >
            <Field id={1} type={setOf(i32)} name="thing" />
          </ServiceFunction>
          <ServiceFunction
            name="testList"
            returnType={listOf(i32)}
            doc={serviceDocs.testList}
          >
            <Field id={1} type={listOf(i32)} name="thing" />
          </ServiceFunction>
          <ServiceFunction
            name="testEnum"
            returnType={numberz}
            doc={serviceDocs.testEnum}
          >
            <Field id={1} type={numberz} name="thing" />
          </ServiceFunction>
          <ServiceFunction
            name="testTypedef"
            returnType={userId}
            doc={serviceDocs.testTypedef}
          >
            <Field id={1} type={userId} name="thing" />
          </ServiceFunction>
          <ServiceFunction
            name="testMapMap"
            returnType={mapOf(i32, mapOf(i32, i32))}
            doc={serviceDocs.testMapMap}
          >
            <Field id={1} type={i32} name="hello" />
          </ServiceFunction>
          <ServiceFunction
            name="testInsanity"
            returnType={mapOf(userId, mapOf(numberz, insanity))}
            doc={serviceDocs.testInsanity}
          >
            <Field id={1} type={insanity} name="argument" />
          </ServiceFunction>
          <ServiceFunction
            name="testMulti"
            returnType={xtruct}
            doc={serviceDocs.testMulti}
          >
            <Field id={1} type={i8} name="arg0" />
            <Field id={2} type={i32} name="arg1" />
            <Field id={3} type={i64} name="arg2" />
            <Field id={4} type={mapOf(i16, string)} name="arg3" />
            <Field id={5} type={numberz} name="arg4" />
            <Field id={6} type={userId} name="arg5" />
          </ServiceFunction>
          <ServiceFunction name="testException" doc={serviceDocs.testException}>
            <Field id={1} type={string} name="arg" />
            <Throws>
              <Field id={1} type={xception} name="err1" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="testMultiException"
            returnType={xtruct}
            doc={serviceDocs.testMultiException}
          >
            <Field id={1} type={string} name="arg0" />
            <Field id={2} type={string} name="arg1" />
            <Throws>
              <Field id={1} type={xception} name="err1" />
              <Field id={2} type={xception2} name="err2" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="testOneway"
            oneway
            doc={serviceDocs.testOneway}
          >
            <Field id={1} type={i32} name="secondsToSleep" />
          </ServiceFunction>
        </Service>
        <Service name="SecondService" refkey={secondService}>
          <>
            <hbr />
            <ServiceFunction
              name="secondtestString"
              returnType={string}
              doc={serviceDocs.secondtestString}
            >
              <Field id={1} type={string} name="thing" />
            </ServiceFunction>
          </>
        </Service>
        <Struct name="VersioningTestV1" refkey={versioningTestV1}>
          <Field id={1} type={i32} name="begin_in_both" />
          <Field id={3} type={string} name="old_string" />
          <Field id={12} type={i32} name="end_in_both" />
        </Struct>
        <Struct name="VersioningTestV2" refkey={versioningTestV2}>
          <Field id={1} type={i32} name="begin_in_both" />
          <>
            <hbr />
            <Field id={2} type={i32} name="newint" />
          </>
          <Field id={3} type={i8} name="newbyte" />
          <Field id={4} type={i16} name="newshort" />
          <Field id={5} type={i64} name="newlong" />
          <Field id={6} type={double} name="newdouble" />
          <Field id={7} type={bonk} name="newstruct" />
          <Field id={8} type={listOf(i32)} name="newlist" />
          <Field id={9} type={setOf(i32)} name="newset" />
          <Field id={10} type={mapOf(i32, i32)} name="newmap" />
          <Field id={11} type={string} name="newstring" />
          <Field id={12} type={i32} name="end_in_both" />
        </Struct>
        <Struct name="ListTypeVersioningV1" refkey={listTypeVersioningV1}>
          <Field id={1} type={listOf(i32)} name="myints" />
          <Field id={2} type={string} name="hello" />
        </Struct>
        <Struct name="ListTypeVersioningV2" refkey={listTypeVersioningV2}>
          <Field id={1} type={listOf(string)} name="strings" />
          <Field id={2} type={string} name="hello" />
        </Struct>
        <Struct name="GuessProtocolStruct" refkey={guessProtocolStruct}>
          <Field id={7} type={mapOf(string, string)} name="map_field" />
        </Struct>
        <Struct name="LargeDeltas" refkey={largeDeltas}>
          <Field id={1} type={bools} name="b1" />
          <Field id={10} type={bools} name="b10" />
          <Field id={100} type={bools} name="b100" />
          <Field id={500} type={bool} name="check_true" />
          <Field id={1000} type={bools} name="b1000" />
          <Field id={1500} type={bool} name="check_false" />
          <Field id={2000} type={versioningTestV2} name="vertwo2000" />
          <Field id={2500} type={setOf(string)} name="a_set2500" />
          <Field id={3000} type={versioningTestV2} name="vertwo3000" />
          <Field id={4000} type={listOf(i32)} name="big_numbers" />
        </Struct>
        <Struct name="NestedListsI32x2" refkey={nestedListsI32x2}>
          <Field id={1} type={listOf(listOf(i32))} name="integerlist" />
        </Struct>
        <Struct name="NestedListsI32x3" refkey={nestedListsI32x3}>
          <Field id={1} type={listOf(listOf(listOf(i32)))} name="integerlist" />
        </Struct>
        <Struct name="NestedMixedx2" refkey={nestedMixedx2}>
          <Field id={1} type={listOf(setOf(i32))} name="int_set_list" />
          <Field
            id={2}
            type={mapOf(i32, setOf(string))}
            name="map_int_strset"
          />
          <Field
            id={3}
            type={listOf(mapOf(i32, setOf(string)))}
            name="map_int_strset_list"
          />
        </Struct>
        <Struct name="ListBonks" refkey={listBonks}>
          <Field id={1} type={listOf(bonk)} name="bonk" />
        </Struct>
        <Struct name="NestedListsBonk" refkey={nestedListsBonk}>
          <Field id={1} type={listOf(listOf(listOf(bonk)))} name="bonk" />
        </Struct>
        <Struct name="BoolTest" refkey={boolTest}>
          <Field id={1} optional type={bool} name="b" default={true} />
          <Field id={2} optional type={string} name="s" default={"true"} />
        </Struct>
        <Struct name="StructA" refkey={structA}>
          <Field id={1} required type={string} name="s" />
        </Struct>
        <Struct name="StructB" refkey={structB}>
          <Field id={1} optional type={structA} name="aa" />
          <Field id={2} required type={structA} name="ab" />
        </Struct>
        <Struct name="OptionalSetDefaultTest" refkey={optionalSetDefaultTest}>
          <Field
            id={1}
            optional
            type={setOf(string)}
            name="with_default"
            default={["test"]}
          />
        </Struct>
        <Struct name="OptionalBinary" refkey={optionalBinary}>
          <Field
            id={1}
            optional
            type={setOf(binary)}
            name="bin_set"
            default={rawConst("{ }")}
          />
          <Field
            id={2}
            optional
            type={mapOf(binary, i32)}
            name="bin_map"
            default={rawConst("{ }")}
          />
        </Struct>
      </SourceFile>
    ),
  },
];

it("renders ThriftTest.thrift", () => {
  const output = renderThriftFiles(files);
  expect(output).toMatchSnapshot();
});
