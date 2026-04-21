import { Fragment, useMemo, type ReactElement } from "react";
import type { DiffEntry, DiffOp } from "@/types/events";
import { Icon } from "@/components/icons";

type Node = { _children: Record<string, Node>; _op: DiffOp | null };

export function FilesTab({ diffEvents }: { diffEvents: DiffEntry[] }) {
  const tree = useMemo<Record<string, Node>>(() => {
    const root: Record<string, Node> = {};
    diffEvents.forEach((d) => {
      const parts = d.path.split("/");
      let cur: Record<string, Node> = root;
      parts.forEach((p, i) => {
        if (!cur[p]) cur[p] = { _children: {}, _op: null };
        if (i === parts.length - 1) cur[p]._op = d.op;
        cur = cur[p]._children;
      });
    });
    return root;
  }, [diffEvents]);

  const render = (node: Record<string, Node>, depth = 0): ReactElement[] => {
    const entries = Object.entries(node);
    return entries.map(([name, info]) => {
      const isFile = Object.keys(info._children).length === 0;
      return (
        <Fragment key={name + depth}>
          <div className={`file-row ${isFile ? "" : "dir"}`} style={{ paddingLeft: 8 + depth * 16 }}>
            <span className="ic">{isFile ? Icon.file : Icon.folder}</span>
            <span>{name}</span>
            {info._op && <span className={`pill ${info._op}`}>{info._op}</span>}
          </div>
          {!isFile && render(info._children, depth + 1)}
        </Fragment>
      );
    });
  };

  return (
    <>
      <div className="files-head">
        workspace/ — {diffEvents.length} change{diffEvents.length === 1 ? "" : "s"}
      </div>
      <div className="file-tree">
        {diffEvents.length === 0 ? (
          <div
            style={{
              padding: 20,
              color: "var(--text-3)",
              fontFamily: "var(--mono)",
              fontSize: 11,
              textAlign: "center",
            }}
          >
            no files yet
          </div>
        ) : (
          render(tree)
        )}
      </div>
    </>
  );
}
