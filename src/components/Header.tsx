export function Header() {
  return (
    <header className="bg-brand shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Imperians Agency" className="h-12 w-auto" />
          <div className="h-10 w-px bg-white/20" />
          <div>
            <h1 className="text-xl font-bold text-white">Checklist Clientes</h1>
            <p className="text-sm text-white/70">Gestión de onboarding y setup técnico</p>
          </div>
        </div>
      </div>
    </header>
  );
}
