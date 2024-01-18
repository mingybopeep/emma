import { Band } from "../../src/types";

export const inBand = (band: Band, price: number): Boolean =>
  price > band.min && price < band.max;
