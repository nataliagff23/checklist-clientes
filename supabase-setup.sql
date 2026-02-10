-- ============================================
-- 0. BORRAR TABLAS EXISTENTES
-- ============================================
drop table if exists checklist_tasks cascade;
drop table if exists task_templates cascade;
drop table if exists clients cascade;
drop function if exists update_updated_at cascade;

-- ============================================
-- 1. TABLA: clients
-- ============================================
create table clients (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  legal_name text,
  business_manager_id text,
  admin_email text,
  website text,
  industry text,
  country text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- 2. TABLA: task_templates
-- (plantillas que se copian a cada cliente nuevo)
-- ============================================
create table task_templates (
  id uuid primary key default gen_random_uuid(),
  checklist_type text not null check (checklist_type in ('setup_tecnico', 'onboarding')),
  section text not null,
  task_name text not null,
  task_order int not null,
  section_order int not null
);

-- ============================================
-- 3. TABLA: checklist_tasks
-- (tareas asignadas a cada cliente)
-- ============================================
create table checklist_tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  checklist_type text not null check (checklist_type in ('setup_tecnico', 'onboarding')),
  section text not null,
  task_name text not null,
  is_completed boolean default false,
  task_order int not null,
  section_order int not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índice para buscar tareas por cliente rápidamente
create index idx_checklist_tasks_client_id on checklist_tasks(client_id);

-- ============================================
-- 4. Trigger para actualizar updated_at automáticamente
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_updated_at
  before update on clients
  for each row execute function update_updated_at();

create trigger checklist_tasks_updated_at
  before update on checklist_tasks
  for each row execute function update_updated_at();

-- ============================================
-- 5. Row Level Security (RLS)
-- Habilitamos RLS y permitimos todo con la anon key
-- (ajusta esto si necesitas auth más adelante)
-- ============================================
alter table clients enable row level security;
alter table task_templates enable row level security;
alter table checklist_tasks enable row level security;

create policy "Allow all on clients" on clients
  for all using (true) with check (true);

create policy "Allow all on task_templates" on task_templates
  for all using (true) with check (true);

create policy "Allow all on checklist_tasks" on checklist_tasks
  for all using (true) with check (true);

-- ============================================
-- 6. DATOS INICIALES: task_templates
-- Estas son las tareas que se crean para cada cliente nuevo.
-- Puedes modificar/agregar las que necesites.
-- ============================================

-- === SETUP TÉCNICO (Meta Ads) ===
insert into task_templates (checklist_type, section, task_name, section_order, task_order) values
  -- Sección 1: Infraestructura de Tracking
  ('setup_tecnico', 'Infraestructura de Tracking', 'Instalación y verificación correcta del Pixel de Meta', 1, 1),
  ('setup_tecnico', 'Infraestructura de Tracking', 'Configuración de eventos estándar y personalizados', 1, 2),
  ('setup_tecnico', 'Infraestructura de Tracking', 'Revisión y orden de Aggregated Events Measurement (AEM)', 1, 3),
  ('setup_tecnico', 'Infraestructura de Tracking', 'Validación de eventos prioritarios según objetivo de campaña', 1, 4),
  ('setup_tecnico', 'Infraestructura de Tracking', 'Pruebas de disparo de eventos mediante Test Events', 1, 5),
  -- Sección 2: Revisión del Business Manager (BM)
  ('setup_tecnico', 'Revisión del Business Manager (BM)', 'Verificación del Business Manager', 2, 1),
  ('setup_tecnico', 'Revisión del Business Manager (BM)', 'Cuentas publicitarias creadas y correctamente asignadas', 2, 2),
  ('setup_tecnico', 'Revisión del Business Manager (BM)', 'Revisión del account score e historial publicitario', 2, 3),
  ('setup_tecnico', 'Revisión del Business Manager (BM)', 'Fanpage conectada y sin restricciones activas', 2, 4),
  ('setup_tecnico', 'Revisión del Business Manager (BM)', 'Cuenta de Instagram vinculada y revisión de posibles limitaciones', 2, 5),
  ('setup_tecnico', 'Revisión del Business Manager (BM)', 'Revisión de anuncios rechazados, advertencias o políticas sensibles', 2, 6),
  ('setup_tecnico', 'Revisión del Business Manager (BM)', 'Personas, roles y permisos correctamente asignados', 2, 7),
  ('setup_tecnico', 'Revisión del Business Manager (BM)', 'Socios y aplicaciones conectadas (auditoría de accesos)', 2, 8),
  ('setup_tecnico', 'Revisión del Business Manager (BM)', 'Método de pago verificado y tarjeta activa', 2, 9),
  -- Sección 3: Integraciones y Automatizaciones
  ('setup_tecnico', 'Integraciones y Automatizaciones', 'Conexión del CRM y verificación de recepción de leads', 3, 1),
  ('setup_tecnico', 'Integraciones y Automatizaciones', 'Validación del flujo completo: Anuncio → Formulario / Landing → CRM', 3, 2),
  ('setup_tecnico', 'Integraciones y Automatizaciones', 'Configuración y prueba de Conversion API (CAPI)', 3, 3),
  -- Sección 4: Canales Conversacionales
  ('setup_tecnico', 'Canales Conversacionales', 'Conexión de WhatsApp Business', 4, 1),
  ('setup_tecnico', 'Canales Conversacionales', 'Configuración de flujos automatizados en ManyChat', 4, 2),
  ('setup_tecnico', 'Canales Conversacionales', 'Pruebas de respuestas automáticas y etiquetas', 4, 3),
  ('setup_tecnico', 'Canales Conversacionales', 'Validación de entrega, seguimiento y asignación de leads', 4, 4),
  -- Sección 5: Dominio y Activos Web
  ('setup_tecnico', 'Dominio y Activos Web', 'Dominio verificado dentro del Business Manager', 5, 1),
  ('setup_tecnico', 'Dominio y Activos Web', 'Landing pages correctamente integradas con Pixel y CAPI', 5, 2),
  ('setup_tecnico', 'Dominio y Activos Web', 'Revisión de formularios y llamadas a la acción (CTA)', 5, 3),
  ('setup_tecnico', 'Dominio y Activos Web', 'Pruebas de conversión en desktop y mobile', 5, 4),
  -- Sección 6: Google Analytics
  ('setup_tecnico', 'Google Analytics', 'Creación de cuenta de Google Analytics', 6, 1),
  ('setup_tecnico', 'Google Analytics', 'Accesos otorgados al equipo', 6, 2),
  ('setup_tecnico', 'Google Analytics', 'Vinculación con sitio web / landing pages', 6, 3),
  ('setup_tecnico', 'Google Analytics', 'Verificación de eventos y tráfico activo', 6, 4),
  -- Sección 7: ManyChat
  ('setup_tecnico', 'ManyChat', 'Creación de cuenta de ManyChat', 7, 1),
  ('setup_tecnico', 'ManyChat', 'Activación de cuenta Premium', 7, 2),
  ('setup_tecnico', 'ManyChat', 'Generación y entrega del link de administrador', 7, 3),
  ('setup_tecnico', 'ManyChat', 'Conexión con Meta (Facebook / Instagram / WhatsApp)', 7, 4),
  -- Sección 8: Validación Final
  ('setup_tecnico', 'Validación Final', 'Test completo del ecosistema: Ads → Conversión → CRM → WhatsApp', 8, 1),
  ('setup_tecnico', 'Validación Final', 'Confirmación de que no existen bloqueos técnicos', 8, 2),
  ('setup_tecnico', 'Validación Final', 'Aprobación final para activación de campañas', 8, 3),

-- === ONBOARDING ===
  -- Sección 1: Datos del Negocio - Información Básica
  ('onboarding', 'Datos del Negocio - Información Básica', 'Nombre legal del negocio', 1, 1),
  ('onboarding', 'Datos del Negocio - Información Básica', 'Nombre comercial', 1, 2),
  ('onboarding', 'Datos del Negocio - Información Básica', 'Página web', 1, 3),
  ('onboarding', 'Datos del Negocio - Información Básica', 'Redes sociales (Facebook, Instagram, YouTube, TikTok, etc.)', 1, 4),
  ('onboarding', 'Datos del Negocio - Información Básica', 'Industria y país/ciudad donde opera', 1, 5),
  ('onboarding', 'Datos del Negocio - Información Básica', 'Horarios de atención', 1, 6),
  ('onboarding', 'Datos del Negocio - Información Básica', 'Información del producto/servicio', 1, 7),
  ('onboarding', 'Datos del Negocio - Información Básica', 'Base de precios o catálogo actualizado', 1, 8),
  ('onboarding', 'Datos del Negocio - Información Básica', 'Oferta actual o promociones activas', 1, 9),
  -- Sección 2: Accesos - Meta Ads
  ('onboarding', 'Accesos - Meta Ads', 'ID del Business Manager', 2, 1),
  ('onboarding', 'Accesos - Meta Ads', 'Correo administrador principal', 2, 2),
  ('onboarding', 'Accesos - Meta Ads', 'Agregar a la agencia como Partner con permisos completos', 2, 3),
  ('onboarding', 'Accesos - Meta Ads', 'Acceso a Cuenta publicitaria', 2, 4),
  ('onboarding', 'Accesos - Meta Ads', 'Acceso a Página de Facebook', 2, 5),
  ('onboarding', 'Accesos - Meta Ads', 'Acceso a Cuenta de Instagram', 2, 6),
  ('onboarding', 'Accesos - Meta Ads', 'Acceso a Pixel / Conversions API', 2, 7),
  ('onboarding', 'Accesos - Meta Ads', 'Acceso a Catálogo (si aplica)', 2, 8),
  ('onboarding', 'Accesos - Meta Ads', 'Acceso a Dominios verificados', 2, 9),
  ('onboarding', 'Accesos - Meta Ads', 'Acceso a Audiencias (todas)', 2, 10),
  -- Sección 3: Configuraciones Técnicas - Meta Ads
  ('onboarding', 'Configuraciones Técnicas - Meta Ads', 'Acceso de socio: 2634284923369958', 3, 1),
  ('onboarding', 'Configuraciones Técnicas - Meta Ads', 'Acceso a 1 correo corporativo como administrador', 3, 2),
  ('onboarding', 'Configuraciones Técnicas - Meta Ads', 'Verificación del dominio (si aplica)', 3, 3),
  ('onboarding', 'Configuraciones Técnicas - Meta Ads', 'Configurar y revisar el Pixel (si aplica)', 3, 4),
  ('onboarding', 'Configuraciones Técnicas - Meta Ads', 'Activar e instalar CAPI (Conversions API) (si aplica)', 3, 5),
  ('onboarding', 'Configuraciones Técnicas - Meta Ads', 'Agregar eventos estándar y personalizados', 3, 6),
  ('onboarding', 'Configuraciones Técnicas - Meta Ads', 'Revisar duplicidad de eventos', 3, 7),
  ('onboarding', 'Configuraciones Técnicas - Meta Ads', 'Crear Conversiones personalizadas (si aplica)', 3, 8),
  ('onboarding', 'Configuraciones Técnicas - Meta Ads', 'Configuración de AEM (8 eventos priorizados) (si aplica)', 3, 9),
  ('onboarding', 'Configuraciones Técnicas - Meta Ads', 'Revisar integraciones con CRM (Make, ManyChat, HubSpot, ClickUp, etc.)', 3, 10),
  ('onboarding', 'Configuraciones Técnicas - Meta Ads', 'Configuración de catálogos (ecommerce)', 3, 11),
  ('onboarding', 'Configuraciones Técnicas - Meta Ads', 'Revisión de activos de marca', 3, 12),
  -- Sección 4: Configuraciones Técnicas - Google Ads
  ('onboarding', 'Configuraciones Técnicas - Google Ads', 'Correo administrador (Gmail corporativo preferiblemente)', 4, 1),
  ('onboarding', 'Configuraciones Técnicas - Google Ads', 'ID de la cuenta de Google Ads', 4, 2),
  ('onboarding', 'Configuraciones Técnicas - Google Ads', 'Acceso al MCC de la agencia (ID: 317-247-7791)', 4, 3),
  ('onboarding', 'Configuraciones Técnicas - Google Ads', 'Acceso a Google Analytics 4 (si aplica)', 4, 4),
  ('onboarding', 'Configuraciones Técnicas - Google Ads', 'Acceso a Google Tag Manager (si aplica)', 4, 5),
  ('onboarding', 'Configuraciones Técnicas - Google Ads', 'Acceso a Google Merchant Center (si aplica)', 4, 6),
  ('onboarding', 'Configuraciones Técnicas - Google Ads', 'Acceso a Google Search Console (si aplica)', 4, 7),
  ('onboarding', 'Configuraciones Técnicas - Google Ads', 'Acceso a YouTube Channel como Editor', 4, 8),
  ('onboarding', 'Configuraciones Técnicas - Google Ads', 'Configurar campañas (estructura inicial)', 4, 9),
  ('onboarding', 'Configuraciones Técnicas - Google Ads', 'Vincular Google Ads a GA4', 4, 10),
  ('onboarding', 'Configuraciones Técnicas - Google Ads', 'Configurar Conversiones en GA4', 4, 11),
  ('onboarding', 'Configuraciones Técnicas - Google Ads', 'Importar conversiones a Google Ads', 4, 12),
  ('onboarding', 'Configuraciones Técnicas - Google Ads', 'Configurar Google Tag Manager', 4, 13),
  ('onboarding', 'Configuraciones Técnicas - Google Ads', 'Instalar tag de Conversiones', 4, 14),
  ('onboarding', 'Configuraciones Técnicas - Google Ads', 'Instalar tag de Remarketing', 4, 15),
  ('onboarding', 'Configuraciones Técnicas - Google Ads', 'Instalar tag de Eventos clave', 4, 16),
  ('onboarding', 'Configuraciones Técnicas - Google Ads', 'Configurar audiencias en GA4', 4, 17),
  ('onboarding', 'Configuraciones Técnicas - Google Ads', 'Subir feed a Merchant Center (si aplica)', 4, 18),
  ('onboarding', 'Configuraciones Técnicas - Google Ads', 'Verificar y corregir errores de Merchant Center', 4, 19),
  ('onboarding', 'Configuraciones Técnicas - Google Ads', 'Vincular Merchant Center con Google Ads', 4, 20),
  -- Sección 5: Materiales del Cliente - Creativos
  ('onboarding', 'Materiales del Cliente - Creativos', 'Fotos de producto/servicio', 5, 1),
  ('onboarding', 'Materiales del Cliente - Creativos', 'Videos cortos (UGC, testimonios, demos) (si aplica)', 5, 2),
  ('onboarding', 'Materiales del Cliente - Creativos', 'Branding (logo, paleta de colores, tipografías)', 5, 3),
  ('onboarding', 'Materiales del Cliente - Creativos', 'Manual de marca', 5, 4),
  ('onboarding', 'Materiales del Cliente - Creativos', 'Testimonios (si aplica)', 5, 5),
  ('onboarding', 'Materiales del Cliente - Creativos', 'Imagen del equipo y negocio (si aplica)', 5, 6),
  -- Sección 6: Materiales del Cliente - Información Comercial
  ('onboarding', 'Materiales del Cliente - Información Comercial', 'Oferta principal', 6, 1),
  ('onboarding', 'Materiales del Cliente - Información Comercial', 'Propuesta de valor', 6, 2),
  ('onboarding', 'Materiales del Cliente - Información Comercial', 'Segmentación inicial', 6, 3),
  ('onboarding', 'Materiales del Cliente - Información Comercial', 'FAQs', 6, 4),
  ('onboarding', 'Materiales del Cliente - Información Comercial', 'Objeciones comunes', 6, 5),
  ('onboarding', 'Materiales del Cliente - Información Comercial', 'Procesos de venta actuales', 6, 6),
  -- Sección 7: Objetivos + KPIs + Presupuesto
  ('onboarding', 'Objetivos + KPIs + Presupuesto', 'Definir objetivo principal (leads, ventas, tráfico, mensajes)', 7, 1),
  ('onboarding', 'Objetivos + KPIs + Presupuesto', 'Definir objetivos secundarios', 7, 2),
  ('onboarding', 'Objetivos + KPIs + Presupuesto', 'Definir métricas a seguir semanalmente', 7, 3),
  ('onboarding', 'Objetivos + KPIs + Presupuesto', 'Definir KPI crítico (CPL, CPA, ROAS, etc.)', 7, 4),
  ('onboarding', 'Objetivos + KPIs + Presupuesto', 'Cálculo de presupuesto mensual', 7, 5),
  ('onboarding', 'Objetivos + KPIs + Presupuesto', 'Cálculo de costo por resultado ideal', 7, 6),
  ('onboarding', 'Objetivos + KPIs + Presupuesto', 'Cálculo de proyección inicial', 7, 7),
  -- Sección 8: Flujos, Automatizaciones y CRM
  ('onboarding', 'Flujos, Automatizaciones y CRM', 'Herramienta utilizada (ManyChat, Make, HubSpot, etc.)', 8, 1),
  ('onboarding', 'Flujos, Automatizaciones y CRM', 'Crear/ajustar integración con Meta Ads', 8, 2),
  ('onboarding', 'Flujos, Automatizaciones y CRM', 'Revisar envío de leads en tiempo real', 8, 3),
  ('onboarding', 'Flujos, Automatizaciones y CRM', 'Crear flujos automáticos (seguimiento, nurturing, retargeting)', 8, 4),
  ('onboarding', 'Flujos, Automatizaciones y CRM', 'Crear pipeline de ventas', 8, 5),
  ('onboarding', 'Flujos, Automatizaciones y CRM', 'Conectar eventos del CRM con Ads (CAPI/Offline conversions)', 8, 6),
  ('onboarding', 'Flujos, Automatizaciones y CRM', 'Configurar reportes automáticos', 8, 7),
  -- Sección 9: Páginas de Destino / Funnel
  ('onboarding', 'Páginas de Destino / Funnel', 'Revisar landing page', 9, 1),
  ('onboarding', 'Páginas de Destino / Funnel', 'Verificar velocidad (PageSpeed)', 9, 2),
  ('onboarding', 'Páginas de Destino / Funnel', 'Revisar copy', 9, 3),
  ('onboarding', 'Páginas de Destino / Funnel', 'Verificar formularios', 9, 4),
  ('onboarding', 'Páginas de Destino / Funnel', 'Revisar thank you page', 9, 5),
  ('onboarding', 'Páginas de Destino / Funnel', 'Configurar tracking', 9, 6),
  ('onboarding', 'Páginas de Destino / Funnel', 'Revisar términos y políticas', 9, 7),
  ('onboarding', 'Páginas de Destino / Funnel', 'Revisar coherencia con oferta', 9, 8),
  -- Sección 10: Documentos Legales y Cumplimiento
  ('onboarding', 'Documentos Legales y Cumplimiento', 'Políticas de privacidad', 10, 1),
  ('onboarding', 'Documentos Legales y Cumplimiento', 'Términos y condiciones', 10, 2),
  ('onboarding', 'Documentos Legales y Cumplimiento', 'Política de cookies', 10, 3),
  ('onboarding', 'Documentos Legales y Cumplimiento', 'Avisos legales de Meta y Google', 10, 4),
  ('onboarding', 'Documentos Legales y Cumplimiento', 'Cumplimiento de normas del nicho (finanzas, autos, salud, seguros, etc.)', 10, 5),
  -- Sección 11: Dashboards y Reportes
  ('onboarding', 'Dashboards y Reportes', 'Crear dashboard en Google Looker Studio', 11, 1),
  ('onboarding', 'Dashboards y Reportes', 'Crear dashboard en Airtable', 11, 2),
  ('onboarding', 'Dashboards y Reportes', 'Crear dashboard en Spreadsheet', 11, 3),
  ('onboarding', 'Dashboards y Reportes', 'Reporte semanal', 11, 4),
  ('onboarding', 'Dashboards y Reportes', 'Reporte mensual', 11, 5),
  ('onboarding', 'Dashboards y Reportes', 'Indicadores clave: CPA, ROAS, CTR, CPL, frecuencia, etc.', 11, 6),
  ('onboarding', 'Dashboards y Reportes', 'Revisión de campañas con el cliente (quincenal/mensual)', 11, 7);
