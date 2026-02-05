import {
  createGraphQLNamePolicy,
  DirectiveDefinition,
  EnumType,
  EnumValue,
  Field,
  InputValue,
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
            <InputValue name="term" type={String} />
            <InputValue name="term" type={String} />
          </Field>
        </Query>,
      ),
    ).toThrow(/InputValue "term" is already defined/);
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
          <DirectiveDefinition name="flag" locations={["FIELD", "FIELD"]} />
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
          <DirectiveDefinition
            name="deprecated"
            locations={["FIELD_DEFINITION"]}
          />
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
          <DirectiveDefinition name="flag" locations={["NOT_A_LOCATION"]} />
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
          <DirectiveDefinition name="flag" locations={[]} />
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
          <DirectiveDefinition
            name="__private"
            locations={["FIELD_DEFINITION"]}
          />
          <Query>
            <Field name="ping" type={String} />
          </Query>
        </>,
      ),
    ).toThrow('Name "__private" must not begin with "__".');
  });

  it("rejects directive names that conflict with specified directives", () => {
    expect(() =>
      renderSchema(
        <>
          <DirectiveDefinition
            name="deprecated"
            locations={["FIELD_DEFINITION"]}
          />
          <Query>
            <Field name="ping" type={String} />
          </Query>
        </>,
      ),
    ).toThrow(
      'Directive name "deprecated" conflicts with a specified directive.',
    );
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
