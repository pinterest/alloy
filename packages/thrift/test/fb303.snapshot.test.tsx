import { refkey } from "@alloy-js/core";
import { describe, expect, it } from "vitest";
import {
  BlockComment,
  Enum,
  EnumValue,
  Field,
  Namespace,
  Service,
  ServiceFunction,
  SourceFile,
  i32,
  i64,
  mapOf,
  string,
} from "../src/index.js";
import {
  SnapshotFile,
  permissiveNamePolicy,
  renderThriftFiles,
} from "./snapshot-utils.jsx";

// Based on https://github.com/apache/thrift/blob/32776c0f46f5fd79b296391d66236c23b20af072/contrib/fb303/if/fb303.thrift

const fbStatus = refkey();

export const files: SnapshotFile[] = [
  {
    path: "fb303.thrift",
    file: (
      <SourceFile
        path="fb303.thrift"
        namePolicy={permissiveNamePolicy}
        header={
          <BlockComment>
            {[
              "Licensed to the Apache Software Foundation (ASF) under one",
              "or more contributor license agreements. See the NOTICE file",
              "distributed with this work for additional information",
              "regarding copyright ownership. The ASF licenses this file",
              "to you under the Apache License, Version 2.0 (the",
              '"License"); you may not use this file except in compliance',
              "with the License. You may obtain a copy of the License at",
              "",
              "  http://www.apache.org/licenses/LICENSE-2.0",
              "",
              "Unless required by applicable law or agreed to in writing,",
              "software distributed under the License is distributed on an",
              '"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY',
              "KIND, either express or implied. See the License for the",
              "specific language governing permissions and limitations",
              "under the License.",
            ]}
          </BlockComment>
        }
        headerComment="fb303.thrift"
        namespaces={[
          <Namespace lang="java" value="com.facebook.fb303" />,
          <Namespace lang="cpp" value="facebook.fb303" />,
          <Namespace lang="perl" value="Facebook.FB303" />,
          <Namespace lang="netstd" value="Facebook.FB303.Test" />,
        ]}
      >
        <Enum
          name="fb_status"
          refkey={fbStatus}
          doc="Common status reporting mechanism across all services"
        >
          <EnumValue name="DEAD" value={0} />
          <EnumValue name="STARTING" value={1} />
          <EnumValue name="ALIVE" value={2} />
          <EnumValue name="STOPPING" value={3} />
          <EnumValue name="STOPPED" value={4} />
          <EnumValue name="WARNING" value={5} />
        </Enum>
        <Service name="FacebookService" doc="Standard base service">
          <>
            <hbr />
            <ServiceFunction
              name="getName"
              returnType={string}
              doc="Returns a descriptive name of the service"
            ></ServiceFunction>
          </>
          <ServiceFunction
            name="getVersion"
            returnType={string}
            doc="Returns the version of the service"
          ></ServiceFunction>
          <ServiceFunction
            name="getStatus"
            returnType={fbStatus}
            doc="Gets the status of this service"
          ></ServiceFunction>
          <ServiceFunction
            name="getStatusDetails"
            returnType={string}
            doc={[
              "User friendly description of status, such as why the service is in",
              "the dead or warning state, or what is being started or stopped.",
            ]}
          ></ServiceFunction>
          <ServiceFunction
            name="getCounters"
            returnType={mapOf(string, i64)}
            doc="Gets the counters for this service"
          ></ServiceFunction>
          <ServiceFunction
            name="getCounter"
            returnType={i64}
            doc="Gets the value of a single counter"
          >
            <Field id={1} type={string} name="key" />
          </ServiceFunction>
          <ServiceFunction name="setOption" doc="Sets an option">
            <Field id={1} type={string} name="key" />
            <Field id={2} type={string} name="value" />
          </ServiceFunction>
          <ServiceFunction
            name="getOption"
            returnType={string}
            doc="Gets an option"
          >
            <Field id={1} type={string} name="key" />
          </ServiceFunction>
          <ServiceFunction
            name="getOptions"
            returnType={mapOf(string, string)}
            doc="Gets all options"
          ></ServiceFunction>
          <ServiceFunction
            name="getCpuProfile"
            returnType={string}
            doc={[
              "Returns a CPU profile over the given time interval (client and server",
              "must agree on the profile format).",
            ]}
          >
            <Field id={1} type={i32} name="profileDurationInSec" />
          </ServiceFunction>
          <ServiceFunction
            name="aliveSince"
            returnType={i64}
            doc="Returns the unix time that the server has been running since"
          ></ServiceFunction>
          <ServiceFunction
            name="reinitialize"
            oneway
            doc="Tell the server to reload its configuration, reopen log files, etc"
          ></ServiceFunction>
          <>
            <ServiceFunction
              name="shutdown"
              oneway
              doc="Suggest a shutdown to the server"
            ></ServiceFunction>
            <hbr />
          </>
        </Service>
      </SourceFile>
    ),
  },
];

describe("Thrift snapshots", () => {
  it("renders fb303.thrift", () => {
    const output = renderThriftFiles(files);
    expect(output).toMatchSnapshot();
  });
});
