import { useState } from "react"
import { LoginPage } from "./login-page"
import { HomeAlunos } from "./home-alunos"
import { HomeAdmin } from "./home-admin"

type Page = "login" | "aluno" | "admin"

function App() {
  const [page, setPage] = useState<Page>("login")

  if (page === "aluno") {
    return <HomeAlunos onVoltarLogin={() => setPage("login")} />
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

