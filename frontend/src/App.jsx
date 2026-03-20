import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import ClientPage from './pages/ClientPage';
import DispatcherPage from './pages/DispatcherPage';
import MasterPage from './pages/MasterPage';
import { User, ClipboardList, Wrench } from 'lucide-react';

function App() {
  const [role, setRole] = useState('client');

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
        <nav className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Wrench className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Ремонт<span className="text-indigo-400">Сервис</span></span>
            </div>

            <div className="flex items-center gap-8">
              {role === 'client' && (
                <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors font-medium">
                  <ClipboardList className="w-4 h-4" /> Новая заявка
                </Link>
              )}
              {role === 'dispatcher' && (
                <Link to="/dispatcher" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors font-medium">
                  <User className="w-4 h-4" /> Диспетчерская
                </Link>
              )}
              {role === 'master' && (
                <Link to="/master" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors font-medium">
                  <Wrench className="w-4 h-4" /> Мои задачи
                </Link>
              )}

              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl px-2 py-1 shadow-inner">
                <span className="text-xs text-slate-500 font-medium pl-2">Роль:</span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-transparent border-none text-slate-300 text-sm focus:outline-none focus:ring-0 cursor-pointer py-1 pr-2"
                >
                  <option value="client" className="bg-slate-900">Клиент</option>
                  <option value="dispatcher" className="bg-slate-900">Диспетчер Анна</option>
                  <option value="master" className="bg-slate-900">Мастер Иван (ID: 1)</option>
                </select>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-10">
          <Routes>
            <Route path="/" element={<ClientPage />} />
            <Route path="/dispatcher" element={<DispatcherPage />} />
            <Route path="/master" element={<MasterPage masterId={1} />} />
          </Routes>
        </main>

        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' }
          }} 
        />
      </div>
    </BrowserRouter>
  );
}

export default App;