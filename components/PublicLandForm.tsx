
import React, { useState, useMemo } from 'react';
import { PublicLandRecord, PublicLandTab, HouseNumberRecord } from '../types';
import { X, Save, MapPin, FileText, ClipboardList, Info, Building, Trash2, Undo, FileSpreadsheet, Search, CheckCircle2, Plus } from 'lucide-react';
import MapView from './MapView';
import ImportCoordinatesModal from './ImportCoordinatesModal';

interface PublicLandFormProps {
  initialData?: Partial<PublicLandRecord>;
  onSubmit: (data: Partial<PublicLandRecord>) => void;
  onClose: () => void;
  isEditing?: boolean;
  houseRecords: HouseNumberRecord[];
}

const PublicLandForm: React.FC<PublicLandFormProps> = ({ initialData, onSubmit, onClose, isEditing, houseRecords }) => {
  const [formData, setFormData] = useState<Partial<PublicLandRecord>>(initialData || {
    Status: 'Active',
    X: 10.7719,
    Y: 106.6983,
    Dientich: 0,
    geometry: [],
    Bieu: ''
  });
  const [activeTab, setActiveTab] = useState<PublicLandTab>('Admin');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [houseSearch, setHouseSearch] = useState('');

  const filteredHouses = useMemo(() => {
    const s = houseSearch.toLowerCase().trim();
    if (!s) return [];
    return houseRecords.filter(h => 
      (h.TenChuHo || '').toLowerCase().includes(s) ||
      (h.SoNha || '').toLowerCase().includes(s) ||
      (h.Duong || '').toLowerCase().includes(s) ||
      (`${h.SoNha} ${h.Duong}`).toLowerCase().includes(s) ||
      (h.SoCCCD || '').includes(s)
    ).slice(0, 8);
  }, [houseSearch, houseRecords]);

  const selectedHouse = useMemo(() => {
    return houseRecords.find(h => h.id === formData.LinkedHouseId);
  }, [formData.LinkedHouseId, houseRecords]);

  const validate = () => {
    const errors: string[] = [];
    if (!formData.Bieu?.trim()) errors.push("Biểu (Tên biểu mẫu)");
    if (!formData.Dientich || formData.Dientich <= 0) errors.push("Diện tích (phải lớn hơn 0)");
    if (!formData.LinkedHouseId) errors.push("Số nhà liên kết");

    if (errors.length > 0) {
      alert("CẢNH BÁO: Vui lòng bổ sung thông tin sau:\n- " + errors.join("\n- "));
      if (!formData.Bieu || !formData.LinkedHouseId) setActiveTab('Admin');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'Dientich' ? parseFloat(value) || 0 : value }));
  };

  const handleSelectHouse = (house: HouseNumberRecord) => {
    setFormData(prev => ({ ...prev, LinkedHouseId: house.id }));
    setHouseSearch('');
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    const newPoints = [...(formData.geometry || []), [lat, lng] as [number, number]];
    if (newPoints.length === 1) {
      setFormData(prev => ({ ...prev, X: lat, Y: lng, geometry: newPoints }));
    } else {
      setFormData(prev => ({ ...prev, geometry: newPoints }));
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Sửa hồ sơ đất công' : 'Thêm hồ sơ đất công'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
          </div>

          <div className="flex bg-slate-50 px-6 gap-6 border-b">
            <TabBtn active={activeTab === 'Admin'} onClick={() => setActiveTab('Admin')} icon={<ClipboardList size={18} />} label="Hành chính & Liên kết" />
            <TabBtn active={activeTab === 'Management'} onClick={() => setActiveTab('Management')} icon={<Building size={18} />} label="Quản lý" />
            <TabBtn active={activeTab === 'Status'} onClick={() => setActiveTab('Status')} icon={<Info size={18} />} label="Hiện trạng" />
            <TabBtn active={activeTab === 'Map'} onClick={() => setActiveTab('Map')} icon={<MapPin size={18} />} label="Ranh giới" />
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'Admin' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Biểu <span className="text-red-500">*</span></label>
                    <input name="Bieu" value={formData.Bieu || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Biểu 01" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Diện tích (m²) <span className="text-red-500">*</span></label>
                    <input type="number" name="Dientich" value={formData.Dientich || 0} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                <div className="space-y-4 border-t pt-6">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Search size={16} className="text-blue-600" /> Liên kết với Số nhà <span className="text-red-500 font-black">*</span></label>
                  <div className="relative">
                    <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500">
                      <Search size={16} className="text-slate-400" />
                      <input type="text" placeholder="Tìm tên chủ hộ, số nhà, đường..." className="w-full text-sm outline-none" value={houseSearch} onChange={(e) => setHouseSearch(e.target.value)} />
                    </div>
                    {filteredHouses.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border rounded-xl shadow-2xl overflow-hidden divide-y">
                        {filteredHouses.map(house => (
                          <button 
                            key={house.id} 
                            onClick={() => handleSelectHouse(house)} 
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex justify-between items-center group"
                          >
                            <div>
                              <div className="text-sm font-bold text-slate-800">SN {house.SoNha} {house.Duong}</div>
                              <div className="text-xs text-slate-500 font-medium">Chủ hộ: {house.TenChuHo} | CCCD: {house.SoCCCD}</div>
                            </div>
                            <Plus size={14} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedHouse ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={24} className="text-emerald-600" />
                        <div>
                           <div className="text-sm font-bold text-slate-800">SN {selectedHouse.SoNha} {selectedHouse.Duong}</div>
                           <div className="text-xs text-slate-500 font-medium">Chủ hộ: {selectedHouse.TenChuHo}</div>
                        </div>
                      </div>
                      <button onClick={() => setFormData({...formData, LinkedHouseId: undefined})} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-red-100 rounded-xl p-6 text-center bg-red-50/10 italic text-red-400 text-xs font-bold">
                      Bắt buộc chọn một số nhà để liên kết hồ sơ quản lý đất công
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'Management' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Đơn vị quản lý</label>
                  <input name="Donviquanl" value={formData.Donviquanl || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Đơn vị sử dụng</label>
                  <input name="Donvisudun" value={formData.Donvisudun || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            )}
            {activeTab === 'Status' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Hiện trạng</label>
                  <input name="Hientrang" value={formData.Hientrang || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-sm font-medium text-slate-700">Ghi chú</label>
                  <textarea name="Ghichu" value={formData.Ghichu || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                </div>
              </div>
            )}
            {activeTab === 'Map' && (
              <div className="h-[400px] flex flex-col gap-2">
                <MapView center={[formData.X || 10.7719, formData.Y || 106.6983]} isSelectMode onSelectLocation={handleLocationSelect} markers={(formData.geometry || []).map((p, idx) => ({ id: `p-${idx}`, lat: p[0], lng: p[1], label: `${idx + 1}` }))} />
              </div>
            )}
          </div>

          <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2 text-slate-600 font-bold hover:text-slate-800">Hủy</button>
            <button onClick={handleSave} className="px-8 py-2 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 flex items-center gap-2 transition-all transform active:scale-95"><Save size={18} /> Lưu hồ sơ</button>
          </div>
        </div>
      </div>
    </>
  );
};

const TabBtn: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-2 py-4 border-b-2 font-bold text-sm transition-all ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
    {icon} {label}
  </button>
);

export default PublicLandForm;
