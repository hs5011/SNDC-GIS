
import React, { useState, useMemo } from 'react';
import { MedalRecord, HouseNumberRecord, RelationshipType, MedalType } from '../types';
import { X, Save, Search, CheckCircle2, User, Building, Plus, Trash2, Award, List, Phone, Mail } from 'lucide-react';

interface MedalFormProps {
  initialData?: Partial<MedalRecord>;
  onSubmit: (data: Partial<MedalRecord>[]) => void;
  onClose: () => void;
  isEditing?: boolean;
  houseRecords: HouseNumberRecord[];
  relationshipTypes: RelationshipType[];
  medalTypes: MedalType[];
}

const MedalForm: React.FC<MedalFormProps> = ({ 
  initialData, 
  onSubmit, 
  onClose, 
  isEditing, 
  houseRecords,
  relationshipTypes,
  medalTypes
}) => {
  const [selectedHouseId, setSelectedHouseId] = useState<string | undefined>(initialData?.LinkedHouseId);
  const [houseSearch, setHouseSearch] = useState('');
  
  const [medalsList, setMedalsList] = useState<Partial<MedalRecord>[]>(
    isEditing && initialData ? [initialData] : []
  );

  const [currentMedal, setCurrentMedal] = useState<Partial<MedalRecord>>({
    HoTen: '',
    QuanHe: '',
    LoaiDoiTuong: '',
    SoQuanLyHS: '',
    SoTien: 0,
    DienThoai: '',
    Email: '',
    GhiChu: ''
  });

  const filteredHouses = useMemo(() => {
    if (!houseSearch.trim()) return [];
    return houseRecords.filter(h => 
      (h.TenChuHo || '').toLowerCase().includes(houseSearch.toLowerCase()) ||
      (h.SoNha || '').toLowerCase().includes(houseSearch.toLowerCase()) ||
      (h.SoCCCD || '').includes(houseSearch)
    ).slice(0, 5);
  }, [houseSearch, houseRecords]);

  const selectedHouse = useMemo(() => {
    return houseRecords.find(h => h.id === selectedHouseId);
  }, [selectedHouseId, houseRecords]);

  const handleAddToList = () => {
    if (!currentMedal.HoTen) return alert('Vui lòng nhập họ tên người được huân chương');
    if (!currentMedal.LoaiDoiTuong) return alert('Vui lòng chọn loại huân chương');
    
    setMedalsList(prev => [...prev, { ...currentMedal, id: Math.random().toString(36).substr(2, 9) }]);
    setCurrentMedal({
      HoTen: '',
      QuanHe: '',
      LoaiDoiTuong: '',
      SoQuanLyHS: '',
      SoTien: 0,
      DienThoai: '',
      Email: '',
      GhiChu: ''
    });
  };

  const removeFromList = (index: number) => {
    setMedalsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = () => {
    if (!selectedHouseId) return alert('Vui lòng chọn số nhà liên kết');
    if (medalsList.length === 0) return alert('Vui lòng thêm ít nhất một người vào danh sách');
    
    const finalData = medalsList.map(m => ({ ...m, LinkedHouseId: selectedHouseId }));
    onSubmit(finalData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b shrink-0 bg-amber-50/50">
          <div>
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <Award className="text-amber-600" /> {isEditing ? 'Sửa hồ sơ huân chương' : 'Thêm hồ sơ huân chương kháng chiến'}
            </h2>
            <p className="text-xs text-amber-700 italic mt-1">Quản lý danh sách người được tặng thưởng huân chương theo hộ gia đình</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-amber-100 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Section 1: House Selection */}
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Building size={14} className="text-amber-600" /> 1. Xác định địa chỉ liên kết
            </label>
            
            {!isEditing && (
              <div className="relative">
                <div className="flex items-center gap-2 px-3 py-2 border rounded-lg focus-within:ring-2 focus-within:ring-amber-500 bg-white shadow-sm">
                  <Search size={18} className="text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Tìm theo Tên chủ hộ, Số nhà hoặc CCCD..." 
                    className="w-full outline-none text-sm"
                    value={houseSearch}
                    onChange={(e) => setHouseSearch(e.target.value)}
                  />
                </div>

                {filteredHouses.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border rounded-lg shadow-xl overflow-hidden divide-y">
                    {filteredHouses.map(house => (
                      <button 
                        key={house.id}
                        onClick={() => { setSelectedHouseId(house.id); setHouseSearch(''); }}
                        className="w-full text-left px-4 py-3 hover:bg-amber-50 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800">{house.TenChuHo}</p>
                          <p className="text-[10px] text-slate-500">SN: {house.SoNha} {house.Duong} | CCCD: {house.SoCCCD}</p>
                        </div>
                        <Plus size={16} className="text-slate-300 group-hover:text-amber-600" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedHouse ? (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Địa chỉ đã liên kết</p>
                    <p className="text-sm font-black text-slate-800">{selectedHouse.SoNha} {selectedHouse.Duong}</p>
                    <p className="text-[11px] text-slate-600">Chủ hộ: {selectedHouse.TenChuHo} | Tờ/Thửa: T{selectedHouse.SoTo}/Th{selectedHouse.SoThua}</p>
                  </div>
                </div>
                {!isEditing && (
                  <button onClick={() => setSelectedHouseId(undefined)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50">
                <p className="text-sm text-slate-400 italic">Vui lòng chọn hồ sơ số nhà để nhập thông tin khen thưởng</p>
              </div>
            )}
          </div>

          {/* Section 2: Medal Input */}
          {selectedHouseId && (
            <div className="space-y-6 border-t pt-6 animation-fade-in">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={14} className="text-amber-600" /> 2. Nhập thông tin người nhận khen thưởng
              </label>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Họ và tên <span className="text-red-500">*</span></label>
                    <input 
                      value={currentMedal.HoTen || ''} 
                      onChange={e => setCurrentMedal({...currentMedal, HoTen: e.target.value})} 
                      className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm" 
                      placeholder="Nhập họ tên..." 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Quan hệ với chủ hộ</label>
                    <select 
                      value={currentMedal.QuanHe || ''} 
                      onChange={e => setCurrentMedal({...currentMedal, QuanHe: e.target.value})} 
                      className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    >
                      <option value="">-- Chọn quan hệ --</option>
                      {relationshipTypes.map(rel => <option key={rel.id} value={rel.name}>{rel.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Loại đối tượng khen thưởng <span className="text-red-500">*</span></label>
                    <select 
                      value={currentMedal.LoaiDoiTuong || ''} 
                      onChange={e => setCurrentMedal({...currentMedal, LoaiDoiTuong: e.target.value})} 
                      className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    >
                      <option value="">-- Chọn loại huân/huy chương --</option>
                      {medalTypes.map(type => <option key={type.id} value={type.name}>{type.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Số quản lý hồ sơ</label>
                    <input 
                      value={currentMedal.SoQuanLyHS || ''} 
                      onChange={e => setCurrentMedal({...currentMedal, SoQuanLyHS: e.target.value})} 
                      className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm" 
                      placeholder="VD: HS-1234/KC" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Số tiền trợ cấp (VNĐ)</label>
                    <input 
                      type="number"
                      value={currentMedal.SoTien || 0} 
                      onChange={e => setCurrentMedal({...currentMedal, SoTien: parseFloat(e.target.value) || 0})} 
                      className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Điện thoại liên hệ</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        value={currentMedal.DienThoai || ''} 
                        onChange={e => setCurrentMedal({...currentMedal, DienThoai: e.target.value})} 
                        className="w-full pl-9 pr-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        value={currentMedal.Email || ''} 
                        onChange={e => setCurrentMedal({...currentMedal, Email: e.target.value})} 
                        className="w-full pl-9 pr-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm" 
                      />
                    </div>
                  </div>
                  <div className="col-span-full space-y-1">
                    <label className="text-xs font-bold text-slate-600">Ghi chú</label>
                    <textarea 
                      value={currentMedal.GhiChu || ''} 
                      onChange={e => setCurrentMedal({...currentMedal, GhiChu: e.target.value})} 
                      className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm h-20 resize-none" 
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button 
                    type="button" 
                    onClick={handleAddToList}
                    className="flex items-center gap-2 bg-amber-900 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-amber-800 transition-all shadow-md active:scale-95"
                  >
                    <Plus size={16} /> Thêm vào danh sách chờ
                  </button>
                </div>
              </div>

              {/* Temp List Display */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <List size={14} className="text-amber-600" /> Danh sách người hưởng ({medalsList.length})
                </label>
                <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-amber-50 border-b">
                      <tr className="text-[10px] font-bold uppercase text-amber-500">
                        <th className="px-4 py-3">Họ và tên</th>
                        <th className="px-4 py-3">Loại đối tượng</th>
                        <th className="px-4 py-3">Số tiền</th>
                        <th className="px-4 py-3 text-right">#</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {medalsList.length > 0 ? (
                        medalsList.map((m, idx) => (
                          <tr key={idx} className="hover:bg-amber-50/30 group transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-700">{m.HoTen}</td>
                            <td className="px-4 py-3"><span className="bg-white border px-2 py-0.5 rounded text-[10px] font-medium">{m.LoaiDoiTuong}</span></td>
                            <td className="px-4 py-3 font-bold text-emerald-600">{(m.SoTien || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => removeFromList(idx)} className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">Chưa có người nào trong danh sách tạm</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-slate-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2 text-slate-600 font-medium hover:text-slate-800 transition-colors">Hủy</button>
          <button 
            onClick={handleSaveAll}
            disabled={!selectedHouseId || medalsList.length === 0}
            className={`px-8 py-2 rounded-xl shadow-lg flex items-center gap-2 transition-all transform active:scale-95 font-bold ${(!selectedHouseId || medalsList.length === 0) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 text-white transform hover:scale-105'}`}
          >
            <Save size={18} /> {isEditing ? 'Cập nhật' : 'Lưu tất cả hồ sơ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedalForm;
