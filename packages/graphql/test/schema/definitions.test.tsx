import {
  Argument,
  createGraphQLNamePolicy,
  Directive,
  EnumType,
  EnumValue,
  Field,
  Query,
  renderSchema,
  String,
} from "@alloy-js/graphql";
import { describe, expect, it } from "vitest";

describe("schema definitions", () => {
  it("rejects duplicate field names", () => {
    expect(() =>
      renderSchema(
        <Query>
          <Field name="hello" type={String} />
          <Field name="hello" type={String} />
        </Query>,
      ),
    ).toThrow(/Field "hello" is already defined/);
  });

  it("rejects duplicate argument names", () => {
    expect(() =>
      renderSchema(
        <Query>
          <Field name="search" type={String}>
            <Argument name="term" type={String} />
            <Argument name="term" type={String} />
          </Field>
        </Query>,
      ),
    ).toThrow(/Argument "term" is already defined/);
  });

  it("rejects reserved enum values", () => {
    expect(() =>
      renderSchema(
        <>
          <EnumType name="Flags">
            <EnumValue name="true" />
          </EnumType>
          <Query>
            <Field name="flags" type="Flags" />
          </Query>
        </>,
        { namePolicy: null },
      ),
    ).toThrow(/reserved and cannot be used/);
  });

  it("rejects duplicate directive locations", () => {
    expect(() =>
      renderSchema(
        <>
          <Directive name="flag" locations={["FIELD", "FIELD"]} />
          <Query>
            <Field name="ping" type={String} />
          </Query>
        </>,
      ),
    ).toThrow(/Directive location "FIELD" cannot be repeated/);
  });

  it("rejects specified directive name conflicts", () => {
    expect(() =>
      renderSchema(
        <>
          <Directive name="deprecated" locations={["FIELD_DEFINITION"]} />
          <Query>
            <Field name="ping" type={String} />
          </Query>
        </>,
      ),
    ).toThrow(/conflicts with a specified directive/);
  });

  it("rejects unknown directive locations", () => {
    expect(() =>
      renderSchema(
        <>
          <Directive name="flag" locations={["NOT_A_LOCATION"]} />
          <Query>
            <Field name="ping" type={String} />
          </Query>
        </>,
      ),
    ).toThrow(/Unknown directive location/);
  });

  it("rejects directives without locations", () => {
    expect(() =>
      renderSchema(
        <>
          <Directive name="flag" locations={[]} />
          <Query>
            <Field name="ping" type={String} />
          </Query>
        </>,
      ),
    ).toThrow('Directive "flag" must have locations.');
  });

  it("rejects directives with reserved names", () => {
    expect(() =>
      renderSchema(
        <>
          <Directive name="__private" locations={["FIELD_DEFINITION"]} />
          <Query>
            <Field name="ping" type={String} />
          </Query>
        </>,
      ),
    ).toThrow('Name "__private" must not begin with "__".');
  });

  it("allows excluding specified directives", () => {
    const schema = renderSchema(
      <>
        <Directive name="flag" locations={["FIELD_DEFINITION"]} />
        <Query>
          <Field name="ping" type={String} />
        </Query>
      </>,
      { includeSpecifiedDirectives: false },
    );

    expect(schema.getDirectives().map((directive) => directive.name)).toEqual([
      "flag",
    ]);
  });

  it("enforces name policy overrides", () => {
    expect(() =>
      renderSchema(
        <Query>
          <Field name="ping" type={String} />
        </Query>,
        {
          namePolicy: createGraphQLNamePolicy({
            rules: {
              type: /^X/,
            },
          }),
        },
      ),
    ).toThrow(/type naming policy/);
  });
});
