import { useState } from "react";

// ─── Age Verification Modal ───────────────────────────────────────────────────
export function AgeVerificationModal() {
  const [visible, setVisible] = useState(
    () => localStorage.getItem("bt_age_ok") !== "1"
  );

  if (!visible) return null;

  const confirm = () => {
    localStorage.setItem("bt_age_ok", "1");
    setVisible(false);
  };

  const deny = () => {
    window.location.href = "https://www.google.fr";
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.96)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter',sans-serif", padding: 24,
    }}>
      <div style={{
        background: "#0f172a", border: "1px solid #334155", borderRadius: 16,
        padding: "40px 36px", maxWidth: 460, width: "100%", textAlign: "center",
        boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
      }}>
        {/* Logo + badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
          <span style={{ fontSize: 40 }}>📈</span>
          <span style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9" }}>BetTracker</span>
          <Badge18 size={36} />
        </div>

        <div style={{ width: 64, height: 2, background: "#334155", margin: "0 auto 28px" }} />

        <p style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#f1f5f9", lineHeight: 1.3 }}>
          Vérification de l'âge
        </p>
        <p style={{ margin: "0 0 32px", fontSize: 15, color: "#94a3b8", lineHeight: 1.6 }}>
          Vous devez avoir <strong style={{ color: "#f1f5f9" }}>18 ans ou plus</strong> pour accéder à ce site.
          Les jeux d'argent sont interdits aux mineurs.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={confirm} style={{
            background: "#10b981", color: "#fff", border: "none", borderRadius: 10,
            padding: "14px 24px", cursor: "pointer", fontWeight: 700, fontSize: 15,
          }}>
            ✅ J'ai 18 ans ou plus — Accéder au site
          </button>
          <button onClick={deny} style={{
            background: "#f43f5e", color: "#fff", border: "none", borderRadius: 10,
            padding: "14px 24px", cursor: "pointer", fontWeight: 700, fontSize: 15,
          }}>
            🚫 J'ai moins de 18 ans — Quitter
          </button>
        </div>

        <p style={{ margin: "20px 0 0", fontSize: 11, color: "#475569", lineHeight: 1.6 }}>
          En accédant au site, vous confirmez être majeur et acceptez nos conditions d'utilisation.
          Jouer comporte des risques — jouez de manière responsable.
        </p>
      </div>
    </div>
  );
}

// ─── Prevention Banner ────────────────────────────────────────────────────────
export function PreventionBanner() {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9000,
      background: "#0a0f1a", borderTop: "1px solid #1e293b",
      padding: "8px 20px",
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 10,
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>🔞</span>
      <p style={{ margin: 0, fontSize: 12, color: "#64748b", lineHeight: 1.5, textAlign: "center" }}>
        Jouer comporte des risques : endettement, isolement, dépendance. Pour être aidé, appelez le{" "}
        <a href="tel:0974751313" style={{ color: "#94a3b8", fontWeight: 700, textDecoration: "none" }}>
          09 74 75 13 13
        </a>
        {" "}(appel non surtaxé)
      </p>
    </div>
  );
}

// ─── 18+ Badge ────────────────────────────────────────────────────────────────
export function Badge18({ size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "#ef4444", border: `${Math.max(2, size / 14)}px solid #fff`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <span style={{ fontSize: size * 0.36, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: -0.5 }}>
        18+
      </span>
    </div>
  );
}
