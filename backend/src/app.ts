import express, { Request, Response } from "express";
import cookieeParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";

import { User } from "../types";
import { seedDb } from "../seed";
import { Broker } from "./helper/external/broker-api";
import { inBand } from "./util/in-band";
import { Band } from "./types";
import { generateBand } from "./util/get-free-share-value";
import { pool } from "./helper/external/db";
import { postClaimFreeShareHandler } from "./handler/post-claim-free-share";

const PORT = process.env.PORT!;

const app = express();
app.use(cookieeParser());
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.get("/", (_, res) => res.send("helthy"));

app.post("/claim-free-share", postClaimFreeShareHandler);

// start the Express server
app.listen(PORT, async () => {
  let connected = Boolean(await pool.getConnection().catch((_) => false));
  console.log(connected ? `Connected to mysql db` : `Failed to connect to db`);

  console.log(`server started at http://localhost:${PORT}`);

  await seedDb(pool);
});
