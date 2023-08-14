export const receiptRowText = (
  key: string,
  value: string,
  receiptRowCharacter: number
) => {
  let spaces = "";
  let loop = receiptRowCharacter - (key.length + value.length);
  for (let a = 0; a < loop; a++) {
    spaces += " ";
  }
  return `${key}${spaces}${value}`;
};
