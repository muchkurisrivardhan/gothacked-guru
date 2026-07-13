import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ScamNode, ComplaintChannel } from "../types";
import VerificationBadge from "./VerificationBadge";
import { useViewCount } from "../hooks/useViewCount";
import { CATEGORY_COLOR } from "./TreeGraph";
import { findPathToNode } from "../data/scams";
import { STATE_CYBER_CELLS } from "../data/stateCyberCells";
import StateDropdown from "./StateDropdown";

interface Props {
  node: ScamNode | null;
  onClose: () => void;
}

const CHANNEL_LABEL: Record<ComplaintChannel["type"], string> = {
  helpline: "Call",
  portal: "Website",
  app: "App",
  "in-person": "In person",
  email: "Email",
};

// Matches full http(s) URLs and bare Indian gov/org portal domains in prose.
const URL_RE = /(https?:\/\/[^\s)]+|(?:[a-z0-9-]+\.)+(?:gov|nic|org|co)\.in(?:\/[^\s),]*)?)/g;

function Linkify({ text }: { text: string }) {
  const parts = text.split(URL_RE);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <a
            key={i}
            href={p.startsWith("http") ? p : `https://${p}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-signal underline underline-offset-2 hover:text-white break-all"
          >
            {p}
          </a>
        ) : (
          p
        )
      )}
    </>
  );
}

function channelHref(c: ComplaintChannel): string | null {
  if (c.type === "helpline") {
    // Only single plain numbers ("1930") — not compounds like "112 / 100".
    return /^[+\d][\d\s-]*$/.test(c.value) ? `tel:${c.value.replace(/\D/g, "")}` : null;
  }
  if (c.type === "email") return `mailto:${c.value}`;
  if (c.type === "portal") return c.value.startsWith("http") ? c.value : `https://${c.value}`;
  return null;
}

function accentColorFor(node: ScamNode): string {
  const path = findPathToNode(node.id);
  const category = path?.[path.length - 2];
  return (category && CATEGORY_COLOR[category.id]) || "#3ddc84";
}

export default function ScamDetailPanel({ node, onClose }: Props) {
  useViewCount(node?.detail ? node.id : null);
  const accent = node ? accentColorFor(node) : "#3ddc84";
  const [stateName, setStateName] = useState("");
  const stateCell = STATE_CYBER_CELLS.find((s) => s.state === stateName);

  return (
    <AnimatePresence>
      {node && node.detail && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />
          <motion.div
            key={node.id}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[520px] bg-panel border-l border-line z-50 overflow-y-auto"
          >
            <div
              className="sticky top-0 h-[3px] z-20"
              style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
            />
            <div className="sticky top-[3px] bg-panel/95 backdrop-blur border-b border-line px-5 sm:px-6 py-4 flex items-start justify-between gap-4 z-10">
              <div>
                <h2 className="text-lg font-semibold text-white leading-snug">{node.title}</h2>
                <div className="mt-2">
                  <VerificationBadge verified={node.detail.verified} />
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-ghost hover:text-white text-2xl leading-none px-2 transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="px-5 sm:px-6 py-6 space-y-8">
              <RevealSection index={0}>
                <p className="text-sm text-ghost leading-relaxed">{node.summary}</p>
              </RevealSection>

              <RevealSection index={1} title="This is a scam if...">
                <ul className="space-y-2">
                  {node.detail.warningSigns.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-200">
                      <span className="text-warn shrink-0">▸</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </RevealSection>

              <RevealSection index={2} title="Do this right now">
                <ol className="space-y-3">
                  {node.detail.immediateSteps.map((step, i) => (
                    <li key={i} className="text-sm">
                      <div className="flex gap-2 text-white font-medium">
                        <span className="text-signal font-mono">{i + 1}.</span>
                        <span>{step.title}</span>
                      </div>
                      <p className="text-ghost mt-1 pl-5"><Linkify text={step.detail} /></p>
                    </li>
                  ))}
                </ol>
              </RevealSection>

              <RevealSection index={3} title="Evidence to gather before you file">
                <ul className="space-y-2">
                  {node.detail.evidenceToGather.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-200">
                      <span className="text-signal shrink-0">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </RevealSection>

              <RevealSection index={4} title="How to file your complaint">
                <ol className="space-y-3">
                  {node.detail.howToFile.map((step, i) => (
                    <li key={i} className="text-sm">
                      <div className="flex gap-2 text-white font-medium">
                        <span className="text-signal font-mono">{i + 1}.</span>
                        <span>{step.title}</span>
                      </div>
                      <p className="text-ghost mt-1 pl-5"><Linkify text={step.detail} /></p>
                    </li>
                  ))}
                </ol>
              </RevealSection>

              {node.detail.realCase && (
                <RevealSection index={5} title="This has actually happened">
                  <div className="relative border border-line rounded-xl px-4 py-3 bg-ink/40">
                    <div
                      className="absolute -top-px left-3 right-3 h-[2px] rounded-full opacity-90"
                      style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
                    />
                    <p className="text-sm text-gray-200 leading-relaxed">{node.detail.realCase.summary}</p>
                    <p className="text-ghost/70 text-[11px] mt-2">{node.detail.realCase.source}</p>
                  </div>
                </RevealSection>
              )}

              <RevealSection index={6} title="Where to go">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-ghost shrink-0">Show:</span>
                  <StateDropdown
                    value={stateName}
                    onChange={setStateName}
                    options={[
                      { value: "", label: "National only" },
                      ...STATE_CYBER_CELLS.map((s) => ({ value: s.state, label: s.state })),
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  {node.detail.channels.map((c, i) => {
                    if (c.locationAware && stateCell) {
                      return (
                        <div key={i} className="relative border border-line rounded-xl px-4 py-3 bg-ink/40">
                          <div
                            className="absolute -top-px left-3 right-3 h-[2px] rounded-full opacity-90"
                            style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
                          />
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-white">
                              State Cyber Cell — {stateCell.state}
                            </span>
                            <VerificationBadge verified={stateCell.verified} />
                          </div>
                          <a
                            href={`tel:${stateCell.phone.replace(/\D/g, "")}`}
                            className="block text-signal font-mono text-sm mt-1 underline underline-offset-2 hover:text-white"
                          >
                            {stateCell.phone}
                          </a>
                          <a
                            href={`mailto:${stateCell.email}`}
                            className="block text-signal font-mono text-xs mt-0.5 break-all underline underline-offset-2 hover:text-white"
                          >
                            {stateCell.email}
                          </a>
                          {stateCell.portal && (
                            <a
                              href={stateCell.portal.startsWith("http") ? stateCell.portal : `https://${stateCell.portal}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-signal font-mono text-xs mt-0.5 break-all underline underline-offset-2 hover:text-white"
                            >
                              {stateCell.portal}
                            </a>
                          )}
                          <p className="text-ghost text-xs mt-1.5">{stateCell.address}</p>
                          <p className="text-ghost/70 text-[11px] mt-2 border-t border-line pt-2">{stateCell.note}</p>
                        </div>
                      );
                    }
                    return (
                      <div key={i} className="relative border border-line rounded-xl px-4 py-3 bg-ink/40">
                        <div
                          className="absolute -top-px left-3 right-3 h-[2px] rounded-full opacity-90"
                          style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
                        />
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-white">{c.name}</span>
                          <span className="text-[10px] font-mono uppercase tracking-wide text-signal border border-signal/30 rounded-full px-2 py-0.5 shrink-0">
                            {CHANNEL_LABEL[c.type]}
                          </span>
                        </div>
                        {channelHref(c) ? (
                          <a
                            href={channelHref(c)!}
                            target={c.type === "portal" ? "_blank" : undefined}
                            rel={c.type === "portal" ? "noopener noreferrer" : undefined}
                            className="block text-signal font-mono text-sm mt-1 underline underline-offset-2 hover:text-white break-all"
                          >
                            {c.value}
                          </a>
                        ) : (
                          <div className="text-signal font-mono text-sm mt-1">{c.value}</div>
                        )}
                        {c.note && <p className="text-ghost text-xs mt-1"><Linkify text={c.note} /></p>}
                      </div>
                    );
                  })}
                </div>
              </RevealSection>

              <RevealSection index={7}>
                <p className="text-[11px] text-ghost/70 leading-relaxed border-t border-line pt-4">
                  Helpline numbers and portal links here are compiled from public information and marked
                  "needs verification" until independently confirmed. Please cross-check on{" "}
                  <a
                    href="https://cybercrime.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ghost underline underline-offset-2 hover:text-white"
                  >
                    cybercrime.gov.in
                  </a>{" "}
                  before relying on them. This site does
                  not store your name, contact details, or what you searched for.
                </p>
              </RevealSection>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function RevealSection({
  index,
  title,
  children,
}: {
  index: number;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.06 + index * 0.07, ease: [0.22, 1.15, 0.36, 1] }}
    >
      {title && <h3 className="text-xs font-mono uppercase tracking-wider text-ghost mb-3">{title}</h3>}
      {children}
    </motion.div>
  );
}
