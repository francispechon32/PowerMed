import { useRef } from "react";
import { peso, fmtDate } from "../utils/helpers";
import { S } from "../styles/tokens";
import { Printer } from "./Icons";
import powerMedLogo from "../assets/powermed-logo.png";

export default function ReceiptModal({ sale, onClose }) {
  const ref = useRef(null);

  const handlePrint = () => {
    const content = ref.current.innerHTML;
    const win = window.open("", "_blank", "width=480,height=700");
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt #${sale.id}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 24px; color: #1c1917; font-size: 13px; }
            .logo { width: 48px; height: 48px; border-radius: 50%; }
            h1 { font-size: 20px; font-weight: 800; color: #ea580c; margin: 8px 0 2px; }
            .sub { color: #78716c; font-size: 11px; margin-bottom: 16px; }
            hr { border: none; border-top: 1px dashed #e5e5e5; margin: 14px 0; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 5px 0; vertical-align: top; }
            td:last-child { text-align: right; font-weight: 600; }
            .label { color: #78716c; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
            .total-row td { font-size: 16px; font-weight: 800; padding-top: 10px; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; background: #fff7ed; color: #9a3412; }
            .footer { text-align: center; color: #a8a29e; font-size: 10px; margin-top: 24px; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  const inclusives = sale.inclusives || [];
  const total = sale.price * sale.qty;

  return (
    <div style={S.modalBg} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.modal, width: 440 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Sales Receipt</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handlePrint} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 999, border: "none",
              background: "#f5f5f4", cursor: "pointer", fontSize: 12,
              fontFamily: "inherit", color: "#44403c", fontWeight: 500,
            }}>
              <Printer size={14} /> Print
            </button>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#78716c", padding: "2px 6px" }}>✕</button>
          </div>
        </div>

        <div ref={ref} style={{ fontFamily: "inherit" }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <img src={powerMedLogo} alt="PowerMed" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#ea580c", margin: "8px 0 2px" }}>PowerMed</h1>
            <div style={{ fontSize: 11, color: "#78716c" }}>Official Sales Receipt</div>
          </div>

          <hr style={{ border: "none", borderTop: "1px dashed #e5e5e5", margin: "14px 0" }} />

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <tbody>
              <tr>
                <td style={{ padding: "5px 0", color: "#78716c" }}>Receipt No.</td>
                <td style={{ padding: "5px 0", textAlign: "right", fontWeight: 600 }}>#{sale.id}</td>
              </tr>
              <tr>
                <td style={{ padding: "5px 0", color: "#78716c" }}>Date</td>
                <td style={{ padding: "5px 0", textAlign: "right", fontWeight: 600 }}>{fmtDate(sale.date)}</td>
              </tr>
              <tr>
                <td style={{ padding: "5px 0", color: "#78716c" }}>Customer</td>
                <td style={{ padding: "5px 0", textAlign: "right", fontWeight: 600 }}>{sale.customer}</td>
              </tr>
              <tr>
                <td style={{ padding: "5px 0", color: "#78716c" }}>Payment</td>
                <td style={{ padding: "5px 0", textAlign: "right" }}>
                  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "#fff7ed", color: "#9a3412" }}>{sale.remarks}</span>
                </td>
              </tr>
              {sale.co && (
                <tr>
                  <td style={{ padding: "5px 0", color: "#78716c" }}>C/O</td>
                  <td style={{ padding: "5px 0", textAlign: "right", fontWeight: 600 }}>{sale.co}</td>
                </tr>
              )}
            </tbody>
          </table>

          <hr style={{ border: "none", borderTop: "1px dashed #e5e5e5", margin: "14px 0" }} />

          <div style={{ fontSize: 11, color: "#78716c", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Items</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <tbody>
              <tr>
                <td style={{ padding: "5px 0" }}>{sale.item}</td>
                <td style={{ padding: "5px 0", color: "#78716c", textAlign: "center" }}>× {sale.qty}</td>
                <td style={{ padding: "5px 0", textAlign: "right", fontWeight: 600 }}>{peso(sale.price)}</td>
              </tr>
              {inclusives.length > 0 && inclusives.map((inc) => (
                <tr key={inc}>
                  <td style={{ padding: "3px 0 3px 12px", color: "#78716c", fontSize: 11 }}>{inc}</td>
                  <td />
                  <td style={{ padding: "3px 0", textAlign: "right", fontSize: 11, color: "#78716c" }}>incl.</td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr style={{ border: "none", borderTop: "2px solid #1c1917", margin: "14px 0 10px" }} />

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ fontSize: 16, fontWeight: 800, padding: "5px 0" }}>Total</td>
                <td style={{ fontSize: 16, fontWeight: 800, textAlign: "right", color: "#ea580c", padding: "5px 0" }}>{peso(total)}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ textAlign: "center", color: "#a8a29e", fontSize: 10, marginTop: 20 }}>
            Thank you for your purchase! — PowerMed
          </div>
        </div>
      </div>
    </div>
  );
}
