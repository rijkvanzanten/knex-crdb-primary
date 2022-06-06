import knex from "knex";

const database = knex({
	client: "cockroachdb",
	connection: {
		host: "127.0.0.1",
		port: 26257,
		user: "root",
		database: "knex_example",
	},
});

await database.schema.createTable("example_a", (table) => {
	table.uuid("id").notNullable().primary();
});

await database.schema.createTable("example_b", (table) => {
	table.specificType("id", "UUID PRIMARY KEY");
});

const [resA, resB] = await Promise.all([
	database.schema.hasColumn("example_a", "rowid"),
	database.schema.hasColumn("example_b", "rowid"),
]);

console.log(`
Tables have auto-generated rowid?

example_a: ${resA}
example_b: ${resB}`);

database.destroy();
