import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabaseClient";

const NAVY = "#0B2540";
const TEAL = "#17B8C4";
const TEAL_DARK = "#129AA4";

export default function PublicVagas() {
  const [vagas, setVagas] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formVaga, setFormVaga] = useState(null);
  const [detalhesVaga, setDetalhesVaga] = useState(null);

  const [busca, setBusca] = useState("");
  const [area, setArea] = useState("");
  const [modalidade, setModalidade] = useState("");

  useEffect(() => {
    (async () => {
      const [v, c] = await Promise.all([
        supabase.from("vagas").select("*").eq("status", "aberta").order("created_at", { ascending: false }),
        supabase.from("clients").select("id, nome"),
      ]);
      setVagas(v.data || []);
      setClients(c.data || []);
      setLoading(false);
    })();
  }, []);

  const clientName = (id) => clients.find((c) => c.id === id)?.nome || "";

  const areas = useMemo(
    () => [...new Set(vagas.map((v) => v.categoria).filter(Boolean))],
    [vagas]
  );
  const modalidades = useMemo(
    () => [...new Set(vagas.map((v) => v.modalidade).filter(Boolean))],
    [vagas]
  );

  const vagasFiltradas = vagas.filter((v) => {
    const matchBusca =
      !busca ||
      v.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
      clientName(v.client_id)?.toLowerCase().includes(busca.toLowerCase()) ||
      v.categoria?.toLowerCase().includes(busca.toLowerCase());
    const matchArea = !area || v.categoria === area;
    const matchModalidade = !modalidade || v.modalidade === modalidade;
    return matchBusca && matchArea && matchModalidade;
  });

  return (
    <div style={{ background: "#F5F8F9", minHeight: "100vh", fontFamily: "Inter, sans-serif" }} className="text-[#1B2A3A]">
      <style>{`.font-display { font-family: 'Space Grotesk', sans-serif; }`}</style>

      <header className="bg-white border-b border-[#E4EAEC] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            style={{ background: NAVY }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display font-700 text-sm"
          >
            C
          </div>
          <span className="font-display font-600 text-[#0B2540]">Portal do Candidato</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div
          style={{ background: `linear-gradient(120deg, ${NAVY} 0%, ${TEAL_DARK} 100%)` }}
          className="rounded-2xl px-6 py-8 sm:py-10 mb-6 relative overflow-hidden"
        >
          <div className="relative z-10">
            <h1 className="font-display font-700 text-white text-2xl sm:text-3xl mb-2">
              🚀 Vagas disponíveis
            </h1>
            <p className="text-[#CFE9EB] text-sm sm:text-base max-w-lg">
              Encontre a oportunidade certa e candidate-se com um clique. Nosso time analisa cada candidatura pessoalmente.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E4EAEC] p-3 mb-6 flex flex-col sm:flex-row gap-2">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título, empresa, área..."
            className="flex-1 border border-[#E4EAEC] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#17B8C4]"
          />
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="border border-[#E4EAEC] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#17B8C4] bg-white"
          >
            <option value="">Todas as áreas</option>
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            value={modalidade}
            onChange={(e) => setModalidade(e.target.value)}
            className="border border-[#E4EAEC] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#17B8C4] bg-white"
          >
            <option value="">Modalidade</option>
            {modalidades.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center text-sm text-[#5B7285] py-10">Carregando vagas…</div>
        ) : vagasFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-[#D7E0E4] py-12 text-center text-sm text-[#8098A8]">
            Nenhuma vaga encontrada com esse filtro.
          </div>
        ) : (
          <>
            <p className="text-sm text-[#8098A8] mb-3">
              {vagasFiltradas.length} vaga{vagasFiltradas.length !== 1 ? "s" : ""} disponíve
              {vagasFiltradas.length !== 1 ? "is" : "l"} no momento
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vagasFiltradas.map((v) => (
                <VagaCard
                  key={v.id}
                  vaga={v}
                  clienteNome={clientName(v.client_id)}
                  detalhesAbertos={detalhesVaga === v.id}
                  formAberto={formVaga === v.id}
                  onToggleDetalhes={() => setDetalhesVaga(detalhesVaga === v.id ? null : v.id)}
                  onToggleForm={() => {
                    setFormVaga(formVaga === v.id ? null : v.id);
                    setDetalhesVaga(null);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="text-center text-xs text-[#B9C4CC] pb-8">
        Connecta Gestão Integrada
      </footer>
    </div>
  );
}

function Badge({ children, tone = "navy" }) {
  const tones = {
    navy: { bg: "#E6EDF2", color: "#0B2540" },
    teal: { bg: "#DFF6F7", color: "#0F8B94" },
    gray: { bg: "#EEF1F2", color: "#5B7285" },
  };
  const t = tones[tone] || tones.navy;
  return (
    <span
      style={{ background: t.bg, color: t.color }}
      className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md"
    >
      {children}
    </span>
  );
}

function VagaCard({ vaga, clienteNome, detalhesAbertos, formAberto, onToggleDetalhes, onToggleForm }) {
  const v = vaga;
  return (
    <div className="bg-white rounded-xl border border-[#E4EAEC] flex flex-col overflow-hidden">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-600 text-[#0B2540] text-base leading-snug">{v.titulo}</h3>
        </div>
        <div className="text-xs text-[#8098A8] mb-3">
          {[clienteNome, v.localizacao].filter(Boolean).join(" · ")}
          {v.codigo && <span className="ml-1 text-[#B9C4CC]">{v.codigo}</span>}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {v.nivel && <Badge tone="navy">{v.nivel}</Badge>}
          {v.modalidade && <Badge tone="teal">{v.modalidade}</Badge>}
          {v.categoria && <Badge tone="gray">{v.categoria}</Badge>}
        </div>

        <div className="space-y-1.5 text-sm text-[#3A4B58]">
          {v.localizacao && (
            <div className="flex items-center gap-1.5">
              <span>📍</span> {v.localizacao}
            </div>
          )}
          {v.salario && (
            <div className="flex items-center gap-1.5">
              <span>💰</span> {v.salario}
            </div>
          )}
          {v.vagas_qtd > 1 && (
            <div className="flex items-center gap-1.5">
              <span>👥</span> {v.vagas_qtd} vagas
            </div>
          )}
          {v.beneficios && (
            <div className="flex items-center gap-1.5 text-[#8098A8] text-xs">
              <span>🎁</span> {v.beneficios}
            </div>
          )}
        </div>

        {detalhesAbertos && v.descricao && (
          <div className="mt-4 pt-4 border-t border-[#E4EAEC] text-sm text-[#3A4B58] whitespace-pre-line">
            {v.descricao}
          </div>
        )}
      </div>

      <div className="px-5 pb-5 flex gap-2">
        <button
          onClick={onToggleDetalhes}
          className="flex-1 text-sm font-medium py-2 rounded-lg border border-[#E4EAEC] text-[#5B7285] hover:bg-[#F5F8F9] transition"
        >
          {detalhesAbertos ? "Ocultar" : "Ver detalhes"}
        </button>
        <button
          onClick={onToggleForm}
          style={{ background: formAberto ? NAVY : TEAL }}
          className="flex-1 text-sm font-medium py-2 rounded-lg text-white hover:brightness-95 transition"
        >
          {formAberto ? "Fechar" : "🚀 Me inscrever"}
        </button>
      </div>

      {formAberto && <CandidaturaForm vagaId={v.id} onDone={onToggleForm} />}
    </div>
  );
}

function CandidaturaForm({ vagaId, onDone }) {
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");

  async function handleSubmit() {
    if (!nome.trim()) return;
    setStatus("sending");
    try {
      let curriculo_url = null;
      if (file) {
        const path = `${vagaId}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("curriculos").upload(path, file);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("curriculos").getPublicUrl(path);
        curriculo_url = pub.publicUrl;
      }
      const { error: insErr } = await supabase.from("candidatos").insert({
        vaga_id: vagaId,
        nome,
        contato,
        etapa: "triagem",
        curriculo_url,
      });
      if (insErr) throw insErr;
      setStatus("done");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="px-5 pb-5">
        <div style={{ background: "#DFF5EE", color: "#2FA88A" }} className="rounded-lg p-4 text-sm font-medium text-center">
          Candidatura enviada! Obrigado pelo interesse.
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pb-5 border-t border-[#E4EAEC] pt-4">
      <div className="mb-3">
        <label className="text-xs font-medium text-[#5B7285] block mb-1">Nome completo</label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border border-[#E4EAEC] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#17B8C4]"
          placeholder="Seu nome"
        />
      </div>
      <div className="mb-3">
        <label className="text-xs font-medium text-[#5B7285] block mb-1">E-mail ou telefone</label>
        <input
          value={contato}
          onChange={(e) => setContato(e.target.value)}
          className="w-full border border-[#E4EAEC] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#17B8C4]"
          placeholder="Como podemos te contatar"
        />
      </div>
      <div className="mb-4">
        <label className="text-xs font-medium text-[#5B7285] block mb-1">Currículo (PDF ou Word)</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-[#5B7285]"
        />
      </div>
      {status === "error" && (
        <div className="text-xs text-[#D9534F] mb-3">Algo deu errado ao enviar. Tenta de novo.</div>
      )}
      <button
        onClick={handleSubmit}
        disabled={!nome.trim() || status === "sending"}
        style={{ background: !nome.trim() || status === "sending" ? "#CFE9EB" : TEAL }}
        className="w-full text-white text-sm font-medium py-2.5 rounded-lg disabled:cursor-not-allowed hover:brightness-95 transition"
      >
        {status === "sending" ? "Enviando…" : "Enviar candidatura"}
      </button>
    </div>
  );
}
