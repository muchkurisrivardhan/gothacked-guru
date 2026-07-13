import { useEffect, useMemo, useRef, useState } from "react";
import { hierarchy, tree as d3tree, type HierarchyPointNode } from "d3-hierarchy";
import { motion } from "framer-motion";
import type { ScamNode } from "../types";
import { SCAM_TREE, findPathToNode } from "../data/scams";

interface Props {
  expanded: Set<string>;
  onToggle: (node: ScamNode) => void;
  onOpenLeaf: (node: ScamNode) => void;
  selectedLeafId: string | null;
}

interface VNode {
  raw: ScamNode;
  children?: VNode[];
}

const NODE_H = 46;
const NODE_W = 252;
const R = 6.5;
const PAD = 46;
const DIM_OPACITY = 0.28;

function toVisible(node: ScamNode, expanded: Set<string>): VNode {
  const hasChildren = !!node.children?.length;
  const open = expanded.has(node.id);
  return {
    raw: node,
    children: hasChildren && open ? node.children!.map((c) => toVisible(c, expanded)) : undefined,
  };
}

export const CATEGORY_COLOR: Record<string, string> = {
  "cat-blackmail": "#ff5d6c",
  "cat-impersonation": "#ffb84d",
  "cat-financial": "#33d6c0",
  "cat-opportunity": "#6ea8fe",
  "cat-romance": "#e879f9",
};
const ROOT_COLOR = "#e6edf3";

function colorFor(n: HierarchyPointNode<VNode>): string {
  const ancestors = n.ancestors(); // [self, ..., root]
  const topCategory = ancestors[ancestors.length - 2]; // depth-1 node, undefined if n is root
  if (!topCategory) return ROOT_COLOR;
  return CATEGORY_COLOR[topCategory.data.raw.id] ?? ROOT_COLOR;
}

function pathSet(id: string | null): Set<string> | null {
  if (!id) return null;
  const path = findPathToNode(id);
  return path ? new Set(path.map((n) => n.id)) : null;
}

export default function TreeGraph({ expanded, onToggle, onOpenLeaf, selectedLeafId }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [containerW, setContainerW] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerW(el.clientWidth));
    ro.observe(el);
    setContainerW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const { nodes, links, width, height, pos } = useMemo(() => {
    const rootHierarchy = hierarchy<VNode>(toVisible(SCAM_TREE, expanded), (d) => d.children);
    const layout = d3tree<VNode>().nodeSize([NODE_H, NODE_W])(rootHierarchy);
    const allNodes = layout.descendants();
    const allLinks = layout.links();

    const xs = allNodes.map((n) => n.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...allNodes.map((n) => n.y));

    const w = maxY + NODE_W + PAD * 2;
    const h = maxX - minX + PAD * 2;

    const p = (n: HierarchyPointNode<VNode>) => ({ x: n.y + PAD, y: n.x - minX + PAD });

    return { nodes: allNodes, links: allLinks, width: w, height: h, pos: p };
  }, [expanded]);

  const selPath = useMemo(() => pathSet(selectedLeafId), [selectedLeafId]);
  const hovPath = useMemo(() => pathSet(hoveredId), [hoveredId]);

  // Horizontal placement of the tree:
  //  - Root closed (only "What happened?"): center the root itself on the page.
  //  - Root open: center the whole block, so the root sits left-of-center and the
  //    notes fan out to the right — the composition stays balanced in the middle.
  //  - Tree wider than the page: dx=0, so it left-aligns and scrolls.
  // The CSS transition animates the shift, so clicking the root glides it left.
  const rootOpen = expanded.has("root");
  const dx =
    containerW === 0
      ? 0
      : rootOpen
        ? Math.max(0, (containerW - width) / 2)
        : Math.max(0, containerW / 2 - PAD);

  useEffect(() => {
    if (!selectedLeafId || !scrollRef.current) return;
    const el = scrollRef.current.querySelector(`[data-node-id="${CSS.escape(selectedLeafId)}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "center" });
  }, [selectedLeafId, expanded]);

  return (
    <div
      ref={scrollRef}
      // ponytail: no fixed-height box. The SVG grows to its natural size and the
      // page itself scrolls, so every expanded branch and its sub-nodes stay
      // visible across the whole page instead of clipped inside a panel.
      // overflow-x-auto keeps horizontal scroll only for branches deeper than
      // the viewport is wide; the height is auto, so vertical never clips.
      className="w-full overflow-x-auto py-2"
    >
      <div
        style={{
          width,
          transform: `translateX(${dx}px)`,
          transition: "transform .45s cubic-bezier(.22,1,.36,1)",
        }}
      >
      <svg width={width} height={height} className="block overflow-visible">
        <g>
          {links.map((l, i) => {
            const s = pos(l.source);
            const t = pos(l.target);
            const midX = (s.x + t.x) / 2;
            const d = `M${s.x},${s.y} C${midX},${s.y} ${midX},${t.y} ${t.x},${t.y}`;
            const color = colorFor(l.target);
            const onSel = !!selPath?.has(l.source.data.raw.id) && !!selPath?.has(l.target.data.raw.id);
            const onHov = !!hovPath?.has(l.source.data.raw.id) && !!hovPath?.has(l.target.data.raw.id);
            const stroke = onHov || onSel ? color : "#18212c";
            const strokeWidth = onHov ? 2.2 : onSel ? 2 : 1.5;
            const strokeOpacity = onHov ? 0.95 : onSel ? 0.8 : 1;
            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity}
                strokeLinecap="round"
                strokeDasharray={onHov ? "6 9" : undefined}
                className={onHov ? "dash-flow" : undefined}
                style={{ transition: "stroke .3s, stroke-width .3s, stroke-opacity .3s" }}
              />
            );
          })}
        </g>
        <g>
          {nodes.map((n) => {
            const node = n.data.raw;
            const { x, y } = pos(n);
            const parent = n.parent ? pos(n.parent) : { x, y };
            const hasChildren = !!node.children?.length;
            const isOpen = expanded.has(node.id);
            const isLeaf = !hasChildren;
            const isSelected = selectedLeafId === node.id;
            const isHovered = hoveredId === node.id;
            const color = colorFor(n);
            const comingSoon = !!node.comingSoon;
            const filled = !comingSoon && (isLeaf || isOpen);
            const breathing = hasChildren && !isOpen && !comingSoon;
            const dim = selPath ? (selPath.has(node.id) ? 1 : DIM_OPACITY) : 1;
            const targetOpacity = comingSoon ? 0.45 : dim;
            const labelColor = comingSoon ? "#5a6472" : isSelected || isHovered ? color : hasChildren ? "#e6edf3" : "#aeb9c6";

            return (
              <motion.g
                key={node.id}
                data-node-id={node.id}
                initial={{ x: parent.x, y: parent.y, opacity: 0 }}
                animate={{ x, y, opacity: targetOpacity }}
                whileTap={!comingSoon ? { scale: 0.9 } : undefined}
                transition={{ type: "spring", stiffness: 180, damping: 26 }}
                onClick={() => {
                  if (comingSoon) return;
                  if (hasChildren) onToggle(node);
                  else onOpenLeaf(node);
                }}
                onKeyDown={(e) => {
                  if (comingSoon || (e.key !== "Enter" && e.key !== " ")) return;
                  e.preventDefault();
                  if (hasChildren) onToggle(node);
                  else onOpenLeaf(node);
                }}
                onMouseEnter={() => !comingSoon && setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
                role="button"
                tabIndex={comingSoon ? -1 : 0}
                aria-label={comingSoon ? `${node.shortLabel}, coming soon` : node.shortLabel}
                aria-expanded={hasChildren ? isOpen : undefined}
                style={{ cursor: comingSoon ? "not-allowed" : "pointer", outline: "none" }}
              >
                {breathing && (
                  <motion.circle
                    r={R * 1.7}
                    fill={color}
                    style={{ filter: "blur(3px)", pointerEvents: "none" }}
                    animate={{ opacity: [0.28, 0.8, 0.28], r: [R * 1.7, R * 1.7 * 1.55, R * 1.7] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                {isSelected && (
                  <circle
                    r={R + 7}
                    fill="none"
                    stroke={color}
                    strokeWidth={1.5}
                    style={{ filter: `drop-shadow(0 0 8px ${color})` }}
                  />
                )}
                <circle
                  r={R}
                  fill={filled ? color : "rgba(5,7,10,0.6)"}
                  stroke={comingSoon ? "#3a4552" : color}
                  strokeWidth={2}
                  strokeDasharray={comingSoon ? "2 3" : undefined}
                  style={{
                    filter: filled ? `drop-shadow(0 0 ${isHovered ? 7 : 4}px ${color})` : isHovered ? `drop-shadow(0 0 6px ${color})` : undefined,
                    transition: "filter .2s",
                  }}
                />
                <text
                  x={R + 10}
                  y={4}
                  style={{
                    fill: labelColor,
                    fontSize: node.id === "root" ? 12.5 : 11.5,
                    fontWeight: hasChildren ? 600 : 400,
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.015em",
                    textShadow: (isSelected || isHovered) && !comingSoon ? `0 0 12px ${color}66` : "none",
                    transition: "fill .18s, text-shadow .18s",
                  }}
                >
                  {node.shortLabel}
                  {comingSoon ? "  · soon" : ""}
                </text>
              </motion.g>
            );
          })}
        </g>
      </svg>
      </div>
    </div>
  );
}
