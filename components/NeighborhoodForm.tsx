
import React, { useState } from 'react';
import { Neighborhood, NeighborhoodTab } from '../types';
import { X, Save, MapPin, Info, Trash2, Undo, FileSpreadsheet } from 'lucide-react';
import MapView from './MapView';
import ImportCoordinatesModal from './ImportCoordinatesModal';

interface NeighborhoodFormProps {
  initialData?: Neighborhood;
  onSubmit: (data: Partial<Neighborhood>) => void;
  onClose: () => void;
}

const NeighborhoodForm: React.FC<NeighborhoodFormProps> = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<Partial<Neighborhood>>(initialData || { 
    nameNew: '', 
    nameOld: '',
    geometry: [],
    X: 10.7719,
    Y: 106.6983
  });
  const [activeTab, setActiveTab] = useState<NeighborhoodTab>('Info');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleSave = () => {
    const errors: string[] = [];
    if (!formData.nameNew?.trim()) errors.push("Tên khu phố mới");
    if (!formData.nameOld?.trim()) errors.push("Tên khu phố cũ (hoặc Ghi chú cũ)");

    if (errors.length > 0) {
      alert("CẢNH BÁO: Vui lòng nhập đầy đủ thông tin:\n- " + errors.join("\n- "));
      setActiveTab('Info');
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
    setFormData(prev => ({ ...prev, geometry: [] }));
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
          <div className="flex items-center justify-between p-6 border-b bg-slate-50">
            <h2 className="text-xl font-bold text-slate-900">
              {initialData ? 'Sửa ranh giới khu phố' : 'Thêm khu phố mới'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
          </div>

          <div className="flex bg-slate-50 px-6 gap-6 border-b">
            <button 
              onClick={() => setActiveTab('Info')}
              className={`flex items-center gap-2 py-4 border-b-2 font-bold text-sm transition-all ${activeTab === 'Info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
            >
              <Info size={18} /> Thông tin chung
            </button>
            <button 
              onClick={() => setActiveTab('Boundary')}
              className={`flex items-center gap-2 py-4 border-b-2 font-bold text-sm transition-all ${activeTab === 'Boundary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
            >
              <MapPin size={18} /> Vẽ ranh giới vùng
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'Info' ? (
              <div className="space-y-4 max-w-md mx-auto">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Tên khu phố MỚI <span className="text-red-500">*</span></label>
                  <input 
                    value={formData.nameNew} 
                    onChange={e => setFormData({...formData, nameNew: e.target.value})} 
                    className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${!formData.nameNew?.trim() ? 'border-red-200 bg-red-50/30' : ''}`}
                    placeholder="VD: Khu phố 1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Tên khu phố CŨ <span className="text-red-500">*</span></label>
                  <input 
                    value={formData.nameOld} 
                    onChange={e => setFormData({...formData, nameOld: e.target.value})} 
                    className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${!formData.nameOld?.trim() ? 'border-red-200 bg-red-50/30' : ''}`}
                    placeholder="VD: Tổ dân phố 10"
                  />
                </div>
              </div>
            ) : (
              <div className="h-[450px] flex flex-col gap-3">
                <div className="flex-1 rounded-xl overflow-hidden border-2 border-slate-200">
                  <MapView 
                    center={[formData.X || 10.7719, formData.Y || 106.6983]} 
                    isSelectMode 
                    onSelectLocation={handleLocationSelect} 
                    polygons={formData.geometry && formData.geometry.length > 2 ? [
                      { id: 'drawing_nb', points: formData.geometry, label: formData.nameNew || 'Ranh giới', color: '#8b5cf6' }
                    ] : []}
                    markers={(formData.geometry || []).map((p, idx) => ({ id: `p-nb-${idx}`, lat: p[0], lng: p[1], label: `${idx + 1}` }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase">Điểm ranh giới: <span className="text-indigo-600">{formData.geometry?.length || 0}</span></span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 shadow-sm">
                      <FileSpreadsheet size={14} /> Nhập Excel
                    </button>
                    <button type="button" onClick={undoPoint} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded-lg hover:bg-slate-50">
                      <Undo size={14} /> Hoàn tác
                    </button>
                    <button type="button" onClick={clearGeometry} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 text-xs font-bold text-red-600 rounded-lg hover:bg-red-50">
                      <Trash2 size={14} /> Xóa ranh giới
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold">Hủy bỏ</button>
            <button 
              type="button" 
              onClick={handleSave} 
              className="px-8 py-2 bg-blue-600 text-white font-black rounded-xl flex items-center gap-2 shadow-lg hover:bg-blue-700 transform active:scale-95 transition-all"
            >
              <Save size={18} /> Lưu khu phố
            </button>
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

export default NeighborhoodForm;
