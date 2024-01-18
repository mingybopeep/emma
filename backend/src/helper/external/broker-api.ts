import moment from "moment";
import { sampleData } from "./mock-data";

type Asset = {
  ticker: string;
};

export class Broker {
  public constructor() {}

  public async listTradeableAssets(): Promise<Asset[]> {
    return new Promise((res, rej) => {
      return res(sampleData);
    });
  }

  public async getLatestPrice(ticker: string): Promise<{ sharePrice: number }> {
    return new Promise((res, rej) => {
      return res({ sharePrice: Math.floor(Math.random() * 200) });
    });
  }

  public async isMarketOpen(): Promise<{
    open: boolean;
    nextOpeningTime: string;
    nextClosingTime: string;
  }> {
    return new Promise((res, rej) => {
      return res({
        open: Math.random() < 0.8,
        nextOpeningTime: moment().add("30", "minute").toISOString(),
        nextClosingTime: moment().add("1", "hour").toISOString(),
      });
    });
  }

  public async placeBuyOrderUsingEmmaFunds(
    accountId: string,
    tickerSymbol: string,
    quantity: number
  ): Promise<{
    orderId: string;
  }> {
    return new Promise((res, rej) => {
      return res({
        orderId: crypto.randomUUID(),
      });
    });
  }
}
