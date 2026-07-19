import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const STAGES = [
  { key: "a_fazer", label: "A fazer" },
  { key: "andamento", label: "Em andamento" },
  { key: "revisao", label: "Revisão" },
  { key: "concluido", label: "Concluído" },
];

const STAGE_COLOR = {
  a_fazer: "#B9C4CC",
  andamento: "#17B8C4",
  revisao: "#F2A93B",
  concluido: "#2FA88A",
};

const FIN_LABEL = {
  emitida: "Cobrança emitida",
  aguardando: "Aguardando vencimento",
  pago: "Pago",
  baixado: "Concluído",
};

const FIN_COLOR = {
  emitida: "#B9C4CC",
  aguardando: "#F2A93B",
  pago: "#17B8C4",
  baixado: "#2FA88A",
};

function currency(v) {
  return (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ClientPortal() {
  const [state, setState] = useState("loading");
  const [client, setClient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [finances, setFinances] = useState([]);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("codigo");
      if (!code) {
        setState("invalid");
        return;
      }
      const { data: c } = await supabase.from("clients").select("*").eq("access_code", code).single();
      if (!c) {
        setState("invalid");
        return;
      }
      const [t, f] = await Promise.all([
        supabase.from("tasks").select("*").eq("client_id", c.id).order("created_at"),
        supabase.from("finances").select("*").eq("client_id", c.id).eq("tipo", "receber").order("vencimento"),
      ]);
      setClient(c);
      setTasks(t.data || []);
      setFinances(f.data || []);
      setState("ok");
    })();
  }, []);

  if (state === "loading") {
    return (
      <div style={{ background: "#F5F8F9", minHeight: "100vh" }} className="flex items-center justify-center">
        <div style={{ color: "#0B2540" }} className="text-sm font-medium">Carregando…</div>
      </div>
    );
  }

  if (state === "invalid") {
    return (
      <div style={{ background: "#F5F8F9", minHeight: "100vh" }} className="flex items-center justify-center p-6">
        <div className="bg-white border border-[#E4EAEC] rounded-xl p-6 max-w-sm text-center">
          <div className="font-medium text-[#0B2540] mb-1">Link inválido</div>
          <div className="text-sm text-[#5B7285]">Confira o link recebido ou entre em contato com a Connecta.</div>
        </div>
      </div>
    );
  }

  const pendente = finances
    .filter((f) => f.etapa !== "pago" && f.etapa !== "baixado")
    .reduce((s, f) => s + Number(f.valor || 0), 0);

  return (
    <div style={{ background: "#F5F8F9", minHeight: "100vh", fontFamily: "Inter, sans-serif" }} className="text-[#1B2A3A]">
      <style>{`
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      <header style={{ background: "#0B2540" }} className="px-6 py-8 text-center">
        <div style={{ color: "#7FA3B8" }} className="text-xs mb-1">Connecta Gestão Integrada</div>
        <div className="font-display font-700 text-white text-2xl">{client.nome}</div>
      </header>

      <main className="max-w-xl mx-auto px-5 py-8">
        <section className="mb-8">
          <h2 className="font-display font-600 text-base text-[#0B2540] mb-3">Andamento dos serviços</h2>
          {tasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-[#D7E0E4] py-8 text-center text-sm text-[#8098A8]">
              Nenhuma tarefa em andamento no momento.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E4EAEC] divide-y divide-[#E4EAEC]">
              {tasks.map((t) => (
                <div key={t.id} className="px-4 py-3 flex items-center gap-3">
                  <span style={{ background: STAGE_COLOR[t.etapa] }} className="w-2 h-2 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#0B2540] truncate">{t.titulo}</div>
                  </div>
                  <span className="text-xs text-[#5B7285] flex-shrink-0">
                    {STAGES.find((s) => s.key === t.etapa)?.label || t.etapa}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-600 text-base text-[#0B2540]">Financeiro</h2>
            <span className="text-sm text-[#5B7285]">
              Em aberto: <span className="font-mono font-600 text-[#0B2540]">{currency(pendente)}</span>
            </span>
          </div>
          {finances.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-[#D7E0E4] py-8 text-center text-sm text-[#8098A8]">
              Nenhum lançamento no momento.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E4EAEC] divide-y divide-[#E4EAEC]">
              {finances.map((f) => (
                <div key={f.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#0B2540] truncate">{f.descricao}</div>
                    {f.vencimento && (
                      <div className="text-xs text-[#8098A8]">
                        vence {new Date(f.vencimento + "T00:00:00").toLocaleDateString("pt-BR")}
                      </div>
                    )}
                  </div>
                  <span
                    style={{ background: `${FIN_COLOR[f.etapa]}22`, color: FIN_COLOR[f.etapa] }}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                  >
                    {FIN_LABEL[f.etapa] || f.etapa}
                  </span>
                  <span className="font-mono text-sm text-[#0B2540] flex-shrink-0">{currency(f.valor)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
