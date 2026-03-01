import { useState, useRef, useEffect } from "react";
    
    const SYSTEM_PROMPT = `You are an elite NIL (Name, Image, Likeness) brand partnership outreach specialist working exclusively for a professional NIL sports agency. Your job is to help the agency owner and agents secure brand deals for their athletes in football, basketball, and golf.
    
    AGENCY PROFILE:
    - Sports represented: Football, Basketball, Golf
    - Target brands: Local/regional businesses and mid-size national brands
    - Brand categories: Apparel & sneakers, food & beverage, health & fitness supplements, training & recovery products
    - Outreach channels: Cold email, social media DMs, Apollo.io sequences
    - Tone: Formal, corporate, and polished — always professional
    
    YOU CAN DO 4 THINGS:
    
    1. FIND BRANDS TO TARGET
    When asked to find brands, ask for: athlete's sport, follower count, location/school, audience demographic, and niche/personality. Then suggest 5-8 highly specific, realistic brand targets with a one-sentence rationale for each fit.
    
    2. WRITE INITIAL PITCH
    When asked to write a pitch (email or DM), ask for: athlete name, sport, school, social following, key stats or achievements, audience demographics, and the specific brand being pitched. Then produce a formal, compelling outreach message with subject line (for email) or opening hook (for DM). Keep emails under 200 words. DMs under 80 words.
    
    3. WRITE FOLLOW-UP SEQUENCE
    When asked for a follow-up sequence, produce a 3-message cadence: Day 3, Day 7, and Day 14. Each follow-up should be shorter than the last, add new value or urgency, and never be pushy or desperate. Maintain formal tone throughout.
    
    4. HANDLE BRAND OBJECTIONS
    When given a brand objection (e.g., "our budget is tight," "we already have an ambassador"), produce a professional, confident response that keeps the door open and reframes the value proposition.
    
    RULES:
    - Always ask for athlete details before drafting anything — never generate generic copy
    - Never use slang or casual language in any outreach copy
    - Always position the athlete as a premium brand partner, not just an influencer
    - Highlight ROI, audience alignment, and authenticity in every pitch
    - If the user asks something outside these 4 functions, redirect them back to outreach tasks`;
    
    const MODES = [
      { id: "find", label: "Find Brands", icon: "◈", desc: "Identify target brands for an athlete" },
      { id: "pitch", label: "Write Pitch", icon: "◆", desc: "Draft a cold email or DM" },
      { id: "followup", label: "Follow-Up Sequence", icon: "◇", desc: "3-message follow-up cadence" },
      { id: "objection", label: "Handle Objection", icon: "◉", desc: "Respond to brand pushback" },
    ];
    
    const STARTERS = {
      find: "I need to find brand targets for one of my athletes. Can you help me identify the best fits?",
      pitch: "I need to write a cold outreach pitch to a brand for one of my athletes.",
      followup: "I need a 3-step follow-up sequence for a brand that hasn't responded.",
      objection: "A brand just told me their budget is tight for NIL this quarter. Help me respond.",
    };
    
    const quickBtnStyle = {
      background: "transparent",
      border: "1px solid #2a2a3e",
      color: "#5a5a7a",
      padding: "5px 12px",
      fontSize: 11,
      letterSpacing: "0.05em",
      cursor: "pointer",
      fontFamily: "inherit",
      borderRadius: 4,
    };
    
    // ── API KEY SETUP SCREEN ────────────────────────────────────────────────────
    function SetupScreen({ onSave }) {
      const [provider, setProvider] = useState("anthropic");
      const [key, setKey] = useState("");
      const [error, setError] = useState("");
      const [testing, setTesting] = useState(false);
    
      const handleSave = async () => {
        if (!key.trim()) { setError("Please enter an API key."); return; }
        if (provider === "anthropic" && !key.startsWith("sk-ant-")) {
          setError("Anthropic keys start with sk-ant-  — please double-check.");
          return;
        }
        if (provider === "openai" && !key.startsWith("sk-")) {
          setError("OpenAI keys start with sk-  — please double-check.");
          return;
        }
        setTesting(true);
        setError("");
        // Quick validation call
        try {
          if (provider === "anthropic") {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
              body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 10, messages: [{ role: "user", content: "hi" }] }),
            });
            if (res.status === 401) { setError("Invalid API key. Please try again."); setTesting(false); return; }
          } else {
            const res = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
              body: JSON.stringify({ model: "gpt-4o-mini", max_tokens: 10, messages: [{ role: "user", content: "hi" }] }),
            });
            if (res.status === 401) { setError("Invalid API key. Please try again."); setTesting(false); return; }
          }
          onSave({ provider, key });
        } catch {
          setError("Could not connect. Check your internet and try again.");
        }
        setTesting(false);
      };
    
      return (
        <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Georgia', serif" }}>
          <div style={{ width: "100%", maxWidth: 460 }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
              <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #c9a84c, #8b6914)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: "bold", color: "#0a0a0f" }}>N</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: "bold", letterSpacing: "0.08em", color: "#e8e4d8" }}>NIL OUTREACH COMMAND</div>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#5a5a7a", textTransform: "uppercase" }}>Brand Partnership Intelligence</div>
              </div>
            </div>
    
            <h2 style={{ color: "#e8e4d8", fontSize: 22, fontWeight: "normal", marginBottom: 8 }}>Connect Your AI Provider</h2>
            <p style={{ color: "#5a5a7a", fontSize: 13, lineHeight: 1.7, marginBottom: 32 }}>
              Your API key is stored only in this browser session and never sent anywhere except directly to the AI provider. It is not saved or logged.
            </p>
    
            {/* Provider toggle */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, letterSpacing: "0.15em", color: "#5a5a7a", textTransform: "uppercase", display: "block", marginBottom: 10 }}>Select Provider</label>
              <div style={{ display: "flex", gap: 10 }}>
                {["anthropic", "openai"].map(p => (
                  <button key={p} onClick={() => setProvider(p)} style={{
                    flex: 1, padding: "12px 0", borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
                    fontSize: 13, fontWeight: "bold", letterSpacing: "0.05em",
                    border: provider === p ? "1px solid #c9a84c" : "1px solid #2a2a3e",
                    background: provider === p ? "rgba(201,168,76,0.08)" : "transparent",
                    color: provider === p ? "#c9a84c" : "#5a5a7a",
                  }}>
                    {p === "anthropic" ? "Anthropic (Claude)" : "OpenAI (GPT-4)"}
                  </button>
                ))}
              </div>
            </div>
    
            {/* Key input */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, letterSpacing: "0.15em", color: "#5a5a7a", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
                {provider === "anthropic" ? "Anthropic API Key" : "OpenAI API Key"}
              </label>
              <input
                type="password"
                value={key}
                onChange={e => { setKey(e.target.value); setError(""); }}
                placeholder={provider === "anthropic" ? "sk-ant-..." : "sk-..."}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid #2a2a3e",
                  borderRadius: 6, padding: "14px 16px", color: "#e8e4d8",
                  fontFamily: "monospace", fontSize: 13, outline: "none", boxSizing: "border-box",
                }}
                onKeyDown={e => e.key === "Enter" && handleSave()}
              />
              <div style={{ fontSize: 11, color: "#3a3a5a", marginTop: 8 }}>
                {provider === "anthropic"
                  ? "Get your key at console.anthropic.com → API Keys"
                  : "Get your key at platform.openai.com → API Keys"}
              </div>
            </div>
    
            {error && <div style={{ color: "#e05555", fontSize: 12, marginBottom: 16, padding: "10px 14px", background: "rgba(224,85,85,0.08)", borderRadius: 4, border: "1px solid rgba(224,85,85,0.2)" }}>{error}</div>}
    
            <button onClick={handleSave} disabled={testing || !key.trim()} style={{
              width: "100%", padding: "14px 0",
              background: key.trim() && !testing ? "linear-gradient(135deg, #c9a84c, #8b6914)" : "#1e1e2e",
              border: "none", borderRadius: 6, cursor: key.trim() && !testing ? "pointer" : "default",
              color: key.trim() && !testing ? "#0a0a0f" : "#3a3a5a",
              fontSize: 13, fontWeight: "bold", letterSpacing: "0.1em", fontFamily: "inherit",
            }}>
              {testing ? "VERIFYING..." : "LAUNCH OUTREACH COMMAND →"}
            </button>
    
            <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.1)", borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: "#c9a84c", letterSpacing: "0.1em", marginBottom: 6 }}>◈ SECURITY NOTE</div>
              <div style={{ fontSize: 11, color: "#5a5a7a", lineHeight: 1.7 }}>
                Your API key lives only in your browser's memory for this session. Closing or refreshing the tab clears it. Share this app safely with your team — each person enters their own key.
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // ── MAIN APP ────────────────────────────────────────────────────────────────
    export default function NILOutreachAssistant() {
      const [apiConfig, setApiConfig] = useState(null);
      const [messages, setMessages] = useState([]);
      const [input, setInput] = useState("");
      const [loading, setLoading] = useState(false);
      const [activeMode, setActiveMode] = useState(null);
      const [started, setStarted] = useState(false);
      const bottomRef = useRef(null);
    
      useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
    
      const callAI = async (msgs) => {
        const { provider, key } = apiConfig;
    
        if (provider === "anthropic") {
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
            body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM_PROMPT, messages: msgs }),
          });
          const data = await res.json();
          return data.content?.map(b => b.text || "").join("") || "Something went wrong.";
        } else {
          const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
            body: JSON.stringify({
              model: "gpt-4o",
              max_tokens: 1000,
              messages: [{ role: "system", content: SYSTEM_PROMPT }, ...msgs],
            }),
          });
          const data = await res.json();
          return data.choices?.[0]?.message?.content || "Something went wrong.";
        }
      };
    
      const selectMode = (mode) => {
        setActiveMode(mode.id);
        setStarted(true);
        sendMessage(STARTERS[mode.id], []);
      };
    
      const sendMessage = async (text, prevMessages) => {
        const newMessages = [...prevMessages, { role: "user", content: text }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);
        try {
          const reply = await callAI(newMessages);
          setMessages([...newMessages, { role: "assistant", content: reply }]);
        } catch {
          setMessages([...newMessages, { role: "assistant", content: "Connection error. Please try again." }]);
        }
        setLoading(false);
      };
    
      const handleSend = () => { if (!input.trim() || loading) return; sendMessage(input.trim(), messages); };
      const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };
      const reset = () => { setMessages([]); setActiveMode(null); setStarted(false); setInput(""); };
    
      if (!apiConfig) return <SetupScreen onSave={setApiConfig} />;
    
      return (
        <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Georgia', 'Times New Roman', serif", color: "#e8e4d8", display: "flex", flexDirection: "column" }}>
    
          {/* Header */}
          <header style={{ borderBottom: "1px solid #1e1e2e", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(10,10,15,0.96)", backdropFilter: "blur(12px)", zIndex: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #c9a84c, #8b6914)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: "bold", color: "#0a0a0f" }}>N</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: "bold", letterSpacing: "0.08em", color: "#e8e4d8" }}>NIL OUTREACH COMMAND</div>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#5a5a7a", textTransform: "uppercase" }}>Brand Partnership Intelligence</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ fontSize: 11, color: "#3a3a5a", letterSpacing: "0.1em" }}>
                {apiConfig.provider === "anthropic" ? "◈ Claude" : "◈ GPT-4o"}
              </div>
              {started && (
                <button onClick={reset} style={{ background: "transparent", border: "1px solid #2a2a3e", color: "#5a5a7a", padding: "6px 14px", fontSize: 11, letterSpacing: "0.12em", cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase" }}>← New</button>
              )}
              <button onClick={() => setApiConfig(null)} style={{ background: "transparent", border: "1px solid #2a2a3e", color: "#5a5a7a", padding: "6px 14px", fontSize: 11, letterSpacing: "0.12em", cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase" }}>Key ⚙</button>
            </div>
          </header>
    
          {/* Main */}
          <main style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 820, margin: "0 auto", width: "100%", padding: "0 24px" }}>
    
            {/* Landing */}
            {!started && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 0" }}>
                <div style={{ marginBottom: 40 }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.3em", color: "#c9a84c", textTransform: "uppercase", marginBottom: 14 }}>◈ Outreach Intelligence System</div>
                  <h1 style={{ fontSize: 36, fontWeight: "normal", lineHeight: 1.2, margin: "0 0 12px", color: "#e8e4d8" }}>
                    Close More<br /><span style={{ color: "#c9a84c" }}>Brand Deals.</span>
                  </h1>
                  <p style={{ fontSize: 14, color: "#5a5a7a", lineHeight: 1.7, margin: 0, maxWidth: 460 }}>
                    Your AI-powered outreach partner for NIL brand partnerships across football, basketball, and golf. Select a function below to begin.
                  </p>
                </div>
    
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
                  {MODES.map((mode) => (
                    <button key={mode.id} onClick={() => selectMode(mode)} style={{
                      background: "rgba(255,255,255,0.02)", border: "1px solid #1e1e2e", borderRadius: 6,
                      padding: "20px 22px", textAlign: "left", cursor: "pointer", fontFamily: "inherit", color: "#e8e4d8",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#c9a84c"; e.currentTarget.style.background = "rgba(201,168,76,0.05)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e2e"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                    >
                      <div style={{ fontSize: 20, marginBottom: 10, color: "#c9a84c" }}>{mode.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 4, letterSpacing: "0.05em" }}>{mode.label}</div>
                      <div style={{ fontSize: 11, color: "#5a5a7a" }}>{mode.desc}</div>
                    </button>
                  ))}
                </div>
    
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  {["Football · Basketball · Golf", "Email · DM · Apollo.io", "Apparel · F&B · Supplements · Recovery"].map(tag => (
                    <div key={tag} style={{ fontSize: 10, color: "#3a3a5a", letterSpacing: "0.15em", textTransform: "uppercase" }}>{tag}</div>
                  ))}
                </div>
              </div>
            )}
    
            {/* Chat */}
            {started && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: 24 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24, padding: "6px 14px", border: "1px solid rgba(201,168,76,0.2)", background: "rgba(201,168,76,0.05)", borderRadius: 4, alignSelf: "flex-start" }}>
                  <span style={{ fontSize: 12, color: "#c9a84c", letterSpacing: "0.1em" }}>
                    {MODES.find(m => m.id === activeMode)?.icon} {MODES.find(m => m.id === activeMode)?.label.toUpperCase()}
                  </span>
                </div>
    
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20, paddingBottom: 16 }}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 12, alignItems: "flex-start" }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                        background: msg.role === "user" ? "linear-gradient(135deg, #2a2a4e, #1a1a3e)" : "linear-gradient(135deg, #c9a84c, #8b6914)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, fontWeight: "bold", color: msg.role === "user" ? "#8888bb" : "#0a0a0f",
                      }}>
                        {msg.role === "user" ? "YOU" : "N"}
                      </div>
                      <div style={{
                        maxWidth: "78%", padding: "14px 18px", borderRadius: 6,
                        background: msg.role === "user" ? "rgba(255,255,255,0.04)" : "rgba(201,168,76,0.06)",
                        border: msg.role === "user" ? "1px solid #1e1e2e" : "1px solid rgba(201,168,76,0.15)",
                        fontSize: 13.5, lineHeight: 1.75, color: "#d8d4c8", whiteSpace: "pre-wrap",
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
    
                  {loading && (
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #c9a84c, #8b6914)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: "bold", color: "#0a0a0f" }}>N</div>
                      <div style={{ padding: "14px 18px", borderRadius: 6, border: "1px solid rgba(201,168,76,0.15)", background: "rgba(201,168,76,0.06)", display: "flex", gap: 6, alignItems: "center" }}>
                        {[0, 1, 2].map(i => (
                          <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#c9a84c", animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
    
                {/* Quick actions */}
                {messages.length > 1 && !loading && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                    {activeMode !== "followup" && (
                      <button onClick={() => sendMessage("Can you write a follow-up sequence for this?", messages)} style={quickBtnStyle}>Follow-Up Sequence →</button>
                    )}
                    {activeMode !== "pitch" && (
                      <button onClick={() => sendMessage("Now write a cold email pitch for this athlete.", messages)} style={quickBtnStyle}>Write Email Pitch →</button>
                    )}
                    <button onClick={() => sendMessage("Give me a DM version of this outreach.", messages)} style={quickBtnStyle}>DM Version →</button>
                  </div>
                )}
    
                {/* Input */}
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end", borderTop: "1px solid #1e1e2e", paddingTop: 16, paddingBottom: 16 }}>
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Respond or provide athlete details..."
                    rows={2}
                    style={{
                      flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid #2a2a3e",
                      borderRadius: 6, padding: "12px 16px", color: "#e8e4d8",
                      fontFamily: "inherit", fontSize: 13, resize: "none", outline: "none", lineHeight: 1.6,
                    }}
                  />
                  <button onClick={handleSend} disabled={loading || !input.trim()} style={{
                    background: input.trim() && !loading ? "linear-gradient(135deg, #c9a84c, #8b6914)" : "#1e1e2e",
                    border: "none", borderRadius: 6, width: 44, height: 44,
                    cursor: input.trim() && !loading ? "pointer" : "default",
                    color: input.trim() && !loading ? "#0a0a0f" : "#3a3a5a",
                    fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>→</button>
                </div>
              </div>
            )}
          </main>
    
          <style>{`
            @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.1)} }
            *{box-sizing:border-box}
            ::-webkit-scrollbar{width:4px}
            ::-webkit-scrollbar-track{background:transparent}
            ::-webkit-scrollbar-thumb{background:#2a2a3e;border-radius:2px}
            textarea::placeholder{color:#3a3a5a}
            input::placeholder{color:#3a3a5a}
            button:hover{opacity:0.9}
          `}</style>
        </div>
      );
    }
    