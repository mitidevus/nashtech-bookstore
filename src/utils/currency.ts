import { CURRENCY, LOCALES_CURRENCY } from 'constants/app';

export function formatCurrency(amount) {
  return new Intl.NumberFormat(LOCALES_CURRENCY, {
    style: 'currency',
    currency: CURRENCY,
  }).format(amount);
}
