import Link from "next/link";
import { Wordmark } from "@/components/brand/LogoMark";
import { Footer } from "@/components/v2/sections/Footer";
import type { LegalBlock, LegalDoc } from "./legal-content";
import { LegalToc } from "./LegalToc";

const Block = ({ b }: { b: LegalBlock }) =>
  typeof b === "string" ? (
    <p>{b}</p>
  ) : (
    <ul className="grid list-disc gap-2 pl-5 marker:text-signal">
      {b.list.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );

/** /privacy and /terms — a plain reading page in the site's tokens, with the landing footer. */
export function LegalPage({ doc, other }: { doc: LegalDoc; other: { label: string; href: string } }) {
  return (
    <>
      <header className="border-b border-line bg-canvas">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-3 px-5 md:px-8">
          <Link href="/" aria-label="AI Weavers home" className="shrink-0 rounded-lg">
            <Wordmark />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-lg px-3 py-2 text-[0.9rem] text-graphite hover:bg-white hover:text-ink">
              Back to home
            </Link>
            <Link href="/#book" className="btn btn-ghost">
              Book an audit
            </Link>
          </div>
        </div>
      </header>

      <main id="main" className="bg-canvas">
        <article className="mx-auto max-w-[1200px] px-5 pb-24 pt-16 md:px-8 md:pt-24">
          <div className="lg:grid lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-10">
                <p className="text-[0.8125rem] font-medium text-muted">Legal</p>
                <h1 className="mt-3 text-balance text-[2.25rem] font-medium leading-[1.1] tracking-[-0.02em] text-ink md:text-[3rem]">
                  {doc.title}
                </h1>
                <p className="mt-4 text-[0.875rem] text-muted">Last updated {doc.updated}</p>
                <LegalToc sections={doc.sections.map(({ id, heading }) => ({ id, heading }))} />
              </div>
            </div>

            <div className="mt-12 max-w-[68ch] lg:col-span-8 lg:mt-0">
              <p className="text-pretty text-[1.125rem] leading-[1.65] text-ink">{doc.intro}</p>
              {doc.sections.map((s) => (
                <section key={s.id} id={s.id} className="scroll-mt-10 border-t border-line pt-8 mt-10">
                  <h2 className="text-[1.25rem] font-medium tracking-[-0.01em] text-ink">{s.heading}</h2>
                  <div className="mt-4 grid gap-4 text-pretty text-[1rem] leading-[1.7] text-graphite">
                    {s.body.map((b, i) => (
                      <Block key={i} b={b} />
                    ))}
                  </div>
                </section>
              ))}
              <p className="mt-14 border-t border-line pt-8 text-[0.9375rem] text-graphite">
                See also our{" "}
                <Link href={other.href} className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-signal">
                  {other.label}
                </Link>
                .
              </p>
            </div>
          </div>
        </article>
      </main>
      <Footer base="/" />
    </>
  );
}
