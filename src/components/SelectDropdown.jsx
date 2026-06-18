import { useState } from "react";
import { IconChevron } from "./Icons";

export default function SelectDropdown({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);

  const selectedLabel = value ? options.find((o) => o.value === value)?.label : null;

  return (
    <div className="pm-period-pill-wrap">
      <button className="pm-period-pill" onClick={() => setOpen((v) => !v)} type="button">
        <span>{selectedLabel || placeholder}</span>
        <IconChevron
          size={13}
          strokeWidth={2.5}
          style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      {open && (
        <div className="pm-period-dropdown">
          <button
            className={`pm-period-option${!value ? " active" : ""}`}
            onClick={() => { onChange(""); setOpen(false); }}
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`pm-period-option${value === opt.value ? " active" : ""}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
