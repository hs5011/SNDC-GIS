
import React, { useState } from 'react';
import { Street } from '../types';
import { X, Save, AlertCircle } from 'lucide-react';

interface StreetFormProps {
  initialData?: Street;
  onSubmit: (data: Partial<Street>) => void;
  onClose: () => void;
}

const StreetForm: React.FC<StreetFormProps> = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<Partial<Street>>(initialData || { name: '', code: '' });

  const handleSave = () => {
    const errors: string[] = [];
    if (!formData.code?.trim()) errors.push("Mã đường");
    if (!formData.name?.trim()) errors.push("Tên đường");

    if (errors.length > 0) {
      alert("CẢNH BÁO: Vui lòng nhập đầy đủ:\n- " + errors.join("\n- "));
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Sửa thông tin đường' : 'Thêm đường mới'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Mã đường <span className="text-red-500">*</span></label>
            <input 
              value={formData.code} 
              onChange={e => setFormData({...formData, code: e.target.value})} 
              className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${!formData.code?.trim() ? 'border-red-200 bg-red-50/30' : ''}`}
              placeholder="VD: D001"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Tên đường <span className="text-red-500">*</span></label>
            <input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${!formData.name?.trim() ? 'border-red-200 bg-red-50/30' : ''}`}
              placeholder="VD: Lê Lợi"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:text-slate-800">Hủy</button>
            <button 
              onClick={handleSave} 
              className="px-6 py-2 bg-blue-600 text-white font-black rounded-xl flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-all"
            >
              <Save size={18} /> Lưu dữ liệu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreetForm;
