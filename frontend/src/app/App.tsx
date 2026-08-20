import { useAuth } from "@/hooks/useAuth";
import { LoginPage } from "@/pages/auth/LoginPage";
import { HomeADM } from "@/pages/adm/HomeADM";
import { HomeComissao } from "@/pages/comissao/HomeComissao";
import { HomeRespondente } from "@/pages/respondente/HomeRespondente";
import { HomePadrao } from "@/pages/padrao/HomePadrao";
import { QuestionarioProvider } from "@/context/QuestionarioContext";

function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <p className="text-slate-400 text-sm">Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  const hasComissao = user.comissoes.length > 0;

  return (
    <QuestionarioProvider
      isAdm={user.isAdm}
      hasComissao={hasComissao}
      comissaoId={user.comissoes[0]?.id}
      userId={user.id}
      userTipo={user.tipo}
    >
      {user.isAdm && (
        <HomeADM onLogout={logout} userName={user.nome} />
      )}
      {!user.isAdm && hasComissao && (
        <HomeComissao onLogout={logout} userName={user.nome} />
      )}
      {!user.isAdm && !hasComissao && user.nivelAcesso === "respondente" && (
        <HomeRespondente
          onLogout={logout}
          userName={user.nome}
          userId={user.id}
          userTipo={user.tipo}
        />
      )}
      {!user.isAdm && !hasComissao && user.nivelAcesso === "padrao" && (
        <HomePadrao
          onLogout={logout}
          userName={user.nome}
          userId={user.id}
          userTipo={user.tipo}
        />
      )}
    </QuestionarioProvider>
  );
}

export default App;
