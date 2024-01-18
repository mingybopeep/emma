const mockGetConnection = jest.fn();
const mockBeginTransaction = jest.fn();
const mockQuery = jest.fn();
jest.mock("../helper/external/db", () => ({
  pool: {
    getConnection: mockGetConnection,
  },
}));

const mockListTradeableAssets = jest.fn();
const mockGetLatestPrice = jest.fn();
const mockPlaceBuyOrderUsingEmmaFunds = jest.fn();
const mockBroker = jest.fn(() => ({
  listTradeableAssets: mockListTradeableAssets,
  getLatestPrice: mockGetLatestPrice,
  placeBuyOrderUsingEmmaFunds: mockPlaceBuyOrderUsingEmmaFunds,
}));
jest.mock("../helper/external/broker-api", () => ({
  Broker: mockBroker,
}));

const mockSend = jest.fn();
const mockStatus = jest.fn();
const mockSendStatus = jest.fn();
const mockRes = {
  sendStatus: mockSendStatus,
  status: mockStatus,
  send: mockSend,
};

const mockGenerateBand = jest.fn();
jest.mock("../util/get-free-share-value", () => ({
  generateBand: mockGenerateBand,
}));

import { User } from "../../types";
import { postClaimFreeShareHandler } from "./post-claim-free-share";
import { Request, Response } from "express";
import { Band } from "../types";

const stubReq: Request = {
  query: {
    email: "foo",
  },
} as unknown as Request;

const queryUserReturn: [User[]] = [
  [
    {
      id: "test-id",
      email: "test-email",
      free_share_status: "eligible",
    } as User,
  ],
];

const mockAssets: { ticker: string }[] = [{ ticker: "AAPL" }];
const mockPrice = { sharePrice: 55 };
const mockBand: Band = { min: 50, max: 60 };
const mockOrderId = "mock-order-id";

describe("postClaimFreeShareHandler", () => {
  beforeEach(() => {
    mockQuery.mockImplementationOnce(() => queryUserReturn);

    mockGetConnection.mockImplementation(() => ({
      beginTransaction: mockBeginTransaction,
      query: mockQuery,
      commit: jest.fn(),
      destroy: jest.fn(),
      catch: jest.fn(),
    }));

    mockListTradeableAssets.mockImplementationOnce(() => mockAssets);
    mockGetLatestPrice.mockImplementationOnce(() => mockPrice);
    mockPlaceBuyOrderUsingEmmaFunds.mockImplementationOnce(() => ({
      orderId: mockOrderId,
    }));

    mockGenerateBand.mockImplementationOnce(() => mockBand);

    mockStatus.mockImplementation(() => ({
      send: mockSend,
    }));
  });
  describe("success cases", () => {
    it("should return 200 with happy path", async () => {
      const res = await postClaimFreeShareHandler(
        stubReq,
        mockRes as unknown as Response
      );

      const expectedQuery =
        "UPDATE User SET free_share_status = 'claimed' where email = ?";
      const expectedArg = [stubReq.query.email];

      expect(mockQuery).toHaveBeenNthCalledWith(2, expectedQuery, expectedArg);
      const expectedReturn = {
        price: mockPrice.sharePrice,
        ticker: mockAssets[0].ticker,
      };
      expect(mockSend).toHaveBeenCalledWith(expectedReturn);
    });
  });

  describe("failure cases", () => {
    it("should return 422 when user not found", async () => {
      mockQuery.mockReset();
      mockQuery.mockImplementation(() => [[]]);

      await postClaimFreeShareHandler(stubReq, mockRes as unknown as Response);

      expect(mockStatus).toHaveBeenCalledWith(422);
    });

    it("should return 422 when user ineligible", async () => {
      const queryUserReturnIneligible = [[{ free_share_status: "ineligible" }]];
      mockQuery.mockReset();
      mockQuery.mockImplementation(() => queryUserReturnIneligible);

      await postClaimFreeShareHandler(stubReq, mockRes as unknown as Response);

      expect(mockStatus).toHaveBeenCalledWith(422);
    });
  });
});
