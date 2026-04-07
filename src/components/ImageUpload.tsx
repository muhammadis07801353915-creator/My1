import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (base64: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = "Upload Image" }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Optional: Check file size (e.g., limit to 2MB to avoid huge base64 strings)
    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large. Please upload an image smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-neutral-400">{label}</label>
      
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 group aspect-video flex items-center justify-center">
          <img src={value} alt="Uploaded" className="max-w-full max-h-full object-contain" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <button 
              onClick={() => onChange('')}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition"
              title="Remove image"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition aspect-video ${
            isDragging ? 'border-red-500 bg-red-500/10' : 'border-neutral-700 hover:border-neutral-500 bg-neutral-900/50 hover:bg-neutral-900'
          }`}
        >
          <Upload size={24} className="text-neutral-400 mb-2" />
          <p className="text-sm font-medium text-neutral-300">Click or drag image here</p>
          <p className="text-xs text-neutral-500 mt-1">Max size: 2MB</p>
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => e.target.files && e.target.files.length > 0 && handleFile(e.target.files[0])} 
        accept="image/*" 
        className="hidden" 
      />
      
      {!value && (
        <div className="mt-2">
          <p className="text-xs text-neutral-500 mb-1 text-center">Or paste image URL:</p>
          <input 
            type="text" 
            placeholder="https://..." 
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-red-500 transition" 
          />
        </div>
      )}
    </div>
  );
}
