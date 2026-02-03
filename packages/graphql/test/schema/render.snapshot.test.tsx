import {
  Argument,
  Boolean,
  Directive,
  EnumType,
  EnumValue,
  Field,
  ID,
  InputField,
  InputObjectType,
  Int,
  Mutation,
  Node,
  NodeInterface,
  ObjectType,
  Query,
  ScalarType,
  String,
  Subscription,
  UnionMember,
  UnionType,
  renderSchema,
} from "@alloy-js/graphql";
import { printSchema } from "graphql";
import { describe, expect, it } from "vitest";

describe("renderSchema snapshots", () => {
  it("prints a comprehensive schema snapshot", () => {
    const schema = renderSchema(
      <>
        <Directive name="tag" locations={["OBJECT", "FIELD_DEFINITION"]}>
          <Argument name="name" type={String} nonNull />
          <Argument name="important" type={Boolean} defaultValue={false} />
        </Directive>
        <ScalarType
          name="Url"
          specifiedByUrl="https://example.com/spec#url"
          serialize={(value: unknown) => value}
        />
        <NodeInterface />
        <EnumType name="Role">
          <EnumValue name="ADMIN" />
          <EnumValue name="USER" deprecated />
        </EnumType>
        <ObjectType name="Profile">
          <Field name="url" type="Url" />
          <Field name="bio" type={String} deprecated />
        </ObjectType>
        <ObjectType name="User" interfaces={[Node]}>
          <Field name="name" type={String} />
          <Field name="role" type="Role" deprecated />
          <Field name="profile" type="Profile" />
        </ObjectType>
        <ObjectType name="Post">
          <Field name="id" type={ID} nonNull />
          <Field name="author" type="User" />
          <Field name="tags" type={String} nonNull>
            <Field.List />
          </Field>
        </ObjectType>
        <UnionType name="SearchResult">
          <UnionMember type="User" />
          <UnionMember type="Post" />
        </UnionType>
        <InputObjectType name="ProfileInput">
          <InputField
            name="displayName"
            type={String}
            defaultValue="Anonymous"
          />
          <InputField name="url" type="Url" />
          <InputField name="legacy" type={String} deprecated />
        </InputObjectType>
        <InputObjectType name="SearchFilter" oneOf>
          <InputField name="id" type={ID} />
          <InputField name="name" type={String} />
        </InputObjectType>
        <Query>
          <Field name="me" type="User" />
          <Field name="search" type="SearchResult">
            <Field.List />
            <Argument name="filter" type="SearchFilter" />
            <Argument name="limit" type={Int} defaultValue={10} />
            <Argument name="includeArchived" type={Boolean} deprecated />
          </Field>
        </Query>
        <Mutation>
          <Field name="updateProfile" type="Profile">
            <Argument name="input" type="ProfileInput" nonNull />
          </Field>
        </Mutation>
        <Subscription>
          <Field name="userAdded" type="User" />
        </Subscription>
      </>,
    );

    expect(printSchema(schema)).toMatchSnapshot();
  });

  it("prints a schema snapshot with custom roots", () => {
    const schema = renderSchema(
      <>
        <Directive
          name="cacheControl"
          locations={["OBJECT", "FIELD_DEFINITION"]}
        >
          <Argument name="maxAge" type={Int} defaultValue={60} />
        </Directive>
        <ObjectType name="RootQuery">
          <Field name="ping" type={String} />
        </ObjectType>
        <ObjectType name="RootMutation">
          <Field name="noop" type={String} />
        </ObjectType>
      </>,
      {
        query: "RootQuery",
        mutation: "RootMutation",
        includeSpecifiedDirectives: false,
      },
    );

    expect(printSchema(schema)).toMatchSnapshot();
  });

  it("prints a schema snapshot with descriptions", () => {
    const schema = renderSchema(
      <>
        <Directive
          name="auth"
          description="Authorization details"
          repeatable
          locations={["FIELD_DEFINITION"]}
        >
          <Argument
            name="scope"
            type={String}
            description="Required scope"
            defaultValue="public"
          />
        </Directive>
        <ScalarType
          name="Url"
          description="A URL scalar"
          specifiedByUrl="https://example.com/spec#url"
          serialize={(value: unknown) => value}
        />
        <EnumType name="Role" description="User roles">
          <EnumValue name="ADMIN" description="Administrator" />
          <EnumValue name="USER" description="Standard user" />
        </EnumType>
        <InputObjectType name="UserInput" description="Input for user creation">
          <InputField name="name" type={String} description="Display name" />
          <InputField name="role" type="Role" description="User role" />
        </InputObjectType>
        <ObjectType name="RootQuery" description="Query root">
          <Field name="user" type="User" description="Fetch a user">
            <Argument name="id" type={ID} nonNull description="User id" />
          </Field>
        </ObjectType>
        <ObjectType name="RootMutation" description="Mutation root">
          <Field name="createUser" type="User" description="Create a user">
            <Argument
              name="input"
              type="UserInput"
              nonNull
              description="New user data"
            />
          </Field>
        </ObjectType>
        <ObjectType name="User" description="A user">
          <Field name="id" type={ID} nonNull description="User id" />
          <Field name="role" type="Role" description="User role" deprecated />
          <Field name="website" type="Url" description="Personal site" />
        </ObjectType>
      </>,
      {
        query: "RootQuery",
        mutation: "RootMutation",
        description: "Example schema",
      },
    );

    expect(printSchema(schema)).toMatchSnapshot();
  });
});
