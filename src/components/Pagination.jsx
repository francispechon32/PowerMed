export const PER_PAGE = 7;

function getPageNums(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pool = new Set([1, total, current - 1, current, current + 1].filter(p => p >= 1 && p <= total));
  const sorted = [...pool].sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("...");
    result.push(sorted[i]);
  }
  return result;
}

export default function Pagination({ page, totalPages, total, perPage, onPageChange }) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);
  return (
    <div className="pm-pagination">
      <span className="pm-pagination-info">Showing {from}–{to} of {total}</span>
      <div className="pm-pagination-controls">
        <button className="pm-page-btn" onClick={() => onPageChange(page - 1)} disabled={page === 1}>‹</button>
        {getPageNums(page, totalPages).map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="pm-page-ellipsis">…</span>
          ) : (
            <button key={p} className={`pm-page-btn${p === page ? " active" : ""}`} onClick={() => onPageChange(p)}>{p}</button>
          )
        )}
        <button className="pm-page-btn" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>›</button>
      </div>
    </div>
  );
}
