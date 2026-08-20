// 고요한 여백 — Minimal, zen, visually restful
// Near-white surfaces, sage green accent, hairline borders, generous breathing room

const C = {
  bg: "#F7F7F5",
  surface: "#FFFFFF",
  surfaceAlt: "#F2F2F0",
  accent: "#7BA68C",
  accentLight: "#EDF4F0",
  accentMid: "#BACED4",
  text: "#2D2D2D",
  textLight: "#5A5A5A",
  muted: "#ABABAB",
  border: "#E4E4E0",
  borderLight: "#EFEFEC",
  sunday: "#B5827A",
  saturday: "#7A9BB5",
  orange: "#C49A6C",
  blue: "#7A99B5",
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
  { id: 3, title: "창문 닦기", note: "유리세정제 사용", color: C.blue, time: "16:30", done: false },
];

export function QuietSpace() {
  return (
    <div style={{ width: 390, minHeight: 844, backgroundColor: C.bg, fontFamily: "'Inter', sans-serif", position: "relative", overflowX: "hidden" }}>
      {/* Status bar */}
      <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: 20, paddingTop: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 400, color: C.textLight, letterSpacing: 0.2 }}>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <svg width="16" height="12" viewBox="0 0 16 12" fill={C.muted}><rect x="0" y="4" width="3" height="8" rx="1"/><rect x="4.5" y="2.5" width="3" height="9.5" rx="1"/><rect x="9" y="1" width="3" height="11" rx="1"/><rect x="13.5" y="0" width="2.5" height="12" rx="1"/></svg>
          <svg width="26" height="13" viewBox="0 0 26 13" fill="none"><rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke={C.muted}/><rect x="2" y="2" width="16" height="9" rx="2" fill={C.accent}/><path d="M24 4.5v4a2 2 0 000-4z" fill={C.muted}/></svg>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "8px 24px 16px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, color: C.text, margin: 0, letterSpacing: -0.3 }}>청소 달력</h1>
      </div>

      {/* Calendar card */}
      <div style={{ margin: "0 16px", backgroundColor: C.surface, borderRadius: 16, padding: "18px 16px 14px", border: `1px solid ${C.border}` }}>
        {/* Month header */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <button style={{ width: 30, height: 30, borderRadius: "50%", border: `1px solid ${C.border}`, backgroundColor: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={{ flex: 1, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: C.text, letterSpacing: -0.2 }}>{MONTH}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.5"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <button style={{ paddingInline: 10, paddingBlock: 4, borderRadius: 20, border: `1px solid ${C.border}`, backgroundColor: "transparent", cursor: "pointer", color: C.accent, fontSize: 11, fontWeight: 500, letterSpacing: 0.3 }}>오늘</button>
          <button style={{ width: 30, height: 30, borderRadius: "50%", border: `1px solid ${C.border}`, backgroundColor: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        {/* Weekday labels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
          {DAYS.map((d, i) => (
            <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 500, color: i===0 ? C.sunday : i===6 ? C.saturday : C.muted, paddingBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>{d}</div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: C.borderLight, marginBottom: 8 }}/>

        {/* Day grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 4 }}>
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
                      width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      backgroundColor: isSel ? C.accent : "transparent",
                      border: isToday && !isSel ? `1px solid ${C.accent}` : "none",
                    }}>
                      <span style={{
                        fontSize: 13, fontWeight: isSel ? 600 : 300,
                        color: isSel ? "#fff" : col===0 ? C.sunday : col===6 ? C.saturday : C.text,
                        letterSpacing: -0.1,
                      }}>{day}</span>
                    </div>
                    {hasEvent && <div style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: isSel ? "rgba(255,255,255,0.7)" : C.accent, marginTop: 2, opacity: 0.7 }}/>}
                    {!hasEvent && <div style={{ height: 5 }}/>}
                  </>
                ) : <div style={{ height: 35 }}/>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Date section */}
      <div style={{ padding: "18px 24px 10px", display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: C.text, letterSpacing: -0.2 }}>5월 13일</span>
        <span style={{ fontSize: 13, color: C.muted, fontWeight: 300 }}>수요일</span>
        <div style={{ marginLeft: "auto" }}>
          <span style={{ fontSize: 12, color: C.accent, fontWeight: 400 }}>3개</span>
        </div>
      </div>

      {/* Subtle divider */}
      <div style={{ height: 1, backgroundColor: C.borderLight, marginInline: 24, marginBottom: 12 }}/>

      {/* Schedules */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 6 }}>
        {schedules.map(s => (
          <div key={s.id} style={{ backgroundColor: C.surface, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", border: `1px solid ${C.borderLight}`, borderLeftWidth: 3, borderLeftColor: s.color }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${s.done ? s.color : C.border}`, backgroundColor: s.done ? s.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 14, flexShrink: 0 }}>
              {s.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: s.done ? C.muted : C.text, textDecoration: s.done ? "line-through" : "none", letterSpacing: -0.1 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 1, fontWeight: 300 }}>{s.note}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 5 }}>
                <div style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: C.accent }}/>
                <span style={{ fontSize: 11, color: C.accent, fontWeight: 400, letterSpacing: 0.2 }}>{s.time} 알림</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <div style={{ position: "fixed", bottom: 96, right: 20, width: 48, height: 48, borderRadius: 24, backgroundColor: C.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(123,166,140,0.30)", cursor: "pointer" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
      </div>

      {/* Tab bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, width: 390, height: 84, backgroundColor: C.surface, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", paddingTop: 12 }}>
        {[
          { label: "달력", active: true, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> },
          { label: "메모", active: false, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg> },
          { label: "알림", active: false, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg> },
        ].map(t => (
          <div key={t.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: t.active ? C.accent : C.muted, cursor: "pointer" }}>
            {t.icon}
            <span style={{ fontSize: 10, fontWeight: t.active ? 500 : 300, letterSpacing: 0.4 }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
