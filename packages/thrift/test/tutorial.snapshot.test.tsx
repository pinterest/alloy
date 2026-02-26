import { List, refkey } from "@alloy-js/core";
import { describe, expect, it } from "vitest";
import {
  BlockComment,
  Const,
  DocComment,
  Enum,
  EnumValue,
  Exception,
  Field,
  Include,
  LineComment,
  Namespace,
  Service,
  ServiceFunction,
  SourceFile,
  Struct,
  Throws,
  Typedef,
  i32,
  mapOf,
  rawConst,
  string,
} from "../src/index.js";
import {
  SnapshotFile,
  lines,
  permissiveNamePolicy,
  renderThriftFiles,
} from "./snapshot-utils.jsx";

// Based on https://github.com/apache/thrift/tree/32776c0f46f5fd79b296391d66236c23b20af072/tutorial

const operation = refkey();
const myInteger = refkey();
const work = refkey();
const invalidOperation = refkey();
const calculator = refkey();

const sharedStruct = refkey();
const sharedService = refkey();

const apacheLicense = lines(`
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
`);

const tutorialHeader = lines(`
  Thrift Tutorial
  Mark Slee (mcslee@facebook.com)

  This file aims to teach you how to use Thrift, in a .thrift file. Neato. The
  first thing to notice is that .thrift files support standard shell comments.
  This lets you make your thrift file executable and include your Thrift build
  step on the top line. And you can place comments like this anywhere you like.

  Before running this file, you will need to have installed the thrift compiler
  into /usr/local/bin.
`);

const typesDoc = lines(`
  The first thing to know about are types. The available types in Thrift are:

   bool        Boolean, one byte
   i8 (byte)   Signed 8-bit integer
   i16         Signed 16-bit integer
   i32         Signed 32-bit integer
   i64         Signed 64-bit integer
   double      64-bit floating point value
   string      String
   binary      Blob (byte array)
   map<t1,t2>  Map from one type to another
   list<t1>    Ordered list of one type
   set<t1>     Set of unique elements of one type

  Did you also notice that Thrift supports C style comments?
`);

const includeDoc = lines(`
  Thrift files can reference other Thrift files to include common struct
  and service definitions. These are found using the current path, or by
  searching relative to any paths specified with the -I compiler flag.

  Included objects are accessed using the name of the .thrift file as a
  prefix. i.e. shared.SharedObject
`);

const namespaceDoc = lines(`
  Thrift files can namespace, package, or prefix their output in various
  target languages.
`);

const typedefDoc = lines(`
  Thrift lets you do typedefs to get pretty names for your types. Standard
  C style here.
`);

const constDoc = lines(`
  Thrift also lets you define constants for use across languages. Complex
  types and structs are specified using JSON notation.
`);

const enumDoc = lines(`
  You can define enums, which are just 32 bit integers. Values are optional
  and start at 1 if not supplied, C style again.
`);

const structDoc = lines(`
  Structs are the basic complex data structures. They are comprised of fields
  which each have an integer identifier, a type, a symbolic name, and an
  optional default value.

  Fields can be declared "optional", which ensures they will not be included
  in the serialized output if they aren't set.  Note that this requires some
  manual management in some languages.
`);

const exceptionDoc = lines(`
  Structs can also be exceptions, if they are nasty.
`);

const serviceDoc = lines(`
  Ahh, now onto the cool part, defining a service. Services just need a name
  and can optionally inherit from another service using the extends keyword.
`);

const methodDefinitionDoc = lines(`
  A method definition looks like C code. It has a return type, arguments,
  and optionally a list of exceptions that it may throw. Note that argument
  lists and exception lists are specified using the exact same syntax as
  field lists in struct or exception definitions.
`);

const onewayDoc = lines(`
  This method has a oneway modifier. That means the client only makes
  a request and does not listen for any response at all. Oneway methods
  must be void.
`);

const closingDoc = lines(`
  That just about covers the basics. Take a look in the test/ folder for more
  detailed examples. After you run this file, your generated code shows up
  in folders with names gen-<language>. The generated code isn't too scary
  to look at. It even has pretty indentation.
`);

export const files: SnapshotFile[] = [
  {
    path: "tutorial.thrift",
    file: (
      <SourceFile
        path="tutorial.thrift"
        namePolicy={permissiveNamePolicy}
        header={<BlockComment>{apacheLicense}</BlockComment>}
        includes={
          <>
            <List doubleHardline>
              <LineComment prefix="#">{tutorialHeader}</LineComment>
              <DocComment>{typesDoc}</DocComment>
              <LineComment>
                Just in case you were wondering... yes. We support simple C
                comments too.
              </LineComment>
              <DocComment>{includeDoc}</DocComment>
            </List>
            <hbr />
            <Include path="shared.thrift" />
          </>
        }
        namespaces={[
          <>
            <DocComment>{namespaceDoc}</DocComment>
            <hbr />
          </>,
          <Namespace lang="cl" value="tutorial" />,
          <Namespace lang="cpp" value="tutorial" />,
          <Namespace lang="d" value="tutorial" />,
          <Namespace lang="dart" value="tutorial" />,
          <Namespace lang="java" value="tutorial" />,
          <Namespace lang="php" value="tutorial" />,
          <Namespace lang="perl" value="tutorial" />,
          <Namespace lang="haxe" value="tutorial" />,
          <Namespace lang="netstd" value="tutorial" />,
        ]}
      >
        <Typedef
          name="MyInteger"
          type={i32}
          refkey={myInteger}
          doc={typedefDoc}
        />
        <>
          <List hardline>
            <DocComment>{constDoc}</DocComment>
            <Const name="INT32CONSTANT" type={i32} value={9853} />
            <Const
              name="MAPCONSTANT"
              type={mapOf(string, string)}
              value={rawConst("{ 'hello' : 'world' , 'goodnight' : 'moon' }")}
            />
          </List>
        </>
        <Enum name="Operation" refkey={operation} doc={enumDoc}>
          <EnumValue name="ADD" value={1} />
          <EnumValue name="SUBTRACT" value={2} />
          <EnumValue name="MULTIPLY" value={3} />
          <EnumValue name="DIVIDE" value={4} />
        </Enum>
        <Struct name="Work" refkey={work} doc={structDoc}>
          <Field id={1} type={i32} name="num1" default={0} />
          <Field id={2} type={i32} name="num2" />
          <Field id={3} type={operation} name="op" />
          <Field id={4} optional type={string} name="comment" />
        </Struct>
        <Exception
          name="InvalidOperation"
          refkey={invalidOperation}
          doc={exceptionDoc}
        >
          <Field id={1} type={i32} name="whatOp" />
          <Field id={2} type={string} name="why" />
        </Exception>
        <Service
          name="Calculator"
          extends={sharedService}
          refkey={calculator}
          doc={serviceDoc}
        >
          <>
            <hbr />
            <DocComment>{methodDefinitionDoc}</DocComment>
          </>
          <ServiceFunction name="ping"></ServiceFunction>
          <ServiceFunction name="add" returnType={i32}>
            <Field id={1} type={i32} name="num1" />
            <Field id={2} type={i32} name="num2" />
          </ServiceFunction>
          <ServiceFunction name="calculate" returnType={i32}>
            <Field id={1} type={i32} name="logid" />
            <Field id={2} type={work} name="w" />
            <Throws>
              <Field id={1} type={invalidOperation} name="ouch" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="zip" oneway doc={onewayDoc}></ServiceFunction>
        </Service>
        <DocComment>{closingDoc}</DocComment>
      </SourceFile>
    ),
  },
  {
    path: "shared.thrift",
    file: (
      <SourceFile
        path="shared.thrift"
        namePolicy={permissiveNamePolicy}
        header={<BlockComment>{apacheLicense}</BlockComment>}
        namespaces={[
          <>
            <DocComment>
              {lines(`
                This Thrift file can be included by other Thrift files that want to share
                these definitions.
              `)}
            </DocComment>
            <hbr />
          </>,
          <Namespace lang="cl" value="shared" />,
          <Namespace lang="cpp" value="shared" />,
          <Namespace
            lang="d"
            value="share"
            comment={'"shared" would collide with the eponymous D keyword.'}
          />,
          <Namespace lang="dart" value="shared" />,
          <Namespace lang="java" value="shared" />,
          <Namespace lang="perl" value="shared" />,
          <Namespace lang="php" value="shared" />,
          <Namespace lang="haxe" value="shared" />,
          <Namespace lang="netstd" value="shared" />,
        ]}
      >
        <Struct name="SharedStruct" refkey={sharedStruct}>
          <Field id={1} type={i32} name="key" />
          <Field id={2} type={string} name="value" />
        </Struct>
        <Service name="SharedService" refkey={sharedService}>
          <ServiceFunction name="getStruct" returnType={sharedStruct}>
            <Field id={1} type={i32} name="key" />
          </ServiceFunction>
        </Service>
      </SourceFile>
    ),
  },
];

describe("Thrift snapshots", () => {
  it("renders tutorial.thrift + shared.thrift", () => {
    const output = renderThriftFiles(files);
    expect(output).toMatchSnapshot();
  });
});
