const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const databasePath = process.env.DATABASE_PATH || './data/visionpuzzle.db';
const resolvedPath = path.resolve(databasePath);
fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

let database;
let SQL;

function save() {
	if (!database) return;
	fs.writeFileSync(resolvedPath, Buffer.from(database.export()));
}

function bindStatement(statement, parameters) {
	const values = Array.isArray(parameters) ? parameters : Object.values(parameters || {});
	statement.bind(values);
}

const db = {
	async initialize() {
		SQL = await initSqlJs({ locateFile: (file) => require.resolve(`sql.js/dist/${file}`) });
		database = fs.existsSync(resolvedPath) ? new SQL.Database(fs.readFileSync(resolvedPath)) : new SQL.Database();
		database.run('PRAGMA foreign_keys = ON');
		database.run(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
		save();
	},
	prepare(sql) {
		return {
			get(...parameters) {
				const statement = database.prepare(sql); bindStatement(statement, parameters);
				const result = statement.step() ? statement.getAsObject() : undefined; statement.free(); return result;
			},
			all(...parameters) {
				const statement = database.prepare(sql); bindStatement(statement, parameters); const rows = [];
				while (statement.step()) rows.push(statement.getAsObject()); statement.free(); return rows;
			},
			run(...parameters) {
				const statement = database.prepare(sql); bindStatement(statement, parameters); statement.step(); statement.free();
				const result = database.exec('SELECT last_insert_rowid() AS id, changes() AS changes')[0]?.values[0] || [0, 0]; save();
				return { lastInsertRowid: result[0], changes: result[1] };
			}
		};
	}
};

module.exports = db;
