import { useEffect, useRef, useState } from "react";
import { api } from "./api";
import type { Lang } from "./translations";

const FONT = "'Bricolage Grotesque', 'Lato', system-ui, -apple-system, sans-serif";

interface ContactModalProps {
  open: boolean;
  lang: Lang;
  defaultName?: string;
  onClose: () => void;
}

export default function ContactModal({ open, lang, defaultName = "", onClose }: ContactModalProps) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const doneButtonRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<Element | null>(null);
  const titleId = "contact-modal-title";

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setEmail("");
      setMessage("");
      setSent(false);
      setError("");
      setSending(false);
    }
  }, [open, defaultName]);

  // Save the trigger element so we can restore focus on close.
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
    } else if (triggerRef.current && triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [open]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Initial focus on the first interactive element.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      if (sent) doneButtonRef.current?.focus();
      else firstFieldRef.current?.focus();
    }, 30);
    return () => window.clearTimeout(id);
  }, [open, sent]);

  // Escape to close + Tab focus trap within the dialog.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose(); return; }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isES = lang === "es";
  const t = {
    title: isES ? "Contáctanos" : "Contact Us",
    subtitle: isES
      ? "¿Preguntas, ideas o problemas? Te respondemos en menos de 24 h."
      : "Questions, ideas, or issues? We reply within 24 hours.",
    name: isES ? "Nombre" : "Name",
    namePh: isES ? "Tu nombre" : "Your name",
    email: isES ? "Correo" : "Email",
    emailPh: isES ? "tu@correo.com" : "you@email.com",
    message: isES ? "Mensaje" : "Message",
    messagePh: isES ? "¿En qué podemos ayudarte?" : "How can we help?",
    send: isES ? "Enviar mensaje" : "Send Message",
    sending: isES ? "Enviando..." : "Sending...",
    successTitle: isES ? "¡Mensaje enviado!" : "Message Sent!",
    successBody: isES
      ? "Gracias por escribirnos. Nuestro equipo te responderá pronto a tu correo."
      : "Thanks for reaching out. Our team will reply to your email shortly.",
    done: isES ? "Listo" : "Done",
    cancel: isES ? "Cancelar" : "Cancel",
    fallbackError: isES ? "No se pudo enviar. Inténtalo de nuevo." : "Could not send. Please try again.",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      await api.sendContact(name.trim(), email.trim(), message.trim(), lang);
      setSent(true);
    } catch (err: any) {
      setError(err?.message || t.fallbackError);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(2,6,15,0.78)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, fontFamily: FONT,
        animation: "contactFadeIn 0.18s ease-out",
      }}
    >
      <style>{`
        @keyframes contactFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes contactSlideUp { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes contactCheckPop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes contactRingPulse { 0% { transform: scale(0.8); opacity: 0.7; } 100% { transform: scale(1.6); opacity: 0; } }
      `}</style>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto",
          background: "linear-gradient(160deg, #0a1f3a 0%, #050d1c 100%)",
          border: "1px solid rgba(46,139,192,0.3)",
          borderRadius: 24, padding: 28,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
          animation: "contactSlideUp 0.24s ease-out",
          color: "#fff",
        }}
      >
        {sent ? (
          <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
            <div style={{ position: "relative", width: 88, height: 88, margin: "0 auto 18px" }}>
              <div aria-hidden style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: "rgba(34,211,238,0.4)",
                animation: "contactRingPulse 1.6s ease-out infinite",
              }} />
              <div style={{
                position: "relative",
                width: 88, height: 88, borderRadius: "50%",
                background: "linear-gradient(135deg, #22d3ee, #2e8bc0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 32px rgba(34,211,238,0.5), inset 0 2px 8px rgba(255,255,255,0.3)",
                animation: "contactCheckPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <div id={titleId} style={{
              fontSize: "1.7rem", fontWeight: 900, letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #fff, #b1d4e0)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              marginBottom: 10,
            }}>
              {t.successTitle}
            </div>
            <div style={{
              fontSize: "0.95rem", color: "rgba(207,225,245,0.75)", lineHeight: 1.5,
              maxWidth: 340, margin: "0 auto 24px",
            }}>
              {t.successBody}
            </div>
            <button
              ref={doneButtonRef}
              onClick={onClose}
              style={{
                padding: "12px 32px", borderRadius: 999,
                background: "linear-gradient(135deg, #2e8bc0, #145374)",
                color: "#fff", fontSize: "0.9rem", fontWeight: 800, fontFamily: FONT,
                border: "none", cursor: "pointer", letterSpacing: "0.02em",
                boxShadow: "0 6px 18px rgba(46,139,192,0.4)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            >
              {t.done}
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <div id={titleId} style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 6 }}>
                  {t.title}
                </div>
                <div style={{ fontSize: "0.82rem", color: "rgba(207,225,245,0.6)", lineHeight: 1.45 }}>
                  {t.subtitle}
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label={t.cancel}
                style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  width: 32, height: 32, borderRadius: 10, color: "rgba(207,225,245,0.7)",
                  fontSize: "1.1rem", cursor: "pointer", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.12em", color: "rgba(207,225,245,0.55)", textTransform: "uppercase", marginBottom: 6 }}>
                  {t.name}
                </label>
                <input
                  ref={firstFieldRef}
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePh} required maxLength={200}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.12em", color: "rgba(207,225,245,0.55)", textTransform: "uppercase", marginBottom: 6 }}>
                  {t.email}
                </label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPh} required maxLength={320}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.12em", color: "rgba(207,225,245,0.55)", textTransform: "uppercase", marginBottom: 6 }}>
                  {t.message}
                </label>
                <textarea
                  value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.messagePh} required maxLength={5000} rows={5}
                  style={{ ...inputStyle, resize: "none", fontFamily: FONT }}
                />
              </div>

              {error && (
                <div role="alert" style={{
                  padding: "10px 12px", borderRadius: 10,
                  background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.35)",
                  color: "#fda4af", fontSize: "0.78rem", fontWeight: 700,
                }}>
                  ✕ {error}
                </div>
              )}

              <button
                type="submit" disabled={sending}
                style={{
                  marginTop: 4, padding: "13px 24px", borderRadius: 14,
                  background: sending ? "rgba(46,139,192,0.4)" : "linear-gradient(135deg, #2e8bc0, #145374)",
                  color: "#fff", fontSize: "0.95rem", fontWeight: 800, fontFamily: FONT,
                  border: "none", cursor: sending ? "not-allowed" : "pointer", letterSpacing: "0.02em",
                  boxShadow: sending ? "none" : "0 6px 18px rgba(46,139,192,0.4)",
                  transition: "transform 0.15s ease",
                }}
              >
                {sending ? t.sending : t.send}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 12,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(120,180,255,0.2)",
  color: "#fff", fontSize: "0.92rem", fontWeight: 600, fontFamily: FONT,
  outline: "none", transition: "border-color 0.15s ease, background 0.15s ease",
  boxSizing: "border-box",
};
