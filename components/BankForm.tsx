
import React, { useState } from 'react';
import { Bank } from '../types';
import { X, Save, Landmark } from 'lucide-react';

interface BankFormProps {
  initialData?: Bank;
  onSubmit: (data: Partial<Bank>) => void;
  onClose: () => void;
}

const BankForm: React.FC<BankFormProps> = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<Partial<Bank>>(initialData || { 
    name: '', 
    shortName: '', 
    code: '' 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.shortName) {
      alert('Vui lòng nhập đầy đủ tên ngân hàng');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b bg-slate-50">
          <div className="flex items-center gap-2 text-blue-600">
            <Landmark size={20} />
            <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Sửa ngân hàng' : 'Thêm ngân hàng mới'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Mã Ngân hàng (Swift Code/CITAD)</label>
            <input 
              value={formData.code} 
              onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
              className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="VD: VCB"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Tên viết tắt <span className="text-red-500">*</span></label>
            <input 
              value={formData.shortName} 
              onChange={e => setFormData({...formData, shortName: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              placeholder="VD: Vietcombank"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Tên đầy đủ Ngân hàng <span className="text-red-500">*</span></label>
            <input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: Ngân hàng TMCP Ngoại thương Việt Nam"
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold">Hủy</button>
            <button type="submit" className="px-8 py-2 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-all">
              <Save size={18} /> Lưu danh mục
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankForm;
