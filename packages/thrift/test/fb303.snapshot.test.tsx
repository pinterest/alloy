import { describe, expect, it } from "vitest";
import {
  Enum,
  EnumValue,
  Field,
  Namespace,
  Service,
  ServiceFunction,
  SourceFile,
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
    path: "fb303.thrift",
    file: (
      <SourceFile
        path="fb303.thrift"
        namePolicy={permissiveNamePolicy}
        namespaces={[
          <Namespace lang="java" value="com.facebook.fb303" />,
          <Namespace lang="cpp" value="facebook.fb303" />,
          <Namespace lang="perl" value="Facebook.FB303" />,
          <Namespace lang="netstd" value="Facebook.FB303.Test" />,
        ]}
      >
        <Enum name="fb_status">
          <EnumValue name="DEAD" value={0} />
          <EnumValue name="STARTING" value={1} />
          <EnumValue name="ALIVE" value={2} />
          <EnumValue name="STOPPING" value={3} />
          <EnumValue name="STOPPED" value={4} />
          <EnumValue name="WARNING" value={5} />
        </Enum>
        <Service name="FacebookService">
          <ServiceFunction name="getName" returnType="string"></ServiceFunction>
          <ServiceFunction
            name="getVersion"
            returnType="string"
          ></ServiceFunction>
          <ServiceFunction
            name="getStatus"
            returnType="fb_status"
          ></ServiceFunction>
          <ServiceFunction
            name="getStatusDetails"
            returnType="string"
          ></ServiceFunction>
          <ServiceFunction
            name="getCounters"
            returnType={mapOf("string", "i64")}
          ></ServiceFunction>
          <ServiceFunction name="getCounter" returnType="i64">
            <Field id={1} type="string" name="key" />
          </ServiceFunction>
          <ServiceFunction name="setOption">
            <Field id={1} type="string" name="key" />
            <Field id={2} type="string" name="value" />
          </ServiceFunction>
          <ServiceFunction name="getOption" returnType="string">
            <Field id={1} type="string" name="key" />
          </ServiceFunction>
          <ServiceFunction
            name="getOptions"
            returnType={mapOf("string", "string")}
          ></ServiceFunction>
          <ServiceFunction name="getCpuProfile" returnType="string">
            <Field id={1} type="i32" name="profileDurationInSec" />
          </ServiceFunction>
          <ServiceFunction name="aliveSince" returnType="i64"></ServiceFunction>
          <ServiceFunction name="reinitialize" oneway></ServiceFunction>
          <ServiceFunction name="shutdown" oneway></ServiceFunction>
        </Service>
      </SourceFile>
    ),
  },
];

describe("Thrift snapshots", () => {
  it("renders fb303.thrift", () => {
    const output = renderThriftFiles(files);

    expect(output).toEqual({
      "fb303.thrift": loadFixture("fb303.thrift"),
    });
    expect(output).toMatchSnapshot();
  });
});
