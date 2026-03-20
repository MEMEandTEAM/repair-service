/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { api } from '../api';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';

export default function ClientPage() {
  const [formData, setFormData] = useState({ client_name: '', phone: '', address: '', problem_text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/requests', formData);
      toast.success('Заявка успешно отправлена!');
      setFormData({ client_name: '', phone: '', address: '', problem_text: '' });
    } catch (error) {
      toast.error('Не удалось отправить заявку');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Оставьте заявку</h1>
        <p className="text-slate-400">Наши специалисты свяжутся с вами в течение 30 минут</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Ваше имя</label>
              <input required type="text" name="client_name" value={formData.client_name} onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600" placeholder="Иван Иванов" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Телефон</label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600" placeholder="+7 (999) 000-00-00" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Адрес</label>
            <input required type="text" name="address" value={formData.address} onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600" placeholder="г. Москва, ул. Пушкина, д. 10" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Опишите проблему</label>
            <textarea required name="problem_text" value={formData.problem_text} onChange={handleChange} rows={4}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-y placeholder-slate-600" placeholder="Сломался холодильник, не морозит..." />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed">
            <Send className="w-5 h-5" />
            {loading ? 'Отправляем...' : 'Отправить заявку'}
          </button>
        </form>
      </div>
    </div>
  );
}