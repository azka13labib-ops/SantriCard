import { Loader2, AlertTriangle, HelpCircle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  isLoading = false,
  type = "danger",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          {type === "danger" && (
            <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600">
              <AlertTriangle className="h-8 w-8" />
            </div>
          )}
          {type === "warning" && (
            <div className="mb-4 rounded-full bg-amber-100 p-3 text-amber-600">
              <AlertTriangle className="h-8 w-8" />
            </div>
          )}
          {type === "info" && (
            <div className="mb-4 rounded-full bg-blue-100 p-3 text-blue-600">
              <HelpCircle className="h-8 w-8" />
            </div>
          )}

          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-sm text-gray-500">{message}</p>
        </div>

        <div className="mt-6 flex gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 flex justify-center items-center rounded-xl px-4 py-2.5 text-sm font-medium text-white focus:outline-none disabled:opacity-70 ${
              type === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : type === "warning"
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
