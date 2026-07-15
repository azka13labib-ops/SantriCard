"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CreditCard, QrCode, Zap, CheckCircle2, XCircle, AlertCircle, Loader2, WifiOff, Clock } from "lucide-react";
import axios from "axios";
import api from "@/lib/axios";

// ── Tipe untuk antrian transaksi offline ──
interface OfflineTransaction {
  id: string; // UUID sebagai idempotency_key
  kode_kartu: string;
  nominal: number;
  timestamp: number;
}

const OFFLINE_QUEUE_KEY = "santricard_offline_queue";

function loadOfflineQueue(): OfflineTransaction[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOfflineQueue(queue: OfflineTransaction[]) {
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export default function PedagangScannerPage() {
  const [nominal, setNominal] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error' | 'info' | 'offline', title: string, text: string} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<OfflineTransaction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // ── Monitor status koneksi internet ──
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ── Muat antrian offline dari localStorage saat mount ──
  useEffect(() => {
    setOfflineQueue(loadOfflineQueue());
  }, []);

  // ── Auto-sync saat koneksi kembali ──
  const syncOfflineQueue = useCallback(async () => {
    const queue = loadOfflineQueue();
    if (queue.length === 0 || isSyncing) return;

    setIsSyncing(true);
    let remaining = [...queue];

    for (const trx of queue) {
      try {
        await api.post("/transaksi", {
          kode_kartu: trx.kode_kartu,
          nominal: trx.nominal,
          idempotency_key: trx.id,
        });
        // Hapus dari antrian jika berhasil
        remaining = remaining.filter(r => r.id !== trx.id);
        saveOfflineQueue(remaining);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status && err.response.status < 500) {
          // Error validasi — hapus dari antrian agar tidak retry terus
          remaining = remaining.filter(r => r.id !== trx.id);
          saveOfflineQueue(remaining);
        }
        // Error 5xx atau koneksi masih putus — biarkan di antrian
      }
    }

    setOfflineQueue(loadOfflineQueue());
    setIsSyncing(false);
  }, [isSyncing]);

  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      syncOfflineQueue();
    }
  }, [isOnline, offlineQueue.length, syncOfflineQueue]);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const startScanner = async () => {
    const numNominal = Number(nominal.replace(/\D/g, ""));
    if (numNominal < 500 || numNominal > 20000) {
      setStatusMsg({ type: 'error', title: 'Nominal Tidak Valid', text: 'Nominal transaksi harus antara Rp 500 hingga Rp 20.000.'});
      return;
    }

    setIsScanning(true);
    setStatusMsg(null);
    
    setTimeout(async () => {
      try {
        scannerRef.current = new Html5Qrcode("reader");
        await scannerRef.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          onScanSuccess,
          onScanFailure
        );
      } catch (err) {
        console.error(err);
        setIsScanning(false);
        setStatusMsg({ type: 'error', title: 'Kamera Gagal', text: 'Kamera tidak dapat diakses atau tidak ada izin.'});
      }
    }, 100);
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const onScanSuccess = async (decodedText: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    await stopScanner();

    const numNominal = Number(nominal.replace(/\D/g, ""));

    // ── Offline mode: simpan ke antrian lokal ──
    if (!navigator.onLine) {
      const offlineTrx: OfflineTransaction = {
        id: generateUUID(),
        kode_kartu: decodedText,
        nominal: numNominal,
        timestamp: Date.now(),
      };
      
      const currentQueue = loadOfflineQueue();
      const newQueue = [...currentQueue, offlineTrx];
      saveOfflineQueue(newQueue);
      setOfflineQueue(newQueue);
      
      setStatusMsg({
        type: 'offline',
        title: 'Disimpan Offline',
        text: `Transaksi ${formatRupiah(numNominal)} disimpan dan akan dikirim otomatis saat koneksi tersedia. (${newQueue.length} transaksi dalam antrian)`
      });
      setNominal("");
      setIsProcessing(false);
      return;
    }
    
    // ── Online mode: proses langsung dengan idempotency key ──
    const idempotencyKey = generateUUID();
    
    try {
      setStatusMsg({ type: 'info', title: 'Memproses...', text: 'Tunggu sebentar, sedang memproses transaksi.'});
      
      const res = await api.post("/transaksi", {
        kode_kartu: decodedText,
        nominal: numNominal,
        idempotency_key: idempotencyKey,
      });

      setStatusMsg({ 
        type: 'success', 
        title: 'Berhasil!', 
        text: `Transaksi sejumlah ${formatRupiah(numNominal)} untuk ${res.data.siswa} berhasil.`
      });
      setNominal("");
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setStatusMsg({ 
          type: 'error', 
          title: 'Transaksi Gagal', 
          text: err.response?.data?.alasan || "Terjadi kesalahan pada sistem."
        });
      } else {
        setStatusMsg({ 
          type: 'error', 
          title: 'Transaksi Gagal', 
          text: "Terjadi kesalahan pada sistem."
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const onScanFailure = () => {
    // Just ignore, it happens every frame no QR is found
  };

  return (
    <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200 max-w-2xl mx-auto">
      
      {/* Status Koneksi */}
      {!isOnline && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm font-medium text-amber-800">
          <WifiOff className="w-4 h-4 shrink-0" />
          Mode Offline — Transaksi akan disimpan dan dikirim saat koneksi tersedia.
        </div>
      )}

      {/* Antrian Offline */}
      {offlineQueue.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span><b>{offlineQueue.length}</b> transaksi menunggu sinkronisasi</span>
          </div>
          {isOnline && (
            <button
              onClick={syncOfflineQueue}
              disabled={isSyncing}
              className="text-xs font-bold text-blue-700 hover:underline disabled:opacity-50"
            >
              {isSyncing ? "Menyinkronkan..." : "Sinkronkan Sekarang"}
            </button>
          )}
        </div>
      )}

      {/* Nominal Input Card */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Zap className="w-24 h-24 text-emerald-600" />
        </div>
        
        <h2 className="text-sm font-semibold text-emerald-800 mb-2">Total Belanja (Rp)</h2>
        <input
          type="text"
          placeholder="0"
          disabled={isScanning || isProcessing}
          className="w-full text-4xl font-bold text-gray-900 bg-transparent border-transparent border-b-emerald-200 focus:border-transparent focus:border-b-emerald-600 focus:ring-0 px-0 py-2 disabled:opacity-50 transition-colors shadow-none"
          value={nominal}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            setNominal(new Intl.NumberFormat("id-ID").format(Number(val)));
          }}
        />
        <p className="text-xs text-emerald-600/70 mt-2 font-medium">Masukkan total harga belanja santri.</p>
      </div>

      {/* Scanner View */}
      {isScanning && (
        <div className="bg-black rounded-2xl overflow-hidden relative shadow-lg ring-4 ring-emerald-500/20">
          <div id="reader" className="w-full"></div>
          <button 
            onClick={stopScanner}
            className="absolute top-4 right-4 bg-red-500/90 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow flex items-center gap-1 backdrop-blur-sm"
          >
            <XCircle className="w-4 h-4" /> Batal
          </button>
          
          <div className="absolute bottom-4 left-0 right-0 text-center text-white/80 text-xs px-4 drop-shadow-md">
            Arahkan kamera ke QR Code atau tap Kartu RFID.
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isScanning && !isProcessing && (
        <button
          onClick={startScanner}
          className="w-full bg-emerald-600 active:bg-emerald-700 text-white py-4 rounded-2xl font-bold text-lg shadow-[0_8px_0_0_rgb(4,120,87)] active:shadow-[0_0px_0_0_rgb(4,120,87)] active:translate-y-2 transition-all flex items-center justify-center gap-2"
        >
          <QrCode className="w-6 h-6" /> Scan Kartu
        </button>
      )}

      {isProcessing && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="font-semibold text-gray-600 animate-pulse">Memproses Pembayaran...</p>
        </div>
      )}

      {/* Status Messages */}
      {statusMsg && !isProcessing && (
        <div className={`p-4 rounded-2xl flex items-start gap-3 border ${
          statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
          statusMsg.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 
          statusMsg.type === 'offline' ? 'bg-amber-50 border-amber-200 text-amber-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {statusMsg.type === 'success' && <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-500 mt-0.5" />}
          {statusMsg.type === 'error' && <XCircle className="w-6 h-6 shrink-0 text-red-500 mt-0.5" />}
          {statusMsg.type === 'info' && <AlertCircle className="w-6 h-6 shrink-0 text-blue-500 mt-0.5" />}
          {statusMsg.type === 'offline' && <WifiOff className="w-6 h-6 shrink-0 text-amber-500 mt-0.5" />}
          
          <div>
            <h3 className="font-bold text-base">{statusMsg.title}</h3>
            <p className="text-sm mt-0.5 opacity-90 leading-snug">{statusMsg.text}</p>
          </div>
        </div>
      )}

      {/* Quick Helper */}
      {!isScanning && !statusMsg && !isProcessing && (
        <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-sm text-gray-600">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
          <p>
            Pastikan Anda memasukkan nominal terlebih dahulu sebelum melakukan scan kartu.
          </p>
        </div>
      )}
    </div>
  );
}
