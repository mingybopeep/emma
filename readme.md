# Backend

The backend is a docker compose orc with 2 containers/services:

- a basic mysql container on private network
- an express api in a node based container

On start, the express service will attempt to seed the db. The db is mounted, so re-seeding is not necessary if it crashes, since the mount will persist the db state.

**build container:** `cd backend && docker build`
**start orchestration:** (from projcet root)`docker compose up`
**tests**: `cd backend && npm run test`

## Improvements

- more tests
- run linting and tests on container start or pre-build
- logging
- implement a cronjob to run free share cleanup script (resets User.free_share_status where the order failed)
- API docs (swagger/openapi)
- endpoint validation (via eg AJV package)
- thorough test on share price algo - probably need some stats testing as unit testing is probably insufficient here???

## Testing the endpoint

- Once started, docker will forward from `localhost:8765`
- the endpoint can be hit at POST `/claim-free-share`
- requires a query param of email
- db needs seeding with a user in the user table
