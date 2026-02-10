import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Client } from '../lib/supabase';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';

interface BriefingFormProps {
  client: Client;
}

const EMPTY_BRIEFING: Record<string, unknown> = {
  // 1. Información General
  nombre_agencia: '',
  nombre_agente: '',
  cargo_agente: '',
  tipo_agente: '',
  licencias: [] as string[],
  estados_venta: '',
  anos_experiencia: '',
  sitio_web_redes: '',

  // 2. Objetivos
  objetivo_principal: [] as string[],
  tipo_cliente_prioridad: [] as string[],
  expectativa_ads: [] as string[],

  // 3. Audiencia
  edad_ideal: '',
  idioma_ideal: '',
  ubicacion_ideal: '',
  estatus_migratorio: '',
  nivel_ingresos: '',
  tipo_empleo: '',
  problema_principal: [] as string[],
  segmentos: [] as string[],

  // 4. Productos
  seguros_actuales: '',
  producto_estrella: '',
  propuesta_valor: '',
  diferencial: '',

  // 5. Proceso Comercial
  proceso_lead: [] as string[],
  tiempo_contacto: '',
  responsable_seguimiento: '',
  leads_por_venta: '',

  // 6. Canales y Experiencia
  canales_anteriores: [] as string[],
  ha_invertido_ads: '',
  que_funciono: '',
  que_no_funciono: '',
  mayor_problema: '',

  // 7. Métricas
  cpl_historico: '',
  costo_por_venta: '',
  valor_promedio_venta: '',
  clv_aproximado: '',
  presupuesto_mensual: '',
  dispuesto_escalar: '',

  // 8. Contenido
  tipo_contenido: [] as string[],
  material_disponible: [] as string[],
  dispuesto_grabar: '',

  // 9. Expectativas
  expectativa_imperians: '',
  campana_exitosa: [] as string[],
  frecuencia_reportes: '',

  // 10. Restricciones
  mensajes_prohibidos: '',
  regulaciones: '',
  no_comunicar: '',
};

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none resize-y"
      />
    </div>
  );
}

function CheckboxGroup({ label, options, selected, onChange }: { label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  function toggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  }
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => toggle(option)}
              className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}

function RadioGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="radio"
              checked={value === option}
              onChange={() => onChange(option)}
              className="w-4 h-4 border-gray-300 text-brand focus:ring-brand"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}

function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
        <h3 className="font-semibold text-text">{number}. {title}</h3>
      </div>
      <div className="p-6 space-y-4">
        {children}
      </div>
    </div>
  );
}

export function BriefingForm({ client }: BriefingFormProps) {
  const [data, setData] = useState<Record<string, unknown>>({ ...EMPTY_BRIEFING });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [briefingId, setBriefingId] = useState<string | null>(null);

  useEffect(() => {
    loadBriefing();
  }, [client.id]);

  async function loadBriefing() {
    setLoading(true);
    const { data: briefing } = await supabase
      .from('client_briefings')
      .select('*')
      .eq('client_id', client.id)
      .single();

    if (briefing) {
      setBriefingId(briefing.id);
      setData({ ...EMPTY_BRIEFING, ...briefing.data });
    }
    setLoading(false);
  }

  async function saveBriefing() {
    setSaving(true);
    setSaved(false);

    if (briefingId) {
      await supabase
        .from('client_briefings')
        .update({ data })
        .eq('id', briefingId);
    } else {
      const { data: newBriefing } = await supabase
        .from('client_briefings')
        .insert([{ client_id: client.id, data }])
        .select()
        .single();
      if (newBriefing) setBriefingId(newBriefing.id);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function set(key: string, value: unknown) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function str(key: string): string {
    return (data[key] as string) || '';
  }

  function arr(key: string): string[] {
    return (data[key] as string[]) || [];
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text">Briefing de Onboarding – Agentes de Seguros (ADS)</h2>
        <button
          onClick={saveBriefing}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            saved
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-brand text-white hover:bg-brand-dark shadow-md'
          }`}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar Briefing'}
        </button>
      </div>

      <Section number={1} title="Información General del Cliente">
        <TextInput label="Nombre de la agencia / marca personal" value={str('nombre_agencia')} onChange={(v) => set('nombre_agencia', v)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput label="Nombre del agente principal" value={str('nombre_agente')} onChange={(v) => set('nombre_agente', v)} />
          <TextInput label="Cargo" value={str('cargo_agente')} onChange={(v) => set('cargo_agente', v)} />
        </div>
        <TextInput label="Tipo de agente" value={str('tipo_agente')} onChange={(v) => set('tipo_agente', v)} />
        <CheckboxGroup
          label="Licencias que posee"
          options={['Vida', 'Salud', 'ACA', 'Medicare', 'Auto', 'Hogar', 'Comercial', 'IUL', 'Annuities']}
          selected={arr('licencias')}
          onChange={(v) => set('licencias', v)}
        />
        <TextArea label="Estados donde puede vender legalmente" value={str('estados_venta')} onChange={(v) => set('estados_venta', v)} />
        <TextInput label="Años de experiencia en seguros" value={str('anos_experiencia')} onChange={(v) => set('anos_experiencia', v)} />
        <TextArea label="Sitio web y redes sociales activas" value={str('sitio_web_redes')} onChange={(v) => set('sitio_web_redes', v)} placeholder="Instagram, Facebook, TikTok, WhatsApp, página web, landing page" />
      </Section>

      <Section number={2} title="Objetivos del Negocio y del Marketing (3–6 meses)">
        <CheckboxGroup
          label="¿Cuál es el objetivo principal del negocio en este momento?"
          options={['Generar más clientes', 'Reclutar agentes', 'Ambos']}
          selected={arr('objetivo_principal')}
          onChange={(v) => set('objetivo_principal', v)}
        />
        <CheckboxGroup
          label="¿Qué tipo de cliente es prioridad hoy?"
          options={['Leads nuevos', 'Clientes recurrentes', 'Cross-selling / Upselling']}
          selected={arr('tipo_cliente_prioridad')}
          onChange={(v) => set('tipo_cliente_prioridad', v)}
        />
        <CheckboxGroup
          label="¿Qué esperas específicamente de las campañas de ADS?"
          options={['Volumen de leads', 'Mejor calidad de leads', 'Reducir costo por lead (CPL)', 'Aumentar citas calificadas', 'Escalar ventas']}
          selected={arr('expectativa_ads')}
          onChange={(v) => set('expectativa_ads', v)}
        />
      </Section>

      <Section number={3} title="Audiencia Objetivo (Buyer Persona)">
        <p className="text-sm text-gray-500 -mt-1">Describe a tu cliente ideal:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput label="Edad" value={str('edad_ideal')} onChange={(v) => set('edad_ideal', v)} />
          <TextInput label="Idioma" value={str('idioma_ideal')} onChange={(v) => set('idioma_ideal', v)} />
          <TextInput label="Ubicación" value={str('ubicacion_ideal')} onChange={(v) => set('ubicacion_ideal', v)} />
          <TextInput label="Estatus migratorio (si aplica)" value={str('estatus_migratorio')} onChange={(v) => set('estatus_migratorio', v)} />
          <TextInput label="Nivel de ingresos aproximado" value={str('nivel_ingresos')} onChange={(v) => set('nivel_ingresos', v)} />
          <TextInput label="Tipo de empleo (W2, self-employed, contractor)" value={str('tipo_empleo')} onChange={(v) => set('tipo_empleo', v)} />
        </div>
        <CheckboxGroup
          label="¿Qué problema principal tiene esa persona?"
          options={['Falta de seguro', 'Seguro muy costoso', 'No entiende sus opciones', 'Miedo a ser rechazado']}
          selected={arr('problema_principal')}
          onChange={(v) => set('problema_principal', v)}
        />
        <CheckboxGroup
          label="¿Qué segmentos manejas o deseas atacar?"
          options={['Familias', 'Migrantes', 'Self-employed', 'Seniors', 'Latinos', 'Emprendedores', 'Agentes nuevos (si reclutamiento)']}
          selected={arr('segmentos')}
          onChange={(v) => set('segmentos', v)}
        />
      </Section>

      <Section number={4} title="Productos y Servicios">
        <TextArea label="¿Qué seguros vendes actualmente? (Detallar cada uno)" value={str('seguros_actuales')} onChange={(v) => set('seguros_actuales', v)} />
        <TextInput label="¿Cuál es tu producto estrella?" value={str('producto_estrella')} onChange={(v) => set('producto_estrella', v)} />
        <TextArea label="¿Cuál es tu propuesta de valor principal?" value={str('propuesta_valor')} onChange={(v) => set('propuesta_valor', v)} placeholder="Ej: asesoría personalizada, procesos simples, atención en español, acompañamiento continuo" />
        <TextArea label="¿Qué te diferencia realmente de otros agentes?" value={str('diferencial')} onChange={(v) => set('diferencial', v)} placeholder="No precios genéricos, sino diferenciales reales" />
      </Section>

      <Section number={5} title="Proceso Comercial">
        <CheckboxGroup
          label="¿Cómo es hoy el proceso desde que entra un lead hasta que se vende?"
          options={['Llamada', 'WhatsApp', 'Zoom', 'Presencial']}
          selected={arr('proceso_lead')}
          onChange={(v) => set('proceso_lead', v)}
        />
        <TextInput label="¿En cuánto tiempo sueles contactar un lead nuevo?" value={str('tiempo_contacto')} onChange={(v) => set('tiempo_contacto', v)} />
        <TextInput label="¿Quién se encarga del seguimiento?" value={str('responsable_seguimiento')} onChange={(v) => set('responsable_seguimiento', v)} />
        <TextInput label="¿Cuántos leads necesitas para cerrar 1 venta (aprox.)?" value={str('leads_por_venta')} onChange={(v) => set('leads_por_venta', v)} />
      </Section>

      <Section number={6} title="Canales y Experiencia en ADS">
        <CheckboxGroup
          label="¿Qué canales has usado anteriormente?"
          options={['Meta Ads', 'Google Ads', 'WhatsApp Ads', 'Orgánico']}
          selected={arr('canales_anteriores')}
          onChange={(v) => set('canales_anteriores', v)}
        />
        <RadioGroup
          label="¿Has invertido antes en publicidad paga?"
          options={['Sí', 'No']}
          value={str('ha_invertido_ads')}
          onChange={(v) => set('ha_invertido_ads', v)}
        />
        {str('ha_invertido_ads') === 'Sí' && (
          <>
            <TextArea label="¿Qué funcionó bien?" value={str('que_funciono')} onChange={(v) => set('que_funciono', v)} />
            <TextArea label="¿Qué no funcionó?" value={str('que_no_funciono')} onChange={(v) => set('que_no_funciono', v)} />
            <TextArea label="¿Cuál fue el mayor problema?" value={str('mayor_problema')} onChange={(v) => set('mayor_problema', v)} placeholder="Leads fríos, leads falsos, poco seguimiento, alto costo, etc." />
          </>
        )}
      </Section>

      <Section number={7} title="Métricas y Presupuesto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput label="CPL promedio histórico (si lo conoce)" value={str('cpl_historico')} onChange={(v) => set('cpl_historico', v)} />
          <TextInput label="Costo por venta estimado" value={str('costo_por_venta')} onChange={(v) => set('costo_por_venta', v)} />
          <TextInput label="Valor promedio de una venta" value={str('valor_promedio_venta')} onChange={(v) => set('valor_promedio_venta', v)} />
          <TextInput label="Valor de vida del cliente (CLV) aproximado" value={str('clv_aproximado')} onChange={(v) => set('clv_aproximado', v)} />
        </div>
        <TextInput label="Presupuesto mensual disponible para ADS" value={str('presupuesto_mensual')} onChange={(v) => set('presupuesto_mensual', v)} />
        <RadioGroup
          label="¿Estás dispuesto a escalar inversión si la campaña funciona?"
          options={['Sí', 'No', 'Depende de los resultados']}
          value={str('dispuesto_escalar')}
          onChange={(v) => set('dispuesto_escalar', v)}
        />
      </Section>

      <Section number={8} title="Contenido y Creatividad">
        <CheckboxGroup
          label="¿Qué tipo de contenido te ha funcionado mejor?"
          options={['Testimonios', 'Videos hablando a cámara', 'Educativo', 'Promocional']}
          selected={arr('tipo_contenido')}
          onChange={(v) => set('tipo_contenido', v)}
        />
        <CheckboxGroup
          label="¿Cuentas con material disponible?"
          options={['Videos', 'Fotos profesionales', 'Logo / branding']}
          selected={arr('material_disponible')}
          onChange={(v) => set('material_disponible', v)}
        />
        <RadioGroup
          label="¿Estás dispuesto/a a grabar videos cortos si es necesario?"
          options={['Sí', 'No', 'Tal vez']}
          value={str('dispuesto_grabar')}
          onChange={(v) => set('dispuesto_grabar', v)}
        />
      </Section>

      <Section number={9} title="Expectativas con la Agencia">
        <TextArea label="¿Qué esperas específicamente de Imperians?" value={str('expectativa_imperians')} onChange={(v) => set('expectativa_imperians', v)} />
        <CheckboxGroup
          label="¿Cómo definirías una campaña exitosa?"
          options={['Leads', 'Ventas', 'Citas', 'Retorno de inversión']}
          selected={arr('campana_exitosa')}
          onChange={(v) => set('campana_exitosa', v)}
        />
        <TextInput label="¿Cada cuánto te gustaría recibir reportes?" value={str('frecuencia_reportes')} onChange={(v) => set('frecuencia_reportes', v)} />
      </Section>

      <Section number={10} title="Restricciones y Consideraciones">
        <TextArea label="¿Hay mensajes, promesas o temas que NO deseas usar?" value={str('mensajes_prohibidos')} onChange={(v) => set('mensajes_prohibidos', v)} />
        <TextArea label="¿Existen regulaciones de la aseguradora que debamos respetar?" value={str('regulaciones')} onChange={(v) => set('regulaciones', v)} />
        <TextArea label="¿Algo que nunca debería comunicarse en anuncios?" value={str('no_comunicar')} onChange={(v) => set('no_comunicar', v)} />
      </Section>

      <div className="flex justify-end pb-4">
        <button
          onClick={saveBriefing}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            saved
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-brand text-white hover:bg-brand-dark shadow-md'
          }`}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar Briefing'}
        </button>
      </div>
    </div>
  );
}
