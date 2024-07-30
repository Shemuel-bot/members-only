const pool = require('./pool');

async function insertUser (username, password){
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
}

async function findUser (username){
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    return user
}

async function findById(id){
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [id])
    return user;
}

module.exports = {
    insertUser,
    findUser,
    findById,
}