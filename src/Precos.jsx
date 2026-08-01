import React from "react";

const WHATSAPP_NUMBER = "5519984071886";

function waLink(pacote) {
  const msg = `Olá! Tenho interesse no pacote "${pacote}" da Connecta. Gostaria de solicitar um orçamento.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function PackageCard({ nome, preco, sub, items, destaque }) {
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
      <div className="flex items-baseline gap-1 mt-1">
        <span className="font-display font-700 text-2xl text-[#0B2540]">{preco}</span>
      </div>
      {sub && <div className="text-xs text-[#8098A8] mb-3">{sub}</div>}
      <ul className="flex-1 mt-2 mb-4 space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="text-sm text-[#1B2A3A] flex gap-2">
            <span style={{ color: "#17B8C4" }}>•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
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
        <div style={{ color: "#7FA3B8" }} className="text-sm mt-1">Gestão Integrada</div>
        <p className="text-white/90 text-sm mt-4 max-w-md mx-auto">
          BPO administrativo, financeiro e recrutamento para pequenas empresas.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-10">
        <Section title="eSocial Doméstico" subtitle="Cobrado por empregado gerenciado">
          <PackageCard
            nome="Gestão Completa"
            preco="R$ 150"
            sub="por mês, por empregado"
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

        <Section title="Financeiro (BPO)" subtitle="Escolha conforme o volume de lançamentos da sua empresa">
          <PackageCard
            nome="Essencial"
            preco="R$ 1.200"
            sub="/mês · até 50 lançamentos"
            items={[
              "Contas a pagar",
              "Contas a receber",
              "Conciliação bancária",
              "Relatório mensal de fluxo de caixa",
            ]}
          />
          <PackageCard
            nome="Intermediário"
            preco="R$ 2.500"
            sub="/mês · até 150 lançamentos"
            destaque
            items={[
              "Tudo do Essencial",
              "Emissão de notas fiscais (NF-e/NFS-e)",
              "DRE mensal",
              "Fluxo de caixa projetado (30/60/90 dias)",
            ]}
          />
          <PackageCard
            nome="Completo"
            preco="R$ 4.000"
            sub="/mês · acima de 150 lançamentos"
            items={[
              "Tudo do Intermediário",
              "Relatórios por centro de custo/filial",
              "Reunião mensal de análise dos resultados",
              "Acompanhamento de indicadores",
              "Suporte a decisões financeiras",
            ]}
          />
        </Section>

        <Section title="Recrutamento & Seleção" subtitle="Cobrança por vaga fechada ou plano mensal">
          <PackageCard
            nome="Vaga Operacional"
            preco="R$ 600"
            sub="por vaga"
            items={[
              "Divulgação da vaga",
              "Triagem de currículos",
              "Entrevista inicial",
              "Envio de shortlist ao cliente",
            ]}
          />
          <PackageCard
            nome="Vaga Administrativa"
            preco="R$ 1.000"
            sub="por vaga"
            items={[
              "Tudo da vaga operacional",
              "Entrevista técnica e comportamental aprofundada",
              "Checagem de referências",
            ]}
          />
          <PackageCard
            nome="Plano Mensal R&S"
            preco="R$ 2.000"
            sub="/mês · até 3 vagas (operacional ou administrativa)"
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
          Valores de referência para empresas de pequeno porte (5 a 20 funcionários). Proposta final ajustada conforme escopo e volume real.
        </p>
      </main>

      <footer className="text-center text-xs text-[#B9C4CC] pb-8">
        Connecta Gestão Integrada
      </footer>
    </div>
  );
}
