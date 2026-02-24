# @alloy-js/thrift

Thrift IDL components for Alloy. Build `.thrift` files using JSX and let the
renderer handle formatting, includes, and symbol references.

## Basic usage

```tsx
import { Output, render } from "@alloy-js/core";
import {
  Enum,
  EnumValue,
  Field,
  SourceFile,
  Struct,
  defaultThriftNamePolicy,
  i64,
  string,
} from "@alloy-js/thrift";

const res = render(
  <Output namePolicy={defaultThriftNamePolicy}>
    <SourceFile path="user.thrift">
      <Enum name="Role">
        <EnumValue name="ADMIN" value={1} />
        <EnumValue name="USER" value={2} />
      </Enum>
      <Struct name="User">
        <Field id={1} required type={i64} name="id" />
        <Field id={2} type={string} name="name" />
        <Field id={3} type="Role" name="role" />
      </Struct>
    </SourceFile>
  </Output>,
);
```

## Cross-file includes via refkeys

```tsx
import { Output, refkey, render } from "@alloy-js/core";
import {
  Field,
  Service,
  ServiceFunction,
  SourceFile,
  Struct,
  defaultThriftNamePolicy,
  i64,
  string,
} from "@alloy-js/thrift";

const userRef = refkey();

const res = render(
  <Output namePolicy={defaultThriftNamePolicy}>
    <SourceFile path="user.thrift">
      <Struct name="User" refkey={userRef}>
        <Field id={1} type={string} name="name" />
      </Struct>
    </SourceFile>
    <SourceFile path="service.thrift">
      <Service name="UserService">
        <ServiceFunction name="getUser" returnType={userRef}>
          <Field id={1} type={i64} name="id" />
        </ServiceFunction>
      </Service>
    </SourceFile>
  </Output>,
);
```

When a refkey targets a symbol declared in a different file, the source file
automatically emits an `include` statement and prefixes the reference with the
include alias.

## Manual includes and namespaces

```tsx
import { Output, render } from "@alloy-js/core";
import {
  Include,
  Namespace,
  SourceFile,
  Typedef,
  defaultThriftNamePolicy,
  i64,
} from "@alloy-js/thrift";

const res = render(
  <Output namePolicy={defaultThriftNamePolicy}>
    <SourceFile
      path="api.thrift"
      includes={<Include path="shared.thrift" />}
      namespaces={<Namespace lang="js" value="example.api" />}
    >
      <Typedef name="UserId" type={i64} />
    </SourceFile>
  </Output>,
);
```
