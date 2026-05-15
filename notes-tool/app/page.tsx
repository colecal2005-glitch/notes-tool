export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090B] text-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">

        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Orange radial glow from below */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_110%,rgba(255,103,25,0.18),transparent)]" />

        <div className="relative max-w-[680px] mx-auto px-6 pt-32 pb-24 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-[#FF6719]/30 bg-[#FF6719]/10 text-[#FF9A6C] text-xs font-semibold px-4 py-1.5 rounded-full mb-10 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6719] animate-pulse inline-block" />
            Early access open
          </div>

          {/* Gradient headline */}
          <h1
            className="text-6xl md:text-7xl leading-[1.05] tracking-tight mb-7"
            style={{
              fontFamily: "var(--font-serif)",
              background: "linear-gradient(135deg, #FFFFFF 20%, #FFBA94 60%, #FF6719 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            10 great Substack Notes from any post. In 30 seconds.
          </h1>

          <p className="text-lg text-white/55 leading-relaxed mb-10 max-w-md mx-auto">
            You spent 6 hours on the post. Don&apos;t spend another hour on Notes that flop.
            Paste, generate, copy — done.
          </p>

          {/* Form */}
          <form id="signup" className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-4">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 text-sm bg-white/8 border border-white/15 rounded-lg placeholder-white/25 text-white focus:outline-none focus:border-[#FF6719]/50 focus:ring-1 focus:ring-[#FF6719]/30 transition-all"
            />
            <button
              type="submit"
              className="px-6 py-3 text-sm font-semibold rounded-lg text-white whitespace-nowrap transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #FF6719 0%, #e04f0a 100%)",
                boxShadow: "0 0 28px rgba(255,103,25,0.45), 0 1px 3px rgba(0,0,0,0.5)",
              }}
            >
              Get early access — $19/mo
            </button>
          </form>

          <p className="text-xs text-white/25 tracking-wide">No spam. Cancel anytime.</p>

          {/* Stat strip */}
          <div className="flex items-center justify-center gap-10 mt-14 pt-14 border-t border-white/8">
            {[
              { value: "10", label: "Note formats" },
              { value: "30s", label: "Generation time" },
              { value: "$19", label: "Per month, flat" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p
                  className="text-3xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #fff, #FF9A6C)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {value}
                </p>
                <p className="text-xs text-white/35 mt-1 tracking-wide">{label}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Example section ── */}
      <section className="bg-[#0E0E11] border-t border-white/5 py-24 px-6">
        <div className="max-w-[680px] mx-auto">

          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF6719] mb-3 text-center">
            See it in action
          </p>
          <h2
            className="text-3xl font-bold text-center text-white mb-16"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Real post. Real Notes. 30 seconds.
          </h2>

          {/* Source post */}
          <div
            className="rounded-xl p-6 mb-5 border border-white/10"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,103,25,0.1), rgba(255,103,25,0.02))",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF6719]/60 mb-3">
              Source post
            </p>
            <p className="font-semibold text-white text-base mb-2">
              Why I quit my agency to write a Substack full-time
            </p>
            <p className="text-white/45 text-sm leading-relaxed">
              A personal essay about leaving a $180K/yr job to write online — covers the financial
              math, the fear, and the first 90 days.
            </p>
          </div>

          {/* Connector */}
          <div className="flex flex-col items-center gap-1 mb-5">
            <div className="w-px h-6 bg-white/10" />
            <span className="text-xs text-white/25 px-3 py-1 border border-white/10 bg-white/5 rounded-full">
              10 Notes generated
            </span>
            <div className="w-px h-6 bg-white/10" />
          </div>

          {/* Note cards */}
          <div className="flex flex-col gap-3">

            <div
              className="bg-[#14141A] border border-white/10 hover:border-[#FF6719]/35 rounded-xl p-6 transition-all"
              style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-[#FF6719] mb-3">
                Hook + curiosity gap
              </p>
              <p className="text-white/75 text-sm leading-relaxed">
                Six months ago I was making $180K running other people&apos;s marketing. Today I make $4K
                writing a newsletter. The weird part isn&apos;t the pay cut. It&apos;s that I&apos;d do it again tomorrow.
              </p>
            </div>

            <div
              className="bg-[#14141A] border border-white/10 hover:border-[#FF6719]/35 rounded-xl p-6 transition-all"
              style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-[#FF6719] mb-3">
                Contrarian take
              </p>
              <p className="text-white/75 text-sm leading-relaxed">
                Everyone says &quot;don&apos;t quit your job to write.&quot; I think that&apos;s backwards.
                The job was the thing killing my writing. The risk wasn&apos;t quitting — the risk was staying.
              </p>
            </div>

            <div
              className="bg-[#14141A] border border-white/10 hover:border-[#FF6719]/35 rounded-xl p-6 transition-all"
              style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-[#FF6719] mb-3">
                Question to readers
              </p>
              <p className="text-white/75 text-sm leading-relaxed">
                Genuine question for anyone who&apos;s gone full-time on their newsletter: what&apos;s the thing
                nobody warned you about? Not the money stuff. The other stuff.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="relative overflow-hidden border-t border-white/5 py-24 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_0%,rgba(255,103,25,0.13),transparent)]" />
        <div className="relative max-w-[640px] mx-auto text-center">
          <h2
            className="text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Ready to stop dreading Notes?
          </h2>
          <p className="text-white/40 mb-10 text-sm">Join writers already on the waitlist.</p>
          <a
            href="#signup"
            className="inline-block px-8 py-3.5 text-sm font-semibold rounded-lg text-white transition-all hover:brightness-110"
            style={{
              background: "linear-gradient(135deg, #FF6719 0%, #e04f0a 100%)",
              boxShadow: "0 0 40px rgba(255,103,25,0.35)",
            }}
          >
            Get early access — $19/mo
          </a>
          <p className="text-xs text-white/20 mt-5 tracking-wide">No spam. Cancel anytime.</p>
        </div>
      </section>

    </main>
  );
}
