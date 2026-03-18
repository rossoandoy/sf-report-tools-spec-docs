import { useRef } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function FileDropZone({ onFile, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isDragging, handleDragOver, handleDragLeave, handleDrop, handleFileSelect } =
    useFileUpload(onFile);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
        disabled
          ? 'cursor-not-allowed border-gray-200 bg-gray-50'
          : isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'cursor-pointer border-gray-300 bg-white hover:border-blue-300 hover:bg-gray-50'
      }`}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <div className="mb-3 text-4xl text-gray-400">
        {isDragging ? '\u{1F4E5}' : '\u{1F4C4}'}
      </div>
      <p className="mb-1 text-lg font-medium text-gray-700">
        {isDragging ? 'ここにドロップ' : 'ファイルをドラッグ&ドロップ'}
      </p>
      <p className="text-sm text-gray-500">
        CSV, TSV, XLSX に対応しています
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.tsv,.txt,.xlsx,.xls"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled}
      />
    </div>
  );
}
