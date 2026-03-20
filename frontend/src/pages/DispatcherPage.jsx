/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const styles = {
    new: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    assigned: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    in_progress: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    done: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    canceled: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };
  const labels = { new: 'Новая', assigned: 'Назначена', in_progress: 'В работе', done: 'Завершена', canceled: 'Отменена' };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export default function DispatcherPage() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      const res = await api.get('/requests', { params: filter ? { status: filter } : {} });
      setRequests(res.data);
    } catch (e) { toast.error('Ошибка загрузки'); }
  }, [filter]);

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    fetchRequests(); 
  }, [fetchRequests]);

  const action = async (method, id, param = '') => {
    try {
      await api.patch(`/requests/${id}/${method}${param}`);
      toast.success('Успешно выполнено');
      fetchRequests();
    } catch (e) { toast.error('Ошибка операции'); }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">Управление заявками</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500">
          <option value="">Все статусы</option>
          <option value="new">Новые</option>
          <option value="assigned">Назначенные</option>
          <option value="in_progress">В работе</option>
          <option value="done">Завершенные</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50 text-slate-400 text-sm border-b border-slate-800">
              <th className="p-4 font-medium">ID / Клиент</th>
              <th className="p-4 font-medium">Проблема</th>
              <th className="p-4 font-medium">Статус</th>
              <th className="p-4 font-medium text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4">
                  <div className="text-slate-200 font-medium">#{req.id} {req.client_name}</div>
                  <div className="text-slate-500 text-sm mt-0.5">{req.phone}</div>
                </td>
                <td className="p-4 text-slate-300 text-sm max-w-xs truncate">{req.problem_text}</td>
                <td className="p-4"><StatusBadge status={req.status} /></td>
                <td className="p-4 text-right space-x-2">
                  {req.status === 'new' && (
                    <>
                      <button onClick={() => action('assign', req.id, '?master_id=1')} className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white border border-indigo-500/20 px-3 py-1.5 rounded-lg text-sm transition-colors">Мастер 1</button>
                      <button onClick={() => action('assign', req.id, '?master_id=2')} className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white border border-indigo-500/20 px-3 py-1.5 rounded-lg text-sm transition-colors">Мастер 2</button>
                      <button onClick={() => action('cancel', req.id)} className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 px-3 py-1.5 rounded-lg text-sm transition-colors">Отменить</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-500">Список заявок пуст</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}