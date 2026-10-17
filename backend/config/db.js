const sql = require("mssql");
require("dotenv").config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,

    options: {
        encrypt: false,
        trustServerCertificate: true
    },

    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool;

async function connectDB() {
    try {
        pool = await sql.connect(dbConfig);

        console.log("SQL Server connected successfully");
        return pool;

    } catch (error) {
        console.error("SQL Server connection failed:");
        console.error(error.message);
        process.exit(1);
    }
}

function getPool() {
    if (!pool) {
        throw new Error("Database has not been connected yet");
    }

    return pool;
}

module.exports = {
    sql,
    connectDB,
    getPool
};