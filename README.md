# knex-crdb-primary

When using CockroachDB, creating a primary key of type UUID:

```js
await database.schema.createTable("example_a", (table) => {
	table.uuid("id").notNullable().primary();
});
```

will cause a secondary "rowid" column to be autogenerated. This is most likely due to the fact that `knex` generates two SQL queries to create this table+id combo:

```js
db.schema
	.createTable("example_a", (table) => {
		table.uuid("id").notNullable().primary();
	})
	.toSQL();

// [
//   {
//     sql: 'create table "example_a" ("id" uuid not null)',
//     bindings: []
//   },
//   {
//     sql: 'alter table "example_a" add constraint "example_a_pkey" primary key ("id")',
//     bindings: []
//   }
// ]
```

The first SQL query executed in Cockroach will generate the default "rowid" column, as cockroach requires a primary key to exist in the table. This means the issue (and hopefully the fix) is very similar to https://github.com/knex/knex/issues/4141 / https://github.com/knex/knex/pull/5017.

A temporary workaround is to use a `specificType`, for example:

```js
await database.schema.createTable("example_b", (table) => {
	table.specificType("id", "UUID PRIMARY KEY");
});
```

as that generates SQL that correctly creates the primary key in the first query in CRDB:

```js
database.schema
	.createTable("example_b", (table) => {
		table.specificType("id", "UUID PRIMARY KEY");
	})
	.toSQL();

// [
//   {
//     sql: 'create table "example_b" ("id" UUID PRIMARY KEY)',
//     bindings: []
//   }
// ]
```

## Installing / Running this Reproduction

1. Fire up Cockroach by running `docker compose up`
2. Run the index.mjs file by running `node index.mjs`
