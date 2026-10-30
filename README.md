# Document Manager

A one-hour take-home. Read this whole file first — it should take two minutes.

## Setup

Pick either path. Both give you the same running app with hot reload.

**Local** — needs Node 20.11+ (22 LTS recommended) and [pnpm](https://pnpm.io/installation) 9+.
From the root of the repo:

```bash
pnpm install
pnpm dev
```

**Docker** — needs nothing but Docker:

```bash
docker compose up
```

The first `docker compose up` builds the image, which takes a minute. Later runs start in
seconds. Stop it with Ctrl-C, or `docker compose down`.

Either way:

- Web app: **http://localhost:5173**
- API: **http://localhost:3000**
- Both ports need to be free before you start.
- Data is in-memory. Restarting the server resets it to the seed documents.
- There is nothing to configure — no database, no environment variables, no `.env`.

If setup fights you for more than a few minutes, tell us rather than burning your hour on
it.

## What this is

A small internal document management app. It lists documents, lets you create one, and
lets you select several and delete them in bulk. Documents can be locked by a user; a
locked document is not deletable.

Something is wrong with it.

## Your task

The app has a few bugs. Find and fix what you can.

There is a known issue with bulk-deleting documents when some of them are locked. That
one matters most — start there if you are short on time.

Not every requirement here is fully specified. If you hit something ambiguous, make a
call and document your reasoning — that's part of the exercise.

## Time

One hour on the work itself; setup doesn't count against it. Stop when you hit the hour
and submit what you have. Submitting incomplete work with clear reasoning is better than
going over.

## AI tools

Using AI assistants is explicitly permitted and expected. Please note in your write-up
where you used them and for what.

## What to submit

> **How to send it back:** create a repo in your github account and send us the link, or zip your code up and email it back.

Your changes, plus a short `NOTES.md` at the root of the repo covering:

- **What you fixed, and why.**
- **Decisions you made where the requirement was unclear.** What you chose and what you
  traded off.
- **What you would flag in code review but did not have time to fix.** Correctness,
  security, accessibility, performance — anything you noticed.
- **Where you used AI assistance**, and for what.

Bullet points are fine — we care about the reasoning, not the prose.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Runs the API and the web app together |
| `pnpm test` | Runs the server test suite (Jest) |
| `pnpm build` | Type-checks and builds both workspaces |
| `docker compose up` | Same as `pnpm dev`, in a container |

`pnpm test` covers the server only — there is no test runner wired up on the client. In
Docker, run the tests with `docker compose exec app pnpm test`.

## Layout

```
server/src/documents/   NestJS module: controller, service, in-memory store, seed data
client/src/             React app: list, create form, fetch helpers
```

Under 400 lines of TypeScript in total. Reading all of it is a reasonable way to start.

## API

| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| `GET` | `/documents` | — | Returns every document |
| `POST` | `/documents` | `{ "title": string }` | Returns the created document |
| `POST` | `/documents/bulk-delete` | `{ "ids": string[] }` | Deletes the given documents |
