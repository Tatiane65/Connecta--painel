import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function PublicVagas() {
  const [vagas, setVagas] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openVaga, setOpenVaga] = useState(null);

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

  return (
    <div style={{ background: "#F5F8F9", minHeight: "100vh", fontFamily: "Inter, sans-serif" }} className="text-[#1B2A3A]">
      <style>{`.font-display { font-family: 'Space Grotesk', sans-serif; }`}</style>

      <header style={{ background: "#0B2540" }} className="px-6 py-8 text-center">
        <div className="font-display font-700 text-white text-2xl">Connecta</div>
        <div style={{ color: "#7FA3B8" }} className="text-sm mt-1">Vagas abertas</div>
      </header>

      <main className="max-w-xl mx-auto px-5 py-8">
        {loading ? (
          <div className="text-center text-sm text-[#5B7285] py-10">Carregando vagas…</div>
        ) : vagas.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-[#D7E0E4] py-12 text-center text-sm text-[#8098A8]">
            Nenhuma vaga aberta no momento. Volte em breve!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {vagas.map((v) => (
              <div key={v.id} className="bg-white rounded-xl border border-[#E4EAEC] overflow-hidden">
                <button
                  onClick={() => setOpenVaga(openVaga === v.id ? null : v.id)}
                  className="w-full text-left p-5 flex items-center justify-between"
                >
                  <div>
                    <div className="font-display font-600 text-[#0B2540]">{v.titulo}</div>
                    {clientName(v.client_id) && <div className="text-xs text-[#8098A8] mt-0.5">{clientName(v.client_id)}</div>}
                  </div>
                  <span style={{ background: "#17B8C4" }} className="text-white text-xs font-medium px-3 py-1.5 rounded-lg flex-shrink-0">
                    {openVaga === v.id ? "Fechar" : "Candidatar-se"}
                  </span>
                </button>
                {openVaga === v.id && <CandidaturaForm vagaId={v.id} onDone={() => setOpenVaga(null)} />}
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-[#B9C4CC] pb-8">
        Connecta Gestão Integrada
      </footer>
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
        style={{ background: !nome.trim() || status === "sending" ? "#CFE9EB" : "#17B8C4" }}
        className="w-full text-white text-sm font-medium py-2.5 rounded-lg disabled:cursor-not-allowed hover:brightness-95 transition"
      >
        {status === "sending" ? "Enviando…" : "Enviar candidatura"}
      </button>
    </div>
  );
}
