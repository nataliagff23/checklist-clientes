import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Client, ChecklistTask } from '../lib/supabase';
import { BriefingForm } from './BriefingForm';
import {
  ArrowLeft,
  Building2,
  Mail,
  Globe,
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  Link,
  Check,
  Send,
} from 'lucide-react';

interface ClientProfileProps {
  client: Client;
  onBack: () => void;
}

type TabType = 'setup_tecnico' | 'onboarding' | 'briefing';

export function ClientProfile({ client, onBack }: ClientProfileProps) {
  const [tasks, setTasks] = useState<ChecklistTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('setup_tecnico');
  const [updating, setUpdating] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedBriefing, setCopiedBriefing] = useState(false);

  function copyClientLink() {
    const url = `${window.location.origin}${window.location.pathname}#/client/${client.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copyBriefingLink() {
    const url = `${window.location.origin}${window.location.pathname}#/briefing/${client.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedBriefing(true);
      setTimeout(() => setCopiedBriefing(false), 2000);
    });
  }

  useEffect(() => {
    fetchTasks();
  }, [client.id]);

  async function fetchTasks() {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('checklist_tasks')
        .select('*')
        .eq('client_id', client.id)
        .order('section_order', { ascending: true })
        .order('task_order', { ascending: true });

      if (fetchError) throw fetchError;
      setTasks(data || []);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las tareas.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleTask(task: ChecklistTask) {
    setUpdating(task.id);
    try {
      const { error: updateError } = await supabase
        .from('checklist_tasks')
        .update({ is_completed: !task.is_completed })
        .eq('id', task.id);

      if (updateError) throw updateError;

      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, is_completed: !t.is_completed } : t
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  }

  const filteredTasks = tasks.filter((t) => t.checklist_type === activeTab);

  const sections = [...new Set(filteredTasks.map((t) => t.section))];

  const completedCount = filteredTasks.filter((t) => t.is_completed).length;
  const totalCount = filteredTasks.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Volver al dashboard</span>
      </button>

      {/* Client info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="bg-brand p-4 rounded-xl">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-text">{client.business_name}</h2>
            {client.legal_name && (
              <p className="text-gray-500 mt-1">{client.legal_name}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-3">
              {client.admin_email && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{client.admin_email}</span>
                </div>
              )}
              {client.website && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Globe className="w-4 h-4" />
                  <span>{client.website}</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={copyClientLink}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              copied
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-brand-50 hover:text-brand hover:border-brand-light'
            }`}
            title="Copiar link del cliente"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copiado
              </>
            ) : (
              <>
                <Link className="w-4 h-4" />
                Copiar Link
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['setup_tecnico', 'onboarding'] as TabType[]).map((tab) => {
          const tabTasks = tasks.filter((t) => t.checklist_type === tab);
          const tabCompleted = tabTasks.filter((t) => t.is_completed).length;
          const tabProgress =
            tabTasks.length > 0
              ? Math.round((tabCompleted / tabTasks.length) * 100)
              : 0;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-brand text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-light hover:text-brand'
              }`}
            >
              {tab === 'setup_tecnico' ? 'Setup Técnico' : 'Onboarding'}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {tabProgress}%
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setActiveTab('briefing')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'briefing'
              ? 'bg-gold text-white shadow-md'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-gold hover:text-gold-dark'
          }`}
        >
          Briefing
        </button>
        <button
          onClick={copyBriefingLink}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ml-auto ${
            copiedBriefing
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-gold/10 text-gold-dark border border-gold/30 hover:bg-gold/20'
          }`}
          title="Copiar link del briefing para enviar al cliente"
        >
          {copiedBriefing ? (
            <>
              <Check className="w-4 h-4" />
              Link copiado
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Enviar Briefing
            </>
          )}
        </button>
      </div>

      {activeTab === 'briefing' ? (
        <BriefingForm client={client} />
      ) : (
        <>
          {/* Progress bar */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progreso: {completedCount} de {totalCount} tareas completadas
              </span>
              <span
                className={`text-sm font-bold ${
                  progress === 100 ? 'text-green-600' : 'text-brand-700'
                }`}
              >
                {progress}%
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progress === 100
                    ? 'bg-green-500'
                    : 'bg-brand'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Tasks */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sections.map((section) => {
                const sectionTasks = filteredTasks.filter((t) => t.section === section);
                const sectionCompleted = sectionTasks.filter((t) => t.is_completed).length;

                return (
                  <div key={section} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-semibold text-text">{section}</h3>
                      <span className="text-xs text-gray-500">
                        {sectionCompleted}/{sectionTasks.length}
                      </span>
                    </div>
                    <ul className="divide-y divide-gray-50">
                      {sectionTasks.map((task) => (
                        <li key={task.id}>
                          <button
                            onClick={() => toggleTask(task)}
                            disabled={updating === task.id}
                            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-brand-50 transition-colors text-left disabled:opacity-60"
                          >
                            {updating === task.id ? (
                              <Loader2 className="w-5 h-5 text-brand animate-spin flex-shrink-0" />
                            ) : task.is_completed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                            )}
                            <span
                              className={`text-sm ${
                                task.is_completed
                                  ? 'line-through text-gray-400'
                                  : 'text-gray-700'
                              }`}
                            >
                              {task.task_name}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
