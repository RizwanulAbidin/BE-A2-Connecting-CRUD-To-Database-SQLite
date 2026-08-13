# Task API

A small REST API for managing a to-do list, built with Node.js and Express for the FlyRank backend internship.

It does the four CRUD operations — create, read, update, delete — on a list of tasks. Each task looks like this:

```json
{ "id": 1, "title": "task1", "done": false }
```

Week 2 built this API on an array in memory, so every task vanished when the server stopped. Week 3 replaced that array with a **SQLite database**. The endpoints did not change at all — same paths, same request bodies, same responses, same status codes. Only the storage underneath moved from memory to disk.

## Running it

You need Node.js installed. Then:

```
npm install
npm start
```

The server starts on http://localhost:3000. Stop it with Ctrl+C.

There is no database setup step. On the first run the app creates `tasks.db`, creates the `tasks` table, and seeds three example tasks. A fresh clone works immediately.

## Why SQLite

- **It is one file.** The entire database is `tasks.db` sitting in the project folder. No server process, no ports, no connection strings.
- **Zero install.** `npm install better-sqlite3` is the whole setup. Nothing to configure, nothing to run alongside the app.
- **It survives restarts.** That is the point. Stop the server, start it again, and the data is still there.
- **It is real SQL.** The queries here — `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `WHERE`, `COUNT(*)` — are the same ones you would write against Postgres or MySQL later.

A bigger project would outgrow it once several servers need to write at once. For one API on one machine, it is exactly the right size.

## The database

| | |
|---|---|
| File | `tasks.db`, in the project root |
| Created by | The app itself, on first run — opening a SQLite file that does not exist creates it |
| In Git? | No. It is in `.gitignore`, so every clone starts with a fresh, freshly-seeded database |
| Table | `tasks` (`id` INTEGER PRIMARY KEY, `title` TEXT, `done` INTEGER) |

Two details worth knowing:

- **SQLite has no boolean type.** `done` is stored as `0` or `1`. A small `toTask()` function converts each row to `true`/`false` on the way out, so the API's responses are identical to the in-memory version.
- **Ids come from the database.** `INTEGER PRIMARY KEY` makes SQLite assign them. The old code that scanned the array for the highest id is gone.

The seed only runs when the table is empty — it counts the rows first. Without that check, three example tasks would become six on the second start and nine on the third.

## Endpoints

Unchanged from Week 2. That is the interesting part.

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
- `PUT` needs at least one of `title` or `done`. An empty body gives a 400. Sending only `done` keeps the existing title, and vice versa.
- Asking for an id that does not exist gives a 404 with a JSON error, never an empty 200.
- Every query uses `?` placeholders and passes values separately, so user input is never glued into a SQL string.

## Example

Listing tasks:

```
$ curl -i http://localhost:3000/tasks

HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 114
ETag: W/"72-g8WNiy04djQB2upisF0X3Vlk+Eo"
Date: Thu, 13 Aug 2026 16:30:51 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":1,"title":"task1","done":false},{"id":2,"title":"task2","done":false},{"id":3,"title":"task3","done":true}]
```

Asking for a task that is not there:

```
$ curl -i http://localhost:3000/tasks/999

HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 30

{"error":"Task 999 not found"}
```

If you are on Windows PowerShell, use `curl.exe` rather than `curl`, and put `--%` straight after it so PowerShell stops rewriting the quotes:

```
curl.exe --% -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d "{\"title\":\"Buy milk\"}"
```

## Swagger UI

Interactive documentation is at http://localhost:3000/docs while the server is running. Every endpoint has a "Try it out" button that sends a real request.

The page is generated from `openapi.json` and served with `swagger-ui-express`. That file did not need a single edit when the storage changed to SQLite — more evidence that the API's contract stayed the same.

![Swagger UI](Swagger%20Screenshot.png)

![All endpoints in Swagger UI](Swagger%20Screenshot%20All%20Endpoints.png)

## Looking inside the database

`tasks.db` is a binary file, so opening it in a text editor shows garbage. [DB Browser for SQLite](https://sqlitebrowser.org/) opens it properly:

![The tasks table in DB Browser](DB%20Browser%20Screenshot.png)

One query run by hand in the Execute SQL tab:

```sql
SELECT COUNT(*) FROM tasks;
```

It returned `3` — the number of rows in the table. The count was done by the database rather than by fetching every task and counting them in JavaScript.

![COUNT query in DB Browser](Query%20screenshot.png)

The useful thing about DB Browser is that it reads the same file the API reads. Run `UPDATE tasks SET done = 1;` there, click Write Changes, then call `GET /tasks` without restarting the server — every task comes back `"done": true`. There is no syncing step because there is only one copy of the data.

That query is also a good warning. It has no `WHERE`, so it does not mark one task done; it marks every task done.

## What happens when you restart

Add a few tasks, stop the server, start it again, then call `GET /tasks`. **Your tasks are still there.**

In Week 2 they were not. The array was rebuilt from scratch on every run, because it only ever existed in the program's memory, and memory does not outlive the process. Now each task is written to `tasks.db` the moment it is created, and the file stays on disk after the process ends. That single change is what a database is for.

If you delete `tasks.db` and start the server again, it is recreated and reseeded with the three example tasks — which is exactly what a stranger cloning this repo gets.

## Files

| File | What it is |
|---|---|
| `index.js` | The API — routes, validation, and the `toTask` converter |
| `db.js` | The storage layer — opens `tasks.db`, creates the table, seeds it once |
| `tasks.db` | The database itself. Created automatically, not in Git |
| `openapi.json` | Description of the endpoints, read by Swagger UI |
| `package.json` | Dependencies and the `npm start` script |
