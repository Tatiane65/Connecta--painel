import React, { useState, useEffect, useMemo } from "react";
import {
  Users, ListChecks, Wallet, LayoutDashboard, Plus, X,
  Clock, AlertTriangle, Trash2, Briefcase, ArrowLeft
} from "lucide-react";
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

const FIN_STAGES = [
  { key: "emitida", labelReceber: "Emitir cobrança", labelPagar: "Registrar conta" },
  { key: "aguardando", labelReceber: "Aguardando vencimento", labelPagar: "Aguardando vencimento" },
  { key: "pago", labelReceber: "Pagamento recebido", labelPagar: "Pago" },
  { key: "baixado", labelReceber: "Baixado", labelPagar: "Baixado" },
];

const FIN_STAGE_COLOR = {
  emitida: "#B9C4CC",
  aguardando: "#F2A93B",
  pago: "#17B8C4",
  baixado: "#2FA88A",
};

const RS_STAGES = [
  { key: "triagem", label: "Triagem" },
  { key: "entrevista", label: "Entrevista" },
  { key: "proposta", label: "Proposta" },
  { key: "contratado", label: "Contratado" },
  { key: "reprovado", label: "Reprovado" },
];

const RS_STAGE_COLOR = {
  triagem: "#B9C4CC",
  entrevista: "#17B8C4",
  proposta: "#F2A93B",
  contratado: "#2FA88A",
  reprovado: "#D9534F",
};

function currency(v) {
  return (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d - now) / 86400000);
}

export default function App() {
  const [view, setView] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [finances, setFinances] = useState([]);
  const [vagas, setVagas] = useState([]);
  const [candidatos, setCandidatos] = useState([]);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    (async () => {
      const [c, t, f, v, cd] = await Promise.all([
        supabase.from("clients").select("*").order("created_at"),
        supabase.from("tasks").select("*").order("created_at"),
        supabase.from("finances").select("*").order("created_at"),
        supabase.from("vagas").select("*").order("created_at"),
        supabase.from("candidatos").select("*").order("created_at"),
      ]);
      if (c.error || t.error || f.error || v.error || cd.error) {
        setError((c.error || t.error || f.error || v.error || cd.error).message);
      } else {
        setClients(c.data);
        setTasks(t.data);
        setFinances(f.data);
        setVagas(v.data);
        setCandidatos(cd.data);
      }
      setLoading(false);
    })();
  }, []);

  const clientName = (id) => clients.find((c) => c.id === id)?.nome || "—";

  async function addClient(data) {
    const { data: row, error: err } = await supabase.from("clients").insert({ status: "ativo", ...data }).select().single();
    if (!err) setClients((p) => [...p, row]);
  }
  async function removeClient(id) {
    await supabase.from("clients").delete().eq("id", id);
    setClients((p) => p.filter((c) => c.id !== id));
    setTasks((p) => p.filter((t) => t.client_id !== id));
    setFinances((p) => p.filter((f) => f.client_id !== id));
    const orphanVagas = vagas.filter((v) => v.client_id === id).map((v) => v.id);
    setVagas((p) => p.filter((v) => v.client_id !== id));
    setCandidatos((p) => p.filter((cd) => !orphanVagas.includes(cd.vaga_id)));
  }

  async function addTask(data) {
    const { data: row, error: err } = await supabase.from("tasks").insert({ etapa: "a_fazer", ...data }).select().single();
    if (!err) setTasks((p) => [...p, row]);
  }
  async function moveTask(id, etapa) {
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, etapa } : t)));
    await supabase.from("tasks").update({ etapa }).eq("id", id);
  }
  async function removeTask(id) {
    await supabase.from("tasks").delete().eq("id", id);
    setTasks((p) => p.filter((t) => t.id !== id));
  }

  async function addFinance(data) {
    const { data: row, error: err } = await supabase.from("finances").insert({ etapa: "emitida", ...data }).select().single();
    if (!err) setFinances((p) => [...p, row]);
  }
  async function moveFinance(id, etapa) {
    setFinances((p) => p.map((f) => (f.id === id ? { ...f, etapa } : f)));
    await supabase.from("finances").update({ etapa }).eq("id", id);
  }
  async function removeFinance(id) {
    await supabase.from("finances").delete().eq("id", id);
    setFinances((p) => p.filter((f) => f.id !== id));
  }

  async function addVaga(data) {
    const { data: row, error: err } = await supabase.from("vagas").insert({ status: "aberta", ...data }).select().single();
    if (!err) setVagas((p) => [...p, row]);
  }
  async function removeVaga(id) {
    await supabase.from("vagas").delete().eq("id", id);
    setVagas((p) => p.filter((v) => v.id !== id));
    setCandidatos((p) => p.filter((cd) => cd.vaga_id !== id));
  }

  async function addCandidato(data) {
    const { data: row, error: err } = await supabase.from("candidatos").insert({ etapa: "triagem", ...data }).select().single();
    if (!err) setCandidatos((p) => [...p, row]);
  }
  async function moveCandidato(id, etapa) {
    setCandidatos((p) => p.map((cd) => (cd.id === id ? { ...cd, etapa } : cd)));
    await supabase.from("candidatos").update({ etapa }).eq("id", id);
  }
  async function removeCandidato(id) {
    await supabase.from("candidatos").delete().eq("id", id);
    setCandidatos((p) => p.filter((cd) => cd.id !== id));
  }

  const kpis = useMemo(() => {
    const ativos = clients.filter((c) => c.status === "ativo").length;
    const andamento = tasks.filter((t) => t.etapa === "andamento").length;
    const atrasadas = tasks.filter((t) => t.prazo && daysUntil(t.prazo) < 0 && t.etapa !== "concluido").length;
    const aReceber = finances
      .filter((f) => f.tipo === "receber" && f.etapa !== "pago" && f.etapa !== "baixado")
      .reduce((s, f) => s + Number(f.valor || 0), 0);
    return { ativos, andamento, atrasadas, aReceber };
  }, [clients, tasks, finances]);

  if (loading) {
    return (
      <div style={{ background: "#F5F8F9", minHeight: "100vh" }} className="flex items-center justify-center">
        <div style={{ color: "#0B2540" }} className="font-medium">Carregando painel…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "#F5F8F9", minHeight: "100vh" }} className="flex items-center justify-center p-6">
        <div className="bg-white border border-[#F5C6C6] rounded-xl p-6 max-w-md text-sm text-[#0B2540]">
          <div className="font-medium mb-1">Não consegui conectar ao banco.</div>
          <div className="text-[#5B7285]">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F5F8F9", minHeight: "100vh", fontFamily: "Inter, sans-serif" }} className="flex text-[#1B2A3A]">
      <style>{`
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #CFD8DC; border-radius: 4px; }
      `}</style>

      <aside style={{ background: "#0B2540", width: 232 }} className="flex-shrink-0 flex flex-col py-6">
        <div className="px-6 mb-8">
          <div className="font-display font-700 text-white text-lg leading-tight">Connecta</div>
          <div style={{ color: "#7FA3B8" }} className="text-xs mt-0.5">Gestão Integrada</div>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          <NavItem icon={LayoutDashboard} label="Painel" active={view === "dashboard"} onClick={() => setView("dashboard")} />
          <NavItem icon={Users} label="Clientes" active={view === "clients"} onClick={() => setView("clients")} />
          <NavItem icon={ListChecks} label="Tarefas" active={view === "tasks"} onClick={() => setView("tasks")} />
          <NavItem icon={Wallet} label="Financeiro" active={view === "finance"} onClick={() => setView("finance")} />
          <NavItem icon={Briefcase} label="R&S" active={view === "rs"} onClick={() => setView("rs")} />
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        {view === "dashboard" && <Dashboard kpis={kpis} clients={clients} tasks={tasks} />}
        {view === "clients" && (
          <ClientsView clients={clients} tasks={tasks} onAdd={() => setModal({ type: "client" })} onRemove={removeClient} />
        )}
        {view === "tasks" && (
          <TasksView
            clients={clients}
            tasks={tasks}
            clientName={clientName}
            onAdd={() => setModal({ type: "task" })}
            onMove={moveTask}
            onRemove={removeTask}
          />
        )}
        {view === "finance" && (
          <FinanceView
            clients={clients}
            finances={finances}
            clientName={clientName}
            onAdd={() => setModal({ type: "finance" })}
            onMove={moveFinance}
            onRemove={removeFinance}
          />
        )}
        {view === "rs" && (
          <RSView
            clients={clients}
            vagas={vagas}
            candidatos={candidatos}
            clientName={clientName}
            onAddVaga={() => setModal({ type: "vaga" })}
            onRemoveVaga={removeVaga}
            onAddCandidato={(vagaId) => setModal({ type: "candidato", vagaId })}
            onMoveCandidato={moveCandidato}
            onRemoveCandidato={removeCandidato}
          />
        )}
      </main>

      {modal?.type === "client" && (
        <ClientModal onClose={() => setModal(null)} onSave={(d) => { addClient(d); setModal(null); }} />
      )}
      {modal?.type === "task" && (
        <TaskModal clients={clients} onClose={() => setModal(null)} onSave={(d) => { addTask(d); setModal(null); }} />
      )}
      {modal?.type === "finance" && (
        <FinanceModal clients={clients} onClose={() => setModal(null)} onSave={(d) => { addFinance(d); setModal(null); }} />
      )}
      {modal?.type === "vaga" && (
        <VagaModal clients={clients} onClose={() => setModal(null)} onSave={(d) => { addVaga(d); setModal(null); }} />
      )}
      {modal?.type === "candidato" && (
        <CandidatoModal vagaId={modal.vagaId} onClose={() => setModal(null)} onSave={(d) => { addCandidato(d); setModal(null); }} />
      )}
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ background: active ? "#17B8C4" : "transparent", color: active ? "#0B2540" : "#B9CBD8" }}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-[#0F3157] hover:text-white"
    >
      <Icon size={16} strokeWidth={2.2} />
      {label}
    </button>
  );
}

function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between px-10 pt-9 pb-6">
      <div>
        <h1 className="font-display font-700 text-2xl text-[#0B2540]">{title}</h1>
        {subtitle && <p className="text-sm text-[#5B7285] mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function AddButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ background: "#17B8C4" }}
      className="flex items-center gap-1.5 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:brightness-95 transition"
    >
      <Plus size={16} /> {label}
    </button>
  );
}

function Dashboard({ kpis, clients, tasks }) {
  return (
    <div>
      <PageHeader title="Painel" subtitle="Visão geral das operações da Connecta" />
      <div className="px-10 grid grid-cols-4 gap-4 mb-8">
        <Kpi label="Clientes ativos" value={kpis.ativos} icon={Users} />
        <Kpi label="Tarefas em andamento" value={kpis.andamento} icon={Clock} />
        <Kpi label="Tarefas atrasadas" value={kpis.atrasadas} icon={AlertTriangle} warn={kpis.atrasadas > 0} />
        <Kpi label="A receber" value={currency(kpis.aReceber)} icon={Wallet} mono />
      </div>

      <div className="px-10">
        <h2 className="font-display font-600 text-base text-[#0B2540] mb-3">Fluxo por cliente</h2>
        {clients.length === 0 ? (
          <EmptyState text="Nenhum cliente cadastrado ainda. Cadastre o primeiro em Clientes." />
        ) : (
          <div className="bg-white rounded-xl border border-[#E4EAEC] divide-y divide-[#E4EAEC]">
            {clients.map((c) => (
              <ClientFlowRow key={c.id} client={c} tasks={tasks.filter((t) => t.client_id === c.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
function Kpi({ label, value, icon: Icon, warn, mono }) {
  return (
    <div className="bg-white rounded-xl border border-[#E4EAEC] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[#5B7285] uppercase tracking-wide">{label}</span>
        <Icon size={16} color={warn ? "#F2A93B" : "#17B8C4"} />
      </div>
      <div className={`text-2xl font-700 ${mono ? "font-mono" : "font-display"}`} style={{ color: warn ? "#D9822B" : "#0B2540" }}>
        {value}
      </div>
    </div>
  );
}

function ClientFlowRow({ client, tasks }) {
  return (
    <div className="px-5 py-4 flex items-center gap-4">
      <div className="w-36 flex-shrink-0">
        <div className="text-sm font-medium text-[#0B2540] truncate">{client.nome}</div>
        <div className="text-xs text-[#8098A8]">{tasks.length} tarefa{tasks.length !== 1 ? "s" : ""}</div>
      </div>
      <div className="flex-1 flex items-center">
        {STAGES.map((s, i) => {
          const count = tasks.filter((t) => t.etapa === s.key).length;
          return (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center gap-1" style={{ minWidth: 56 }}>
                <div
                  style={{
                    width: count ? 28 : 18,
                    height: count ? 28 : 18,
                    background: count ? STAGE_COLOR[s.key] : "#EEF2F3",
                    color: count ? "white" : "#B9C4CC",
                  }}
                  className="rounded-full flex items-center justify-center text-[11px] font-mono font-500 transition-all"
                >
                  {count || ""}
                </div>
                <span className="text-[10px] text-[#8098A8] text-center leading-tight">{s.label}</span>
              </div>
              {i < STAGES.length - 1 && <div style={{ height: 2, background: "#E4EAEC" }} className="flex-1 -mt-4" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-[#D7E0E4] py-10 text-center text-sm text-[#8098A8]">
      {text}
    </div>
  );
}

function ClientsView({ clients, tasks, onAdd, onRemove }) {
  return (
    <div>
      <PageHeader title="Clientes" subtitle={`${clients.length} cadastrado${clients.length !== 1 ? "s" : ""}`} action={<AddButton label="Novo cliente" onClick={onAdd} />} />
      <div className="px-10 pb-10">
        {clients.length === 0 ? (
          <EmptyState text="Nenhum cliente ainda. Cadastre o primeiro para começar a organizar tarefas e financeiro." />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {clients.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-[#E4EAEC] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-display font-600 text-[#0B2540]">{c.nome}</div>
                    <div className="text-xs text-[#8098A8] mt-0.5">{c.segmento || "Segmento não informado"}</div>
                  </div>
                  <button onClick={() => onRemove(c.id)} className="text-[#B9C4CC] hover:text-[#D9534F] transition">
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span
                    style={{ background: c.status === "ativo" ? "#DFF5EE" : "#FDF1DD", color: c.status === "ativo" ? "#2FA88A" : "#D9822B" }}
                    className="px-2 py-0.5 rounded-full font-medium"
                  >
                    {c.status === "ativo" ? "Ativo" : "Prospect"}
                  </span>
                  {c.contato && <span className="text-[#8098A8]">{c.contato}</span>}
                </div>
                <div className="mt-3 text-xs text-[#5B7285]">
                  {tasks.filter((t) => t.client_id === c.id).length} tarefa(s) registrada(s)
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ClientModal({ onClose, onSave }) {
  const [nome, setNome] = useState("");
  const [segmento, setSegmento] = useState("");
  const [contato, setContato] = useState("");
  const [status, setStatus] = useState("ativo");
  return (
    <Modal title="Novo cliente" onClose={onClose}>
      <Field label="Nome da empresa">
        <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} className="input" placeholder="Ex: Ótica Bela Vista" />
      </Field>
      <Field label="Segmento">
        <input value={segmento} onChange={(e) => setSegmento(e.target.value)} className="input" placeholder="Ex: Varejo, Clínica, Construção" />
      </Field>
      <Field label="Contato (e-mail ou telefone)">
        <input value={contato} onChange={(e) => setContato(e.target.value)} className="input" placeholder="contato@empresa.com" />
      </Field>
      <Field label="Status">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
          <option value="ativo">Ativo</option>
          <option value="prospect">Prospect</option>
        </select>
      </Field>
      <ModalActions onClose={onClose} onSave={() => nome.trim() && onSave({ nome, segmento, contato, status })} disabled={!nome.trim()} />
    </Modal>
  );
}

function TasksView({ clients, tasks, clientName, onAdd, onMove, onRemove }) {
  return (
    <div>
      <PageHeader title="Tarefas" subtitle="Mova conforme o andamento" action={<AddButton label="Nova tarefa" onClick={onAdd} />} />
      <div className="px-10 pb-10 grid grid-cols-4 gap-4">
        {STAGES.map((s) => {
          const items = tasks.filter((t) => t.etapa === s.key);
          return (
            <div key={s.key}>
              <div className="flex items-center gap-2 mb-3">
                <span style={{ background: STAGE_COLOR[s.key] }} className="w-2 h-2 rounded-full" />
                <span className="text-xs font-medium text-[#5B7285] uppercase tracking-wide">{s.label}</span>
                <span className="text-xs text-[#B9C4CC] font-mono">{items.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {items.length === 0 && clients.length > 0 && (
                  <div className="text-xs text-[#B9C4CC] italic py-2">vazio</div>
                )}
                {items.map((t) => {
                  const dl = daysUntil(t.prazo);
                  const late = dl !== null && dl < 0 && t.etapa !== "concluido";
                  return (
                    <div key={t.id} className="bg-white rounded-lg border border-[#E4EAEC] p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium text-[#0B2540] leading-snug">{t.titulo}</div>
                        <button onClick={() => onRemove(t.id)} className="text-[#D7E0E4] hover:text-[#D9534F] flex-shrink-0">
                          <X size={13} />
                        </button>
                      </div>
                      <div className="text-xs text-[#8098A8] mt-1">{clientName(t.client_id)}</div>
                      {t.prazo && (
                        <div className={`text-[11px] font-mono mt-1.5 ${late ? "text-[#D9534F]" : "text-[#8098A8]"}`}>
                          {late ? `Atrasada · ${new Date(t.prazo + "T00:00:00").toLocaleDateString("pt-BR")}` : new Date(t.prazo + "T00:00:00").toLocaleDateString("pt-BR")}
                        </div>
                      )}
                      <div className="flex gap-1 mt-2">
                        {STAGES.filter((s2) => s2.key !== t.etapa).map((s2) => (
                          <button
                            key={s2.key}
                            onClick={() => onMove(t.id, s2.key)}
                            className="text-[10px] px-1.5 py-0.5 rounded border border-[#E4EAEC] text-[#5B7285] hover:border-[#17B8C4] hover:text-[#17B8C4] transition"
                          >
                            {s2.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {clients.length === 0 && (
        <div className="px-10 -mt-2 pb-8">
          <EmptyState text="Cadastre um cliente primeiro para conseguir criar tarefas." />
        </div>
      )}
    </div>
  );
}

function TaskModal({ clients, onClose, onSave }) {
  const [titulo, setTitulo] = useState("");
  const [client_id, setClientId] = useState(clients[0]?.id || "");
  const [prazo, setPrazo] = useState("");
  return (
    <Modal title="Nova tarefa" onClose={onClose}>
      {clients.length === 0 ? (
        <div className="text-sm text-[#8098A8]">Cadastre um cliente antes de criar tarefas.</div>
      ) : (
        <>
          <Field label="Título">
            <input autoFocus value={titulo} onChange={(e) => setTitulo(e.target.value)} className="input" placeholder="Ex: Emitir NF-e de julho" />
          </Field>
          <Field label="Cliente">
            <select value={client_id} onChange={(e) => setClientId(e.target.value)} className="input">
              {clients.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </Field>
          <Field label="Prazo (opcional)">
            <input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} className="input" />
          </Field>
          <ModalActions onClose={onClose} onSave={() => titulo.trim() && onSave({ titulo, client_id, prazo: prazo || null })} disabled={!titulo.trim()} />
        </>
      )}
    </Modal>
  );
}

function FinanceView({ clients, finances, clientName, onAdd, onMove, onRemove }) {
  const [tipoView, setTipoView] = useState("receber");
  const items = finances.filter((f) => f.tipo === tipoView);
  const pendente = items
    .filter((f) => f.etapa !== "baixado" && (tipoView === "pago" || f.etapa !== "pago"))
    .reduce((s, f) => s + Number(f.valor || 0), 0);

  return (
    <div>
      <PageHeader title="Financeiro" subtitle="Da emissão até a baixa" action={<AddButton label="Novo lançamento" onClick={onAdd} />} />

      <div className="px-10 flex items-center justify-between mb-5">
        <div className="flex gap-1 bg-white border border-[#E4EAEC] rounded-lg p-1 w-fit">
          <TabButton active={tipoView === "receber"} onClick={() => setTipoView("receber")} label="A receber" />
          <TabButton active={tipoView === "pago"} onClick={() => setTipoView("pago")} label="A pagar" />
        </div>
        <div className="text-sm text-[#5B7285]">
          {tipoView === "receber" ? "Ainda não recebido: " : "Ainda não pago: "}
          <span className="font-mono font-600 text-[#0B2540]">{currency(pendente)}</span>
        </div>
      </div>

      <div className="px-10 pb-10 grid grid-cols-4 gap-4">
        {FIN_STAGES.map((s) => {
          const label = tipoView === "receber" ? s.labelReceber : s.labelPagar;
          const colItems = items.filter((f) => f.etapa === s.key);
          return (
            <div key={s.key}>
              <div className="flex items-center gap-2 mb-3">
                <span style={{ background: FIN_STAGE_COLOR[s.key] }} className="w-2 h-2 rounded-full" />
                <span className="text-xs font-medium text-[#5B7285] uppercase tracking-wide">{label}</span>
                <span className="text-xs text-[#B9C4CC] font-mono">{colItems.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {colItems.length === 0 && clients.length > 0 && (
                  <div className="text-xs text-[#B9C4CC] italic py-2">vazio</div>
                )}
                {colItems.map((f) => {
                  const dl = daysUntil(f.vencimento);
                  const late = dl !== null && dl < 0 && s.key !== "pago" && s.key !== "baixado";
                  return (
                    <div key={f.id} className="bg-white rounded-lg border border-[#E4EAEC] p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium text-[#0B2540] leading-snug">{f.descricao}</div>
                        <button onClick={() => onRemove(f.id)} className="text-[#D7E0E4] hover:text-[#D9534F] flex-shrink-0">
                          <X size={13} />
                        </button>
                      </div>
                      <div className="text-xs text-[#8098A8] mt-1">{clientName(f.client_id)}</div>
                      <div className="font-mono text-sm text-[#0B2540] mt-1">{currency(f.valor)}</div>
                      {f.vencimento && (
                        <div className={`text-[11px] font-mono mt-1 ${late ? "text-[#D9534F]" : "text-[#8098A8]"}`}>
                          {late ? "Venceu · " : "vence "}
                          {new Date(f.vencimento + "T00:00:00").toLocaleDateString("pt-BR")}
                        </div>
                      )}
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {FIN_STAGES.filter((s2) => s2.key !== f.etapa).map((s2) => (
                          <button
                            key={s2.key}
                            onClick={() => onMove(f.id, s2.key)}
                            className="text-[10px] px-1.5 py-0.5 rounded border border-[#E4EAEC] text-[#5B7285] hover:border-[#17B8C4] hover:text-[#17B8C4] transition"
                          >
                            {tipoView === "receber" ? s2.labelReceber : s2.labelPagar}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {clients.length === 0 && (
        <div className="px-10 -mt-2 pb-8">
          <EmptyState text="Cadastre um cliente primeiro para lançar cobranças ou contas." />
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{ background: active ? "#17B8C4" : "transparent", color: active ? "white" : "#5B7285" }}
      className="text-sm font-medium px-3.5 py-1.5 rounded-md transition"
    >
      {label}
    </button>

function FinanceModal({ clients, onClose, onSave }) {
  const [tipo, setTipo] = useState("receber");
  const [descricao, setDescricao] = useState("");
  const [client_id, setClientId] = useState(clients[0]?.id || "");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");
  return (
    <Modal title="Novo lançamento" onClose={onClose}>
      <Field label="Tipo">
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="input">
          <option value="receber">A receber</option>
          <option value="pago">A pagar</option>
        </select>
      </Field>
      <Field label="Descrição">
        <input autoFocus value={descricao} onChange={(e) => setDescricao(e.target.value)} className="input" placeholder="Ex: Mensalidade BPO — julho" />
      </Field>
      <Field label="Cliente">
        <select value={client_id} onChange={(e) => setClientId(e.target.value)} className="input">
          <option value="">—</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </Field>
      <Field label="Valor (R$)">
        <input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} className="input" placeholder="0,00" />
      </Field>
      <Field label="Vencimento (opcional)">
        <input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} className="input" />
      </Field>
      <ModalActions
        onClose={onClose}
        onSave={() => descricao.trim() && onSave({ tipo, descricao, client_id: client_id || null, valor: valor || 0, vencimento: vencimento || null })}
        disabled={!descricao.trim()}
      />
    </Modal>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-[#0B2540]/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-600 text-[#0B2540]">{title}</h3>
          <button onClick={onClose} className="text-[#B9C4CC] hover:text-[#0B2540]"><X size={18} /></button>
        </div>
        {children}
        <style>{`.input { width:100%; border:1px solid #E4EAEC; border-radius:8px; padding:8px 10px; font-size:14px; color:#1B2A3A; outline:none; } .input:focus { border-color:#17B8C4; }`}</style>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="text-xs font-medium text-[#5B7285] block mb-1">{label}</label>
      {children}
    </div>
  );
}

function ModalActions({ onClose, onSave, disabled }) {
  return (
    <div className="flex gap-2 mt-5">
      <button onClick={onClose} className="flex-1 text-sm font-medium text-[#5B7285] border border-[#E4EAEC] rounded-lg py-2 hover:bg-[#F5F8F9]">
        Cancelar
      </button>
      <button
        onClick={onSave}
        disabled={disabled}
        style={{ background: disabled ? "#CFE9EB" : "#17B8C4" }}
        className="flex-1 text-sm font-medium text-white rounded-lg py-2 disabled:cursor-not-allowed hover:brightness-95 transition"
      >
        Salvar
      </button>
    </div>
  );
}

/* ---------------- R&S ---------------- */
function RSView({ clients, vagas, candidatos, clientName, onAddVaga, onRemoveVaga, onAddCandidato, onMoveCandidato, onRemoveCandidato }) {
  const [selectedVaga, setSelectedVaga] = useState(null);
  const vaga = vagas.find((v) => v.id === selectedVaga);

  if (vaga) {
    const items = candidatos.filter((c) => c.vaga_id === vaga.id);
    return (
      <div>
        <div className="flex items-start justify-between px-10 pt-9 pb-6">
          <div>
            <button onClick={() => setSelectedVaga(null)} className="flex items-center gap-1 text-xs text-[#5B7285] mb-2 hover:text-[#0B2540]">
              <ArrowLeft size={13} /> Todas as vagas
            </button>
            <h1 className="font-display font-700 text-2xl text-[#0B2540]">{vaga.titulo}</h1>
            <p className="text-sm text-[#5B7285] mt-1">{clientName(vaga.client_id)} · {items.length} candidato{items.length !== 1 ? "s" : ""}</p>
          </div>
          <AddButton label="Novo candidato" onClick={() => onAddCandidato(vaga.id)} />
        </div>

        <div className="px-10 pb-10 grid grid-cols-5 gap-3">
          {RS_STAGES.map((s) => {
            const colItems = items.filter((c) => c.etapa === s.key);
            return (
              <div key={s.key}>
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ background: RS_STAGE_COLOR[s.key] }} className="w-2 h-2 rounded-full flex-shrink-0" />
                  <span className="text-xs font-medium text-[#5B7285] uppercase tracking-wide">{s.label}</span>
                  <span className="text-xs text-[#B9C4CC] font-mono">{colItems.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {colItems.length === 0 && <div className="text-xs text-[#B9C4CC] italic py-2">vazio</div>}
                  {colItems.map((c) => (
                    <div key={c.id} className="bg-white rounded-lg border border-[#E4EAEC] p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium text-[#0B2540] leading-snug">{c.nome}</div>
                        <button onClick={() => onRemoveCandidato(c.id)} className="text-[#D7E0E4] hover:text-[#D9534F] flex-shrink-0">
                          <X size={13} />
                        </button>
                      </div>
                      {c.contato && <div className="text-xs text-[#8098A8] mt-1">{c.contato}</div>}
                      {c.curriculo_url && (
                        <a href={c.curriculo_url} target="_blank" rel="noreferrer" className="text-[11px] text-[#17B8C4] underline mt-1 inline-block">
                          Ver currículo
                        </a>
                      )}
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {RS_STAGES.filter((s2) => s2.key !== c.etapa).map((s2) => (
                          <button
                            key={s2.key}
                            onClick={() => onMoveCandidato(c.id, s2.key)}
                            className="text-[10px] px-1.5 py-0.5 rounded border border-[#E4EAEC] text-[#5B7285] hover:border-[#17B8C4] hover:text-[#17B8C4] transition"
                          >
                            {s2.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Recrutamento & Seleção" subtitle={`${vagas.length} vaga${vagas.length !== 1 ? "s" : ""}`} action={<AddButton label="Nova vaga" onClick={onAddVaga} />} />
      <div className="px-10 pb-10">
        {vagas.length === 0 ? (
          <EmptyState text="Nenhuma vaga cadastrada ainda. Cadastre a primeira pra começar o funil de candidatos." />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {vagas.map((v) => {
              const items = candidatos.filter((c) => c.vaga_id === v.id);
              return (
                <div key={v.id} onClick={() => setSelectedVaga(v.id)} className="bg-white rounded-xl border border-[#E4EAEC] p-5 cursor-pointer hover:border-[#17B8C4] transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-display font-600 text-[#0B2540]">{v.titulo}</div>
                      <div className="text-xs text-[#8098A8] mt-0.5">{clientName(v.client_id)}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onRemoveVaga(v.id); }} className="text-[#B9C4CC] hover:text-[#D9534F] transition">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span
                      style={{ background: v.status === "aberta" ? "#DFF5EE" : "#FDF1DD", color: v.status === "aberta" ? "#2FA88A" : "#D9822B" }}
                      className="px-2 py-0.5 rounded-full font-medium"
                    >
                      {v.status === "aberta" ? "Aberta" : "Fechada"}
                    </span>
                    <span className="text-[#8098A8]">{items.length} candidato{items.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function VagaModal({ clients, onClose, onSave }) {
  const [titulo, setTitulo] = useState("");
  const [client_id, setClientId] = useState(clients[0]?.id || "");
  const [status, setStatus] = useState("aberta");
  return (
    <Modal title="Nova vaga" onClose={onClose}>
      {clients.length === 0 ? (
        <div className="text-sm text-[#8098A8]">Cadastre um cliente antes de criar uma vaga.</div>
      ) : (
        <>
          <Field label="Título da vaga">
            <input autoFocus value={titulo} onChange={(e) => setTitulo(e.target.value)} className="input" placeholder="Ex: Assistente administrativo" />
          </Field>
          <Field label="Cliente">
            <select value={client_id} onChange={(e) => setClientId(e.target.value)} className="input">
              {clients.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
              <option value="aberta">Aberta</option>
              <option value="fechada">Fechada</option>
            </select>
          </Field>
          <ModalActions onClose={onClose} onSave={() => titulo.trim() && onSave({ titulo, client_id, status })} disabled={!titulo.trim()} />
        </>
      )}
    </Modal>
  );
}

function CandidatoModal({ vagaId, onClose, onSave }) {
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  return (
    <Modal title="Novo candidato" onClose={onClose}>
      <Field label="Nome">
        <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} className="input" placeholder="Nome do candidato" />
      </Field>
      <Field label="Contato (opcional)">
        <input value={contato} onChange={(e) => setContato(e.target.value)} className="input" placeholder="E-mail ou telefone" />
      </Field>
      <ModalActions onClose={onClose} onSave={() => nome.trim() && onSave({ nome, contato, vaga_id: vagaId })} disabled={!nome.trim()} />
    </Modal>
  );
}




    
  );
}
