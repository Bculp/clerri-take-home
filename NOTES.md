# Notes

## What I fixed and why

**Bulk delete with locked docs (the main bug)** (`a1c51f5`)
- The controller deleted ids one at a time and stopped at the first locked or missing doc. Anything before it was already deleted, anything after it was never tried, and the user just saw "Something went wrong". The stale cache below hid all of this, so it looked like nothing happened.
- The server now checks every id before deleting anything. If any id is unknown it returns 404 with `missingIds`, and if any is locked it returns 409 with `lockedIds`. Either way nothing gets deleted.
- I added validation on the request body. `ids` has to be an array of 1 to 100 strings with no dupes, otherwise it's a 400. I checked missing bodies, wrong types, empty arrays, too many ids, dupes and `__proto__` with curl. None of them delete anything.
- I replaced `window.confirm` with a confirm modal that lists the selected docs and marks the locked ones. If anything locked is selected, Delete is disabled until you deselect it. If a doc gets locked after the modal opens, the server's 409 shows "Nothing was deleted".
- I removed the old single-doc `delete()` since nothing used it anymore, and pointed its test at `bulkDelete`.

**New docs never showed up in the list** (`b182804`)
- `GET /documents` returned a copy of the data taken when the server started and never refreshed it. New docs never showed up and deleted docs never went away. I dropped the cache, so every request reads the store directly.

**Locked docs weren't shown as locked** (`1c0042e`)
- The server sends `lockedBy`, but the client was looking for `locked`, so every doc looked unlocked. TypeScript didn't catch it because `request()` returns `any`. I fixed the client type, and the badge now says "Locked by {user}".

**Other websites could delete docs** (`0819f08`)
- Nest accepts form-encoded bodies by default, and browsers send cross-site form posts without a CORS check. I confirmed that a plain form post of `ids[]=doc-02` deleted a doc. CORS was also open to every origin, so `fetch()` from any site would work too.
- The API now only parses JSON, and CORS only allows the web app (`http://localhost:5173`).

**Bulk delete returned 201 Created** (`c4349cd`)
- That's Nest's default for POST. Nothing gets created, so it returns 200 now.

## Decisions I made where the requirement was unclear
- **Dropping the cache:** every request reads from the store now. It costs a copy of the list per request, which is nothing at this size, and it's worth it for live updates. The alternative was refreshing the cache on every write, but any new write path that forgets to do it brings the bug right back.
- **Locked docs in a bulk delete:** I added the confirm modal, and if the batch includes any locked docs the server rejects the whole thing. It's always clear what will and won't get deleted, and nothing ends up half deleted. The tradeoff is one locked doc blocks the whole batch until you deselect it. I considered deleting the unlocked ones and reporting which were skipped, but that's a partial success, which is what made the original bug confusing.
- **Unknown or dupe ids:** I treat these as bad requests and delete nothing. Dupes and malformed input return 400 and unknown ids return 404. I chose strict over silently fixing up the request.
- **100 id limit:** my own pick, to cap the work per request. With more than 100 docs, "select all" would fail (see below).
- **Form-encoded requests:** I switched the API to JSON only and locked CORS down to just the web app's origin. I kept CORS instead of removing it, in case the client ever calls the API directly instead of going through the Vite proxy.
- **Showing who locked a doc:** usernames are personal data, but showing who has a lock is normal in doc tools, and without it you don't know who to ask. It's only OK behind auth, though, and right now `GET /documents` returns it to anyone.
- **Locking and unlocking:** there's no endpoint or requirement for it, and no user to attach a lock to, so I treated it as out of scope.

## What I'd flag in code review but didn't have time to fix
**Security**
- There's no auth at all. Anyone who can reach the API can list and delete docs and see who locked them.
- There's no user, so can I delete my own docs that are locked? Right now nobody can.
- `POST /documents` doesn't validate `title`. It could be missing, not a string, empty, huge (up to the 100kb body limit), or HTML. React escapes it so there's no XSS here, but it gets stored as is.

**Correctness**
- `findById` returns the stored object itself, while `all()` and `insert()` return copies. Anything that changes the returned object changes the store.
- `store.remove()` with an unknown id deletes the last doc (`splice(-1, 1)`). Nothing hits that today because the service checks first, but the store doesn't protect itself.
- Dupe titles are allowed. They should probably be unique.
- A 404 (a doc deleted somewhere else) and a 400 (over 100 ids) both show the generic error. Only 409 gets a real message.

**Tests**
- There are no tests for the new bulk delete behavior (locked, unknown ids, validation) or for the JSON and CORS setup. The client has no tests at all.

**Types**
- `request()` returns `any`, which is how the `locked` vs `lockedBy` mismatch got through. Typing it, or sharing types between client and server, would catch that.
- The allowed CORS origin is hard coded instead of coming from config.

**Accessibility**
- The select all checkbox doesn't have a label.
- Error messages aren't announced to screen readers.

**Performance and UX**
- Every reload sets loading, which makes the list flicker, and focus and scroll position get lost.
- There's no sorting on the columns.

## Where I used AI assistance and for what
I used Claude Code throughout. I made the decisions, and it laid out options, made the edits I approved, and ran the checks.
- **Getting oriented:** it read the whole codebase and walked through the bulk delete flow end to end before I changed anything. That's where the partial delete, the stale cache and the `locked`/`lockedBy` mismatch first came up.
- **Fixes:** it gave me 2 or 3 options with tradeoffs for each bug and I picked. Some places I pushed back or changed its suggestions:
  - While building the confirm modal, it added a refetch of the list before opening it. I took that out.
  - I had it disable Delete when locked docs are selected and collapse the modal to a single list.
  - I changed the warning copy so it reads right whether one doc or several are locked.
  - I kept CORS limited to the app instead of removing it.
- **Testing:** it ran type checks, Jest and curl against the edge cases: bad bodies, dupes, `__proto__`, too many ids, form-encoded and `text/plain` bodies, and preflight requests from other origins.
- **What it got wrong:**
  - At first it said turning off form parsing would be enough. It wasn't, because CORS was still wide open. I caught that before writing any code.
  - It tested the form-encoded case with a real id and deleted a doc from the dev data. That did confirm the bug was real.
  - It blamed a hanging test run on a shell pipe. It turned out to be watchman.
- **These notes:** it helped me merge my notes with a log it kept during the session.
