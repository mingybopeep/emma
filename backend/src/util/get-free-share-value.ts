import { Band } from "../../src/types";

function generateStockPrice(): number {
  const cpa = parseInt(process.env.CPA!, 10) || 100;
  const max = parseInt(process.env.MAX!, 10) || 200;
  const min = parseInt(process.env.MIN!, 10) || 30;

  const range = max - min;
  const cpaPositionInRange = (cpa - min) / range;

  const desiredAverage = cpaPositionInRange;
  const numberOfValues = 1000;

  const lambda = 1 / desiredAverage;
  const randomNumbers: number[] = [];

  for (let i = 0; i < numberOfValues; i++) {
    const exponentialValue = -Math.log(Math.random()) / lambda;

    // Ensure the generated value is within the [0, 1) range
    const scaledValue = Math.max(0, Math.min(1, exponentialValue));

    randomNumbers.push(scaledValue);
  }

  const mapped = randomNumbers.map((num) => num * range + min);
  const randomIdx = Math.floor(Math.random() * randomNumbers.length - 1);

  return mapped[randomIdx];
}

export const generateBand = (): Band => {
  const price = generateStockPrice();

  return {
    min: price - 10 < parseInt(process.env.MIN!, 10) ? price : price - 10,
    max: price + 10 > parseInt(process.env.MAX!, 10) ? price : price + 10,
  };
};
