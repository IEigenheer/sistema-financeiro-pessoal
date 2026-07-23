export declare function parseLocalDate(value: string): Date;
export declare function formatLocalDate(value: Date): string;
export declare function monthStartFromDate(value: string): string;
export declare function parseMonthStart(value: string): Date;
export declare function formatMonthStart(value: Date): string;
export declare function addMonths(monthStart: string, count: number): string;
export declare function compareMonthStarts(left: string, right: string): number;
export declare function lastDayOfMonth(monthStart: string): string;
export declare function clampDayToMonth(monthStart: string, day: number): string;
