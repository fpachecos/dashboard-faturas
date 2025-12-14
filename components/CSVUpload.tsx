import { useState } from 'react';

interface CSVUploadProps {
  onUpload: (csvContent: string, filename: string) => Promise<void>;
}

export default function CSVUpload({ onUpload }: CSVUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setMessage(null);
    
    try {
      const text = await file.text();
      await onUpload(text, file.name);
      setMessage({ type: 'success', text: 'Fatura importada com sucesso!' });
      e.target.value = ''; // Reset input
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao importar fatura. Tente novamente.' });
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow mb-4 sm:mb-6">
      <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Importar Nova Fatura</h2>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <label className="flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition text-sm sm:text-base">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
          {isUploading ? 'Importando...' : 'Selecionar CSV'}
        </label>
        {message && (
          <span className={`px-3 sm:px-4 py-2 rounded text-sm sm:text-base text-center ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}

