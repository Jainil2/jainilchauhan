import { useMemo, useState } from "react";

const ORDER = 4; // max keys per node before split (B-tree of order 4)

interface BNode {
  keys: number[];
  children: BNode[];
  leaf: boolean;
}

function newNode(leaf = true): BNode {
  return { keys: [], children: [], leaf };
}

function insert(root: BNode, key: number): BNode {
  if (root.keys.length === ORDER) {
    const s = newNode(false);
    s.children.push(root);
    splitChild(s, 0);
    insertNonFull(s, key);
    return s;
  }
  insertNonFull(root, key);
  return root;
}

function splitChild(parent: BNode, i: number) {
  const y = parent.children[i];
  const mid = Math.floor(ORDER / 2);
  const z = newNode(y.leaf);
  z.keys = y.keys.slice(mid + 1);
  if (!y.leaf) z.children = y.children.slice(mid + 1);
  const upKey = y.keys[mid];
  y.keys = y.keys.slice(0, mid);
  if (!y.leaf) y.children = y.children.slice(0, mid + 1);
  parent.children.splice(i + 1, 0, z);
  parent.keys.splice(i, 0, upKey);
}

function insertNonFull(node: BNode, key: number) {
  let i = node.keys.length - 1;
  if (node.leaf) {
    while (i >= 0 && key < node.keys[i]) i--;
    node.keys.splice(i + 1, 0, key);
  } else {
    while (i >= 0 && key < node.keys[i]) i--;
    i++;
    if (node.children[i].keys.length === ORDER) {
      splitChild(node, i);
      if (key > node.keys[i]) i++;
    }
    insertNonFull(node.children[i], key);
  }
}

function search(
  node: BNode,
  key: number,
  depth = 0,
): { found: boolean; comparisons: number; path: number[] } {
  let cmp = 0;
  let i = 0;
  while (i < node.keys.length && key > node.keys[i]) {
    i++;
    cmp++;
  }
  if (i < node.keys.length && key === node.keys[i]) {
    cmp++;
    return { found: true, comparisons: cmp, path: [depth] };
  }
  if (node.leaf) return { found: false, comparisons: cmp, path: [depth] };
  const r = search(node.children[i], key, depth + 1);
  return { found: r.found, comparisons: cmp + r.comparisons, path: [depth, ...r.path] };
}

function clone(n: BNode): BNode {
  return { keys: [...n.keys], children: n.children.map(clone), leaf: n.leaf };
}

function NodeView({ node, depth }: { node: BNode; depth: number }) {
  const colors = [
    "oklch(0.85 0.21 150)",
    "oklch(0.78 0.16 200)",
    "oklch(0.75 0.18 310)",
    "oklch(0.80 0.18 60)",
  ];
  const c = colors[depth % colors.length];
  return (
    <div className="flex flex-col items-center">
      <div
        className="flex gap-0.5 rounded border bg-card/60 px-1.5 py-1 font-mono text-xs"
        style={{ borderColor: c }}
      >
        {node.keys.map((k) => (
          <span key={k} className="px-1 text-foreground">
            {k}
          </span>
        ))}
      </div>
      {!node.leaf && (
        <div className="mt-2 flex items-start gap-2">
          {node.children.map((ch, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-2 w-px bg-border" />
              <NodeView node={ch} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BTreeIndexLab() {
  const [root, setRoot] = useState<BNode>(() => {
    let r = newNode(true);
    for (const k of [50, 20, 80, 10, 30, 70, 90, 5, 15, 25, 35, 60, 75, 85, 95]) r = insert(r, k);
    return r;
  });
  const [input, setInput] = useState("");
  const [lookup, setLookup] = useState<{
    key: number;
    result: ReturnType<typeof search>;
    tableScan: number;
  } | null>(null);

  const totalKeys = useMemo(() => {
    let n = 0;
    function walk(x: BNode) {
      n += x.keys.length;
      x.children.forEach(walk);
    }
    walk(root);
    return n;
  }, [root]);

  function add() {
    const v = parseInt(input, 10);
    if (isNaN(v)) return;
    setRoot((r) => insert(clone(r), v));
    setInput("");
    setLookup(null);
  }
  function find() {
    const v = parseInt(input, 10);
    if (isNaN(v)) return;
    const res = search(root, v);
    setLookup({ key: v, result: res, tableScan: Math.floor(totalKeys / 2) + 1 });
  }
  function rand() {
    const v = Math.floor(Math.random() * 99) + 1;
    setRoot((r) => insert(clone(r), v));
    setLookup(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="key (0-999)"
          className="w-24 rounded border border-border bg-background/60 px-2 py-1 text-foreground placeholder:text-muted-foreground"
        />
        <button
          onClick={add}
          className="rounded border border-border px-2 py-1 hover:border-terminal/50 hover:text-terminal"
        >
          insert
        </button>
        <button
          onClick={find}
          className="rounded border border-border px-2 py-1 hover:border-terminal/50 hover:text-terminal"
        >
          lookup
        </button>
        <button
          onClick={rand}
          className="rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground"
        >
          + random
        </button>
        <span className="ml-auto text-muted-foreground">
          order={ORDER} · {totalKeys} keys
        </span>
      </div>

      <div className="overflow-x-auto rounded border border-border bg-background/40 p-4">
        <div className="flex justify-center">
          <NodeView node={root} depth={0} />
        </div>
      </div>

      {lookup && (
        <div className="rounded border border-border bg-background/40 p-3 font-mono text-xs">
          <p>
            lookup({lookup.key}) →{" "}
            <span className={lookup.result.found ? "text-terminal" : "text-destructive"}>
              {lookup.result.found ? "found" : "miss"}
            </span>
          </p>
          <p className="mt-1 text-muted-foreground">
            B-tree comparisons: <span className="text-terminal">{lookup.result.comparisons}</span>{" "}
            across depth <span className="text-terminal">{lookup.result.path.length}</span>
          </p>
          <p className="text-muted-foreground">
            Naive table scan (~n/2): <span className="text-destructive">{lookup.tableScan}</span>{" "}
            comparisons
          </p>
          <p className="mt-1 text-cyan-accent">
            // O(log n) vs O(n) — and disk pages mean each node hit is one I/O.
          </p>
        </div>
      )}
    </div>
  );
}
