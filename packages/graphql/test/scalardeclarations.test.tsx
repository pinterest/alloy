/** @jsxImportSource @alloy-js/core */
import { code, refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import { assertFileContents, toGraphQLText, toGraphQLTextMultiple } from "./utils.jsx";

describe("ScalarDeclaration", () => {
  it("renders a simple scalar", () => {
    const result = toGraphQLText(
      <gql.ScalarDeclaration name="DateTime" />,
    );
    expect(result).toRenderTo(d`
      scalar DateTime
    `);
  });

  it("renders a scalar with documentation", () => {
    const result = toGraphQLText(
      <gql.ScalarDeclaration
        name="DateTime"
        description={`"""\nISO-8601 date-time string\n"""`}
      />,
    );
    expect(result).toRenderTo(d`
      """
      ISO-8601 date-time string
      """
      scalar DateTime
    `);
  });

  it("renders a scalar with multi-line documentation", () => {
    const result = toGraphQLText(
      <gql.ScalarDeclaration
        name="DateTime"
        description={`"""\nRepresents a date and time.\nFormatted as ISO-8601.\n"""`}
      />,
    );
    expect(result).toRenderTo(d`
      """
      Represents a date and time.
      Formatted as ISO-8601.
      """
      scalar DateTime
    `);
  });

  it("renders a scalar with a directive", () => {
    const result = toGraphQLText(
      <gql.ScalarDeclaration
        name="URL"
        directives={
          <gql.Directive
            name="specifiedBy"
            args={{ url: "https://tools.ietf.org/html/rfc3986" }}
          />
        }
      />,
    );
    expect(result).toRenderTo(d`
      scalar Url @specifiedBy(url: "https://tools.ietf.org/html/rfc3986")
    `);
  });

  it("renders a scalar with documentation and directive", () => {
    const result = toGraphQLText(
      <gql.ScalarDeclaration
        name="URL"
        description={`"""\nValid URL string\n"""`}
        directives={
          <gql.Directive
            name="specifiedBy"
            args={{ url: "https://tools.ietf.org/html/rfc3986" }}
          />
        }
      />,
    );
    expect(result).toRenderTo(d`
      """
      Valid URL string
      """
      scalar Url @specifiedBy(url: "https://tools.ietf.org/html/rfc3986")
    `);
  });

  it("renders multiple scalars", () => {
    const result = toGraphQLText(
      <>
        <gql.ScalarDeclaration name="DateTime" />
        <gql.ScalarDeclaration name="JSON" />
        <gql.ScalarDeclaration name="URL" />
      </>,
    );
    expect(result).toRenderTo(d`
      scalar DateTime
      
      scalar Json
      
      scalar Url
    `);
  });

  it("supports cross-file scalar references", () => {
    const dateTimeRef = refkey();

    const res = toGraphQLTextMultiple([
      <gql.SourceFile path="scalars.graphql">
        <gql.ScalarDeclaration
          name="DateTime"
          refkey={dateTimeRef}
          description={`"""\nISO-8601 date-time\n"""`}
        />
      </gql.SourceFile>,
      <gql.SourceFile path="types.graphql">
        <gql.ObjectTypeDefinition name="Event">
          <gql.FieldDefinition name="startTime" type={code`${dateTimeRef}!`} />
        </gql.ObjectTypeDefinition>
      </gql.SourceFile>,
    ]);

    assertFileContents(res, {
      "scalars.graphql": `
        """
        ISO-8601 date-time
        """
        scalar DateTime
      `,
      "types.graphql": `
        type Event {
          startTime: DateTime!
        }
      `,
    });
  });

  it("renders common custom scalars", () => {
    const result = toGraphQLText(
      <>
        <gql.ScalarDeclaration
          name="DateTime"
          description={`"""\nISO-8601 date-time string\n"""`}
        />
        <gql.ScalarDeclaration
          name="Date"
          description={`"""\nISO-8601 date string\n"""`}
        />
        <gql.ScalarDeclaration
          name="Time"
          description={`"""\nISO-8601 time string\n"""`}
        />
        <gql.ScalarDeclaration
          name="JSON"
          description={`"""\nArbitrary JSON value\n"""`}
        />
        <gql.ScalarDeclaration
          name="UUID"
          description={`"""\nUUID string\n"""`}
        />
      </>,
    );
    expect(result).toRenderTo(d`
      """
      ISO-8601 date-time string
      """
      scalar DateTime
      
      """
      ISO-8601 date string
      """
      scalar Date
      
      """
      ISO-8601 time string
      """
      scalar Time
      
      """
      Arbitrary JSON value
      """
      scalar Json
      
      """
      UUID string
      """
      scalar Uuid
    `);
  });

  it("renders scalars used in argument types", () => {
    const dateTimeRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.ScalarDeclaration name="DateTime" refkey={dateTimeRef} />
        <gql.ObjectTypeDefinition name="Query">
          <gql.FieldDefinition
            name="events"
            type="[Event!]!"
            args={
              <>
                <gql.InputValueDefinition name="after" type={dateTimeRef} />
                <gql.InputValueDefinition name="before" type={dateTimeRef} />
              </>
            }
          />
        </gql.ObjectTypeDefinition>
      </>,
    );

    expect(result).toRenderTo(d`
      scalar DateTime
      
      type Query {
        events(after: DateTime, before: DateTime): [Event!]!
      }
    `);
  });
});

