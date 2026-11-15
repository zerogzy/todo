import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { selectedDate, dateInputValue } from '../lib/date-input.js';

test('date adapter accepts optional strict dates and never substitutes previous selection for invalid text', () => {
  for (const value of ['', '2026-02-30', '2027-02-29', '2028-2-29', '0000-01-01', 'garbage', '2028-02-29T00:00:00Z']) assert.equal(selectedDate(value), null);
  assert.equal(dateInputValue(null), '');
  assert.equal(dateInputValue(selectedDate('2028-02-29')), '2028-02-29');
  assert.equal(dateInputValue(selectedDate('0099-01-01')), '0099-01-01');
});

test('selected calendar day roundtrips in positive and negative client timezones', () => {
  const code = `import { selectedDate, dateInputValue } from './lib/date-input.js';
    for (const day of ['2028-02-29','2026-01-01','2026-12-31']) {
      if (dateInputValue(selectedDate(day)) !== day) process.exit(1);
    }
    if (dateInputValue(new Date(2028,1,29)) !== '2028-02-29') process.exit(1);`;
  for (const TZ of ['Pacific/Kiritimati', 'America/Los_Angeles', 'UTC', 'Asia/Shanghai']) {
    execFileSync(process.execPath, ['--input-type=module', '-e', code], { env: { ...process.env, TZ } });
  }
});
