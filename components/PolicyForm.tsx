
import React, { useState, useMemo } from 'react';
import { PolicyRecord, HouseNumberRecord, RelationshipType, PolicyType, Bank } from '../types';
import { X, Save, Search, CheckCircle2, Building, Plus, Trash2, ShieldCheck, List, UserCog, Edit, RotateCcw } from 'lucide-react';

interface PolicyFormProps {
  initialData?: Partial<PolicyRecord>;
  onSubmit: (data: Partial<PolicyRecord>[]) => void;
  onClose: () => void;
  isEditing?: boolean;
  houseRecords: HouseNumberRecord[];
  relationshipTypes: RelationshipType[];
  policyTypes: PolicyType[];
  banks: Bank[];
}

const PolicyForm: React.FC<PolicyFormProps> = ({ 
  initialData, onSubmit, onClose, isEditing, houseRecords, relationshipTypes, policyTypes, banks
}) => {
  const [selectedHouseId, setSelectedHouseId] = useState<string | undefined>(initialData?.LinkedHouseId);
  const [houseSearch, setHouseSearch] = useState('');
  const [editingTempIndex, setEditingTempIndex] = useState<number | null>(null);

  const isHouseLocked = useMemo(() => !!initialData?.LinkedHouseId && !isEditing, [initialData, isEditing]);
  const [policiesList, setPoliciesList] = useState<Partial<PolicyRecord>[]>(isEditing && initialData ? [initialData] : []);

  const [currentPolicy, setCurrentPolicy] = useState<Partial<PolicyRecord>>({
    HoTen: initialData?.HoTen || '',
    QuanHe: initialData?.QuanHe || '',
    LoaiDienChinhSach: initialData?.LoaiDienChinhSach || '',
    SoQuanLyHS: initialData?.SoQuanLyHS || '',
    SoTien: initialData?.SoTien || 0,
    TyLeTonThuong: initialData?.TyLeTonThuong || '',
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
      (`${h.SoNha || ''} ${h.Duong || ''}`).toLowerCase().includes(s) ||
      (h.SoCCCD || '').includes(s)
    ).slice(0, 20);
  }, [houseSearch, houseRecords]);

  const selectedHouse = houseRecords.find(h => h.id === selectedHouseId);
  const availableReceivers = selectedHouse ? [{ id: 'chuho', name: `${selectedHouse.TenChuHo} (Chủ hộ)` }, ...(selectedHouse.QuanHeChuHo || []).map(m => ({ id: m.id, name: `${m.HoTen} (${m.QuanHe})` }))] : [];

  const handleAddToList = () => {
    if (!currentPolicy.HoTen?.trim() || !currentPolicy.LoaiDienChinhSach) {
      alert("CẢNH BÁO: Vui lòng nhập Họ tên và Diện chính sách!");
      return;
    }
    if (editingTempIndex !== null) {
      const newList = [...policiesList];
      newList[editingTempIndex] = { ...currentPolicy };
      setPoliciesList(newList);
      setEditingTempIndex(null);
    } else {
      setPoliciesList(prev => [...prev, { ...currentPolicy, id: Math.random().toString(36).substr(2, 9) }]);
    }
    if (!isEditing) setCurrentPolicy({ HoTen: '', QuanHe: '', LoaiDienChinhSach: '', SoQuanLyHS: '', SoTien: 0, TyLeTonThuong: '', NguoiNhanThay: '', HinhThucNhan: 'Tiền mặt' });
  };

  const handleSaveAll = () => {
    if (!selectedHouseId) { alert("CẢNH BÁO: Bạn chưa chọn Số nhà liên kết!"); return; }
    if (isEditing) {
      onSubmit([{ ...currentPolicy, LinkedHouseId: selectedHouseId }]);
    } else {
      if (policiesList.length === 0) { alert("CẢNH BÁO: Vui lòng thêm hồ sơ vào danh sách!"); return; }
      onSubmit(policiesList.map(p => ({ ...p, LinkedHouseId: selectedHouseId })));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Sửa hồ sơ Chính sách' : 'Thêm hồ sơ Đối tượng Chính sách'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Building size={14} className="text-blue-600" /> 1. Liên kết Số nhà <span className="text-red-500 font-black">*</span></label>
            {!isEditing && !isHouseLocked && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-4 py-3 border rounded-xl bg-white focus-within:ring-2 focus-within:ring-blue-500 shadow-sm">
                  <Search size={20} className="text-slate-400" />
                  <input type="text" placeholder="Tìm tên chủ hộ, số nhà, đường, CCCD..." className="w-full text-sm outline-none font-medium" value={houseSearch} onChange={(e) => setHouseSearch(e.target.value)} />
                </div>
                {houseSearch && filteredHouses.length > 0 && (
                  <div className="bg-white border rounded-xl shadow-xl overflow-hidden divide-y max-h-[350px] overflow-y-auto custom-scrollbar">
                    {filteredHouses.map(h => (
                      <button 
                        key={h.id} 
                        onClick={() => { setSelectedHouseId(h.id); setHouseSearch(''); }} 
                        className="w-full text-left px-5 py-4 hover:bg-indigo-50 transition-colors flex justify-between items-center group"
                      >
                        <div>
                          <div className="text-sm font-black text-slate-800">{h.SoNha ? `SN ${h.SoNha} ` : ''}{h.Duong || ''}</div>
                          <div className="text-xs text-slate-500 font-medium mt-1">Chủ hộ: {h.TenChuHo || ''} | CCCD: {h.SoCCCD || ''}</div>
                        </div>
                        <div className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity uppercase">Chọn căn này</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {selectedHouse ? (
              <div className="border-2 border-indigo-500 rounded-2xl p-5 flex justify-between items-center bg-indigo-50 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Building size={24} /></div>
                  <div>
                    <p className="text-lg font-black text-slate-900">{selectedHouse.SoNha ? `SN ${selectedHouse.SoNha} ` : ''}{selectedHouse.Duong || ''}</p>
                    <p className="text-sm text-slate-600 font-bold">Chủ hộ: {selectedHouse.TenChuHo} | CCCD: {selectedHouse.SoCCCD}</p>
                  </div>
                </div>
                {!isEditing && !isHouseLocked && <button onClick={() => setSelectedHouseId(undefined)} className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-xl text-xs font-black hover:bg-red-50 shadow-sm transition-all"><Trash2 size={16} /> Thay đổi</button>}
              </div>
            ) : !houseSearch && <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-sm font-bold bg-slate-50/50">Vui lòng nhập tìm kiếm để chọn số nhà liên kết hồ sơ</div>}
          </div>

          {selectedHouseId && (
            <div className="space-y-6 border-t pt-8">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={14} className="text-indigo-600" /> 2. Thông tin đối tượng chính sách</label>
              <div className="p-6 rounded-2xl border-2 border-slate-100 bg-white space-y-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-600">Họ và tên <span className="text-red-500 font-black">*</span></label><input value={currentPolicy.HoTen || ''} onChange={e => setCurrentPolicy({...currentPolicy, HoTen: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" placeholder="Họ và tên" /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-600">Diện chính sách <span className="text-red-500 font-black">*</span></label><select value={currentPolicy.LoaiDienChinhSach || ''} onChange={e => setCurrentPolicy({...currentPolicy, LoaiDienChinhSach: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 font-medium"><option value="">-- Chọn diện --</option>{policyTypes.map(pt => <option key={pt.id} value={pt.name}>{pt.name}</option>)}</select></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-600">Tỷ lệ tổn thương</label><input value={currentPolicy.TyLeTonThuong || ''} onChange={e => setCurrentPolicy({...currentPolicy, TyLeTonThuong: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" placeholder="VD: 81%" /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-600">Mức trợ cấp</label><input type="number" value={currentPolicy.SoTien || 0} onChange={e => setCurrentPolicy({...currentPolicy, SoTien: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg text-sm font-black text-emerald-600 bg-slate-50" /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-600">Người nhận thay</label><select value={currentPolicy.NguoiNhanThay || ''} onChange={e => setCurrentPolicy({...currentPolicy, NguoiNhanThay: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 font-medium"><option value="">-- Chính chủ --</option>{availableReceivers.map(rec => <option key={rec.id} value={rec.name}>{rec.name}</option>)}</select></div>
                </div>
                {!isEditing && (
                  <div className="flex justify-end pt-2">
                    <button type="button" onClick={handleAddToList} className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all active:scale-95 ${editingTempIndex !== null ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-black'} text-white`}>
                      {editingTempIndex !== null ? <RotateCcw size={16} /> : <Plus size={16} />}
                      {editingTempIndex !== null ? 'Cập nhật hồ sơ' : 'Thêm vào danh sách chờ'}
                    </button>
                  </div>
                )}
              </div>

              {!isEditing && policiesList.length > 0 && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><List size={14} /> Danh sách hồ sơ chính sách đang chờ lưu ({policiesList.length})</label>
                  <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b">
                        <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="px-6 py-3">Họ tên</th>
                          <th className="px-6 py-3">Diện chính sách</th>
                          <th className="px-6 py-3 text-right">Số tiền</th>
                          <th className="px-6 py-3 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {policiesList.map((p, idx) => (
                          <tr key={idx} className={`hover:bg-indigo-50/30 transition-colors ${editingTempIndex === idx ? 'bg-indigo-50/50' : ''}`}>
                            <td className="px-6 py-3 font-bold text-slate-700">{p.HoTen}</td>
                            <td className="px-6 py-3"><span className="font-bold text-indigo-700 px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded">{p.LoaiDienChinhSach}</span></td>
                            <td className="px-6 py-3 text-right font-black text-emerald-600">{(p.SoTien || 0).toLocaleString()}</td>
                            <td className="px-6 py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => { setEditingTempIndex(idx); setCurrentPolicy(policiesList[idx]); }} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"><Edit size={14} /></button>
                                <button onClick={() => setPoliciesList(prev => prev.filter((_, i) => i !== idx))} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={14} /></button>
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
          <button onClick={handleSaveAll} className="px-10 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-xl transform active:scale-95 hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm"><Save size={20} /> Lưu hồ sơ</button>
        </div>
      </div>
    </div>
  );
};

export default PolicyForm;
