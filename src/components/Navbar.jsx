import React from 'react';
import { 
  Wallet, 
  LayoutDashboard, 
  ReceiptText, 
  PieChart, 
  CreditCard, 
  Target, 
  Cloud, 
  CloudCheck, 
  Sun, 
  Moon, 
  Plus, 
  Settings2,
  HardDrive
} from 'lucide-react';
import { formatRupiah } from '../services/storage';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  isCloudConnected, 
  onOpenSettings, 
  onOpenNewTx,
  totalBalance,
  hideBalance,
  toggleHideBalance
}) {
  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div className="brand" onClick={() => setActiveTab('dashboard')}>
          <div className="brand-logo-glow">
            <div className="brand-icon-box">
              <Wallet className="brand-icon" size={24} />
            </div>
          </div>
          <div className="brand-text">
            <span className="brand-title">ArthaWise</span>
            <span className="brand-subtitle">Catat Keuangan</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <button 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={17} />
            <span>Ringkasan</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <ReceiptText size={17} />
            <span>Transaksi</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'wallets' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallets')}
          >
            <CreditCard size={17} />
            <span>Dompet & Akun</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'budget' ? 'active' : ''}`}
            onClick={() => setActiveTab('budget')}
          >
            <Target size={17} />
            <span>Anggaran</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <PieChart size={17} />
            <span>Analisis</span>
          </button>
        </nav>

        {/* Right Action Items */}
        <div className="navbar-actions">
          {/* Cloud Status Pill */}
          <button 
            className={`cloud-status-badge ${isCloudConnected ? 'connected' : 'local'}`}
            onClick={onOpenSettings}
            title={isCloudConnected ? "Tersambung ke Cloud Firestore" : "Tersimpan Lokal di Browser. Klik untuk hubungkan ke Cloud."}
          >
            {isCloudConnected ? <CloudCheck size={15} /> : <HardDrive size={15} />}
            <span className="cloud-status-text">
              {isCloudConnected ? 'Cloud Aktif' : 'Lokal (Offline)'}
            </span>
          </button>

          {/* Quick Add Button */}
          <button className="btn-primary-add" onClick={onOpenNewTx}>
            <Plus size={18} />
            <span className="btn-add-text">Catat</span>
          </button>

          {/* Theme Switcher */}
          <button 
            className="btn-icon-secondary" 
            onClick={toggleTheme} 
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* Settings Button */}
          <button 
            className="btn-icon-secondary" 
            onClick={onOpenSettings} 
            title="Pengaturan & Backup Cloud"
            aria-label="Settings"
          >
            <Settings2 size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}
