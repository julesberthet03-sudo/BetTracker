import { useState } from "react";
import { supabase } from "./supabase";
import { AgeVerificationModal, PreventionBanner, Badge18 } from "./Legal";

const BetcrewLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e90ff"/>
        <stop offset="100%" stopColor="#00b4d8"/>
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="none" stroke="url(#circleGrad)" strokeWidth="3"/>
    <polygon points="20,70 45,35 60,50 80,20" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinejoin="round"/>
    <polygon points="75,20 85,20 85,30" fill="#22c55e"/>
    <rect x="30" y="55" width="12" height="15" rx="2" fill="#60a5fa" opacity="0.8"/>
    <rect x="58" y="48" width="14" height="22" rx="2" fill="#60a5fa" opacity="0.6"/>
    <ellipse cx="44" cy="78" rx="10" ry="4" fill="#3b82f6" opacity="0.7"/>
    <ellipse cx="44" cy="75" rx="10" ry="4" fill="#60a5fa" opacity="0.8"/>
    <ellipse cx="62" cy="78" rx="10" ry="4" fill="#3b82f6" opacity="0.7"/>
    <ellipse cx="62" cy="75" rx="10" ry="4" fill="#60a5fa" opacity="0.8"/>
  </svg>
);

const card      = { background: "#1e293b", borderRadius: 12, padding: 28 };
const inp       = { background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", width: "100%", fontSize: 14, boxSizing: "border-box" };
const btnPrimary = { background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", cursor: "pointer", fontWeight: 700, fontSize: 15, width: "100%" };

export default function AuthPage({ onGuestMode, initialMode = "login" }) {
  const [mode, setMode]         = useState(initialMode); // "login" | "register" | "reset"
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [pseudo, setPseudo]     = useState("");
  const [error, setError]       = useState("");
  const [info, setInfo]         = useState("");
  const [loading, setLoading]   = useState(false);

  const reset = () => { setError(""); setInfo(""); };

  const handleLogin = async () => {
    reset();
    if (!email || !password) { setError("Remplis tous les champs."); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      if (err.message.includes("Invalid login")) setError("Email ou mot de passe incorrect.");
      else setError(err.message);
    }
  };

  const handleRegister = async () => {
    reset();
    if (!pseudo.trim()) { setError("Choisis un pseudo."); return; }
    if (!email)          { setError("Entre ton adresse email."); return; }
    if (password.length < 6) { setError("Le mot de passe doit faire au moins 6 caractères."); return; }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { pseudo: pseudo.trim() } },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }

    if (data.user) {
      // Insert profile row
      await supabase.from("profiles").upsert({
        id:         data.user.id,
        pseudo:     pseudo.trim(),
        email,
        created_at: new Date().toISOString(),
      });
      // Insert default bankroll
      await supabase.from("bankroll").upsert({
        user_id:         data.user.id,
        starting_amount: 1000,
        amount:          1000,
        created_at:      new Date().toISOString(),
      });
    }

    if (!data.session) {
      setInfo("Compte créé ! Vérifie ton email pour confirmer ton inscription, puis connecte-toi.");
      setMode("login");
    }
  };

  const handleReset = async () => {
    reset();
    if (!email) { setError("Entre ton adresse email."); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (err) setError(err.message);
    else setInfo("Un lien de réinitialisation a été envoyé à " + email);
  };

  return (
    <>
      <AgeVerificationModal />
      <PreventionBanner />
    <div style={{ background: "#0f172a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif", color: "#e2e8f0", padding: "20px 20px 60px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
            <BetcrewLogo size={100} />
            <Badge18 size={32} />
          </div>

          {/* Tagline */}
          <p style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700, color: "#f1f5f9", letterSpacing: -0.3 }}>
            La plateforme des parieurs intelligents
          </p>

          {/* Feature badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            {[["📊", "Suivi de bankroll"], ["🧮", "Calculatrices pro"], ["👥", "Communauté"]].map(([icon, label]) => (
              <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: "5px 12px", fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                {icon} {label}
              </span>
            ))}
          </div>
        </div>

        <div style={card}>
          {/* Mode toggle */}
          {mode !== "reset" && (
            <div style={{ display: "flex", background: "#0f172a", borderRadius: 8, padding: 4, marginBottom: 24 }}>
              {[["login", "Connexion"], ["register", "Inscription"]].map(([m, label]) => (
                <button key={m} onClick={() => { setMode(m); reset(); }}
                  style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, background: mode === m ? "#6366f1" : "transparent", color: mode === m ? "#fff" : "#64748b", transition: "all .15s" }}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {mode === "reset" && (
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>Mot de passe oublié</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>On t'envoie un lien par email.</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Pseudo (register only) */}
            {mode === "register" && (
              <div>
                <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6 }}>Pseudo *</label>
                <input style={inp} placeholder="Ex: TipsterPro" value={pseudo} onChange={e => setPseudo(e.target.value)} maxLength={20} />
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6 }}>Adresse email *</label>
              <input type="email" style={inp} placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && mode === "login" && handleLogin()} />
            </div>

            {/* Password */}
            {mode !== "reset" && (
              <div>
                <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6 }}>Mot de passe *</label>
                <input type="password" style={inp} placeholder={mode === "register" ? "Min. 6 caractères" : "••••••••"} value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && mode === "login" && handleLogin()} />
              </div>
            )}

            {/* Confirm password */}
            {mode === "register" && (
              <div>
                <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6 }}>Confirmer le mot de passe *</label>
                <input type="password" style={inp} placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} />
              </div>
            )}

            {/* Error / Info */}
            {error && <p style={{ margin: 0, fontSize: 13, color: "#f43f5e", background: "#f43f5e12", border: "1px solid #f43f5e33", borderRadius: 8, padding: "10px 14px" }}>⚠️ {error}</p>}
            {info  && <p style={{ margin: 0, fontSize: 13, color: "#10b981", background: "#10b98112", border: "1px solid #10b98133", borderRadius: 8, padding: "10px 14px" }}>✅ {info}</p>}

            {/* Submit */}
            <button onClick={mode === "login" ? handleLogin : mode === "register" ? handleRegister : handleReset}
              style={{ ...btnPrimary, marginTop: 4, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? "Chargement..." : mode === "login" ? "Se connecter" : mode === "register" ? "Créer mon compte" : "Envoyer le lien"}
            </button>

            {/* Forgot password link */}
            {mode === "login" && (
              <button onClick={() => { setMode("reset"); reset(); }}
                style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 13, padding: 0, textAlign: "center" }}>
                Mot de passe oublié ?
              </button>
            )}

            {/* Back link */}
            {mode === "reset" && (
              <button onClick={() => { setMode("login"); reset(); }}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13, padding: 0, textAlign: "center" }}>
                ← Retour à la connexion
              </button>
            )}
          </div>
        </div>

        {/* Guest mode */}
        {onGuestMode && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <div style={{ borderTop: "1px solid #1e293b", paddingTop: 18 }}>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569" }}>Pas encore prêt à vous inscrire ?</p>
              <button onClick={onGuestMode}
                style={{ background: "none", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", cursor: "pointer", fontSize: 14, padding: "10px 24px", width: "100%", transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#a5b4fc"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#94a3b8"; }}>
                👀 Découvrir sans compte
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
    </>
  );
}
