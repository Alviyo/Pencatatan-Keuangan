import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  ArrowLeftRight, 
  Banknote, 
  Building2, 
  Landmark, 
  Smartphone, 
  Wallet as WalletIcon,
  Trash2,
  Edit2
} from 'lucide-react';
import { formatRupiah } from '../services/storage';

export default function WalletsView({ 
  wallets = [], 
  walletBalances = {}, 
  onSaveWallet, 
  onDeleteWallet, 
  onOpenTransfer 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [icon, setIcon] = useState('Building2');
  const [color, setColor] = useState('#2563eb');

  const ICONS_LIST = [
    { id: 'Banknote', label: 'Tunai', icon: Banknote },
    { id: 'Building2', label: 'Bank', icon: Building2 },
    { id: 'Landmark', label: 'Bank Nasional', icon: Landmark },
    { id: 'Smartphone', label: 'e-Wallet', icon: Smartphone },
    { id: 'CreditCard', label: 'Kartu', icon: CreditCard },
    { id: 'Wallet', label: 'Dompet', icon: WalletIcon }
  ];

  const COLORS_LIST = ['#10b981', '#2563eb', '#0284c7', '#8b5cf6', '#ec4899', '#f59e0b', '#f97316', '#64748b'];

  const handleOpenAdd = () => {
    setEditingWallet(null);
    setName('');
    setInitialBalance('');
    setIcon('Building2');
    setColor('#2563eb');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (w) => {
    setEditingWallet(w);
    setName(w.name);
    setInitialBalance(String(w.initialBalance || 0));
    setIcon(w.icon || 'Building2');
    setColor(w.color || '#2563eb');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      id: editingWallet ? editingWallet.id : 'wallet_' + Date.now(),
      name: name.trim(),
      initialBalance: Number(initialBalance) || 0,
      icon,
      color
    };

    onSaveWallet(payload);
    setIsModalOpen(false);
  };

  const renderWalletIcon = (iconName) => {
    const found = ICONS_LIST.find(i => i.id === iconName);
    const Comp = found ? found.icon : WalletIcon;
    return <Comp size={22} />;
  };

  const totalCalculated = Object.values(walletBalances).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="wallets-container">
      <div className="wallets-header-row">
        <div>
          <h2 className="section-title">Dompet & Rekening Bank</h2>
          <p className="section-subtitle">
            Total saldo di seluruh rekening: <strong>{formatRupiah(totalCalculated)}</strong>
          </p>
        </div>
        <div className="wallets-actions">
          <button className="btn-secondary" onClick={onOpenTransfer}>
            <ArrowLeftRight size={16} />
            <span>Transfer Antar Akun</span>
          </button>
          <button className="btn-primary-add" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Tambah Akun</span>
          </button>
        </div>
      </div>

      {/* Wallets Card Grid */}
      <div className="wallets-grid">
        {wallets.map((w) => {
          const currentBal = walletBalances[w.id] !== undefined ? walletBalances[w.id] : w.initialBalance;

          return (
            <div 
              key={w.id} 
              className="wallet-card" 
              style={{ '--wallet-accent': w.color }}
            >
              <div className="wallet-card-top">
                <div className="wallet-icon-box" style={{ backgroundColor: `${w.color}25`, color: w.color }}>
                  {renderWalletIcon(w.icon)}
                </div>
                <div className="wallet-card-actions">
                  <button 
                    className="btn-card-action" 
                    onClick={() => handleOpenEdit(w)}
                    title="Ubah info dompet"
                  >
                    <Edit2 size={14} />
                  </button>
                  {wallets.length > 1 && (
                    <button 
                      className="btn-card-action delete" 
                      onClick={() => {
                        if (window.confirm(`Hapus akun "${w.name}"?`)) {
                          onDeleteWallet(w.id);
                        }
                      }}
                      title="Hapus dompet"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="wallet-card-body">
                <h3 className="wallet-name">{w.name}</h3>
                <div className="wallet-balance-amount">
                  {formatRupiah(currentBal)}
                </div>
                <span className="wallet-initial-sub">
                  Saldo Awal: {formatRupiah(w.initialBalance || 0)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Wallet Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingWallet ? 'Ubah Akun / Dompet' : 'Tambah Akun Baru'}
              </h2>
              <button className="btn-modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Nama Akun / Dompet</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Contoh: Bank BCA, Dana, Dompet Saku" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Saldo Awal</label>
                <div className="amount-input-wrapper">
                  <span className="currency-prefix">Rp</span>
                  <input 
                    type="number" 
                    className="input-amount" 
                    placeholder="0" 
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                  />
                </div>
              </div>

              {/* Icon Picker */}
              <div className="form-group">
                <label className="form-label">Pilih Ikon</label>
                <div className="icon-select-row">
                  {ICONS_LIST.map((ic) => {
                    const Comp = ic.icon;
                    return (
                      <button
                        key={ic.id}
                        type="button"
                        className={`icon-choice-btn ${icon === ic.id ? 'active' : ''}`}
                        onClick={() => setIcon(ic.id)}
                        title={ic.label}
                      >
                        <Comp size={20} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Picker */}
              <div className="form-group">
                <label className="form-label">Pilih Warna Aksen</label>
                <div className="color-select-row">
                  {COLORS_LIST.map((col) => (
                    <button
                      key={col}
                      type="button"
                      className={`color-choice-circle ${color === col ? 'active' : ''}`}
                      style={{ backgroundColor: col }}
                      onClick={() => setColor(col)}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-submit">
                  {editingWallet ? 'Simpan Akun' : 'Tambah Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
