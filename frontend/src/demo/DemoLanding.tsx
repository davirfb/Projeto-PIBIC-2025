import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, ArrowRight, X, Star, Info } from "lucide-react";
import logoIFB from "@/assets/logoIFB.png";
import type { DemoProfile } from "./demoData";

interface DemoLandingProps {
  onSelect: (profile: DemoProfile) => void;
}

interface CardInfo {
  profile: DemoProfile;
  label: string;
  sublabel: string;
  icon: typeof GraduationCap;
  isComissao: boolean;
  iconBg: string;
  iconColor: string;
  borderClass: string;
  btnClass: string;
  instrucoes: {
    titulo: string;
    paragrafos: string[];
  };
}

const CARDS: CardInfo[] = [
  {
    profile: "estudante-comissao",
    label: "Estudante",
    sublabel: "Membro da Comissão",
    isComissao: true,
    icon: GraduationCap,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    borderClass:
      "border-emerald-300 bg-emerald-50/40 hover:border-emerald-400 hover:bg-emerald-50/70 ring-2 ring-emerald-200",
    btnClass: "bg-emerald-500 hover:bg-emerald-600 text-white",
    instrucoes: {
      titulo: "Estudante da Comissão",
      paragrafos: [
        "Você está simulando Ana Luiza Costa, estudante do curso de TSI que também integra a Comissão de Avaliação do curso.",
        "Ao entrar, você verá a interface normal de estudante, com questionários disponíveis para responder. Por fazer parte da comissão, há um botão destacado no menu lateral que dá acesso ao painel completo de relatórios e dados coletados.",
        "Explore os dois lados: responda a avaliação como estudante e, em seguida, acesse o painel da comissão para analisar os resultados.",
      ],
    },
  },
  {
    profile: "professor-comissao",
    label: "Professor",
    sublabel: "Membro da Comissão",
    isComissao: true,
    icon: BookOpen,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    borderClass:
      "border-blue-300 bg-blue-50/40 hover:border-blue-400 hover:bg-blue-50/70 ring-2 ring-blue-200",
    btnClass: "bg-blue-500 hover:bg-blue-600 text-white",
    instrucoes: {
      titulo: "Professor da Comissão",
      paragrafos: [
        "Você está simulando o Prof. Ricardo Melo, docente do curso de TSI e membro da Comissão de Avaliação do curso.",
        "Ao entrar, você será direcionado diretamente ao painel da comissão, onde poderá gerenciar questionários, visualizar relatórios de participação e acompanhar a evolução histórica do curso.",
        "Navegue pelos menus para explorar todos os recursos disponíveis para a comissão avaliativa.",
      ],
    },
  },
  {
    profile: "aluno",
    label: "Estudante",
    sublabel: "Respondente",
    isComissao: false,
    icon: Users,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    borderClass:
      "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/30",
    btnClass: "bg-amber-500 hover:bg-amber-600 text-white",
    instrucoes: {
      titulo: "Estudante Respondente",
      paragrafos: [
        "Você está simulando Lucas Ferreira, estudante comum do curso de TSI, sem vínculo com a comissão.",
        "Há um questionário ativo disponível: Avaliação do Desempenho Docente 2026/2. Experimente o fluxo completo de participação, desde o acesso até o envio das respostas.",
        "Clique em Responder para preencher o questionário e visualizar a confirmação de envio. Explore o histórico e as outras seções do painel.",
      ],
    },
  },
];

export function DemoLanding({ onSelect }: DemoLandingProps) {
  const [pendente, setPendente] = useState<CardInfo | null>(null);
  const [showComissaoInfo, setShowComissaoInfo] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center gap-3">
        <img src={logoIFB} alt="Logo IFB" className="h-9 w-auto" />
        <span className="text-xl font-semibold text-slate-900">Avaliação IFB</span>
        <span className="ml-2 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-medium text-emerald-700">
          Modo Demonstração
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Sistema de Avaliação Institucional
            </h1>
            <p className="text-slate-500 text-sm sm:text-base">
              Selecione o perfil que deseja explorar nesta demonstração
            </p>
          </div>

          {/* Destaque para membros da comissão + botão de info */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 space-y-2">
            <div className="flex items-start gap-3">
              <Star className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-amber-800">
                  Os perfis <strong>Estudante</strong> e <strong>Professor</strong> fazem parte da{" "}
                  <strong>Comissão de Avaliação</strong> e têm acesso ao painel completo de relatórios.
                </p>
                <button
                  type="button"
                  onClick={() => setShowComissaoInfo((v) => !v)}
                  className="mt-1.5 flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-medium transition-colors"
                >
                  <Info className="h-3.5 w-3.5" />
                  {showComissaoInfo ? "Ocultar" : "O que é a Comissão de Avaliação?"}
                </button>
              </div>
            </div>

            {showComissaoInfo && (
              <div className="ml-7 text-xs text-amber-800 leading-relaxed space-y-1 border-t border-amber-200 pt-2">
                <p>
                  A <strong>Comissão de Avaliação Periódica do Curso (CPA de Curso)</strong> é um
                  grupo composto por estudantes, professores e servidores responsável por planejar e
                  conduzir avaliações institucionais periódicas.
                </p>
                <p>
                  Ela elabora os questionários, coleta as respostas dos participantes, analisa os
                  resultados e propõe melhorias para o curso com base nos dados obtidos.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.profile}
                  type="button"
                  onClick={() => setPendente(card)}
                  className={`rounded-2xl border-2 p-6 text-left shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${card.borderClass}`}
                >
                  {card.isComissao && (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        <Star className="h-3 w-3" /> Comissão
                      </span>
                    </div>
                  )}
                  <div className={`rounded-xl ${card.iconBg} p-3 w-fit mb-3`}>
                    <Icon className={`h-6 w-6 ${card.iconColor}`} />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">{card.label}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{card.sublabel}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-slate-400">
                    Ver instruções <ArrowRight className="h-3 w-3" />
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-slate-400">
            Esta é uma demonstração com dados simulados. Nenhuma informação real é utilizada.
          </p>
        </div>
      </main>

      {pendente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 space-y-6 relative">
            <button
              type="button"
              onClick={() => setPendente(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            {pendente.isComissao && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                <Star className="h-3 w-3" /> Membro da Comissão
              </span>
            )}

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Instruções
              </p>
              <h2 className="text-xl font-bold text-slate-900">
                {pendente.instrucoes.titulo}
              </h2>
            </div>

            <div className="space-y-3">
              {pendente.instrucoes.paragrafos.map((p, i) => (
                <p key={i} className="text-sm text-slate-600 leading-relaxed">
                  {i === 0 ? (
                    p
                  ) : (
                    <>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300 mr-2 mb-0.5 align-middle" />
                      {p}
                    </>
                  )}
                </p>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-slate-200 text-slate-600"
                onClick={() => setPendente(null)}
              >
                Voltar
              </Button>
              <Button
                className={`flex-1 ${pendente.btnClass} flex items-center justify-center gap-2`}
                onClick={() => {
                  setPendente(null);
                  onSelect(pendente.profile);
                }}
              >
                Entrar <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
