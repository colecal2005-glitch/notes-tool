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
            that flop. Paste a URL, generate, copy. Done.
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
              SpaceX IPO: Why the $2 Trillion Valuation Doesn&apos;t Add Up
            </p>
            <p className="text-neutral-500 text-xs">substack.com</p>
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
                src="https://substackcdn.com/image/fetch/$s_!opde!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fda8c6853-ad00-4e9b-bb85-b075b11f1b85_2501x2108.png"
                alt=""
                className="w-full rounded-md mb-4 object-cover max-h-48"
              />
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
                Stat drop + cold read
              </p>
              <p className="text-base text-neutral-900 leading-relaxed whitespace-pre-wrap">{`SpaceX is targeting a valuation higher than Meta, Broadcom, and Berkshire Hathaway.

While posting lower revenues than Macy's.

The bankers are justifying this by claiming SpaceX's total addressable market is the entire U.S. economy. All $28 trillion of it. Including an assumption that every household on earth switches to Starlink for WiFi.

Starlink is a great business. The rest of this filing reads like an ayahuasca trip. New post breaks down what the numbers actually say.`}</p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
                Thesis with conviction
              </p>
              <p className="text-base text-neutral-900 leading-relaxed whitespace-pre-wrap">{`SpaceX does not price at $2 trillion.

Starlink? Genuinely one of the great businesses of our era. $3.3 billion in revenue in a single quarter. 36% margins. No real competitor.

But stapled onto that is xAI, which burned through $12.7 billion in capex last year. More than they spent building rockets or satellites.

Musk knows the only way this gets to $2 trillion is if it becomes a meme stock. He's making 30% of shares available to retail for a reason.

The number that actually holds up: $600 billion.`}</p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://substackcdn.com/image/fetch/$s_!cD9V!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F71bd7804-9af2-4be4-bb14-6dfc8644d8a1_2501x1831.png"
                alt=""
                className="w-full rounded-md mb-4 object-cover max-h-48"
              />
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
                Scene snap + pivot
              </p>
              <p className="text-base text-neutral-900 leading-relaxed whitespace-pre-wrap">{`The SpaceX S-1 opens with 14 pages of rocket photos.

A direct quote from the filing: "We do not want humans to have the same fate as dinosaurs."

That is the document you are being asked to value at $1.75 trillion.

For context, when Google went public it was growing 240% and traded at 10x trailing revenue. SpaceX wants 94x while growing at 33%.

The bond market just hit yields not seen since 2007. The escape hatch that stopped Trump's tariffs is gone. And retail investors are being handed 30% of the SpaceX float.

All of this is connected. Full breakdown in this week's post.`}</p>
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
