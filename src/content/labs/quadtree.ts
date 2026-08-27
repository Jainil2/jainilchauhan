import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "quadtree",
  title: "QuadTree / GeoSpatial",
  category: "Data Structures",
  difficulty: "Intermediate",
  readingTimeMin: 5,
  blurb: "2D spatial partitioning.",
  caption:
    "Efficiently find points in a 2D area. Watch the space recursively subdivide into four quadrants as more points are added. Perfect for collision detection, map markers, and image compression.",
  skillTags: ["DSA", "Graphics", "GeoSpatial"],
  concept:
    "A QuadTree is a spatial data structure used to partition a two-dimensional space by recursively subdividing it into four quadrants (Northwest, Northeast, Southwest, Southeast). \n\nInstead of checking every point in the world (O(N)), a QuadTree allows you to prune entire branches of the search tree that don't overlap with your query area. This turns a global search into an O(log N) operation.\n\nIt is the 2D equivalent of an Octree (3D) and is a foundational structure for game engines, geographic information systems (GIS), and sparse data representations.",
  complexity: [
    { operation: "Insert", time: "O(log N) avg, O(N) worst", space: "O(N)" },
    { operation: "Range Query", time: "O(K + log N)", space: "O(log N) stack" },
  ],
  realWorld: [
    "Game Engines: for broad-phase collision detection between entities.",
    "Map Rendering: to efficiently determine which markers are visible on the current screen zoom.",
    "Image Compression: regions with uniform color are represented by larger nodes.",
  ],
  pitfalls: [
    "Degenerate cases: if many points are at the exact same coordinate, the tree can become extremely deep. Most implementations set a 'Max Depth'.",
    "Dynamic objects: if objects move constantly, re-inserting them into the QuadTree every frame can be expensive.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Recursively split space into 4 quadrants; leaves hold at most \`cap\` points.
interface Box { x: number; y: number; w: number; h: number }
class QuadTree {
  points: { x: number; y: number }[] = [];
  kids: QuadTree[] = [];
  constructor(private box: Box, private cap = 4) {}
  insert(p: { x: number; y: number }): boolean {
    if (!contains(this.box, p)) return false;
    if (this.kids.length === 0 && this.points.length < this.cap) {
      this.points.push(p);
      return true;
    }
    if (this.kids.length === 0) this.split();
    return this.kids.some((k) => k.insert(p));
  }
  private split() {
    const { x, y, w, h } = this.box;
    const [hw, hh] = [w / 2, h / 2];
    this.kids = [
      new QuadTree({ x, y, w: hw, h: hh }, this.cap),
      new QuadTree({ x: x + hw, y, w: hw, h: hh }, this.cap),
      new QuadTree({ x, y: y + hh, w: hw, h: hh }, this.cap),
      new QuadTree({ x: x + hw, y: y + hh, w: hw, h: hh }, this.cap),
    ];
    this.points.splice(0).forEach((p) => this.insert(p));
  }
}
const contains = (b: Box, p: { x: number; y: number }) =>
  p.x >= b.x && p.x < b.x + b.w && p.y >= b.y && p.y < b.y + b.h;`,
  },
  usedBy: [
    {
      company: "Uber",
      product: "H3 spatial index (hex grid)",
      usage:
        'Uber indexes the world with a hierarchical cell system so "drivers near me" is a cell lookup, not a distance scan over everyone.',
      href: "https://www.uber.com/blog/h3/",
    },
    {
      company: "Google",
      product: "S2 geometry / Maps tiling",
      usage:
        "S2 recursively subdivides the sphere into cells, the same hierarchical-space idea used for map tiles and region queries.",
      href: "http://s2geometry.io/",
    },
    {
      company: "PostgreSQL / PostGIS",
      product: "Spatial indexes",
      usage:
        "R-tree/GiST spatial indexes prune bounding boxes so range and nearest-neighbour queries touch few rows.",
      href: "https://postgis.net/workshops/postgis-intro/indexing.html",
    },
  ],
  references: [
    {
      label: "Uber Engineering — H3 hexagonal hierarchical spatial index",
      href: "https://www.uber.com/blog/h3/",
    },
    { label: "S2 Geometry — hierarchical cell decomposition", href: "http://s2geometry.io/" },
  ],
};
