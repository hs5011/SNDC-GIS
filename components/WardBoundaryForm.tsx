
import React, { useState } from 'react';
import { WardBoundary } from '../types';
import { X, Save, MapPin, Trash2, Undo, Globe, FileSpreadsheet } from 'lucide-react';
import MapView from './MapView';
import ImportCoordinatesModal from './ImportCoordinatesModal';

interface WardBoundaryFormProps {
  initialData: WardBoundary;
  onSubmit: (data: WardBoundary) => void;
  onClose: () => void;
}

const WardBoundaryForm: React.FC<WardBoundaryFormProps> = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<WardBoundary>(initialData);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleSave = () => {
    if (!formData.name?.trim()) {
      alert("CẢNH BÁO: Vui lòng nhập Tên đơn vị hành chính!");
      return;
    }
    if (!formData.geometry || formData.geometry.length < 3) {
      alert("CẢNH BÁO: Vui lòng vẽ ranh giới trên bản đồ (tối thiểu 3 điểm)!");
      return;
    }
    onSubmit(formData);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    const newPoints = [...(formData.geometry || []), [lat, lng] as [number, number]];
    if (newPoints.length === 1) {
      setFormData(prev => ({ ...prev, X: lat, Y: lng, geometry: newPoints }));
    } else {
      setFormData(prev => ({ ...prev, geometry: newPoints }));
    }
  };

  const handleImportPoints = (points: Array<[number, number]>) => {
    setFormData(prev => ({
      ...prev,
      geometry: points,
      X: points[0][0],
      Y: points[0][1]
    }));
  };

  const undoPoint = () => {
    setFormData(prev => ({ ...prev, geometry: (prev.geometry || []).slice(0, -1) }));
  };

  const clearGeometry = () => {
    if (window.confirm("Xóa toàn bộ ranh giới hiện tại?")) {
      setFormData(prev => ({ ...prev, geometry: [] }));
    }
  };

  return (
    <>
      <div className="flex flex-col h-full gap-6">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Globe className="text-blue-600" /> Quản lý ranh giới Phường
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all"
            >
              <FileSpreadsheet size={18} /> Nhập Excel
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-lg transition-all transform active:scale-95"
            >
              <Save size={18} /> Lưu ranh giới
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
          <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Tên đơn vị hành chính <span className="text-red-500">*</span></label>
                <input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold ${!formData.name?.trim() ? 'border-red-200 bg-red-50/30' : ''}`}
                />
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-[10px] text-blue-600 font-black uppercase mb-1">Hướng dẫn vẽ</p>
                <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                  Click trực tiếp trên bản đồ để xác định các điểm mốc ranh giới của phường. Cần ít nhất 3 điểm để tạo vùng.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2 border-t">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Số điểm mốc:</span>
                  <span className="text-blue-600 font-black">{formData.geometry?.length || 0}</span>
                </div>
                <button 
                  onClick={undoPoint}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                >
                  <Undo size={14} /> Hoàn tác điểm cuối
                </button>
                <button 
                  onClick={clearGeometry}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all"
                >
                  <Trash2 size={14} /> Xóa ranh giới
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
            <MapView 
              center={[formData.X, formData.Y]} 
              isSelectMode
              onSelectLocation={handleLocationSelect}
              polygons={formData.geometry && formData.geometry.length > 2 ? [
                { id: 'ward-drawing', points: formData.geometry, label: formData.name, color: '#3b82f6' }
              ] : []}
              markers={(formData.geometry || []).map((p, idx) => ({ id: `w-${idx}`, lat: p[0], lng: p[1], label: `${idx + 1}` }))}
            />
          </div>
        </div>
      </div>
      <ImportCoordinatesModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImport={handleImportPoints} 
      />
    </>
  );
};

export default WardBoundaryForm;
