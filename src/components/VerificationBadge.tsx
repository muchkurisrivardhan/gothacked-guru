export default function VerificationBadge({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide text-signal border border-signal/40 bg-signal/10 rounded-full px-2.5 py-1">
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide text-warn border border-warn/40 bg-warn/10 rounded-full px-2.5 py-1">
      Needs verification
    </span>
  );
}
