import { useState } from "react";
import { LoginPage } from "@/pages/auth/LoginPage";
import { HomeAluno } from "@/pages/aluno/HomeAluno";
import { HomeAdmin } from "@/pages/admin/HomeAdmin";
import type { LoginUser } from "@/pages/auth/LoginPage";

type Page = "login" | "aluno" | "admin";

function App() {
  const [page, setPage] = useState<Page>("login");
  const [currentUser, setCurrentUser] = useState<LoginUser | null>(null);

  if (page === "aluno") {
    return (
      <HomeAluno
        onVoltarLogin={() => setPage("login")}
        userName={currentUser?.name}
        userRoleLabel="Aluno"
      />
    );
  }

  if (page === "admin") {
    return (
      <HomeAdmin
        onVoltarLogin={() => setPage("login")}
        userName={currentUser?.name}
        userRoleLabel="Administrador"
      />
    );
  }

  return (
    <LoginPage
      onLogin={(user) => {
        setCurrentUser(user);
        if (user.role === "aluno") setPage("aluno");
        if (user.role === "admin") setPage("admin");
      }}
    />
  );
}

export default App;
