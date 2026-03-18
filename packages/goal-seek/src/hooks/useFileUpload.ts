import { useState, useCallback, type DragEvent } from 'react';

const ACCEPTED_EXTENSIONS = ['csv', 'tsv', 'txt', 'xlsx', 'xls'];

export function useFileUpload(onFile: (file: File) => void) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && isAcceptedFile(file)) {
        onFile(file);
      }
    },
    [onFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && isAcceptedFile(file)) {
        onFile(file);
      }
    },
    [onFile]
  );

  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
  };
}

function isAcceptedFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return ACCEPTED_EXTENSIONS.includes(ext);
}
