import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DEMO_MODE, DEMO_PROFILES, type DemoProfile } from "@/demo/demoData";
import { DemoLanding } from "@/demo/DemoLanding";
import { ChecklistProvider, useChecklist } from "@/demo/ChecklistContext";
import { ChecklistNav } from "@/demo/ChecklistNav";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { HomeADM } from "@/pages/adm/HomeADM";
import { HomeComissao } from "@/pages/comissao/HomeComissao";
import { HomeRespondente } from "@/pages/respondente/HomeRespondente";
import { HomePadrao } from "@/pages/padrao/HomePadrao";
import { QuestionarioProvider } from "@/context/QuestionarioContext";
import { Home } from "lucide-react";

// ─── Botão flutuante "Voltar ao início" ──────────────────────
interface BackHomeButtonProps {
  onClick: () => void;
}

function BackHomeButton({ onClick }: BackHomeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full bg-white border border-slate-200 shadow-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
    >
      <Home className="h-3.5 w-3.5" />
      Página inicial
    </button>
  );
}

// ─── Modo Demonstração ────────────────────────────────────────
function DemoInner({
  demoProfile,
  showingComissao,
  setShowingComissao,
  voltarAoInicio,
}: {
  demoProfile: DemoProfile;
  showingComissao: boolean;
  setShowingComissao: (v: boolean) => void;
  voltarAoInicio: () => void;
}) {
  const profile = DEMO_PROFILES[demoProfile];
  // extraímos só markVisited — função estável (useCallback) que não causa re-render loop
  const markVisited = useChecklist()?.markVisited;

  // Rastreia: abriu o painel da comissão
  useEffect(() => {
    if (showingComissao) markVisited?.("abrir-comissao");
  }, [showingComissao, markVisited]);

  // Professor vai direto para a comissão
  if (demoProfile === "professor-comissao") {
    return (
      <QuestionarioProvider userRole="comissao" userId={profile.id}>
        <HomeComissao
          userName={profile.name}
          onLogout={voltarAoInicio}
          onVoltar={undefined}
        />
      </QuestionarioProvider>
    );
  }

  if (showingComissao) {
    return (
      <QuestionarioProvider userRole="comissao" userId={profile.id}>
        <HomeComissao
          userName={profile.name}
          onLogout={voltarAoInicio}
          onVoltar={() => setShowingComissao(false)}
        />
      </QuestionarioProvider>
    );
  }

  return (
    <QuestionarioProvider userRole={profile.role} userId={profile.id}>
      <HomeRespondente
        userName={profile.name}
        userId={profile.id}
        userRole={profile.role}
        onLogout={voltarAoInicio}
        onAbrirComissao={profile.isComissao ? () => setShowingComissao(true) : undefined}
      />
    </QuestionarioProvider>
  );
}

function DemoApp() {
  const [demoProfile, setDemoProfile] = useState<DemoProfile | null>(null);
  const [showingComissao, setShowingComissao] = useState(false);

  function voltarAoInicio() {
    setDemoProfile(null);
    setShowingComissao(false);
  }

  if (!demoProfile) {
    return <DemoLanding onSelect={(p) => { setDemoProfile(p); setShowingComissao(false); }} />;
  }

  return (
    <ChecklistProvider profile={demoProfile}>
      <DemoInner
        demoProfile={demoProfile}
        showingComissao={showingComissao}
        setShowingComissao={setShowingComissao}
        voltarAoInicio={voltarAoInicio}
      />
      <ChecklistNav onGoHome={voltarAoInicio} />
      <BackHomeButton onClick={voltarAoInicio} />
    </ChecklistProvider>
  );
}

// ─── App principal ────────────────────────────────────────────
function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [authView, setAuthView] = useState<"login" | "register">("login");

  if (DEMO_MODE) return <DemoApp />;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <p className="text-slate-400 text-sm">Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    if (authView === "register") {
      return <RegisterPage onShowLogin={() => setAuthView("login")} />;
    }
    return <LoginPage onShowRegister={() => setAuthView("register")} />;
  }

  return (
    <QuestionarioProvider userRole={user.role} userId={user.id}>
      {user.role === "adm" && (
        <HomeADM onLogout={logout} userName={user.name} />
      )}
      {user.role === "comissao" && (
        <HomeComissao onLogout={logout} userName={user.name} />
      )}
      {user.role === "respondente" && (
        <HomeRespondente
          onLogout={logout}
          userName={user.name}
          userId={user.id}
          userRole={user.role}
        />
      )}
      {user.role === "padrao" && (
        <HomePadrao
          onLogout={logout}
          userName={user.name}
          userId={user.id}
          userRole={user.role}
        />
      )}
    </QuestionarioProvider>
  );
}

export default App;
