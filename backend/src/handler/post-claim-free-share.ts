import { Request, Response } from "express";
import { pool } from "../helper/external/db";
import { Broker } from "../helper/external/broker-api";
import { generateBand } from "../util/get-free-share-value";
import { inBand } from "../util/in-band";
import { User } from "../../types";
import { makeError } from "../util/make-error";

export const postClaimFreeShareHandler = async (
  req: Request,
  res: Response
) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    // get user
    const { email } = req.query;
    const [found] = await connection.query<User[]>(
      "SELECT id, email, free_share_status FROM User where email = ? LIMIT 1", // if using pg, I could lock this row ie. - select <> for update
      [email]
    );

    console.log({ found });
    if (!found[0]) {
      // log
      connection.destroy();
      return res.status(422).send(makeError("user not found"));
    }

    // examine freeshare status
    if (found[0].free_share_status !== "eligible") {
      // log
      connection.destroy();
      return res.status(422).send(makeError("free share already claimed"));
    }

    const band = generateBand();

    const broker = new Broker();
    // list assets
    const assets = await broker.listTradeableAssets();
    // get price
    const prices = await Promise.all(
      assets.map((a) => broker.getLatestPrice(a.ticker))
    );

    let suitablyPricedTicker: string = "";
    let orderPrice: number = 0;

    for (const [idx, { sharePrice }] of prices.entries()) {
      if (!inBand(band, sharePrice)) {
        continue;
      }

      orderPrice = sharePrice;
      suitablyPricedTicker = assets[idx].ticker;
      break;
    }

    // todo - what if not found??
    if (!suitablyPricedTicker) {
      return res.sendStatus(400);
    }

    // const isOpen = await broker.isMarketOpen();
    // // if market closed
    // if (!isOpen) {
    //   // send to async job
    //   return;
    // }

    // optimistically set it and commit
    await connection.query(
      "UPDATE User SET free_share_status = 'claimed' where email = ?",
      [email]
    );
    await connection.commit();

    // place trade
    const { orderId } = await broker.placeBuyOrderUsingEmmaFunds(
      found[0].id,
      suitablyPricedTicker,
      1
    );

    if (!orderId) {
      // set it
      connection.beginTransaction();
      await connection.query(
        "UPDATE User SET free_share_status = 'elligible' where email = ?",
        [email]
      );
      await connection.commit();
      connection.destroy();

      throw new Error("Order failed");
    }

    return res.send({
      ticker: suitablyPricedTicker,
      price: orderPrice,
    });
  } catch (e) {
    console.log(e);
    // log error
    connection.destroy();
    return res.status(500).send("error" + JSON.stringify(e));
  }
};
