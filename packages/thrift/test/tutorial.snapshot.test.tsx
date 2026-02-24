import { describe, expect, it } from "vitest";
import {
  Const,
  Enum,
  EnumValue,
  Exception,
  Field,
  Include,
  Namespace,
  Service,
  ServiceFunction,
  SourceFile,
  Struct,
  Throws,
  Typedef,
  mapOf,
} from "../src/index.js";
import {
  SnapshotFile,
  loadFixture,
  permissiveNamePolicy,
  renderThriftFiles,
} from "./snapshot-utils.jsx";

const files: SnapshotFile[] = [
  {
    path: "tutorial.thrift",
    file: (
      <SourceFile
        path="tutorial.thrift"
        namePolicy={permissiveNamePolicy}
        includes={[<Include path="shared.thrift" />]}
        namespaces={[
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
        <Enum name="Operation">
          <EnumValue name="ADD" value={1} />
          <EnumValue name="SUBTRACT" value={2} />
          <EnumValue name="MULTIPLY" value={3} />
          <EnumValue name="DIVIDE" value={4} />
        </Enum>
        <Typedef name="MyInteger" type="i32" />
        <Const name="INT32CONSTANT" type="i32" value={9853} />
        <Const
          name="MAPCONSTANT"
          type={mapOf("string", "string")}
          value={[
            ["hello", "world"],
            ["goodnight", "moon"],
          ]}
        />
        <Struct name="Work">
          <Field id={1} type="i32" name="num1" default={0} />
          <Field id={2} type="i32" name="num2" />
          <Field id={3} type="Operation" name="op" />
          <Field id={4} required={false} type="string" name="comment" />
        </Struct>
        <Exception name="InvalidOperation">
          <Field id={1} type="i32" name="whatOp" />
          <Field id={2} type="string" name="why" />
        </Exception>
        <Service name="Calculator" extends="shared.SharedService">
          <ServiceFunction name="ping"></ServiceFunction>
          <ServiceFunction name="add" returnType="i32">
            <Field id={1} type="i32" name="num1" />
            <Field id={2} type="i32" name="num2" />
          </ServiceFunction>
          <ServiceFunction name="calculate" returnType="i32">
            <Field id={1} type="i32" name="logid" />
            <Field id={2} type="Work" name="w" />
            <Throws>
              <Field id={1} type="InvalidOperation" name="ouch" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="zip" oneway></ServiceFunction>
        </Service>
      </SourceFile>
    ),
  },
  {
    path: "shared.thrift",
    file: (
      <SourceFile
        path="shared.thrift"
        namePolicy={permissiveNamePolicy}
        namespaces={[
          <Namespace lang="cl" value="shared" />,
          <Namespace lang="cpp" value="shared" />,
          <Namespace lang="d" value="share" />,
          <Namespace lang="dart" value="shared" />,
          <Namespace lang="java" value="shared" />,
          <Namespace lang="perl" value="shared" />,
          <Namespace lang="php" value="shared" />,
          <Namespace lang="haxe" value="shared" />,
          <Namespace lang="netstd" value="shared" />,
        ]}
      >
        <Struct name="SharedStruct">
          <Field id={1} type="i32" name="key" />
          <Field id={2} type="string" name="value" />
        </Struct>
        <Service name="SharedService">
          <ServiceFunction name="getStruct" returnType="SharedStruct">
            <Field id={1} type="i32" name="key" />
          </ServiceFunction>
        </Service>
      </SourceFile>
    ),
  },
];

describe("Thrift snapshots", () => {
  it("renders tutorial.thrift + shared.thrift", () => {
    const output = renderThriftFiles(files);

    expect(output).toEqual({
      "shared.thrift": loadFixture("tutorial/shared.thrift"),
      "tutorial.thrift": loadFixture("tutorial/tutorial.thrift"),
    });
    expect(output).toMatchSnapshot();
  });
});
