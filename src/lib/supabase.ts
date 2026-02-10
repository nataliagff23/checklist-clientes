import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Client {
  id: string;
  business_name: string;
  legal_name: string | null;
  business_manager_id: string | null;
  admin_email: string | null;
  website: string | null;
  industry: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistTask {
  id: string;
  client_id: string;
  checklist_type: 'setup_tecnico' | 'onboarding';
  section: string;
  task_name: string;
  is_completed: boolean;
  task_order: number;
  section_order: number;
  created_at: string;
  updated_at: string;
}

export interface ClientBriefing {
  id: string;
  client_id: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export async function createClientWithTasks(
  clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>
) {
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert([clientData])
    .select()
    .single();

  if (clientError) throw clientError;

  const { data: templates, error: templatesError } = await supabase
    .from('task_templates')
    .select('*');

  if (templatesError) throw templatesError;

  const tasks = templates.map((template) => ({
    client_id: client.id,
    checklist_type: template.checklist_type,
    section: template.section,
    task_name: template.task_name,
    task_order: template.task_order,
    section_order: template.section_order,
    is_completed: false,
  }));

  const { error: tasksError } = await supabase
    .from('checklist_tasks')
    .insert(tasks);

  if (tasksError) throw tasksError;

  return client;
}
