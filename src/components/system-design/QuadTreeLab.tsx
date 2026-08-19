import { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus, RotateCcw, Crosshair } from "lucide-react";
import { useSimulationStore } from "@/lib/useSimulationStore";

type Point = { x: number; y: number };
type Rect = { x: number; y: number; w: number; h: number };

class QuadTree {
  capacity: number;
  boundary: Rect;
  points: Point[];
  divided: boolean;
  nw?: QuadTree;
  ne?: QuadTree;
  sw?: QuadTree;
  se?: QuadTree;

  constructor(boundary: Rect, capacity: number) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
  }

  insert(p: Point): boolean {
    if (!this.contains(p)) return false;

    if (this.points.length < this.capacity && !this.divided) {
      this.points.push(p);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return (
      this.nw!.insert(p) ||
      this.ne!.insert(p) ||
      this.sw!.insert(p) ||
      this.se!.insert(p)
    );
  }

  subdivide() {
    const { x, y, w, h } = this.boundary;
    const hw = w / 2;
    const hh = h / 2;
    this.nw = new QuadTree({ x, y, w: hw, h: hh }, this.capacity);
    this.ne = new QuadTree({ x: x + hw, y, w: hw, h: hh }, this.capacity);
    this.sw = new QuadTree({ x, y: y + hh, w: hw, h: hh }, this.capacity);
    this.se = new QuadTree({ x: x + hw, y: y + hh, w: hw, h: hh }, this.capacity);
    this.divided = true;

    const oldPoints = this.points;
    this.points = [];
    for (const p of oldPoints) {
       this.nw.insert(p) || this.ne.insert(p) || this.sw.insert(p) || this.se.insert(p);
    }
  }

  contains(p: Point) {
    const { x, y, w, h } = this.boundary;
    return p.x >= x && p.x < x + w && p.y >= y && p.y < y + h;
  }

  query(range: Rect, found: Point[] = [], visitedRects: Rect[] = []) {
    if (!this.intersects(range)) return found;

    visitedRects.push(this.boundary);

    if (!this.divided) {
      for (const p of this.points) {
        if (this.containsRect(range, p)) found.push(p);
      }
    } else {
      this.nw!.query(range, found, visitedRects);
      this.ne!.query(range, found, visitedRects);
      this.sw!.query(range, found, visitedRects);
      this.se!.query(range, found, visitedRects);
    }
    return found;
  }

  intersects(range: Rect) {
    const { x: x1, y: y1, w: w1, h: h1 } = this.boundary;
    const { x: x2, y: y2, w: w2, h: h2 } = range;
    return !(x2 > x1 + w1 || x2 + w2 < x1 || y2 > y1 + h1 || y2 + h2 < y1);
  }

  containsRect(range: Rect, p: Point) {
    return p.x >= range.x && p.x <= range.x + range.w && p.y >= range.y && p.y <= range.y + range.h;
  }

  getNodes(): { rect: Rect, points: Point[], isLeaf: boolean }[] {
     const nodes = [];
     if (!this.divided) {
       nodes.push({ rect: this.boundary, points: this.points, isLeaf: true });
     } else {
       nodes.push({ rect: this.boundary, points: [], isLeaf: false });
       nodes.push(...this.nw!.getNodes());
       nodes.push(...this.ne!.getNodes());
       nodes.push(...this.sw!.getNodes());
       nodes.push(...this.se!.getNodes());
     }
     return nodes;
  }
}

export function QuadTreeLab() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  const animate = simulationsEnabled && !reduce;

  const [capacity, setCapacity] = useState(4);
  const [points, setPoints] = useState<Point[]>([]);
  
  const [mode, setMode] = useState<"insert"|"query">("insert");
  const [queryRange, setQueryRange] = useState<Rect | null>(null);
  
  const width = 400;
  const height = 400;
  
  const qt = new QuadTree({ x: 0, y: 0, w: width, h: height }, capacity);
  for (const p of points) qt.insert(p);

  const nodes = qt.getNodes();
  
  let foundPoints: Point[] = [];
  let visitedRects: Rect[] = [];
  if (queryRange) {
    qt.query(queryRange, foundPoints, visitedRects);
  }

  function handleInteraction(e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
     const rect = e.currentTarget.getBoundingClientRect();
     let clientX, clientY;
     
     if ('touches' in e) {
       clientX = e.touches[0].clientX;
       clientY = e.touches[0].clientY;
     } else {
       clientX = e.clientX;
       clientY = e.clientY;
     }

     const x = ((clientX - rect.left) / rect.width) * width;
     const y = ((clientY - rect.top) / rect.height) * height;

     if (mode === "insert") {
       setPoints(prev => [...prev, { x, y }]);
       setQueryRange(null);
     } else {
       setQueryRange({ x: x - 40, y: y - 40, w: 80, h: 80 });
     }
  }

  function addRandom() {
     const newPoints: { x: number; y: number }[] = [];
     for(let i=0; i<10; i++) {
        newPoints.push({ x: Math.random() * width, y: Math.random() * height });
     }
     setPoints(prev => [...prev, ...newPoints]);
  }

  function reset() {
    setPoints([]);
    setQueryRange(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
           <button
             onClick={() => setMode("insert")}
             className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-xs transition-colors ${
               mode === "insert" ? "border-terminal/40 bg-terminal/10 text-terminal" : "border-border bg-background text-muted-foreground hover:text-foreground"
             }`}
           >
             <Plus className="size-3" /> insert points
           </button>
           <button
             onClick={() => setMode("query")}
             className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-xs transition-colors ${
               mode === "query" ? "border-amber-500/40 bg-amber-500/10 text-amber-500" : "border-border bg-background text-muted-foreground hover:text-foreground"
             }`}
           >
             <Crosshair className="size-3" /> query range
           </button>
        </div>

        <div className="flex items-center gap-2">
           <button
             onClick={addRandom}
             className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
           >
             add 10 random
           </button>
           <button
             onClick={reset}
             className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
           >
             <RotateCcw className="size-3" /> reset
           </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
         <div 
           className="relative aspect-square w-full max-w-[400px] cursor-crosshair overflow-hidden rounded-lg border border-border bg-card/40"
           onMouseDown={handleInteraction}
           onTouchStart={handleInteraction}
         >
            {/* Draw grid lines representing boundaries */}
            {nodes.filter(n => n.isLeaf).map((n, i) => (
               <div 
                 key={i}
                 className="absolute border border-terminal/30 transition-all duration-300"
                 style={{
                   left: `${(n.rect.x / width) * 100}%`,
                   top: `${(n.rect.y / height) * 100}%`,
                   width: `${(n.rect.w / width) * 100}%`,
                   height: `${(n.rect.h / height) * 100}%`,
                 }}
               />
            ))}

            {/* Draw visited rects during query */}
            {visitedRects.map((rect, i) => (
               <motion.div 
                 key={`v-${i}`}
                 initial={animate ? { opacity: 0 } : false}
                 animate={{ opacity: 1 }}
                 className="absolute border-2 border-amber-500/50 bg-amber-500/10 pointer-events-none"
                 style={{
                   left: `${(rect.x / width) * 100}%`,
                   top: `${(rect.y / height) * 100}%`,
                   width: `${(rect.w / width) * 100}%`,
                   height: `${(rect.h / height) * 100}%`,
                 }}
               />
            ))}

            {/* Draw Points */}
            {points.map((p, i) => {
               const isFound = foundPoints.includes(p);
               return (
                 <motion.div
                   key={i}
                   initial={animate ? { scale: 0 } : false}
                   animate={{ scale: 1 }}
                   className={`absolute -ml-1 -mt-1 size-2 rounded-full pointer-events-none transition-colors duration-300 ${isFound ? 'bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.8)]' : 'bg-terminal'}`}
                   style={{
                     left: `${(p.x / width) * 100}%`,
                     top: `${(p.y / height) * 100}%`,
                   }}
                 />
               )
            })}

            {/* Draw Query Range */}
            {queryRange && (
               <div 
                 className="absolute border border-fuchsia-400/50 bg-fuchsia-400/10 pointer-events-none transition-all duration-100"
                 style={{
                   left: `${(queryRange.x / width) * 100}%`,
                   top: `${(queryRange.y / height) * 100}%`,
                   width: `${(queryRange.w / width) * 100}%`,
                   height: `${(queryRange.h / height) * 100}%`,
                 }}
               />
            )}
         </div>

         <div className="w-full space-y-4 font-mono text-xs md:w-64">
            <div className="rounded-lg border border-border bg-card/40 p-4">
              <h3 className="mb-2 uppercase tracking-wider text-muted-foreground">Stats</h3>
              <div className="flex justify-between">
                <span>Total Points</span>
                <span className="text-terminal">{points.length}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Leaf Nodes</span>
                <span className="text-cyan-accent">{nodes.filter(n => n.isLeaf).length}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Max Capacity</span>
                <span className="text-muted-foreground">{capacity} / node</span>
              </div>
            </div>

            {queryRange && (
              <div className="rounded-lg border border-border bg-card/40 p-4">
                <h3 className="mb-2 uppercase tracking-wider text-amber-500">Query Results</h3>
                <div className="flex justify-between">
                  <span>Points Found</span>
                  <span className="text-fuchsia-400 font-bold">{foundPoints.length}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Nodes Traversed</span>
                  <span className="text-amber-500">{visitedRects.length}</span>
                </div>
              </div>
            )}
         </div>
      </div>

      <div className="rounded-md border border-cyan-accent/20 bg-cyan-accent/5 p-4 font-mono text-xs text-cyan-accent/80">
        <p>
          A QuadTree recursively subdivides 2D space into four quadrants whenever a region exceeds its capacity. 
          This turns spatial queries (like "find all points near me") from <code>O(N)</code> to <code>O(log N)</code> because whole quadrants can be ignored if they don't intersect the query range.
        </p>
      </div>
    </div>
  );
}
