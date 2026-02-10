import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Client, ChecklistTask } from '../lib/supabase';
import { ClientCard } from './ClientCard';
import { AddClientModal } from './AddClientModal';
import { Plus, Users, Loader2, AlertCircle } from 'lucide-react';

interface DashboardProps {
  onClientSelect: (client: Client) => void;
}

export function Dashboard({ onClientSelect }: DashboardProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientProgress, setClientProgress] = useState<
    Record<string, { setup: number; onboarding: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  async function deleteClient(clientId: string) {
    try {
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (deleteError) throw deleteError;
      fetchClients();
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  }

  async function fetchClients() {
    try {
      setLoading(true);
      setError(null);

      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;
      setClients(clientsData || []);

      const { data: tasksData, error: tasksError } = await supabase
        .from('checklist_tasks')
        .select('client_id, checklist_type, is_completed');

      if (tasksError) throw tasksError;

      const progress: Record<string, { setup: number; onboarding: number }> = {};

      (clientsData || []).forEach((client) => {
        const clientTasks =
          (tasksData as ChecklistTask[])?.filter((t) => t.client_id === client.id) || [];
        const setupTasks = clientTasks.filter((t) => t.checklist_type === 'setup_tecnico');
        const onboardingTasks = clientTasks.filter((t) => t.checklist_type === 'onboarding');

        const setupCompleted = setupTasks.filter((t) => t.is_completed).length;
        const onboardingCompleted = onboardingTasks.filter((t) => t.is_completed).length;

        progress[client.id] = {
          setup:
            setupTasks.length > 0
              ? Math.round((setupCompleted / setupTasks.length) * 100)
              : 0,
          onboarding:
            onboardingTasks.length > 0
              ? Math.round((onboardingCompleted / onboardingTasks.length) * 100)
              : 0,
        };
      });

      setClientProgress(progress);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Error al cargar los clientes. Por favor, recarga la página.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-brand animate-spin mb-4" />
        <p className="text-gray-600 text-lg">Cargando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Clientes</h2>
          <p className="text-gray-600">Gestiona los checklists de tus clientes</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-dark transition-all font-medium shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Agregar Cliente
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay clientes aún</h3>
          <p className="text-gray-600 mb-6">Comienza agregando tu primer cliente</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-dark transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            Agregar Primer Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onSelect={onClientSelect}
              onDelete={deleteClient}
              setupProgress={clientProgress[client.id]?.setup || 0}
              onboardingProgress={clientProgress[client.id]?.onboarding || 0}
            />
          ))}
        </div>
      )}

      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onClientAdded={fetchClients}
      />
    </>
  );
}
