import { assertFileContents } from "#test/utils.jsx";
import { Output, refkey, render } from "@alloy-js/core";
import { describe, it } from "vitest";
import {
  Field,
  Include,
  SourceFile,
  Struct,
  defaultThriftNamePolicy,
  string,
} from "../index.js";

describe("Include", () => {
  it("adds include statements for cross-file references", () => {
    const userRef = refkey();

    const res = render(
      <Output namePolicy={defaultThriftNamePolicy}>
        <SourceFile path="main.thrift">
          <Struct name="Request">
            <Field id={1} type={userRef} name="user" />
          </Struct>
        </SourceFile>
        <SourceFile path="shared.thrift">
          <Struct name="User" refkey={userRef}>
            <Field id={1} type={string} name="name" />
          </Struct>
        </SourceFile>
      </Output>,
      { insertFinalNewLine: false },
    );

    assertFileContents(res, {
      "main.thrift": `
        include "shared.thrift"

        struct Request {
          1: shared.User user,
        }
      `,
      "shared.thrift": `
        struct User {
          1: string name,
        }
      `,
    });
  });

  it("reuses manual include aliases for auto references", () => {
    const userRef = refkey();

    const res = render(
      <Output namePolicy={defaultThriftNamePolicy}>
        <SourceFile
          path="main.thrift"
          includes={<Include path="shared.thrift" alias="common" />}
        >
          <Struct name="Request">
            <Field id={1} type={userRef} name="user" />
          </Struct>
        </SourceFile>
        <SourceFile path="shared.thrift">
          <Struct name="User" refkey={userRef}>
            <Field id={1} type={string} name="name" />
          </Struct>
        </SourceFile>
      </Output>,
      { insertFinalNewLine: false },
    );

    assertFileContents(res, {
      "main.thrift": `
        include "shared.thrift"

        struct Request {
          1: common.User user,
        }
      `,
      "shared.thrift": `
        struct User {
          1: string name,
        }
      `,
    });
  });
});
