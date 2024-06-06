import { CURRENCY, LOCALES_CURRENCY } from 'src/constants/app';

export function formatCurrency(amount) {
  return new Intl.NumberFormat(LOCALES_CURRENCY, {
    style: 'currency',
    currency: CURRENCY,
  }).format(amount);
}
