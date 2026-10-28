export type TransactionType = 'income' | 'expense' | 'transfer';

export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'debit_card' | 'credit_card';

export type RecurringFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Transaction {
  id: string;
  type: TransactionType;
  amountPaise: number; // Stored in integer paise (e.g., 25050 for ₹250.50)
  date: string; // ISO date string (YYYY-MM-DDTHH:mm)
  category: string;
  subcategory?: string;
  paymentMethod: PaymentMethod;
  accountId: string; // Source account
  toAccountId?: string; // For transfers
  description: string;
  receiptImage?: string; // Base64 data URL
  recurring?: RecurringFrequency;
  createdAt: number;
}

export type AccountType = 'cash' | 'bank' | 'wallet' | 'credit_card';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  openingBalancePaise: number;
  currentBalancePaise: number;
  bankName?: string;
  accountNumberLast4?: string;
  color: string;
  icon: string;
}

export interface CategoryBudget {
  category: string;
  monthlyLimitPaise: number;
}

export interface BudgetConfig {
  dailyPaise: number;
  weeklyPaise: number;
  monthlyPaise: number;
  categoryBudgets: CategoryBudget[];
  alertThresholdPercent: number; // e.g. 80
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetPaise: number;
  savedPaise: number;
  deadlineDate: string; // YYYY-MM-DD
  category: string;
  completed: boolean;
  notes?: string;
}

export interface LentBorrowedRecord {
  id: string;
  type: 'lent' | 'borrowed'; // Lent = money I gave (receivable), Borrowed = money I took (payable)
  personName: string;
  phone?: string;
  amountPaise: number;
  paidPaise: number;
  dueDate: string;
  status: 'pending' | 'partially_settled' | 'settled';
  notes?: string;
  createdAt: string;
}

export type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'evening_snack' | 'dinner';

export interface FoodItem {
  id: string;
  name: string;
  servingSize: string; // e.g. "1 medium roti", "1 cup (150g)", "1 bowl (200g)"
  calories: number; // kcal per serving
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  category: string; // e.g. "Indian Bread", "Curry/Dal", "Dairy", "Beverages", "Fruits"
  isCustom?: boolean;
}

export interface MealLog {
  id: string;
  mealType: MealType;
  foodName: string;
  servingSize: string;
  servingsCount: number;
  calories: number; // total for the servings
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  notes?: string;
  createdAt: number;
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  intakeMl: number; // e.g., 2250 ml
}

export interface WeightRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  bmi?: number;
  notes?: string;
}

export interface BillReminder {
  id: string;
  title: string;
  category: string;
  amountPaise: number;
  dueDate: string; // YYYY-MM-DD
  recurring: RecurringFrequency;
  isPaid: boolean;
  lastPaidDate?: string;
  accountId?: string;
}

export interface UserSettings {
  currencyCode: string; // 'INR', 'USD', 'EUR', etc.
  currencySymbol: string; // '₹', '$', etc.
  theme: 'light' | 'dark' | 'system';
  isPinLockEnabled: boolean;
  pinCode?: string; // 4-digit PIN
  securityQuestion?: string;
  securityAnswer?: string;
  dailyCalorieTarget: number; // e.g., 2000
  dailyWaterTargetMl: number; // e.g., 2500
  enableNotifications: boolean;
  enableOverspendingAlerts: boolean;
  userHeightCm: number; // for BMI calculation, e.g. 172
}

export interface AppDatabaseState {
  version: number;
  transactions: Transaction[];
  accounts: Account[];
  budgets: BudgetConfig;
  savingsGoals: SavingsGoal[];
  lentBorrowed: LentBorrowedRecord[];
  meals: MealLog[];
  customFoods: FoodItem[];
  waterLogs: Record<string, number>; // date -> intakeMl
  weightRecords: WeightRecord[];
  billReminders: BillReminder[];
  settings: UserSettings;
}
