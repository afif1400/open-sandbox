const ITEMS: Array<{ pri: "" | "hi" | "md"; t: string; s: string; done?: boolean }> = [
  { pri: "hi", t: "Review Q2 OKR draft", s: "Due today · Work" },
  { pri: "md", t: "Reply to Anna about the grant", s: "Due tomorrow · Work" },
  { pri: "", t: "Water the plants", s: "Personal", done: true },
  { pri: "", t: "Book dentist for Thursday", s: "Personal" },
  { pri: "", t: "Ship preview link to beta testers", s: "Work", done: true },
  { pri: "md", t: "Finalise sandbox runtime spec", s: "Due Fri · Work" },
];

export function MockTodoApp() {
  return (
    <div className="mock-app">
      <div className="mock-sb">
        <span>9:41</span>
        <div className="ind">
          <span className="b" style={{ height: 5 }} />
          <span className="b" style={{ height: 7 }} />
          <span className="b" style={{ height: 9 }} />
          <span className="b" style={{ height: 11 }} />
        </div>
      </div>
      <div className="mock-head">
        <h1>Today</h1>
        <div className="add">+</div>
      </div>
      <div className="mock-tabs">
        <span className="t on">All · 6</span>
        <span className="t">Work</span>
        <span className="t">Personal</span>
      </div>
      <div className="mock-list">
        {ITEMS.map((it, i) => (
          <div key={i} className={`mock-item ${it.done ? "done" : ""}`}>
            <span className={`pri ${it.pri}`} />
            <div className="check" />
            <div className="body">
              <div className="t">{it.t}</div>
              <div className="s">{it.s}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mock-tabbar">
        <div className="tb on">
          <div className="ic" />
          <span>Today</span>
        </div>
        <div className="tb">
          <div className="ic" />
          <span>Lists</span>
        </div>
        <div className="tb">
          <div className="ic" />
          <span>Search</span>
        </div>
        <div className="tb">
          <div className="ic" />
          <span>Me</span>
        </div>
      </div>
    </div>
  );
}
