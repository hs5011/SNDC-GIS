
import React, { useState } from 'react';
import { SocialProtectionType } from '../types';
import { X, Save } from 'lucide-react';

interface SocialProtectionTypeFormProps {
  initialData?: SocialProtectionType;
  onSubmit: (data: Partial<SocialProtectionType>) => void;
  onClose: () => void;
}

const SocialProtectionTypeForm: React.FC<SocialProtectionTypeFormProps> = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<Partial<SocialProtectionType>>(initialData || { name: '', code: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Sửa loại diện bảo trợ' : 'Thêm loại diện bảo trợ mới'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Mã danh mục</label>
            <input 
              value={formData.code} 
              onChange={e => setFormData({...formData, code: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="VD: NKT_DBN_TE"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tên loại diện bảo trợ</label>
            <input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="VD: NKT đặc biệt nặng là trẻ em"
              required
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium">Hủy</button>
            <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg flex items-center gap-2 shadow-lg hover:bg-emerald-700"><Save size={18} /> Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SocialProtectionTypeForm;
