import { NedlCategory } from "@/generated/prisma/client";

const colors: Record<NedlCategory, { bg: string; text: string; label: string }> = {
  b:  { bg: "#0d2818", text: "#3fb950", label: "บัญชี ข" },
  s:  { bg: "#0d1b2e", text: "#58a6ff", label: "บัญชี ง" },
  ex: { bg: "#2e1b0d", text: "#ff9500", label: "บัญชีเพิ่มเติม" },
  R1: { bg: "#2e0d0d", text: "#ff3b30", label: "ร1" },
  R2: { bg: "#1e0d2e", text: "#a371f7", label: "ร2" },
};

export default function NedlBadge({ category }: { category: NedlCategory | null }) {
  if (!category) return <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>—</span>;
  const c = colors[category];
  return (
    <span
      style={{
        background: c.bg,
        color: c.text,
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "11px",
        fontWeight: 600,
        border: `1px solid ${c.text}33`,
      }}
    >
      {c.label}
    </span>
  );
}

export function nedlBadgeColor(category: NedlCategory | null): string {
  if (!category) return "var(--text-muted)";
  return colors[category].text;
}
