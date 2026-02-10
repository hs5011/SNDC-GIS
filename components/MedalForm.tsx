
import React, { useState, useMemo } from 'react';
import { MedalRecord, HouseNumberRecord, RelationshipType, MedalType, Bank } from '../types';
import { X, Save, Search, CheckCircle2, User, Building, Plus, Trash2, Award, List, Wallet, UserCog, Edit, RotateCcw, CreditCard, Banknote } from 'lucide-react';

interface MedalFormProps {
  initialData?: Partial<MedalRecord>;
  onSubmit: (data: Partial<MedalRecord>[]) => void;
  onClose: () => void;
  isEditing?: boolean;
  houseRecords: HouseNumberRecord[];
  relationshipTypes: RelationshipType[];
  medalTypes: MedalType[];
  banks: Bank[];
}

const MedalForm: React.FC<MedalFormProps> = ({ 
  initialData, onSubmit, onClose, isEditing, houseRecords, relationshipTypes, medalTypes, banks
}) => {
  const [selectedHouseId, setSelectedHouseId] = useState<string | undefined>(initialData?.LinkedHouseId);
  const [houseSearch, setHouseSearch] = useState('');
  const [editingTempIndex, setEditingTempIndex] = useState<number | null>(null);

  const isHouseLocked = useMemo(() => !!initialData?.LinkedHouseId && !isEditing, [initialData, isEditing]);
  const [medalsList, setMedalsList] = useState<Partial<MedalRecord>[]>(isEditing && initialData ? [initialData] : []);

  const [currentMedal, setCurrentMedal] = useState<Partial<MedalRecord>>({
    HoTen: initialData?.HoTen || '',
    QuanHe: initialData?.QuanHe || '',
    LoaiDoiTuong: initialData?.LoaiDoiTuong || '',
    SoQuanLyHS: initialData?.SoQuanLyHS || '',
    SoTien: initialData?.SoTien || 0,
    NguoiNhanThay: initialData?.NguoiNhanThay || '',
    HinhThucNhan: initialData?.HinhThucNhan || 'Tiền mặt'
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

  const selectedHouse = houseRecords.find(h => h.id === selectedHouseId);
  const availableReceivers = selectedHouse ? [{ id: 'chuho', name: `${selectedHouse.TenChuHo} (Chủ hộ)` }, ...(selectedHouse.QuanHeChuHo || []).map(m => ({ id: m.id, name: `${m.HoTen} (${m.QuanHe})` }))] : [];

  const handleAddToList = () => {
    if (!currentMedal.HoTen?.trim() || !currentMedal.LoaiDoiTuong) {
      alert("CẢNH BÁO: Vui lòng nhập Họ tên và Loại Huân/Huy chương!");
      return;
    }
    if (editingTempIndex !== null) {
      const newList = [...medalsList];
      newList[editingTempIndex] = { ...currentMedal };
      setMedalsList(newList);
      setEditingTempIndex(null);
    } else {
      setMedalsList(prev => [...prev, { ...currentMedal, id: Math.random().toString(36).substr(2, 9) }]);
    }
    if (!isEditing) setCurrentMedal({ HoTen: '', QuanHe: '', LoaiDoiTuong: '', SoQuanLyHS: '', SoTien: 0, NguoiNhanThay: '', HinhThucNhan: 'Tiền mặt' });
  };

  const editFromList = (index: number) => {
    setEditingTempIndex(index);
    setCurrentMedal(medalsList[index]);
  };

  const removeFromList = (index: number) => {
    if (editingTempIndex === index) {
      setEditingTempIndex(null);
      setCurrentMedal({ HoTen: '', QuanHe: '', LoaiDoiTuong: '', SoQuanLyHS: '', SoTien: 0, NguoiNhanThay: '', HinhThucNhan: 'Tiền mặt' });
    }
    setMedalsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = () => {
    if (!selectedHouseId) { alert("CẢNH BÁO: Bạn chưa chọn Số nhà liên kết!"); return; }
    if (isEditing) {
      if (!currentMedal.HoTen?.trim() || !currentMedal.LoaiDoiTuong) { alert("CẢNH BÁO: Thiếu thông tin bắt buộc!"); return; }
      onSubmit([{ ...currentMedal, LinkedHouseId: selectedHouseId }]);
    } else {
      if (medalsList.length === 0) { alert("CẢNH BÁO: Vui lòng Thêm vào danh sách trước khi Lưu!"); return; }
      onSubmit(medalsList.map(m => ({ ...m, LinkedHouseId: selectedHouseId })));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Sửa hồ sơ Huân chương' : 'Thêm hồ sơ Huân chương KC'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><Building size={14} className="text-blue-600" /> 1. Liên kết Số nhà <span className="text-red-500 font-black">*</span></label>
            {!isEditing && !isHouseLocked && (
              <div className="relative">
                <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 shadow-sm">
                   <Search size={18} className="text-slate-400" />
                   <input type="text" placeholder="Tìm tên chủ hộ, số nhà, đường, CCCD..." className="w-full text-sm outline-none" value={houseSearch} onChange={(e) => setHouseSearch(e.target.value)} />
                </div>
                {filteredHouses.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border rounded-xl shadow-2xl overflow-hidden divide-y">
                    {filteredHouses.map(h => (
                       <button 
                         key={h.id} 
                         onClick={() => { setSelectedHouseId(h.id); setHouseSearch(''); }} 
                         className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex justify-between items-center group"
                       >
                         <div>
                           <div className="text-sm font-bold text-slate-800">SN {h.SoNha} {h.Duong}</div>
                           <div className="text-xs text-slate-500 font-medium">Chủ hộ: {h.TenChuHo} | CCCD: {h.SoCCCD}</div>
                         </div>
                         <Plus size={16} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                       </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {selectedHouse ? (
               <div className="border rounded-xl p-4 flex justify-between items-center bg-amber-50 border-amber-100 shadow-sm">
                 <div className="flex items-center gap-3">
                   <CheckCircle2 size={24} className="text-amber-600" />
                   <div>
                     <p className="text-sm font-black text-slate-800">SN {selectedHouse.SoNha} {selectedHouse.Duong}</p>
                     <p className="text-xs text-slate-500 font-medium">Chủ hộ: {selectedHouse.TenChuHo} | CCCD: {selectedHouse.SoCCCD}</p>
                   </div>
                 </div>
                 {!isEditing && !isHouseLocked && <button onClick={() => setSelectedHouseId(undefined)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>}
               </div>
            ) : <div className="border-2 border-dashed border-slate-200 p-6 text-center text-slate-400 text-xs font-bold bg-slate-50/50 italic">Vui lòng nhập từ khóa tìm kiếm để chọn số nhà liên kết</div>}
          </div>

          {selectedHouseId && (
            <div className="space-y-6 border-t pt-6">
              <label className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><Award size={14} className="text-amber-600" /> 2. Thông tin Huân chương</label>
              <div className="p-6 rounded-2xl border bg-slate-50/50 border-slate-200 space-y-4 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-600">Họ tên người nhận <span className="text-red-500 font-black">*</span></label><input value={currentMedal.HoTen || ''} onChange={e => setCurrentMedal({...currentMedal, HoTen: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white" placeholder="Họ và tên" /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-600">Loại Huân chương <span className="text-red-500 font-black">*</span></label><select value={currentMedal.LoaiDoiTuong || ''} onChange={e => setCurrentMedal({...currentMedal, LoaiDoiTuong: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white"><option value="">-- Chọn loại --</option>{medalTypes.map(mt => <option key={mt.id} value={mt.name}>{mt.name}</option>)}</select></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-600">Mức trợ cấp</label><input type="number" value={currentMedal.SoTien || 0} onChange={e => setCurrentMedal({...currentMedal, SoTien: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg text-sm text-emerald-600 font-bold bg-white" /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-600">Người nhận thay</label><select value={currentMedal.NguoiNhanThay || ''} onChange={e => setCurrentMedal({...currentMedal, NguoiNhanThay: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white"><option value="">-- Chính chủ --</option>{availableReceivers.map(rec => <option key={rec.id} value={rec.name}>{rec.name}</option>)}</select></div>
                </div>
                {!isEditing && (
                  <div className="flex justify-end pt-2">
                    <button type="button" onClick={handleAddToList} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 whitespace-nowrap ${editingTempIndex !== null ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-black'} text-white`}>
                      {editingTempIndex !== null ? <RotateCcw size={16} /> : <Plus size={16} />}
                      {editingTempIndex !== null ? 'Cập nhật Huân chương' : 'Thêm vào danh sách chờ'}
                    </button>
                  </div>
                )}
              </div>

              {!isEditing && medalsList.length > 0 && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><List size={14} /> Danh sách Huân chương đang chờ lưu ({medalsList.length})</label>
                  <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b">
                        <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="px-6 py-3">Họ tên</th>
                          <th className="px-6 py-3">Loại huân chương</th>
                          <th className="px-6 py-3 text-right">Số tiền</th>
                          <th className="px-6 py-3 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {medalsList.map((m, idx) => (
                          <tr key={idx} className={`hover:bg-amber-50/30 transition-colors ${editingTempIndex === idx ? 'bg-amber-50/50' : ''}`}>
                            <td className="px-6 py-3 font-bold text-slate-700">{m.HoTen}</td>
                            <td className="px-6 py-3"><span className="text-amber-700 font-bold px-2 py-0.5 bg-amber-50 border border-amber-100 rounded">{m.LoaiDoiTuong}</span></td>
                            <td className="px-6 py-3 text-right font-bold text-emerald-600">{(m.SoTien || 0).toLocaleString()}</td>
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
          <button onClick={handleSaveAll} className="px-8 py-2 bg-amber-600 text-white font-black rounded-xl shadow-lg transform active:scale-95 hover:bg-amber-700 transition-all flex items-center gap-2 whitespace-nowrap">
            <Save size={18} /> Lưu hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedalForm;
