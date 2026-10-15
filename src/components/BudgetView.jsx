import React, { useState, useMemo } from 'react';
import { 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Edit3, 
  TrendingUp,
  Percent
} from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { CATEGORIES, formatRupiah } from '../services/storage';

export default function BudgetView({ 
  budgets = [], 
  transactions = [], 
  onSaveBudget 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(CATEGORIES.expense[0]?.id || 'food');
  const [budgetLimit, setBudgetLimit] = useState('');

  // Calculate expense this month per category
  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const expensesMap = {};
    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        const txDate = new Date(tx.date);
        if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
          expensesMap[tx.category] = (expensesMap[tx.category] || 0) + Number(tx.amount || 0);
        }
      }
    });
    return expensesMap;
  }, [transactions]);

  const budgetItems = useMemo(() => {
    return budgets.map((b) => {
      const catMeta = CATEGORIES.expense.find(c => c.id === b.categoryId) || {
        name: b.categoryId,
        icon: 'Tag',
        color: '#64748b'
      };
      const spent = currentMonthExpenses[b.categoryId] || 0;
      const limit = Number(b.limit) || 1;
      const percentage = Math.min(Math.round((spent / limit) * 100), 200);
      const remaining = limit - spent;

      let status = 'safe'; // safe, warning, danger
      if (percentage >= 100) status = 'danger';
      else if (percentage >= 75) status = 'warning';

      return {
        ...b,
        catMeta,
        spent,
        percentage,
        remaining,
        status
      };
    });
  }, [budgets, currentMonthExpenses]);

  const totalBudget = budgets.reduce((acc, b) => acc + (Number(b.limit) || 0), 0);
  const totalSpentInBudgeted = budgetItems.reduce((acc, b) => acc + b.spent, 0);

  const handleOpenAddOrEdit = (catId = null, currentLimit = null) => {
    if (catId) {
      setSelectedCatId(catId);
      setBudgetLimit(currentLimit ? String(currentLimit) : '');
    } else {
      // Pick first category without budget
      const existingCatIds = new Set(budgets.map(b => b.categoryId));
      const unbudgeted = CATEGORIES.expense.find(c => !existingCatIds.has(c.id));
      setSelectedCatId(unbudgeted ? unbudgeted.id : CATEGORIES.expense[0]?.id);
      setBudgetLimit('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const limitNum = Number(budgetLimit);
    if (!limitNum || limitNum <= 0) return;

    onSaveBudget({
      categoryId: selectedCatId,
      limit: limitNum
    });
    setIsModalOpen(false);
  };

  return (
    <div className="budget-container">
      {/* Header */}
      <div className="budget-header-row">
        <div>
          <h2 className="section-title">Anggaran Bulanan</h2>
          <p className="section-subtitle">
            Kendalikan pengeluaran dengan menetapkan batas kuota per kategori.
          </p>
        </div>
        <button className="btn-primary-add" onClick={() => handleOpenAddOrEdit()}>
          <Plus size={16} />
          <span>Atur Anggaran Kategori</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="budget-overview-card">
        <div className="budget-overview-stat">
          <span className="bo-label">Total Alokasi Anggaran</span>
          <span className="bo-value">{formatRupiah(totalBudget)}</span>
        </div>
        <div className="budget-overview-divider"></div>
        <div className="budget-overview-stat">
          <span className="bo-label">Terpakai Bulan Ini</span>
          <span className="bo-value spent">{formatRupiah(totalSpentInBudgeted)}</span>
        </div>
        <div className="budget-overview-divider"></div>
        <div className="budget-overview-stat">
          <span className="bo-label">Sisa Kuota Anggaran</span>
          <span className={`bo-value ${totalBudget - totalSpentInBudgeted >= 0 ? 'remaining' : 'over'}`}>
            {formatRupiah(totalBudget - totalSpentInBudgeted)}
          </span>
        </div>
      </div>

      {/* Budget Items Grid */}
      <div className="budget-items-grid">
        {budgetItems.map((item) => (
          <div key={item.categoryId} className={`budget-card status-${item.status}`}>
            <div className="budget-card-header">
              <div className="budget-cat-info">
                <div 
                  className="budget-cat-icon" 
                  style={{ backgroundColor: `${item.catMeta.color}20`, color: item.catMeta.color }}
                >
                  <CategoryIcon name={item.catMeta.icon} size={18} />
                </div>
                <span className="budget-cat-name">{item.catMeta.name}</span>
              </div>
              <button 
                className="btn-card-action"
                onClick={() => handleOpenAddOrEdit(item.categoryId, item.limit)}
                title="Ubah batas anggaran"
              >
                <Edit3 size={14} />
              </button>
            </div>

            {/* Spent vs Limit */}
            <div className="budget-amounts-row">
              <div className="budget-spent-col">
                <span className="budget-label-small">Terpakai</span>
                <span className="budget-spent-val">{formatRupiah(item.spent)}</span>
              </div>
              <div className="budget-limit-col">
                <span className="budget-label-small">Batas Maksimal</span>
                <span className="budget-limit-val">{formatRupiah(item.limit)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="budget-progress-track">
              <div 
                className={`budget-progress-fill ${item.status}`}
                style={{ width: `${Math.min(item.percentage, 100)}%` }}
              ></div>
            </div>

            {/* Status Footer */}
            <div className="budget-card-footer">
              <span className={`budget-status-pill ${item.status}`}>
                {item.status === 'danger' && <AlertTriangle size={13} />}
                {item.status === 'warning' && <AlertTriangle size={13} />}
                {item.status === 'safe' && <CheckCircle2 size={13} />}
                <span>
                  {item.status === 'danger' ? 'Melebihi Anggaran' : item.status === 'warning' ? 'Waspada Kuota' : 'Aman'} ({item.percentage}%)
                </span>
              </span>

              <span className="budget-remaining-text">
                {item.remaining >= 0 
                  ? `Sisa ${formatRupiah(item.remaining)}` 
                  : `Lebih ${formatRupiah(Math.abs(item.remaining))}`}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Budget Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Atur Batas Anggaran Kategori</h2>
              <button className="btn-modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Pilih Kategori Pengeluaran</label>
                <select 
                  className="form-select"
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                >
                  {CATEGORIES.expense.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Batas Anggaran Bulanan</label>
                <div className="amount-input-wrapper">
                  <span className="currency-prefix">Rp</span>
                  <input 
                    type="number" 
                    className="input-amount" 
                    placeholder="Contoh: 1500000" 
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-submit">
                  Simpan Anggaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
