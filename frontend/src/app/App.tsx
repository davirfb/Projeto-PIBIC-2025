import { useAuth } from "@/hooks/useAuth";
import { LoginPage } from "@/pages/auth/LoginPage";
import { HomeADM } from "@/pages/adm/HomeADM";
import { HomeComissao } from "@/pages/comissao/HomeComissao";
import { HomeRespondente } from "@/pages/respondente/HomeRespondente";
import { HomePadrao } from "@/pages/padrao/HomePadrao";
import { QuestionarioProvider } from "@/context/QuestionarioContext";

function App() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <QuestionarioProvider>
      {user.role === "adm" && <HomeADM onLogout={logout} userName={user.name} />}
      {user.role === "comissao" && <HomeComissao onLogout={logout} userName={user.name} />}
      {user.role === "respondente" && (
        <HomeRespondente onLogout={logout} userName={user.name} userId={user.id} userRole={user.role} />
      )}
      {user.role === "padrao" && (
        <HomePadrao onLogout={logout} userName={user.name} userId={user.id} userRole={user.role} />
      )}
    </QuestionarioProvider>
  );
}

export default App;
