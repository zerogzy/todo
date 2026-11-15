import { format, parse } from 'date-fns';
import { validDate } from './tasks.js';

export function selectedDate(value) {
  return value && validDate(value) ? parse(value, 'yyyy-MM-dd', new Date(2000, 0, 1)) : null;
}

export function dateInputValue(date) {
  return date ? format(date, 'yyyy-MM-dd') : '';
}
