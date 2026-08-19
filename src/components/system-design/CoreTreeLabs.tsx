import { useMemo, useState } from "react";

const buttonClass =
  "rounded border border-border px-2 py-1 font-mono text-xs text-muted-foreground hover:border-terminal/50 hover:text-terminal";
const activeClass = "border-terminal bg-terminal/10 text-terminal";
const nodeClass =
  "flex min-h-12 items-center justify-center rounded border border-border bg-background/50 px-3 py-2 font-mono text-xs";

function TreeNode({ value, active }: { value: string | number; active?: boolean }) {
  return <div className={`${nodeClass} ${active ? activeClass : ""}`}>{value}</div>;
}

export function BinaryTreeLab() {
  const [index, setIndex] = useState(0);
  const nodes = ["A", "B", "C", "D", "E", "F", "G"];
  return (
    <div className="space-y-4">
      <button onClick={() => setIndex((i) => (i + 1) % nodes.length)} className={buttonClass}>
        level-order step
      </button>
      <div className="space-y-3">
        <div className="mx-auto w-20">
          <TreeNode value="A" active={index === 0} />
        </div>
        <div className="mx-auto grid max-w-xs grid-cols-2 gap-16">
          <TreeNode value="B" active={index === 1} />
          <TreeNode value="C" active={index === 2} />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {nodes.slice(3).map((n, i) => (
            <TreeNode key={n} value={n} active={index === i + 3} />
          ))}
        </div>
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        For array storage, node i has left child 2i+1 and right child 2i+2.
      </p>
    </div>
  );
}

export function BSTLab() {
  const [target, setTarget] = useState(40);
  const path =
    target < 50 ? (target < 25 ? ["50", "25", "10"] : ["50", "25", "40"]) : ["50", "75", "60"];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[10, 40, 60].map((value) => (
          <button
            key={value}
            onClick={() => setTarget(value)}
            className={`${buttonClass} ${target === value ? activeClass : ""}`}
          >
            find {value}
          </button>
        ))}
      </div>
      <div className="grid gap-3">
        <div className="mx-auto w-20">
          <TreeNode value={50} active={path.includes("50")} />
        </div>
        <div className="mx-auto grid max-w-xs grid-cols-2 gap-16">
          <TreeNode value={25} active={path.includes("25")} />
          <TreeNode value={75} active={path.includes("75")} />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[10, 40, 60, 90].map((v) => (
            <TreeNode key={v} value={v} active={path.includes(String(v))} />
          ))}
        </div>
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        Compare target at each node: smaller goes left, larger goes right.
      </p>
    </div>
  );
}

export function AVLTreeLab() {
  const [skew, setSkew] = useState(false);
  return (
    <div className="space-y-4">
      <button onClick={() => setSkew((v) => !v)} className={buttonClass}>
        {skew ? "rotate left" : "insert 30"}
      </button>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded border border-border bg-background/40 p-3">
          <p className="mb-3 font-mono text-xs text-muted-foreground">before balance</p>
          <div className="space-y-2">
            {(skew ? [10, 20, 30] : [20, 10, 30]).map((v, i) => (
              <div key={v} className={nodeClass} style={{ marginLeft: skew ? i * 32 : 0 }}>
                {v}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded border border-border bg-background/40 p-3">
          <p className="mb-3 font-mono text-xs text-muted-foreground">after AVL rotation</p>
          <div className="mx-auto w-20">
            <TreeNode value={20} active />
          </div>
          <div className="mx-auto mt-3 grid max-w-xs grid-cols-2 gap-16">
            <TreeNode value={10} />
            <TreeNode value={30} />
          </div>
        </div>
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        AVL keeps every node balance factor in {"{-1, 0, 1}"}; rotations restore height.
      </p>
    </div>
  );
}

export function RedBlackTreeLab() {
  const [showFix, setShowFix] = useState(false);
  const nodes = showFix
    ? [
        ["20", "black"],
        ["10", "red"],
        ["30", "red"],
        ["5", "black"],
        ["15", "black"],
      ]
    : [
        ["20", "black"],
        ["10", "red"],
        ["30", "black"],
        ["5", "red"],
        ["15", "red"],
      ];
  return (
    <div className="space-y-4">
      <button onClick={() => setShowFix((v) => !v)} className={buttonClass}>
        recolor / rotate
      </button>
      <div className="grid gap-3">
        <div className="mx-auto w-20">
          <TreeNode value={`${nodes[0][0]} ${nodes[0][1]}`} active={nodes[0][1] === "black"} />
        </div>
        <div className="mx-auto grid max-w-xs grid-cols-2 gap-16">
          {nodes.slice(1, 3).map(([value, color]) => (
            <div
              key={value}
              className={`${nodeClass} ${color === "red" ? "border-destructive text-destructive" : "text-foreground"}`}
            >
              {value} {color}
            </div>
          ))}
        </div>
        <div className="mx-auto grid max-w-xs grid-cols-2 gap-4">
          {nodes.slice(3).map(([value, color]) => (
            <div
              key={value}
              className={`${nodeClass} ${color === "red" ? "border-destructive text-destructive" : "text-foreground"}`}
            >
              {value} {color}
            </div>
          ))}
        </div>
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        Red-black trees trade stricter balance for fewer rotations than AVL trees.
      </p>
    </div>
  );
}

export function HeapLab() {
  const [heap, setHeap] = useState([3, 8, 5, 14, 12, 9, 20]);
  function push() {
    const value = Math.floor(Math.random() * 30) + 1;
    setHeap((h) => [...h, value].sort((a, b) => a - b).slice(0, 8));
  }
  function pop() {
    setHeap((h) => h.slice(1));
  }
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={push} className={buttonClass}>
          push
        </button>
        <button onClick={pop} className={buttonClass}>
          pop min
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {heap.map((v, i) => (
          <div key={`${v}-${i}`} className={`${nodeClass} ${i === 0 ? activeClass : ""}`}>
            [{i}] {v}
          </div>
        ))}
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        Min-heap invariant: every parent is less than or equal to its children.
      </p>
    </div>
  );
}

export function SegmentTreeLab() {
  const data = [2, 1, 5, 3, 4, 7, 6, 8];
  const [range, setRange] = useState<[number, number]>([2, 5]);
  const sum = data.slice(range[0], range[1] + 1).reduce((a, b) => a + b, 0);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            [0, 3],
            [2, 5],
            [4, 7],
          ] as [number, number][]
        ).map((r) => (
          <button
            key={r.join("-")}
            onClick={() => setRange(r)}
            className={`${buttonClass} ${range[0] === r[0] && range[1] === r[1] ? activeClass : ""}`}
          >
            sum [{r[0]}, {r[1]}]
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {data.map((v, i) => (
          <div
            key={i}
            className={`${nodeClass} ${i >= range[0] && i <= range[1] ? activeClass : ""}`}
          >
            {v}
          </div>
        ))}
      </div>
      <div className="rounded border border-border bg-background/40 p-3 font-mono text-xs text-muted-foreground">
        range sum = <span className="text-terminal">{sum}</span>. Segment trees answer range queries
        by combining O(log n) covered intervals.
      </div>
    </div>
  );
}

export function FenwickTreeLab() {
  const data = [3, 1, 4, 1, 5, 9, 2, 6];
  const [index, setIndex] = useState(5);
  const prefix = data.slice(0, index + 1).reduce((a, b) => a + b, 0);
  const touched = [index + 1, index + 1 - ((index + 1) & -(index + 1))].filter((v) => v > 0);
  return (
    <div className="space-y-4">
      <input
        type="range"
        min="0"
        max={data.length - 1}
        value={index}
        onChange={(e) => setIndex(Number(e.target.value))}
        className="w-full accent-terminal"
      />
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {data.map((v, i) => (
          <div key={i} className={`${nodeClass} ${i <= index ? "ring-1 ring-cyan-accent/50" : ""}`}>
            {v}
          </div>
        ))}
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        prefix[0..{index}] = <span className="text-terminal">{prefix}</span>. BIT jumps by lowbit;
        sample tree indexes: {touched.join(" -> ")}.
      </p>
    </div>
  );
}

export function DisjointSetLab() {
  const [parent, setParent] = useState([0, 0, 2, 2, 4, 4]);
  function unite(a: number, b: number) {
    setParent((p) => p.map((root, i) => (root === p[b] || i === b ? p[a] : root)));
  }
  const groups = useMemo(() => {
    const map = new Map<number, number[]>();
    parent.forEach((p, i) => map.set(p, [...(map.get(p) ?? []), i]));
    return [...map.entries()];
  }, [parent]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => unite(0, 2)} className={buttonClass}>
          union 0-2
        </button>
        <button onClick={() => unite(4, 0)} className={buttonClass}>
          union 4-0
        </button>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {groups.map(([root, members]) => (
          <div
            key={root}
            className="rounded border border-border bg-background/40 p-3 font-mono text-xs"
          >
            <p className="text-cyan-accent">root {root}</p>
            <p className="mt-2 text-foreground">{members.join(", ")}</p>
          </div>
        ))}
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        DSU answers connectivity by merging sets with union by rank and path compression.
      </p>
    </div>
  );
}

export function BPlusTreeLab() {
  const [highlight, setHighlight] = useState(0);
  const leaves = [
    ["03", "08", "12"],
    ["17", "21", "29"],
    ["34", "42", "55"],
  ];
  return (
    <div className="space-y-4">
      <button onClick={() => setHighlight((i) => (i + 1) % leaves.length)} className={buttonClass}>
        scan next leaf
      </button>
      <div className="mx-auto max-w-sm rounded border border-terminal/40 bg-terminal/10 p-3 text-center font-mono text-xs text-terminal">
        internal keys: 17 | 34
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {leaves.map((leaf, i) => (
          <div
            key={i}
            className={`rounded border p-3 font-mono text-xs ${highlight === i ? "border-terminal bg-terminal/10" : "border-border bg-background/40"}`}
          >
            <p className="mb-2 text-muted-foreground">leaf {i}</p>
            <div className="flex gap-2">
              {leaf.map((key) => (
                <span key={key} className="rounded border border-border px-2 py-1 text-foreground">
                  {key}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        B+ trees keep records in linked leaves, making range scans efficient for databases.
      </p>
    </div>
  );
}
