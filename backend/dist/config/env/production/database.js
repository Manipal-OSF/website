"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parse = require("pg-connection-string");
const config = parse.parse(process.env.DATABASE_URL);
exports.default = ({ env }) => ({
    connection: {
        client: 'postgres',
        connection: {
            host: config.host,
            port: config.port,
            database: config.database,
            user: config.user,
            password: config.password,
            ssl: {
                rejectUnauthorized: false
            },
        },
        debug: false,
    },
});
