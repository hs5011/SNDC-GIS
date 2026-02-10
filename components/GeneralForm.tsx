
import React, { useState, useMemo } from 'react';
import { GeneralRecord, HouseNumberRecord, RelationshipType, GeneralStatus, Bank } from '../types';
import { X, Save, Search, CheckCircle2, User, Building, Plus, Trash2, List, UserCog, Edit, RotateCcw } from 'lucide-react';

interface GeneralFormProps {
  initialData?: Partial<GeneralRecord>;
  onSubmit: (data: Partial<GeneralRecord>[]) => void;
  onClose: () => void;
  isEditing?: boolean;
  houseRecords: HouseNumberRecord[];
  relationshipTypes: RelationshipType[];
  generalStatuses: GeneralStatus[];
  banks: Bank[];
}

const GeneralForm: React.FC<GeneralFormProps> = ({ 
  initialData, 
  onSubmit, 
  onClose, 
  isEditing, 
  houseRecords,
  relationshipTypes,
  generalStatuses,
  banks
}) => {
  const [selectedHouseId, setSelectedHouseId] = useState<string | undefined>(initialData?.LinkedHouseId);
  const [houseSearch, setHouseSearch] = useState('');
  const [editingTempIndex, setEditingTempIndex] = useState<number | null>(null);
  
  const isHouseLocked = useMemo(() => !!initialData?.LinkedHouseId && !isEditing, [initialData, isEditing]);

  const [generalsList, setGeneralsList] = useState<Partial<GeneralRecord>[]>(
    isEditing && initialData ? [initialData] : []
  );

  const [currentGeneral, setCurrentGeneral] = useState<Partial<GeneralRecord>>({
    Dien: initialData?.Dien || 'TW',
    TinhTrang: initialData?.TinhTrang || '',
    HoTen: initialData?.HoTen || '',
    QuanHe: initialData?.QuanHe || '',
    SoQuanLyHS: initialData?.SoQuanLyHS || '',
    DiaChiThuongTru: initialData?.DiaChiThuongTru || '',
    NguoiNhanThay: initialData?.NguoiNhanThay || '',
    GhiChu: initialData?.GhiChu || '',
    HinhThucNhan: 'Tiền mặt'
  });

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
    return houseRecords.find(h => h.id === selectedHouseId);
  }, [selectedHouseId, houseRecords]);

  const availableReceivers = useMemo(() => {
    if (!selectedHouse) return [];
    const members = [
      { id: 'chuho', name: `${selectedHouse.TenChuHo} (Chủ hộ)` },
      ...(selectedHouse.QuanHeChuHo || []).map(m => ({ id: m.id, name: `${m.HoTen} (${m.QuanHe})` }))
    ];
    return members;
  }, [selectedHouse]);

  const handleAddToList = () => {
    const errors: string[] = [];
    if (!currentGeneral.HoTen?.trim()) errors.push("Họ tên tướng lĩnh");
    if (!currentGeneral.TinhTrang) errors.push("Tình trạng hiện tại");
    
    if (errors.length > 0) {
      alert("LỖI: Vui lòng nhập thông tin Tướng lĩnh trước khi đưa vào danh sách:\n- " + errors.join("\n- "));
      return;
    }
    
    if (editingTempIndex !== null) {
      const newList = [...generalsList];
      newList[editingTempIndex] = { ...currentGeneral };
      setGeneralsList(newList);
      setEditingTempIndex(null);
    } else {
      setGeneralsList(prev => [...prev, { ...currentGeneral, id: Math.random().toString(36).substr(2, 9) }]);
    }

    if (!isEditing) {
      setCurrentGeneral({
        Dien: 'TW',
        TinhTrang: '',
        HoTen: '',
        QuanHe: '',
        SoQuanLyHS: '',
        DiaChiThuongTru: '',
        NguoiNhanThay: '',
        GhiChu: '',
        HinhThucNhan: 'Tiền mặt'
      });
    }
  };

  const editFromList = (index: number) => {
    setEditingTempIndex(index);
    setCurrentGeneral(generalsList[index]);
  };

  const removeFromList = (index: number) => {
    if (editingTempIndex === index) {
      setEditingTempIndex(null);
      setCurrentGeneral({ Dien: 'TW', TinhTrang: '', HoTen: '', QuanHe: '', SoQuanLyHS: '', DiaChiThuongTru: '', NguoiNhanThay: '', GhiChu: '', HinhThucNhan: 'Tiền mặt' });
    }
    setGeneralsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = () => {
    if (!selectedHouseId) {
      alert("CẢNH BÁO: Bạn chưa chọn Số nhà để liên kết hồ sơ!");
      return;
    }
    
    if (isEditing) {
      if (!currentGeneral.HoTen?.trim() || !currentGeneral.TinhTrang) {
        alert("CẢNH BÁO: Vui lòng nhập đầy đủ Họ tên và Tình trạng!");
        return;
      }
      onSubmit([{ ...currentGeneral, LinkedHouseId: selectedHouseId }]);
    } else {
      if (generalsList.length === 0) {
        alert("CẢNH BÁO: Danh sách hồ sơ đang trống. Vui lòng điền thông tin và nhấn 'Thêm vào danh sách' trước khi Lưu!");
        return;
      }
      onSubmit(generalsList.map(g => ({ ...g, LinkedHouseId: selectedHouseId })));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Sửa thông tin Tướng lĩnh' : 'Thêm hồ sơ Tướng lĩnh'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Building size={14} className="text-blue-600" /> 1. Chọn số nhà liên kết <span className="text-red-500 font-black">*</span>
            </label>
            
            {!isEditing && !isHouseLocked && (
              <div className="relative">
                <div className="flex items-center gap-2 px-3 py-2 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 bg-white shadow-sm">
                  <Search size={18} className="text-slate-400" />
                  <input type="text" placeholder="Tìm tên chủ hộ, số nhà, đường, CCCD..." className="w-full outline-none text-sm" value={houseSearch} onChange={(e) => setHouseSearch(e.target.value)} />
                </div>
                {filteredHouses.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border rounded-xl shadow-2xl overflow-hidden divide-y">
                    {filteredHouses.map(house => (
                      <button 
                        key={house.id} 
                        onClick={() => { setSelectedHouseId(house.id); setHouseSearch(''); }} 
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex justify-between items-center group"
                      >
                        <div>
                          <div className="text-sm font-bold text-slate-800">SN {house.SoNha} {house.Duong}</div>
                          <div className="text-xs text-slate-500">Chủ hộ: {house.TenChuHo} | CCCD: {house.SoCCCD}</div>
                        </div>
                        <Plus size={16} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedHouse ? (
              <div className="border rounded-xl p-4 flex items-center justify-between bg-blue-50 border-blue-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={24} className="text-blue-600" />
                  <div>
                    <p className="text-sm font-black text-slate-800">SN {selectedHouse.SoNha} {selectedHouse.Duong}</p>
                    <p className="text-xs text-slate-500 font-medium">Chủ hộ: {selectedHouse.TenChuHo} | CCCD: {selectedHouse.SoCCCD}</p>
                  </div>
                </div>
                {!isEditing && !isHouseLocked && (
                  <button onClick={() => setSelectedHouseId(undefined)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50 italic text-slate-400 text-xs font-bold">
                Vui lòng nhập từ khóa tìm kiếm để chọn một số nhà liên kết hồ sơ
              </div>
            )}
          </div>

          {selectedHouseId && (
            <div className="space-y-6 border-t pt-6">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={14} className="text-blue-600" /> 2. Nhập thông tin Tướng lĩnh
              </label>

              <div className="p-6 rounded-2xl border bg-slate-50/50 border-slate-200 space-y-4 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Họ và tên <span className="text-red-500 font-black">*</span></label>
                    <input value={currentGeneral.HoTen || ''} onChange={e => setCurrentGeneral({...currentGeneral, HoTen: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white" placeholder="Họ và tên tướng lĩnh" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Diện quản lý</label>
                    <select value={currentGeneral.Dien || 'TW'} onChange={e => setCurrentGeneral({...currentGeneral, Dien: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                      <option value="TW">TW (Trung ương)</option>
                      <option value="Thành ủy">Thành ủy</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Tình trạng <span className="text-red-500 font-black">*</span></label>
                    <select value={currentGeneral.TinhTrang || ''} onChange={e => setCurrentGeneral({...currentGeneral, TinhTrang: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                      <option value="">-- Chọn tình trạng --</option>
                      {generalStatuses.map(st => <option key={st.id} value={st.name}>{st.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Người nhận thay (nếu có)</label>
                    <select value={currentGeneral.NguoiNhanThay || ''} onChange={e => setCurrentGeneral({...currentGeneral, NguoiNhanThay: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm font-semibold bg-white">
                      <option value="">-- Chính chủ --</option>
                      {availableReceivers.map(rec => <option key={rec.id} value={rec.name}>{rec.name}</option>)}
                    </select>
                  </div>
                </div>
                {!isEditing && (
                  <div className="flex justify-end pt-2">
                    <button type="button" onClick={handleAddToList} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 ${editingTempIndex !== null ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-black'} text-white`}>
                      {editingTempIndex !== null ? <RotateCcw size={16} /> : <Plus size={16} />}
                      {editingTempIndex !== null ? 'Cập nhật mục đang sửa' : 'Thêm vào danh sách chờ'}
                    </button>
                  </div>
                )}
              </div>

              {!isEditing && generalsList.length > 0 && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><List size={14} /> Danh sách đang chờ lưu ({generalsList.length})</label>
                  <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b">
                        <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="px-6 py-3">Họ tên</th>
                          <th className="px-6 py-3">Diện / Tình trạng</th>
                          <th className="px-6 py-3 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {generalsList.map((g, idx) => (
                          <tr key={idx} className={`hover:bg-indigo-50/30 transition-colors ${editingTempIndex === idx ? 'bg-indigo-50/50' : ''}`}>
                            <td className="px-6 py-3 font-bold text-slate-700">{g.HoTen}</td>
                            <td className="px-6 py-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-bold border">{g.Dien} - {g.TinhTrang}</span></td>
                            <td className="px-6 py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => editFromList(idx)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Sửa mục này"><Edit size={14} /></button>
                                <button onClick={() => removeFromList(idx)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Xóa mục này"><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-slate-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2 text-slate-600 font-bold hover:text-slate-800 transition-colors">Hủy</button>
          <button onClick={handleSaveAll} className="px-8 py-2 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 flex items-center gap-2 transition-all transform active:scale-95">
            <Save size={18} /> {isEditing ? 'Lưu thay đổi' : 'Lưu tất cả hồ sơ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneralForm;
