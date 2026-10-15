import React from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Plus, 
  CreditCard, 
  PieChart 
} from 'lucide-react';

export default function MobileBottomNav({ activeTab, setActiveTab, onOpenNewTx }) {
  return (
    <nav className="mobile-bottom-nav">
      <button 
        className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
      >
        <LayoutDashboard size={20} />
        <span>Ringkasan</span>
      </button>

      <button 
        className={`mobile-nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
        onClick={() => setActiveTab('transactions')}
      >
        <ReceiptText size={20} />
        <span>Transaksi</span>
      </button>

      {/* Floating Prominent Add Button */}
      <div className="mobile-nav-center-action">
        <button className="mobile-center-add-btn" onClick={onOpenNewTx} aria-label="Catat transaksi">
          <Plus size={24} />
        </button>
      </div>

      <button 
        className={`mobile-nav-item ${activeTab === 'wallets' ? 'active' : ''}`}
        onClick={() => setActiveTab('wallets')}
      >
        <CreditCard size={20} />
        <span>Dompet</span>
      </button>

      <button 
        className={`mobile-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
        onClick={() => setActiveTab('analytics')}
      >
        <PieChart size={20} />
        <span>Analisis</span>
      </button>
    </nav>
  );
}
