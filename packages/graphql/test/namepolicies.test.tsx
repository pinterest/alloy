import { code, refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("Name transformations", () => {
  it("transforms type names to PascalCase", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDefinition name="a-really-WeirdType-name">
        <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
      </gql.ObjectTypeDefinition>,
    );
    const expected = d`
      type AReallyWeirdTypeName {
        id: ID!
      }
    `;
    expect(result).toRenderTo(expected);
  });

  it("transforms field names to camelCase", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDefinition name="User">
        <gql.FieldDefinition
          name="user-ID"
          type={code`${builtInScalars.ID}!`}
        />
        <gql.FieldDefinition name="FirstName" type={builtInScalars.String} />
        <gql.FieldDefinition name="last_name" type={builtInScalars.String} />
      </gql.ObjectTypeDefinition>,
    );
    const expected = d`
      type User {
        userId: ID!
        firstName: String
        lastName: String
      }
    `;
    expect(result).toRenderTo(expected);
  });

  it("transforms argument names to camelCase", () => {
    const userRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="User" refkey={userRef}>
          <gql.FieldDefinition name="id" type={builtInScalars.ID} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Query">
          <gql.FieldDefinition
            name="user"
            type={userRef}
            args={
              <>
                <gql.InputValueDefinition
                  name="user-ID"
                  type={code`${builtInScalars.ID}!`}
                />
                <gql.InputValueDefinition
                  name="FirstName"
                  type={builtInScalars.String}
                />
                <gql.InputValueDefinition
                  name="include_deleted"
                  type={builtInScalars.Boolean}
                />
              </>
            }
          />
        </gql.ObjectTypeDefinition>
      </>,
    );
    expect(result).toRenderTo(d`
      type User {
        id: ID
      }
      
      type Query {
        user(userId: ID!, firstName: String, includeDeleted: Boolean): User
      }
    `);
  });

  it("transforms directive names to camelCase", () => {
    const result = toGraphQLText(
      <gql.DirectiveDefinition
        name="custom-Auth-Directive"
        locations={["FIELD_DEFINITION"]}
        args={<gql.InputValueDefinition name="required-Role" type="Role!" />}
      />,
    );
    expect(result).toBe(
      "directive @customAuthDirective(requiredRole: Role!) on FIELD_DEFINITION",
    );
  });

  it("preserves single leading underscore in names", () => {
    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="_User">
          <gql.FieldDefinition name="id" type={builtInScalars.ID} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Post">
          <gql.FieldDefinition
            name="_internal_field"
            type={builtInScalars.String}
          />
        </gql.ObjectTypeDefinition>
      </>,
    );
    expect(result).toRenderTo(d`
      type _User {
        id: ID
      }

      type Post {
        _internalField: String
      }
    `);
  });

  it("applies name policy to refkeys", () => {
    const userRef = refkey();
    const postRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="user-type" refkey={userRef}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition name="posts" type={code`[${postRef}!]!`} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="post-type" refkey={postRef}>
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
          <gql.FieldDefinition name="author" type={userRef} />
        </gql.ObjectTypeDefinition>
      </>,
    );
    const expected = d`
      type UserType {
        id: ID!
        posts: [PostType!]!
      }

      type PostType {
        id: ID!
        author: UserType
      }
    `;
    expect(result).toRenderTo(expected);
  });
});

describe("Keywords and reserved names", () => {
  it("allows operation type names (Query, Mutation, Subscription)", () => {
    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="query">
          <gql.FieldDefinition name="id" type={code`${builtInScalars.ID}!`} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Mutation">
          <gql.FieldDefinition name="update" type={builtInScalars.Boolean} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="SUBSCRIPTION">
          <gql.FieldDefinition name="onChange" type={builtInScalars.String} />
        </gql.ObjectTypeDefinition>
      </>,
    );
    const expected = d`
      type Query {
        id: ID!
      }

      type Mutation {
        update: Boolean
      }

      type Subscription {
        onChange: String
      }
    `;
    expect(result).toRenderTo(expected);
  });

  it("allows keywords as field names (keywords only reserved at top level)", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDefinition name="User">
        <gql.FieldDefinition name="type" type={builtInScalars.String} />
        <gql.FieldDefinition name="interface" type={builtInScalars.String} />
        <gql.FieldDefinition name="enum" type={builtInScalars.String} />
      </gql.ObjectTypeDefinition>,
    );
    const expected = d`
      type User {
        type: String
        interface: String
        enum: String
      }
    `;
    expect(result).toRenderTo(expected);
  });

  it("allows keywords as argument names", () => {
    const userRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="User" refkey={userRef}>
          <gql.FieldDefinition name="id" type={builtInScalars.ID} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Query">
          <gql.FieldDefinition
            name="user"
            type={userRef}
            args={
              <>
                <gql.InputValueDefinition
                  name="fragment"
                  type={builtInScalars.String}
                />
                <gql.InputValueDefinition
                  name="query"
                  type={builtInScalars.Boolean}
                />
              </>
            }
          />
        </gql.ObjectTypeDefinition>
      </>,
    );
    expect(result).toRenderTo(d`
      type User {
        id: ID
      }
      
      type Query {
        user(fragment: String, query: Boolean): User
      }
    `);
  });

  it("allows PascalCase names that match keywords after case transformation", () => {
    // PascalCase transformation makes lowercase keywords safe
    // E.g., "type" -> "Type", "enum" -> "Enum"
    // These don't conflict because GraphQL keywords are case-sensitive lowercase
    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="type">
          <gql.FieldDefinition name="value" type={builtInScalars.String} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Enum">
          <gql.FieldDefinition name="value" type={builtInScalars.String} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="INTERFACE">
          <gql.FieldDefinition name="id" type={builtInScalars.ID} />
        </gql.ObjectTypeDefinition>
      </>,
    );
    const expected = d`
      type Type {
        value: String
      }
      
      type Enum {
        value: String
      }
      
      type Interface {
        id: ID
      }
    `;
    expect(result).toRenderTo(expected);
  });

  it("appends _ to directive names that are exact keyword matches", () => {
    // Directives are top-level definitions, so exact keyword matches get suffixed
    const result = toGraphQLText(
      <>
        <gql.DirectiveDefinition
          name="query"
          locations={["FIELD_DEFINITION"]}
        />
        <gql.DirectiveDefinition name="type" locations={["FIELD_DEFINITION"]} />
      </>,
    );
    expect(result).toContain("directive @query_ on FIELD_DEFINITION");
    expect(result).toContain("directive @type_ on FIELD_DEFINITION");
  });
});

describe("Built-in scalar conflicts", () => {
  it("appends _ to type names that match built-in scalars", () => {
    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="Int">
          <gql.FieldDefinition name="value" type={builtInScalars.Int} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Float">
          <gql.FieldDefinition name="value" type={builtInScalars.Float} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="String">
          <gql.FieldDefinition name="value" type={builtInScalars.String} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Boolean">
          <gql.FieldDefinition name="value" type={builtInScalars.Boolean} />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="ID">
          <gql.FieldDefinition name="value" type={builtInScalars.ID} />
        </gql.ObjectTypeDefinition>
      </>,
    );
    // ID transforms to "Id" which doesn't match "ID", so no conflict
    const expected = d`
      type Int_ {
        value: Int
      }

      type Float_ {
        value: Float
      }

      type String_ {
        value: String
      }

      type Boolean_ {
        value: Boolean
      }

      type Id {
        value: ID
      }
    `;
    expect(result).toRenderTo(expected);
  });

  it("allows built-in scalar names as field names", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDefinition name="User">
        <gql.FieldDefinition name="Int" type={builtInScalars.String} />
        <gql.FieldDefinition name="String" type={builtInScalars.Boolean} />
      </gql.ObjectTypeDefinition>,
    );
    // Field names use camelCase, so "Int" -> "int", "String" -> "string"
    const expected = d`
      type User {
        int: String
        string: Boolean
      }
    `;
    expect(result).toRenderTo(expected);
  });
});

describe("Name format validation", () => {
  it("throws error when name starts with a digit", () => {
    expect(() => {
      toGraphQLText(
        <gql.ObjectTypeDefinition name="123User">
          <gql.FieldDefinition name="id" type={builtInScalars.ID} />
        </gql.ObjectTypeDefinition>,
      );
    }).toThrow(/Invalid GraphQL name "123User".*cannot start with a digit/);
  });

  it("throws error for field name starting with digit", () => {
    expect(() => {
      toGraphQLText(
        <gql.ObjectTypeDefinition name="User">
          <gql.FieldDefinition name="1stName" type={builtInScalars.String} />
        </gql.ObjectTypeDefinition>,
      );
    }).toThrow(/Invalid GraphQL name "1stName".*cannot start with a digit/);
  });

  it("allows names with digits after the first character", () => {
    const result = toGraphQLText(
      <gql.ObjectTypeDefinition name="User123">
        <gql.FieldDefinition name="field1" type={builtInScalars.String} />
      </gql.ObjectTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      type User123 {
        field1: String
      }
    `);
  });

  it("throws error for names starting with double underscore", () => {
    expect(() => {
      toGraphQLText(
        <gql.ObjectTypeDefinition name="__CustomType">
          <gql.FieldDefinition name="id" type={builtInScalars.ID} />
        </gql.ObjectTypeDefinition>,
      );
    }).toThrow(
      /Invalid GraphQL name "__CustomType".*reserved for GraphQL introspection system/,
    );
  });

  it("throws error for field names starting with double underscore", () => {
    expect(() => {
      toGraphQLText(
        <gql.ObjectTypeDefinition name="User">
          <gql.FieldDefinition name="__typename" type={builtInScalars.String} />
        </gql.ObjectTypeDefinition>,
      );
    }).toThrow(
      /Invalid GraphQL name "__typename".*reserved for GraphQL introspection system/,
    );
  });

  it("throws error for directive names starting with double underscore", () => {
    expect(() => {
      toGraphQLText(
        <gql.DirectiveDefinition
          name="__internal"
          locations={["FIELD_DEFINITION"]}
        />,
      );
    }).toThrow(
      /Invalid GraphQL name "__internal".*reserved for GraphQL introspection system/,
    );
  });
});

it("correct formatting of enum names (PascalCase)", () => {
  const result = toGraphQLText(
    <gql.EnumTypeDefinition name="user-status-type">
      <gql.EnumValue name="active" />
      <gql.EnumValue name="inactive" />
    </gql.EnumTypeDefinition>,
  );
  const expected = d`
    enum UserStatusType {
      ACTIVE
      INACTIVE
    }
  `;
  expect(result).toRenderTo(expected);
});

it("correct formatting of enum values (UPPER_SNAKE_CASE)", () => {
  const result = toGraphQLText(
    <gql.EnumTypeDefinition name="Status">
      <gql.EnumValue name="activeUser" />
      <gql.EnumValue name="InactiveUser" />
      <gql.EnumValue name="pending-approval" />
      <gql.EnumValue name="waitingForReview" />
    </gql.EnumTypeDefinition>,
  );
  const expected = d`
    enum Status {
      ACTIVE_USER
      INACTIVE_USER
      PENDING_APPROVAL
      WAITING_FOR_REVIEW
    }
  `;
  expect(result).toRenderTo(expected);
});

it("correct formatting of scalar names (PascalCase)", () => {
  const result = toGraphQLText(
    <>
      <gql.ScalarTypeDefinition name="date-time-scalar" />
      <gql.ScalarTypeDefinition name="json_value" />
      <gql.ScalarTypeDefinition name="url_string" />
    </>,
  );
  expect(result).toRenderTo(d`
    scalar DateTimeScalar
    
    scalar JsonValue
    
    scalar UrlString
  `);
});

it("correct formatting of union names (PascalCase)", () => {
  const result = toGraphQLText(
    <>
      <gql.UnionTypeDefinition
        name="search-result"
        members={["User", "Post"]}
      />
      <gql.UnionTypeDefinition name="media_item" members={["Image", "Video"]} />
      <gql.UnionTypeDefinition
        name="notification-type"
        members={["Email", "SMS"]}
      />
    </>,
  );
  expect(result).toRenderTo(d`
    union SearchResult = User | Post
    
    union MediaItem = Image | Video
    
    union NotificationType = Email | SMS
  `);
});

it("appends _ to enum names that conflict with reserved words", () => {
  const result = toGraphQLText(
    <>
      <gql.EnumTypeDefinition name="enum">
        <gql.EnumValue name="VALUE1" />
      </gql.EnumTypeDefinition>
      <gql.EnumTypeDefinition name="type">
        <gql.EnumValue name="VALUE2" />
      </gql.EnumTypeDefinition>
      <gql.EnumTypeDefinition name="input">
        <gql.EnumValue name="VALUE3" />
      </gql.EnumTypeDefinition>
    </>,
  );
  const expected = d`
    enum Enum_ {
      VALUE1
    }

    enum Type_ {
      VALUE2
    }

    enum Input_ {
      VALUE3
    }
  `;
  expect(result).toRenderTo(expected);
});
