
import React, { useState, useMemo } from 'react';
import { PublicLandRecord, PublicLandTab, HouseNumberRecord } from '../types';
// Added Plus to the import list to fix the "Cannot find name 'Plus'" error on line 134
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
    Bieu: '',
    Donviquanl: '',
    Donvisudun: '',
    Thua: '',
    To: '',
    Phuong: '',
    Hientrang: '',
    Nguongoc: '',
    Noidungxul: '',
    Vanbanxuly: '',
    Thongtin: '',
    Vanbanphed: '',
    Ghichu: ''
  });
  const [activeTab, setActiveTab] = useState<PublicLandTab>('Admin');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [houseSearch, setHouseSearch] = useState('');

  const filteredHouses = useMemo(() => {
    if (!houseSearch.trim()) return [];
    return houseRecords.filter(h => 
      (h.TenChuHo || '').toLowerCase().includes(houseSearch.toLowerCase()) ||
      (h.SoNha || '').toLowerCase().includes(houseSearch.toLowerCase()) ||
      (h.SoCCCD || '').includes(houseSearch)
    ).slice(0, 5);
  }, [houseSearch, houseRecords]);

  const selectedHouse = useMemo(() => {
    return houseRecords.find(h => h.id === formData.LinkedHouseId);
  }, [formData.LinkedHouseId, houseRecords]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'Dientich' ? parseFloat(value) || 0 : value }));
  };

  const handleSelectHouse = (house: HouseNumberRecord) => {
    setFormData(prev => ({
      ...prev,
      LinkedHouseId: house.id,
      // Tự động cập nhật Phường/Tờ/Thửa từ số nhà nếu cần lưu vết (dù đã ẩn trên UI)
      Phuong: house.Phuong_Moi,
      To: house.SoTo,
      Thua: house.SoThua
    }));
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

  const handleImportPoints = (points: Array<[number, number]>) => {
    setFormData(prev => ({
      ...prev,
      geometry: points,
      X: points[0][0],
      Y: points[0][1]
    }));
  };

  const clearGeometry = () => {
    setFormData(prev => ({ ...prev, geometry: [] }));
  };

  const undoPoint = () => {
    setFormData(prev => ({ ...prev, geometry: (prev.geometry || []).slice(0, -1) }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Admin':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Biểu</label>
                <input name="Bieu" value={formData.Bieu || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập tên biểu..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Diện tích (m²)</label>
                <input type="number" name="Dientich" value={formData.Dientich || 0} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Search size={16} className="text-blue-600" /> Liên kết với hồ sơ Số nhà
              </label>
              
              <div className="relative">
                <div className="flex items-center gap-2 px-3 py-2 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 bg-white shadow-sm">
                  <Search size={18} className="text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Tìm theo Tên chủ hộ, Số nhà hoặc CCCD..." 
                    className="w-full outline-none text-sm"
                    value={houseSearch}
                    onChange={(e) => setHouseSearch(e.target.value)}
                  />
                  {houseSearch && (
                    <button onClick={() => setHouseSearch('')} className="p-1 hover:bg-slate-100 rounded-full">
                      <X size={14} className="text-slate-400" />
                    </button>
                  )}
                </div>

                {filteredHouses.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border rounded-lg shadow-xl overflow-hidden divide-y">
                    {filteredHouses.map(house => (
                      <button 
                        key={house.id}
                        onClick={() => handleSelectHouse(house)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800">{house.TenChuHo}</p>
                          <p className="text-[10px] text-slate-500">Số nhà: {house.SoNha} {house.Duong} | CCCD: {house.SoCCCD}</p>
                        </div>
                        <Plus size={16} className="text-slate-300 group-hover:text-blue-600" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedHouse ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hồ sơ liên kết hiện tại</p>
                      <p className="text-sm font-black text-slate-800">{selectedHouse.TenChuHo}</p>
                      <p className="text-[11px] text-slate-600">
                        Địa chỉ: {selectedHouse.SoNha} {selectedHouse.Duong} | 
                        Vị trí: Tờ {selectedHouse.SoTo} - Thửa {selectedHouse.SoThua} ({selectedHouse.Phuong_Moi})
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFormData(prev => ({ ...prev, LinkedHouseId: undefined }))}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                    title="Gỡ bỏ liên kết"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50">
                  <p className="text-sm text-slate-400 italic">Chưa có hồ sơ số nhà nào được liên kết</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'Management':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Đơn vị quản lý</label>
              <input name="Donviquanl" value={formData.Donviquanl || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Đơn vị sử dụng</label>
              <input name="Donvisudun" value={formData.Donvisudun || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-full space-y-2">
              <label className="text-sm font-medium text-slate-700">Thông tin bổ sung</label>
              <input name="Thongtin" value={formData.Thongtin || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        );
      case 'Status':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Hiện trạng</label>
              <input name="Hientrang" value={formData.Hientrang || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nguồn gốc</label>
              <input name="Nguongoc" value={formData.Nguongoc || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-full space-y-2">
              <label className="text-sm font-medium text-slate-700">Ghi chú</label>
              <textarea name="Ghichu" value={formData.Ghichu || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg h-24 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        );
      case 'Processing':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Văn bản xử lý</label>
              <input name="Vanbanxuly" value={formData.Vanbanxuly || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Văn bản phê duyệt</label>
              <input name="Vanbanphed" value={formData.Vanbanphed || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        );
      case 'Map':
        return (
          <div className="h-[450px] flex flex-col gap-3">
            <div className="flex-1 rounded-xl overflow-hidden border-2 border-slate-200">
              <MapView 
                center={[formData.X || 10.7719, formData.Y || 106.6983]} 
                isSelectMode 
                onSelectLocation={handleLocationSelect} 
                polygons={formData.geometry && formData.geometry.length > 2 ? [
                  { id: 'drawing', points: formData.geometry, label: 'Ranh giới thửa đất', color: '#f59e0b' }
                ] : []}
                markers={(formData.geometry || []).map((p, idx) => ({ id: `p-${idx}`, lat: p[0], lng: p[1], label: `${idx + 1}` }))}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-500">SỐ ĐIỂM: <span className="text-blue-600">{formData.geometry?.length || 0}</span></span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 shadow-sm">
                  <FileSpreadsheet size={14} /> Nhập Excel
                </button>
                <button onClick={undoPoint} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded-lg hover:bg-slate-50">
                  <Undo size={14} /> Hoàn tác
                </button>
                <button onClick={clearGeometry} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 text-xs font-bold text-red-600 rounded-lg hover:bg-red-50">
                  <Trash2 size={14} /> Xóa ranh giới
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Sửa hồ sơ đất công' : 'Thêm hồ sơ đất công'}</h2>
              <p className="text-xs text-slate-500">
                {selectedHouse ? `Liên kết: ${selectedHouse.SoNha} ${selectedHouse.Duong} (Tờ ${selectedHouse.SoTo} - Thửa ${selectedHouse.SoThua})` : 'Chưa liên kết số nhà'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
          </div>
          <div className="flex bg-slate-50 px-6 gap-6">
            <TabBtn active={activeTab === 'Admin'} onClick={() => setActiveTab('Admin')} icon={<ClipboardList size={18} />} label="Hành chính" />
            <TabBtn active={activeTab === 'Management'} onClick={() => setActiveTab('Management')} icon={<Building size={18} />} label="Quản lý" />
            <TabBtn active={activeTab === 'Status'} onClick={() => setActiveTab('Status')} icon={<Info size={18} />} label="Hiện trạng" />
            <TabBtn active={activeTab === 'Processing'} onClick={() => setActiveTab('Processing')} icon={<FileText size={18} />} label="Xử lý" />
            <TabBtn active={activeTab === 'Map'} onClick={() => setActiveTab('Map')} icon={<MapPin size={18} />} label="Vẽ ranh giới" />
          </div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">{renderTabContent()}</div>
          <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2 text-slate-600 font-medium hover:text-slate-800 transition-colors">Hủy</button>
            <button onClick={() => onSubmit(formData)} className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"><Save size={18} /> Lưu hồ sơ</button>
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

const TabBtn: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-all ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
    {icon} {label}
  </button>
);

export default PublicLandForm;
