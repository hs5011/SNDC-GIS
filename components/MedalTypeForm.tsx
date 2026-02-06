
import React, { useState } from 'react';
import { MedalType } from '../types';
import { X, Save } from 'lucide-react';

interface MedalTypeFormProps {
  initialData?: MedalType;
  onSubmit: (data: Partial<MedalType>) => void;
  onClose: () => void;
}

const MedalTypeForm: React.FC<MedalTypeFormProps> = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<Partial<MedalType>>(initialData || { name: '', code: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b bg-amber-50/50">
          <h2 className="text-xl font-bold text-amber-900">{initialData ? 'Sửa loại huân chương' : 'Thêm loại khen thưởng mới'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-amber-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Mã danh mục</label>
            <input 
              value={formData.code} 
              onChange={e => setFormData({...formData, code: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
              placeholder="VD: HCKC1"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tên loại khen thưởng</label>
            <input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
              placeholder="VD: Huân chương kháng chiến hạng nhất"
              required
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800">Hủy</button>
            <button type="submit" className="px-6 py-2 bg-amber-600 text-white font-bold rounded-lg flex items-center gap-2 shadow-lg hover:bg-amber-700 transition-all"><Save size={18} /> Lưu danh mục</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedalTypeForm;
