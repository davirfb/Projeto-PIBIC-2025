import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Info, Settings2 } from "lucide-react";
import type { Eixo } from "@/types/questionario";
import { EIXO_CORES } from "@/types/questionario";

const EIXOS_PADRAO_TSI: Eixo[] = [
  { id: "eixo-infra",    nome: "Infraestrutura",       cor: EIXO_CORES[0] },
  { id: "eixo-docente",  nome: "Corpo Docente",         cor: EIXO_CORES[1] },
  { id: "eixo-conteudo", nome: "Conteudo Curricular",   cor: EIXO_CORES[2] },
  { id: "eixo-gestao",   nome: "Comunicacao e Gestao",  cor: EIXO_CORES[3] },
  { id: "eixo-emprego",  nome: "Empregabilidade",       cor: EIXO_CORES[4] },
];

function gerarId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface ConfiguracaoPesquisaViewProps {
  eixos: Eixo[];
  onEixosChange: (eixos: Eixo[]) => void;
}

export function ConfiguracaoPesquisaView({ eixos, onEixosChange }: ConfiguracaoPesquisaViewProps) {
  const [novoNome, setNovoNome] = useState("");

  function adicionarEixo() {
    const nome = novoNome.trim();
    if (!nome) return;
    const id = gerarId();
    const cor = EIXO_CORES[eixos.length % EIXO_CORES.length];
    onEixosChange([...eixos, { id, nome, cor }]);
    setNovoNome("");
  }

  function removerEixo(id: string) {
    onEixosChange(eixos.filter((e) => e.id !== id));
  }

  function resetarPadrao() {
    onEixosChange(EIXOS_PADRAO_TSI);
  }

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Configuracao de Pesquisa</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Configure os eixos de avaliacao utilizados no acompanhamento da evolucao historica do curso.
        </p>
      </div>

      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-slate-500" />
            <CardTitle className="text-base text-slate-900">Eixos de Avaliacao</CardTitle>
          </div>
          <p className="text-sm text-slate-500">
            Configure os eixos que serao acompanhados no grafico de evolucao. Cada comissao pode adaptar conforme o curso.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {eixos.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-500">
              <Info className="h-4 w-4 shrink-0" />
              Nenhum eixo configurado. Adicione abaixo para visualizar o grafico de evolucao.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {eixos.map((eixo) => (
                <div
                  key={eixo.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5"
                >
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: eixo.cor }} />
                  <span className="text-sm text-slate-700">{eixo.nome}</span>
                  <button
                    onClick={() => removerEixo(eixo.id)}
                    className="ml-1 text-slate-300 hover:text-red-400 transition-colors"
                    aria-label={`Remover ${eixo.nome}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Nome do novo eixo..."
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionarEixo()}
              className="text-sm border-slate-200 flex-1"
            />
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
              onClick={adicionarEixo}
              disabled={!novoNome.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>

          {eixos.length > 0 && JSON.stringify(eixos) !== JSON.stringify(EIXOS_PADRAO_TSI) && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-slate-500 border-slate-200"
              onClick={resetarPadrao}
            >
              Restaurar padrao (TSI)
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-blue-100 bg-blue-50 shadow-sm">
        <CardContent className="pt-5">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-800">Como funcionam os eixos</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Os eixos de avaliacao sao dimensoes tematicas que organizam as questoes das pesquisas. Cada eixo agrupa questoes afins e recebe uma media de satisfacao ao longo dos semestres, permitindo acompanhar a evolucao ao longo do tempo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { EIXOS_PADRAO_TSI };
