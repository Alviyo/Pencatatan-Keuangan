import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Calendar, 
  FileText, 
  Wallet as WalletIcon,
  Check
} from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { CATEGORIES, formatRupiah } from '../services/storage';

export default function TransactionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialType = 'expense', 
  editingTransaction = null,
  wallets = []
}) {
  const [type, setType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [walletId, setWalletId] = useState(wallets[0]?.id || 'cash');
  const [fromWalletId, setFromWalletId] = useState(wallets[0]?.id || 'cash');
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id || 'gopay');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setCategory(editingTransaction.category || 'food');
      setWalletId(editingTransaction.walletId || wallets[0]?.id || 'cash');
      setFromWalletId(editingTransaction.fromWalletId || wallets[0]?.id || 'cash');
      setToWalletId(editingTransaction.toWalletId || wallets[1]?.id || 'gopay');
      setDate(editingTransaction.date || new Date().toISOString().split('T')[0]);
      setNote(editingTransaction.note || '');
    } else {
      setType(initialType);
      setAmount('');
      setCategory(initialType === 'income' ? 'salary' : 'food');
      setWalletId(wallets[0]?.id || 'cash');
      setFromWalletId(wallets[0]?.id || 'cash');
      setToWalletId(wallets[1]?.id || 'gopay');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
    }
    setError('');
  }, [editingTransaction, initialType, isOpen, wallets]);

  if (!isOpen) return null;

  const handleAmountChange = (e) => {
    // Only numbers
    const val = e.target.value.replace(/[^0-9]/g, '');
    setAmount(val);
  };

  const addQuickAmount = (val) => {
    const current = Number(amount) || 0;
    setAmount(String(current + val));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Masukkan nominal transaksi yang valid.');
      return;
    }

    if (type === 'transfer' && fromWalletId === toWalletId) {
      setError('Dompet asal dan tujuan transfer tidak boleh sama.');
      return;
    }

    const payload = {
      id: editingTransaction ? editingTransaction.id : 'tx_' + Date.now(),
      type,
      amount: numAmount,
      date,
      note: note.trim()
    };

    if (type === 'transfer') {
      payload.fromWalletId = fromWalletId;
      payload.toWalletId = toWalletId;
      payload.category = 'transfer';
    } else {
      payload.walletId = walletId;
      payload.category = category;
    }

    onSave(payload);
    onClose();
  };

  const categoriesList = type === 'income' ? CATEGORIES.income : CATEGORIES.expense;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {editingTransaction ? 'Edit Catatan Transaksi' : 'Catat Transaksi Baru'}
          </h2>
          <button className="btn-modal-close" onClick={onClose} aria-label="Tutup modal">
            <X size={20} />
          </button>
        </div>

        {/* Type Switcher Tabs */}
        <div className="tx-type-tabs">
          <button 
            type="button"
            className={`tx-type-tab ${type === 'expense' ? 'active expense' : ''}`}
            onClick={() => { setType('expense'); setCategory('food'); }}
          >
            <ArrowUpRight size={16} />
            <span>Pengeluaran</span>
          </button>
          <button 
            type="button"
            className={`tx-type-tab ${type === 'income' ? 'active income' : ''}`}
            onClick={() => { setType('income'); setCategory('salary'); }}
          >
            <ArrowDownLeft size={16} />
            <span>Pemasukan</span>
          </button>
          <button 
            type="button"
            className={`tx-type-tab ${type === 'transfer' ? 'active transfer' : ''}`}
            onClick={() => setType('transfer')}
          >
            <ArrowLeftRight size={16} />
            <span>Transfer</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-alert-error">{error}</div>}

          {/* Amount Input */}
          <div className="form-group amount-group">
            <label className="form-label">Nominal</label>
            <div className="amount-input-wrapper">
              <span className="currency-prefix">Rp</span>
              <input 
                type="text" 
                inputMode="numeric"
                className="input-amount" 
                placeholder="0"
                value={amount ? Number(amount).toLocaleString('id-ID') : ''}
                onChange={handleAmountChange}
                autoFocus
              />
            </div>
            {/* Quick chips */}
            <div className="quick-amount-chips">
              <button type="button" onClick={() => addQuickAmount(10000)}>+10rb</button>
              <button type="button" onClick={() => addQuickAmount(50000)}>+50rb</button>
              <button type="button" onClick={() => addQuickAmount(100000)}>+100rb</button>
              <button type="button" onClick={() => addQuickAmount(500000)}>+500rb</button>
              <button type="button" onClick={() => setAmount('')} className="chip-clear">Reset</button>
            </div>
          </div>

          {/* Category Picker (only for expense & income) */}
          {type !== 'transfer' && (
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <div className="category-grid">
                {categoriesList.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button 
                      key={cat.id}
                      type="button"
                      className={`cat-pick-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => setCategory(cat.id)}
                    >
                      <div className="cat-pick-icon" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                        <CategoryIcon name={cat.icon} size={18} />
                      </div>
                      <span className="cat-pick-label">{cat.name}</span>
                      {isSelected && <Check size={14} className="cat-pick-check" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Wallet Selection */}
          {type === 'transfer' ? (
            <div className="transfer-wallets-row">
              <div className="form-group flex-1">
                <label className="form-label">Dari Akun / Dompet</label>
                <select 
                  className="form-select"
                  value={fromWalletId}
                  onChange={(e) => setFromWalletId(e.target.value)}
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="transfer-arrow-divider">
                <ArrowLeftRight size={18} />
              </div>

              <div className="form-group flex-1">
                <label className="form-label">Ke Akun / Dompet</label>
                <select 
                  className="form-select"
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Simpan di Akun / Dompet</label>
              <select 
                className="form-select"
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date & Note Row */}
          <div className="form-row-two">
            <div className="form-group flex-1">
              <label className="form-label">
                <Calendar size={14} /> Tanggal
              </label>
              <input 
                type="date" 
                className="form-input" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group flex-2">
              <label className="form-label">
                <FileText size={14} /> Catatan / Keterangan
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Contoh: Makan siang rendang & es teh"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn-primary-submit">
              {editingTransaction ? 'Simpan Perubahan' : 'Catat Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
