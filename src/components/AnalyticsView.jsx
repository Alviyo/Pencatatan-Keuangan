import React, { useMemo, useState } from 'react';
import { 
  PieChart as PieIcon, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Sparkles,
  BarChart3,
  Calendar
} from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { CATEGORIES, formatRupiah } from '../services/storage';

export default function AnalyticsView({ transactions = [] }) {
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); // 0 = current month, -1 = last month

  // Filter transactions for chosen month
  const targetDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + selectedMonthOffset);
    return d;
  }, [selectedMonthOffset]);

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(targetDate);
  }, [targetDate]);

  const monthData = useMemo(() => {
    const m = targetDate.getMonth();
    const y = targetDate.getFullYear();

    let income = 0;
    let expense = 0;
    const catExpenses = {};

    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      if (d.getMonth() === m && d.getFullYear() === y) {
        const amt = Number(tx.amount) || 0;
        if (tx.type === 'income') {
          income += amt;
        } else if (tx.type === 'expense') {
          expense += amt;
          catExpenses[tx.category] = (catExpenses[tx.category] || 0) + amt;
        }
      }
    });

    const categoryBreakdown = Object.keys(catExpenses).map((catId) => {
      const catMeta = CATEGORIES.expense.find(c => c.id === catId) || {
        name: catId,
        color: '#64748b',
        icon: 'Tag'
      };
      const amount = catExpenses[catId];
      const percentage = expense > 0 ? ((amount / expense) * 100).toFixed(1) : 0;
      return {
        catId,
        catMeta,
        amount,
        percentage: Number(percentage)
      };
    }).sort((a, b) => b.amount - a.amount);

    return {
      income,
      expense,
      savings: income - expense,
      savingsRate: income > 0 ? Math.round(((income - expense) / income) * 100) : 0,
      categoryBreakdown
    };
  }, [transactions, targetDate]);

  // Generate SVG Donut Chart Paths
  const donutSlices = useMemo(() => {
    const { categoryBreakdown, expense } = monthData;
    if (expense === 0 || categoryBreakdown.length === 0) return [];

    let accumulatedAngle = 0;
    return categoryBreakdown.map((item) => {
      const sliceAngle = (item.amount / expense) * 360;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + sliceAngle;
      accumulatedAngle += sliceAngle;

      // Coordinate helper
      const getCoordinates = (angle) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        return {
          x: 100 + 75 * Math.cos(rad),
          y: 100 + 75 * Math.sin(rad)
        };
      };

      const start = getCoordinates(startAngle);
      const end = getCoordinates(endAngle);
      const largeArcFlag = sliceAngle > 180 ? 1 : 0;

      const pathData = sliceAngle >= 359.99 
        ? `M 100 25 A 75 75 0 1 1 99.99 25`
        : `M ${start.x} ${start.y} A 75 75 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;

      return {
        ...item,
        pathData
      };
    });
  }, [monthData]);

  return (
    <div className="analytics-container">
      {/* Header with Month Switcher */}
      <div className="analytics-header-row">
        <div>
          <h2 className="section-title">Analisis Pengeluaran & Finansial</h2>
          <p className="section-subtitle">Visualisasi distribusi dana dan pola keuangan Anda.</p>
        </div>

        <div className="month-switcher-pills">
          <button 
            className={`month-pill ${selectedMonthOffset === -1 ? 'active' : ''}`}
            onClick={() => setSelectedMonthOffset(-1)}
          >
            Bulan Lalu
          </button>
          <button 
            className={`month-pill ${selectedMonthOffset === 0 ? 'active' : ''}`}
            onClick={() => setSelectedMonthOffset(0)}
          >
            Bulan Ini ({monthLabel})
          </button>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="analytics-metrics-grid">
        <div className="metric-box income">
          <span className="metric-label">Pemasukan ({monthLabel})</span>
          <span className="metric-val text-income">{formatRupiah(monthData.income)}</span>
        </div>
        <div className="metric-box expense">
          <span className="metric-label">Pengeluaran ({monthLabel})</span>
          <span className="metric-val text-expense">{formatRupiah(monthData.expense)}</span>
        </div>
        <div className="metric-box savings">
          <span className="metric-label">Rasio Tabungan (Savings Rate)</span>
          <span className="metric-val text-savings">{monthData.savingsRate}%</span>
          <span className="metric-sub">
            {monthData.savingsRate >= 20 
              ? '✨ Bagus! Memenuhi aturan 20% tabungan' 
              : 'Tingkatkan tabungan jika memungkinkan'}
          </span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-split-grid">
        {/* Donut Chart Card */}
        <div className="chart-card">
          <h3 className="chart-card-title">
            <PieIcon size={18} />
            <span>Porsi Pengeluaran per Kategori</span>
          </h3>

          {monthData.expense === 0 ? (
            <div className="chart-empty-state">
              Belum ada data pengeluaran di periode ini.
            </div>
          ) : (
            <div className="donut-and-legend">
              <div className="donut-wrapper">
                <svg viewBox="0 0 200 200" className="donut-svg">
                  {/* Background Track Circle */}
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="75" 
                    fill="none" 
                    stroke="var(--border-subtle)" 
                    strokeWidth="22" 
                  />
                  {/* Donut Segments */}
                  {donutSlices.map((slice) => (
                    <path
                      key={slice.catId}
                      d={slice.pathData}
                      fill="none"
                      stroke={slice.catMeta.color}
                      strokeWidth="24"
                      strokeLinecap="round"
                      className="donut-segment"
                    />
                  ))}
                </svg>
                <div className="donut-center-info">
                  <span className="donut-center-title">Total</span>
                  <span className="donut-center-amt">{formatRupiah(monthData.expense)}</span>
                </div>
              </div>

              {/* Category Legend Table */}
              <div className="donut-legend-list">
                {monthData.categoryBreakdown.map((item) => (
                  <div key={item.catId} className="legend-row">
                    <div className="legend-cat-info">
                      <span className="legend-dot" style={{ backgroundColor: item.catMeta.color }}></span>
                      <span className="legend-name">{item.catMeta.name}</span>
                    </div>
                    <div className="legend-values">
                      <span className="legend-percent">{item.percentage}%</span>
                      <span className="legend-amt">{formatRupiah(item.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Spending & Financial Advice */}
        <div className="chart-card">
          <h3 className="chart-card-title">
            <BarChart3 size={18} />
            <span>Kategori Pengeluaran Terbesar</span>
          </h3>

          <div className="top-categories-list">
            {monthData.categoryBreakdown.slice(0, 5).map((item, index) => (
              <div key={item.catId} className="top-cat-item">
                <div className="top-cat-header">
                  <div className="top-cat-badge">
                    <span className="top-rank-num">#{index + 1}</span>
                    <span className="top-cat-name">{item.catMeta.name}</span>
                  </div>
                  <span className="top-cat-amt">{formatRupiah(item.amount)}</span>
                </div>

                <div className="top-cat-progress-track">
                  <div 
                    className="top-cat-progress-fill"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: item.catMeta.color 
                    }}
                  ></div>
                </div>
              </div>
            ))}

            {monthData.categoryBreakdown.length === 0 && (
              <div className="chart-empty-state">
                Tidak ada riwayat pengeluaran pada bulan ini.
              </div>
            )}
          </div>

          {/* Smart Financial Tip Box */}
          <div className="financial-tip-box">
            <div className="tip-icon-glow">
              <Sparkles size={18} />
            </div>
            <div className="tip-content">
              <span className="tip-title">Kiat Keuangan Cerdas</span>
              <p className="tip-text">
                Terapkan rumus <strong>50/30/20</strong>: 50% untuk kebutuhan pokok, 30% untuk gaya hidup, dan minimal 20% dialokasikan ke tabungan atau investasi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
