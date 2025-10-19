import dayjs from 'dayjs';

const SCIENTIFIC_THRESHOLD = 1e6;

function toScientific(num, fractionDigits = 2) {
  return Number(num).toExponential(fractionDigits).replace('e', 'e');
}

export function formatCurrency(
  value,
  { currency = 'USD', minimumFractionDigits = 2, scientific = true } = {},
) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '--';
  }
  const numeric = Number(value);
  if (scientific && Math.abs(numeric) >= SCIENTIFIC_THRESHOLD) {
    return `$${toScientific(numeric, 2)}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits,
  }).format(numeric);
}

export function formatNumber(
  value,
  { maximumFractionDigits = 2, scientific = true, notation = 'standard' } = {},
) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '--';
  }
  const numeric = Number(value);

  if (scientific && Math.abs(numeric) >= SCIENTIFIC_THRESHOLD) {
    return toScientific(numeric, 2);
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
    notation,
  }).format(numeric);
}

export function formatPercentage(value, fractionDigits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '--';
  }
  return `${Number(value).toFixed(fractionDigits)}%`;
}

export function formatDateTime(value, format = 'YYYY-MM-DD HH:mm') {
  if (!value) {
    return '--';
  }
  return dayjs(value).format(format);
}

export function diffFromNow(value) {
  if (!value) return '--';
  const now = dayjs();
  const target = dayjs(value);
  const diffDays = target.diff(now, 'day');
  if (diffDays > 0) {
    return `${diffDays}天后`;
  }
  const diffHours = target.diff(now, 'hour');
  if (diffHours > 0) {
    return `${diffHours}小时后`;
  }
  const diffMinutes = target.diff(now, 'minute');
  if (diffMinutes > 0) {
    return `${diffMinutes}分钟后`;
  }
  return '已过期';
}

export function maskApiKey(key = '', visible = 6) {
  if (!key) return '--';
  if (key.length <= visible * 2) return key;
  const start = key.slice(0, visible);
  const end = key.slice(-visible);
  return `${start}···${end}`;
}
