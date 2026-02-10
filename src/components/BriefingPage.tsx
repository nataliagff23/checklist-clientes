import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Client } from '../lib/supabase';
import { BriefingForm } from './BriefingForm';
import { Loader2 } from 'lucide-react';

interface BriefingPageProps {
  clientId: string;
}

export function BriefingPage({ clientId }: BriefingPageProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()
      .then(({ data }) => {
        if (data) {
          setClient(data);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      });
  }, [clientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <img src="/logo.png" alt="Imperians Agency" className="h-16 w-auto mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-text mb-2">Enlace no válido</h1>
          <p className="text-gray-500">Este formulario de briefing no existe o fue eliminado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simplificado */}
      <header className="bg-brand shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-5 sm:px-6">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Imperians Agency" className="h-12 w-auto" />
            <div className="h-10 w-px bg-white/20" />
            <div>
              <h1 className="text-xl font-bold text-white">Briefing de Onboarding</h1>
              <p className="text-sm text-white/70">{client.business_name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <p className="text-sm text-gray-600">
            Hola <strong>{client.business_name}</strong>, por favor completa este formulario con la información de tu negocio.
            Esto nos ayudará a diseñar la mejor estrategia de marketing para ti.
          </p>
        </div>

        <BriefingForm client={client} />
      </div>
    </div>
  );
}
