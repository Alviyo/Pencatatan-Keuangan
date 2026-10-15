import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  Eye, 
  EyeOff, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight,
  Plus
} from 'lucide-react';
import { formatRupiah } from '../services/storage';

export default function SummaryCards({ 
  stats, 
  hideBalance, 
  setHideBalance, 
  onNewExpense, 
  onNewIncome, 
  onNewTransfer 
}) {
  const currentMonthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());

  const displayAmount = (amount, isPositive = false) => {
    if (hideBalance) return '••••••••';
    return formatRupiah(amount);
  };

  return (
    <section className="summary-section">
      <div className="summary-header">
        <div>
          <h1 className="page-heading">Ringkasan Finansial</h1>
          <p className="page-subheading">Periode: <strong>{currentMonthName}</strong></p>
        </div>
        <div className="balance-toggle-wrapper">
          <button 
            className="btn-toggle-eye" 
            onClick={() => setHideBalance(!hideBalance)}
            title={hideBalance ? "Tampilkan Saldo" : "Sembunyikan Saldo"}
          >
            {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{hideBalance ? "Tampilkan Saldo" : "Sembunyikan"}</span>
          </button>
        </div>
      </div>

      {/* Hero Stats Cards Grid */}
      <div className="stats-grid">
        {/* Total Saldo Card */}
        <div className="stat-card stat-card-total">
          <div className="stat-card-glow"></div>
          <div className="stat-card-header">
            <span className="stat-label">Total Saldo (Semua Akun)</span>
            <div className="stat-icon-wrapper total">
              <Wallet size={20} />
            </div>
          </div>
          <div className="stat-value total">
            {displayAmount(stats.totalBalance)}
          </div>
          <div className="stat-footer">
            <span className="stat-subtext">Dari seluruh dompet & rekening bank</span>
          </div>
        </div>

        {/* Pemasukan Bulan Ini */}
        <div className="stat-card stat-card-income">
          <div className="stat-card-header">
            <span className="stat-label">Pemasukan Bulan Ini</span>
            <div className="stat-icon-wrapper income">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-value income">
            {displayAmount(stats.monthlyIncome)}
          </div>
          <div className="stat-footer">
            <span className="badge-pill income">
              <ArrowDownLeft size={13} /> Masuk
            </span>
            <span className="stat-subtext">Bulan berjalan</span>
          </div>
        </div>

        {/* Pengeluaran Bulan Ini */}
        <div className="stat-card stat-card-expense">
          <div className="stat-card-header">
            <span className="stat-label">Pengeluaran Bulan Ini</span>
            <div className="stat-icon-wrapper expense">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="stat-value expense">
            {displayAmount(stats.monthlyExpense)}
          </div>
          <div className="stat-footer">
            <span className="badge-pill expense">
              <ArrowUpRight size={13} /> Keluar
            </span>
            <span className="stat-subtext">Bulan berjalan</span>
          </div>
        </div>

        {/* Tabungan Bersih Bulan Ini */}
        <div className="stat-card stat-card-savings">
          <div className="stat-card-header">
            <span className="stat-label">Tabungan Bersih (Net)</span>
            <div className="stat-icon-wrapper savings">
              <PiggyBank size={20} />
            </div>
          </div>
          <div className={`stat-value ${stats.monthlySavings >= 0 ? 'savings' : 'negative'}`}>
            {displayAmount(stats.monthlySavings)}
          </div>
          <div className="stat-footer">
            <span className="stat-subtext">
              {stats.monthlySavings >= 0 
                ? 'Arus kas positif (Surplus)' 
                : 'Pengeluaran melebihi pemasukan'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="quick-actions-bar">
        <button className="quick-action-btn expense" onClick={onNewExpense}>
          <div className="quick-action-icon expense">
            <ArrowUpRight size={18} />
          </div>
          <div className="quick-action-info">
            <span className="quick-action-title">+ Pengeluaran</span>
            <span className="quick-action-desc">Catat belanja, makan, tagihan</span>
          </div>
        </button>

        <button className="quick-action-btn income" onClick={onNewIncome}>
          <div className="quick-action-icon income">
            <ArrowDownLeft size={18} />
          </div>
          <div className="quick-action-info">
            <span className="quick-action-title">+ Pemasukan</span>
            <span className="quick-action-desc">Catat gaji, freelance, bonus</span>
          </div>
        </button>

        <button className="quick-action-btn transfer" onClick={onNewTransfer}>
          <div className="quick-action-icon transfer">
            <ArrowLeftRight size={18} />
          </div>
          <div className="quick-action-info">
            <span className="quick-action-title">Transfer Antar Akun</span>
            <span className="quick-action-desc">Tarik tunai, top up e-wallet</span>
          </div>
        </button>
      </div>
    </section>
  );
}
