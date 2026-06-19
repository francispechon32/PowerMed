import { useEffect } from "react";

export default function Toast({ id, message, onUndo, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="pm-toast">
      <span className="pm-toast-msg">{message}</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
        {onUndo && (
          <button className="pm-toast-undo" onClick={() => { onUndo(); onClose(); }}>
            Undo
          </button>
        )}
        <button className="pm-toast-close" onClick={onClose}>✕</button>
      </div>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }) {
  if (!toasts.length) return null;
  return (
    <div className="pm-toast-container">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => onClose(t.id)} />
      ))}
    </div>
  );
}
