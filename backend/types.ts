import { RowDataPacket } from "mysql2";
import { Request } from "express";

type free_share_status = "ineligible" | "eligible" | "claimed";
export interface User extends RowDataPacket {
  id: string;
  email: string;
  free_share_status: free_share_status;
}
