import React from "react";

const WHATSAPP_NUMBER = "5519999264317";

function waLink(pacote) {
  const msg = `Olá! Tenho interesse no serviço "${pacote}" da Connecta. Gostaria de solicitar um orçamento.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function PackageCard({ nome, sub, items, destaque }) {
  return (
    <div
      className={`rounded-xl p-5 flex flex-col ${destaque ? "border-2" : "border"}`}
      style={{ borderColor: destaque ? "#17B8C4" : "#E4EAEC", background: "white" }}
    >
      {destaque && (
        <span
          style={{ background: "#17B8C4" }}
          className="text-white text-[10px] font-medium px-2 py-0.5 rounded-full w-fit mb-2"
        >
          Mais popular
        </span>
      )}
      <div className="font-display font-600 text-[#0B2540] text-lg">{nome}</div>
      {sub && <div className="text-xs text-[#8098A8] mb-3 mt-1">{sub}</div>}
      {items && (
        <ul className="flex-1 mt-2 mb-4 space-y-1.5">
          {items.map((it, i) => (
            <li key={i} className="text-sm text-[#1B2A3A] flex gap-2">
              <span style={{ color: "#17B8C4" }}>•</span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
      {!items && <div className="flex-1 mb-4" />}
      <a
        href={waLink(nome)}
        target="_blank"
        rel="noreferrer"
        style={{ background: "#17B8C4" }}
        className="text-white text-sm font-medium text-center py-2.5 rounded-lg hover:brightness-95 transition"
      >
        Solicitar orçamento
      </a>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <section className="mb-10">
      <h2 className="font-display font-700 text-xl text-[#0B2540] mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-[#5B7285] mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">{children}</div>
    </section>
  );
}

export default function Precos() {
  return (
    <div style={{ background: "#F5F8F9", minHeight: "100vh", fontFamily: "Inter, sans-serif" }} className="text-[#1B2A3A]">
      <style>{`
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      <header style={{ background: "#0B2540" }} className="px-6 py-10 text-center">
        <div className="font-display font-700 text-white text-2xl">Connecta</div>
        <div style={{ color: "#7FA3B8" }} className="text-sm mt-1">Serviços Administrativos</div>
        <p className="text-white/90 text-sm mt-4 max-w-md mx-auto">
          Serviços administrativos, financeiros e de recrutamento para pequenas empresas.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-10">
        <Section title="eSocial Doméstico" subtitle="Cobrado por empregado gerenciado">
          <PackageCard
            nome="Gestão Completa"
            sub="por empregado"
            items={[
              "Admissão (contrato e cadastro no eSocial)",
              "Folha de pagamento mensal",
              "Cálculo e emissão da guia DAE",
              "Compra e gestão de vale-transporte",
              "Controle de férias e 13º salário",
              "Recibos de pagamento",
              "Rescisão (sob consulta)",
            ]}
          />
        </Section>

        <Section title="Serviços Financeiros" subtitle="Contrate o que precisar, separadamente">
          <PackageCard
            nome="Contas a pagar"
            items={["Organização de vencimentos", "Programação de pagamentos"]}
          />
          <PackageCard
            nome="Contas a receber"
            items={["Emissão de cobranças", "Controle de recebimento"]}
          />
          <PackageCard
            nome="Conciliação bancária"
            items={["Conferência de extratos", "Apontamento de divergências"]}
          />
          <PackageCard
            nome="Emissão de notas fiscais"
            items={["Emissão de NF-e / NFS-e", "Organização e envio ao cliente"]}
          />
        </Section>

        <Section title="Recrutamento & Seleção" subtitle="Por vaga fechada ou plano mensal">
          <PackageCard
            nome="Vaga Operacional"
            items={[
              "Divulgação da vaga",
              "Triagem de currículos",
              "Entrevista inicial",
              "Envio de shortlist ao cliente",
            ]}
          />
          <PackageCard
            nome="Vaga Administrativa"
            items={[
              "Tudo da vaga operacional",
              "Entrevista técnica e comportamental aprofundada",
              "Checagem de referências",
            ]}
          />
          <PackageCard
            nome="Plano Mensal R&S"
            sub="até 3 vagas (operacional ou administrativa)"
            destaque
            items={[
              "Até 3 vagas fechadas por mês",
              "Mistura livre entre operacional e administrativa",
              "Divulgação, triagem e entrevistas inclusas",
              "Ideal para quem contrata com frequência",
            ]}
          />
        </Section>

        <p className="text-xs text-[#8098A8] text-center mt-8">
          Serviços para empresas de pequeno porte (5 a 20 funcionários). Escopo e valor ajustados conforme sua necessidade — fale com a gente.
        </p>
      </main>

      <footer className="text-center text-xs text-[#B9C4CC] pb-8">
        Connecta Serviços Administrativos
      </footer>
    </div>
  );
}
