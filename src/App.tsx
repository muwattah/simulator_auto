import { useState, useCallback } from 'react';
import Header from './components/Header';
import DetailingFlow from './components/DetailingFlow';
import AdminPanel from './components/AdminPanel';
import HomePage from './components/HomePage';

type View = 'home' | 'configurator';

function App() {
  const [view, setView] = useState<View>('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const goHome = useCallback(() => { setView('home'); window.scrollTo(0, 0); }, []);
  const goConfigurator = useCallback(() => { setView('configurator'); window.scrollTo(0, 0); }, []);

  if (showAdmin) return <AdminPanel onClose={() => setShowAdmin(false)} />;
  if (view === 'home') return <HomePage onStart={goConfigurator} />;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header onAdminClick={() => setShowAdmin(true)} onBackHome={goHome} />
      <main className="flex-1"><DetailingFlow /></main>
    </div>
  );
}
export default App;
