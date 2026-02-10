import { useState } from 'react';
import type { Client } from '../lib/supabase';
import { Building2, Mail, Globe, ChevronRight, Trash2, Link, Check } from 'lucide-react';

interface ClientCardProps {
  client: Client;
  onSelect: (client: Client) => void;
  onDelete: (clientId: string) => void;
  setupProgress: number;
  onboardingProgress: number;
}

export function ClientCard({
  client,
  onSelect,
  onDelete,
  setupProgress,
  onboardingProgress,
}: ClientCardProps) {
  const [copied, setCopied] = useState(false);

  function copyLink(e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#/client/${client.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      onClick={() => onSelect(client)}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-brand-light transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-brand p-3 rounded-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text group-hover:text-brand transition-colors">
              {client.business_name}
            </h3>
            {client.legal_name && (
              <p className="text-sm text-gray-500">{client.legal_name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={copyLink}
            className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
              copied ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-brand hover:bg-brand-50'
            }`}
            title={copied ? 'Link copiado' : 'Copiar link'}
          >
            {copied ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`¿Eliminar a "${client.business_name}"? Se borrarán todas sus tareas.`)) {
                onDelete(client.id);
              }
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
            title="Eliminar cliente"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {client.admin_email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{client.admin_email}</span>
          </div>
        )}
        {client.website && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Globe className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{client.website}</span>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">Setup Técnico</span>
            <span className="text-xs font-bold text-brand-700">{setupProgress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-300"
              style={{ width: `${setupProgress}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">Onboarding</span>
            <span className="text-xs font-bold text-gold-dark">{onboardingProgress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-300"
              style={{ width: `${onboardingProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
