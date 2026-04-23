import { useAuth } from "@/hooks/useAuth";
import { LoginPage } from "@/pages/auth/LoginPage";
import { HomeADM } from "@/pages/adm/HomeADM";
import { HomeComissao } from "@/pages/comissao/HomeComissao";
import { HomeRespondente } from "@/pages/respondente/HomeRespondente";
import { HomePadrao } from "@/pages/padrao/HomePadrao";

function App() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return <LoginPage onLogin={login} />;
  }

  if (user.role === "adm") {
    return <HomeADM onLogout={logout} userName={user.name} />;
  }

  if (user.role === "comissao") {
    return <HomeComissao onLogout={logout} userName={user.name} />;
  }

  if (user.role === "respondente") {
    return <HomeRespondente onLogout={logout} userName={user.name} />;
  }

  return <HomePadrao onLogout={logout} userName={user.name} />;
}

export default App;
