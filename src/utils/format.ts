const capitalizeFirstLetter = (word: string) => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

const twoDecimalWithoutRounding = (n: number) => {
  return parseFloat(n.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]);
};

const currency = (amount: number, toFixed: number) => {
  return amount.toFixed(toFixed).replace(/\d(?=(\d{3})+\.)/g, "$&,");
};

export const format = {
  currency,
  capitalizeFirstLetter,
  twoDecimalWithoutRounding,
};
