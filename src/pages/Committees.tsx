import { useEffect, useState } from "react";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import matrices from "@/data/matrices.json";

import pageBg from "@/assets/committees/page-bg.avif";
import bg1 from "@/assets/committees/UNSC.webp";
import bg2 from "@/assets/committees/uncndbg.png";
import bg3 from "@/assets/committees/ungalegal.jpg";
import bg4 from "@/assets/committees/adhocbg.jpg";
import bg5 from "@/assets/committees/ccsbg.png";
import bg6 from "@/assets/committees/aippmbg.webp";
import bg7 from "@/assets/committees/internationalpress.png";

import logoUnsc from "@/assets/committees/unsc-logo.png";
import logoUncnd from "@/assets/committees/uncnd-logo.png";
import logoUnga from "@/assets/committees/unga-logo.png";
import logoAdhoc from "@/assets/committees/adhoc-logo.png";
import logoCcs from "@/assets/committees/ccs-logo.png";
import logoAippm from "@/assets/committees/aippm-logo.png";
import logoIp from "@/assets/committees/ip-logo.png";

type Bar = {
  bg: string;
  logo: string;
  acronym: string;
  name: string;
  agenda?: string;
  agendaClassified?: boolean;
  acronymStyle?: React.CSSProperties;
  matrixKey?: "UNSC" | "UNCND" | "UNGALEGAL" | "IPJ" | "AIPPM";
};

const bars: Bar[] = [
  {
    bg: bg1, logo: logoUnsc, acronym: "UNSC",
    name: "United Nations<br/>Security Council",
    agenda: "Deliberation on Rising Maritime Tensions in Strategically Important Waterways, with Emphasis on the Strait of Hormuz, Freedom of Navigation, and the Protection of International Maritime Law under UNCLOS",
    matrixKey: "UNSC",
  },
  {
    bg: bg2, logo: logoUncnd, acronym: "UNCND",
    name: "United Nations Commission on<br/>Narcotics and Drugs",
    agenda: "Deliberating on the Growing Global Fentanyl Crisis, the Spread of Synthetic Drug Networks, and the Inability of International Systems to Stop Cross-Border Drug Trafficking",
    matrixKey: "UNCND",
  },
  {
    bg: bg3, logo: logoUnga, acronym: "UNGA LEGAL",
    name: "United Nations<br/>General Assembly",
    agenda: "Strengthening International Responses Against State-Sponsored Cyber Operations, Digital Espionage, and Transnational Cybercrime, with Special Emphasis on Key Cases Handled by the United States Department of Justice",
    matrixKey: "UNGALEGAL",
  },
  {
    bg: bg4, logo: logoAdhoc, acronym: "AD-HOC",
    name: "Ad-Hoc Committee",
    agenda: "Agenda and cabinet to be released 2 weeks prior",
    acronymStyle: { fontSize: "clamp(0.78rem,1vw,1.2rem)", letterSpacing: "0.13em" },
  },
  {
    bg: bg5, logo: logoCcs, acronym: "CCS",
    name: "Cabinet Committee<br/>on Security",
    agenda: "CLASSIFIED", agendaClassified: true,
  },
  {
    bg: bg6, logo: logoAippm, acronym: "AIPPM",
    name: "All India Political<br/>Parties Meet",
    matrixKey: "AIPPM",
  },
  {
    bg: bg7, logo: logoIp, acronym: "IP",
    name: "International<br/>Press",
    agenda: "Photography, Journalism and Caricature",
    matrixKey: "IPJ",
  },
];

const Committees = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [matrixOpen, setMatrixOpen] = useState<string | null>(null);

  useEffect(() => {
    const pc = document.getElementById("ashe-particles");
    if (pc && pc.childElementCount === 0) {
      for (let i = 0; i < 28; i++) {
        const p = document.createElement("div");
        p.className = "ashe-particle";
        const size = Math.random() * 2.5 + 1;
        p.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;animation-duration:${6 + Math.random() * 10}s;animation-delay:${Math.random() * 10}s;opacity:${0.3 + Math.random() * 0.5};`;
        pc.appendChild(p);
      }
    }

    const cleanups: Array<() => void> = [];

    document.querySelectorAll<HTMLElement>(".ashe-bar").forEach((bar) => {
      const move = (e: MouseEvent) => {
        if (window.innerWidth <= 768) return;
        const r = bar.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        const bg = bar.querySelector<HTMLElement>(".ashe-bar-bg");
        if (bg) bg.style.transform = `scale(1.05) translate(${x * 12}px,${y * 8}px)`;
      };
      const leave = () => {
        const bg = bar.querySelector<HTMLElement>(".ashe-bar-bg");
        if (bg) bg.style.transform = "";
      };
      bar.addEventListener("mousemove", move);
      bar.addEventListener("mouseleave", leave);
      cleanups.push(() => {
        bar.removeEventListener("mousemove", move);
        bar.removeEventListener("mouseleave", leave);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <PageTransition>
      <SEO
        title="Committees — Ashe MUN 2026"
        description="Explore the Ashe MUN 2026 committees: UNSC, UNCND, UNGA Legal, Ad-Hoc, CCS, AIPPM and International Press."
        path="/committees"
      />

      <style>{`
        .ashe-root {
          position: relative;
          min-height: calc(100vh - 80px);
          background: #020408;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .ashe-page-bg {
          position: absolute; inset: 0; z-index: 0;
          background-image: url(${pageBg});
          background-size: cover; background-position: center;
          filter: brightness(0.4) saturate(0.65);
          animation: asheBgBreath 10s ease-in-out infinite;
        }
        @keyframes asheBgBreath {
          0%,100% { filter: brightness(0.4) saturate(0.65); }
          50% { filter: brightness(0.48) saturate(0.75); }
        }
        .ashe-particles { position: absolute; inset: 0; z-index: 1; pointer-events: none; overflow: hidden; }
        .ashe-particle {
          position: absolute; border-radius: 50%;
          background: rgba(201,168,76,0.5);
          animation: asheFloatUp linear infinite;
        }
        @keyframes asheFloatUp {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-10vh) scale(1); opacity: 0; }
        }
        .ashe-scanline {
          position: absolute; inset: 0; z-index: 2; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
        }
        .ashe-bars-area {
          position: relative; z-index: 5;
          flex: 1; display: flex;
          align-items: center; justify-content: center;
          padding: 140px 40px 32px;
        }
        .ashe-bars-wrapper {
          display: flex; flex-direction: row;
          align-items: center; justify-content: center;
          gap: 10px; height: 70vh; width: 100%; max-width: 1280px;
        }
        .ashe-bar {
          position: relative; height: 100%; flex: 1; min-width: 0;
          border-radius: 22px; overflow: hidden; cursor: pointer;
          transition: flex 0.6s cubic-bezier(.4,0,.2,1), box-shadow 0.5s ease;
          background: rgba(6,10,22,0.5);
          opacity: 0; animation: asheBarIn 0.7s cubic-bezier(.4,0,.2,1) forwards;
        }
        .ashe-bar:nth-child(1) { animation-delay: 0.1s; }
        .ashe-bar:nth-child(2) { animation-delay: 0.22s; }
        .ashe-bar:nth-child(3) { animation-delay: 0.34s; }
        .ashe-bar:nth-child(4) { animation-delay: 0.46s; }
        .ashe-bar:nth-child(5) { animation-delay: 0.58s; }
        .ashe-bar:nth-child(6) { animation-delay: 0.70s; }
        .ashe-bar:nth-child(7) { animation-delay: 0.82s; }
        @keyframes asheBarIn {
          from { opacity: 0; transform: translateY(40px) scale(0.94); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .ashe-bars-wrapper:has(.ashe-bar:hover) .ashe-bar:not(:hover) { flex: 0.3; }
        .ashe-bar:hover {
          flex: 4.8;
          box-shadow: 0 0 0 1px rgba(201,168,76,0.45), 0 30px 90px rgba(0,0,0,0.8), 0 0 80px rgba(201,168,76,0.1);
        }
        .ashe-bar-bg {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          filter: brightness(0.28) saturate(0.5);
          transition: filter 0.65s ease, transform 0.8s cubic-bezier(.4,0,.2,1);
          will-change: transform, filter;
        }
        .ashe-bar:hover .ashe-bar-bg { filter: brightness(0.45) saturate(0.9); transform: scale(1.05); }
        .ashe-bar-gradient {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(180deg, rgba(4,8,20,0.2) 0%, transparent 35%, rgba(4,8,20,0.5) 70%, rgba(4,8,20,0.95) 100%);
          transition: opacity 0.5s;
        }
        .ashe-bar:hover .ashe-bar-gradient { opacity: 0.15; }
        .ashe-bar-shimmer {
          position: absolute; inset: 0; z-index: 2;
          background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%);
          background-size: 200% 100%; opacity: 0;
          transition: opacity 0.3s; pointer-events: none;
        }
        .ashe-bar:hover .ashe-bar-shimmer { opacity: 1; animation: asheShimmerSweep 1.5s ease infinite; }
        @keyframes asheShimmerSweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .ashe-bar-border {
          position: absolute; inset: 0; border-radius: 22px;
          border: 1px solid rgba(201,168,76,0.1);
          z-index: 6; pointer-events: none;
          transition: border-color 0.4s, box-shadow 0.4s;
        }
        .ashe-bar:hover .ashe-bar-border { border-color: rgba(201,168,76,0.55); box-shadow: inset 0 0 60px rgba(201,168,76,0.04); }
        .ashe-corner { position: absolute; z-index: 6; pointer-events: none; width: 16px; height: 16px; opacity: 0; transition: opacity 0.4s 0.1s; }
        .ashe-bar:hover .ashe-corner { opacity: 1; }
        .ashe-corner.tl { top: 10px; left: 10px; border-top: 1px solid #c9a84c; border-left: 1px solid #c9a84c; }
        .ashe-corner.tr { top: 10px; right: 10px; border-top: 1px solid #c9a84c; border-right: 1px solid #c9a84c; }
        .ashe-corner.bl { bottom: 10px; left: 10px; border-bottom: 1px solid #c9a84c; border-left: 1px solid #c9a84c; }
        .ashe-corner.br { bottom: 10px; right: 10px; border-bottom: 1px solid #c9a84c; border-right: 1px solid #c9a84c; }
        .ashe-collapsed {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
          display: flex; flex-direction: column; align-items: center;
          padding-bottom: 22px;
          transition: opacity 0.25s, transform 0.25s;
        }
        .ashe-bar:hover .ashe-collapsed { opacity: 0; transform: translateY(10px); pointer-events: none; }
        .ashe-logo-sm {
          width: 36px; height: 36px; object-fit: contain;
          opacity: 0.72; filter: drop-shadow(0 0 5px rgba(75,156,211,0.4));
          animation: asheLogoFloat 3s ease-in-out infinite;
        }
        @keyframes asheLogoFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .ashe-bar-divider {
          width: 1px; height: 22px; margin: 6px 0 5px;
          background: linear-gradient(to bottom, rgba(201,168,76,0.7), transparent);
          animation: asheDividerPulse 2s ease-in-out infinite;
        }
        @keyframes asheDividerPulse {
          0%,100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .ashe-acronym {
          font-family: 'Space Grotesk', sans-serif; font-weight: 700;
          font-size: clamp(0.58rem, 0.78vw, 0.86rem); color: #fff;
          letter-spacing: 0.28em;
          writing-mode: vertical-rl; transform: rotate(180deg);
          white-space: nowrap;
          text-shadow: 0 2px 10px rgba(0,0,0,1); opacity: 0.88;
        }
        .ashe-expanded {
          position: absolute; inset: 0; z-index: 4;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px; padding: 24px 20px; text-align: center;
          opacity: 0; transform: translateY(16px) scale(0.95);
          transition: opacity 0.45s 0.12s, transform 0.45s 0.12s;
          pointer-events: none;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 70%, transparent 100%);
        }
        .ashe-bar:hover .ashe-expanded { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
        .ashe-logo-lg {
          width: 80px; height: 80px; object-fit: contain;
          filter: drop-shadow(0 0 24px rgba(75,156,211,0.9));
          margin-bottom: 4px;
          transition: transform 0.6s cubic-bezier(.4,0,.2,1), filter 0.6s;
          animation: asheLogoGlow 2.5s ease-in-out infinite;
        }
        @keyframes asheLogoGlow {
          0%,100% { filter: drop-shadow(0 0 18px rgba(75,156,211,0.7)); }
          50% { filter: drop-shadow(0 0 32px rgba(75,156,211,1)); }
        }
        .ashe-bar:hover .ashe-logo-lg { transform: scale(1.08) translateY(-5px); }
        .ashe-exp-acronym {
          font-family: 'Space Grotesk', sans-serif; font-weight: 700;
          font-size: clamp(1.3rem, 2vw, 2.2rem);
          color: #fff; letter-spacing: 0.22em;
          text-shadow: 0 2px 30px rgba(0,0,0,1), 0 0 60px rgba(0,0,0,0.8);
        }
        .ashe-exp-line {
          width: 0; height: 1px;
          background: linear-gradient(to right, transparent, #c9a84c, transparent);
          transition: width 0.5s 0.2s ease;
        }
        .ashe-bar:hover .ashe-exp-line { width: 50px; }
        .ashe-exp-name {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.78rem, 1vw, 1.1rem);
          color: #ffffff;
          font-weight: 600; line-height: 1.6; letter-spacing: 0.06em;
          text-shadow: 0 2px 16px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,0.9);
          opacity: 0; transform: translateY(8px);
          transition: opacity 0.4s 0.32s, transform 0.4s 0.32s;
        }
        .ashe-bar:hover .ashe-exp-name { opacity: 1; transform: translateY(0); }

        .ashe-agenda {
          font-family: 'Inter', sans-serif;
          font-size: clamp(0.7rem, 0.82vw, 0.9rem);
          color: rgba(230, 240, 255, 0.92);
          font-weight: 400; line-height: 1.65; letter-spacing: 0.02em;
          text-align: center; max-width: 82%; margin-top: 6px;
          opacity: 0; transform: translateY(6px);
          transition: opacity 0.4s 0.4s, transform 0.4s 0.4s;
          border-top: 1px solid rgba(201,168,76,0.3);
          padding-top: 10px;
          text-shadow: 0 1px 12px rgba(0,0,0,1), 0 0 30px rgba(0,0,0,0.8);
        }
        .ashe-bar:hover .ashe-agenda { opacity: 1; transform: translateY(0); }
        .ashe-matrix-btn {
          margin-top: 12px;
          align-self: center;
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.65rem, 0.78vw, 0.82rem);
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #c9a84c;
          background: rgba(201,168,76,0.08);
          border: 1px solid rgba(201,168,76,0.5);
          border-radius: 999px;
          padding: 7px 18px;
          cursor: pointer;
          opacity: 0; transform: translateY(6px);
          transition: opacity 0.4s 0.46s, transform 0.4s 0.46s, background 0.25s, box-shadow 0.25s, color 0.25s;
          text-shadow: 0 1px 10px rgba(0,0,0,0.9);
        }
        .ashe-bar:hover .ashe-matrix-btn { opacity: 1; transform: translateY(0); }
        .ashe-matrix-btn:hover {
          background: rgba(201,168,76,0.85);
          color: #0a0f1c;
          box-shadow: 0 0 24px rgba(201,168,76,0.45);
        }
        .ashe-agenda--classified {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.75rem, 0.95vw, 1rem);
          color: #c9a84c; letter-spacing: 0.35em; font-weight: 700;
          text-shadow: 0 0 20px rgba(201,168,76,0.8), 0 2px 10px rgba(0,0,0,1);
          border-top: 1px solid rgba(201,168,76,0.35);
        }

        @media (max-width: 768px) {
          .ashe-root { min-height: auto; overflow: visible; }
          .ashe-bars-area { padding: 96px 12px 28px; display: block; height: auto; }
          .ashe-bars-wrapper {
            flex-direction: column; height: auto; gap: 10px;
            max-width: 100%; align-items: stretch;
          }
          .ashe-bar {
            flex: none !important; width: 100%; height: 68px;
            border-radius: 14px;
            transition: height 180ms ease-out, box-shadow 180ms ease-out;
            animation-delay: 0s !important;
            touch-action: manipulation;
          }
          .ashe-bars-wrapper:has(.ashe-bar:hover) .ashe-bar:not(:hover) { flex: none; }
          .ashe-bar:hover { flex: none !important; }
          .ashe-bar.active {
            height: 340px !important;
            box-shadow: 0 0 0 1px rgba(201,168,76,0.5), 0 10px 40px rgba(0,0,0,0.75), 0 0 40px rgba(201,168,76,0.08);
          }
          .ashe-bar-bg { filter: brightness(0.32) saturate(0.6) !important; transition: filter 180ms ease-out, transform 180ms ease-out !important; }
          .ashe-bar.active .ashe-bar-bg { filter: brightness(0.45) saturate(0.9) !important; transform: scale(1.04) !important; }
          .ashe-bar-gradient { transition: opacity 160ms ease-out !important; }
          .ashe-bar.active .ashe-bar-gradient { opacity: 0.15 !important; }
          .ashe-bar-shimmer { display: none; }
          .ashe-corner { display: none; }
          .ashe-bar-border { border-radius: 14px !important; }
          .ashe-bar.active .ashe-bar-border { border-color: rgba(201,168,76,0.5) !important; }

          .ashe-collapsed {
            position: absolute !important;
            top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: flex-start !important;
            padding: 0 18px !important;
            gap: 14px !important;
            height: auto !important; width: auto !important;
            z-index: 4 !important;
            opacity: 1 !important;
            transform: none !important;
            transition: opacity 120ms ease-out !important;
            pointer-events: auto !important;
          }
          .ashe-bar.active .ashe-collapsed { opacity: 0 !important; pointer-events: none !important; }
          .ashe-logo-sm { width: 32px !important; height: 32px !important; flex-shrink: 0; animation: none !important; opacity: 1; }
          .ashe-bar-divider { width: 1px !important; height: 26px !important; flex-shrink: 0; margin: 0 !important; }
          .ashe-acronym {
            writing-mode: horizontal-tb !important;
            transform: none !important;
            font-size: clamp(0.8rem, 4.5vw, 1.05rem) !important;
            letter-spacing: 0.2em !important;
            white-space: nowrap !important;
          }

          .ashe-expanded {
            position: absolute !important; inset: 0 !important;
            gap: 7px !important; padding: 18px 16px !important;
            opacity: 0 !important; transform: translateY(10px) !important;
            transition: opacity 160ms ease-out, transform 160ms ease-out !important;
            pointer-events: none !important;
            overflow: hidden !important;
          }
          .ashe-bar.active .ashe-expanded { opacity: 1 !important; transform: translateY(0) !important; pointer-events: auto !important; }
          .ashe-logo-lg {
            width: 46px !important; height: 46px !important;
            animation: none !important; transition: none !important;
            filter: drop-shadow(0 0 12px rgba(75,156,211,0.85)) !important;
          }
          .ashe-bar.active .ashe-logo-lg { transform: none !important; }
          .ashe-exp-acronym { font-size: clamp(1rem, 5.5vw, 1.4rem) !important; letter-spacing: 0.2em !important; }
          .ashe-exp-line { width: 40px !important; transition: none !important; }
          .ashe-exp-name {
            font-size: clamp(0.7rem, 3.4vw, 0.9rem) !important;
            opacity: 1 !important; transform: none !important; transition: none !important;
            line-height: 1.5 !important;
          }
          .ashe-agenda {
            font-size: clamp(0.65rem, 3vw, 0.8rem) !important;
            max-width: 95% !important; padding-top: 7px !important; margin-top: 2px !important;
            opacity: 1 !important; transform: none !important; transition: none !important;
            line-height: 1.55 !important;
          }
          .ashe-matrix-btn {
            opacity: 1 !important; transform: none !important; transition: none !important;
            margin-top: 8px !important; padding: 5px 14px !important;
            font-size: clamp(0.6rem, 2.6vw, 0.72rem) !important;
          }
        }
      `}</style>

      <div className="ashe-root">
        <div className="ashe-page-bg" />
        <div className="ashe-scanline" />
        <div className="ashe-particles" id="ashe-particles" />

        <div className="ashe-bars-area">
          <div className="ashe-bars-wrapper">
            {bars.map((b, i) => (
              <div
                className={`ashe-bar${activeIndex === i ? " active" : ""}`}
                key={i}
                onClick={() => {
                  if (window.innerWidth > 768) return;
                  setActiveIndex((current) => (current === i ? null : i));
                }}
              >
                <div className="ashe-bar-bg" style={{ backgroundImage: `url(${b.bg})` }} />
                <div className="ashe-bar-gradient" />
                <div className="ashe-bar-shimmer" />
                <div className="ashe-bar-border" />
                <div className="ashe-corner tl" />
                <div className="ashe-corner tr" />
                <div className="ashe-corner bl" />
                <div className="ashe-corner br" />
                <div className="ashe-collapsed">
                  <img className="ashe-logo-sm" src={b.logo} alt={b.acronym} />
                  <div className="ashe-bar-divider" />
                  <div className="ashe-acronym">{b.acronym}</div>
                </div>
                <div className="ashe-expanded">
                  <img className="ashe-logo-lg" src={b.logo} alt={b.acronym} />
                  <div className="ashe-exp-acronym" style={b.acronymStyle}>{b.acronym}</div>
                  <div className="ashe-exp-line" />
                  <div className="ashe-exp-name" dangerouslySetInnerHTML={{ __html: b.name }} />
                  {b.agenda && (
                    <div className={`ashe-agenda${b.agendaClassified ? " ashe-agenda--classified" : ""}`}>
                      {b.agenda}
                    </div>
                  )}
                  {b.matrixKey && (
                    <button
                      type="button"
                      className="ashe-matrix-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMatrixOpen(b.matrixKey!);
                      }}
                    >
                      Public Eye Matrix
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={matrixOpen !== null} onOpenChange={(o) => !o && setMatrixOpen(null)}>
        <DialogContent className="max-w-2xl bg-[#0a0f1c] border-[#c9a84c]/40 text-white">
          <DialogHeader>
            <DialogTitle className="text-[#c9a84c] tracking-[0.2em] uppercase text-center text-lg font-semibold">
              Public Eye Matrix
            </DialogTitle>
          </DialogHeader>
          {matrixOpen && (
            <div className="max-h-[60vh] overflow-y-auto pr-2 mt-2">
              {matrixOpen === "AIPPM" ? (
                <ol className="space-y-1.5 list-decimal list-inside text-sm">
                  {(matrices.AIPPM as { name: string; party: string }[]).map((p, i) => (
                    <li key={i} className="text-white/90">
                      <span className="font-medium">{p.name}</span>
                      {p.party && <span className="text-[#c9a84c]/80"> — {p.party}</span>}
                    </li>
                  ))}
                </ol>
              ) : (
                <ol className="space-y-1.5 list-decimal list-inside text-sm">
                  {(matrices[matrixOpen as "UNSC" | "UNCND" | "UNGALEGAL" | "IPJ"] as string[]).map((v, i) => (
                    <li key={i} className="text-white/90">{v}</li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default Committees;
