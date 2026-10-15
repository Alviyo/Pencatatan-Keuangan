// Storage & Data Service for ArthaWise
import { 
  getStoredFirebaseConfig, 
  initFirebase, 
  fetchTransactionsFromCloud, 
  saveTransactionToCloud, 
  deleteTransactionFromCloud,
  syncBatchToCloud,
  fetchMetadataFromCloud 
} from './firebase';

const STORAGE_KEYS = {
  TRANSACTIONS: 'arthawise_transactions',
  WALLETS: 'arthawise_wallets',
  BUDGETS: 'arthawise_budgets',
  THEME: 'arthawise_theme',
  INITIALIZED: 'arthawise_initialized'
};

export const CATEGORIES = {
  expense: [
    { id: 'food', name: 'Makanan & Minuman', icon: 'Utensils', color: '#f97316' },
    { id: 'transport', name: 'Transportasi & Bensin', icon: 'Car', color: '#3b82f6' },
    { id: 'shopping', name: 'Belanja Kebutuhan', icon: 'ShoppingBag', color: '#ec4899' },
    { id: 'bills', name: 'Tagihan & Listrik/Air', icon: 'Zap', color: '#eab308' },
    { id: 'entertainment', name: 'Hiburan & Hobi', icon: 'Gamepad2', color: '#8b5cf6' },
    { id: 'health', name: 'Kesehatan & Obat', icon: 'HeartPulse', color: '#ef4444' },
    { id: 'education', name: 'Edukasi & Kursus', icon: 'GraduationCap', color: '#06b6d4' },
    { id: 'donation', name: 'Donasi & Sedekah', icon: 'Gift', color: '#10b981' },
    { id: 'other_expense', name: 'Lain-lain', icon: 'MoreHorizontal', color: '#64748b' }
  ],
  income: [
    { id: 'salary', name: 'Gaji Pokok', icon: 'Briefcase', color: '#10b981' },
    { id: 'freelance', name: 'Freelance & Sampingan', icon: 'Laptop', color: '#06b6d4' },
    { id: 'investment', name: 'Investasi & Dividen', icon: 'TrendingUp', color: '#8b5cf6' },
    { id: 'bonus', name: 'Bonus & THR', icon: 'Award', color: '#f59e0b' },
    { id: 'gift', name: 'Hadiah / Kiriman', icon: 'Gift', color: '#ec4899' },
    { id: 'other_income', name: 'Pemasukan Lain', icon: 'PlusCircle', color: '#64748b' }
  ]
};

export const DEFAULT_WALLETS = [
  { id: 'cash', name: 'Uang Tunai (Dompet)', icon: 'Banknote', color: '#10b981', initialBalance: 500000 },
  { id: 'bank_bca', name: 'Bank BCA', icon: 'Building2', color: '#2563eb', initialBalance: 3500000 },
  { id: 'bank_mandiri', name: 'Bank Mandiri', icon: 'Landmark', color: '#0284c7', initialBalance: 2000000 },
  { id: 'gopay', name: 'GoPay / e-Wallet', icon: 'Smartphone', color: '#059669', initialBalance: 250000 }
];

export const DEFAULT_BUDGETS = [
  { categoryId: 'food', limit: 2000000 },
  { categoryId: 'transport', limit: 600000 },
  { categoryId: 'shopping', limit: 1000000 },
  { categoryId: 'entertainment', limit: 500000 },
  { categoryId: 'bills', limit: 750000 }
];

// Seed dummy transactions for new users so the app immediately looks vibrant and useful
export const INITIAL_TRANSACTIONS = [
  {
    id: 'tx_seed_1',
    type: 'income',
    amount: 7500000,
    category: 'salary',
    walletId: 'bank_bca',
    date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString().split('T')[0],
    note: 'Gaji Bulanan'
  },
  {
    id: 'tx_seed_2',
    type: 'expense',
    amount: 65000,
    category: 'food',
    walletId: 'cash',
    date: new Date().toISOString().split('T')[0],
    note: 'Makan Siang & Es Teh Manis'
  },
  {
    id: 'tx_seed_3',
    type: 'expense',
    amount: 150000,
    category: 'transport',
    walletId: 'gopay',
    date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
    note: 'Isi Bensin Motor & Parkir'
  },
  {
    id: 'tx_seed_4',
    type: 'expense',
    amount: 285000,
    category: 'bills',
    walletId: 'bank_bca',
    date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0],
    note: 'Tagihan Listrik PLN'
  },
  {
    id: 'tx_seed_5',
    type: 'income',
    amount: 850000,
    category: 'freelance',
    walletId: 'bank_mandiri',
    date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString().split('T')[0],
    note: 'Pembayaran Desain Banner Web'
  }
];

export function getLocalTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading transactions from localStorage', e);
    return [];
  }
}

export function saveLocalTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving transactions to localStorage', e);
  }
}

export function getLocalWallets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WALLETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(DEFAULT_WALLETS));
      return DEFAULT_WALLETS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_WALLETS;
  }
}

export function saveLocalWallets(wallets) {
  try {
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
  } catch (e) {
    console.error('Error saving wallets to localStorage', e);
  }
}

export function getLocalBudgets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(DEFAULT_BUDGETS));
      return DEFAULT_BUDGETS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_BUDGETS;
  }
}

export function saveLocalBudgets(budgets) {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  } catch (e) {
    console.error('Error saving budgets to localStorage', e);
  }
}

// Format Rupiah
export function formatRupiah(number) {
  if (isNaN(number) || number === null || number === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}

// Calculate summary stats
export function calculateStats(transactions = [], wallets = []) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let monthlyIncome = 0;
  let monthlyExpense = 0;
  let totalAllTimeIncome = 0;
  let totalAllTimeExpense = 0;

  transactions.forEach((tx) => {
    const txDate = new Date(tx.date);
    const isThisMonth = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    const amount = Number(tx.amount) || 0;

    if (tx.type === 'income') {
      totalAllTimeIncome += amount;
      if (isThisMonth) monthlyIncome += amount;
    } else if (tx.type === 'expense') {
      totalAllTimeExpense += amount;
      if (isThisMonth) monthlyExpense += amount;
    }
  });

  // Calculate wallet balances
  const walletBalances = {};
  wallets.forEach((w) => {
    walletBalances[w.id] = Number(w.initialBalance) || 0;
  });

  transactions.forEach((tx) => {
    const amount = Number(tx.amount) || 0;
    if (tx.type === 'income') {
      if (walletBalances[tx.walletId] !== undefined) {
        walletBalances[tx.walletId] += amount;
      }
    } else if (tx.type === 'expense') {
      if (walletBalances[tx.walletId] !== undefined) {
        walletBalances[tx.walletId] -= amount;
      }
    } else if (tx.type === 'transfer') {
      if (walletBalances[tx.fromWalletId] !== undefined) {
        walletBalances[tx.fromWalletId] -= amount;
      }
      if (walletBalances[tx.toWalletId] !== undefined) {
        walletBalances[tx.toWalletId] += amount;
      }
    }
  });

  const totalBalance = Object.values(walletBalances).reduce((acc, curr) => acc + curr, 0);

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    monthlySavings: monthlyIncome - monthlyExpense,
    totalAllTimeIncome,
    totalAllTimeExpense,
    walletBalances
  };
}

// CSV Export
export function exportTransactionsToCSV(transactions = [], wallets = []) {
  const walletMap = {};
  wallets.forEach(w => { walletMap[w.id] = w.name; });

  const headers = ['ID', 'Tanggal', 'Jenis', 'Kategori', 'Dompet / Akun', 'Nominal (Rp)', 'Catatan'];
  const rows = transactions.map(tx => {
    const typeLabel = tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : 'Transfer';
    const cat = [...CATEGORIES.expense, ...CATEGORIES.income].find(c => c.id === tx.category);
    const catName = cat ? cat.name : (tx.type === 'transfer' ? 'Transfer Antar Dompet' : tx.category);
    const walletName = tx.type === 'transfer' 
      ? `${walletMap[tx.fromWalletId] || tx.fromWalletId} -> ${walletMap[tx.toWalletId] || tx.toWalletId}` 
      : (walletMap[tx.walletId] || tx.walletId);

    return [
      `"${tx.id}"`,
      `"${tx.date}"`,
      `"${typeLabel}"`,
      `"${catName}"`,
      `"${walletName}"`,
      tx.amount,
      `"${(tx.note || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `arthawise_keuangan_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Full Backup JSON
export function exportBackupJSON(transactions, wallets, budgets) {
  const data = {
    app: 'ArthaWise',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    transactions,
    wallets,
    budgets
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `arthawise_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
