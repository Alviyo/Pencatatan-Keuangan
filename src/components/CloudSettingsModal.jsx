import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cloud, 
  CloudCheck, 
  HardDrive, 
  RefreshCw, 
  Download, 
  Upload, 
  Check, 
  AlertCircle, 
  Globe, 
  Smartphone, 
  Copy,
  ExternalLink,
  ShieldCheck,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';
import { 
  getStoredFirebaseConfig, 
  saveStoredFirebaseConfig, 
  testConnection, 
  initFirebase 
} from '../services/firebase';
import { 
  exportTransactionsToCSV, 
  exportBackupJSON 
} from '../services/storage';

export default function CloudSettingsModal({ 
  isOpen, 
  onClose, 
  transactions = [], 
  wallets = [], 
  budgets = [], 
  onSyncCloud, 
  isSyncing, 
  isCloudConnected,
  onImportData
}) {
  const [activeSubTab, setActiveSubTab] = useState('cloud'); // 'cloud', 'backup', 'deploy'
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [appId, setAppId] = useState('');
  const [rawJson, setRawJson] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  useEffect(() => {
    const existing = getStoredFirebaseConfig();
    if (existing) {
      setApiKey(existing.apiKey || '');
      setProjectId(existing.projectId || '');
      setAuthDomain(existing.authDomain || '');
      setStorageBucket(existing.storageBucket || '');
      setAppId(existing.appId || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle parse pasted json config
  const handleParseRawJson = () => {
    try {
      // Find JSON block or extract variables
      const clean = rawJson.replace(/const\s+firebaseConfig\s*=\s*/, '').replace(/;$/, '');
      const parsed = JSON.parse(clean);
      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.appId) setAppId(parsed.appId);
      setTestResult({ success: true, message: 'Berhasil membaca konfigurasi JSON!' });
    } catch (e) {
      setTestResult({ success: false, message: 'Gagal membaca format JSON. Pastikan format valid.' });
    }
  };

  const handleTestAndSave = async (e) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      setTestResult({ success: false, message: 'API Key dan Project ID wajib diisi.' });
      return;
    }

    const config = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      appId: appId.trim()
    };

    setIsTesting(true);
    setTestResult(null);

    const result = await testConnection(config);
    setIsTesting(false);

    if (result.success) {
      saveStoredFirebaseConfig(config);
      initFirebase(config);
      setTestResult({ success: true, message: '✅ Berhasil terhubung ke Firebase Firestore!' });
      // Trigger cloud sync
      onSyncCloud();
    } else {
      setTestResult({ 
        success: false, 
        message: `Koneksi gagal: ${result.error}. Pastikan Firestore Database diaktifkan dengan mode test (allow read, write: if true).` 
      });
    }
  };

  const handleDisconnect = () => {
    if (window.confirm('Putuskan koneksi Cloud? Aplikasi akan kembali menggunakan penyimpanan lokal di browser ini.')) {
      saveStoredFirebaseConfig(null);
      initFirebase(null);
      setApiKey('');
      setProjectId('');
      setAuthDomain('');
      setStorageBucket('');
      setAppId('');
      setTestResult({ success: true, message: 'Koneksi cloud telah diputuskan. Data sekarang tersimpan lokal.' });
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.transactions && Array.isArray(data.transactions)) {
          onImportData(data);
          alert(`Berhasil memulihkan ${data.transactions.length} transaksi!`);
          onClose();
        } else {
          alert('Format file backup tidak sesuai.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-dialog-large" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <Cloud className="modal-title-icon" size={22} />
            <div>
              <h2 className="modal-title">Pengaturan & Akses Cloud</h2>
              <p className="modal-desc">Kelola penyimpanan data agar bisa diakses di mana saja melalui HP & Laptop.</p>
            </div>
          </div>
          <button className="btn-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Subtabs */}
        <div className="modal-subtabs">
          <button 
            className={`subtab-btn ${activeSubTab === 'cloud' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('cloud')}
          >
            <Cloud size={16} />
            <span>Koneksi Cloud (Firebase)</span>
          </button>
          <button 
            className={`subtab-btn ${activeSubTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('backup')}
          >
            <Download size={16} />
            <span>Cadangan & Ekspor</span>
          </button>
          <button 
            className={`subtab-btn ${activeSubTab === 'deploy' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('deploy')}
          >
            <Globe size={16} />
            <span>Cara Buka di HP (Hosting Gratis)</span>
          </button>
        </div>

        {/* Tab 1: Cloud Connection */}
        {activeSubTab === 'cloud' && (
          <div className="subtab-content">
            <div className="cloud-intro-banner">
              <div className="cloud-intro-icon">
                {isCloudConnected ? <CloudCheck size={28} className="text-emerald" /> : <HardDrive size={28} className="text-amber" />}
              </div>
              <div className="cloud-intro-text">
                <span className="cloud-intro-status">
                  Status Saat Ini: <strong>{isCloudConnected ? '🟢 Tersambung ke Cloud Firestore' : '🟡 Mode Penyimpanan Lokal Browser'}</strong>
                </span>
                <p className="cloud-intro-sub">
                  Dengan menghubungkan ke Google Firebase Firestore (Gratis), Anda bisa membuka dan mencatat keuangan dari HP atau laptop mana pun secara bersamaan!
                </p>
              </div>
            </div>

            {testResult && (
              <div className={`alert-banner ${testResult.success ? 'success' : 'error'}`}>
                {testResult.success ? <Check size={16} /> : <AlertCircle size={16} />}
                <span>{testResult.message}</span>
              </div>
            )}

            <form onSubmit={handleTestAndSave} className="cloud-form">
              <div className="paste-json-box">
                <label className="form-label-small">
                  Tempel Objek Config Firebase (Opsi Cepat):
                </label>
                <div className="paste-json-row">
                  <textarea 
                    className="paste-textarea" 
                    placeholder='Contoh: { apiKey: "AIza...", projectId: "my-finance-123", ... }'
                    value={rawJson}
                    onChange={(e) => setRawJson(e.target.value)}
                    rows={2}
                  />
                  <button type="button" className="btn-secondary" onClick={handleParseRawJson}>
                    Muat Nilai
                  </button>
                </div>
              </div>

              <div className="form-row-two">
                <div className="form-group flex-1">
                  <label className="form-label">API Key</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="AIzaSy..." 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">Project ID</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="nama-project-anda" 
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row-two">
                <div className="form-group flex-1">
                  <label className="form-label">Auth Domain (Opsional)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="project-id.firebaseapp.com" 
                    value={authDomain}
                    onChange={(e) => setAuthDomain(e.target.value)}
                  />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">App ID (Opsional)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="1:123456789:web:abcdef..." 
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                  />
                </div>
              </div>

              <div className="cloud-actions-footer">
                {isCloudConnected && (
                  <button type="button" className="btn-danger-outline" onClick={handleDisconnect}>
                    Putuskan Cloud
                  </button>
                )}

                <div className="ml-auto flex-row-gap">
                  {isCloudConnected && (
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={onSyncCloud}
                      disabled={isSyncing}
                    >
                      <RefreshCw size={15} className={isSyncing ? 'spin' : ''} />
                      <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
                    </button>
                  )}
                  <button type="submit" className="btn-primary-submit" disabled={isTesting}>
                    {isTesting ? 'Menguji Koneksi...' : 'Simpan & Hubungkan Cloud'}
                  </button>
                </div>
              </div>
            </form>

            {/* Quick 3-step guide */}
            <div className="firebase-guide-box">
              <span className="guide-title">
                <ShieldCheck size={16} /> Cara Mendapatkan Firebase Config Gratis (Hanya 1 Menit):
              </span>
              <ol className="guide-steps">
                <li>Buka <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer">console.firebase.google.com</a> lalu buat Project baru gratis.</li>
                <li>Pilih menu <strong>Firestore Database</strong> &gt; Klik <strong>Create Database</strong> &gt; Pilih lokasi (e.g. Jakarta/Singapore) &gt; Pilih <strong>Test Mode</strong>.</li>
                <li>Di Project Overview, klik ikon <strong>Web (&lt;/&gt;)</strong> untuk menambahkan aplikasi web, lalu copy objek `firebaseConfig` dan tempelkan di kotak atas!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 2: Backup & Export */}
        {activeSubTab === 'backup' && (
          <div className="subtab-content">
            <p className="backup-desc">
              Semua data Anda 100% milik Anda. Anda dapat mengunduh salinan berkas kapan saja untuk dibuka di Microsoft Excel atau disimpan sebagai arsip cadangan.
            </p>

            <div className="backup-cards-grid">
              {/* CSV Export */}
              <div className="backup-action-card">
                <div className="backup-card-icon csv">
                  <FileSpreadsheet size={28} />
                </div>
                <div className="backup-card-info">
                  <h4 className="backup-title">Ekspor ke Excel / CSV</h4>
                  <p className="backup-sub">Format tabel rapi berisi tanggal, jenis, nominal, kategori, dompet, dan catatan.</p>
                  <button 
                    className="btn-backup-action"
                    onClick={() => exportTransactionsToCSV(transactions, wallets)}
                  >
                    <Download size={15} /> Unduh Berkas CSV (.csv)
                  </button>
                </div>
              </div>

              {/* JSON Backup */}
              <div className="backup-action-card">
                <div className="backup-card-icon json">
                  <FileCode size={28} />
                </div>
                <div className="backup-card-info">
                  <h4 className="backup-title">Cadangan Penuh (Backup JSON)</h4>
                  <p className="backup-sub">Menyimpan seluruh transaksi, saldo dompet, dan alokasi anggaran bulanan.</p>
                  <button 
                    className="btn-backup-action"
                    onClick={() => exportBackupJSON(transactions, wallets, budgets)}
                  >
                    <Download size={15} /> Unduh File Cadangan (.json)
                  </button>
                </div>
              </div>

              {/* Restore JSON */}
              <div className="backup-action-card">
                <div className="backup-card-icon restore">
                  <Upload size={28} />
                </div>
                <div className="backup-card-info">
                  <h4 className="backup-title">Pulihkan Data (Restore)</h4>
                  <p className="backup-sub">Unggah file cadangan JSON dari perangkat lain untuk memulihkan data catatan Anda.</p>
                  <label className="btn-backup-action restore">
                    <Upload size={15} /> Pilih File Cadangan
                    <input type="file" accept=".json" onChange={handleFileImport} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Deploy & Open Anywhere */}
        {activeSubTab === 'deploy' && (
          <div className="subtab-content">
            <div className="deploy-hero-banner">
              <Smartphone size={32} className="deploy-icon" />
              <div>
                <h3 className="deploy-hero-title">Akses Dari HP Kapan Saja & Di Mana Saja</h3>
                <p className="deploy-hero-desc">
                  Untuk membuka aplikasi ini di browser HP (Chrome/Safari) dan menginstallnya seperti aplikasi Android/iPhone, Anda dapat mempublikasikan (deploy) web ini secara <strong>100% Gratis</strong>!
                </p>
              </div>
            </div>

            <div className="deploy-options-list">
              {/* Option 1: Vercel */}
              <div className="deploy-option-card">
                <div className="deploy-option-header">
                  <span className="deploy-badge">Paling Populer & Cepat</span>
                  <h4 className="deploy-name">Opsi 1: Deploy ke Vercel (Gratis)</h4>
                </div>
                <p className="deploy-text">
                  Cukup upload folder project ini ke GitHub, lalu hubungkan ke <a href="https://vercel.com" target="_blank" rel="noreferrer">vercel.com</a>. Anda akan langsung mendapatkan URL publik seperti <code>https://catat-keuangan-anda.vercel.app</code>.
                </p>
                <div className="code-copy-row">
                  <code>npm run build</code>
                  <button onClick={() => copyToClipboard('npm run build', 'vercel-build')}>
                    {copiedText === 'vercel-build' ? <Check size={14} /> : <Copy size={14} />} Salin Perintah
                  </button>
                </div>
              </div>

              {/* Option 2: Firebase Hosting */}
              <div className="deploy-option-card">
                <div className="deploy-option-header">
                  <span className="deploy-badge">Satu Paket dengan Database</span>
                  <h4 className="deploy-name">Opsi 2: Firebase Hosting</h4>
                </div>
                <p className="deploy-text">
                  Jalankan perintah berikut di terminal untuk langsung mempublikasikan ke Firebase Hosting:
                </p>
                <div className="code-copy-row">
                  <code>npx firebase-tools deploy --only hosting</code>
                  <button onClick={() => copyToClipboard('npx firebase-tools deploy --only hosting', 'fb-deploy')}>
                    {copiedText === 'fb-deploy' ? <Check size={14} /> : <Copy size={14} />} Salin Perintah
                  </button>
                </div>
              </div>

              {/* Option 3: Local Network / Wi-Fi */}
              <div className="deploy-option-card">
                <div className="deploy-option-header">
                  <span className="deploy-badge">Akses Langsung via Wi-Fi Rumah/Kantor</span>
                  <h4 className="deploy-name">Opsi 3: Buka di HP via IP Lokal</h4>
                </div>
                <p className="deploy-text">
                  Saat menjalankan <code>npm run dev -- --host</code> di komputer, Anda bisa langsung membuka alamat IP yang muncul (misal: <code>http://192.168.1.xxx:5173</code>) dari browser HP yang terhubung ke Wi-Fi yang sama!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
