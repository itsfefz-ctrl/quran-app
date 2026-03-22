import { useState, useRef, useEffect } from "react";

const SUGGESTED_QUESTIONS = [
  "What does the Quran say about patience?",
  "Explain the concept of Tawakkul (trust in Allah)",
  "What are the pillars of Islam mentioned in the Quran?",
  "What does the Quran say about kindness to parents?",
  "Explain the story of Prophet Ibrahim",
  "What is the meaning of Surah Al-Fatiha?",
];

const SYSTEM_PROMPT = "You are a knowledgeable and respectful Islamic scholar and Quran guide. Your role is to help users understand the Quran. Always reference specific Surahs and Ayahs when relevant. Provide Arabic text when quoting verses, along with transliteration and translation. Be respectful, accurate, and humble. Draw from classical tafsir scholars when appropriate. Keep responses warm, educational, and accessible.";

export default function QuranApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;

    setInput("");
    setShowSuggestions(false);

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages,
        }),
      });

      const data = await response.json();
      const assistantText =
        data.content?.map((b) => b.text || "").join("\n") ||
        "I could not generate a response.";

      setMessages([...newMessages, { role: "assistant", content: assistantText }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "An error occurred. Please check your API key and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (text) => {
    return text.split("\n").map((line, i) => {
      const isArabic = /[\u0600-\u06FF]/.test(line);
      if (isArabic) {
        return (
          <span key={i} style={{
            display: "block", direction: "rtl",
            fontFamily: "serif", fontSize: "1.4em",
            color: "#e8d5a3", textAlign: "right",
            margin: "8px 0", lineHeight: 2,
          }}>{line}</span>
        );
      }
      return <span key={i}>{line}<br /></span>;
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a0e1a 0%, #0d1520 40%, #0a1208 100%)",
      fontFamily: "Georgia, serif",
      display: "flex",
      flexDirection: "column",
    }}>
      <header style={{
        padding: "24px 32px",
        borderBottom: "1px solid rgba(201,169,110,0.15)",
        background: "rgba(10,14,26,0.7)",
        display: "flex", alignItems: "center", gap: "16px",
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", color: "#e8d5a3" }}>Quran Companion</h1>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(201,169,110,0.6)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Ask, Explore, Understand
          </p>
        </div>
        <div style={{ marginLeft: "auto", fontFamily: "serif", fontSize: "1.1rem", color: "rgba(232,213,163,0.5)", direction: "rtl" }}>
          بِسْمِ اللَّهِ
        </div>
      </header>

      <div style={{
        flex: 1, overflowY: "auto", padding: "32px 16px",
        maxWidth: 760, width: "100%", margin: "0 auto",
        display: "flex", flexDirection: "column",
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px 32px" }}>
            <div style={{ fontFamily: "serif", fontSize: "2.5rem", color: "#c9a96e", marginBottom: "8px", direction: "rtl", lineHeight: 1.4 }}>
              اقْرَأْ بِاسْمِ رَبِّكَ
            </div>
            <p style={{ color: "rgba(232,213,163,0.5)", fontSize: "0.85rem", marginBottom: "40px" }}>
              "Read in the name of your Lord" — Al-Alaq 96:1
            </p>
          </div>
        )}

        {showSuggestions && messages.length === 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)} style={{
                background: "rgba(201,169,110,0.05)",
                border: "1px solid rgba(201,169,110,0.2)",
                borderRadius: "10px", padding: "14px 16px",
                color: "rgba(232,213,163,0.8)", fontSize: "0.88rem",
                textAlign: "left", cursor: "pointer",
                fontFamily: "Georgia, serif", lineHeight: 1.4,
              }}>
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            flexDirection: msg.role === "user" ? "row-reverse" : "row",
            gap: "12px", marginBottom: "24px", alignItems: "flex-start",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: msg.role === "user" ? "rgba(201,169,110,0.2)" : "rgba(100,150,100,0.15)",
              border: "1px solid rgba(201,169,110,0.3)", fontSize: "0.75rem",
              color: "#e8d5a3",
            }}>
              {msg.role === "user" ? "You" : "Q"}
            </div>
            <div style={{
              maxWidth: "78%",
              background: msg.role === "user" ? "rgba(201,169,110,0.08)" : "rgba(15,25,15,0.7)",
              border: "1px solid rgba(201,169,110,0.15)",
              borderRadius: "12px", padding: "16px 20px",
              color: "#ddd5c0", fontSize: "1rem", lineHeight: 1.75,
            }}>
              {formatMessage(msg.content)}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: "8px", padding: "16px", alignItems: "center" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%", background: "#c9a96e",
                animation: "pulse 1.4s ease-in-out " + i * 0.2 + "s infinite",
              }} />
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div style={{
        padding: "16px 16px 24px",
        background: "rgba(10,14,26,0.9)",
        borderTop: "1px solid rgba(201,169,110,0.1)",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: "10px", alignItems: "flex-end" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the Quran..."
            rows={1}
            style={{
              flex: 1, background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(201,169,110,0.25)", borderRadius: "12px",
              padding: "14px 16px", color: "#e8d5a3", fontSize: "1rem",
              fontFamily: "Georgia, serif", resize: "none", outline: "none",
              minHeight: 50,
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 50, height: 50, borderRadius: "12px",
              background: !input.trim() || loading ? "rgba(201,169,110,0.1)" : "rgba(201,169,110,0.85)",
              border: "1px solid rgba(201,169,110,0.3)", cursor: "pointer",
              color: "#0a0e1a", fontSize: "1.4rem",
            }}
          >
            →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        textarea::placeholder { color: rgba(201,169,110,0.3); }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
