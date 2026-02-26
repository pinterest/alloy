import { toSourceText } from "#test/utils.jsx";
import { refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import {
  Exception,
  Field,
  Service,
  ServiceFunction,
  Throws,
  i64,
  string,
} from "../index.js";

describe("Service", () => {
  it("renders service functions with throws and annotations", () => {
    const notFound = refkey();
    const text = toSourceText(
      <>
        <Exception name="NotFound" refkey={notFound}>
          <Field id={1} type={string} name="message" />
        </Exception>
        <Service name="UserService">
          <ServiceFunction name="ping" oneway>
            <Field id={1} type={string} name="message" />
          </ServiceFunction>
          <ServiceFunction
            name="getUser"
            returnType={string}
            annotations={{ deprecated: true }}
          >
            <Field id={1} type={i64} name="id" />
            <Throws>
              <Field id={1} type={notFound} name="notFound" />
            </Throws>
          </ServiceFunction>
        </Service>
      </>,
    );

    expect(text).toBe(d`
      exception NotFound {
        1: string message,
      }

      service UserService {
        oneway void ping(1: string message),

        string getUser(1: i64 id) throws (1: NotFound notFound) (deprecated = true),
      }
    `);
  });

  it("rejects oneway service functions with non-void return types", () => {
    expect(() =>
      toSourceText(
        <Service name="BadService">
          <ServiceFunction name="oops" oneway returnType={string} />
        </Service>,
      ),
    ).toThrow("Oneway functions must return void.");
  });

  it("renders service annotations after the closing brace", () => {
    const text = toSourceText(
      <Service name="Legacy" annotations={{ deprecated: "use V2" }}>
        <ServiceFunction name="ping" />
      </Service>,
    );

    expect(text).toBe(d`
      service Legacy {
        void ping(),
      } (deprecated = "use V2")
    `);
  });

  it("renders empty service with collapsed braces", () => {
    const text = toSourceText(<Service name="Empty" />);

    expect(text).toBe(d`
      service Empty {
      }
    `);
  });
});

describe("Exception", () => {
  it("renders with the exception keyword", () => {
    const text = toSourceText(
      <Exception name="NotFound">
        <Field id={1} type={string} name="message" />
      </Exception>,
    );

    expect(text).toBe(d`
      exception NotFound {
        1: string message,
      }
    `);
  });
});
