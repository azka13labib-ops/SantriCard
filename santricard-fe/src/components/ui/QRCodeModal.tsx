import { X, Download, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";

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
  const svgRef = useRef<SVGSVGElement>(null);

  if (!isOpen || !siswaData || !siswaData.kartu) return null;

  const handleDownload = () => {
    if (!svgRef.current) return;
    
    // We convert the SVG element to a Blob, then to an Image, then draw to Canvas to get PNG
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      // Set canvas dimensions with high resolution (scale 4x for sharp download)
      const scale = 4;
      canvas.width = 256 * scale;
      canvas.height = 256 * scale;
      
      if (ctx) {
        // Draw white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Export to PNG
        const pngFile = canvas.toDataURL("image/png");
        
        // Trigger download
        const downloadLink = document.createElement("a");
        downloadLink.download = `Kartu-Santri-${siswaData.nama.replace(/\s+/g, '-')}-${siswaData.nis}.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-emerald-600 p-4 text-center relative">
          <button 
            onClick={onClose} 
            className="absolute right-4 top-4 text-emerald-100 hover:text-white transition-colors rounded-full bg-emerald-700/50 p-1 hover:bg-emerald-700"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="mx-auto bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <QrCode className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">Kartu Santri Digital</h2>
          <p className="text-emerald-100 text-xs mt-1 opacity-90">SantriCard - Tunjukkan QR Code ini di Kantin</p>
        </div>

        <div className="p-8 flex flex-col items-center bg-gray-50/50">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <QRCodeSVG 
              value={siswaData.kartu.qr_code_hash} 
              size={220}
              level="H"
              includeMargin={true}
              ref={svgRef}
            />
          </div>
          
          <div className="text-center w-full">
            <h3 className="text-lg font-bold text-gray-900 truncate px-2">{siswaData.nama}</h3>
            <p className="text-sm font-medium text-emerald-600 mt-1">NIS: {siswaData.nis}</p>
            <p className="text-xs text-gray-500 mt-1">Kelas {siswaData.kelas}</p>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all active:scale-[0.98]"
          >
            <Download className="h-5 w-5" />
            Download Gambar QR
          </button>
        </div>
      </div>
    </div>
  );
}
