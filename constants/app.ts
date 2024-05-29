export enum Order {
  ASC = 'asc',
  DESC = 'desc',
}

// PAGINATION
export const MAX_ITEMS_PER_PAGE = 20;
export const MAX_PAGINATION_PAGES = 5;
export const DEFAULT_PAGE_SIZE = 8;
export const DEFAULT_BOOK_PAGE_SIZE = 5;

// IMAGE
export const DEFAULT_IMAGE_URL =
  'https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/storage%2Fdefault-user.jpeg?alt=media';

export const DEFAULT_BOOK_IMAGE_URL =
  'https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/storage%2Fno-book.jpeg?alt=media';

// DATE, TIME, CURRENCY
export enum DateFormat {
  DATE = 'DD-MM-YYYY',
  DATE_TIME = 'DD-MM-YYYY HH:mm:ss',
  TIME_DATE = 'HH:mm:ss DD-MM-YYYY',
}

export const LOCALES_CURRENCY = 'us-EN';
export const CURRENCY = 'VND';
