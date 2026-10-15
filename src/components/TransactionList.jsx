import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight,
  Download,
  Calendar,
  X,
  CreditCard
} from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { CATEGORIES, formatRupiah, exportTransactionsToCSV } from '../services/storage';

export default function TransactionList({ 
  transactions = [], 
  wallets = [], 
  onEdit, 
  onDelete, 
  onAddNew 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all, expense, income, transfer
  const [walletFilter, setWalletFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('month'); // all, today, week, month

  const walletMap = useMemo(() => {
    const map = {};
    wallets.forEach(w => { map[w.id] = w; });
    return map;
  }, [wallets]);

  const allCategories = useMemo(() => {
    return [...CATEGORIES.expense, ...CATEGORIES.income];
  }, []);

  const getCategoryMeta = (catId) => {
    return allCategories.find(c => c.id === catId) || {
      name: catId === 'transfer' ? 'Transfer Antar Dompet' : catId,
      icon: 'Tag',
      color: '#64748b'
    };
  };

  // Filtered transactions
  const filtered = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();

    return transactions.filter((tx) => {
      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // Wallet filter
      if (walletFilter !== 'all') {
        if (tx.type === 'transfer') {
          if (tx.fromWalletId !== walletFilter && tx.toWalletId !== walletFilter) return false;
        } else {
          if (tx.walletId !== walletFilter) return false;
        }
      }

      // Period filter
      if (periodFilter === 'today') {
        if (tx.date !== todayStr) return false;
      } else if (periodFilter === 'week') {
        const txDate = new Date(tx.date);
        const diffDays = (now - txDate) / (1000 * 60 * 60 * 24);
        if (diffDays > 7 || diffDays < 0) return false;
      } else if (periodFilter === 'month') {
        const txDate = new Date(tx.date);
        if (txDate.getMonth() !== now.getMonth() || txDate.getFullYear() !== now.getFullYear()) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const noteMatch = (tx.note || '').toLowerCase().includes(term);
        const catMeta = getCategoryMeta(tx.category);
        const catMatch = catMeta.name.toLowerCase().includes(term);
        const walletName = (walletMap[tx.walletId]?.name || '').toLowerCase();
        const amountMatch = String(tx.amount).includes(term);

        if (!noteMatch && !catMatch && !walletName && !amountMatch) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, typeFilter, walletFilter, periodFilter, searchTerm, walletMap]);

  // Group by Date
  const groupedByDate = useMemo(() => {
    const groups = {};
    filtered.forEach((tx) => {
      if (!groups[tx.date]) {
        groups[tx.date] = [];
      }
      groups[tx.date].push(tx);
    });
    return groups;
  }, [filtered]);

  const formatDateHeader = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    if (dateStr === today) return 'Hari Ini';
    if (dateStr === yesterday) return 'Kemarin';

    const d = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  };

  return (
    <div className="tx-list-container">
      {/* Search & Filter Toolbar */}
      <div className="tx-toolbar">
        <div className="search-input-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Cari transaksi, catatan, nominal..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="btn-clear-search" onClick={() => setSearchTerm('')}>
              <X size={15} />
            </button>
          )}
        </div>

        <div className="filter-controls-row">
          {/* Period selector */}
          <div className="period-tabs">
            <button 
              className={`period-tab ${periodFilter === 'all' ? 'active' : ''}`}
              onClick={() => setPeriodFilter('all')}
            >
              Semua Waktu
            </button>
            <button 
              className={`period-tab ${periodFilter === 'month' ? 'active' : ''}`}
              onClick={() => setPeriodFilter('month')}
            >
              Bulan Ini
            </button>
            <button 
              className={`period-tab ${periodFilter === 'week' ? 'active' : ''}`}
              onClick={() => setPeriodFilter('week')}
            >
              7 Hari
            </button>
            <button 
              className={`period-tab ${periodFilter === 'today' ? 'active' : ''}`}
              onClick={() => setPeriodFilter('today')}
            >
              Hari Ini
            </button>
          </div>

          <div className="filter-selects-group">
            {/* Type selector */}
            <select 
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Semua Jenis</option>
              <option value="expense">Pengeluaran Saja</option>
              <option value="income">Pemasukan Saja</option>
              <option value="transfer">Transfer Saja</option>
            </select>

            {/* Wallet selector */}
            <select 
              className="filter-select"
              value={walletFilter}
              onChange={(e) => setWalletFilter(e.target.value)}
            >
              <option value="all">Semua Dompet</option>
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>

            {/* Export CSV button */}
            <button 
              className="btn-export-csv"
              onClick={() => exportTransactionsToCSV(filtered, wallets)}
              title="Unduh data transaksi ke file Excel / CSV"
            >
              <Download size={16} />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transactions list */}
      <div className="tx-list-content">
        {filtered.length === 0 ? (
          <div className="empty-state-box">
            <div className="empty-icon-wrap">
              <Calendar size={36} />
            </div>
            <h3 className="empty-title">Tidak ada transaksi ditemukan</h3>
            <p className="empty-desc">
              {searchTerm || typeFilter !== 'all' || walletFilter !== 'all' || periodFilter !== 'all'
                ? 'Coba ganti kata kunci pencarian atau reset filter di atas.'
                : 'Mulai kelola keuangan Anda dengan mencatat transaksi pertama!'}
            </p>
            <button className="btn-primary-add-empty" onClick={onAddNew}>
              + Tambah Transaksi Sekarang
            </button>
          </div>
        ) : (
          Object.keys(groupedByDate).map((dateKey) => (
            <div key={dateKey} className="date-group-card">
              <div className="date-group-header">
                <span className="date-title">{formatDateHeader(dateKey)}</span>
                <span className="date-count">{groupedByDate[dateKey].length} transaksi</span>
              </div>

              <div className="tx-items-list">
                {groupedByDate[dateKey].map((tx) => {
                  const catMeta = getCategoryMeta(tx.category);
                  const isExpense = tx.type === 'expense';
                  const isIncome = tx.type === 'income';
                  const isTransfer = tx.type === 'transfer';

                  const walletName = isTransfer
                    ? `${walletMap[tx.fromWalletId]?.name || 'Akun'} → ${walletMap[tx.toWalletId]?.name || 'Akun'}`
                    : (walletMap[tx.walletId]?.name || 'Akun');

                  return (
                    <div key={tx.id} className="tx-row-item">
                      {/* Category Icon */}
                      <div 
                        className="tx-item-icon" 
                        style={{ backgroundColor: `${catMeta.color}18`, color: catMeta.color }}
                      >
                        {isTransfer ? (
                          <ArrowLeftRight size={20} />
                        ) : (
                          <CategoryIcon name={catMeta.icon} size={20} />
                        )}
                      </div>

                      {/* Info & Notes */}
                      <div className="tx-item-details">
                        <div className="tx-item-main-row">
                          <span className="tx-category-name">{catMeta.name}</span>
                          <span className={`tx-amount-text ${tx.type}`}>
                            {isIncome && '+'}
                            {isExpense && '-'}
                            {formatRupiah(tx.amount)}
                          </span>
                        </div>

                        <div className="tx-item-sub-row">
                          <span className="tx-note-text">
                            {tx.note || <span className="text-muted-italic">Tanpa catatan</span>}
                          </span>
                          <span className="tx-wallet-badge">
                            <CreditCard size={12} />
                            {walletName}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="tx-item-actions">
                        <button 
                          className="btn-action-icon edit" 
                          onClick={() => onEdit(tx)}
                          title="Edit transaksi"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button 
                          className="btn-action-icon delete" 
                          onClick={() => {
                            if (window.confirm(`Hapus transaksi "${catMeta.name}" senilai ${formatRupiah(tx.amount)}?`)) {
                              onDelete(tx.id);
                            }
                          }}
                          title="Hapus transaksi"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
