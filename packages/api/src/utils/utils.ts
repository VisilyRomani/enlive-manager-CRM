export const IntToDisplayPrice = (price: number) => {
  return (Number(price) / 100).toFixed(2).toString();
};
