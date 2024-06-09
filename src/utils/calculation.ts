export function calculateDiscountedPrice(
  price: number,
  discountPercentage: number,
) {
  return Math.round((price - (price * discountPercentage) / 100) * 1000) / 1000;
}
