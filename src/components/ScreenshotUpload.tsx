import React, { useState } from "react";
import { Upload, X, Check } from "lucide-react";

interface ScreenshotUploadProps {
  onUpload: (base64: string) => void;
  currentValue?: string;
}

export const ScreenshotUpload: React.FC<ScreenshotUploadProps> = ({ onUpload, currentValue }) => {
  const [preview, setPreview] = useState<string | null>(currentValue || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) { // Approx 800KB limit for safe base64 in Firestore
      setError("Image must be less than 800KB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onUpload(base64);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Payment Screenshot</label>
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors relative">
        {preview ? (
          <div className="relative w-full">
            <img src={preview} alt="Payment Screenshot" className="max-h-48 w-full object-contain rounded" />
            <button
              onClick={() => { setPreview(null); onUpload(""); }}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
            >
              <X size={16} />
            </button>
            <div className="mt-2 text-green-600 flex items-center justify-center gap-1 text-sm font-medium">
              <Check size={16} /> Ready to upload
            </div>
          </div>
        ) : (
          <>
            <Upload className="text-gray-400 mb-2" size={32} />
            <p className="text-sm text-gray-500 text-center">Click or drag to upload payment proof</p>
            <p className="text-xs text-gray-400 mt-1">Accepts images up to 800KB</p>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
