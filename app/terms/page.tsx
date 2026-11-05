import { TERMS_LAST_UPDATED, TERMS_VERSION, termsSections } from '@/lib/terms';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 dark:border-white/10 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
          Version {TERMS_VERSION} · Last updated {TERMS_LAST_UPDATED}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Terms and Conditions
        </h1>
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
          <strong>Important:</strong> These terms are a general service document, not legal advice or a
          certification of compliance with every country’s laws. Laws and age, privacy, health, and
          consumer protections differ by location. The operator should obtain qualified legal review
          for each intended market and publish official contact and privacy details before public
          launch. Nothing here removes rights that cannot legally be waived.
        </div>
        <div className="mt-8 space-y-8">
          {termsSections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
