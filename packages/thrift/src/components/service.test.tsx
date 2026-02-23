import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as thrift from "../index.js";
import { toSourceText } from "#test/utils.jsx";

describe("Service", () => {
  it("renders service functions with throws and annotations", () => {
    const text = toSourceText(
      <>
        <thrift.Exception name="NotFound">
          <thrift.Field id={1} type="string" name="message" />
        </thrift.Exception>
        <thrift.Service name="UserService">
          <thrift.ServiceFunction name="ping" oneway>
            <thrift.Field id={1} type="string" name="message" />
          </thrift.ServiceFunction>
          <thrift.ServiceFunction
            name="getUser"
            returnType="string"
            annotations={{ deprecated: true }}
          >
            <thrift.Field id={1} type="i64" name="id" />
            <thrift.Throws>
              <thrift.Field id={1} type="NotFound" name="notFound" />
            </thrift.Throws>
          </thrift.ServiceFunction>
        </thrift.Service>
      </>,
    );

    expect(text).toBe(d`
      exception NotFound {
        1: string message;
      }

      service UserService {
        oneway void ping(1: string message);
        string getUser(1: i64 id) throws (1: NotFound notFound) (deprecated=true);
      }
    `);
  });

  it("rejects oneway service functions with non-void return types", () => {
    expect(() =>
      toSourceText(
        <thrift.Service name="BadService">
          <thrift.ServiceFunction name="oops" oneway returnType="string" />
        </thrift.Service>,
      ),
    ).toThrow("Oneway functions must return void.");
  });
});
