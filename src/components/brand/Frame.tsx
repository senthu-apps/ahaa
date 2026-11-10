import type { ReactNode } from "react";

/**
 * Plate + ink corner brackets — the hero tile language, used as a selection
 * frame around illustration mocks (fixed-price cards, service demos).
 */
export function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-[9px] rounded-[22px] bg-[#ececef] shadow-[0_0_0_1px_#e0e0e5]" />
      <span aria-hidden className="fp-bracket fp-bracket-tl" />
      <span aria-hidden className="fp-bracket fp-bracket-tr" />
      <span aria-hidden className="fp-bracket fp-bracket-bl" />
      <span aria-hidden className="fp-bracket fp-bracket-br" />
      <div className="relative">{children}</div>
    </div>
  );
}
