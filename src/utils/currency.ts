// Accurate integer paise arithmetic and Indian number formatting

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function formatCurrency(
  paise: number,
  currencySymbol = '₹',
  showDecimals = true
): string {
  const rupees = paise / 100;
  const isNegative = rupees < 0;
  const absValue = Math.abs(rupees);

  // Indian number format (e.g. 1,00,000.00)
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(absValue);

  return `${isNegative ? '-' : ''}${currencySymbol}${formatted}`;
}

export function formatCompactCurrency(
  paise: number,
  currencySymbol = '₹'
): string {
  const rupees = Math.abs(paise / 100);
  const sign = paise < 0 ? '-' : '';

  if (rupees >= 10000000) {
    return `${sign}${currencySymbol}${(rupees / 10000000).toFixed(2)} Cr`;
  }
  if (rupees >= 100000) {
    return `${sign}${currencySymbol}${(rupees / 100000).toFixed(2)} L`;
  }
  if (rupees >= 1000) {
    return `${sign}${currencySymbol}${(rupees / 1000).toFixed(1)}k`;
  }
  return formatCurrency(paise, currencySymbol, false);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateTimeStr: string): string {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) return dateTimeStr;

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentDateTimeString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export const EXPENSE_CATEGORIES = [
  { id: 'Food & Dining', icon: 'Utensils', color: '#f97316' },
  { id: 'Groceries', icon: 'ShoppingBag', color: '#10b981' },
  { id: 'Vegetables & Milk', icon: 'Leaf', color: '#84cc16' },
  { id: 'Rent', icon: 'Home', color: '#6366f1' },
  { id: 'Electricity', icon: 'Zap', color: '#eab308' },
  { id: 'Water & Gas', icon: 'Flame', color: '#06b6d4' },
  { id: 'Mobile Recharge', icon: 'Smartphone', color: '#3b82f6' },
  { id: 'Internet & Broadband', icon: 'Wifi', color: '#8b5cf6' },
  { id: 'Transport & Cab', icon: 'Bus', color: '#ec4899' },
  { id: 'Fuel & Petrol', icon: 'Fuel', color: '#ef4444' },
  { id: 'Education & Fees', icon: 'GraduationCap', color: '#14b8a6' },
  { id: 'Medical & Healthcare', icon: 'HeartPulse', color: '#f43f5e' },
  { id: 'Shopping & Clothes', icon: 'Shirt', color: '#a855f7' },
  { id: 'Entertainment & Movies', icon: 'Film', color: '#d946ef' },
  { id: 'Household & Cleaning', icon: 'Sparkles', color: '#64748b' },
  { id: 'Personal Care & Salon', icon: 'Smile', color: '#0ea5e9' },
  { id: 'Subscriptions & OTT', icon: 'Tv', color: '#f59e0b' },
  { id: 'Loan EMI & Debts', icon: 'Landmark', color: '#475569' },
  { id: 'Miscellaneous', icon: 'MoreHorizontal', color: '#94a3b8' },
];

export const INCOME_CATEGORIES = [
  { id: 'Salary', icon: 'Briefcase', color: '#10b981' },
  { id: 'Business', icon: 'Store', color: '#3b82f6' },
  { id: 'Freelance & Projects', icon: 'Laptop', color: '#8b5cf6' },
  { id: 'Interest & Dividends', icon: 'TrendingUp', color: '#06b6d4' },
  { id: 'Rental Income', icon: 'Building2', color: '#f59e0b' },
  { id: 'Gifts', icon: 'Gift', color: '#ec4899' },
  { id: 'Refunds & Cashback', icon: 'RotateCcw', color: '#14b8a6' },
  { id: 'Other Income', icon: 'Coins', color: '#64748b' },
];

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  upi: 'UPI (GPay / PhonePe / Paytm)',
  bank_transfer: 'Bank Transfer / NEFT / IMPS',
  debit_card: 'Debit Card',
  credit_card: 'Credit Card',
};
