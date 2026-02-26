import { refkey } from "@alloy-js/core";
import { expect, it } from "vitest";
import {
  Const,
  Enum,
  EnumValue,
  Exception,
  Field,
  LineComment,
  Namespace,
  Service,
  ServiceFunction,
  SourceFile,
  Struct,
  Throws,
  binary,
  bool,
  constRef,
  double,
  i32,
  i64,
  listOf,
  mapOf,
  rawConst,
  string,
} from "../src/index.js";
import {
  SnapshotFile,
  lines,
  permissiveNamePolicy,
  renderThriftFiles,
} from "./snapshot-utils.jsx";

const consistencyLevel = refkey();
const indexOperator = refkey();
const indexType = refkey();
const compression = refkey();
const cqlResultType = refkey();
const column = refkey();
const superColumn = refkey();
const counterColumn = refkey();
const counterSuperColumn = refkey();
const columnOrSuperColumn = refkey();
const columnParent = refkey();
const columnPath = refkey();
const sliceRange = refkey();
const slicePredicate = refkey();
const indexExpression = refkey();
const indexClause = refkey();
const keyRange = refkey();
const keySlice = refkey();
const keyCount = refkey();
const deletion = refkey();
const mutation = refkey();
const endpointDetails = refkey();
const casResult = refkey();
const columnDef = refkey();
const triggerDef = refkey();
const cfDef = refkey();
const tokenRange = refkey();
const cfSplit = refkey();
const cqlMetadata = refkey();
const cqlPreparedResult = refkey();
const cqlResult = refkey();
const cqlRow = refkey();
const authenticationRequest = refkey();
const authenticationException = refkey();
const authorizationException = refkey();
const invalidRequestException = refkey();
const notFoundException = refkey();
const unavailableException = refkey();
const timedOutException = refkey();
const schemaDisagreementException = refkey();
const multiSliceRequest = refkey();
const ksDef = refkey();
const columnSlice = refkey();
const cassandraService = refkey();

const CL_ONE = constRef("ConsistencyLevel.ONE");
const CL_SERIAL = constRef("ConsistencyLevel.SERIAL");
const CL_QUORUM = constRef("ConsistencyLevel.QUORUM");

export const files: SnapshotFile[] = [
  {
    path: "cassandra.thrift",
    file: (
      <SourceFile
        path="cassandra.thrift"
        namePolicy={permissiveNamePolicy}
        header={
          <>
            {"#!/usr/local/bin/thrift --java --php --py"}
            <LineComment prefix="#">
              {lines(`
                Licensed to the Apache Software Foundation (ASF) under one
                or more contributor license agreements.  See the NOTICE file
                distributed with this work for additional information
                regarding copyright ownership.  The ASF licenses this file
                to you under the Apache License, Version 2.0 (the
                "License"); you may not use this file except in compliance
                with the License.  You may obtain a copy of the License at

                    http://www.apache.org/licenses/LICENSE-2.0

                Unless required by applicable law or agreed to in writing, software
                distributed under the License is distributed on an "AS IS" BASIS,
                WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                See the License for the specific language governing permissions and
                limitations under the License.
              `)}
            </LineComment>
            <hbr />
            <LineComment prefix="#">
              {lines(`
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                *** PLEASE REMEMBER TO EDIT THE VERSION CONSTANT WHEN MAKING CHANGES ***
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              `)}
            </LineComment>
            <hbr />
            <LineComment prefix="#">
              {["", "Interface definition for Cassandra Service", ""]}
            </LineComment>
          </>
        }
        namespaces={[
          <Namespace lang="java" value="org.apache.cassandra.thrift" />,
          <Namespace lang="cpp" value="org.apache.cassandra" />,
          <Namespace lang="csharp" value="Apache.Cassandra" />,
          <Namespace lang="py" value="cassandra" />,
          <Namespace lang="php" value="cassandra" />,
          <Namespace lang="perl" value="Cassandra" />,
          <>
            <hbr />
            <LineComment prefix="#">
              {[
                "Thrift.rb has a bug where top-level modules that include modules ",
                "with the same name are not properly referenced, so we can't do",
                "Cassandra::Cassandra::Client.",
              ]}
            </LineComment>
          </>,
          <Namespace lang="rb" value="CassandraThrift" />,
        ]}
      >
        <Const
          name="VERSION"
          type={string}
          value={"20.1.0"}
          doc={
            <LineComment prefix="#">
              {lines(`
                The API version (NOT the product version), composed as a dot delimited
                string with major, minor, and patch level components.

                 - Major: Incremented for backward incompatible changes. An example would
                          be changes to the number or disposition of method arguments.
                 - Minor: Incremented for backward compatible changes. An example would
                          be the addition of a new (optional) method.
                 - Patch: Incremented for bug fixes. The patch level should be increased
                          for every edit that doesn't result in a change to major/minor.

                See the Semantic Versioning Specification (SemVer) http://semver.org.

                Note that this backwards compatibility is from the perspective of the server,
                not the client. Cassandra should always be able to talk to older client
                software, but client software may not be able to talk to older Cassandra
                instances.

                An effort should be made not to break forward-client-compatibility either
                (e.g. one should avoid removing obsolete fields from the IDL), but no
                guarantees in this respect are made by the Cassandra project.
              `)}
            </LineComment>
          }
        />

        <LineComment prefix="#">{["", "data structures", ""]}</LineComment>
        <Struct
          name="Column"
          refkey={column}
          doc={lines(`
            Basic unit of data within a ColumnFamily.
            @param name, the name by which this column is set and retrieved.  Maximum 64KB long.
            @param value. The data associated with the name.  Maximum 2GB long, but in practice you should limit it to small numbers of MB (since Thrift must read the full value into memory to operate on it).
            @param timestamp. The timestamp is used for conflict detection/resolution when two columns with same name need to be compared.
            @param ttl. An optional, positive delay (in seconds) after which the column will be automatically deleted.
          `)}
        >
          <Field id={1} required type={binary} name="name" />
          <Field id={2} optional type={binary} name="value" />
          <Field id={3} optional type={i64} name="timestamp" />
          <Field id={4} optional type={i32} name="ttl" />
        </Struct>
        <Struct
          name="SuperColumn"
          refkey={superColumn}
          doc={lines(`
            A named list of columns.
            @param name. see Column.name.
            @param columns. A collection of standard Columns.  The columns within a super column are defined in an adhoc manner.
                            Columns within a super column do not have to have matching structures (similarly named child columns).
          `)}
        >
          <Field id={1} required type={binary} name="name" />
          <Field id={2} required type={listOf(column)} name="columns" />
        </Struct>
        <Struct name="CounterColumn" refkey={counterColumn}>
          <Field id={1} required type={binary} name="name" />
          <Field id={2} required type={i64} name="value" />
        </Struct>
        <Struct name="CounterSuperColumn" refkey={counterSuperColumn}>
          <Field id={1} required type={binary} name="name" />
          <Field id={2} required type={listOf(counterColumn)} name="columns" />
        </Struct>
        <Struct
          name="ColumnOrSuperColumn"
          refkey={columnOrSuperColumn}
          doc={lines(`
            Methods for fetching rows/records from Cassandra will return either a single instance of ColumnOrSuperColumn or a list
            of ColumnOrSuperColumns (get_slice()). If you're looking up a SuperColumn (or list of SuperColumns) then the resulting
            instances of ColumnOrSuperColumn will have the requested SuperColumn in the attribute super_column. For queries resulting
            in Columns, those values will be in the attribute column. This change was made between 0.3 and 0.4 to standardize on
            single query methods that may return either a SuperColumn or Column.

            If the query was on a counter column family, you will either get a counter_column (instead of a column) or a
            counter_super_column (instead of a super_column)

            @param column. The Column returned by get() or get_slice().
            @param super_column. The SuperColumn returned by get() or get_slice().
            @param counter_column. The Counterolumn returned by get() or get_slice().
            @param counter_super_column. The CounterSuperColumn returned by get() or get_slice().
          `)}
        >
          <Field id={1} optional type={column} name="column" />
          <Field id={2} optional type={superColumn} name="super_column" />
          <Field id={3} optional type={counterColumn} name="counter_column" />
          <Field
            id={4}
            optional
            type={counterSuperColumn}
            name="counter_super_column"
          />
        </Struct>

        <LineComment prefix="#">
          {[
            "",
            "Exceptions",
            "(note that internal server errors will raise a TApplicationException, courtesy of Thrift)",
            "",
          ]}
        </LineComment>
        <Exception
          name="NotFoundException"
          refkey={notFoundException}
          doc="A specific column was requested that does not exist."
        ></Exception>
        <Exception
          name="InvalidRequestException"
          refkey={invalidRequestException}
          doc={lines(`
            Invalid request could mean keyspace or column family does not exist, required parameters are missing, or a parameter is malformed.
            why contains an associated error message.
          `)}
        >
          <Field id={1} required type={string} name="why" />
        </Exception>
        <Exception
          name="UnavailableException"
          refkey={unavailableException}
          doc="Not all the replicas required could be created and/or read."
        ></Exception>
        <Exception
          name="TimedOutException"
          refkey={timedOutException}
          doc="RPC timeout was exceeded.  either a node failed mid-operation, or load was too high, or the requested op was too large."
        >
          <Field
            id={1}
            optional
            type={i32}
            name="acknowledged_by"
            doc={[
              ...lines(`
              if a write operation was acknowledged by some replicas but not by enough to
              satisfy the required ConsistencyLevel, the number of successful
              replies will be given here. In case of atomic_batch_mutate method this field
              will be set to -1 if the batch was written to the batchlog and to 0 if it wasn't.
            `),
              "",
            ]}
          />
          <Field
            id={2}
            optional
            type={bool}
            name="acknowledged_by_batchlog"
            doc={[
              ...lines(`
              in case of atomic_batch_mutate method this field tells if the batch
              was written to the batchlog.
            `),
              "",
            ]}
          />
          <Field
            id={3}
            optional
            type={bool}
            name="paxos_in_progress"
            doc={[
              ...lines(`
              for the CAS method, this field tells if we timed out during the paxos
              protocol, as opposed to during the commit of our update
            `),
              "",
            ]}
          />
        </Exception>
        <Exception
          name="AuthenticationException"
          refkey={authenticationException}
          doc="invalid authentication request (invalid keyspace, user does not exist, or credentials invalid)"
        >
          <Field id={1} required type={string} name="why" />
        </Exception>
        <Exception
          name="AuthorizationException"
          refkey={authorizationException}
          doc="invalid authorization request (user does not have access to keyspace)"
        >
          <Field id={1} required type={string} name="why" />
        </Exception>
        <Exception
          name="SchemaDisagreementException"
          refkey={schemaDisagreementException}
          doc={lines(`
            NOTE: This up outdated exception left for backward compatibility reasons,
            no actual schema agreement validation is done starting from Cassandra 1.2

            schemas are not in agreement across all nodes
          `)}
        ></Exception>

        <LineComment prefix="#">{["", "service api", ""]}</LineComment>
        <Enum
          name="ConsistencyLevel"
          refkey={consistencyLevel}
          doc={lines(`
            The ConsistencyLevel is an enum that controls both read and write
            behavior based on the ReplicationFactor of the keyspace.  The
            different consistency levels have different meanings, depending on
            if you're doing a write or read operation.

            If W + R > ReplicationFactor, where W is the number of nodes to
            block for on write, and R the number to block for on reads, you
            will have strongly consistent behavior; that is, readers will
            always see the most recent write. Of these, the most interesting is
            to do QUORUM reads and writes, which gives you consistency while
            still allowing availability in the face of node failures up to half
            of <ReplicationFactor>. Of course if latency is more important than
            consistency then you can use lower values for either or both.

            Some ConsistencyLevels (ONE, TWO, THREE) refer to a specific number
            of replicas rather than a logical concept that adjusts
            automatically with the replication factor.  Of these, only ONE is
            commonly used; TWO and (even more rarely) THREE are only useful
            when you care more about guaranteeing a certain level of
            durability, than consistency.

            Write consistency levels make the following guarantees before reporting success to the client:
              ANY          Ensure that the write has been written once somewhere, including possibly being hinted in a non-target node.
              ONE          Ensure that the write has been written to at least 1 node's commit log and memory table
              TWO          Ensure that the write has been written to at least 2 node's commit log and memory table
              THREE        Ensure that the write has been written to at least 3 node's commit log and memory table
              QUORUM       Ensure that the write has been written to <ReplicationFactor> / 2 + 1 nodes
              LOCAL_ONE    Ensure that the write has been written to 1 node within the local datacenter (requires NetworkTopologyStrategy)
              LOCAL_QUORUM Ensure that the write has been written to <ReplicationFactor> / 2 + 1 nodes, within the local datacenter (requires NetworkTopologyStrategy)
              EACH_QUORUM  Ensure that the write has been written to <ReplicationFactor> / 2 + 1 nodes in each datacenter (requires NetworkTopologyStrategy)
              ALL          Ensure that the write is written to <code>&lt;ReplicationFactor&gt;</code> nodes before responding to the client.

            Read consistency levels make the following guarantees before returning successful results to the client:
              ANY          Not supported. You probably want ONE instead.
              ONE          Returns the record obtained from a single replica.
              TWO          Returns the record with the most recent timestamp once two replicas have replied.
              THREE        Returns the record with the most recent timestamp once three replicas have replied.
              QUORUM       Returns the record with the most recent timestamp once a majority of replicas have replied.
              LOCAL_ONE    Returns the record with the most recent timestamp once a single replica within the local datacenter have replied.
              LOCAL_QUORUM Returns the record with the most recent timestamp once a majority of replicas within the local datacenter have replied.
              EACH_QUORUM  Returns the record with the most recent timestamp once a majority of replicas within each datacenter have replied.
              ALL          Returns the record with the most recent timestamp once all replicas have replied (implies no replica may be down)..
          `)}
        >
          <EnumValue name="ONE" value={1} />
          <EnumValue name="QUORUM" value={2} />
          <EnumValue name="LOCAL_QUORUM" value={3} />
          <EnumValue name="EACH_QUORUM" value={4} />
          <EnumValue name="ALL" value={5} />
          <EnumValue name="ANY" value={6} />
          <EnumValue name="TWO" value={7} />
          <EnumValue name="THREE" value={8} />
          <EnumValue name="SERIAL" value={9} />
          <EnumValue name="LOCAL_SERIAL" value={10} />
          <EnumValue name="LOCAL_ONE" value={11} />
        </Enum>
        <Struct
          name="ColumnParent"
          refkey={columnParent}
          doc={lines(`
            ColumnParent is used when selecting groups of columns from the same ColumnFamily. In directory structure terms, imagine
            ColumnParent as ColumnPath + '/../'.

            See also <a href="cassandra.html#Struct_ColumnPath">ColumnPath</a>
          `)}
        >
          <Field id={3} required type={string} name="column_family" />
          <Field id={4} optional type={binary} name="super_column" />
        </Struct>
        <Struct
          name="ColumnPath"
          refkey={columnPath}
          doc={lines(`
            The ColumnPath is the path to a single column in Cassandra. It might make sense to think of ColumnPath and
            ColumnParent in terms of a directory structure.

            ColumnPath is used to looking up a single column.

            @param column_family. The name of the CF of the column being looked up.
            @param super_column. The super column name.
            @param column. The column name.
          `)}
        >
          <Field id={3} required type={string} name="column_family" />
          <Field id={4} optional type={binary} name="super_column" />
          <Field id={5} optional type={binary} name="column" />
        </Struct>
        <Struct
          name="SliceRange"
          refkey={sliceRange}
          doc={lines(`
            A slice range is a structure that stores basic range, ordering and limit information for a query that will return
            multiple columns. It could be thought of as Cassandra's version of LIMIT and ORDER BY

            @param start. The column name to start the slice with. This attribute is not required, though there is no default value,
                          and can be safely set to '', i.e., an empty byte array, to start with the first column name. Otherwise, it
                          must a valid value under the rules of the Comparator defined for the given ColumnFamily.
            @param finish. The column name to stop the slice at. This attribute is not required, though there is no default value,
                           and can be safely set to an empty byte array to not stop until 'count' results are seen. Otherwise, it
                           must also be a valid value to the ColumnFamily Comparator.
            @param reversed. Whether the results should be ordered in reversed order. Similar to ORDER BY blah DESC in SQL.
            @param count. How many columns to return. Similar to LIMIT in SQL. May be arbitrarily large, but Thrift will
                          materialize the whole result into memory before returning it to the client, so be aware that you may
                          be better served by iterating through slices by passing the last value of one call in as the 'start'
                          of the next instead of increasing 'count' arbitrarily large.
          `)}
        >
          <Field id={1} required type={binary} name="start" />
          <Field id={2} required type={binary} name="finish" />
          <Field id={3} required type={bool} name="reversed" default={0} />
          <Field id={4} required type={i32} name="count" default={100} />
        </Struct>
        <Struct
          name="SlicePredicate"
          refkey={slicePredicate}
          doc={lines(`
            A SlicePredicate is similar to a mathematic predicate (see http://en.wikipedia.org/wiki/Predicate_(mathematical_logic)),
            which is described as "a property that the elements of a set have in common."

            SlicePredicate's in Cassandra are described with either a list of column_names or a SliceRange.  If column_names is
            specified, slice_range is ignored.

            @param column_name. A list of column names to retrieve. This can be used similar to Memcached's "multi-get" feature
                                to fetch N known column names. For instance, if you know you wish to fetch columns 'Joe', 'Jack',
                                and 'Jim' you can pass those column names as a list to fetch all three at once.
            @param slice_range. A SliceRange describing how to range, order, and/or limit the slice.
          `)}
        >
          <Field id={1} optional type={listOf(binary)} name="column_names" />
          <Field id={2} optional type={sliceRange} name="slice_range" />
        </Struct>
        <Enum name="IndexOperator" refkey={indexOperator}>
          <EnumValue name="EQ" value={0} />
          <EnumValue name="GTE" value={1} />
          <EnumValue name="GT" value={2} />
          <EnumValue name="LTE" value={3} />
          <EnumValue name="LT" value={4} />
        </Enum>
        <Struct name="IndexExpression" refkey={indexExpression}>
          <Field id={1} required type={binary} name="column_name" />
          <Field id={2} required type={indexOperator} name="op" />
          <Field id={3} required type={binary} name="value" />
        </Struct>
        <Struct
          name="IndexClause"
          refkey={indexClause}
          doc="@deprecated use a KeyRange with row_filter in get_range_slices instead"
        >
          <Field
            id={1}
            required
            type={listOf(indexExpression)}
            name="expressions"
          />
          <Field id={2} required type={binary} name="start_key" />
          <Field id={3} required type={i32} name="count" default={100} />
        </Struct>
        <Struct
          name="KeyRange"
          refkey={keyRange}
          doc={lines(`
            The semantics of start keys and tokens are slightly different.
            Keys are start-inclusive; tokens are start-exclusive.  Token
            ranges may also wrap -- that is, the end token may be less
            than the start one.  Thus, a range from keyX to keyX is a
            one-element range, but a range from tokenY to tokenY is the
            full ring.
          `)}
        >
          <Field id={1} optional type={binary} name="start_key" />
          <Field id={2} optional type={binary} name="end_key" />
          <Field id={3} optional type={string} name="start_token" />
          <Field id={4} optional type={string} name="end_token" />
          <Field
            id={6}
            optional
            type={listOf(indexExpression)}
            name="row_filter"
          />
          <Field id={5} required type={i32} name="count" default={100} />
        </Struct>
        <Struct
          name="KeySlice"
          refkey={keySlice}
          doc={lines(`
            A KeySlice is key followed by the data it maps to. A collection of KeySlice is returned by the get_range_slice operation.

            @param key. a row key
            @param columns. List of data represented by the key. Typically, the list is pared down to only the columns specified by
                            a SlicePredicate.
          `)}
        >
          <Field id={1} required type={binary} name="key" />
          <Field
            id={2}
            required
            type={listOf(columnOrSuperColumn)}
            name="columns"
          />
        </Struct>
        <Struct name="KeyCount" refkey={keyCount}>
          <Field id={1} required type={binary} name="key" />
          <Field id={2} required type={i32} name="count" />
        </Struct>
        <Struct
          name="Deletion"
          refkey={deletion}
          doc="Note that the timestamp is only optional in case of counter deletion."
        >
          <Field id={1} optional type={i64} name="timestamp" />
          <Field id={2} optional type={binary} name="super_column" />
          <Field id={3} optional type={slicePredicate} name="predicate" />
        </Struct>
        <Struct
          name="Mutation"
          refkey={mutation}
          doc={lines(`
            A Mutation is either an insert (represented by filling column_or_supercolumn) or a deletion (represented by filling the deletion attribute).
            @param column_or_supercolumn. An insert to a column or supercolumn (possibly counter column or supercolumn)
            @param deletion. A deletion of a column or supercolumn
          `)}
        >
          <Field
            id={1}
            optional
            type={columnOrSuperColumn}
            name="column_or_supercolumn"
          />
          <Field id={2} optional type={deletion} name="deletion" />
        </Struct>
        <Struct name="EndpointDetails" refkey={endpointDetails}>
          <Field id={1} type={string} name="host" />
          <Field id={2} type={string} name="datacenter" />
          <Field id={3} optional type={string} name="rack" />
        </Struct>
        <Struct name="CASResult" refkey={casResult}>
          <Field id={1} required type={bool} name="success" />
          <Field id={2} optional type={listOf(column)} name="current_values" />
        </Struct>
        <Struct
          name="TokenRange"
          refkey={tokenRange}
          doc={lines(`
            A TokenRange describes part of the Cassandra ring, it is a mapping from a range to
            endpoints responsible for that range.
            @param start_token The first token in the range
            @param end_token The last token in the range
            @param endpoints The endpoints responsible for the range (listed by their configured listen_address)
            @param rpc_endpoints The endpoints responsible for the range (listed by their configured rpc_address)
          `)}
        >
          <Field id={1} required type={string} name="start_token" />
          <Field id={2} required type={string} name="end_token" />
          <Field id={3} required type={listOf(string)} name="endpoints" />
          <Field id={4} optional type={listOf(string)} name="rpc_endpoints" />
          <Field
            id={5}
            optional
            type={listOf(endpointDetails)}
            name="endpoint_details"
          />
        </Struct>
        <Struct
          name="AuthenticationRequest"
          refkey={authenticationRequest}
          doc="Authentication requests can contain any data, dependent on the IAuthenticator used"
        >
          <Field
            id={1}
            required
            type={mapOf(string, string)}
            name="credentials"
          />
        </Struct>
        <Enum name="IndexType" refkey={indexType}>
          <EnumValue name="KEYS" value={0} />
          <EnumValue name="CUSTOM" value={1} />
          <EnumValue name="COMPOSITES" value={2} />
        </Enum>
        <Struct
          name="ColumnDef"
          refkey={columnDef}
          doc="describes a column in a column family."
        >
          <Field id={1} required type={binary} name="name" />
          <Field id={2} required type={string} name="validation_class" />
          <Field id={3} optional type={indexType} name="index_type" />
          <Field id={4} optional type={string} name="index_name" />
          <Field
            id={5}
            optional
            type={mapOf(string, string)}
            name="index_options"
          />
        </Struct>
        <Struct
          name="TriggerDef"
          refkey={triggerDef}
          doc={lines(`
            Describes a trigger.
            \`options\` should include at least 'class' param.
            Other options are not supported yet.
          `)}
        >
          <Field id={1} required type={string} name="name" />
          <Field id={2} required type={mapOf(string, string)} name="options" />
        </Struct>
        <Struct name="CfDef" refkey={cfDef} doc="describes a column family.">
          <Field id={1} required type={string} name="keyspace" />
          <Field id={2} required type={string} name="name" />
          <Field
            id={3}
            optional
            type={string}
            name="column_type"
            default={"Standard"}
          />
          <Field
            id={5}
            optional
            type={string}
            name="comparator_type"
            default={"BytesType"}
          />
          <Field id={6} optional type={string} name="subcomparator_type" />
          <Field id={8} optional type={string} name="comment" />
          <Field id={12} optional type={double} name="read_repair_chance" />
          <Field
            id={13}
            optional
            type={listOf(columnDef)}
            name="column_metadata"
          />
          <Field id={14} optional type={i32} name="gc_grace_seconds" />
          <Field
            id={15}
            optional
            type={string}
            name="default_validation_class"
          />
          <Field id={16} optional type={i32} name="id" />
          <Field id={17} optional type={i32} name="min_compaction_threshold" />
          <Field id={18} optional type={i32} name="max_compaction_threshold" />
          <Field id={26} optional type={string} name="key_validation_class" />
          <Field id={28} optional type={binary} name="key_alias" />
          <Field id={29} optional type={string} name="compaction_strategy" />
          <Field
            id={30}
            optional
            type={mapOf(string, string)}
            name="compaction_strategy_options"
          />
          <Field
            id={32}
            optional
            type={mapOf(string, string)}
            name="compression_options"
          />
          <Field id={33} optional type={double} name="bloom_filter_fp_chance" />
          <Field
            id={34}
            optional
            type={string}
            name="caching"
            default={"keys_only"}
          />
          <Field
            id={37}
            optional
            type={double}
            name="dclocal_read_repair_chance"
            default={rawConst("0.0")}
          />
          <Field
            id={39}
            optional
            type={i32}
            name="memtable_flush_period_in_ms"
          />
          <Field id={40} optional type={i32} name="default_time_to_live" />
          <Field
            id={42}
            optional
            type={string}
            name="speculative_retry"
            default={"NONE"}
          />
          <Field id={43} optional type={listOf(triggerDef)} name="triggers" />
          <Field
            id={44}
            optional
            type={string}
            name="cells_per_row_to_cache"
            default={"100"}
          />
          <Field id={45} optional type={i32} name="min_index_interval" />
          <Field id={46} optional type={i32} name="max_index_interval" />
          <Field
            id={9}
            optional
            type={double}
            name="row_cache_size"
            doc="@deprecated"
          />
          <Field
            id={11}
            optional
            type={double}
            name="key_cache_size"
            doc="@deprecated"
          />
          <Field
            id={19}
            optional
            type={i32}
            name="row_cache_save_period_in_seconds"
            doc="@deprecated"
          />
          <Field
            id={20}
            optional
            type={i32}
            name="key_cache_save_period_in_seconds"
            doc="@deprecated"
          />
          <Field
            id={21}
            optional
            type={i32}
            name="memtable_flush_after_mins"
            doc="@deprecated"
          />
          <Field
            id={22}
            optional
            type={i32}
            name="memtable_throughput_in_mb"
            doc="@deprecated"
          />
          <Field
            id={23}
            optional
            type={double}
            name="memtable_operations_in_millions"
            doc="@deprecated"
          />
          <Field
            id={24}
            optional
            type={bool}
            name="replicate_on_write"
            doc="@deprecated"
          />
          <Field
            id={25}
            optional
            type={double}
            name="merge_shards_chance"
            doc="@deprecated"
          />
          <Field
            id={27}
            optional
            type={string}
            name="row_cache_provider"
            doc="@deprecated"
          />
          <Field
            id={31}
            optional
            type={i32}
            name="row_cache_keys_to_save"
            doc="@deprecated"
          />
          <Field
            id={38}
            optional
            type={bool}
            name="populate_io_cache_on_flush"
            doc="@deprecated"
          />
          <Field
            id={41}
            optional
            type={i32}
            name="index_interval"
            doc="@deprecated"
          />
        </Struct>
        <Struct name="KsDef" refkey={ksDef} doc="describes a keyspace.">
          <Field id={1} required type={string} name="name" />
          <Field id={2} required type={string} name="strategy_class" />
          <Field
            id={3}
            optional
            type={mapOf(string, string)}
            name="strategy_options"
          />
          <Field
            id={4}
            optional
            type={i32}
            name="replication_factor"
            doc="@deprecated ignored"
          />
          <Field id={5} required type={listOf(cfDef)} name="cf_defs" />
          <Field
            id={6}
            optional
            type={bool}
            name="durable_writes"
            default={1}
          />
        </Struct>
        <Enum
          name="Compression"
          refkey={compression}
          doc="CQL query compression"
        >
          <EnumValue name="GZIP" value={1} />
          <EnumValue name="NONE" value={2} />
        </Enum>
        <Enum name="CqlResultType" refkey={cqlResultType}>
          <EnumValue name="ROWS" value={1} />
          <EnumValue name="VOID" value={2} />
          <EnumValue name="INT" value={3} />
        </Enum>
        <Struct
          name="CqlRow"
          refkey={cqlRow}
          doc={lines(`
            Row returned from a CQL query.

            This struct is used for both CQL2 and CQL3 queries.  For CQL2, the partition key
            is special-cased and is always returned.  For CQL3, it is not special cased;
            it will be included in the columns list if it was included in the SELECT and
            the key field is always null.
          `)}
        >
          <Field id={1} required type={binary} name="key" />
          <Field id={2} required type={listOf(column)} name="columns" />
        </Struct>
        <Struct name="CqlMetadata" refkey={cqlMetadata}>
          <Field
            id={1}
            required
            type={mapOf(binary, string)}
            name="name_types"
          />
          <Field
            id={2}
            required
            type={mapOf(binary, string)}
            name="value_types"
          />
          <Field id={3} required type={string} name="default_name_type" />
          <Field id={4} required type={string} name="default_value_type" />
        </Struct>
        <Struct name="CqlResult" refkey={cqlResult}>
          <Field id={1} required type={cqlResultType} name="type" />
          <Field id={2} optional type={listOf(cqlRow)} name="rows" />
          <Field id={3} optional type={i32} name="num" />
          <Field id={4} optional type={cqlMetadata} name="schema" />
        </Struct>
        <Struct name="CqlPreparedResult" refkey={cqlPreparedResult}>
          <Field id={1} required type={i32} name="itemId" />
          <Field id={2} required type={i32} name="count" />
          <Field id={3} optional type={listOf(string)} name="variable_types" />
          <Field id={4} optional type={listOf(string)} name="variable_names" />
        </Struct>
        <Struct
          name="CfSplit"
          refkey={cfSplit}
          doc="Represents input splits used by hadoop ColumnFamilyRecordReaders"
        >
          <Field id={1} required type={string} name="start_token" />
          <Field id={2} required type={string} name="end_token" />
          <Field id={3} required type={i64} name="row_count" />
        </Struct>
        <Struct
          name="ColumnSlice"
          refkey={columnSlice}
          doc={lines(`
            The ColumnSlice is used to select a set of columns from inside a row.
            If start or finish are unspecified they will default to the start-of
            end-of value.
            @param start. The start of the ColumnSlice inclusive
            @param finish. The end of the ColumnSlice inclusive
          `)}
        >
          <Field id={1} optional type={binary} name="start" />
          <Field id={2} optional type={binary} name="finish" />
        </Struct>
        <Struct
          name="MultiSliceRequest"
          refkey={multiSliceRequest}
          doc={lines(`
            Used to perform multiple slices on a single row key in one rpc operation
            @param key. The row key to be multi sliced
            @param column_parent. The column family (super columns are unsupported)
            @param column_slices. 0 to many ColumnSlice objects each will be used to select columns
            @param reversed. Direction of slice
            @param count. Maximum number of columns
            @param consistency_level. Level to perform the operation at
          `)}
        >
          <Field id={1} optional type={binary} name="key" />
          <Field id={2} optional type={columnParent} name="column_parent" />
          <Field
            id={3}
            optional
            type={listOf(columnSlice)}
            name="column_slices"
          />
          <Field id={4} optional type={bool} name="reversed" default={false} />
          <Field id={5} optional type={i32} name="count" default={1000} />
          <Field
            id={6}
            optional
            type={consistencyLevel}
            name="consistency_level"
            default={CL_ONE}
          />
        </Struct>

        <Service name="Cassandra" refkey={cassandraService}>
          <ServiceFunction
            name="login"
            doc={<LineComment prefix="#">auth methods</LineComment>}
          >
            <Field
              id={1}
              required
              type={authenticationRequest}
              name="auth_request"
            />
            <Throws>
              <Field id={1} type={authenticationException} name="authnx" />
              <Field id={2} type={authorizationException} name="authzx" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="set_keyspace"
            doc={<LineComment prefix="#">set keyspace</LineComment>}
          >
            <Field id={1} required type={string} name="keyspace" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <LineComment prefix="#">retrieval methods</LineComment>
          <ServiceFunction
            name="get"
            returnType={columnOrSuperColumn}
            breakParams
            doc={lines(`
              Get the Column or SuperColumn at the given column_path. If no value is present, NotFoundException is thrown. (This is
              the only method that can throw an exception under non-failure conditions.)
            `)}
          >
            <Field id={1} required type={binary} name="key" />
            <Field id={2} required type={columnPath} name="column_path" />
            <Field
              id={3}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={CL_ONE}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={notFoundException} name="nfe" />
              <Field id={3} type={unavailableException} name="ue" />
              <Field id={4} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="get_slice"
            returnType={listOf(columnOrSuperColumn)}
            breakParams
            doc={lines(`
              Get the group of columns contained by column_parent (either a ColumnFamily name or a ColumnFamily/SuperColumn name
              pair) specified by the given SlicePredicate. If no matching values are found, an empty list is returned.
            `)}
          >
            <Field id={1} required type={binary} name="key" />
            <Field id={2} required type={columnParent} name="column_parent" />
            <Field id={3} required type={slicePredicate} name="predicate" />
            <Field
              id={4}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={CL_ONE}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="get_count"
            returnType={i32}
            breakParams
            doc={lines(`
              returns the number of columns matching <code>predicate</code> for a particular <code>key</code>,
              <code>ColumnFamily</code> and optionally <code>SuperColumn</code>.
            `)}
          >
            <Field id={1} required type={binary} name="key" />
            <Field id={2} required type={columnParent} name="column_parent" />
            <Field id={3} required type={slicePredicate} name="predicate" />
            <Field
              id={4}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={CL_ONE}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="multiget_slice"
            returnType={mapOf(binary, listOf(columnOrSuperColumn))}
            breakParams
            doc="Performs a get_slice for column_parent and predicate for the given keys in parallel."
          >
            <Field id={1} required type={listOf(binary)} name="keys" />
            <Field id={2} required type={columnParent} name="column_parent" />
            <Field id={3} required type={slicePredicate} name="predicate" />
            <Field
              id={4}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={CL_ONE}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="multiget_count"
            returnType={mapOf(binary, i32)}
            breakParams
            doc="Perform a get_count in parallel on the given list<binary> keys. The return value maps keys to the count found."
          >
            <Field id={1} required type={listOf(binary)} name="keys" />
            <Field id={2} required type={columnParent} name="column_parent" />
            <Field id={3} required type={slicePredicate} name="predicate" />
            <Field
              id={4}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={CL_ONE}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="get_range_slices"
            returnType={listOf(keySlice)}
            breakParams
            doc="returns a subset of columns for a contiguous range of keys."
          >
            <Field id={1} required type={columnParent} name="column_parent" />
            <Field id={2} required type={slicePredicate} name="predicate" />
            <Field id={3} required type={keyRange} name="range" />
            <Field
              id={4}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={CL_ONE}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="get_paged_slice"
            returnType={listOf(keySlice)}
            breakParams
            doc="returns a range of columns, wrapping to the next rows if necessary to collect max_results."
          >
            <Field id={1} required type={string} name="column_family" />
            <Field id={2} required type={keyRange} name="range" />
            <Field id={3} required type={binary} name="start_column" />
            <Field
              id={4}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={CL_ONE}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="get_indexed_slices"
            returnType={listOf(keySlice)}
            breakParams
            doc={lines(`
              Returns the subset of columns specified in SlicePredicate for the rows matching the IndexClause
              @deprecated use get_range_slices instead with range.row_filter specified
            `)}
          >
            <Field id={1} required type={columnParent} name="column_parent" />
            <Field id={2} required type={indexClause} name="index_clause" />
            <Field
              id={3}
              required
              type={slicePredicate}
              name="column_predicate"
            />
            <Field
              id={4}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={CL_ONE}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <LineComment prefix="#">modification methods</LineComment>
          <ServiceFunction
            name="insert"
            breakParams
            doc="Insert a Column at the given column_parent.column_family and optional column_parent.super_column."
          >
            <Field id={1} required type={binary} name="key" />
            <Field id={2} required type={columnParent} name="column_parent" />
            <Field id={3} required type={column} name="column" />
            <Field
              id={4}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={CL_ONE}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="add"
            breakParams
            doc="Increment or decrement a counter."
          >
            <Field id={1} required type={binary} name="key" />
            <Field id={2} required type={columnParent} name="column_parent" />
            <Field id={3} required type={counterColumn} name="column" />
            <Field
              id={4}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={CL_ONE}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="cas"
            returnType={casResult}
            breakParams
            doc={lines(`
              Atomic compare and set.

              If the cas is successfull, the success boolean in CASResult will be true and there will be no current_values.
              Otherwise, success will be false and current_values will contain the current values for the columns in
              expected (that, by definition of compare-and-set, will differ from the values in expected).

              A cas operation takes 2 consistency level. The first one, serial_consistency_level, simply indicates the
              level of serialization required. This can be either ConsistencyLevel.SERIAL or ConsistencyLevel.LOCAL_SERIAL.
              The second one, commit_consistency_level, defines the consistency level for the commit phase of the cas. This
              is a more traditional consistency level (the same CL than for traditional writes are accepted) that impact
              the visibility for reads of the operation. For instance, if commit_consistency_level is QUORUM, then it is
              guaranteed that a followup QUORUM read will see the cas write (if that one was successful obviously). If
              commit_consistency_level is ANY, you will need to use a SERIAL/LOCAL_SERIAL read to be guaranteed to see
              the write.
            `)}
          >
            <Field id={1} required type={binary} name="key" />
            <Field id={2} required type={string} name="column_family" />
            <Field id={3} type={listOf(column)} name="expected" />
            <Field id={4} type={listOf(column)} name="updates" />
            <Field
              id={5}
              required
              type={consistencyLevel}
              name="serial_consistency_level"
              default={CL_SERIAL}
            />
            <Field
              id={6}
              required
              type={consistencyLevel}
              name="commit_consistency_level"
              default={CL_QUORUM}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="remove"
            breakParams
            doc={lines(`
              Remove data from the row specified by key at the granularity specified by column_path, and the given timestamp. Note
              that all the values in column_path besides column_path.column_family are truly optional: you can remove the entire
              row by just specifying the ColumnFamily, or you can remove a SuperColumn or a single Column by specifying those levels too.
            `)}
          >
            <Field id={1} required type={binary} name="key" />
            <Field id={2} required type={columnPath} name="column_path" />
            <Field id={3} required type={i64} name="timestamp" />
            <Field
              id={4}
              type={consistencyLevel}
              name="consistency_level"
              default={CL_ONE}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="remove_counter"
            breakParams
            doc={lines(`
              Remove a counter at the specified location.
              Note that counters have limited support for deletes: if you remove a counter, you must wait to issue any following update
              until the delete has reached all the nodes and all of them have been fully compacted.
            `)}
          >
            <Field id={1} required type={binary} name="key" />
            <Field id={2} required type={columnPath} name="path" />
            <Field
              id={3}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={CL_ONE}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="batch_mutate"
            breakParams
            doc={lines(`
              Mutate many columns or super columns for many row keys. See also: Mutation.

              mutation_map maps key to column family to a list of Mutation objects to take place at that scope.
            `)}
          >
            <Field
              id={1}
              required
              type={mapOf(binary, mapOf(string, listOf(mutation)))}
              name="mutation_map"
            />
            <Field
              id={2}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={CL_ONE}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="atomic_batch_mutate"
            breakParams
            doc={lines(`
              Atomically mutate many columns or super columns for many row keys. See also: Mutation.

              mutation_map maps key to column family to a list of Mutation objects to take place at that scope.
            `)}
          >
            <Field
              id={1}
              required
              type={mapOf(binary, mapOf(string, listOf(mutation)))}
              name="mutation_map"
            />
            <Field
              id={2}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={CL_ONE}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="truncate"
            doc={lines(`
              Truncate will mark and entire column family as deleted.
              From the user's perspective a successful call to truncate will result complete data deletion from cfname.
              Internally, however, disk space will not be immediatily released, as with all deletes in cassandra, this one
              only marks the data as deleted.
              The operation succeeds only if all hosts in the cluster at available and will throw an UnavailableException if
              some hosts are down.
            `)}
          >
            <Field id={1} required type={string} name="cfname" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="get_multi_slice"
            returnType={listOf(columnOrSuperColumn)}
            doc="Select multiple slices of a key in a single RPC operation"
          >
            <Field id={1} required type={multiSliceRequest} name="request" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <LineComment>
            {[
              "Meta-APIs -- APIs to get information about the node or cluster,",
              "rather than user data.  The nodeprobe program provides usage examples.",
            ]}
          </LineComment>
          <ServiceFunction
            name="describe_schema_versions"
            returnType={mapOf(string, listOf(string))}
            doc={lines(`
              for each schema version present in the cluster, returns a list of nodes at that version.
              hosts that do not respond will be under the key DatabaseDescriptor.INITIAL_VERSION.
              the cluster is all on the same version if the size of the map is 1.
            `)}
          >
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="describe_keyspaces"
            returnType={listOf(ksDef)}
            doc="list the defined keyspaces in this cluster"
          >
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="describe_cluster_name"
            returnType={string}
            doc="get the cluster name"
          ></ServiceFunction>
          <ServiceFunction
            name="describe_version"
            returnType={string}
            doc="get the thrift api version"
          ></ServiceFunction>
          <ServiceFunction
            name="describe_ring"
            returnType={listOf(tokenRange)}
            doc={lines(`
              get the token ring: a map of ranges to host addresses,
              represented as a set of TokenRange instead of a map from range
              to list of endpoints, because you can't use Thrift structs as
              map keys:
              https://issues.apache.org/jira/browse/THRIFT-162

              for the same reason, we can't return a set here, even though
              order is neither important nor predictable.
            `)}
          >
            <Field id={1} required type={string} name="keyspace" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="describe_local_ring"
            returnType={listOf(tokenRange)}
            doc="same as describe_ring, but considers only nodes in the local DC"
          >
            <Field id={1} required type={string} name="keyspace" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="describe_token_map"
            returnType={mapOf(string, string)}
            doc={lines(`
              get the mapping between token->node ip
              without taking replication into consideration
              https://issues.apache.org/jira/browse/CASSANDRA-4092
            `)}
          >
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="describe_partitioner"
            returnType={string}
            doc="returns the partitioner used by this cluster"
          ></ServiceFunction>
          <ServiceFunction
            name="describe_snitch"
            returnType={string}
            doc="returns the snitch used by this cluster"
          ></ServiceFunction>
          <ServiceFunction
            name="describe_keyspace"
            returnType={ksDef}
            doc="describe specified keyspace"
          >
            <Field id={1} required type={string} name="keyspace" />
            <Throws>
              <Field id={1} type={notFoundException} name="nfe" />
              <Field id={2} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="describe_splits"
            returnType={listOf(string)}
            breakParams
            doc={lines(`
              experimental API for hadoop/parallel query support.
              may change violently and without warning.

              returns list of token strings such that first subrange is (list[0], list[1]],
              next is (list[1], list[2]], etc.
            `)}
          >
            <Field id={1} required type={string} name="cfName" />
            <Field id={2} required type={string} name="start_token" />
            <Field id={3} required type={string} name="end_token" />
            <Field id={4} required type={i32} name="keys_per_split" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="trace_next_query"
            returnType={binary}
            doc={lines(`
              Enables tracing for the next query in this connection and returns the UUID for that trace session
              The next query will be traced independently of trace probability and the returned UUID can be used to query the trace keyspace
            `)}
          ></ServiceFunction>
          <ServiceFunction
            name="describe_splits_ex"
            returnType={listOf(cfSplit)}
            breakParams
          >
            <Field id={1} required type={string} name="cfName" />
            <Field id={2} required type={string} name="start_token" />
            <Field id={3} required type={string} name="end_token" />
            <Field id={4} required type={i32} name="keys_per_split" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="system_add_column_family"
            returnType={string}
            doc="adds a column family. returns the new schema id."
          >
            <Field id={1} required type={cfDef} name="cf_def" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={schemaDisagreementException} name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="system_drop_column_family"
            returnType={string}
            doc="drops a column family. returns the new schema id."
          >
            <Field id={1} required type={string} name="column_family" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={schemaDisagreementException} name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="system_add_keyspace"
            returnType={string}
            doc="adds a keyspace and any column families that are part of it. returns the new schema id."
          >
            <Field id={1} required type={ksDef} name="ks_def" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={schemaDisagreementException} name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="system_drop_keyspace"
            returnType={string}
            doc="drops a keyspace and any column families that are part of it. returns the new schema id."
          >
            <Field id={1} required type={string} name="keyspace" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={schemaDisagreementException} name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="system_update_keyspace"
            returnType={string}
            doc="updates properties of a keyspace. returns the new schema id."
          >
            <Field id={1} required type={ksDef} name="ks_def" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={schemaDisagreementException} name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="system_update_column_family"
            returnType={string}
            doc="updates properties of a column family. returns the new schema id."
          >
            <Field id={1} required type={cfDef} name="cf_def" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={schemaDisagreementException} name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="execute_cql_query"
            returnType={cqlResult}
            doc="@deprecated Throws InvalidRequestException since 2.2. Please use the CQL3 version instead."
          >
            <Field id={1} required type={binary} name="query" />
            <Field id={2} required type={compression} name="compression" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
              <Field id={4} type={schemaDisagreementException} name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="execute_cql3_query"
            returnType={cqlResult}
            doc={lines(`
              Executes a CQL3 (Cassandra Query Language) statement and returns a
              CqlResult containing the results.
            `)}
          >
            <Field id={1} required type={binary} name="query" />
            <Field id={2} required type={compression} name="compression" />
            <Field id={3} required type={consistencyLevel} name="consistency" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
              <Field id={4} type={schemaDisagreementException} name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="prepare_cql_query"
            returnType={cqlPreparedResult}
            doc="@deprecated Throws InvalidRequestException since 2.2. Please use the CQL3 version instead."
          >
            <Field id={1} required type={binary} name="query" />
            <Field id={2} required type={compression} name="compression" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="prepare_cql3_query"
            returnType={cqlPreparedResult}
            doc={lines(`
              Prepare a CQL3 (Cassandra Query Language) statement by compiling and returning
              - the type of CQL statement
              - an id token of the compiled CQL stored on the server side.
              - a count of the discovered bound markers in the statement
            `)}
          >
            <Field id={1} required type={binary} name="query" />
            <Field id={2} required type={compression} name="compression" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="execute_prepared_cql_query"
            returnType={cqlResult}
            doc="@deprecated Throws InvalidRequestException since 2.2. Please use the CQL3 version instead."
          >
            <Field id={1} required type={i32} name="itemId" />
            <Field id={2} required type={listOf(binary)} name="values" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
              <Field id={4} type={schemaDisagreementException} name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="execute_prepared_cql3_query"
            returnType={cqlResult}
            doc={lines(`
              Executes a prepared CQL3 (Cassandra Query Language) statement by passing an id token, a list of variables
              to bind, and the consistency level, and returns a CqlResult containing the results.
            `)}
          >
            <Field id={1} required type={i32} name="itemId" />
            <Field id={2} required type={listOf(binary)} name="values" />
            <Field id={3} required type={consistencyLevel} name="consistency" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
              <Field id={4} type={schemaDisagreementException} name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="set_cql_version"
            doc="@deprecated This is now a no-op. Please use the CQL3 specific methods instead."
          >
            <Field id={1} required type={string} name="version" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
        </Service>
      </SourceFile>
    ),
  },
];

it("renders cassandra.thrift", () => {
  const output = renderThriftFiles(files);
  expect(output).toMatchSnapshot();
});
