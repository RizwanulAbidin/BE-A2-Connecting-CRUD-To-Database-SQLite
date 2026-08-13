const Database = require('better-sqlite3');
const db = new Database('tasks.db');


db.exec(`CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, title TEXT, done INTEGER)`);

const row = db.prepare('SELECT COUNT(*) AS count FROM tasks').get();

if (row.count===0){
    const insert=db.prepare('INSERT INTO tasks (title, done) VALUES (?,?)');
    insert.run('task1',0);
    insert.run('task2',0);
    insert.run('task3',1);
}

module.exports = db;
