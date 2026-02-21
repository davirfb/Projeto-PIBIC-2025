import { useState } from "react"
import { LoginPage } from "@/pages/auth/LoginPage"
import { HomeAluno } from "@/pages/aluno/HomeAluno"
import { HomeAdmin } from "@/pages/admin/HomeAdmin"

type Page = "login" | "aluno" | "admin"

function App() {
  const [page, setPage] = useState<Page>("login")

  if (page === "aluno") {
    return <HomeAluno onVoltarLogin={() => setPage("login")} />
  }

  if (page === "admin") {
    return <HomeAdmin onVoltarLogin={() => setPage("login")} />
  }

  return (
    <LoginPage
      onLogin={(role) => {
        if (role === "aluno") setPage("aluno")
        if (role === "admin") setPage("admin")
      }}
    />
  )
}

export default App
