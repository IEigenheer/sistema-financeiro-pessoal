'use client';

import { MonthsWorkspace } from './months-workspace';

type Props = {
  year: number;
  month: number;
};

export function MonthPage({ year, month }: Props) {
  return <MonthsWorkspace initialYear={year} initialMonth={month} />;
}
