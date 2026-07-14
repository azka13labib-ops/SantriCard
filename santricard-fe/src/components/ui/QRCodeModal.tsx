import { X, Download, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";

interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
  kartu: {
    qr_code_hash: string;
  } | null;
}

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  siswaData: Siswa | null;
}

export default function QRCodeModal({ isOpen, onClose, siswaData }: QRCodeModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !siswaData || !siswaData.kartu) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setIsDownloading(true);
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, { 
        quality: 1.0, 
        pixelRatio: 4, // High resolution for printing
        backgroundColor: '#ffffff'
      });
      
      const downloadLink = document.createElement("a");
      downloadLink.download = `Kartu-Santri-${siswaData.nama.replace(/\s+/g, '-')}-${siswaData.nis}.png`;
      downloadLink.href = dataUrl;
      downloadLink.click();
    } catch (error) {
      console.error("Oops, something went wrong!", error);
      alert("Gagal mengunduh kartu. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header Title */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Preview Kartu</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* The Card Element to be captured */}
        <div className="p-6 bg-gray-50 flex justify-center overflow-hidden">
          {/* Card Dimensions: typical ID card ratio ~ 2:3 */}
          <div 
            ref={cardRef}
            className="w-[280px] h-[430px] bg-white rounded-[20px] shadow-sm border border-gray-200 overflow-hidden relative flex flex-col"
          >
            {/* Background Accent */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-emerald-600 rounded-b-[40%] shadow-inner"></div>
            
            {/* Header / Logo */}
            <div className="relative z-10 pt-6 px-4 flex flex-col items-center">
              <div className="bg-white p-2 rounded-full shadow-md mb-2">
                <div className="bg-emerald-100 rounded-full w-12 h-12 flex items-center justify-center">
                  <QrCode className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <h3 className="font-bold text-white tracking-wide text-lg">SantriCard</h3>
              <p className="text-emerald-100 text-[10px] uppercase font-semibold">Kartu Pelajar & E-Money</p>
            </div>

            {/* QR Code Section */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 mt-6">
              <div className="bg-white p-3 rounded-2xl shadow-lg border border-gray-100">
                <QRCodeSVG 
                  value={siswaData.kartu.qr_code_hash} 
                  size={150}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>

            {/* Details Section */}
            <div className="relative z-10 pb-6 px-6 text-center">
              <h4 className="text-xl font-bold text-gray-900 leading-tight mb-1">{siswaData.nama}</h4>
              <div className="flex justify-center items-center gap-2 mb-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">
                  NIS: {siswaData.nis}
                </span>
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded">
                  {siswaData.kelas}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 leading-tight">
                Gunakan kartu ini untuk bertransaksi di kantin sekolah. Simpan dengan baik.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 bg-white border-t border-gray-100">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <span className="animate-pulse">Menyiapkan Kartu...</span>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Download Kartu Pelajar (ID Card)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
