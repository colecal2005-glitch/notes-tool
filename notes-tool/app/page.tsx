import { createSupabaseServerClient } from "@/lib/supabase/server";
import GenerateForm from "./components/GenerateForm";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return (
      <main className="flex-1 bg-white">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="mb-10">
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-2">
              Generate Notes
            </h1>
            <p className="text-base text-neutral-600">
              Paste a post URL to get 3 ready-to-publish Notes.
            </p>
          </div>
          <GenerateForm />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-white">

      {/* Hero */}
      <section className="border-b border-neutral-100 py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-neutral-900 mb-6">
            3 great Substack Notes from any post. In 30 seconds.
          </h1>
          <p className="text-xl text-neutral-600 mb-10 max-w-lg">
            You spent 6 hours on the post. Don&apos;t spend another hour on Notes
            that flop. Paste a URL, generate, copy — done.
          </p>
          <GenerateForm />
        </div>
      </section>

      {/* Example output */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
            Example output
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-16">
            Real post. Real Notes.
          </h2>

          {/* Source post */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
              Source post
            </p>
            <p className="font-semibold text-neutral-900 text-base mb-1">
              10x Volatility Edge: Bitcoin — The Four
            </p>
            <p className="text-neutral-500 text-xs">10x Research · post.10xresearch.com</p>
          </div>

          <div className="flex flex-col items-center gap-1 mb-6">
            <div className="w-px h-5 bg-neutral-200" />
            <span className="text-xs text-neutral-500 px-3 py-1 border border-neutral-200 bg-white rounded-full">
              3 Notes generated
            </span>
            <div className="w-px h-5 bg-neutral-200" />
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://substackcdn.com/image/fetch/$s_!neCj!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8a3afdd6-dc45-4205-affa-a89151e63847_1041x589.png"
                alt=""
                className="w-full rounded-md mb-4 object-cover max-h-48"
              />
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
                Stat drop + curiosity gap
              </p>
              <p className="text-base text-neutral-900 leading-relaxed">
                Bitcoin&apos;s aggregate gamma exposure hit -$3.2 billion at the $82,000 strike.
                {" "}That number has been sitting there since mid-January, suppressing every rally,
                cushioning every dip, and producing the exact sideways chop that&apos;s frustrated
                traders for months.
                {"\n\n"}It doesn&apos;t stay there forever. Two expiry dates change the math entirely
                — and when they clear, the mechanical drag disappears with them.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://substackcdn.com/image/fetch/$s_!aOef!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0bc2ebdc-4da0-40c5-8590-d268d7c63a18_1081x604.png"
                alt=""
                className="w-full rounded-md mb-4 object-cover max-h-48"
              />
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
                Contrarian read
              </p>
              <p className="text-base text-neutral-900 leading-relaxed">
                Daily Bitcoin option volume collapsed from $7.6 billion to $2.1 billion.
                {"\n\n"}Most people read that as fear. It&apos;s the opposite. An exhausted hedging
                community that has largely finished selling. The wall of supply is thinning.
                {"\n\n"}When the remaining hedgers are forced to cover — by price, by expiry, by
                catalyst — there&apos;s less and less offsetting flow to absorb the move.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://substackcdn.com/image/fetch/$s_!SOw8!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffc5dacf7-43ef-4774-8808-0998aeed23df_1069x597.png"
                alt=""
                className="w-full rounded-md mb-4 object-cover max-h-48"
              />
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
                Setup reveal
              </p>
              <p className="text-base text-neutral-900 leading-relaxed">
                The consensus view embedded in Bitcoin&apos;s options book right now: sideways to lower.
                {"\n\n"}Net skew across all expiries is negative. Call overwriting for yield is the
                dominant institutional trade. Put implied volatility still trades at a premium to calls.
                {"\n\n"}The market is positioned defensively into a week with two catalysts that could
                force every one of those hedges to unwind at once.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-8 px-6">
        <div className="max-w-5xl mx-auto text-sm text-neutral-500">
          © {new Date().getFullYear()} Note Factory
        </div>
      </footer>

    </main>
  );
}
