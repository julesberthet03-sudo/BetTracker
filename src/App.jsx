import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { supabase } from "./supabase";
import AuthPage from "./AuthPage";
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

const SPORTS = ["Football", "Tennis", "Basketball", "Rugby", "Baseball", "MMA", "Autre"];
const STATUTS = ["Gagné", "Perdu"];
const COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#f43f5e", "#a78bfa", "#34d399"];
const SPORT_ICONS = { Football: "⚽", Tennis: "🎾", Basketball: "🏀", Rugby: "🏉", Baseball: "⚾", MMA: "🥊", Autre: "🎲" };
const COMMUNITY_COLORS = ["#6366f1","#10b981","#f59e0b","#f43f5e","#22d3ee","#a78bfa","#34d399","#fb923c"];

// ─── Responsive hook ──────────────────────────────────────────────────────────
function useWindowWidth() {
  const [w, setW] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1200));
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h, { passive: true });
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

const card = { background: "#1e293b", borderRadius: 12, padding: 20 };
const inp = { background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", width: "100%", fontSize: 14, boxSizing: "border-box" };
const btnPrimary = { background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", cursor: "pointer", fontWeight: 600, fontSize: 14 };
const btnSecondary = { background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: 8, padding: "9px 16px", cursor: "pointer", fontWeight: 500, fontSize: 14 };

// ─── Calculatrice ────────────────────────────────────────────────────────────
const CALC_TOOLS = [
  { id: "prob",   icon: "📊", label: "Probabilité"    },
  { id: "dutch",  icon: "🎯", label: "Dutching"        },
  { id: "sure",   icon: "🔒", label: "Surebet"         },
  { id: "split",  icon: "✂️", label: "Stake Splitter"  },
  { id: "target", icon: "💰", label: "Profit Target"   },
  { id: "roi",    icon: "📉", label: "ROI"              },
];

// shared helpers
const gc = p => p >= 60 ? "#10b981" : p >= 35 ? "#f59e0b" : "#f43f5e";
const gl = p => p >= 60 ? "Favori 🟢" : p >= 35 ? "Incertain 🟡" : "Risqué 🔴";
const fmtE = v => `${parseFloat(v).toFixed(2)} €`;
const rowS = { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #0f172a" };
const lbl  = { fontSize:13, color:"#64748b" };
const val  = col => ({ fontWeight:700, fontSize:14, color: col });

// ── 1. Probabilité ────────────────────────────────────────────────────────────
function ToolProb() {
  const mob = useWindowWidth() <= 480;
  const [cotes, setCotes] = useState([{ id: 1, value: "" }]);
  const [mise, setMise]   = useState("");
  const add = () => { if (cotes.length < 6) setCotes(p => [...p, { id: Date.now(), value: "" }]); };
  const rem = id => { if (cotes.length > 1) setCotes(p => p.filter(c => c.id !== id)); };
  const upd = (id, v) => setCotes(p => p.map(c => c.id === id ? { ...c, value: v } : c));
  const valid = cotes.map(c => parseFloat(c.value)).filter(v => !isNaN(v) && v > 1);
  const comb  = valid.length > 0 ? valid.reduce((a, b) => a * b, 1) : null;
  const prob  = comb ? (1 / comb) * 100 : null;
  const gain  = comb && mise ? (parseFloat(mise) * comb).toFixed(2) : null;
  const profit = gain && mise ? (parseFloat(gain) - parseFloat(mise)).toFixed(2) : null;

  return (
    <div style={{ display:"grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap:20 }}>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div style={card}>
          <p style={{ margin:"0 0 16px", fontWeight:700, fontSize:16 }}>🎯 Saisir les cotes</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {cotes.map((c,i) => (
              <div key={c.id} style={{ display:"flex", gap:8, alignItems:"center" }}>
                <div style={{ flex:1 }}>
                  <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Sélection {i+1}</label>
                  <input type="number" step="0.01" min="1.01" style={inp} placeholder="Ex: 1.85" value={c.value} onChange={e => upd(c.id, e.target.value)} />
                </div>
                {parseFloat(c.value) > 1 && (
                  <div style={{ textAlign:"center", minWidth:68 }}>
                    <p style={{ margin:"0 0 2px", fontSize:10, color:"#64748b" }}>Probabilité</p>
                    <p style={{ margin:0, fontWeight:700, fontSize:15, color:gc((1/parseFloat(c.value))*100) }}>{((1/parseFloat(c.value))*100).toFixed(1)}%</p>
                  </div>
                )}
                {cotes.length > 1 && <button onClick={() => rem(c.id)} style={{ background:"none", border:"1px solid #334155", borderRadius:6, color:"#f43f5e", cursor:"pointer", padding:"6px 10px", fontSize:12, marginTop:14 }}>✕</button>}
              </div>
            ))}
          </div>
          {cotes.length < 6 && <button onClick={add} style={{ marginTop:12, background:"none", border:"1px dashed #334155", borderRadius:8, color:"#64748b", cursor:"pointer", padding:"8px 16px", fontSize:13, width:"100%" }}>+ Ajouter une sélection (combiné)</button>}
        </div>
        <div style={card}>
          <p style={{ margin:"0 0 12px", fontWeight:700, fontSize:15 }}>💰 Mise (€)</p>
          <input type="number" style={inp} placeholder="Montant à miser..." value={mise} onChange={e => setMise(e.target.value)} />
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {comb ? (
          <>
            <div style={{ ...card, textAlign:"center", border:`1px solid ${gc(prob)}44` }}>
              <p style={{ margin:"0 0 8px", fontSize:13, color:"#64748b" }}>{cotes.length>1 ? `Combiné (${valid.length} sélections)` : "Probabilité implicite"}</p>
              <p style={{ margin:"0 0 4px", fontSize:52, fontWeight:800, color:gc(prob) }}>{prob.toFixed(1)}%</p>
              <p style={{ margin:"0 0 12px", fontSize:14, color:gc(prob), fontWeight:600 }}>{gl(prob)}</p>
              <div style={{ background:"#0f172a", borderRadius:99, height:10, overflow:"hidden" }}>
                <div style={{ width:`${Math.min(prob,100)}%`, height:"100%", background:gc(prob), borderRadius:99, transition:"width .4s" }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                <span style={{ fontSize:10, color:"#f43f5e" }}>Risqué</span><span style={{ fontSize:10, color:"#f59e0b" }}>Incertain</span><span style={{ fontSize:10, color:"#10b981" }}>Favori</span>
              </div>
            </div>
            {cotes.length > 1 && (
              <div style={card}>
                <p style={{ margin:"0 0 12px", fontWeight:600, fontSize:14 }}>📊 Détail du combiné</p>
                {cotes.filter(c => parseFloat(c.value)>1).map((c,i) => {
                  const p=(1/parseFloat(c.value))*100;
                  return <div key={c.id} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #0f172a" }}><span style={{ fontSize:13, color:"#94a3b8" }}>Sél. {i+1} — cote {parseFloat(c.value).toFixed(2)}</span><span style={{ fontWeight:700, color:gc(p), fontSize:13 }}>{p.toFixed(1)}%</span></div>;
                })}
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, paddingTop:8, borderTop:"1px solid #334155" }}><span style={{ fontSize:13, fontWeight:600 }}>Cote combinée</span><span style={{ fontWeight:700, color:"#a5b4fc" }}>{comb.toFixed(2)}</span></div>
              </div>
            )}
            {mise && parseFloat(mise)>0 && (
              <div style={card}>
                <p style={{ margin:"0 0 12px", fontWeight:600, fontSize:14 }}>💵 Résultat estimé</p>
                {[{label:"Mise",val:`${parseFloat(mise).toFixed(2)} €`,color:"#94a3b8"},{label:"Gain potentiel",val:`${gain} €`,color:"#22d3ee"},{label:"Profit net",val:`+${profit} €`,color:"#10b981"}].map(r=>(
                  <div key={r.label} style={rowS}><span style={lbl}>{r.label}</span><span style={val(r.color)}>{r.val}</span></div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ ...card, textAlign:"center", padding:40, color:"#475569" }}>
            <p style={{ fontSize:40, margin:"0 0 12px" }}>🧮</p>
            <p style={{ fontSize:14 }}>Entrez une cote supérieure à 1.01<br />pour voir la probabilité calculée.</p>
          </div>
        )}
        <div style={{ ...card, background:"#0f172a", border:"1px solid #334155" }}>
          <p style={{ margin:"0 0 8px", fontWeight:600, fontSize:13, color:"#64748b" }}>ℹ️ Comment ça marche ?</p>
          <p style={{ margin:0, fontSize:12, color:"#475569", lineHeight:1.7 }}>
            <strong style={{ color:"#94a3b8" }}>Formule :</strong> Probabilité = 1 ÷ Cote × 100<br />
            Cote <strong style={{ color:"#a5b4fc" }}>2.00</strong> → <strong style={{ color:"#10b981" }}>50%</strong> · Cote <strong style={{ color:"#a5b4fc" }}>1.50</strong> → <strong style={{ color:"#10b981" }}>66.7%</strong><br />
            <span style={{ color:"#f59e0b" }}>⚠️ La marge du bookmaker est incluse dans la cote.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── 2. Dutching ───────────────────────────────────────────────────────────────
function ToolDutch() {
  const mob = useWindowWidth() <= 480;
  const [total, setTotal]   = useState("");
  const [sels, setSels]     = useState([{ id:1, odds:"" }, { id:2, odds:"" }]);
  const addSel = () => { if (sels.length < 6) setSels(p => [...p, { id:Date.now(), odds:"" }]); };
  const remSel = id => { if (sels.length > 2) setSels(p => p.filter(s => s.id !== id)); };
  const updSel = (id, v) => setSels(p => p.map(s => s.id === id ? { ...s, odds:v } : s));

  const totalAmt = parseFloat(total);
  const validSels = sels.map(s => ({ ...s, o: parseFloat(s.odds) })).filter(s => !isNaN(s.o) && s.o > 1);
  const sumInv = validSels.reduce((acc, s) => acc + 1/s.o, 0);
  const ready = !isNaN(totalAmt) && totalAmt > 0 && validSels.length >= 2 && sumInv < 1;
  const results = ready ? validSels.map(s => {
    const stake = totalAmt * (1/s.o) / sumInv;
    return { ...s, stake, ret: stake * s.o };
  }) : null;
  const guaranteedReturn = results ? results[0].ret : null;
  const guaranteedProfit = results ? guaranteedReturn - totalAmt : null;

  return (
    <div style={{ display:"grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap:20 }}>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div style={card}>
          <p style={{ margin:"0 0 4px", fontWeight:700, fontSize:16 }}>🎯 Dutching</p>
          <p style={{ margin:"0 0 16px", fontSize:12, color:"#64748b" }}>Répartis ta mise pour gagner le même montant quelle que soit la sélection qui l'emporte.</p>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:5 }}>Mise totale (€)</label>
            <input type="number" style={inp} placeholder="Ex: 100" value={total} onChange={e => setTotal(e.target.value)} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {sels.map((s,i) => (
              <div key={s.id} style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
                <div style={{ flex:1 }}>
                  <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Sélection {i+1} — cote</label>
                  <input type="number" step="0.01" min="1.01" style={inp} placeholder="Ex: 3.50" value={s.odds} onChange={e => updSel(s.id, e.target.value)} />
                </div>
                {sels.length > 2 && <button onClick={() => remSel(s.id)} style={{ background:"none", border:"1px solid #334155", borderRadius:6, color:"#f43f5e", cursor:"pointer", padding:"6px 10px", fontSize:12, marginBottom:1 }}>✕</button>}
              </div>
            ))}
          </div>
          {sels.length < 6 && <button onClick={addSel} style={{ marginTop:12, background:"none", border:"1px dashed #334155", borderRadius:8, color:"#64748b", cursor:"pointer", padding:"8px 16px", fontSize:13, width:"100%" }}>+ Ajouter une sélection</button>}
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {results ? (
          <>
            <div style={{ ...card, textAlign:"center", border:"1px solid #10b98133", background:"#10b9810a" }}>
              <p style={{ margin:"0 0 4px", fontSize:12, color:"#64748b", textTransform:"uppercase", letterSpacing:1 }}>Retour garanti</p>
              <p style={{ margin:"0 0 2px", fontSize:44, fontWeight:900, color:"#10b981", lineHeight:1 }}>{fmtE(guaranteedReturn)}</p>
              <p style={{ margin:0, fontSize:14, color: guaranteedProfit >= 0 ? "#10b981" : "#f43f5e", fontWeight:600 }}>
                {guaranteedProfit >= 0 ? `Profit garanti : +${fmtE(guaranteedProfit)}` : `Perte : ${fmtE(guaranteedProfit)}`}
              </p>
            </div>
            <div style={card}>
              <p style={{ margin:"0 0 12px", fontWeight:600, fontSize:14 }}>Répartition des mises</p>
              {results.map((r,i) => (
                <div key={r.id} style={rowS}>
                  <span style={lbl}>Sél. {i+1} (cote {r.o.toFixed(2)})</span>
                  <span style={val("#a5b4fc")}>{fmtE(r.stake)}</span>
                </div>
              ))}
              <div style={{ ...rowS, borderBottom:"none" }}>
                <span style={{ fontSize:13, fontWeight:600 }}>Mise totale</span>
                <span style={val("#94a3b8")}>{fmtE(totalAmt)}</span>
              </div>
            </div>
          </>
        ) : (
          <div style={{ ...card, textAlign:"center", padding:40, color:"#475569" }}>
            <p style={{ fontSize:40, margin:"0 0 12px" }}>🎯</p>
            <p style={{ fontSize:14 }}>
              {validSels.length >= 2 && sumInv >= 1
                ? "⚠️ Dutching impossible : la somme des probabilités dépasse 100%."
                : "Entrez la mise totale et au moins 2 cotes."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 3. Surebet ────────────────────────────────────────────────────────────────
function ToolSure() {
  const mob = useWindowWidth() <= 480;
  const [total, setTotal] = useState("");
  const [o1, setO1] = useState("");
  const [oN, setON] = useState("");
  const [o2, setO2] = useState("");

  const v1 = parseFloat(o1), vN = parseFloat(oN), v2 = parseFloat(o2);
  const has3 = !isNaN(vN) && vN > 1;
  const outcomes = has3
    ? [v1, vN, v2].filter(v => !isNaN(v) && v > 1)
    : [v1, v2].filter(v => !isNaN(v) && v > 1);
  const arbPct = outcomes.length >= 2 ? outcomes.reduce((acc, o) => acc + 1/o, 0) * 100 : null;
  const isArb  = arbPct !== null && arbPct < 100;
  const totalAmt = parseFloat(total);
  const ready = isArb && !isNaN(totalAmt) && totalAmt > 0;

  const stakes = ready ? outcomes.map(o => (totalAmt / o) / (outcomes.reduce((a,b) => a + 1/b, 0))) : null;
  const guaranteedReturn = stakes ? stakes[0] * outcomes[0] : null;
  const profit = guaranteedReturn ? guaranteedReturn - totalAmt : null;
  const roi    = profit && totalAmt ? (profit / totalAmt) * 100 : null;

  return (
    <div style={{ display:"grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap:20 }}>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div style={card}>
          <p style={{ margin:"0 0 4px", fontWeight:700, fontSize:16 }}>🔒 Surebet</p>
          <p style={{ margin:"0 0 16px", fontSize:12, color:"#64748b" }}>Couvre tous les résultats chez différents bookmakers pour garantir un profit quoi qu'il arrive.</p>
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:5 }}>Mise totale (€)</label>
            <input type="number" style={inp} placeholder="Ex: 300" value={total} onChange={e => setTotal(e.target.value)} />
          </div>
          {[["Cote 1 (domicile / oui)", o1, setO1], ["Cote N (nul — optionnel)", oN, setON], ["Cote 2 (extérieur / non)", o2, setO2]].map(([label, v, set]) => (
            <div key={label} style={{ marginBottom:10 }}>
              <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>{label}</label>
              <input type="number" step="0.01" min="1.01" style={inp} placeholder="Ex: 2.10" value={v} onChange={e => set(e.target.value)} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {arbPct !== null ? (
          <>
            <div style={{ ...card, textAlign:"center", border:`1px solid ${isArb ? "#10b98133" : "#f43f5e33"}`, background: isArb ? "#10b9810a" : "#f43f5e0a" }}>
              <p style={{ margin:"0 0 8px", fontSize:13, color:"#64748b" }}>Marge d'arbitrage</p>
              <p style={{ margin:"0 0 6px", fontSize:44, fontWeight:900, color: isArb ? "#10b981" : "#f43f5e", lineHeight:1 }}>{arbPct.toFixed(2)}%</p>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, background: isArb ? "#10b98118" : "#f43f5e18", borderRadius:20, padding:"6px 14px" }}>
                <span style={{ fontSize:14 }}>{isArb ? "✅" : "❌"}</span>
                <span style={{ fontSize:13, fontWeight:700, color: isArb ? "#10b981" : "#f43f5e" }}>
                  {isArb ? "Opportunité d'arbitrage détectée !" : "Pas d'arbitrage (marge > 100%)"}
                </span>
              </div>
            </div>
            {ready && stakes && (
              <div style={card}>
                <p style={{ margin:"0 0 12px", fontWeight:600, fontSize:14 }}>Répartition des mises</p>
                {outcomes.map((o,i) => (
                  <div key={i} style={rowS}>
                    <span style={lbl}>{["Résultat 1","Résultat N","Résultat 2"][i]} (cote {o.toFixed(2)})</span>
                    <span style={val("#a5b4fc")}>{fmtE(stakes[i])}</span>
                  </div>
                ))}
                <div style={rowS}><span style={lbl}>Retour garanti</span><span style={val("#22d3ee")}>{fmtE(guaranteedReturn)}</span></div>
                <div style={rowS}><span style={lbl}>Profit net</span><span style={val("#10b981")}>+{fmtE(profit)}</span></div>
                <div style={{ ...rowS, borderBottom:"none" }}><span style={lbl}>ROI</span><span style={val("#10b981")}>{roi.toFixed(2)}%</span></div>
              </div>
            )}
          </>
        ) : (
          <div style={{ ...card, textAlign:"center", padding:40, color:"#475569" }}>
            <p style={{ fontSize:40, margin:"0 0 12px" }}>🔒</p>
            <p style={{ fontSize:14 }}>Entrez les cotes des différents bookmakers<br />pour détecter un arbitrage.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 4. Stake Splitter ─────────────────────────────────────────────────────────
function ToolSplit() {
  const mob = useWindowWidth() <= 480;
  const [total, setTotal] = useState("");
  const [bks, setBks]     = useState([{ id:1, name:"", odds:"" }, { id:2, name:"", odds:"" }]);
  const addBk = () => { if (bks.length < 5) setBks(p => [...p, { id:Date.now(), name:"", odds:"" }]); };
  const remBk = id => { if (bks.length > 2) setBks(p => p.filter(b => b.id !== id)); };
  const updBk = (id, field, v) => setBks(p => p.map(b => b.id === id ? { ...b, [field]:v } : b));

  const totalAmt = parseFloat(total);
  const valid = bks.map(b => ({ ...b, o: parseFloat(b.odds) })).filter(b => !isNaN(b.o) && b.o > 1);
  const ready = !isNaN(totalAmt) && totalAmt > 0 && valid.length >= 2;

  // Optimal split: proportional to odds (more stake on highest odds)
  const sumOdds = valid.reduce((a, b) => a + b.o, 0);
  const results = ready ? valid.map(b => ({ ...b, stake: totalAmt * (b.o / sumOdds) })) : null;
  const wavgOdds = results ? results.reduce((a, b) => a + b.stake * b.o, 0) / totalAmt : null;
  const totalReturn = results ? results.reduce((a, b) => a + b.stake * b.o, 0) / valid.length : null;

  return (
    <div style={{ display:"grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap:20 }}>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div style={card}>
          <p style={{ margin:"0 0 4px", fontWeight:700, fontSize:16 }}>✂️ Stake Splitter</p>
          <p style={{ margin:"0 0 16px", fontSize:12, color:"#64748b" }}>Répartis ta mise sur plusieurs bookmakers pour profiter des meilleures cotes.</p>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:5 }}>Mise totale (€)</label>
            <input type="number" style={inp} placeholder="Ex: 100" value={total} onChange={e => setTotal(e.target.value)} />
          </div>
          {bks.map((b,i) => (
            <div key={b.id} style={{ display:"flex", gap:8, marginBottom:10, alignItems:"flex-end" }}>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Bookmaker {i+1}</label>
                <input style={inp} placeholder="Nom (optionnel)" value={b.name} onChange={e => updBk(b.id, "name", e.target.value)} />
              </div>
              <div style={{ width:100 }}>
                <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Cote</label>
                <input type="number" step="0.01" min="1.01" style={inp} placeholder="2.50" value={b.odds} onChange={e => updBk(b.id, "odds", e.target.value)} />
              </div>
              {bks.length > 2 && <button onClick={() => remBk(b.id)} style={{ background:"none", border:"1px solid #334155", borderRadius:6, color:"#f43f5e", cursor:"pointer", padding:"6px 10px", fontSize:12, marginBottom:1 }}>✕</button>}
            </div>
          ))}
          {bks.length < 5 && <button onClick={addBk} style={{ marginTop:4, background:"none", border:"1px dashed #334155", borderRadius:8, color:"#64748b", cursor:"pointer", padding:"8px 16px", fontSize:13, width:"100%" }}>+ Ajouter un bookmaker</button>}
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {results ? (
          <>
            <div style={{ ...card, textAlign:"center", border:"1px solid #6366f133" }}>
              <p style={{ margin:"0 0 4px", fontSize:12, color:"#64748b", textTransform:"uppercase", letterSpacing:1 }}>Cote moyenne pondérée</p>
              <p style={{ margin:"0 0 4px", fontSize:44, fontWeight:900, color:"#a5b4fc", lineHeight:1 }}>{wavgOdds.toFixed(3)}</p>
              <p style={{ margin:0, fontSize:13, color:"#64748b" }}>Retour espéré moyen : {fmtE(totalReturn)}</p>
            </div>
            <div style={card}>
              <p style={{ margin:"0 0 12px", fontWeight:600, fontSize:14 }}>Répartition optimale</p>
              {results.sort((a,b) => b.o - a.o).map((r,i) => (
                <div key={r.id} style={rowS}>
                  <span style={lbl}>{r.name || `Bookmaker ${i+1}`} (cote {r.o.toFixed(2)})</span>
                  <span style={val("#a5b4fc")}>{fmtE(r.stake)}</span>
                </div>
              ))}
              <div style={{ ...rowS, borderBottom:"none" }}><span style={{ fontSize:13, fontWeight:600 }}>Total</span><span style={val("#94a3b8")}>{fmtE(totalAmt)}</span></div>
            </div>
          </>
        ) : (
          <div style={{ ...card, textAlign:"center", padding:40, color:"#475569" }}>
            <p style={{ fontSize:40, margin:"0 0 12px" }}>✂️</p>
            <p style={{ fontSize:14 }}>Entrez la mise et les cotes de chaque bookmaker.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 5. Live Odds ──────────────────────────────────────────────────────────────
// ── 6. Profit Target ──────────────────────────────────────────────────────────
function ToolTarget() {
  const mob = useWindowWidth() <= 480;
  const [profit, setProfit]   = useState("");
  const [odds, setOdds]       = useState("");
  const [monthly, setMonthly] = useState("");

  const profitAmt = parseFloat(profit);
  const oddsNum   = parseFloat(odds);
  const monthlyT  = parseFloat(monthly);
  const b         = oddsNum > 1 ? oddsNum - 1 : null;
  const ready     = !isNaN(profitAmt) && profitAmt > 0 && b !== null;

  const stake      = ready ? profitAmt / b : null;
  const totalRet   = ready ? stake + profitAmt : null;
  const roi        = ready ? (profitAmt / stake) * 100 : null;
  const betsMonthly = ready && !isNaN(monthlyT) && monthlyT > 0 ? Math.ceil(monthlyT / profitAmt) : null;
  const betsYearly  = betsMonthly ? betsMonthly * 12 : null;

  return (
    <div style={{ display:"grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap:20 }}>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div style={card}>
          <p style={{ margin:"0 0 4px", fontWeight:700, fontSize:16 }}>💰 Profit Target</p>
          <p style={{ margin:"0 0 16px", fontSize:12, color:"#64748b" }}>Calcule la mise nécessaire pour atteindre un profit cible sur un pari donné.</p>
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:5 }}>Profit souhaité (€)</label>
            <input type="number" style={inp} placeholder="Ex: 50" value={profit} onChange={e => setProfit(e.target.value)} />
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:5 }}>Cote du pari</label>
            <input type="number" step="0.01" min="1.01" style={inp} placeholder="Ex: 2.50" value={odds} onChange={e => setOdds(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:5 }}>Objectif mensuel (€) — optionnel</label>
            <input type="number" style={inp} placeholder="Ex: 500" value={monthly} onChange={e => setMonthly(e.target.value)} />
          </div>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {ready ? (
          <>
            <div style={{ ...card, textAlign:"center", border:"1px solid #6366f133" }}>
              <p style={{ margin:"0 0 4px", fontSize:12, color:"#64748b", textTransform:"uppercase", letterSpacing:1 }}>Mise requise</p>
              <p style={{ margin:"0 0 8px", fontSize:48, fontWeight:900, color:"#a5b4fc", lineHeight:1 }}>{fmtE(stake)}</p>
            </div>
            <div style={card}>
              {[
                { label:"Profit si victoire", v:`+${fmtE(profitAmt)}`, c:"#10b981" },
                { label:"Retour total",        v:fmtE(totalRet),       c:"#22d3ee" },
                { label:"ROI sur ce pari",     v:`${roi.toFixed(1)}%`, c:"#a5b4fc" },
              ].map(r => <div key={r.label} style={rowS}><span style={lbl}>{r.label}</span><span style={val(r.c)}>{r.v}</span></div>)}
              {betsMonthly && (
                <>
                  <div style={{ margin:"12px 0 8px", borderTop:"1px solid #334155", paddingTop:12 }}>
                    <p style={{ margin:0, fontSize:12, color:"#64748b", fontWeight:600 }}>Pour atteindre {fmtE(monthlyT)} / mois :</p>
                  </div>
                  <div style={rowS}><span style={lbl}>Paris gagnants nécessaires/mois</span><span style={val("#f59e0b")}>{betsMonthly}</span></div>
                  <div style={{ ...rowS, borderBottom:"none" }}><span style={lbl}>Paris gagnants nécessaires/an</span><span style={val("#f59e0b")}>{betsYearly}</span></div>
                </>
              )}
            </div>
          </>
        ) : (
          <div style={{ ...card, textAlign:"center", padding:40, color:"#475569" }}>
            <p style={{ fontSize:40, margin:"0 0 12px" }}>💰</p>
            <p style={{ fontSize:14 }}>Entrez un profit cible et une cote.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 7. ROI Calculator ─────────────────────────────────────────────────────────
function ToolROI() {
  const mob = useWindowWidth() <= 480;
  const [staked, setStaked]   = useState("");
  const [returned, setRet]    = useState("");
  const [nbBets, setNbBets]   = useState("");
  const [period, setPeriod]   = useState("months");
  const [periodN, setPeriodN] = useState("");

  const S = parseFloat(staked), R = parseFloat(returned), N = parseInt(nbBets), P = parseFloat(periodN);
  const ready = !isNaN(S) && S > 0 && !isNaN(R) && R >= 0;

  const profitLoss = ready ? R - S : null;
  const roiPct     = ready ? (profitLoss / S) * 100 : null;
  const avgStake   = ready && !isNaN(N) && N > 0 ? S / N : null;
  const avgRet     = ready && !isNaN(N) && N > 0 ? R / N : null;

  const projYearlyROI = ready && !isNaN(P) && P > 0
    ? period === "weeks" ? roiPct * (52 / P) : roiPct * (12 / P)
    : null;

  const getRating = r => r > 15 ? { label:"Excellent 🏆", c:"#10b981" } : r > 5 ? { label:"Bon 👍", c:"#22d3ee" } : r > 0 ? { label:"Moyen ⚠️", c:"#f59e0b" } : { label:"Mauvais ❌", c:"#f43f5e" };
  const rating = ready ? getRating(roiPct) : null;

  return (
    <div style={{ display:"grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap:20 }}>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div style={card}>
          <p style={{ margin:"0 0 4px", fontWeight:700, fontSize:16 }}>📉 ROI Calculator</p>
          <p style={{ margin:"0 0 16px", fontSize:12, color:"#64748b" }}>Évalue ta performance globale et projette tes gains annuels à partir de tes résultats passés.</p>
          {[["Total misé (€)", staked, setStaked], ["Total récupéré (€)", returned, setRet], ["Nombre de paris", nbBets, setNbBets]].map(([label, v, set]) => (
            <div key={label} style={{ marginBottom:12 }}>
              <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:5 }}>{label}</label>
              <input type="number" style={inp} placeholder="Ex: 1000" value={v} onChange={e => set(e.target.value)} />
            </div>
          ))}
          <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:5 }}>Durée (optionnel)</label>
              <input type="number" style={inp} placeholder="Ex: 3" value={periodN} onChange={e => setPeriodN(e.target.value)} />
            </div>
            <select style={{ ...inp, width:"auto", paddingRight:8 }} value={period} onChange={e => setPeriod(e.target.value)}>
              <option value="weeks">semaines</option>
              <option value="months">mois</option>
            </select>
          </div>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {ready ? (
          <>
            <div style={{ ...card, textAlign:"center", border:`1px solid ${rating.c}33`, background:`${rating.c}08` }}>
              <p style={{ margin:"0 0 4px", fontSize:12, color:"#64748b", textTransform:"uppercase", letterSpacing:1 }}>Performance</p>
              <p style={{ margin:"0 0 6px", fontSize:48, fontWeight:900, color:rating.c, lineHeight:1 }}>{roiPct >= 0 ? "+" : ""}{roiPct.toFixed(2)}%</p>
              <p style={{ margin:0, fontSize:16, fontWeight:700, color:rating.c }}>{rating.label}</p>
            </div>
            <div style={card}>
              {[
                { label:"Profit / Perte",    v:`${profitLoss >= 0 ? "+" : ""}${fmtE(profitLoss)}`, c: profitLoss >= 0 ? "#10b981" : "#f43f5e" },
                ...(avgStake ? [{ label:"Mise moyenne / pari", v:fmtE(avgStake), c:"#94a3b8" }] : []),
                ...(avgRet   ? [{ label:"Retour moyen / pari",  v:fmtE(avgRet),   c:"#22d3ee"  }] : []),
                ...(projYearlyROI !== null ? [{ label:`ROI annuel projeté (${period==="weeks"?"semaines":"mois"})`, v:`${projYearlyROI >= 0 ? "+" : ""}${projYearlyROI.toFixed(1)}%`, c:"#a5b4fc" }] : []),
              ].map((r,i,arr) => <div key={r.label} style={{ ...rowS, ...(i===arr.length-1 ? {borderBottom:"none"} : {}) }}><span style={lbl}>{r.label}</span><span style={val(r.c)}>{r.v}</span></div>)}
            </div>
            <div style={{ ...card, background:"#0f172a", border:"1px solid #334155", padding:"10px 14px" }}>
              <p style={{ margin:0, fontSize:11, color:"#475569", lineHeight:1.7 }}>
                Excellent {">"}15% · Bon 5–15% · Moyen 0–5% · Mauvais {"<"}0%
              </p>
            </div>
          </>
        ) : (
          <div style={{ ...card, textAlign:"center", padding:40, color:"#475569" }}>
            <p style={{ fontSize:40, margin:"0 0 12px" }}>📉</p>
            <p style={{ fontSize:14 }}>Entrez le total misé et le total récupéré.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────
function Calculatrice() {
  const mob = useWindowWidth() <= 480;
  const [tool, setTool] = useState("prob");
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* Tool selector */}
      <div style={{ display:"flex", gap:6, flexWrap: mob ? "nowrap" : "wrap", overflowX: mob ? "auto" : "visible", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", paddingBottom: mob ? 4 : 0 }}>
        {CALC_TOOLS.map(t => (
          <button key={t.id} onClick={() => setTool(t.id)}
            style={{ padding:"8px 14px", borderRadius:8, border:`1px solid ${tool===t.id ? "#6366f1" : "#334155"}`, background: tool===t.id ? "#6366f122" : "#1e293b", color: tool===t.id ? "#a5b4fc" : "#64748b", cursor:"pointer", fontWeight: tool===t.id ? 700 : 400, fontSize:13, whiteSpace:"nowrap", flexShrink:0 }}>
            {mob ? t.icon : `${t.icon} ${t.label}`}
          </button>
        ))}
      </div>
      {/* Active tool */}
      {tool === "prob"   && <ToolProb />}
      {tool === "dutch"  && <ToolDutch />}
      {tool === "sure"   && <ToolSure />}
      {tool === "split"  && <ToolSplit />}
      {tool === "target" && <ToolTarget />}
      {tool === "roi"    && <ToolROI />}
    </div>
  );
}






// ─── Historique déroulant ─────────────────────────────────────────────────────
function HistoriqueDeroulant({ bets, onEdit, onDelete }) {
  const mob = useWindowWidth() <= 480;
  const [open, setOpen] = useState(false);
  const [filterS, setFilterS] = useState("Tous");
  const [filterSt, setFilterSt] = useState("Tous");
  const [search, setSearch] = useState("");

  const filtered = bets.filter(b =>
    (filterS === "Tous" || b.sport === filterS) &&
    (filterSt === "Tous" || b.statut === filterSt) &&
    (b.event.toLowerCase().includes(search.toLowerCase()) || b.sport.toLowerCase().includes(search.toLowerCase()))
  );

  const statutColor = s => s === "Gagné" ? "#10b981" : s === "Perdu" ? "#f43f5e" : "#f59e0b";

  return (
    <div style={{ ...card, padding: 0, overflow: "hidden", border: "1px solid #334155" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#e2e8f0" }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>📋 Historique des paris ({bets.length})</span>
        <span style={{ fontSize: 18, color: "#64748b" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ borderTop: "1px solid #334155" }}>
          {/* Filtres */}
          <div style={{ display: "flex", gap: mob ? 6 : 10, padding: mob ? "10px 12px" : "12px 16px", flexWrap: "wrap", background: "#0f172a" }}>
            <input
              style={{ ...inp, flex: 1, minWidth: mob ? 0 : 140, minHeight: 44 }}
              placeholder="Rechercher un match..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div style={{ display: "flex", gap: 6, width: mob ? "100%" : "auto" }}>
              <select style={{ ...inp, flex: 1, minHeight: 44 }} value={filterS} onChange={e => setFilterS(e.target.value)}>
                {["Tous", ...SPORTS].map(s => <option key={s}>{s}</option>)}
              </select>
              <select style={{ ...inp, flex: 1, minHeight: 44 }} value={filterSt} onChange={e => setFilterSt(e.target.value)}>
                {["Tous", ...STATUTS].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Liste */}
          <div style={{ overflowX: "auto" }}>
            {filtered.length === 0 ? (
              <p style={{ margin: 0, padding: "24px", textAlign: "center", color: "#475569", fontSize: 13 }}>Aucun pari trouvé.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #334155" }}>
                    {["Date", "Sport", "Match", "Cote", "Mise", "Statut", "Résultat", ""].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => {
                    const profit = b.statut === "Gagné"
                      ? (b.mise * b.cote - b.mise).toFixed(2)
                      : b.statut === "Perdu"
                        ? `-${Number(b.mise).toFixed(2)}`
                        : "—";
                    const profitColor = b.statut === "Gagné" ? "#10b981" : b.statut === "Perdu" ? "#f43f5e" : "#94a3b8";
                    return (
                      <tr key={b.id} style={{ borderBottom: "1px solid #0f172a" }}>
                        <td style={{ padding: "10px 14px", color: "#64748b", whiteSpace: "nowrap" }}>{b.date}</td>
                        <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                          <span>{SPORT_ICONS[b.sport] || "🎲"} {b.sport}</span>
                        </td>
                        <td style={{ padding: "10px 14px", color: "#e2e8f0" }}>{b.event}</td>
                        <td style={{ padding: "10px 14px", color: "#a5b4fc", fontWeight: 600 }}>{Number(b.cote).toFixed(2)}</td>
                        <td style={{ padding: "10px 14px", color: "#94a3b8" }}>{Number(b.mise).toFixed(2)} €</td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ background: statutColor(b.statut) + "22", color: statutColor(b.statut), borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{b.statut}</span>
                        </td>
                        <td style={{ padding: "10px 14px", fontWeight: 700, color: profitColor }}>{b.statut !== "En cours" ? `${b.statut === "Gagné" ? "+" : ""}${profit} €` : "—"}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => onEdit(b)} style={{ background: "none", border: "1px solid #334155", borderRadius: 6, color: "#6366f1", cursor: "pointer", padding: "3px 8px", fontSize: 12 }}>✏️</button>
                            <button onClick={() => onDelete(b.id)} style={{ background: "none", border: "1px solid #334155", borderRadius: 6, color: "#f43f5e", cursor: "pointer", padding: "3px 8px", fontSize: 12 }}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Classement ───────────────────────────────────────────────────────────────
const FAKE_PLAYERS = [
  { pseudo: "BetKing77",  avatar: "🦁", paris: 42, gagnes: 28, mise: 1240, gain: 1680 },
  { pseudo: "TipsterPro", avatar: "🎯", paris: 35, gagnes: 21, mise: 980,  gain: 1250 },
  { pseudo: "Grégoire_B", avatar: "🐺", paris: 29, gagnes: 16, mise: 720,  gain: 870  },
  { pseudo: "AceServe",   avatar: "🎾", paris: 18, gagnes: 11, mise: 430,  gain: 510  },
  { pseudo: "DunkMaster", avatar: "🏀", paris: 22, gagnes: 10, mise: 560,  gain: 590  },
  { pseudo: "ScrutPack",  avatar: "🏉", paris: 15, gagnes:  7, mise: 310,  gain: 320  },
  { pseudo: "OctagonBet", avatar: "🥊", paris: 12, gagnes:  4, mise: 200,  gain: 195  },
];

function Classement({ pseudo, stats, bets, joinedCommunities }) {
  const mob = useWindowWidth() <= 480;
  const [filter, setFilter] = useState("roi");
  const [mode, setMode] = useState("general");
  const [selectedCommId, setSelectedCommId] = useState(null);
  const myParis  = bets.length;
  const myGagnes = bets.filter(b => b.statut === "Gagné").length;
  const myMise   = bets.reduce((s, b) => s + Number(b.mise), 0);
  const myGain   = bets.filter(b => b.statut === "Gagné").reduce((s, b) => s + Number(b.mise) * Number(b.cote), 0);

  const allPlayers = (mode === "general" ? FAKE_PLAYERS : FAKE_PLAYERS.filter((_, i) => {
    const comm = joinedCommunities.find(c => c.id === selectedCommId);
    return comm ? comm.members.includes(FAKE_PLAYERS[i]?.pseudo) : false;
  })).concat([{ pseudo, avatar: "😎", paris: myParis, gagnes: myGagnes, mise: myMise, gain: myGain, isMe: true }]).map(p => ({
    ...p,
    roi:    p.mise > 0 ? ((p.gain - p.mise) / p.mise * 100) : 0,
    taux:   p.paris > 0 ? (p.gagnes / p.paris * 100) : 0,
    profit: p.gain - p.mise,
  }));

  const sorted = [...allPlayers].sort((a, b) => {
    if (filter === "roi")    return b.roi - a.roi;
    if (filter === "taux")   return b.taux - a.taux;
    if (filter === "profit") return b.profit - a.profit;
    return b.paris - a.paris;
  });

  const medals = ["🥇","🥈","🥉"];
  const myRank  = sorted.findIndex(p => p.isMe) + 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Banner */}
      <div style={{ ...card, background: "linear-gradient(135deg,#6366f122,#0f172a)", border: "1px solid #6366f155", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ fontSize: 40 }}>😎</div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Votre position</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#a5b4fc" }}>#{myRank} <span style={{ fontSize: 14, color: "#64748b", fontWeight: 400 }}>sur {sorted.length} joueurs</span></p>
        </div>
        {[
          { label: "ROI",    val: `${stats.roi} %`,                                              color: Number(stats.roi) >= 0 ? "#10b981" : "#f43f5e" },
          { label: "Taux",   val: `${stats.taux} %`,                                             color: "#6366f1" },
          { label: "Profit", val: `${stats.profit >= 0 ? "+" : ""}${stats.profit.toFixed(0)} €`, color: stats.profit >= 0 ? "#10b981" : "#f43f5e" },
        ].map(k => (
          <div key={k.label} style={{ textAlign: "center", background: "#0f172a", borderRadius: 10, padding: "10px 18px" }}>
            <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{k.label}</p>
            <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 16, color: k.color }}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Mode général / communauté */}
      <div style={{ display: "flex", gap: 8, overflowX: mob ? "auto" : "visible", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
        {[["general", mob ? "🌐 Général" : "🌐 Classement général"],["communaute", mob ? "🏘️ Communauté" : "🏘️ Classement communauté"]].map(([val, label]) => (
          <button key={val} onClick={() => { setMode(val); setSelectedCommId(joinedCommunities[0]?.id ?? null); }}
            style={{ background: mode === val ? "#6366f1" : "#1e293b", color: mode === val ? "#fff" : "#94a3b8", border: "none", borderRadius: 8, padding: mob ? "9px 14px" : "9px 20px", cursor: "pointer", fontWeight: 700, fontSize: mob ? 13 : 14, whiteSpace: "nowrap", flexShrink: 0 }}>
            {label}
          </button>
        ))}
      </div>

      {/* Sélecteur de communauté */}
      {mode === "communaute" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {joinedCommunities.length === 0 ? (
            <div style={{ ...card, color: "#64748b", textAlign: "center", padding: 28 }}>
              <p style={{ fontSize: 24, margin: "0 0 8px" }}>🏘️</p>
              <p style={{ margin: 0 }}>Vous n'avez rejoint aucune communauté.<br />Créez ou rejoignez-en une pour lancer un tournoi !</p>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {joinedCommunities.map(c => (
                <button key={c.id} onClick={() => setSelectedCommId(c.id)}
                  style={{ background: selectedCommId === c.id ? c.color+"33" : "#1e293b", border: `1px solid ${selectedCommId === c.id ? c.color : "#334155"}`, borderRadius: 10, padding: "10px 18px", cursor: "pointer", color: selectedCommId === c.id ? "#e2e8f0" : "#94a3b8", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: c.color }} />
                  {c.name}
                  <span style={{ fontSize: 11, color: "#64748b" }}>{c.members.length} membre{c.members.length > 1 ? "s" : ""}</span>
                </button>
              ))}
            </div>
          )}
          {selectedCommId && (() => {
            const comm = joinedCommunities.find(c => c.id === selectedCommId);
            return comm ? (
              <div style={{ background: "#0f172a", border: `1px solid ${comm.color}44`, borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18 }}>🏆</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{comm.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Membres : {comm.members.join(", ")}</p>
                </div>
                {comm.type === "private" && comm.creator === pseudo && (
                  <div style={{ fontSize: 12, color: "#f59e0b", background: "#f59e0b11", borderRadius: 8, padding: "6px 12px" }}>
                    🔑 Code invitation : <strong style={{ letterSpacing: 2 }}>{comm.code}</strong>
                  </div>
                )}
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* Trier par */}
      <div style={{ display: "flex", gap: 8, flexWrap: mob ? "nowrap" : "wrap", alignItems: "center", overflowX: mob ? "auto" : "visible", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
        <span style={{ fontSize: 13, color: "#64748b", marginRight: 4, whiteSpace: "nowrap", flexShrink: 0 }}>Trier :</span>
        {[["roi","📈 ROI"],["taux","🎯 Taux"],["profit","💰 Profit"],["paris","🎲 Paris"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{ background: filter === val ? "#6366f1" : "#1e293b", color: filter === val ? "#fff" : "#94a3b8", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", flexShrink: 0 }}>
            {label}
          </button>
        ))}
      </div>

      {/* Tableau */}
      {(mode === "general" || (mode === "communaute" && selectedCommId && joinedCommunities.length > 0)) && (
        <div style={{ ...card, overflowX: "auto", padding: mob ? "12px 0" : 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: mob ? 12 : 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                {["#","Joueur","Paris","Gagnés","Taux","ROI","Profit"].map(h => (
                  <th key={h} style={{ padding: mob ? "8px 8px" : "10px 12px", textAlign: h === "#" || h === "Joueur" ? "left" : "right", color: "#64748b", fontWeight: 600, fontSize: mob ? 11 : 12, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => {
                const roiColor  = p.roi >= 0 ? "#10b981" : "#f43f5e";
                const profColor = p.profit >= 0 ? "#10b981" : "#f43f5e";
                return (
                  <tr key={p.pseudo} style={{ borderBottom: "1px solid #0f172a", background: p.isMe ? "#6366f10a" : "transparent" }}>
                    <td style={{ padding: mob ? "8px 8px" : "12px 12px", fontWeight: 700, fontSize: i < 3 ? (mob ? 16 : 20) : (mob ? 12 : 14), color: i < 3 ? undefined : "#64748b" }}>
                      {i < 3 ? medals[i] : `#${i+1}`}
                    </td>
                    <td style={{ padding: mob ? "8px 8px" : "12px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: mob ? 6 : 10 }}>
                        <span style={{ fontSize: mob ? 16 : 22 }}>{p.avatar}</span>
                        <p style={{ margin: 0, fontWeight: p.isMe ? 700 : 500, color: p.isMe ? "#a5b4fc" : "#e2e8f0", fontSize: mob ? 12 : 14, whiteSpace: mob ? "nowrap" : "normal" }}>
                          {p.pseudo} {p.isMe && <span style={{ fontSize: 10, color: "#6366f1", background: "#6366f122", borderRadius: 6, padding: "1px 5px", marginLeft: 2 }}>Vous</span>}
                        </p>
                      </div>
                    </td>
                    <td style={{ padding: mob ? "8px 8px" : "12px 12px", textAlign: "right", color: "#94a3b8" }}>{p.paris}</td>
                    <td style={{ padding: mob ? "8px 8px" : "12px 12px", textAlign: "right", color: "#94a3b8" }}>{p.gagnes}</td>
                    <td style={{ padding: mob ? "8px 8px" : "12px 12px", textAlign: "right", color: "#6366f1", fontWeight: 600 }}>{p.taux.toFixed(1)}%</td>
                    <td style={{ padding: mob ? "8px 8px" : "12px 12px", textAlign: "right", fontWeight: 700, color: roiColor }}>{p.roi >= 0 ? "+" : ""}{p.roi.toFixed(1)}%</td>
                    <td style={{ padding: mob ? "8px 8px" : "12px 12px", textAlign: "right", fontWeight: 700, color: profColor }}>{p.profit >= 0 ? "+" : ""}{p.profit.toFixed(0)} €</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p style={{ margin: 0, fontSize: 12, color: "#334155", textAlign: "center" }}>⚠️ Les autres joueurs sont des données fictives de démonstration.</p>
    </div>
  );
}

// ─── Data initiale ────────────────────────────────────────────────────────────
const initialBets = [];

const DEMO_BETS = [
  { id: "d1", date: "2026-03-10", sport: "Football",   event: "PSG vs Marseille",        cote: 1.85, mise: 50,  statut: "Gagné"    },
  { id: "d2", date: "2026-03-11", sport: "Tennis",     event: "Djokovic vs Alcaraz",      cote: 2.10, mise: 30,  statut: "Perdu"    },
  { id: "d3", date: "2026-03-12", sport: "Basketball", event: "Lakers vs Warriors",       cote: 1.65, mise: 40,  statut: "Gagné"    },
  { id: "d4", date: "2026-03-14", sport: "Football",   event: "Real Madrid vs Barcelone", cote: 3.20, mise: 25,  statut: "Gagné"    },
  { id: "d5", date: "2026-03-15", sport: "Rugby",      event: "France vs Angleterre",     cote: 1.90, mise: 60,  statut: "Perdu"    },
  { id: "d6", date: "2026-03-16", sport: "MMA",        event: "Jones vs Aspinall",        cote: 1.75, mise: 35,  statut: "En cours" },
];

const initPublicChats = {
  Football:   [
    { id: 1, user: "BetKing77",  avatar: "🦁", time: "14:32", text: "PSG ce soir ça sent la victoire, cote à 1.65 je fonce 💪" },
    { id: 2, user: "Grégoire_B", avatar: "🐺", time: "14:35", text: "Attention à Mbappé s'il joue pas... je reste prudent" },
    { id: 3, user: "TipsterPro", avatar: "🎯", time: "14:41", text: "J'ai misé sur les deux équipes qui marquent, cote 1.80 🔥" },
  ],
  Tennis:     [
    { id: 1, user: "AceServe",  avatar: "🎾", time: "11:10", text: "Sinner est en forme incroyable cette saison, value bet sur lui" },
    { id: 2, user: "CourtKing", avatar: "👑", time: "11:22", text: "Alcaraz sur terre battue = imbattable imo" },
  ],
  Basketball: [{ id: 1, user: "DunkMaster", avatar: "🏀", time: "09:50", text: "Lakers -4.5 points ce soir, LeBron revient de blessure méfiance" }],
  Rugby:      [{ id: 1, user: "ScrutPack",  avatar: "🏉", time: "16:05", text: "France à domicile = banque ! Cote 1.45 mais valeur sûre" }],
  MMA:        [{ id: 1, user: "OctagonBet", avatar: "🥊", time: "20:15", text: "Main event UFC ce week-end, le challenger est dangereux sur les cotes" }],
  Baseball: [], Autre: [],
};

const initCommunities = [
  { id: "c1", name: "Les Tipsters FR", sport: "Football", type: "public",  code: "TIPFR1", color: "#6366f1", creator: "BetKing77", members: ["BetKing77","TipsterPro"], messages: [{ id: 1, user: "BetKing77", avatar: "🦁", time: "13:00", text: "Bienvenue dans Les Tipsters FR ! 🎉" }] },
  { id: "c2", name: "Tennis Pros",     sport: "Tennis",   type: "public",  code: "TENPR2", color: "#10b981", creator: "AceServe",  members: ["AceServe","CourtKing"],   messages: [{ id: 1, user: "AceServe",  avatar: "🎾", time: "10:00", text: "Partagez vos meilleurs tips tennis ici 🎾" }] },
  { id: "c3", name: "VIP Betters",     sport: "Autre",    type: "private", code: "VIP999", color: "#f59e0b", creator: "ProBet",    members: ["ProBet"],                 messages: [] },
];

function genCode() { return Math.random().toString(36).substring(2, 8).toUpperCase(); }

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const isMob = useWindowWidth() <= 480;

  // ── Auth ──
  const [session, setSession] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(null);
  const [guestMode, setGuestMode] = useState(() => sessionStorage.getItem("guestMode") === "1");
  const [authMode, setAuthMode]   = useState("login");
  const [toast, setToast]         = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s ?? null);
      if (!s) setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    supabase.from("profiles").select("*").eq("id", session.user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [session]);

  // ── Data ──
  const [bets, setBets]             = useState(initialBets);
  const [form, setForm]             = useState({ date: new Date().toISOString().split("T")[0], sport: "Football", event: "", cote: "", mise: "", statut: "Gagné" });
  const [showForm, setShowForm]     = useState(false);
  const [editId, setEditId]         = useState(null);
  const [filterSport, setFilterSport] = useState("Tous");
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [search, setSearch]         = useState("");
  const [activeTab, setActiveTab]   = useState("dashboard");

  const [bankroll, setBankroll] = useState({ starting: 1000 });
  const [showBankrollModal, setShowBankrollModal] = useState(false);
  const [bkForm, setBkForm] = useState({ deposit: "", withdraw: "", reset: "" });

  const [showCommSidebar, setShowCommSidebar] = useState(false);
  const [commView, setCommView]         = useState("home");
  const [activeChatSport, setActiveChatSport] = useState("Football");
  const [publicChats, setPublicChats]   = useState(initPublicChats);
  const [communities, setCommunities]   = useState(initCommunities);
  const [joinedIds, setJoinedIds]       = useState(["c1"]);
  const [activeCommunityId, setActiveCommunityId] = useState(null);
  const [chatInput, setChatInput]       = useState("");
  const [pseudo, setPseudo]             = useState("Moi");
  const [showPseudo, setShowPseudo]     = useState(false);
  const [searchComm, setSearchComm]     = useState("");
  const [joinCode, setJoinCode]         = useState("");
  const [joinError, setJoinError]       = useState("");
  const [createForm, setCreateForm]     = useState({ name: "", sport: "Football", type: "public", color: "#6366f1" });
  const [createError, setCreateError]   = useState("");
  const messagesEndRef = useRef(null);

  // ── Load bets + bankroll from Supabase when session is ready ──
  const loadUserData = useCallback(async (userId) => {
    const [{ data: betsData }, { data: bankData }] = await Promise.all([
      supabase.from("bets").select("*").eq("user_id", userId).order("date", { ascending: false }),
      supabase.from("bankroll").select("*").eq("user_id", userId).single(),
    ]);
    if (betsData) setBets(betsData.map(b => ({ ...b, cote: Number(b.cote), mise: Number(b.mise) })));
    if (bankData) setBankroll({ starting: Number(bankData.starting_amount) });
  }, []);

  useEffect(() => {
    if (session?.user) {
      loadUserData(session.user.id);
      // Set pseudo from profile
      const meta = session.user.user_metadata;
      if (meta?.pseudo) setPseudo(meta.pseudo);
    }
  }, [session, loadUserData]);

  // ── Guest mode: load demo data ──
  useEffect(() => {
    if (guestMode) {
      setBets(DEMO_BETS);
      setBankroll({ starting: 1000 });
      setPseudo("Visiteur");
    }
  }, [guestMode]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeCommunityId, commView, publicChats, communities]);

  const emptyForm = { date: new Date().toISOString().split("T")[0], sport: "Football", event: "", cote: "", mise: "", statut: "Gagné" };

  const stats = useMemo(() => {
    const done = bets.filter(b => b.statut !== "En cours");
    const won  = bets.filter(b => b.statut === "Gagné");
    const totalMise     = bets.reduce((s, b) => s + Number(b.mise), 0);
    const totalGain     = won.reduce((s, b) => s + Number(b.mise) * Number(b.cote), 0);
    const totalMiseDone = done.reduce((s, b) => s + Number(b.mise), 0);
    const profit = totalGain - totalMiseDone;
    const roi    = totalMiseDone > 0 ? ((profit / totalMiseDone) * 100).toFixed(1) : 0;
    const taux   = done.length > 0 ? ((won.length / done.length) * 100).toFixed(1) : 0;
    return { totalMise, profit, roi, taux, wonCount: won.length, doneCount: done.length };
  }, [bets]);

  const bankrollData = useMemo(() => {
    let bank = bankroll.starting;
    const sorted = [...bets].filter(b => b.statut !== "En cours").sort((a, b) => a.date.localeCompare(b.date));
    const pts = [{ date: "Départ", bank }];
    sorted.forEach(b => {
      if (b.statut === "Gagné") bank += Number(b.mise) * Number(b.cote) - Number(b.mise);
      else bank -= Number(b.mise);
      pts.push({ date: b.date.slice(5), bank: Math.round(bank) });
    });
    return pts;
  }, [bets]);

  const sportData = useMemo(() => {
    const map = {};
    bets.forEach(b => { map[b.sport] = (map[b.sport] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [bets]);

  const perfData = useMemo(() => {
    const map = {};
    bets.filter(b => b.statut !== "En cours").forEach(b => {
      if (!map[b.sport]) map[b.sport] = { sport: b.sport, gain: 0, perte: 0 };
      if (b.statut === "Gagné") map[b.sport].gain = Math.round(Number(b.mise) * (Number(b.cote) - 1));
      else map[b.sport].perte = Math.round(Number(b.mise));
    });
    return Object.values(map);
  }, [bets]);

  const filtered = useMemo(() => bets.filter(b =>
    (filterSport === "Tous" || b.sport === filterSport) &&
    (filterStatut === "Tous" || b.statut === filterStatut) &&
    (b.event.toLowerCase().includes(search.toLowerCase()) || b.sport.toLowerCase().includes(search.toLowerCase()))
  ), [bets, filterSport, filterStatut, search]);

  const handleSubmit = async () => {
    if (!form.date || !form.event || !form.cote || !form.mise) return;
    const userId = session?.user?.id;
    const payload = { ...form, cote: Number(form.cote), mise: Number(form.mise) };
    if (editId !== null) {
      setBets(bets.map(b => b.id === editId ? { ...payload, id: editId } : b));
      if (!guestMode && userId) await supabase.from("bets").update({ ...payload, user_id: userId }).eq("id", editId);
      setEditId(null);
    } else {
      const newBet = { ...payload, id: Date.now() };
      setBets(prev => [...prev, newBet]);
      if (!guestMode && userId) await supabase.from("bets").insert({ ...payload, id: newBet.id, user_id: userId });
      if (guestMode) showToast("Créez un compte pour sauvegarder vos paris !");
    }
    setForm(emptyForm); setShowForm(false);
  };
  const handleEdit   = b => { setForm({ ...b }); setEditId(b.id); setShowForm(true); };
  const handleDelete = async (id) => {
    setBets(bets.filter(b => b.id !== id));
    if (!guestMode && session?.user?.id) await supabase.from("bets").delete().eq("id", id).eq("user_id", session.user.id);
    if (guestMode) showToast("Créez un compte pour sauvegarder vos paris !");
  };

  const handleBankrollSave = async () => {
    const deposit  = parseFloat(bkForm.deposit)  || 0;
    const withdraw = parseFloat(bkForm.withdraw) || 0;
    const resetVal = parseFloat(bkForm.reset);
    const isReset  = bkForm.reset.trim() !== "" && !isNaN(resetVal);
    const newStarting = isReset ? resetVal : bankroll.starting + deposit - withdraw;
    setBankroll({ starting: newStarting });
    if (!guestMode && session?.user?.id) {
      await supabase.from("bankroll").upsert({
        user_id: session.user.id,
        starting_amount: newStarting,
        amount: newStarting,
      });
    }
    setBkForm({ deposit: "", withdraw: "", reset: "" });
    setShowBankrollModal(false);
  };

  const sendPublicMsg = () => {
    if (!chatInput.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setPublicChats(p => ({ ...p, [activeChatSport]: [...p[activeChatSport], { id: Date.now(), user: pseudo, avatar: "😎", time, text: chatInput.trim(), isMe: true }] }));
    setChatInput("");
  };

  const sendCommunityMsg = () => {
    if (!chatInput.trim() || !activeCommunityId) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setCommunities(p => p.map(c => c.id === activeCommunityId
      ? { ...c, messages: [...c.messages, { id: Date.now(), user: pseudo, avatar: "😎", time, text: chatInput.trim(), isMe: true }] }
      : c));
    setChatInput("");
  };

  const handleJoin = () => {
    setJoinError("");
    if (!joinCode.trim()) return;
    const found = communities.find(c => c.code === joinCode.trim().toUpperCase());
    if (!found) { setJoinError("Code invalide."); return; }
    if (joinedIds.includes(found.id)) { setJoinError("Vous êtes déjà membre."); return; }
    setJoinedIds(p => [...p, found.id]);
    setCommunities(p => p.map(c => c.id === found.id ? { ...c, members: [...c.members, pseudo] } : c));
    setJoinCode(""); setCommView("mycommunities");
  };

  const handleJoinById = id => {
    if (joinedIds.includes(id)) return;
    setJoinedIds(p => [...p, id]);
    setCommunities(p => p.map(c => c.id === id ? { ...c, members: [...c.members, pseudo] } : c));
  };

  const handleCreate = () => {
    setCreateError("");
    if (!createForm.name.trim()) { setCreateError("Donnez un nom à votre communauté."); return; }
    if (communities.find(c => c.name.toLowerCase() === createForm.name.trim().toLowerCase())) { setCreateError("Ce nom est déjà pris."); return; }
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newC = { id: "c" + Date.now(), name: createForm.name.trim(), sport: createForm.sport, type: createForm.type, code: genCode(), color: createForm.color, creator: pseudo, members: [pseudo], messages: [{ id: 1, user: pseudo, avatar: "😎", time, text: `Bienvenue dans ${createForm.name.trim()} ! 🎉`, isMe: true }] };
    setCommunities(p => [...p, newC]);
    setJoinedIds(p => [...p, newC.id]);
    setCreateForm({ name: "", sport: "Football", type: "public", color: "#6366f1" });
    setActiveCommunityId(newC.id); setCommView("chat");
  };

  const activeCommunity = communities.find(c => c.id === activeCommunityId);
  const joinedCommunities = communities.filter(c => joinedIds.includes(c.id));
  const publicSearchResults = searchComm.trim().length > 0
    ? communities.filter(c => c.type === "public" && c.name.toLowerCase().includes(searchComm.toLowerCase()))
    : [];

  const renderChat = (msgs, onSend) => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {msgs.length === 0 && <div style={{ textAlign: "center", color: "#475569", marginTop: 60 }}><p style={{ fontSize: 32 }}>💬</p><p>Aucun message. Soyez le premier !</p></div>}
        {msgs.map(m => (
          <div key={m.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: m.isMe ? "row-reverse" : "row" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: m.isMe ? "#6366f1" : "#0f172a", border: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{m.avatar}</div>
            <div style={{ maxWidth: "70%" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 4, flexDirection: m.isMe ? "row-reverse" : "row" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: m.isMe ? "#a5b4fc" : "#94a3b8" }}>{m.user}</span>
                <span style={{ fontSize: 10, color: "#475569" }}>{m.time}</span>
              </div>
              <div style={{ background: m.isMe ? "#6366f133" : "#0f172a", border: `1px solid ${m.isMe ? "#6366f155" : "#334155"}`, borderRadius: m.isMe ? "12px 4px 12px 12px" : "4px 12px 12px 12px", padding: "9px 13px", fontSize: 14, lineHeight: 1.5, color: "#e2e8f0" }}>{m.text}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: "12px 16px", borderTop: "1px solid #334155", display: "flex", gap: 10 }}>
        <input style={{ ...inp, flex: 1 }} placeholder="Écrire un message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && onSend()} />
        <button onClick={onSend} style={{ ...btnPrimary, padding: "0 18px", fontSize: 16 }}>➤</button>
      </div>
    </div>
  );

  // Auth guard
  if (session === undefined) {
    return (
      <div style={{ background: "#0f172a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif", color: "#64748b", fontSize: 16 }}>
        Chargement…
      </div>
    );
  }
  if (!session && !guestMode) return (
    <AuthPage
      initialMode={authMode}
      onGuestMode={() => {
        sessionStorage.setItem("guestMode", "1");
        setGuestMode(true);
        setAuthMode("login");
      }}
    />
  );

  const exitGuestToRegister = () => {
    sessionStorage.removeItem("guestMode");
    setGuestMode(false);
    setAuthMode("register");
  };

  return (
    <>
      <AgeVerificationModal />
      <PreventionBanner />

      {/* Guest mode banner */}
      {guestMode && (
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: "#1e293b", borderBottom: "1px solid #334155", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#94a3b8", flex: 1, minWidth: 0 }}>👋 Mode démo — Inscrivez-vous pour sauvegarder vos paris</span>
          <button onClick={exitGuestToRegister} style={{ ...btnPrimary, padding: "6px 14px", fontSize: 13, whiteSpace: "nowrap", flexShrink: 0 }}>S'inscrire</button>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 999, background: "#1e293b", border: "1px solid #6366f1", borderRadius: 10, padding: "12px 24px", color: "#e2e8f0", fontSize: 14, fontWeight: 600, boxShadow: "0 8px 32px #0008", display: "flex", alignItems: "center", gap: 10 }}>
          <span>💾</span> {toast}
          <button onClick={() => { exitGuestToRegister(); }} style={{ marginLeft: 12, background: "#6366f1", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Créer un compte</button>
        </div>
      )}

    <div style={{ background: "#0f172a", minHeight: "100vh", fontFamily: "'Inter',sans-serif", color: "#e2e8f0", padding: isMob ? "16px 12px 100px" : "24px 20px 88px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", flexDirection: isMob ? "column" : "row", justifyContent: "space-between", alignItems: isMob ? "stretch" : "center", marginBottom: isMob ? 16 : 28, gap: isMob ? 12 : 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <BetcrewLogo size={40} />
                <span style={{ fontSize: isMob ? 18 : 22, fontWeight: 800, letterSpacing: -0.5 }}>
                  <span style={{ color: "#f1f5f9" }}>BET</span><span style={{ color: "#6366f1" }}>CREW</span>
                </span>
                <Badge18 size={isMob ? 22 : 28} />
              </div>
              <p style={{ margin: 0, color: "#64748b", fontSize: isMob ? 11 : 13 }}>Suivi de vos paris sportifs</p>
            </div>
            {/* User info (inline with title on mobile) */}
            {isMob && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "5px 10px", flexShrink: 0 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: guestMode ? "#475569" : "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {guestMode ? "👀" : (profile?.pseudo || pseudo || "?")[0].toUpperCase()}
                </div>
                <button onClick={guestMode ? exitGuestToRegister : () => supabase.auth.signOut()}
                  style={{ background: "none", border: "none", color: guestMode ? "#6366f1" : "#64748b", cursor: "pointer", fontSize: 12, padding: 0 }}>
                  {guestMode ? "S'inscrire" : "Déco"}
                </button>
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {activeTab === "dashboard" && (
              <>
                <button onClick={() => setShowBankrollModal(true)} style={{ ...btnSecondary, flex: isMob ? 1 : undefined, justifyContent: "center", minHeight: 44 }}>
                  💰 {isMob ? "Bankroll" : "Modifier ma Bankroll"}
                </button>
                <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }} style={{ ...btnPrimary, flex: isMob ? 1 : undefined, justifyContent: "center", minHeight: 44 }}>
                  {showForm ? "✕ Fermer" : "+ Nouveau pari"}
                </button>
              </>
            )}
            {/* User info (desktop) */}
            {!isMob && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "6px 12px" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: guestMode ? "#475569" : "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: guestMode ? 16 : 15, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {guestMode ? "👀" : (profile?.pseudo || pseudo || "?")[0].toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: guestMode ? "#94a3b8" : "#e2e8f0" }}>{guestMode ? "Mode Démo" : (profile?.pseudo || pseudo)}</span>
                <button onClick={guestMode ? exitGuestToRegister : () => supabase.auth.signOut()}
                  style={{ background: "none", border: "1px solid #334155", borderRadius: 6, color: guestMode ? "#6366f1" : "#64748b", cursor: "pointer", fontSize: 12, padding: "3px 8px", marginLeft: 4 }}>
                  {guestMode ? "S'inscrire" : "Déconnexion"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bankroll Modal */}
        {showBankrollModal && (() => {
          const currentBankroll = bankroll.starting + stats.profit;
          return (
            <div style={{ position: "fixed", inset: 0, background: "#00000088", zIndex: 1000, display: "flex", alignItems: isMob ? "flex-end" : "center", justifyContent: "center" }}
              onClick={e => { if (e.target === e.currentTarget) setShowBankrollModal(false); }}>
              <div style={{ ...card, width: isMob ? "100%" : 420, maxHeight: isMob ? "90vh" : "none", overflowY: isMob ? "auto" : "visible", border: "1px solid #334155", boxShadow: "0 24px 64px #00000066", borderRadius: isMob ? "16px 16px 0 0" : 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>💰 Modifier ma Bankroll</h2>
                  <button onClick={() => setShowBankrollModal(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>✕</button>
                </div>

                {/* Current bankroll summary */}
                <div style={{ background: "#0f172a", borderRadius: 10, padding: "14px 16px", marginBottom: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Bankroll",          val: `${bankroll.starting.toFixed(2)} €`, color: "#94a3b8" },
                    { label: "Bankroll actuelle", val: `${currentBankroll.toFixed(2)} €`, color: currentBankroll >= bankroll.starting ? "#10b981" : "#f43f5e" },
                  ].map(r => (
                    <div key={r.label} style={{ textAlign: "center" }}>
                      <p style={{ margin: 0, fontSize: 11, color: "#475569" }}>{r.label}</p>
                      <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 15, color: r.color }}>{r.val}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6 }}>➕ Dépôt (ajouter de l'argent)</label>
                    <input type="number" min="0" step="0.01" style={{ ...inp, minHeight: 44 }} placeholder="Ex: 100.00" value={bkForm.deposit} onChange={e => setBkForm(f => ({ ...f, deposit: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6 }}>➖ Retrait (retirer de l'argent)</label>
                    <input type="number" min="0" step="0.01" style={{ ...inp, minHeight: 44 }} placeholder="Ex: 50.00" value={bkForm.withdraw} onChange={e => setBkForm(f => ({ ...f, withdraw: e.target.value }))} />
                  </div>
                  <div style={{ borderTop: "1px solid #334155", paddingTop: 14 }}>
                    <label style={{ fontSize: 12, color: "#f59e0b", display: "block", marginBottom: 6 }}>🔄 Reset — définir une nouvelle bankroll de départ</label>
                    <input type="number" min="0" step="0.01" style={{ ...inp, border: "1px solid #f59e0b44", minHeight: 44 }} placeholder="Ex: 1000.00 (repart de zéro)" value={bkForm.reset} onChange={e => setBkForm(f => ({ ...f, reset: e.target.value }))} />
                    {bkForm.reset.trim() !== "" && <p style={{ margin: "6px 0 0", fontSize: 11, color: "#f59e0b" }}>⚠️ Le reset réinitialise dépôts et retraits.</p>}
                  </div>
                  <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                    <button onClick={handleBankrollSave} style={{ ...btnPrimary, flex: 1 }}>Enregistrer</button>
                    <button onClick={() => { setShowBankrollModal(false); setBkForm({ deposit: "", withdraw: "", reset: "" }); }} style={btnSecondary}>Annuler</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Form */}
        {showForm && activeTab === "dashboard" && (
          <div style={{ ...card, marginBottom: 24, border: "1px solid #334155" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#a5b4fc" }}>{editId ? "✏️ Modifier le pari" : "➕ Ajouter un pari"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr 1fr" : "repeat(auto-fill, minmax(160px, 1fr))", gap: isMob ? 10 : 12 }}>
              <div><label style={{ fontSize: 12, color: "#94a3b8" }}>Date</label><input type="date" style={{ ...inp, minHeight: 44 }} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><label style={{ fontSize: 12, color: "#94a3b8" }}>Sport</label>
                <select style={{ ...inp, minHeight: 44 }} value={form.sport} onChange={e => setForm({ ...form, sport: e.target.value })}>
                  {SPORTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "span 2" }}><label style={{ fontSize: 12, color: "#94a3b8" }}>Événement</label><input style={{ ...inp, minHeight: 44 }} placeholder="Ex: PSG vs Lyon" value={form.event} onChange={e => setForm({ ...form, event: e.target.value })} /></div>
              <div><label style={{ fontSize: 12, color: "#94a3b8" }}>Cote</label><input type="number" step="0.01" style={{ ...inp, minHeight: 44 }} placeholder="1.85" value={form.cote} onChange={e => setForm({ ...form, cote: e.target.value })} /></div>
              <div><label style={{ fontSize: 12, color: "#94a3b8" }}>Mise (€)</label><input type="number" style={{ ...inp, minHeight: 44 }} placeholder="50" value={form.mise} onChange={e => setForm({ ...form, mise: e.target.value })} /></div>
              <div style={{ gridColumn: isMob ? "span 2" : undefined }}><label style={{ fontSize: 12, color: "#94a3b8" }}>Statut</label>
                <select style={{ ...inp, minHeight: 44 }} value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                  {STATUTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleSubmit} style={{ ...btnPrimary, marginTop: 16, width: isMob ? "100%" : undefined, minHeight: 44 }}>{editId ? "Mettre à jour" : "Enregistrer"}</button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: isMob ? 16 : 24, overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", flexWrap: "nowrap", marginLeft: isMob ? -12 : 0, marginRight: isMob ? -12 : 0, paddingLeft: isMob ? 12 : 0, paddingRight: isMob ? 12 : 0 }}>
          {[["dashboard","📊","📊 Dashboard"],["calculatrice","🧮","🧮 Calculatrice"],["communaute","💬","💬 Communauté"],["classement","🏆","🏆 Classement"]].map(([t, emoji, label]) => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ background: activeTab === t ? "#6366f1" : "#1e293b", color: activeTab === t ? "#fff" : "#94a3b8", border: "none", borderRadius: 8, padding: isMob ? "10px 16px" : "8px 20px", cursor: "pointer", fontWeight: 600, fontSize: isMob ? 13 : 14, whiteSpace: "nowrap", flexShrink: 0, minHeight: 44 }}>
              {label}
            </button>
          ))}
        </div>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <>
            {/* Bankroll summary card */}
            {(() => {
              const currentBankroll = bankroll.starting + stats.profit;
              const diff = stats.profit;
              const barPct  = Math.min(Math.max((currentBankroll / Math.max(bankroll.starting, 1)) * 100, 0), 200);
              const barColor = diff >= 0 ? "#10b981" : "#f43f5e";
              return (
                <div style={{ ...card, marginBottom: 20, border: "1px solid #334155" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>💰 Suivi Bankroll</p>
                    <button onClick={() => setShowBankrollModal(true)} style={{ background: "none", border: "1px solid #334155", borderRadius: 7, color: "#94a3b8", cursor: "pointer", padding: "4px 12px", fontSize: 12 }}>Modifier</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    {[
                      { label: "Bankroll",          val: `${bankroll.starting.toFixed(2)} €`, color: "#94a3b8" },
                      { label: "Bankroll actuelle", val: `${currentBankroll.toFixed(2)} €`,   color: diff >= 0 ? "#10b981" : "#f43f5e" },
                    ].map(r => (
                      <div key={r.label} style={{ background: "#0f172a", borderRadius: 8, padding: "10px 14px" }}>
                        <p style={{ margin: 0, fontSize: 11, color: "#475569" }}>{r.label}</p>
                        <p style={{ margin: "5px 0 0", fontWeight: 700, fontSize: 14, color: r.color }}>{r.val}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: "#475569" }}>Départ : {bankroll.starting.toFixed(0)} €</span>
                      <span style={{ fontSize: 11, color: "#475569" }}>Actuelle : {currentBankroll.toFixed(0)} €</span>
                    </div>
                    <div style={{ background: "#0f172a", borderRadius: 99, height: 8, overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(barPct, 100)}%`, height: "100%", background: barColor, borderRadius: 99, transition: "width .4s" }} />
                    </div>
                  </div>
                </div>
              );
            })()}

            <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr 1fr" : "repeat(auto-fill, minmax(180px, 1fr))", gap: isMob ? 10 : 16, marginBottom: isMob ? 16 : 24 }}>
              {[
                { label: "Total Misé",    val: `${stats.totalMise.toFixed(0)} €`,                                             color: "#94a3b8" },
                { label: "Profit Net",    val: `${stats.profit >= 0 ? "+" : ""}${stats.profit.toFixed(0)} €`,                 color: stats.profit >= 0 ? "#10b981" : "#f43f5e" },
                { label: "ROI",           val: `${stats.roi} %`,                                                               color: Number(stats.roi) >= 0 ? "#10b981" : "#f43f5e" },
                { label: "Taux Réussite", val: `${stats.taux} %`,                                                              color: "#6366f1" },
                { label: "Paris gagnés",  val: `${stats.wonCount} / ${stats.doneCount}`,                                       color: "#f59e0b" },
              ].map(k => (
                <div key={k.label} style={{ ...card, textAlign: "center", padding: isMob ? "12px 8px" : 20 }}>
                  <p style={{ margin: 0, fontSize: isMob ? 11 : 12, color: "#64748b" }}>{k.label}</p>
                  <p style={{ margin: "6px 0 0", fontSize: isMob ? 18 : 22, fontWeight: 700, color: k.color }}>{k.val}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: isMob ? 12 : 16, marginBottom: 16 }}>
              <div style={{ ...card, padding: isMob ? 0 : 20, borderRadius: isMob ? 0 : 12, marginLeft: isMob ? -12 : 0, marginRight: isMob ? -12 : 0, overflow: "hidden" }}>
                {isMob ? (
                  /* Mobile: immersive header + area chart */
                  <>
                    <div style={{ padding: "16px 20px 8px" }}>
                      <p style={{ margin: "0 0 2px", fontSize: 12, color: "#64748b" }}>📈 Évolution du Bankroll</p>
                      <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#a5b4fc", lineHeight: 1.1 }}>
                        {(bankroll.starting + stats.profit).toFixed(2)} €
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: stats.profit >= 0 ? "#10b981" : "#f43f5e", fontWeight: 600 }}>
                        {stats.profit >= 0 ? "+" : ""}{stats.profit.toFixed(2)} € depuis le départ
                      </p>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={bankrollData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="bankGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 12 }} width={48} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #6366f155", borderRadius: 8, fontSize: 13 }} formatter={v => [`${v} €`, "Bankroll"]} />
                        <Area type="monotone" dataKey="bank" stroke="#6366f1" strokeWidth={2.5} fill="url(#bankGrad)" dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#a5b4fc" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  /* Desktop: original line chart */
                  <>
                    <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: 14 }}>📈 Évolution du Bankroll</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={bankrollData}>
                        <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
                        <Line type="monotone" dataKey="bank" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: "#6366f1" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                )}
              </div>
              <div style={card}>
                <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: 14 }}>🏅 Paris par Sport</p>
                <ResponsiveContainer width="100%" height={isMob ? 150 : 200}>
                  <PieChart>
                    <Pie data={sportData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={isMob ? 55 : 75} label={({ name, percent }) => `${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={isMob ? 10 : 11}>
                      {sportData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ ...card, marginBottom: 16 }}>
              <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: 14 }}>📊 Performance par Sport (€)</p>
              <ResponsiveContainer width="100%" height={isMob ? 150 : 200}>
                <BarChart data={perfData}>
                  <XAxis dataKey="sport" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} formatter={v => [`${v} €`]} />
                  <Legend />
                  <Bar dataKey="gain"  name="Gain"  fill="#10b981" radius={[4,4,0,0]} />
                  <Bar dataKey="perte" name="Perte" fill="#f43f5e" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Historique déroulant */}
            <HistoriqueDeroulant bets={bets} onEdit={b => { handleEdit(b); setShowForm(true); }} onDelete={handleDelete} />
          </>
        )}

        {/* CALCULATRICE */}
        {activeTab === "calculatrice" && <Calculatrice />}

        {/* PARIS */}
        {activeTab === "paris" && (
          <>
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <input style={{ ...inp, width: 220 }} placeholder="🔍 Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
              <select style={{ ...inp, width: 150 }} value={filterSport} onChange={e => setFilterSport(e.target.value)}>
                <option>Tous</option>{SPORTS.map(s => <option key={s}>{s}</option>)}
              </select>
              <select style={{ ...inp, width: 150 }} value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
                <option>Tous</option>{STATUTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ ...card, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #334155" }}>
                    {["Date","Sport","Événement","Cote","Mise","Gain potentiel","Statut","Actions"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: 32, color: "#475569" }}>Aucun pari trouvé</td></tr>}
                  {filtered.map(b => {
                    const gain = (Number(b.mise) * Number(b.cote)).toFixed(2);
                    const sc   = b.statut === "Gagné" ? "#10b981" : b.statut === "Perdu" ? "#f43f5e" : "#f59e0b";
                    return (
                      <tr key={b.id} style={{ borderBottom: "1px solid #1e293b" }}>
                        <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{b.date}</td>
                        <td style={{ padding: "10px 12px" }}>{b.sport}</td>
                        <td style={{ padding: "10px 12px", fontWeight: 500 }}>{b.event}</td>
                        <td style={{ padding: "10px 12px", color: "#a5b4fc" }}>{b.cote}</td>
                        <td style={{ padding: "10px 12px" }}>{b.mise} €</td>
                        <td style={{ padding: "10px 12px", color: "#22d3ee" }}>{gain} €</td>
                        <td style={{ padding: "10px 12px" }}><span style={{ background: sc+"22", color: sc, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{b.statut}</span></td>
                        <td style={{ padding: "10px 12px" }}>
                          <button onClick={() => handleEdit(b)} style={{ background: "none", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8", cursor: "pointer", padding: "4px 10px", marginRight: 6, fontSize: 12 }}>✏️</button>
                          <button onClick={() => handleDelete(b.id)} style={{ background: "none", border: "1px solid #334155", borderRadius: 6, color: "#f43f5e", cursor: "pointer", padding: "4px 10px", fontSize: 12 }}>🗑️</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* CLASSEMENT */}
        {activeTab === "classement" && <Classement pseudo={pseudo} stats={stats} bets={bets} joinedCommunities={joinedCommunities} />}

        {/* COMMUNAUTÉ */}
        {activeTab === "communaute" && guestMode && (
          <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 16, textAlign: "center", border: "1px solid #334155" }}>
            <p style={{ fontSize: 48, margin: 0 }}>💬</p>
            <h2 style={{ margin: 0, fontSize: 20, color: "#f1f5f9" }}>Rejoignez la communauté</h2>
            <p style={{ margin: 0, color: "#64748b", maxWidth: 380 }}>Connectez-vous pour rejoindre la communauté, discuter avec d'autres parieurs et partager vos pronostics.</p>
            <button onClick={exitGuestToRegister} style={{ ...btnPrimary, padding: "10px 28px", fontSize: 15 }}>Créer un compte gratuit</button>
          </div>
        )}
        {activeTab === "communaute" && !guestMode && (
          <div style={{ display: "flex", gap: isMob ? 0 : 16, height: isMob ? "auto" : 560, flexDirection: isMob ? "column" : "row", minHeight: isMob ? 500 : undefined }}>
            {/* Mobile sidebar toggle */}
            {isMob && (
              <button onClick={() => setShowCommSidebar(v => !v)}
                style={{ ...btnSecondary, marginBottom: 8, display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between", width: "100%", minHeight: 44 }}>
                <span>☰ Menu communauté</span>
                <span style={{ fontSize: 12 }}>{showCommSidebar ? "▲" : "▼"}</span>
              </button>
            )}
            {/* Sidebar */}
            <div style={{ ...card, width: isMob ? "100%" : 200, flexShrink: 0, padding: 12, display: isMob ? (showCommSidebar ? "flex" : "none") : "flex", flexDirection: "column", gap: 4, overflowY: "auto", marginBottom: isMob ? 8 : 0 }}>
              {[{ id: "home", icon: "🏠", label: "Accueil" }, { id: "public", icon: "🌐", label: "Salons publics" }, { id: "mycommunities", icon: "🏘️", label: "Mes communautés" }].map(item => (
                <button key={item.id} onClick={() => { setCommView(item.id); if (isMob) setShowCommSidebar(false); }}
                  style={{ background: commView === item.id ? "#6366f122" : "transparent", border: commView === item.id ? "1px solid #6366f1" : "1px solid transparent", borderRadius: 8, padding: "8px 10px", cursor: "pointer", textAlign: "left", color: commView === item.id ? "#a5b4fc" : "#94a3b8", fontSize: 13, display: "flex", alignItems: "center", gap: 8, minHeight: 44 }}>
                  {item.icon} {item.label}
                </button>
              ))}
              <div style={{ borderTop: "1px solid #334155", margin: "6px 0" }} />
              <p style={{ margin: "4px 0 6px", fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Mes communautés</p>
              {joinedCommunities.map(c => (
                <button key={c.id} onClick={() => { setActiveCommunityId(c.id); setCommView("chat"); setChatInput(""); if (isMob) setShowCommSidebar(false); }}
                  style={{ background: (commView === "chat" && activeCommunityId === c.id) ? c.color+"22" : "transparent", border: (commView === "chat" && activeCommunityId === c.id) ? `1px solid ${c.color}` : "1px solid transparent", borderRadius: 8, padding: "7px 10px", cursor: "pointer", textAlign: "left", color: (commView === "chat" && activeCommunityId === c.id) ? "#e2e8f0" : "#94a3b8", fontSize: 13, display: "flex", alignItems: "center", gap: 8, minHeight: 44 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                </button>
              ))}
              {joinedCommunities.length === 0 && <p style={{ fontSize: 12, color: "#475569", padding: "4px 10px" }}>Aucune communauté</p>}
              <div style={{ marginTop: "auto", borderTop: "1px solid #334155", paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                <button onClick={() => setCommView("create")} style={{ ...btnPrimary, fontSize: 12, padding: "8px 10px" }}>+ Créer</button>
                <button onClick={() => setCommView("join")} style={{ ...btnSecondary, fontSize: 12, padding: "8px 10px" }}>🔗 Rejoindre</button>
                {showPseudo
                  ? <div style={{ display: "flex", gap: 4 }}>
                      <input style={{ ...inp, fontSize: 12, padding: "6px 8px" }} value={pseudo} onChange={e => setPseudo(e.target.value)} maxLength={20} />
                      <button onClick={() => setShowPseudo(false)} style={{ ...btnPrimary, padding: "0 10px", fontSize: 12 }}>OK</button>
                    </div>
                  : <button onClick={() => setShowPseudo(true)} style={{ ...btnSecondary, fontSize: 12, padding: "7px 10px", textAlign: "left" }}>😎 {pseudo} ✏️</button>
                }
              </div>
            </div>

            {/* Main */}
            <div style={{ ...card, flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", minHeight: isMob ? 420 : undefined }}>

              {commView === "home" && (
                <div style={{ padding: 28, overflowY: "auto" }}>
                  <h2 style={{ margin: "0 0 6px", fontSize: 20 }}>👋 Bienvenue dans la Communauté</h2>
                  <p style={{ color: "#64748b", margin: "0 0 24px" }}>Rejoignez un salon public pour débattre d'un match ou d'un sport, ou créez votre propre communauté privée avec vos amis pour partager analyses et pronostics. Chaque salon est dédié à un événement sportif de votre choix.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {[
                      { icon: "🌐", title: "Salons publics",       desc: "Discutez par sport avec toute la communauté",   action: () => setCommView("public") },
                      { icon: "🏘️", title: "Mes communautés",      desc: "Vos groupes privés et publics rejoints",        action: () => setCommView("mycommunities") },
                      { icon: "✨", title: "Créer une communauté", desc: "Lancez votre propre groupe public ou privé",    action: () => setCommView("create") },
                      { icon: "🔗", title: "Rejoindre",            desc: "Trouvez une communauté par nom ou par code",    action: () => setCommView("join") },
                    ].map(item => (
                      <div key={item.title} onClick={item.action}
                        style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12, padding: 18, cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "#6366f1"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "#334155"}>
                        <p style={{ margin: "0 0 6px", fontSize: 22 }}>{item.icon}</p>
                        <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14 }}>{item.title}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {commView === "public" && (
                <div style={{ display: "flex", height: "100%" }}>
                  <div style={{ width: 160, borderRight: "1px solid #334155", padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                    <p style={{ margin: "0 0 8px", fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Salons</p>
                    {SPORTS.map(sp => (
                      <button key={sp} onClick={() => setActiveChatSport(sp)}
                        style={{ background: activeChatSport === sp ? "#6366f122" : "transparent", border: activeChatSport === sp ? "1px solid #6366f1" : "1px solid transparent", borderRadius: 8, padding: "7px 10px", cursor: "pointer", textAlign: "left", color: activeChatSport === sp ? "#a5b4fc" : "#94a3b8", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                        {SPORT_ICONS[sp]} {sp}
                      </button>
                    ))}
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "14px 18px", borderBottom: "1px solid #334155", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{SPORT_ICONS[activeChatSport]}</span>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{activeChatSport}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Salon public</p>
                      </div>
                    </div>
                    {renderChat(publicChats[activeChatSport], sendPublicMsg)}
                  </div>
                </div>
              )}

              {commView === "mycommunities" && (
                <div style={{ padding: 24, overflowY: "auto" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 17 }}>🏘️ Mes Communautés</h3>
                  {joinedCommunities.length === 0 && <p style={{ color: "#475569" }}>Vous n'avez rejoint aucune communauté.</p>}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {joinedCommunities.map(c => (
                      <div key={c.id} style={{ background: "#0f172a", border: `1px solid ${c.color}44`, borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: c.color+"33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{SPORT_ICONS[c.sport]}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{c.name}</p>
                            <span style={{ fontSize: 10, background: c.type === "public" ? "#10b98122" : "#f59e0b22", color: c.type === "public" ? "#10b981" : "#f59e0b", borderRadius: 6, padding: "2px 8px" }}>{c.type === "public" ? "Public" : "Privé"}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{c.sport} · {c.members.length} membre{c.members.length > 1 ? "s" : ""} · {c.messages.length} message{c.messages.length !== 1 ? "s" : ""}</p>
                          {c.type === "private" && c.creator === pseudo && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#f59e0b" }}>Code : <strong style={{ letterSpacing: 2 }}>{c.code}</strong></p>}
                        </div>
                        <button onClick={() => { setActiveCommunityId(c.id); setCommView("chat"); setChatInput(""); }} style={{ ...btnPrimary, fontSize: 13, padding: "8px 16px" }}>Ouvrir</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {commView === "chat" && activeCommunity && (
                <>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #334155", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: activeCommunity.color+"33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{SPORT_ICONS[activeCommunity.sport]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{activeCommunity.name}</p>
                        <span style={{ fontSize: 10, background: activeCommunity.type === "public" ? "#10b98122" : "#f59e0b22", color: activeCommunity.type === "public" ? "#10b981" : "#f59e0b", borderRadius: 6, padding: "2px 8px" }}>{activeCommunity.type === "public" ? "Public" : "Privé"}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{activeCommunity.members.length} membre{activeCommunity.members.length > 1 ? "s" : ""}</p>
                    </div>
                    {activeCommunity.type === "private" && activeCommunity.creator === pseudo && (
                      <div style={{ fontSize: 12, color: "#f59e0b", background: "#f59e0b11", borderRadius: 8, padding: "6px 12px" }}>
                        🔑 Code : <strong style={{ letterSpacing: 2 }}>{activeCommunity.code}</strong>
                      </div>
                    )}
                  </div>
                  {renderChat(activeCommunity.messages, sendCommunityMsg)}
                </>
              )}

              {commView === "create" && (
                <div style={{ padding: 28, overflowY: "auto" }}>
                  <h3 style={{ margin: "0 0 20px", fontSize: 17 }}>✨ Créer une communauté</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 420 }}>
                    <div>
                      <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6 }}>Nom *</label>
                      <input style={inp} placeholder="Ex: Les Tipsters du Dimanche" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} maxLength={40} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6 }}>Sport principal</label>
                      <select style={inp} value={createForm.sport} onChange={e => setCreateForm({ ...createForm, sport: e.target.value })}>
                        {SPORTS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6 }}>Visibilité</label>
                      <div style={{ display: "flex", gap: 10 }}>
                        {[["public","🌐 Publique","Visible et rejoignable par nom"],["private","🔒 Privée","Accessible uniquement par code"]].map(([val, label, desc]) => (
                          <div key={val} onClick={() => setCreateForm({ ...createForm, type: val })}
                            style={{ flex: 1, background: createForm.type === val ? "#6366f122" : "#0f172a", border: `1px solid ${createForm.type === val ? "#6366f1" : "#334155"}`, borderRadius: 10, padding: 12, cursor: "pointer" }}>
                            <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 13, color: createForm.type === val ? "#a5b4fc" : "#94a3b8" }}>{label}</p>
                            <p style={{ margin: 0, fontSize: 11, color: "#475569" }}>{desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 8 }}>Couleur</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        {COMMUNITY_COLORS.map(c => (
                          <div key={c} onClick={() => setCreateForm({ ...createForm, color: c })}
                            style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: createForm.color === c ? "3px solid #fff" : "3px solid transparent", boxSizing: "border-box" }} />
                        ))}
                      </div>
                    </div>
                    {createError && <p style={{ color: "#f43f5e", fontSize: 13, margin: 0 }}>⚠️ {createError}</p>}
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={handleCreate} style={btnPrimary}>Créer la communauté</button>
                      <button onClick={() => setCommView("home")} style={btnSecondary}>Annuler</button>
                    </div>
                  </div>
                </div>
              )}

              {commView === "join" && (
                <div style={{ padding: 28, overflowY: "auto" }}>
                  <h3 style={{ margin: "0 0 20px", fontSize: 17 }}>🔗 Rejoindre une communauté</h3>
                  <div style={{ marginBottom: 28 }}>
                    <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 8 }}>🔍 Rechercher par nom (communautés publiques)</label>
                    <input style={inp} placeholder="Rechercher..." value={searchComm} onChange={e => setSearchComm(e.target.value)} />
                    {searchComm.trim().length > 0 && (
                      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                        {publicSearchResults.length === 0 && <p style={{ color: "#475569", fontSize: 13 }}>Aucune communauté publique trouvée.</p>}
                        {publicSearchResults.map(c => (
                          <div key={c.id} style={{ background: "#0f172a", border: `1px solid ${c.color}44`, borderRadius: 10, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 20 }}>{SPORT_ICONS[c.sport]}</span>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{c.name}</p>
                              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{c.sport} · {c.members.length} membre{c.members.length > 1 ? "s" : ""}</p>
                            </div>
                            {joinedIds.includes(c.id)
                              ? <span style={{ fontSize: 12, color: "#10b981" }}>✓ Rejoint</span>
                              : <button onClick={() => handleJoinById(c.id)} style={{ ...btnPrimary, fontSize: 12, padding: "7px 14px" }}>Rejoindre</button>
                            }
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 8 }}>🔑 Rejoindre par code d'invitation</label>
                    <div style={{ display: "flex", gap: 10 }}>
                      <input style={{ ...inp, flex: 1, textTransform: "uppercase", letterSpacing: 2 }} placeholder="Ex: VIP999" value={joinCode} onChange={e => setJoinCode(e.target.value)} maxLength={10} />
                      <button onClick={handleJoin} style={btnPrimary}>Rejoindre</button>
                    </div>
                    {joinError && <p style={{ color: "#f43f5e", fontSize: 13, margin: "8px 0 0" }}>⚠️ {joinError}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
