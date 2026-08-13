const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiDoc = require('./openapi.json');
const db = require('./db');

const app = express();
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));

const port = 3000;

function toTask(row) {
  return { id: row.id, title: row.title, done: Boolean(row.done) };
}

app.get('/', (req, res) => {
  res.json({ "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] })
});

app.get('/health', (req, res) => {
  res.json({ "status" : "ok"})
});

app.get('/tasks', (req, res) => {
  const rows = db.prepare('SELECT * FROM tasks').all();
  res.json(rows.map(toTask));
});

app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

  if(!row){
    return res.status(404).json({error: `Task ${id} not found`});
  }

  res.json(toTask(row));
});

app.post('/tasks', (req, res) => {
    const title = req.body.title;

    if(!title || title.trim() === ""){
        return res.status(400).json({error: "Title is required"});
    }

    const info = db.prepare('INSERT INTO tasks (title, done) VALUES(?,?)').run(title,0);
    
    const row = db.prepare('SELECT * FROM tasks WHERE id=?').get(info.lastInsertRowid);

    res.status(201).json(toTask(row));
});

app.put('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

    if(!row){
        return res.status(404).json({error: `Task ${id} not found`});
    }
    
    const title = req.body.title;
    const done = req.body.done;

    if (title === undefined && done === undefined) {
        return res.status(400).json({ error: "Provide title or done" });
    }

    if (title !== undefined && title.trim() === "") {
        return res.status(400).json({ error: "Title cannot be empty" });
    }

    let newTitle=row.title;
    let newDone=row.done;

    if (title !== undefined) {
    newTitle = title;
    }
    if (done !== undefined) {
        newDone = done ? 1 : 0;
    }

    db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(newTitle, newDone, id);
    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

    res.json(toTask(updated));

});

app.delete('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const info = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

    if (info.changes === 0) {
        return res.status(404).json({ error: `Task ${id} not found` });
    }

    res.status(204).send();

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

