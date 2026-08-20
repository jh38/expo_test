// 따뜻한 수첩 — Warm, domestic, personal journal feeling
// Terracotta/cream palette, paper-like surfaces, cozy intimacy

const C = {
  bg: "#FBF5EC",
  surface: "#FFFDF8",
  surfaceMid: "#FEF8EE",
  accent: "#C4724A",
  accentLight: "#F2E2D6",
  accentMuted: "#E8A882",
  text: "#3D2B1F",
  muted: "#9E7B5F",
  border: "#EFE0CC",
  sunday: "#C47070",
  saturday: "#7A8FC4",
  green: "#7DAA80",
  blue: "#6A90C4",
  orange: "#C4874A",
};

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTH = "2026년 5월";
const TODAY = 13;
const SELECTED = 13;

// May 2026: starts Friday (offset 5), 31 days
const grid: (number | null)[] = [null, null, null, null, null, 1, 2];
for (let d = 3; d <= 31; d++) grid.push(d);
while (grid.length < 42) grid.push(null);

const schedules = [
  { id: 1, title: "욕실 청소", note: "타일 줄눈 + 거울 닦기", color: C.accent, time: "10:00", done: true },
  { id: 2, title: "주방 정리", note: "싱크대 소독 후 환기", color: C.orange, time: "14:00", done: false },
  { id: 3, title: "창문 닦기", note: "유리세정제 사용", color: C.blue, time: "16:30", done: false },
];

export function WarmNotebook() {
  return (
    <div style={{ width: 390, minHeight: 844, backgroundColor: C.bg, fontFamily: "'Inter', sans-serif", position: "relative", overflowX: "hidden" }}>
      {/* Status bar */}
      <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: 20, paddingTop: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <svg width="16" height="12" viewBox="0 0 16 12" fill={C.muted}><rect x="0" y="4" width="3" height="8" rx="1"/><rect x="4.5" y="2.5" width="3" height="9.5" rx="1"/><rect x="9" y="1" width="3" height="11" rx="1"/><rect x="13.5" y="0" width="2.5" height="12" rx="1"/></svg>
          <svg width="16" height="12" viewBox="0 0 20 14" fill="none" stroke={C.muted} strokeWidth="2"><ellipse cx="10" cy="9" rx="9" ry="5"/><ellipse cx="10" cy="9" rx="6" ry="3.2"/><circle cx="10" cy="9" r="1.5" fill={C.muted} stroke="none"/><path d="M10 3 Q10 0 10 0" strokeLinecap="round"/></svg>
          <svg width="26" height="13" viewBox="0 0 26 13" fill="none"><rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke={C.muted}/><rect x="2" y="2" width="18" height="9" rx="2" fill={C.accent}/><path d="M24 4.5v4a2 2 0 000-4z" fill={C.muted}/></svg>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "8px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>청소 달력</h1>
        <div style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>
      </div>

      {/* Calendar card */}
      <div style={{ margin: "0 16px", backgroundColor: C.surface, borderRadius: 18, padding: "16px 16px 12px", boxShadow: "0 2px 12px rgba(196,114,74,0.10), 0 1px 3px rgba(196,114,74,0.06)" }}>
        {/* Month header */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
          <button style={{ width: 32, height: 32, borderRadius: 16, border: "none", backgroundColor: C.accentLight, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: C.text }}>{MONTH}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" style={{ marginLeft: 4, verticalAlign: "middle" }}><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <button style={{ paddingInline: 12, paddingBlock: 5, borderRadius: 14, border: "none", backgroundColor: C.accentLight, cursor: "pointer", color: C.accent, fontSize: 12, fontWeight: 600 }}>오늘</button>
          <button style={{ width: 32, height: 32, borderRadius: 16, border: "none", backgroundColor: C.accentLight, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        {/* Weekday labels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
          {DAYS.map((d, i) => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: i===0 ? C.sunday : i===6 ? C.saturday : C.muted, paddingBottom: 6 }}>{d}</div>
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
                      width: 32, height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
                      backgroundColor: isSel ? C.accent : "transparent",
                      border: isToday && !isSel ? `1.5px solid ${C.accent}` : "none",
                    }}>
                      <span style={{
                        fontSize: 13, fontWeight: isSel ? 700 : 400,
                        color: isSel ? "#fff" : col===0 ? C.sunday : col===6 ? C.saturday : C.text,
                      }}>{day}</span>
                    </div>
                    {hasEvent && <div style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: isSel ? C.accentLight : C.accent, marginTop: 1 }}/>}
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
        <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>5월 13일 (수)</span>
        <div style={{ paddingInline: 10, paddingBlock: 3, borderRadius: 12, backgroundColor: C.accentLight }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.accent }}>3개</span>
        </div>
      </div>

      {/* Schedules */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {schedules.map(s => (
          <div key={s.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", borderLeft: `4px solid ${s.color}`, boxShadow: "0 1px 6px rgba(196,114,74,0.07)" }}>
            <div style={{ width: 24, height: 24, borderRadius: 12, border: `2px solid ${s.done ? s.color : C.border}`, backgroundColor: s.done ? s.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 12, flexShrink: 0 }}>
              {s.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: s.done ? C.muted : C.text, textDecoration: s.done ? "line-through" : "none" }}>{s.title}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{s.note}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <span style={{ fontSize: 11, color: C.accent }}>{s.time} 알림</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <div style={{ position: "fixed", bottom: 96, right: 20, width: 52, height: 52, borderRadius: 26, backgroundColor: C.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(196,114,74,0.40)", cursor: "pointer" }}>
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
            <span style={{ fontSize: 11, fontWeight: t.active ? 600 : 400 }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
