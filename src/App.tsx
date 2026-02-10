import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import type { Client } from './lib/supabase';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ClientProfile } from './components/ClientProfile';
import { BriefingPage } from './components/BriefingPage';
import './index.css';

function parseHash(): { type: 'client' | 'briefing' | null; id: string | null } {
  const hash = window.location.hash;
  const clientMatch = hash.match(/^#\/client\/(.+)$/);
  if (clientMatch) return { type: 'client', id: clientMatch[1] };

  const briefingMatch = hash.match(/^#\/briefing\/(.+)$/);
  if (briefingMatch) return { type: 'briefing', id: briefingMatch[1] };

  return { type: null, id: null };
}

function App() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [briefingClientId, setBriefingClientId] = useState<string | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);

  useEffect(() => {
    const { type, id } = parseHash();
    if (type === 'briefing' && id) {
      setBriefingClientId(id);
      setLoadingClient(false);
    } else if (type === 'client' && id) {
      supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) setSelectedClient(data);
          setLoadingClient(false);
        });
    } else {
      setLoadingClient(false);
    }

    function onHashChange() {
      const parsed = parseHash();
      if (parsed.type === 'briefing' && parsed.id) {
        setBriefingClientId(parsed.id);
        setSelectedClient(null);
      } else if (!parsed.type) {
        setSelectedClient(null);
        setBriefingClientId(null);
      }
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function selectClient(client: Client) {
    setSelectedClient(client);
    setBriefingClientId(null);
    window.location.hash = `/client/${client.id}`;
  }

  function goBack() {
    setSelectedClient(null);
    window.location.hash = '';
  }

  if (loadingClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Página pública de briefing (sin dashboard ni header completo)
  if (briefingClientId) {
    return <BriefingPage clientId={briefingClientId} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {selectedClient ? (
          <ClientProfile
            client={selectedClient}
            onBack={goBack}
          />
        ) : (
          <Dashboard onClientSelect={selectClient} />
        )}
      </div>
    </div>
  );
}

export default App;
