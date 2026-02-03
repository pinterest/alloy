import { refkey } from "@alloy-js/core";
import {
  Argument,
  EnumType,
  EnumValue,
  Field,
  ID,
  InputField,
  InputObjectType,
  Int,
  InterfaceType,
  Mutation,
  ObjectType,
  Query,
  ScalarType,
  String,
  Subscription,
  renderSchema,
} from "@alloy-js/graphql";
import { printSchema } from "graphql";
import { describe, expect, it } from "vitest";

// howtographql schema source: https://github.com/howtographql/howtographql

const AuthProviderSignupData = refkey("AuthProviderSignupData");
const AuthProviderEmail = refkey("AUTH_PROVIDER_EMAIL");
const DateTime = refkey("DateTime");
const Link = refkey("Link");
const LinkFilter = refkey("LinkFilter");
const LinkOrderBy = refkey("LinkOrderBy");
const LinkSubscriptionFilter = refkey("LinkSubscriptionFilter");
const LinkSubscriptionPayload = refkey("LinkSubscriptionPayload");
const ModelMutationType = refkey("_ModelMutationType");
const NodeRef = refkey("Node");
const QueryMeta = refkey("_QueryMeta");
const SigninPayload = refkey("SigninPayload");
const User = refkey("User");
const Vote = refkey("Vote");
const VoteSubscriptionFilter = refkey("VoteSubscriptionFilter");
const VoteSubscriptionPayload = refkey("VoteSubscriptionPayload");

describe("howtographql schema", () => {
  it("matches snapshot", () => {
    const schema = renderSchema(
      <>
        <Query>
          <Field name="allLinks" type={Link} nonNull>
            <Field.List nonNull />
            <Argument name="filter" type={LinkFilter} />
            <Argument name="orderBy" type={LinkOrderBy} />
            <Argument name="skip" type={Int} />
            <Argument name="first" type={Int} />
          </Field>
          <Field name="_allLinksMeta" type={QueryMeta} nonNull />
        </Query>
        <Mutation>
          <Field name="signinUser" type={SigninPayload} nonNull>
            <Argument name="email" type={AuthProviderEmail} />
          </Field>
          <Field name="createUser" type={User}>
            <Argument name="name" type={String} nonNull />
            <Argument
              name="authProvider"
              type={AuthProviderSignupData}
              nonNull
            />
          </Field>
          <Field name="createLink" type={Link}>
            <Argument name="description" type={String} nonNull />
            <Argument name="url" type={String} nonNull />
            <Argument name="postedById" type={ID} />
          </Field>
          <Field name="createVote" type={Vote}>
            <Argument name="linkId" type={ID} />
            <Argument name="userId" type={ID} />
          </Field>
        </Mutation>
        <Subscription>
          <Field name="Link" type={LinkSubscriptionPayload}>
            <Argument name="filter" type={LinkSubscriptionFilter} />
          </Field>
          <Field name="Vote" type={VoteSubscriptionPayload}>
            <Argument name="filter" type={VoteSubscriptionFilter} />
          </Field>
        </Subscription>
        <InterfaceType name="Node" refkey={NodeRef}>
          <Field name="id" type={ID} nonNull />
        </InterfaceType>
        <ObjectType name="User" refkey={User} interfaces={[NodeRef]}>
          <Field name="id" type={ID} nonNull />
          <Field name="createdAt" type={DateTime} nonNull />
          <Field name="name" type={String} nonNull />
          <Field name="links" type={Link} nonNull>
            <Field.List nonNull />
          </Field>
          <Field name="votes" type={Vote} nonNull>
            <Field.List nonNull />
          </Field>
          <Field name="email" type={String} />
          <Field name="password" type={String} />
        </ObjectType>
        <ObjectType name="Link" refkey={Link} interfaces={[NodeRef]}>
          <Field name="id" type={ID} nonNull />
          <Field name="createdAt" type={DateTime} nonNull />
          <Field name="url" type={String} nonNull />
          <Field name="description" type={String} nonNull />
          <Field name="postedBy" type={User} nonNull />
          <Field name="votes" type={Vote} nonNull>
            <Field.List nonNull />
          </Field>
        </ObjectType>
        <ObjectType name="Vote" refkey={Vote} interfaces={[NodeRef]}>
          <Field name="id" type={ID} nonNull />
          <Field name="createdAt" type={DateTime} nonNull />
          <Field name="user" type={User} nonNull />
          <Field name="link" type={Link} nonNull />
        </ObjectType>
        <InputObjectType
          name="AuthProviderSignupData"
          refkey={AuthProviderSignupData}
        >
          <InputField name="email" type={AuthProviderEmail} />
        </InputObjectType>
        <InputObjectType name="AUTH_PROVIDER_EMAIL" refkey={AuthProviderEmail}>
          <InputField name="email" type={String} nonNull />
          <InputField name="password" type={String} nonNull />
        </InputObjectType>
        <InputObjectType
          name="LinkSubscriptionFilter"
          refkey={LinkSubscriptionFilter}
        >
          <InputField name="mutation_in" type={ModelMutationType} nonNull>
            <InputField.List />
          </InputField>
        </InputObjectType>
        <InputObjectType
          name="VoteSubscriptionFilter"
          refkey={VoteSubscriptionFilter}
        >
          <InputField name="mutation_in" type={ModelMutationType} nonNull>
            <InputField.List />
          </InputField>
        </InputObjectType>
        <InputObjectType name="LinkFilter" refkey={LinkFilter}>
          <InputField name="OR" type={LinkFilter} nonNull>
            <InputField.List />
          </InputField>
          <InputField name="description_contains" type={String} />
          <InputField name="url_contains" type={String} />
        </InputObjectType>
        <ObjectType name="SigninPayload" refkey={SigninPayload}>
          <Field name="token" type={String} />
          <Field name="user" type={User} />
        </ObjectType>
        <ObjectType
          name="LinkSubscriptionPayload"
          refkey={LinkSubscriptionPayload}
        >
          <Field name="mutation" type={ModelMutationType} nonNull />
          <Field name="node" type={Link} />
          <Field name="updatedFields" type={String} nonNull>
            <Field.List />
          </Field>
        </ObjectType>
        <ObjectType
          name="VoteSubscriptionPayload"
          refkey={VoteSubscriptionPayload}
        >
          <Field name="mutation" type={ModelMutationType} nonNull />
          <Field name="node" type={Vote} />
          <Field name="updatedFields" type={String} nonNull>
            <Field.List />
          </Field>
        </ObjectType>
        <EnumType name="LinkOrderBy" refkey={LinkOrderBy}>
          <EnumValue name="createdAt_ASC" />
          <EnumValue name="createdAt_DESC" />
        </EnumType>
        <EnumType name="_ModelMutationType" refkey={ModelMutationType}>
          <EnumValue name="CREATED" />
          <EnumValue name="UPDATED" />
          <EnumValue name="DELETED" />
        </EnumType>
        <ObjectType name="_QueryMeta" refkey={QueryMeta}>
          <Field name="count" type={Int} nonNull />
        </ObjectType>
        <ScalarType name="DateTime" refkey={DateTime} />
      </>,
      { namePolicy: null },
    );

    expect(printSchema(schema)).toMatchSnapshot();
  });
});
