'use client';

// Controlled DatePicker example from Hacker0x01/react-datepicker v9.1.0 README (MIT).
import DatePicker from 'react-datepicker';
import { useRef } from 'react';
import { zhCN } from 'date-fns/locale/zh-CN';
import { selectedDate, dateInputValue } from '../../lib/date-input.js';

export default function DateField({ value, onChange, error, disabled }) {
  const picker = useRef(null);
  const calendarOpen = useRef(false);
  return <div onKeyDownCapture={event => {
    if (event.key === 'Escape' && calendarOpen.current) {
      event.preventDefault();
      event.stopPropagation();
      picker.current.setOpen(false);
      picker.current.input?.focus();
    }
  }}><DatePicker
    ref={picker}
    onCalendarOpen={() => { calendarOpen.current = true; }}
    onCalendarClose={() => { calendarOpen.current = false; }}
    id="date" name="date" selected={selectedDate(value)} value={value}
    onChange={date => onChange(dateInputValue(date))}
    onChangeRaw={event => {
      if (typeof event?.target?.value === 'string') {
        // Preserve raw text; never let the picker substitute a previous valid date.
        event.preventDefault();
        onChange(event.target.value);
      }
    }}
    dateFormat="yyyy-MM-dd" strictParsing locale={zhCN}
    placeholderText="YYYY-MM-DD" autoComplete="off" disabled={disabled}
    isClearable clearButtonTitle="清空日期" ariaLabelClose="清空日期"
    previousMonthButtonLabel="上个月" nextMonthButtonLabel="下个月"
    previousMonthAriaLabel="上个月" nextMonthAriaLabel="下个月"
    chooseDayAriaLabelPrefix="选择" monthAriaLabelPrefix="月份"
    calendarAriaLabel="截止日期日历"
    ariaInvalid={error ? 'true' : 'false'} ariaDescribedBy={error ? 'date-error' : 'date-help'}
    popperPlacement="bottom-start" showPopperArrow={false}
  /></div>;
}
