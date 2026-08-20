// 어두운 집중 — Dark, nocturnal, precise, power-user productivity
// Deep navy + electric blue palette, clean high-contrast, focused

const C = {
  bg: "#0F172A",
  surface: "#1E293B",
  surfaceHigh: "#263347",
  accent: "#60A5FA",
  accentDim: "#1D3557",
  accentGlow: "rgba(96,165,250,0.18)",
  text: "#F1F5F9",
  muted: "#64748B",
  border: "#1E3A5F",
  sunday: "#F87171",
  saturday: "#93C5FD",
  green: "#4ADE80",
  orange: "#FB923C",
  purple: "#A78BFA",
};

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTH = "2026년 5월";
const TODAY = 13;
const SELECTED = 13;

const grid: (number | null)[] = [null, null, null, null, null, 1, 2];
for (let d = 3; d <= 31; d++) grid.push(d);
while (grid.length < 42) grid.push(null);

const schedules = [
  { id: 1, title: "욕실 청소", note: "타일 줄눈 + 거울 닦기", color: C.accent, time: "10:00", done: true },
  { id: 2, title: "주방 정리", note: "싱크대 소독 후 환기", color: C.orange, time: "14:00", done: false },
  { id: 3, title: "창문 닦기", note: "유리세정제 사용", color: C.purple, time: "16:30", done: false },
];

export function DarkFocus() {
  return (
    <div style={{ width: 390, minHeight: 844, backgroundColor: C.bg, fontFamily: "'Inter', sans-serif", position: "relative", overflowX: "hidden" }}>
      {/* Status bar */}
      <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: 20, paddingTop: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <svg width="16" height="12" viewBox="0 0 16 12" fill={C.muted}><rect x="0" y="4" width="3" height="8" rx="1"/><rect x="4.5" y="2.5" width="3" height="9.5" rx="1"/><rect x="9" y="1" width="3" height="11" rx="1"/><rect x="13.5" y="0" width="2.5" height="12" rx="1"/></svg>
          <svg width="26" height="13" viewBox="0 0 26 13" fill="none"><rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke={C.muted}/><rect x="2" y="2" width="14" height="9" rx="2" fill={C.accent}/><path d="M24 4.5v4a2 2 0 000-4z" fill={C.muted}/></svg>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "8px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0, letterSpacing: -0.5 }}>청소 달력</h1>
        <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.surfaceHigh, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>
      </div>

      {/* Calendar card */}
      <div style={{ margin: "0 16px", backgroundColor: C.surface, borderRadius: 16, padding: "16px 16px 12px", border: `1px solid ${C.border}` }}>
        {/* Month header */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
          <button style={{ width: 32, height: 32, borderRadius: 8, border: "none", backgroundColor: C.surfaceHigh, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>{MONTH}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" style={{ marginLeft: 4, verticalAlign: "middle" }}><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <button style={{ paddingInline: 12, paddingBlock: 5, borderRadius: 8, border: `1px solid ${C.accent}`, backgroundColor: "transparent", cursor: "pointer", color: C.accent, fontSize: 12, fontWeight: 600, letterSpacing: 0.3 }}>오늘</button>
          <button style={{ width: 32, height: 32, borderRadius: 8, border: "none", backgroundColor: C.surfaceHigh, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        {/* Weekday labels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
          {DAYS.map((d, i) => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: i===0 ? C.sunday : i===6 ? C.saturday : C.muted, paddingBottom: 6, letterSpacing: 0.2 }}>{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 2 }}>
          {grid.map((day, idx) => {
            const col = idx % 7;
            const isToday = day === TODAY;
            const isSel = day === SELECTED;
            const hasEvent = day && [5, 8, 13, 18, 22, 27].includes(day);
            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBlock: 1 }}>
                {day ? (
                  <>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                      backgroundColor: isSel ? C.accent : "transparent",
                      boxShadow: isSel ? `0 0 14px ${C.accentGlow}` : "none",
                      border: isToday && !isSel ? `1.5px solid ${C.accent}` : "none",
                    }}>
                      <span style={{
                        fontSize: 13, fontWeight: isSel ? 700 : 400,
                        color: isSel ? "#fff" : col===0 ? C.sunday : col===6 ? C.saturday : C.text,
                      }}>{day}</span>
                    </div>
                    {hasEvent && <div style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: isSel ? "rgba(255,255,255,0.6)" : C.accent, marginTop: 1 }}/>}
                    {!hasEvent && <div style={{ height: 5 }}/>}
                  </>
                ) : <div style={{ height: 37 }}/>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Date section */}
      <div style={{ padding: "16px 20px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>5월 13일 (수)</span>
        <div style={{ paddingInline: 10, paddingBlock: 3, borderRadius: 8, backgroundColor: C.accentDim }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.accent }}>3개</span>
        </div>
      </div>

      {/* Schedules */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {schedules.map(s => (
          <div key={s.id} style={{ backgroundColor: C.surface, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", borderLeft: `3px solid ${s.color}`, border: `1px solid ${C.border}`, borderLeftWidth: 3, borderLeftColor: s.color }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${s.done ? s.color : C.muted}`, backgroundColor: s.done ? s.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 12, flexShrink: 0 }}>
              {s.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: s.done ? C.muted : C.text, textDecoration: s.done ? "line-through" : "none", letterSpacing: -0.2 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{s.note}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <span style={{ fontSize: 11, color: C.accent }}>{s.time} 알림</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <div style={{ position: "fixed", bottom: 96, right: 20, width: 52, height: 52, borderRadius: 14, backgroundColor: C.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 20px rgba(96,165,250,0.50)`, cursor: "pointer" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
      </div>

      {/* Tab bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, width: 390, height: 84, backgroundColor: C.surface, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", paddingTop: 10 }}>
        {[
          { label: "달력", active: true, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> },
          { label: "메모", active: false, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg> },
          { label: "알림", active: false, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg> },
        ].map(t => (
          <div key={t.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: t.active ? C.accent : C.muted, cursor: "pointer" }}>
            {t.icon}
            <span style={{ fontSize: 11, fontWeight: t.active ? 600 : 400, letterSpacing: 0.2 }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
