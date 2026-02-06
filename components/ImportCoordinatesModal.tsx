
import React, { useState } from 'react';
import { X, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface ImportCoordinatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (points: Array<[number, number]>) => void;
}

const ImportCoordinatesModal: React.FC<ImportCoordinatesModalProps> = ({ isOpen, onClose, onImport }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleProcess = () => {
    setError('');
    const lines = text.split('\n').filter(l => l.trim() !== '');
    const points: Array<[number, number]> = [];

    try {
      lines.forEach((line, index) => {
        // Hỗ trợ dấu phẩy, tab hoặc khoảng trắng giữa 2 tọa độ
        const parts = line.split(/[\s,\t]+/).filter(p => p.trim() !== '');
        if (parts.length >= 2) {
          const lat = parseFloat(parts[0]);
          const lng = parseFloat(parts[1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            points.push([lat, lng]);
          }
        }
      });

      if (points.length < 3) {
        setError('Cần ít nhất 3 tọa độ hợp lệ để tạo vùng.');
        return;
      }

      onImport(points);
      onClose();
      setText('');
    } catch (e) {
      setError('Định dạng dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><FileSpreadsheet size={20} /></div>
            <h3 className="font-bold text-slate-800">Nhập tọa độ từ Excel</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 items-start">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-700 leading-relaxed">
              <p className="font-bold mb-1 uppercase">Hướng dẫn:</p>
              1. Copy 2 cột tọa độ (X, Y) trong Excel.<br/>
              2. Dán vào ô bên dưới.<br/>
              3. Mỗi cặp tọa độ nằm trên một dòng.
            </div>
          </div>

          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-48 p-4 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-slate-50"
            placeholder="10.7712, 106.6983&#10;10.7725, 106.6991&#10;10.7708, 106.7005..."
          />

          {error && <p className="text-xs font-bold text-red-600 flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}
        </div>

        <div className="p-5 border-t bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-slate-600 font-bold text-sm">Hủy bỏ</button>
          <button 
            onClick={handleProcess}
            className="px-8 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-lg text-sm transition-all"
          >
            Nhập tọa độ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportCoordinatesModal;
