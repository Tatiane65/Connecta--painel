import React from "react";

const WHATSAPP_NUMBER = "5519999264317";

const LINKS = [
  {
    label: "Ver planos e preços",
    sub: "Financeiro, eSocial doméstico e R&S",
    href: "/precos.html",
  },
  {
    label: "Vagas abertas",
    sub: "Veja as oportunidades e candidate-se",
    href: "/vagas.html",
  },
  {
    label: "Falar no WhatsApp",
    sub: "Tire dúvidas ou peça um orçamento",
    href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Vim pelo Instagram da Connecta.")}`,
  },
];

export default function LinkBio() {
  return (
    <div style={{ background: "#0B2540", minHeight: "100vh", fontFamily: "Inter, sans-serif" }} className="text-white flex flex-col items-center px-5 py-14">
      <style>{`.font-display { font-family: 'Space Grotesk', sans-serif; }`}</style>

      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#17B8C4" }}>
        <span className="font-display font-700 text-2xl text-[#0B2540]">C</span>
      </div>
      <div className="font-display font-700 text-xl">Connecta</div>
      <div style={{ color: "#7FA3B8" }} className="text-sm mb-8">Gestão Integrada</div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : "_self"}
            rel="noreferrer"
            className="bg-white rounded-xl px-5 py-4 hover:brightness-95 transition"
          >
            <div className="font-display font-600 text-[#0B2540]">{link.label}</div>
            <div className="text-xs text-[#5B7285] mt-0.5">{link.sub}</div>
          </a>
        ))}
      </div>

      <div style={{ color: "#7FA3B8" }} className="text-xs mt-10">
        @connectagestaointegrada
      </div>
    </div>
  );
}
