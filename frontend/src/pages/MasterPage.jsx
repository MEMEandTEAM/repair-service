/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import toast from 'react-hot-toast';
import { CheckCircle, Play, Wrench } from 'lucide-react';

export default function MasterPage({ masterId }) {
    const [requests, setRequests] = useState([]);

    const fetchRequests = useCallback(async () => {
        try {
            const res = await api.get('/requests', { params: { assigned_to: masterId } });
            setRequests(res.data);
        } catch (e) { toast.error('Ошибка загрузки'); }
    }, [masterId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
        fetchRequests();
    }, [fetchRequests]);

    const handleTake = async (id) => {
        try {
            await api.post(`/requests/${id}/take`);
            toast.success('Заявка взята в работу!');
            fetchRequests();
        } catch (error) {
            if (error.response?.status === 409) toast.error('Заявка уже взята (Конфликт!)');
            else toast.error('Ошибка');
        }
    };

    const handleComplete = async (id) => {
        try {
            await api.patch(`/requests/${id}/complete`);
            toast.success('Работа завершена!');
            fetchRequests();
        } catch (e) { toast.error('Ошибка'); }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Ваши задачи</h2>
                <p className="text-slate-400 mt-1">Панель управления мастера (ID: {masterId})</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {requests.map((req) => (
                    <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg hover:border-slate-700 transition-colors flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-lg font-bold text-white">#{req.id}</span>
                            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${req.status === 'assigned' ? 'bg-amber-500/10 text-amber-400' :
                                    req.status === 'in_progress' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                {req.status === 'assigned' ? 'Ожидает' : req.status === 'in_progress' ? 'В работе' : 'Готово'}
                            </span>
                        </div>

                        <div className="space-y-3 mb-6 flex-grow text-sm">
                            <div className="flex justify-between border-b border-slate-800/50 pb-2">
                                <span className="text-slate-500">Клиент</span>
                                <span className="text-slate-200 font-medium text-right">{req.client_name}<br /><span className="text-xs text-slate-400">{req.phone}</span></span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800/50 pb-2">
                                <span className="text-slate-500">Адрес</span>
                                <span className="text-slate-200 text-right max-w-[150px] truncate" title={req.address}>{req.address}</span>
                            </div>
                            <div className="pt-2">
                                <span className="text-slate-500 block mb-1">Описание:</span>
                                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300">
                                    {req.problem_text}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-4">
                            {req.status === 'assigned' && (
                                <button onClick={() => handleTake(req.id)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                                    <Play className="w-4 h-4" /> Взять в работу
                                </button>
                            )}
                            {req.status === 'in_progress' && (
                                <button onClick={() => handleComplete(req.id)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                    <CheckCircle className="w-4 h-4" /> Завершить
                                </button>
                            )}
                            {req.status === 'done' && (
                                <div className="w-full bg-slate-950/50 text-slate-500 border border-slate-800 font-medium py-3 rounded-xl flex items-center justify-center gap-2">
                                    <CheckCircle className="w-4 h-4 opacity-50" /> Выполнено
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {requests.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-slate-900 border border-slate-800 border-dashed rounded-3xl">
                        <Wrench className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-400 text-lg">Нет назначенных заявок</p>
                    </div>
                )}
            </div>
        </div>
    );
}