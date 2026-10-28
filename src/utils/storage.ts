import { AppDatabaseState, FoodItem, Transaction, Account } from '../types';
import { getTodayDateString } from './currency';

const STORAGE_KEY = 'daily_life_manager_db_v1';

export const INITIAL_FOOD_DATABASE: FoodItem[] = [
  // Indian Breads & Grains
  { id: 'f-1', name: 'Roti / Chapati (Whole Wheat)', servingSize: '1 medium (35g)', calories: 85, proteinGrams: 3, carbsGrams: 16, fatGrams: 0.5, category: 'Breads & Grains' },
  { id: 'f-2', name: 'Paratha (Plain with Ghee)', servingSize: '1 piece (60g)', calories: 180, proteinGrams: 4, carbsGrams: 24, fatGrams: 7, category: 'Breads & Grains' },
  { id: 'f-3', name: 'Aloo Paratha', servingSize: '1 stuffed paratha (90g)', calories: 240, proteinGrams: 5, carbsGrams: 35, fatGrams: 9, category: 'Breads & Grains' },
  { id: 'f-4', name: 'Steamed White Rice', servingSize: '1 katori / bowl (150g)', calories: 195, proteinGrams: 4, carbsGrams: 43, fatGrams: 0.5, category: 'Breads & Grains' },
  { id: 'f-5', name: 'Brown Rice', servingSize: '1 katori / bowl (150g)', calories: 170, proteinGrams: 3.8, carbsGrams: 36, fatGrams: 1.2, category: 'Breads & Grains' },
  { id: 'f-6', name: 'Idli (Steamed)', servingSize: '2 medium pieces (100g)', calories: 140, proteinGrams: 4, carbsGrams: 28, fatGrams: 0.4, category: 'Breakfast' },
  { id: 'f-7', name: 'Plain Dosa', servingSize: '1 medium (80g)', calories: 165, proteinGrams: 3.5, carbsGrams: 29, fatGrams: 3.8, category: 'Breakfast' },
  { id: 'f-8', name: 'Poha (flattened rice with peanuts)', servingSize: '1 bowl (150g)', calories: 220, proteinGrams: 4.5, carbsGrams: 38, fatGrams: 6, category: 'Breakfast' },
  { id: 'f-9', name: 'Upma (Semolina)', servingSize: '1 bowl (150g)', calories: 210, proteinGrams: 4, carbsGrams: 35, fatGrams: 5.5, category: 'Breakfast' },
  { id: 'f-10', name: 'Masala Oats', servingSize: '1 bowl (150g)', calories: 175, proteinGrams: 6, carbsGrams: 28, fatGrams: 4, category: 'Breakfast' },

  // Dals & Curries
  { id: 'f-11', name: 'Yellow Dal Tadka (Toor / Moong)', servingSize: '1 bowl (180g)', calories: 160, proteinGrams: 9, carbsGrams: 22, fatGrams: 4.5, category: 'Dals & Curries' },
  { id: 'f-12', name: 'Dal Makhani', servingSize: '1 bowl (180g)', calories: 270, proteinGrams: 10, carbsGrams: 28, fatGrams: 14, category: 'Dals & Curries' },
  { id: 'f-13', name: 'Chole / Chickpea Curry', servingSize: '1 bowl (180g)', calories: 230, proteinGrams: 11, carbsGrams: 34, fatGrams: 6, category: 'Dals & Curries' },
  { id: 'f-14', name: 'Rajma / Kidney Beans Curry', servingSize: '1 bowl (180g)', calories: 210, proteinGrams: 12, carbsGrams: 32, fatGrams: 4, category: 'Dals & Curries' },
  { id: 'f-15', name: 'Paneer Butter Masala', servingSize: '1 bowl (180g)', calories: 330, proteinGrams: 14, carbsGrams: 16, fatGrams: 24, category: 'Dals & Curries' },
  { id: 'f-16', name: 'Palak Paneer', servingSize: '1 bowl (180g)', calories: 240, proteinGrams: 12, carbsGrams: 11, fatGrams: 17, category: 'Dals & Curries' },
  { id: 'f-17', name: 'Mixed Vegetable Sabzi (Bhindi/Gobi)', servingSize: '1 bowl (150g)', calories: 120, proteinGrams: 3, carbsGrams: 14, fatGrams: 5.5, category: 'Vegetables' },
  { id: 'f-18', name: 'Chicken Curry (Home-style)', servingSize: '1 bowl (180g)', calories: 280, proteinGrams: 26, carbsGrams: 8, fatGrams: 15, category: 'Poultry & Meat' },
  { id: 'f-19', name: 'Egg Bhurji / Scrambled (2 eggs)', servingSize: '2 eggs (120g)', calories: 195, proteinGrams: 13, carbsGrams: 4, fatGrams: 14, category: 'Eggs' },
  { id: 'f-20', name: 'Boiled Egg', servingSize: '1 large egg (50g)', calories: 74, proteinGrams: 6.3, carbsGrams: 0.4, fatGrams: 5, category: 'Eggs' },

  // Dairy & Sides
  { id: 'f-21', name: 'Plain Curd / Dahi', servingSize: '1 katori (150g)', calories: 95, proteinGrams: 4.8, carbsGrams: 6.5, fatGrams: 4.2, category: 'Dairy' },
  { id: 'f-22', name: 'Cucumber & Tomato Salad', servingSize: '1 plate (150g)', calories: 35, proteinGrams: 1.5, carbsGrams: 7, fatGrams: 0.2, category: 'Salads' },
  { id: 'f-23', name: 'Masala Chai with Milk & Sugar', servingSize: '1 cup (150ml)', calories: 90, proteinGrams: 2.5, carbsGrams: 14, fatGrams: 2.8, category: 'Beverages' },
  { id: 'f-24', name: 'Green Tea (No Sugar)', servingSize: '1 mug (200ml)', calories: 2, proteinGrams: 0, carbsGrams: 0.4, fatGrams: 0, category: 'Beverages' },
  { id: 'f-25', name: 'Black Coffee (No Sugar)', servingSize: '1 mug (200ml)', calories: 4, proteinGrams: 0.3, carbsGrams: 0.2, fatGrams: 0, category: 'Beverages' },

  // Snacks & Fruits
  { id: 'f-26', name: 'Samosa', servingSize: '1 piece (75g)', calories: 260, proteinGrams: 4, carbsGrams: 30, fatGrams: 14, category: 'Snacks' },
  { id: 'f-27', name: 'Roasted Chana / Bengal Gram', servingSize: '1 fistful (40g)', calories: 140, proteinGrams: 7, carbsGrams: 22, fatGrams: 2.2, category: 'Snacks' },
  { id: 'f-28', name: 'Apple', servingSize: '1 medium (150g)', calories: 80, proteinGrams: 0.4, carbsGrams: 21, fatGrams: 0.3, category: 'Fruits' },
  { id: 'f-29', name: 'Banana', servingSize: '1 medium (120g)', calories: 105, proteinGrams: 1.3, carbsGrams: 27, fatGrams: 0.4, category: 'Fruits' },
  { id: 'f-30', name: 'Mixed Almonds & Walnuts', servingSize: '1 small handful (30g)', calories: 185, proteinGrams: 5, carbsGrams: 6, fatGrams: 17, category: 'Snacks' },
];

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-cash',
    name: 'Cash in Hand',
    type: 'cash',
    openingBalancePaise: 500000, // ₹5,000.00
    currentBalancePaise: 385000, // ₹3,850.00
    color: '#10b981',
    icon: 'Wallet',
  },
  {
    id: 'acc-sbi',
    name: 'State Bank of India',
    type: 'bank',
    bankName: 'SBI Savings',
    accountNumberLast4: '4821',
    openingBalancePaise: 4500000, // ₹45,000.00
    currentBalancePaise: 6842000, // ₹68,420.00
    color: '#0284c7',
    icon: 'Building2',
  },
  {
    id: 'acc-hdfc',
    name: 'HDFC Bank',
    type: 'bank',
    bankName: 'HDFC Salary A/c',
    accountNumberLast4: '9034',
    openingBalancePaise: 2500000, // ₹25,000.00
    currentBalancePaise: 5410000, // ₹54,100.00
    color: '#4f46e5',
    icon: 'Landmark',
  },
  {
    id: 'acc-paytm',
    name: 'Paytm / UPI Wallet',
    type: 'wallet',
    openingBalancePaise: 200000, // ₹2,000.00
    currentBalancePaise: 165000, // ₹1,650.00
    color: '#06b6d4',
    icon: 'Smartphone',
  },
  {
    id: 'acc-icici-cc',
    name: 'ICICI Amazon Pay Card',
    type: 'credit_card',
    bankName: 'ICICI Bank',
    accountNumberLast4: '1102',
    openingBalancePaise: 0,
    currentBalancePaise: -320000, // -₹3,200.00 (Due)
    color: '#f97316',
    icon: 'CreditCard',
  },
];

export function getInitialDatabaseState(): AppDatabaseState {
  const today = getTodayDateString();
  const [yearStr, monthStr] = today.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  // Helper date for this month
  const d1 = `${year}-${String(month).padStart(2, '0')}-01T09:30`;
  const d3 = `${year}-${String(month).padStart(2, '0')}-03T11:15`;
  const d5 = `${year}-${String(month).padStart(2, '0')}-05T14:20`;
  const d7 = `${year}-${String(month).padStart(2, '0')}-07T19:40`;
  const todayMorning = `${today}T08:45`;
  const todayLunch = `${today}T13:10`;

  const initialTransactions: Transaction[] = [
    {
      id: 'tx-1',
      type: 'income',
      amountPaise: 7500000, // ₹75,000.00 Salary
      date: d1,
      category: 'Salary',
      subcategory: 'Monthly Salary',
      paymentMethod: 'bank_transfer',
      accountId: 'acc-hdfc',
      description: 'October Monthly Salary credited',
      createdAt: Date.now() - 86400000 * 5,
    },
    {
      id: 'tx-2',
      type: 'expense',
      amountPaise: 1800000, // ₹18,000.00 Rent
      date: d1,
      category: 'Rent',
      subcategory: 'Flat Rent',
      paymentMethod: 'upi',
      accountId: 'acc-hdfc',
      description: 'Apartment rent paid via GPay to landlord',
      createdAt: Date.now() - 86400000 * 5,
    },
    {
      id: 'tx-3',
      type: 'transfer',
      amountPaise: 1000000, // ₹10,000 Transfer HDFC to SBI
      date: d3,
      category: 'Transfer',
      paymentMethod: 'bank_transfer',
      accountId: 'acc-hdfc',
      toAccountId: 'acc-sbi',
      description: 'Savings transfer to SBI emergency fund',
      createdAt: Date.now() - 86400000 * 4,
    },
    {
      id: 'tx-4',
      type: 'expense',
      amountPaise: 245000, // ₹2,450.00 Groceries
      date: d3,
      category: 'Groceries',
      subcategory: 'Supermarket',
      paymentMethod: 'upi',
      accountId: 'acc-sbi',
      description: 'DMart monthly provisions & spices',
      createdAt: Date.now() - 86400000 * 4,
    },
    {
      id: 'tx-5',
      type: 'expense',
      amountPaise: 145000, // ₹1,450.00 Electricity
      date: d5,
      category: 'Electricity',
      subcategory: 'Power Bill',
      paymentMethod: 'upi',
      accountId: 'acc-paytm',
      description: 'State Electricity Board bill',
      createdAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'tx-6',
      type: 'expense',
      amountPaise: 89900, // ₹899.00 Internet
      date: d5,
      category: 'Internet & Broadband',
      subcategory: 'Fiber Wifi',
      paymentMethod: 'upi',
      accountId: 'acc-paytm',
      description: 'Airtel Xstream Fiber 100Mbps plan',
      createdAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'tx-7',
      type: 'income',
      amountPaise: 1200000, // ₹12,000.00 Freelance
      date: d7,
      category: 'Freelance & Projects',
      subcategory: 'UI Consultation',
      paymentMethod: 'bank_transfer',
      accountId: 'acc-sbi',
      description: 'Mobile app consulting milestone payout',
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'tx-8',
      type: 'expense',
      amountPaise: 38000, // ₹380.00 Fuel
      date: todayMorning,
      category: 'Fuel & Petrol',
      subcategory: 'Bike petrol',
      paymentMethod: 'cash',
      accountId: 'acc-cash',
      description: 'Indian Oil petrol refill (cash)',
      createdAt: Date.now() - 3600000 * 6,
    },
    {
      id: 'tx-9',
      type: 'expense',
      amountPaise: 42000, // ₹420.00 Food & Dining
      date: todayLunch,
      category: 'Food & Dining',
      subcategory: 'Thali & Lassi',
      paymentMethod: 'upi',
      accountId: 'acc-sbi',
      description: 'North Indian lunch thali with colleagues',
      createdAt: Date.now() - 3600000 * 2,
    },
  ];

  return {
    version: 1,
    transactions: initialTransactions,
    accounts: INITIAL_ACCOUNTS,
    budgets: {
      dailyPaise: 150000, // ₹1,500 / day
      weeklyPaise: 1000000, // ₹10,000 / week
      monthlyPaise: 4500000, // ₹45,000 / month
      categoryBudgets: [
        { category: 'Food & Dining', monthlyLimitPaise: 800000 },
        { category: 'Groceries', monthlyLimitPaise: 1000000 },
        { category: 'Rent', monthlyLimitPaise: 1800000 },
        { category: 'Electricity', monthlyLimitPaise: 250000 },
        { category: 'Fuel & Petrol', monthlyLimitPaise: 400000 },
        { category: 'Entertainment & Movies', monthlyLimitPaise: 300000 },
        { category: 'Shopping & Clothes', monthlyLimitPaise: 500000 },
      ],
      alertThresholdPercent: 80,
    },
    savingsGoals: [
      {
        id: 'sg-1',
        name: 'Emergency Fund (6 Months)',
        targetPaise: 20000000, // ₹2,00,000
        savedPaise: 13500000, // ₹1,35,000
        deadlineDate: `${year}-12-31`,
        category: 'Emergency',
        completed: false,
        notes: 'SBI FD and liquid mutual fund',
      },
      {
        id: 'sg-2',
        name: 'Diwali Festive Gift & Electronics',
        targetPaise: 5000000, // ₹50,000
        savedPaise: 4200000, // ₹42,000
        deadlineDate: `${year}-11-15`,
        category: 'Festivals',
        completed: false,
        notes: 'Gifts for family and smartphone exchange',
      },
      {
        id: 'sg-3',
        name: 'New Two-Wheeler Downpayment',
        targetPaise: 3500000, // ₹35,000
        savedPaise: 3500000, // ₹35,000 (Goal reached!)
        deadlineDate: `${year}-10-20`,
        category: 'Vehicle',
        completed: true,
        notes: 'Electric scooter downpayment saved in HDFC recurring deposit',
      },
    ],
    lentBorrowed: [
      {
        id: 'lb-1',
        type: 'lent',
        personName: 'Rohan Sharma',
        phone: '+91 98765 43210',
        amountPaise: 500000, // ₹5,000
        paidPaise: 200000,
        dueDate: `${year}-11-10`,
        status: 'partially_settled',
        notes: 'Office laptop repair emergency support',
        createdAt: `${year}-10-15`,
      },
      {
        id: 'lb-2',
        type: 'borrowed',
        personName: 'Vikram Mehta',
        phone: '+91 99887 76655',
        amountPaise: 250000, // ₹2,500
        paidPaise: 0,
        dueDate: `${year}-11-05`,
        status: 'pending',
        notes: 'Shared group dinner payment to settle via UPI',
        createdAt: `${year}-10-22`,
      },
    ],
    meals: [
      {
        id: 'm-1',
        mealType: 'breakfast',
        foodName: 'Poha with peanuts & Masala Chai',
        servingSize: '1 plate + 1 cup',
        servingsCount: 1,
        calories: 310,
        proteinGrams: 7,
        carbsGrams: 52,
        fatGrams: 8.8,
        date: today,
        time: '08:30',
        notes: 'Freshly cooked home breakfast',
        createdAt: Date.now() - 14400000,
      },
      {
        id: 'm-2',
        mealType: 'lunch',
        foodName: 'Roti (2) + Dal Tadka + Bhindi Sabzi + Curd',
        servingSize: 'Standard lunch meal',
        servingsCount: 1,
        calories: 545,
        proteinGrams: 21,
        carbsGrams: 74,
        fatGrams: 14.7,
        date: today,
        time: '13:00',
        notes: 'Balanced lunch at workplace cafeteria',
        createdAt: Date.now() - 7200000,
      },
    ],
    customFoods: [],
    waterLogs: {
      [today]: 1750, // 1750 ml today
    },
    weightRecords: [
      {
        id: 'w-1',
        date: `${year}-10-01`,
        weightKg: 73.5,
        bmi: 24.8,
        notes: 'Monthly weigh-in',
      },
      {
        id: 'w-2',
        date: `${year}-10-15`,
        weightKg: 72.8,
        bmi: 24.6,
        notes: 'Post morning workout',
      },
      {
        id: 'w-3',
        date: today,
        weightKg: 72.2,
        bmi: 24.4,
        notes: 'Consistent hydration & walking',
      },
    ],
    billReminders: [
      {
        id: 'b-1',
        title: 'Apartment Rent to Landlord',
        category: 'Rent',
        amountPaise: 1800000,
        dueDate: `${year}-${String(month === 12 ? 1 : month + 1).padStart(2, '0')}-01`,
        recurring: 'monthly',
        isPaid: true,
        lastPaidDate: d1.split('T')[0],
        accountId: 'acc-hdfc',
      },
      {
        id: 'b-2',
        title: 'Electricity Board Bill',
        category: 'Electricity',
        amountPaise: 145000,
        dueDate: `${year}-${String(month).padStart(2, '0')}-28`,
        recurring: 'monthly',
        isPaid: true,
        lastPaidDate: d5.split('T')[0],
        accountId: 'acc-paytm',
      },
      {
        id: 'b-3',
        title: 'Airtel Broadband Fiber',
        category: 'Internet & Broadband',
        amountPaise: 89900,
        dueDate: `${year}-${String(month).padStart(2, '0')}-29`,
        recurring: 'monthly',
        isPaid: false,
        accountId: 'acc-paytm',
      },
      {
        id: 'b-4',
        title: 'Mobile Recharge (Jio 84 days)',
        category: 'Mobile Recharge',
        amountPaise: 74900,
        dueDate: `${year}-${String(month).padStart(2, '0')}-30`,
        recurring: 'monthly',
        isPaid: false,
        accountId: 'acc-sbi',
      },
    ],
    settings: {
      currencyCode: 'INR',
      currencySymbol: '₹',
      theme: 'light',
      isPinLockEnabled: false,
      pinCode: '1234',
      securityQuestion: 'What is your favorite food?',
      securityAnswer: 'biryani',
      dailyCalorieTarget: 2000,
      dailyWaterTargetMl: 2500,
      enableNotifications: true,
      enableOverspendingAlerts: true,
      userHeightCm: 172,
    },
  };
}

export function loadDatabase(): AppDatabaseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialDatabaseState();
      saveDatabase(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as AppDatabaseState;
    // Basic schema checks
    if (!parsed.transactions || !parsed.accounts || !parsed.settings) {
      const initial = getInitialDatabaseState();
      saveDatabase(initial);
      return initial;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load database from localStorage:', err);
    return getInitialDatabaseState();
  }
}

export function saveDatabase(data: AppDatabaseState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save database to localStorage:', err);
  }
}

// Recalculates all account balances from opening balances and transaction ledger
export function recalculateAccountBalances(
  accounts: Account[],
  transactions: Transaction[]
): Account[] {
  const balanceMap = new Map<string, number>();

  // Start with opening balances
  for (const acc of accounts) {
    balanceMap.set(acc.id, acc.openingBalancePaise);
  }

  // Iterate over transactions
  for (const tx of transactions) {
    if (tx.type === 'income') {
      const current = balanceMap.get(tx.accountId) ?? 0;
      balanceMap.set(tx.accountId, current + tx.amountPaise);
    } else if (tx.type === 'expense') {
      const current = balanceMap.get(tx.accountId) ?? 0;
      balanceMap.set(tx.accountId, current - tx.amountPaise);
    } else if (tx.type === 'transfer' && tx.toAccountId) {
      const fromBal = balanceMap.get(tx.accountId) ?? 0;
      const toBal = balanceMap.get(tx.toAccountId) ?? 0;
      balanceMap.set(tx.accountId, fromBal - tx.amountPaise);
      balanceMap.set(tx.toAccountId, toBal + tx.amountPaise);
    }
  }

  return accounts.map((acc) => ({
    ...acc,
    currentBalancePaise: balanceMap.get(acc.id) ?? acc.openingBalancePaise,
  }));
}
