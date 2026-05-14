export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          Turn your Substack post into 10 great Notes in 30 seconds
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto">
          You spent 6 hours writing the post. Don&apos;t spend another hour writing Notes that flop.
          Paste your post, get 10 Notes in 10 formats, copy the ones you&apos;d actually publish.
        </p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-3">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            Get early access — $19/mo
          </button>
        </form>
        <p className="text-sm text-gray-400">No spam. Cancel anytime.</p>
      </section>

      {/* Example section */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">Here&apos;s what it looks like</h2>
          <p className="text-center text-gray-500 mb-10">Real post → real Notes, in seconds</p>

          {/* Source post */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Source post</p>
            <p className="font-semibold text-lg mb-2">Why I quit my agency to write a Substack full-time</p>
            <p className="text-gray-500 text-sm">
              A personal essay about leaving a $180K/yr job to write online — covers the financial math, the fear, and the first 90 days.
            </p>
          </div>

          <div className="text-center text-gray-300 text-2xl mb-6">↓</div>

          {/* Sample Notes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-500 mb-3">Hook + curiosity gap</p>
              <p className="text-gray-800 text-sm leading-relaxed">
                Six months ago I was making $180K running other people&apos;s marketing. Today I make $4K writing a newsletter. The weird part isn&apos;t the pay cut. It&apos;s that I&apos;d do it again tomorrow.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-500 mb-3">Contrarian take</p>
              <p className="text-gray-800 text-sm leading-relaxed">
                Everyone says &quot;don&apos;t quit your job to write.&quot; I think that&apos;s backwards. The job was the thing killing my writing. The risk wasn&apos;t quitting — the risk was staying.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-500 mb-3">Question to readers</p>
              <p className="text-gray-800 text-sm leading-relaxed">
                Genuine question for anyone who&apos;s gone full-time on their newsletter: what&apos;s the thing nobody warned you about? Not the money stuff. The other stuff.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to stop dreading Notes?</h2>
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-3">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            Get early access
          </button>
        </form>
        <p className="text-sm text-gray-400">$19/mo · No spam · Cancel anytime</p>
      </section>

    </main>
  );
}
