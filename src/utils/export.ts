import jsPDF from 'jspdf';
import { Transaction, Account, MealLog } from '../types';
import { formatCurrency, formatDate } from './currency';

export function exportTransactionsToCSV(
  transactions: Transaction[],
  accounts: Account[],
  currencySymbol = '₹'
): void {
  const accountMap = new Map<string, string>(accounts.map(a => [a.id, a.name]));

  const headers = [
    'Transaction ID',
    'Date & Time',
    'Type',
    'Category',
    'Subcategory',
    'Amount (INR)',
    'Payment Method',
    'Account / Wallet',
    'Transfer Destination',
    'Description / Notes',
    'Recurring',
  ];

  const rows = transactions.map(tx => {
    const rupees = (tx.amountPaise / 100).toFixed(2);
    const accountName = accountMap.get(tx.accountId) || tx.accountId;
    const destName = tx.toAccountId ? (accountMap.get(tx.toAccountId) || tx.toAccountId) : '';
    const cleanDesc = (tx.description || '').replace(/"/g, '""');

    return [
      tx.id,
      tx.date,
      tx.type.toUpperCase(),
      `"${tx.category}"`,
      `"${tx.subcategory || ''}"`,
      rupees,
      tx.paymentMethod,
      `"${accountName}"`,
      `"${destName}"`,
      `"${cleanDesc}"`,
      tx.recurring || 'none',
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `DailyLifeManager_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportFinancialReportPDF(options: {
  reportTitle: string;
  dateRangeLabel: string;
  totalIncomePaise: number;
  totalExpensePaise: number;
  netSavingsPaise: number;
  savingsRate: number;
  transactions: Transaction[];
  accounts: Account[];
  categoryBreakdown: { category: string; amountPaise: number; percent: number }[];
  currencySymbol?: string;
}): void {
  const {
    reportTitle,
    dateRangeLabel,
    totalIncomePaise,
    totalExpensePaise,
    netSavingsPaise,
    savingsRate,
    transactions,
    accounts,
    categoryBreakdown,
    currencySymbol = 'INR ',
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const accountMap = new Map<string, string>(accounts.map(a => [a.id, a.name]));

  // Primary Header
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 595, 75, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('DAILY LIFE MANAGER', 40, 36);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Complete Personal Finance & Diet Report', 40, 52);

  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 420, 52);

  // Report Period
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(reportTitle, 40, 105);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Period: ${dateRangeLabel}`, 40, 122);

  // Summary Metrics Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(40, 135, 515, 68, 6, 6, 'FD');

  // Income Column
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL INCOME', 55, 155);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text(`${currencySymbol}${(totalIncomePaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 55, 178);

  // Expense Column
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL EXPENSE', 200, 155);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(239, 68, 68); // Red
  doc.text(`${currencySymbol}${(totalExpensePaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 200, 178);

  // Net Savings Column
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('NET SAVINGS (RATE)', 360, 155);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const savingsColor = netSavingsPaise >= 0 ? [14, 165, 233] : [239, 68, 68];
  doc.setTextColor(savingsColor[0], savingsColor[1], savingsColor[2]);
  doc.text(`${currencySymbol}${(netSavingsPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${savingsRate.toFixed(1)}%)`, 360, 178);

  // Category Breakdown Section
  let curY = 225;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Top Expense Categories', 40, curY);

  curY += 15;
  const topCategories = categoryBreakdown.slice(0, 5);
  if (topCategories.length === 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('No expenses recorded in this period.', 40, curY + 10);
    curY += 25;
  } else {
    topCategories.forEach(cat => {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(cat.category, 40, curY);
      doc.setFont('helvetica', 'bold');
      doc.text(`${currencySymbol}${(cat.amountPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${cat.percent.toFixed(1)}%)`, 400, curY);
      curY += 16;
    });
  }

  curY += 15;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Transactions Ledger (Latest Entries)', 40, curY);

  curY += 16;
  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(40, curY, 515, 20, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('DATE', 45, curY + 13);
  doc.text('TYPE', 115, curY + 13);
  doc.text('CATEGORY / NOTE', 175, curY + 13);
  doc.text('ACCOUNT', 360, curY + 13);
  doc.text('AMOUNT', 480, curY + 13);

  curY += 24;
  const recentList = transactions.slice(0, 18); // fit on page
  recentList.forEach((tx) => {
    if (curY > 780) {
      doc.addPage();
      curY = 40;
    }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(tx.date.split('T')[0], 45, curY);

    const typeColor = tx.type === 'income' ? [16, 185, 129] : tx.type === 'expense' ? [239, 68, 68] : [59, 130, 246];
    doc.setTextColor(typeColor[0], typeColor[1], typeColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(tx.type.toUpperCase(), 115, curY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const label = `${tx.category}${tx.description ? ' - ' + tx.description : ''}`;
    doc.text(label.slice(0, 32), 175, curY);

    const accName = accountMap.get(tx.accountId) || 'Account';
    doc.text(accName.slice(0, 20), 360, curY);

    doc.setFont('helvetica', 'bold');
    const amt = `${tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}${currencySymbol}${(tx.amountPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    doc.text(amt, 480, curY);

    curY += 16;
  });

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Daily Life Manager · Secure Local Storage · Accurate Integer Paise Representation', 40, 810);

  doc.save(`DailyLifeManager_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportDietReportPDF(options: {
  date: string;
  meals: MealLog[];
  waterMl: number;
  dailyCalorieTarget: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}): void {
  const { date, meals, waterMl, dailyCalorieTarget, totalCalories, totalProtein, totalCarbs, totalFat } = options;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  // Header
  doc.setFillColor(15, 118, 110); // Teal-700
  doc.rect(0, 0, 595, 75, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('DAILY LIFE MANAGER - DIET & NUTRITION', 40, 36);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Daily Wellness & Calorie Summary · Date: ${formatDate(date)}`, 40, 54);

  // Calorie & Macros Box
  doc.setFillColor(240, 253, 250);
  doc.setDrawColor(204, 251, 241);
  doc.roundedRect(40, 95, 515, 80, 6, 6, 'FD');

  doc.setTextColor(15, 118, 110);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CALORIES CONSUMED', 55, 115);
  doc.setFontSize(16);
  doc.text(`${totalCalories} / ${dailyCalorieTarget} kcal`, 55, 140);

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text(`Protein: ${totalProtein.toFixed(1)}g`, 240, 125);
  doc.text(`Carbs: ${totalCarbs.toFixed(1)}g`, 240, 145);
  doc.text(`Fat: ${totalFat.toFixed(1)}g`, 240, 165);

  doc.text(`Water Intake: ${waterMl} ml`, 380, 125);
  const percentMet = Math.round((totalCalories / dailyCalorieTarget) * 100);
  doc.text(`Target Achieved: ${percentMet}%`, 380, 145);

  // Meals List
  let curY = 205;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Logged Meals & Snacks', 40, curY);

  curY += 20;
  meals.forEach(m => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 118, 110);
    doc.text(`[${m.mealType.toUpperCase().replace('_', ' ')}] ${m.foodName}`, 40, curY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`${m.servingSize} (x${m.servingsCount}) · ${m.calories} kcal`, 380, curY);
    curY += 16;
  });

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Note: Nutrition values are estimates for wellness tracking and not medical advice.', 40, 780);

  doc.save(`DailyLifeManager_Diet_${date}.pdf`);
}

export function shareOrDownloadData(text: string, title: string): void {
  if (navigator.share) {
    navigator.share({
      title,
      text,
    }).catch(err => {
      console.log('Share canceled or failed:', err);
    });
  } else {
    // Fallback copy to clipboard
    navigator.clipboard.writeText(text);
    alert('Summary copied to clipboard! You can paste and share it in WhatsApp or messages.');
  }
}
