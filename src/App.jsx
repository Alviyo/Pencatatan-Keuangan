import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar';
import SummaryCards from './components/SummaryCards';
import TransactionList from './components/TransactionList';
import WalletsView from './components/WalletsView';
import BudgetView from './components/BudgetView';
import AnalyticsView from './components/AnalyticsView';
import TransactionModal from './components/TransactionModal';
import CloudSettingsModal from './components/CloudSettingsModal';
import MobileBottomNav from './components/MobileBottomNav';

import { 
  getLocalTransactions, 
  saveLocalTransactions, 
  getLocalWallets, 
  saveLocalWallets, 
  getLocalBudgets, 
  saveLocalBudgets, 
  calculateStats 
} from './services/storage';

import { 
  getStoredFirebaseConfig, 
  initFirebase, 
  fetchTransactionsFromCloud, 
  saveTransactionToCloud, 
  deleteTransactionFromCloud, 
  syncBatchToCloud 
} from './services/firebase';

import { CheckCircle2, AlertCircle, RefreshCw, Smartphone, Download } from 'lucide-react';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('arthawise_theme') || 'dark';
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Core Data
  const [transactions, setTransactions] = useState(() => getLocalTransactions());
  const [wallets, setWallets] = useState(() => getLocalWallets());
  const [budgets, setBudgets] = useState(() => getLocalBudgets());

  // Balance visibility
  const [hideBalance, setHideBalance] = useState(false);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState('expense');
  const [editingTx, setEditingTx] = useState(null);
  const [isCloudSettingsOpen, setIsCloudSettingsOpen] = useState(false);

  // Cloud Sync state
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  // Update root HTML theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('arthawise_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // PWA install listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        showToast('Aplikasi berhasil dipasang di layar utama!', 'success');
      }
      setDeferredPrompt(null);
    } else {
      alert('Untuk memasang di HP:\n- Android Chrome: Klik tombol titik tiga (⋮) > pilih "Tambahkan ke Layar Utama" / "Instal Aplikasi"\n- iPhone Safari: Klik tombol Share (📤) > pilih "Tambah ke Layar Utama"');
    }
  };

  // Check cloud connection on load
  useEffect(() => {
    const config = getStoredFirebaseConfig();
    if (config) {
      const db = initFirebase(config);
      if (db) {
        setIsCloudConnected(true);
        // Automatically sync on initial load
        handleCloudSync();
      }
    }
  }, []);

  // Save changes locally whenever transactions change
  useEffect(() => {
    saveLocalTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveLocalWallets(wallets);
  }, [wallets]);

  useEffect(() => {
    saveLocalBudgets(budgets);
  }, [budgets]);

  // Cloud Sync Handler
  const handleCloudSync = async () => {
    const config = getStoredFirebaseConfig();
    if (!config) return;

    setIsSyncing(true);
    try {
      // 1. Fetch remote transactions
      const remoteTxs = await fetchTransactionsFromCloud();
      if (remoteTxs && remoteTxs.length > 0) {
        // Merge strategy: map by id, remote takes precedence if newer
        const map = {};
        transactions.forEach(t => { map[t.id] = t; });
        remoteTxs.forEach(t => { map[t.id] = t; });
        const merged = Object.values(map);
        setTransactions(merged);
        saveLocalTransactions(merged);
      } else {
        // Cloud is empty, push local data to cloud
        await syncBatchToCloud(transactions, wallets, budgets);
      }
      setIsCloudConnected(true);
      showToast('Data berhasil disinkronkan ke Cloud!', 'success');
    } catch (err) {
      console.error('Cloud sync error:', err);
      showToast('Sinkronisasi cloud gagal: ' + (err.message || 'Cek koneksi'), 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Add / Edit Transaction
  const handleSaveTransaction = async (tx) => {
    let updated;
    const exists = transactions.some(t => t.id === tx.id);

    if (exists) {
      updated = transactions.map(t => t.id === tx.id ? tx : t);
      showToast('Transaksi berhasil diperbarui!', 'success');
    } else {
      updated = [tx, ...transactions];
      showToast('Transaksi baru berhasil dicatat!', 'success');
    }

    setTransactions(updated);
    saveLocalTransactions(updated);

    // If cloud is connected, push this transaction
    if (isCloudConnected) {
      try {
        await saveTransactionToCloud(tx);
      } catch (err) {
        console.warn('Failed to save tx to cloud, saved locally:', err);
      }
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    saveLocalTransactions(updated);
    showToast('Transaksi berhasil dihapus.', 'info');

    if (isCloudConnected) {
      try {
        await deleteTransactionFromCloud(id);
      } catch (err) {
        console.warn('Failed to delete tx from cloud:', err);
      }
    }
  };

  // Wallets handlers
  const handleSaveWallet = (wallet) => {
    const exists = wallets.some(w => w.id === wallet.id);
    let updated;
    if (exists) {
      updated = wallets.map(w => w.id === wallet.id ? wallet : w);
      showToast('Akun dompet berhasil diperbarui!', 'success');
    } else {
      updated = [...wallets, wallet];
      showToast('Akun dompet baru ditambahkan!', 'success');
    }
    setWallets(updated);
  };

  const handleDeleteWallet = (id) => {
    const updated = wallets.filter(w => w.id !== id);
    setWallets(updated);
    showToast('Akun dompet telah dihapus.', 'info');
  };

  // Budgets handler
  const handleSaveBudget = (budget) => {
    const filtered = budgets.filter(b => b.categoryId !== budget.categoryId);
    const updated = [...filtered, budget];
    setBudgets(updated);
    showToast('Batas anggaran berhasil diperbarui!', 'success');
  };

  // Import backup data
  const handleImportData = (data) => {
    if (data.transactions) setTransactions(data.transactions);
    if (data.wallets) setWallets(data.wallets);
    if (data.budgets) setBudgets(data.budgets);
    showToast('Data berhasil dipulihkan dari cadangan!', 'success');
  };

  // Calculate overall stats
  const stats = useMemo(() => {
    return calculateStats(transactions, wallets);
  }, [transactions, wallets]);

  return (
    <div className="app-layout">
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        isCloudConnected={isCloudConnected}
        onOpenSettings={() => setIsCloudSettingsOpen(true)}
        onOpenNewTx={() => {
          setEditingTx(null);
          setTxModalType('expense');
          setIsTxModalOpen(true);
        }}
        totalBalance={stats.totalBalance}
        hideBalance={hideBalance}
        toggleHideBalance={() => setHideBalance(!hideBalance)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* PWA Mobile Install Banner */}
        {isInstallable && (
          <div className="pwa-install-banner">
            <div className="pwa-install-left">
              <div className="pwa-install-icon">
                <Smartphone size={22} />
              </div>
              <div>
                <h4 className="pwa-install-title">Pasang di Layar Utama HP</h4>
                <p className="pwa-install-desc">Bisa dibuka kapan saja & bekerja 100% offline tanpa internet</p>
              </div>
            </div>
            <div className="pwa-install-actions">
              <button className="btn-pwa-install" onClick={handleInstallClick}>
                <Download size={15} /> Pasang Aplikasi
              </button>
              <button className="btn-pwa-dismiss" onClick={() => setIsInstallable(false)}>
                ✕
              </button>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="tab-fade-in">
            <SummaryCards 
              stats={stats}
              hideBalance={hideBalance}
              setHideBalance={setHideBalance}
              onNewExpense={() => {
                setEditingTx(null);
                setTxModalType('expense');
                setIsTxModalOpen(true);
              }}
              onNewIncome={() => {
                setEditingTx(null);
                setTxModalType('income');
                setIsTxModalOpen(true);
              }}
              onNewTransfer={() => {
                setEditingTx(null);
                setTxModalType('transfer');
                setIsTxModalOpen(true);
              }}
            />

            {/* Quick Recent Transactions in Dashboard */}
            <div className="dashboard-bottom-split">
              <div className="dashboard-recent-txs">
                <div className="section-header-row">
                  <h2 className="section-title">Transaksi Terkini</h2>
                  <button 
                    className="btn-link-action"
                    onClick={() => setActiveTab('transactions')}
                  >
                    Lihat Semua ({transactions.length})
                  </button>
                </div>
                <TransactionList 
                  transactions={transactions.slice(0, 7)}
                  wallets={wallets}
                  onEdit={(tx) => {
                    setEditingTx(tx);
                    setIsTxModalOpen(true);
                  }}
                  onDelete={handleDeleteTransaction}
                  onAddNew={() => {
                    setEditingTx(null);
                    setTxModalType('expense');
                    setIsTxModalOpen(true);
                  }}
                />
              </div>

              {/* Quick Analytics & Budget side-cards */}
              <div className="dashboard-side-cards">
                <AnalyticsView transactions={transactions} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="tab-fade-in">
            <div className="page-header-row">
              <div>
                <h1 className="page-heading">Daftar Transaksi</h1>
                <p className="page-subheading">Riwayat lengkap mutasi uang masuk, keluar, dan transfer.</p>
              </div>
              <button 
                className="btn-primary-add"
                onClick={() => {
                  setEditingTx(null);
                  setTxModalType('expense');
                  setIsTxModalOpen(true);
                }}
              >
                + Tambah Transaksi
              </button>
            </div>

            <TransactionList 
              transactions={transactions}
              wallets={wallets}
              onEdit={(tx) => {
                setEditingTx(tx);
                setIsTxModalOpen(true);
              }}
              onDelete={handleDeleteTransaction}
              onAddNew={() => {
                setEditingTx(null);
                setTxModalType('expense');
                setIsTxModalOpen(true);
              }}
            />
          </div>
        )}

        {activeTab === 'wallets' && (
          <div className="tab-fade-in">
            <WalletsView 
              wallets={wallets}
              walletBalances={stats.walletBalances}
              onSaveWallet={handleSaveWallet}
              onDeleteWallet={handleDeleteWallet}
              onOpenTransfer={() => {
                setEditingTx(null);
                setTxModalType('transfer');
                setIsTxModalOpen(true);
              }}
            />
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="tab-fade-in">
            <BudgetView 
              budgets={budgets}
              transactions={transactions}
              onSaveBudget={handleSaveBudget}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="tab-fade-in">
            <AnalyticsView transactions={transactions} />
          </div>
        )}
      </main>

      {/* Floating Action Button (Mobile & Desktop Quick Add) */}
      <button 
        className="floating-add-btn" 
        onClick={() => {
          setEditingTx(null);
          setTxModalType('expense');
          setIsTxModalOpen(true);
        }}
        title="Catat Transaksi Cepat"
      >
        <span>+</span>
      </button>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onOpenNewTx={() => {
          setEditingTx(null);
          setTxModalType('expense');
          setIsTxModalOpen(true);
        }}
      />

      {/* Modals */}
      <TransactionModal 
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        initialType={txModalType}
        editingTransaction={editingTx}
        wallets={wallets}
      />

      <CloudSettingsModal 
        isOpen={isCloudSettingsOpen}
        onClose={() => setIsCloudSettingsOpen(false)}
        transactions={transactions}
        wallets={wallets}
        budgets={budgets}
        onSyncCloud={handleCloudSync}
        isSyncing={isSyncing}
        isCloudConnected={isCloudConnected}
        onImportData={handleImportData}
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
