import { Output, refkey, render } from "@alloy-js/core";
import { describe, it } from "vitest";
import * as thrift from "../index.js";
import { assertFileContents } from "#test/utils.jsx";

describe("Include", () => {
  it("adds include statements for cross-file references", () => {
    const userRef = refkey();

    const res = render(
      <Output namePolicy={thrift.defaultThriftNamePolicy}>
        <thrift.SourceFile path="main.thrift">
          <thrift.Struct name="Request">
            <thrift.Field id={1} type={userRef} name="user" />
          </thrift.Struct>
        </thrift.SourceFile>
        <thrift.SourceFile path="shared.thrift">
          <thrift.Struct name="User" refkey={userRef}>
            <thrift.Field id={1} type="string" name="name" />
          </thrift.Struct>
        </thrift.SourceFile>
      </Output>,
      { insertFinalNewLine: false },
    );

    assertFileContents(res, {
      "main.thrift": `
        include "shared.thrift"

        struct Request {
          1: shared.User user;
        }
      `,
      "shared.thrift": `
        struct User {
          1: string name;
        }
      `,
    });
  });

  it("reuses manual include aliases for auto references", () => {
    const userRef = refkey();

    const res = render(
      <Output namePolicy={thrift.defaultThriftNamePolicy}>
        <thrift.SourceFile
          path="main.thrift"
          includes={<thrift.Include path="shared.thrift" alias="common" />}
        >
          <thrift.Struct name="Request">
            <thrift.Field id={1} type={userRef} name="user" />
          </thrift.Struct>
        </thrift.SourceFile>
        <thrift.SourceFile path="shared.thrift">
          <thrift.Struct name="User" refkey={userRef}>
            <thrift.Field id={1} type="string" name="name" />
          </thrift.Struct>
        </thrift.SourceFile>
      </Output>,
      { insertFinalNewLine: false },
    );

    assertFileContents(res, {
      "main.thrift": `
        include "shared.thrift"

        struct Request {
          1: common.User user;
        }
      `,
      "shared.thrift": `
        struct User {
          1: string name;
        }
      `,
    });
  });
});
