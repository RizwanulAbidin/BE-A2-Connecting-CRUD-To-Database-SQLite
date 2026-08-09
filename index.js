const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiDoc = require('./openapi.json');

const app = express();
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));

const port = 3000;

let tasks= [
    {id: 1, title : "task1", done : false},
    {id: 2, title : "task2", done : false},
    {id: 3, title : "task3", done : true}
]

app.get('/', (req, res) => {
  res.json({ "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] })
});

app.get('/health', (req, res) => {
  res.json({ "status" : "ok"})
});

app.get('/tasks', (req, res) => {
  res.json(tasks)
});

app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find(t => t.id === id);

  if(!task){
    return res.status(404).json({error: `Task ${id} not found`});
  }

  res.json(task);
});

app.post('/tasks', (req, res) => {
    const title = req.body.title;

    if(!title || title.trim() === ""){
        return res.status(400).json({error: "Title is required"});
    }

    let maxId=0;
    for (const t of tasks){
        if (t.id>maxId){
            maxId=t.id;
        }
    }
    const newId = maxId+1;

    const newTask = {id:newId, title: title, done:false};
    tasks.push(newTask);

    res.status(201).json(newTask);
});

app.put('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const task = tasks.find(t => t.id === id);

    if(!task){
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

    if (title !== undefined) {
        task.title = title;
    }
    if (done !== undefined) {
        task.done = done;
    }

    res.json(task);

});

app.delete('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);

    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
        return res.status(404).json({ error: `Task ${id} not found` });
    }
    
    tasks.splice(index, 1);
    res.status(204).send();

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

