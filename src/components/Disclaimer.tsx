export default function Disclaimer() {
  return (
    <div className="mx-4 sm:mx-8 mb-4 rounded-xl border border-warn/30 bg-warn/5 px-4 py-3 text-xs text-warn/90 leading-relaxed">
      This is not the police and not a government website. It's an independent guide to help you understand
      what happened and where to report it. Nothing you do here is tracked to you — no accounts, no personal
      data stored. Helpline numbers/links are being verified; always confirm on{" "}
      <a
        href="https://cybercrime.gov.in"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-warn"
      >
        cybercrime.gov.in
      </a>{" "}
      if unsure.
    </div>
  );
}
