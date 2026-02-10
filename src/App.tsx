import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import type { Client } from './lib/supabase';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ClientProfile } from './components/ClientProfile';
import './index.css';

function getClientIdFromHash(): string | null {
  const hash = window.location.hash;
  const match = hash.match(/^#\/client\/(.+)$/);
  return match ? match[1] : null;
}

function App() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);

  useEffect(() => {
    const clientId = getClientIdFromHash();
    if (clientId) {
      supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()
        .then(({ data }) => {
          if (data) setSelectedClient(data);
          setLoadingClient(false);
        });
    } else {
      setLoadingClient(false);
    }

    function onHashChange() {
      const id = getClientIdFromHash();
      if (!id) {
        setSelectedClient(null);
      }
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function selectClient(client: Client) {
    setSelectedClient(client);
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
