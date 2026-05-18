import { useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";

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
  acronymStyle?: React.CSSProperties;
};

const bars: Bar[] = [
  { bg: bg1, logo: logoUnsc, acronym: "UNSC", name: "United Nations<br/>Security Council" },
  { bg: bg2, logo: logoUncnd, acronym: "UNCND", name: "United Nations Commission on<br/>Narcotics and Drugs" },
  { bg: bg3, logo: logoUnga, acronym: "UNGA LEGAL", name: "United Nations<br/>General Assembly" },
  { bg: bg4, logo: logoAdhoc, acronym: "AD-HOC", name: "Ad-Hoc Committee", acronymStyle: { fontSize: "clamp(0.78rem,1vw,1.2rem)", letterSpacing: "0.13em" } },
  { bg: bg5, logo: logoCcs, acronym: "CCS", name: "Cabinet Committee<br/>on Security" },
  { bg: bg6, logo: logoAippm, acronym: "AIPPM", name: "All India Political<br/>Parties Meet" },
  { bg: bg7, logo: logoIp, acronym: "IP", name: "International<br/>Press" },
];

const Committees = () => {
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

    if (window.innerWidth > 768) {
      const handlers: Array<{ el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }> = [];
      document.querySelectorAll<HTMLElement>(".ashe-bar").forEach((bar) => {
        const move = (e: MouseEvent) => {
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
        handlers.push({ el: bar, move, leave });
      });
      return () => handlers.forEach(({ el, move, leave }) => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      });
    }
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
          font-family: 'Rajdhani', sans-serif;
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
        .ashe-header {
          position: relative; z-index: 10; text-align: center;
          padding: 28px 20px 14px; flex-shrink: 0;
        }
        .ashe-eyebrow {
          font-size: 0.62rem; letter-spacing: 0.75em;
          color: rgba(201,168,76,0.8); text-transform: uppercase;
          font-weight: 600; margin-bottom: 6px;
        }
        .ashe-title {
          font-family: 'Cinzel', serif; font-weight: 900;
          font-size: clamp(1.5rem, 2.8vw, 2.4rem);
          color: #fff; letter-spacing: 0.22em;
        }
        .ashe-title span {
          color: #c9a84c;
          animation: asheGoldPulse 3s ease-in-out infinite;
        }
        @keyframes asheGoldPulse {
          0%,100% { text-shadow: 0 0 15px rgba(201,168,76,0.2); }
          50% { text-shadow: 0 0 40px rgba(201,168,76,0.7), 0 0 80px rgba(201,168,76,0.2); }
        }
        .ashe-divider {
          width: 30%; height: 1px; margin: 10px auto 0;
          background: linear-gradient(to right, transparent, rgba(201,168,76,0.5), transparent);
        }
        .ashe-bars-area {
          position: relative; z-index: 5;
          flex: 1; display: flex;
          align-items: center; justify-content: center;
          padding: 8px 40px 32px;
        }
        .ashe-bars-wrapper {
          display: flex; flex-direction: row;
          align-items: center; justify-content: center;
          gap: 10px; height: 68vh; width: 100%; max-width: 1280px;
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
        .ashe-bar:hover .ashe-bar-bg { filter: brightness(0.72) saturate(1.1); transform: scale(1.05); }
        .ashe-bar-gradient {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(180deg, rgba(4,8,20,0.2) 0%, transparent 35%, rgba(4,8,20,0.5) 70%, rgba(4,8,20,0.95) 100%);
          transition: opacity 0.5s;
        }
        .ashe-bar:hover .ashe-bar-gradient { opacity: 0.3; }
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
          font-family: 'Cinzel', serif; font-weight: 900;
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
        }
        .ashe-bar:hover .ashe-expanded { opacity: 1; transform: translateY(0) scale(1); }
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
          font-family: 'Cinzel', serif; font-weight: 900;
          font-size: clamp(1.1rem, 1.7vw, 1.9rem);
          color: #fff; letter-spacing: 0.2em;
          text-shadow: 0 2px 24px rgba(0,0,0,0.9);
        }
        .ashe-exp-line {
          width: 0; height: 1px;
          background: linear-gradient(to right, transparent, #c9a84c, transparent);
          transition: width 0.5s 0.2s ease;
        }
        .ashe-bar:hover .ashe-exp-line { width: 50px; }
        .ashe-exp-name {
          font-family: 'Cinzel', serif;
          font-size: clamp(0.65rem, 0.85vw, 0.95rem);
          color: rgba(215,228,245,0.88);
          font-weight: 700; line-height: 1.6; letter-spacing: 0.05em;
          opacity: 0; transform: translateY(8px);
          transition: opacity 0.4s 0.32s, transform 0.4s 0.32s;
        }
        .ashe-bar:hover .ashe-exp-name { opacity: 1; transform: translateY(0); }

        @media (max-width: 768px) {
          .ashe-root { min-height: auto; overflow: visible; }
          .ashe-bars-area { padding: 8px 12px 20px; align-items: flex-start; }
          .ashe-bars-wrapper {
            flex-direction: column; height: auto; gap: 10px;
            max-width: 100%; align-items: stretch;
          }
          .ashe-bar {
            flex: none !important; width: 100%; height: 170px;
            border-radius: 16px; transition: box-shadow 0.2s;
          }
          .ashe-bars-wrapper:has(.ashe-bar:hover) .ashe-bar:not(:hover) { flex: none; }
          .ashe-bar:hover { flex: none !important; box-shadow: 0 0 30px rgba(201,168,76,0.2); }
          .ashe-bar:active { transform: scale(0.98); }
          .ashe-bar-bg { filter: brightness(0.45) saturate(0.8) !important; transition: none; }
          .ashe-collapsed { display: none !important; }
          .ashe-bar-gradient { opacity: 0.6 !important; }
          .ashe-corner { display: none; }
          .ashe-expanded { opacity: 1 !important; transform: none !important; transition: none; gap: 5px; padding: 12px; }
          .ashe-logo-lg { width: 42px; height: 42px; transition: none; animation: none; filter: drop-shadow(0 0 12px rgba(75,156,211,0.7)) !important; }
          .ashe-exp-line { width: 36px !important; transition: none; }
          .ashe-exp-name { opacity: 1; transform: none; transition: none; font-size: clamp(0.6rem, 2.8vw, 0.8rem); }
          .ashe-exp-acronym { font-size: clamp(0.9rem, 4.5vw, 1.25rem); }
        }
      `}</style>

      <div className="ashe-root">
        <div className="ashe-page-bg" />
        <div className="ashe-scanline" />
        <div className="ashe-particles" id="ashe-particles" />

        <div className="ashe-bars-area">
          <div className="ashe-bars-wrapper">
            {bars.map((b, i) => (
              <div className="ashe-bar" key={i}>
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Committees;
