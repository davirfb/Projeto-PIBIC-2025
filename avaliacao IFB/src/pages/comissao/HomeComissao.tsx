import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  BarChart3,
  ClipboardList,
  ClipboardPlus,
  FileText,
  Plus,
  Wrench,
  ClipboardCheck,
  Clock,
  Archive,
  Pencil,
  Trash2,
  StopCircle,
  CalendarDays,
} from "lucide-react";
import { QuestionarioForm } from "./QuestionarioForm";
import type { Questionario, QuestionarioStatus } from "@/types/questionario";

type Section = "questionarios" | "form" | "participacao" | "relatorios";

interface HomeComissaoProps {
  onLogout?: () => void;
  userName?: string;
}

function PendingSection({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold text-slate-900 mb-1">{title}</h2>
      <p className="text-slate-500 text-sm mb-8">{description}</p>
      <div className="flex flex-col items-center justify-center h-52 rounded-xl border-2 border-dashed border-slate-300 bg-white text-slate-400 gap-3">
        <Wrench className="h-8 w-8" />
        <p className="text-sm font-medium">
          Em desenvolvimento — disponível na próxima etapa
        </p>
      </div>
    </div>
  );
}

const STATUS_CONFIG: Record<
  QuestionarioStatus,
  { label: string; color: string }
> = {
  rascunho: {
    label: "Rascunho",
    color: "bg-slate-100 text-slate-600 border-slate-300",
  },
  publicado: {
    label: "Publicado",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  encerrado: {
    label: "Encerrado",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  arquivado: {
    label: "Arquivado",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

function deleteWarning(status: QuestionarioStatus): string {
  if (status === "rascunho")
    return "Tem certeza que deseja excluir este rascunho? Esta ação não pode ser desfeita.";
  if (status === "publicado")
    return "Atenção! Este questionário está publicado e pode ter respostas em andamento. Excluí-lo removerá permanentemente o questionário e todas as suas respostas. Esta ação não pode ser desfeita.";
  return "Atenção! Este questionário possui respostas coletadas. Excluí-lo removerá permanentemente o questionário e todos os seus dados. Esta ação não pode ser desfeita.";
}

interface QuestionarioCardProps {
  questionario: Questionario;
  onEditar: () => void;
  onEncerrar: () => void;
  onArquivar: () => void;
  onExcluir: () => void;
}

function QuestionarioCard({
  questionario,
  onEditar,
  onEncerrar,
  onArquivar,
  onExcluir,
}: QuestionarioCardProps) {
  const { label, color } = STATUS_CONFIG[questionario.status];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">
            {questionario.titulo}
          </h3>
          {questionario.descricao && (
            <p className="text-sm text-slate-500 line-clamp-1">
              {questionario.descricao}
            </p>
          )}
        </div>
        <Badge variant="outline" className={`shrink-0 text-xs ${color}`}>
          {label}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {questionario.dataInicio
            ? `${questionario.dataInicio} → ${questionario.dataFim}`
            : "Sem vigência definida"}
        </span>
        <span className="flex items-center gap-1">
          <ClipboardList className="h-3.5 w-3.5" />
          {questionario.questoes.length} questão(ões)
        </span>
      </div>

      <div className="flex items-center gap-2 pt-1 flex-wrap">
        {questionario.status === "rascunho" && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-slate-200 text-slate-600 hover:bg-slate-50 flex gap-1"
            onClick={onEditar}
          >
            <Pencil className="h-3 w-3" /> Editar
          </Button>
        )}

        {questionario.status === "publicado" && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-50 flex gap-1"
            onClick={onEncerrar}
          >
            <StopCircle className="h-3 w-3" /> Encerrar
          </Button>
        )}

        {questionario.status === "encerrado" && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-amber-200 text-amber-600 hover:bg-amber-50 flex gap-1"
            onClick={onArquivar}
          >
            <Archive className="h-3 w-3" /> Arquivar
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-red-200 text-red-500 hover:bg-red-50 flex gap-1"
            >
              <Trash2 className="h-3 w-3" /> Excluir
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir questionário?</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteWarning(questionario.status)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={onExcluir}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Sim, excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

interface QuestionariosViewProps {
  questionarios: Questionario[];
  onNovo: () => void;
  onEditar: (id: string) => void;
  onEncerrar: (id: string) => void;
  onArquivar: (id: string) => void;
  onExcluir: (id: string) => void;
}

function QuestionariosView({
  questionarios,
  onNovo,
  onEditar,
  onEncerrar,
  onArquivar,
  onExcluir,
}: QuestionariosViewProps) {
  const rascunhos = questionarios.filter((q) => q.status === "rascunho").length;
  const publicados = questionarios.filter(
    (q) => q.status === "publicado",
  ).length;
  const encerrados = questionarios.filter(
    (q) => q.status === "encerrado",
  ).length;

  const stats = [
    {
      label: "Em Rascunho",
      value: rascunhos,
      icon: ClipboardList,
      color: "text-slate-500",
      bg: "bg-slate-100",
    },
    {
      label: "Publicados",
      value: publicados,
      icon: Clock,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Encerrados",
      value: encerrados,
      icon: Archive,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Meus Questionários
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie os questionários avaliativos
          </p>
        </div>
        <Button
          className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
          onClick={onNovo}
        >
          <Plus className="h-4 w-4" />
          Novo Questionário
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-slate-200 shadow-sm bg-white"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.label}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">
            Lista de Questionários
          </CardTitle>
        </CardHeader>
        <CardContent>
          {questionarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-3">
              <ClipboardCheck className="h-8 w-8" />
              <p className="text-sm font-medium">
                Nenhum questionário criado ainda.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                onClick={onNovo}
              >
                Criar primeiro questionário
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {questionarios.map((q) => (
                <QuestionarioCard
                  key={q.id}
                  questionario={q}
                  onEditar={() => onEditar(q.id)}
                  onEncerrar={() => onEncerrar(q.id)}
                  onArquivar={() => onArquivar(q.id)}
                  onExcluir={() => onExcluir(q.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function HomeComissao({ onLogout, userName }: HomeComissaoProps) {
  const [section, setSection] = useState<Section>("questionarios");
  const [questionarios, setQuestionarios] = useState<Questionario[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const questionarioEditando = editandoId
    ? questionarios.find((q) => q.id === editandoId)
    : undefined;

  function upsert(q: Questionario) {
    setQuestionarios((prev) => {
      const existe = prev.some((p) => p.id === q.id);
      return existe ? prev.map((p) => (p.id === q.id ? q : p)) : [...prev, q];
    });
  }

  function handleSalvarRascunho(q: Questionario) {
    upsert(q);
    setEditandoId(null);
    setSection("questionarios");
  }

  function handlePublicar(q: Questionario) {
    upsert(q);
    setEditandoId(null);
    setSection("questionarios");
  }

  function handleEditar(id: string) {
    setEditandoId(id);
    setSection("form");
  }

  function handleEncerrar(id: string) {
    setQuestionarios((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              status: "encerrado",
              atualizadoEm: new Date().toISOString(),
            }
          : q,
      ),
    );
  }

  function handleArquivar(id: string) {
    setQuestionarios((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              status: "arquivado",
              atualizadoEm: new Date().toISOString(),
            }
          : q,
      ),
    );
  }

  function handleExcluir(id: string) {
    setQuestionarios((prev) => prev.filter((q) => q.id !== id));
  }

  function handleCancelar() {
    setEditandoId(null);
    setSection("questionarios");
  }

  const navSections = [
    {
      title: "Questionários",
      items: [
        {
          label: "Meus Questionários",
          icon: <ClipboardList className="h-5 w-5" />,
          active: section === "questionarios",
          onClick: () => {
            setEditandoId(null);
            setSection("questionarios");
          },
        },
        {
          label: "Novo Questionário",
          icon: <ClipboardPlus className="h-5 w-5" />,
          active: section === "form" && !editandoId,
          onClick: () => {
            setEditandoId(null);
            setSection("form");
          },
        },
      ],
    },
    {
      title: "Resultados",
      items: [
        {
          label: "Painel de Participação",
          icon: <BarChart3 className="h-5 w-5" />,
          active: section === "participacao",
          onClick: () => setSection("participacao"),
        },
        {
          label: "Relatórios",
          icon: <FileText className="h-5 w-5" />,
          active: section === "relatorios",
          onClick: () => setSection("relatorios"),
        },
      ],
    },
  ];

  return (
    <AppLayout
      onVoltarLogin={onLogout}
      userName={userName}
      userRoleLabel="Comissão"
      navSections={navSections}
    >
      {section === "questionarios" && (
        <QuestionariosView
          questionarios={questionarios}
          onNovo={() => {
            setEditandoId(null);
            setSection("form");
          }}
          onEditar={handleEditar}
          onEncerrar={handleEncerrar}
          onArquivar={handleArquivar}
          onExcluir={handleExcluir}
        />
      )}
      {section === "form" && (
        <QuestionarioForm
          inicial={questionarioEditando}
          onRascunho={handleSalvarRascunho}
          onPublicar={handlePublicar}
          onCancelar={handleCancelar}
        />
      )}
      {section === "participacao" && (
        <PendingSection
          title="Painel de Participação"
          description="Acompanhe a taxa de participação por curso, turma e sub-tipo de respondente."
        />
      )}
      {section === "relatorios" && (
        <PendingSection
          title="Relatórios"
          description="Gere e exporte relatórios com os resultados das avaliações."
        />
      )}
    </AppLayout>
  );
}
