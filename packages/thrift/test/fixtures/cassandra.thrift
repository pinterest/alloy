namespace java org.apache.cassandra.thrift
namespace cpp org.apache.cassandra
namespace csharp Apache.Cassandra
namespace py cassandra
namespace php cassandra
namespace perl Cassandra
namespace rb CassandraThrift

enum ConsistencyLevel {
  ONE = 1,
  QUORUM = 2,
  LOCAL_QUORUM = 3,
  EACH_QUORUM = 4,
  ALL = 5,
  ANY = 6,
  TWO = 7,
  THREE = 8,
  SERIAL = 9,
  LOCAL_SERIAL = 10,
  LOCAL_ONE = 11
}

enum IndexOperator {
  EQ,
  GTE,
  GT,
  LTE,
  LT
}

enum IndexType {
  KEYS,
  CUSTOM,
  COMPOSITES
}

enum Compression {
  GZIP = 1,
  NONE = 2
}

enum CqlResultType {
  ROWS = 1,
  VOID = 2,
  INT = 3
}

const string VERSION = "20.1.0"

struct Column {
  1: required binary name;
  2: optional binary value;
  3: optional i64 timestamp;
  4: optional i32 ttl;
}

struct SuperColumn {
  1: required binary name;
  2: required list<Column> columns;
}

struct CounterColumn {
  1: required binary name;
  2: required i64 value;
}

struct CounterSuperColumn {
  1: required binary name;
  2: required list<CounterColumn> columns;
}

struct ColumnOrSuperColumn {
  1: optional Column column;
  2: optional SuperColumn super_column;
  3: optional CounterColumn counter_column;
  4: optional CounterSuperColumn counter_super_column;
}

struct ColumnParent {
  3: required string column_family;
  4: optional binary super_column;
}

struct ColumnPath {
  3: required string column_family;
  4: optional binary super_column;
  5: optional binary column;
}

struct SliceRange {
  1: required binary start;
  2: required binary finish;
  3: required bool reversed = 0;
  4: required i32 count = 100;
}

struct SlicePredicate {
  1: optional list<binary> column_names;
  2: optional SliceRange slice_range;
}

struct IndexExpression {
  1: required binary column_name;
  2: required IndexOperator op;
  3: required binary value;
}

struct IndexClause {
  1: required list<IndexExpression> expressions;
  2: required binary start_key;
  3: required i32 count = 100;
}

struct KeyRange {
  1: optional binary start_key;
  2: optional binary end_key;
  3: optional string start_token;
  4: optional string end_token;
  6: optional list<IndexExpression> row_filter;
  5: required i32 count = 100;
}

struct KeySlice {
  1: required binary key;
  2: required list<ColumnOrSuperColumn> columns;
}

struct KeyCount {
  1: required binary key;
  2: required i32 count;
}

struct Deletion {
  1: optional i64 timestamp;
  2: optional binary super_column;
  3: optional SlicePredicate predicate;
}

struct Mutation {
  1: optional ColumnOrSuperColumn column_or_supercolumn;
  2: optional Deletion deletion;
}

struct EndpointDetails {
  1: string host;
  2: string datacenter;
  3: optional string rack;
}

struct CASResult {
  1: required bool success;
  2: optional list<Column> current_values;
}

struct TokenRange {
  1: required string start_token;
  2: required string end_token;
  3: required list<string> endpoints;
  4: optional list<string> rpc_endpoints;
  5: optional list<EndpointDetails> endpoint_details;
}

struct AuthenticationRequest {
  1: required map<string, string> credentials;
}

struct ColumnDef {
  1: required binary name;
  2: required string validation_class;
  3: optional IndexType index_type;
  4: optional string index_name;
  5: optional map<string, string> index_options;
}

struct TriggerDef {
  1: required string name;
  2: required map<string, string> options;
}

struct CfDef {
  1: required string keyspace;
  2: required string name;
  3: optional string column_type = "Standard";
  5: optional string comparator_type = "BytesType";
  6: optional string subcomparator_type;
  8: optional string comment;
  12: optional double read_repair_chance;
  13: optional list<ColumnDef> column_metadata;
  14: optional i32 gc_grace_seconds;
  15: optional string default_validation_class;
  16: optional i32 id;
  17: optional i32 min_compaction_threshold;
  18: optional i32 max_compaction_threshold;
  26: optional string key_validation_class;
  28: optional binary key_alias;
  29: optional string compaction_strategy;
  30: optional map<string, string> compaction_strategy_options;
  32: optional map<string, string> compression_options;
  33: optional double bloom_filter_fp_chance;
  34: optional string caching = "keys_only";
  37: optional double dclocal_read_repair_chance = 0;
  39: optional i32 memtable_flush_period_in_ms;
  40: optional i32 default_time_to_live;
  42: optional string speculative_retry = "NONE";
  43: optional list<TriggerDef> triggers;
  44: optional string cells_per_row_to_cache = "100";
  45: optional i32 min_index_interval;
  46: optional i32 max_index_interval;
  9: optional double row_cache_size;
  11: optional double key_cache_size;
  19: optional i32 row_cache_save_period_in_seconds;
  20: optional i32 key_cache_save_period_in_seconds;
  21: optional i32 memtable_flush_after_mins;
  22: optional i32 memtable_throughput_in_mb;
  23: optional double memtable_operations_in_millions;
  24: optional bool replicate_on_write;
  25: optional double merge_shards_chance;
  27: optional string row_cache_provider;
  31: optional i32 row_cache_keys_to_save;
  38: optional bool populate_io_cache_on_flush;
  41: optional i32 index_interval;
}

struct KsDef {
  1: required string name;
  2: required string strategy_class;
  3: optional map<string, string> strategy_options;
  4: optional i32 replication_factor;
  5: required list<CfDef> cf_defs;
  6: optional bool durable_writes = 1;
}

struct CqlRow {
  1: required binary key;
  2: required list<Column> columns;
}

struct CqlMetadata {
  1: required map<binary, string> name_types;
  2: required map<binary, string> value_types;
  3: required string default_name_type;
  4: required string default_value_type;
}

struct CqlResult {
  1: required CqlResultType type;
  2: optional list<CqlRow> rows;
  3: optional i32 num;
  4: optional CqlMetadata schema;
}

struct CqlPreparedResult {
  1: required i32 itemId;
  2: required i32 count;
  3: optional list<string> variable_types;
  4: optional list<string> variable_names;
}

struct CfSplit {
  1: required string start_token;
  2: required string end_token;
  3: required i64 row_count;
}

struct ColumnSlice {
  1: optional binary start;
  2: optional binary finish;
}

struct MultiSliceRequest {
  1: optional binary key;
  2: optional ColumnParent column_parent;
  3: optional list<ColumnSlice> column_slices;
  4: optional bool reversed = false;
  5: optional i32 count = 1000;
  6: optional ConsistencyLevel consistency_level = 1;
}

exception NotFoundException {}

exception InvalidRequestException {
  1: required string why;
}

exception UnavailableException {}

exception TimedOutException {
  1: optional i32 acknowledged_by;
  2: optional bool acknowledged_by_batchlog;
  3: optional bool paxos_in_progress;
}

exception AuthenticationException {
  1: required string why;
}

exception AuthorizationException {
  1: required string why;
}

exception SchemaDisagreementException {}

service Cassandra {
  void login(1: required AuthenticationRequest auth_request) throws (1: AuthenticationException authnx,
  2: AuthorizationException authzx);
  void set_keyspace(1: required string keyspace) throws (1: InvalidRequestException ire);
  ColumnOrSuperColumn get(1: required binary key,
  2: required ColumnPath column_path,
  3: required ConsistencyLevel consistency_level = 1) throws (1: InvalidRequestException ire,
  2: NotFoundException nfe,
  3: UnavailableException ue,
  4: TimedOutException te);
  list<ColumnOrSuperColumn> get_slice(1: required binary key,
  2: required ColumnParent column_parent,
  3: required SlicePredicate predicate,
  4: required ConsistencyLevel consistency_level = 1) throws (1: InvalidRequestException ire,
  2: UnavailableException ue,
  3: TimedOutException te);
  i32 get_count(1: required binary key,
  2: required ColumnParent column_parent,
  3: required SlicePredicate predicate,
  4: required ConsistencyLevel consistency_level = 1) throws (1: InvalidRequestException ire,
  2: UnavailableException ue,
  3: TimedOutException te);
  map<binary, list<ColumnOrSuperColumn>> multiget_slice(1: required list<binary> keys,
  2: required ColumnParent column_parent,
  3: required SlicePredicate predicate,
  4: required ConsistencyLevel consistency_level = 1) throws (1: InvalidRequestException ire,
  2: UnavailableException ue,
  3: TimedOutException te);
  map<binary, i32> multiget_count(1: required list<binary> keys,
  2: required ColumnParent column_parent,
  3: required SlicePredicate predicate,
  4: required ConsistencyLevel consistency_level = 1) throws (1: InvalidRequestException ire,
  2: UnavailableException ue,
  3: TimedOutException te);
  list<KeySlice> get_range_slices(1: required ColumnParent column_parent,
  2: required SlicePredicate predicate,
  3: required KeyRange range,
  4: required ConsistencyLevel consistency_level = 1) throws (1: InvalidRequestException ire,
  2: UnavailableException ue,
  3: TimedOutException te);
  list<KeySlice> get_paged_slice(1: required string column_family,
  2: required KeyRange range,
  3: required binary start_column,
  4: required ConsistencyLevel consistency_level = 1) throws (1: InvalidRequestException ire,
  2: UnavailableException ue,
  3: TimedOutException te);
  list<KeySlice> get_indexed_slices(1: required ColumnParent column_parent,
  2: required IndexClause index_clause,
  3: required SlicePredicate column_predicate,
  4: required ConsistencyLevel consistency_level = 1) throws (1: InvalidRequestException ire,
  2: UnavailableException ue,
  3: TimedOutException te);
  void insert(1: required binary key,
  2: required ColumnParent column_parent,
  3: required Column column,
  4: required ConsistencyLevel consistency_level = 1) throws (1: InvalidRequestException ire,
  2: UnavailableException ue,
  3: TimedOutException te);
  void add(1: required binary key,
  2: required ColumnParent column_parent,
  3: required CounterColumn column,
  4: required ConsistencyLevel consistency_level = 1) throws (1: InvalidRequestException ire,
  2: UnavailableException ue,
  3: TimedOutException te);
  CASResult cas(1: required binary key,
  2: required string column_family,
  3: list<Column> expected,
  4: list<Column> updates,
  5: required ConsistencyLevel serial_consistency_level = 9,
  6: required ConsistencyLevel commit_consistency_level = 2) throws (1: InvalidRequestException ire,
  2: UnavailableException ue,
  3: TimedOutException te);
  void remove(1: required binary key,
  2: required ColumnPath column_path,
  3: required i64 timestamp,
  4: ConsistencyLevel consistency_level = 1) throws (1: InvalidRequestException ire,
  2: UnavailableException ue,
  3: TimedOutException te);
  void remove_counter(1: required binary key,
  2: required ColumnPath path,
  3: required ConsistencyLevel consistency_level = 1) throws (1: InvalidRequestException ire,
  2: UnavailableException ue,
  3: TimedOutException te);
  void batch_mutate(1: required map<binary, map<string, list<Mutation>>> mutation_map,
  2: required ConsistencyLevel consistency_level = 1) throws (1: InvalidRequestException ire,
  2: UnavailableException ue,
  3: TimedOutException te);
  void atomic_batch_mutate(1: required map<binary, map<string, list<Mutation>>> mutation_map,
  2: required ConsistencyLevel consistency_level = 1) throws (1: InvalidRequestException ire,
  2: UnavailableException ue,
  3: TimedOutException te);
  void truncate(1: required string cfname) throws (1: InvalidRequestException ire,
  2: UnavailableException ue,
  3: TimedOutException te);
  list<ColumnOrSuperColumn> get_multi_slice(1: required MultiSliceRequest request) throws (1: InvalidRequestException ire,
  2: UnavailableException ue,
  3: TimedOutException te);
  map<string, list<string>> describe_schema_versions() throws (1: InvalidRequestException ire);
  list<KsDef> describe_keyspaces() throws (1: InvalidRequestException ire);
  string describe_cluster_name();
  string describe_version();
  list<TokenRange> describe_ring(1: required string keyspace) throws (1: InvalidRequestException ire);
  list<TokenRange> describe_local_ring(1: required string keyspace) throws (1: InvalidRequestException ire);
  map<string, string> describe_token_map() throws (1: InvalidRequestException ire);
  string describe_partitioner();
  string describe_snitch();
  KsDef describe_keyspace(1: required string keyspace) throws (1: NotFoundException nfe,
  2: InvalidRequestException ire);
  list<string> describe_splits(1: required string cfName,
  2: required string start_token,
  3: required string end_token,
  4: required i32 keys_per_split) throws (1: InvalidRequestException ire);
  binary trace_next_query();
  list<CfSplit> describe_splits_ex(1: required string cfName,
  2: required string start_token,
  3: required string end_token,
  4: required i32 keys_per_split) throws (1: InvalidRequestException ire);
  string system_add_column_family(1: required CfDef cf_def) throws (1: InvalidRequestException ire,
  2: SchemaDisagreementException sde);
  string system_drop_column_family(1: required string column_family) throws (1: InvalidRequestException ire,
  2: SchemaDisagreementException sde);
  string system_add_keyspace(1: required KsDef ks_def) throws (1: InvalidRequestException ire,
  2: SchemaDisagreementException sde);
  string system_drop_keyspace(1: required string keyspace) throws (1: InvalidRequestException ire,
  2: SchemaDisagreementException sde);
  string system_update_keyspace(1: required KsDef ks_def) throws (1: InvalidRequestException ire,
  2: SchemaDisagreementException sde);
  string system_update_column_family(1: required CfDef cf_def) throws (1: InvalidRequestException ire,
  2: SchemaDisagreementException sde);
  CqlResult execute_cql_query(1: required binary query,
  2: required Compression compression) throws (1: InvalidRequestException ire,
  2: UnavailableException ue,
  3: TimedOutException te,
  4: SchemaDisagreementException sde);
  CqlResult execute_cql3_query(1: required binary query,
  2: required Compression compression,
  3: required ConsistencyLevel consistency) throws (1: InvalidRequestException ire,
  2: UnavailableException ue,
  3: TimedOutException te,
  4: SchemaDisagreementException sde);
  CqlPreparedResult prepare_cql_query(1: required binary query,
  2: required Compression compression) throws (1: InvalidRequestException ire);
  CqlPreparedResult prepare_cql3_query(1: required binary query,
  2: required Compression compression) throws (1: InvalidRequestException ire);
  CqlResult execute_prepared_cql_query(1: required i32 itemId,
  2: required list<binary> values) throws (1: InvalidRequestException ire,
  2: UnavailableException ue,
  3: TimedOutException te,
  4: SchemaDisagreementException sde);
  CqlResult execute_prepared_cql3_query(1: required i32 itemId,
  2: required list<binary> values,
  3: required ConsistencyLevel consistency) throws (1: InvalidRequestException ire,
  2: UnavailableException ue,
  3: TimedOutException te,
  4: SchemaDisagreementException sde);
  void set_cql_version(1: required string version) throws (1: InvalidRequestException ire);
}