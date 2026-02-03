import {
  Argument,
  Field,
  InputField,
  InputObjectType,
  ObjectType,
  Query,
  String,
  renderSchema,
} from "@alloy-js/graphql";
import { describe, expect, it } from "vitest";

describe("component usage validation", () => {
  it("rejects Field in input object types", () => {
    expect(() =>
      renderSchema(
        <>
          <InputObjectType name="BadInput">
            <Field name="oops" type={String} />
          </InputObjectType>
          <Query>
            <Field name="ok" type={String} />
          </Query>
        </>,
      ),
    ).toThrow("Field must be used within an ObjectType or InterfaceType.");
  });

  it("rejects InputField outside input objects", () => {
    expect(() =>
      renderSchema(
        <>
          <ObjectType name="User">
            <InputField name="oops" type={String} />
          </ObjectType>
          <Query>
            <Field name="user" type="User" />
          </Query>
        </>,
      ),
    ).toThrow("InputField must be used within an InputObjectType.");
  });

  it("rejects Argument outside fields or directives", () => {
    expect(() =>
      renderSchema(
        <Query>
          <Argument name="id" type={String} />
          <Field name="ok" type={String} />
        </Query>,
      ),
    ).toThrow("Argument must be used within a Field or Directive.");
  });

  it("rejects multiple list children", () => {
    expect(() =>
      renderSchema(
        <Query>
          <Field name="tags" type={String}>
            <Field.List />
            <Field.List />
          </Field>
        </Query>,
      ),
    ).toThrow("Field only supports a single Field.List child.");

    expect(() =>
      renderSchema(
        <>
          <InputObjectType name="Filter">
            <InputField name="tags" type={String}>
              <InputField.List />
              <InputField.List />
            </InputField>
          </InputObjectType>
          <Query>
            <Field name="items" type={String}>
              <Argument name="filter" type="Filter" />
            </Field>
          </Query>
        </>,
      ),
    ).toThrow("InputField only supports a single InputField.List child.");

    expect(() =>
      renderSchema(
        <Query>
          <Field name="items" type={String}>
            <Argument name="ids" type={String}>
              <Argument.List />
              <Argument.List />
            </Argument>
          </Field>
        </Query>,
      ),
    ).toThrow("Argument only supports a single Argument.List child.");
  });

  it("rejects non-list children for list-only components", () => {
    expect(() =>
      renderSchema(
        <>
          <InputObjectType name="Filter">
            <InputField name="tags" type={String}>
              {"oops"}
            </InputField>
          </InputObjectType>
          <Query>
            <Field name="items" type={String}>
              <Argument name="filter" type="Filter" />
            </Field>
          </Query>
        </>,
      ),
    ).toThrow("InputField only supports InputField.List children.");

    expect(() =>
      renderSchema(
        <Query>
          <Field name="items" type={String}>
            <Argument name="ids" type={String}>
              {"oops"}
            </Argument>
          </Field>
        </Query>,
      ),
    ).toThrow("Argument only supports Argument.List children.");

    expect(() =>
      renderSchema(
        <Query>
          <Field name="items" type={String}>
            <Field.List>{"oops"}</Field.List>
          </Field>
        </Query>,
      ),
    ).toThrow("Field.List only supports Field.List as a child.");
  });
});
