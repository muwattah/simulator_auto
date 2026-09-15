import { useConfiguratorStore } from './store/configuratorStore';
import Header from './components/Header';
import VehicleSelector from './components/VehicleSelector';
import ProfessionSelector from './components/ProfessionSelector';
import Configurator from './components/Configurator';
import QuoteForm from './components/QuoteForm';
import AdminPanel from './components/AdminPanel';
import { useState } from 'react';

function App() {
  const step = useConfiguratorStore((s) => s.step);
  const [showAdmin, setShowAdmin] = useState(false);

  if (showAdmin) {
    return <AdminPanel onClose={() => setShowAdmin(false)} />;
  }

  return (
    <div className="min-h-screen bg-industrial-50 flex flex-col">
      <Header onAdminClick={() => setShowAdmin(true)} />
      <main className="flex-1">
        {step === 'vehicle' && <VehicleSelector />}
        {step === 'profession' && <ProfessionSelector />}
        {step === 'configurator' && <Configurator />}
        {step === 'quote' && <QuoteForm />}
      </main>
      <footer className="bg-industrial-900 text-industrial-300 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p className="font-semibold text-white mb-1">Bedrijfswagen Inrichting Configurator</p>
          <p>Demo versie · Prijzen zijn indicatief · Excl. eventuele transportkosten</p>
          <p className="mt-2 text-xs">© {new Date().getFullYear()} · Professionele bedrijfswageninrichtingen</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
