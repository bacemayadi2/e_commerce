const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'sql.freedb.tech',
    user: 'freedb_rootB',
    password: 'gPSD@v8?942jwE3',
    database: 'freedb_e_commerce_demo_bacem',
};
async function executeQuery(query, values) {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(query, values);
        connection.end();
        return rows;
    } catch (error) {
        console.error('Database error:', error.message);
        throw error;
    }
}

module.exports = { dbConfig ,executeQuery };
