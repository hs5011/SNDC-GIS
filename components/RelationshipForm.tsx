
import React, { useState } from 'react';
import { RelationshipType } from '../types';
import { X, Save } from 'lucide-react';

interface RelationshipFormProps {
  initialData?: RelationshipType;
  onSubmit: (data: Partial<RelationshipType>) => void;
  onClose: () => void;
}

const RelationshipForm: React.FC<RelationshipFormProps> = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<Partial<RelationshipType>>(initialData || { name: '', code: '' });

  const handleSave = () => {
    const errors: string[] = [];
    if (!formData.code?.trim()) errors.push("Mã quan hệ");
    if (!formData.name?.trim()) errors.push("Tên mối quan hệ");

    if (errors.length > 0) {
      alert("CẢNH BÁO: Vui lòng cung cấp đầy đủ thông tin:\n- " + errors.join("\n- "));
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Sửa loại quan hệ' : 'Thêm loại quan hệ mới'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Mã quan hệ <span className="text-red-500">*</span></label>
            <input 
              value={formData.code} 
              onChange={e => setFormData({...formData, code: e.target.value})} 
              className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${!formData.code?.trim() ? 'border-red-200 bg-red-50/30' : ''}`}
              placeholder="VD: CON"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Tên mối quan hệ <span className="text-red-500">*</span></label>
            <input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${!formData.name?.trim() ? 'border-red-200 bg-red-50/30' : ''}`}
              placeholder="VD: Con đẻ"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold">Hủy</button>
            <button 
              onClick={handleSave} 
              className="px-6 py-2 bg-blue-600 text-white font-black rounded-xl flex items-center gap-2 shadow-lg transform active:scale-95 transition-all"
            >
              <Save size={18} /> Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelationshipForm;
