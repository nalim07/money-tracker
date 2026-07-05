import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCompact(value: number, prefix: string = ''): string {
  const absVal = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  let formatted = '';

  if (absVal === 0) {
    return '0';
  }

  if (absVal < 1000) {
    formatted = absVal.toString();
  } else if (absVal < 1000000) {
    const val = absVal / 1000;
    formatted = (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + ' Rb';
  } else if (absVal < 1000000000) {
    const val = absVal / 1000000;
    formatted = (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + ' Jt';
  } else if (absVal < 1000000000000) {
    const val = absVal / 1000000000;
    formatted = (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + ' M';
  } else {
    const val = absVal / 1000000000000;
    formatted = (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + ' T';
  }

  return `${sign}${prefix}${formatted}`;
}
