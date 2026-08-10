# Task API

A small REST API for managing a to-do list, built with Node.js and Express for Week 2 of the FlyRank backend internship.

It does the four CRUD operations — create, read, update, delete — on a list of tasks. Each task looks like this:

```json
{ "id": 1, "title": "task1", "done": false }
```

There is no database. The tasks live in a plain array inside `index.js`, so anything you add is gone the moment the server stops. That is on purpose; databases are next week.

## Running it

You need Node.js installed. Then:

```
npm install
npm start
```

The server starts on http://localhost:3000 and prints a line to the terminal when it is ready. Stop it with Ctrl+C.

## Endpoints

| Method | Path | What it does | Status codes |
|---|---|---|---|
| GET | `/` | Name and version of the API | 200 |
| GET | `/health` | Check the server is alive | 200 |
| GET | `/tasks` | List every task | 200 |
| GET | `/tasks/:id` | Get one task | 200, 404 |
| POST | `/tasks` | Create a task from `{ "title": "..." }` | 201, 400 |
| PUT | `/tasks/:id` | Update `title` and/or `done` | 200, 400, 404 |
| DELETE | `/tasks/:id` | Delete a task (empty body) | 204, 404 |

A few rules the server follows:

- `POST` needs a `title`. Missing or blank gives a 400.
- `PUT` needs at least one of `title` or `done`. An empty body gives a 400.
- Asking for an id that does not exist gives a 404 with a JSON error, never an empty 200.
- New ids are the highest existing id plus one, so deleting a task never causes a duplicate.

## Example

Creating a task:

```
$ curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Buy milk"}'

HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 40
ETag: W/"28-PpSBYV7i68cXyGc7AhjVpkZkY5Q"
Date: Sun, 09 Aug 2026 12:08:41 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":4,"title":"Buy milk","done":false}
```

Asking for a task that is not there:

```
$ curl -i http://localhost:3000/tasks/99

HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 29

{"error":"Task 99 not found"}
```

If you are on Windows PowerShell, use `curl.exe` rather than `curl`, and put `--%` straight after it so PowerShell stops rewriting the quotes:

```
curl.exe --% -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d "{\"title\":\"Buy milk\"}"
```

## Swagger UI

Interactive documentation is at http://localhost:3000/docs while the server is running. Every endpoint has a "Try it out" button that sends a real request, which is a lot easier than fighting with quotes in the terminal.

The page is generated from `openapi.json` and served with `swagger-ui-express`.

![Swagger UI](Swagger%20Screenshot.png)

![All endpoints in Swagger UI](Swagger%20Screenshot%20All%20Endpoints.png)

## What happens when you restart

Add a few tasks, stop the server, start it again, then call `GET /tasks`. Your tasks are gone and the original three are back.

That is because the array is rebuilt from scratch every time the file is run — it only ever existed in the program's memory, and memory does not survive the process. Storing data somewhere that outlives the server is exactly the problem a database solves.

## Files

| File | What it is |
|---|---|
| `index.js` | The whole server — routes and the task array |
| `openapi.json` | Description of the endpoints, read by Swagger UI |
| `package.json` | Dependencies and the `npm start` script |
