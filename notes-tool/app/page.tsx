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
            <p className="font-semibold text-neutral-900 text-base mb-2">
              Why I quit my agency to write a Substack full-time
            </p>
            <p className="text-neutral-600 text-sm leading-relaxed">
              A personal essay about leaving a $180K/yr job to write online — covers the
              financial math, the fear, and the first 90 days.
            </p>
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
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
                Hook + curiosity gap
              </p>
              <p className="text-base text-neutral-900 leading-relaxed">
                Six months ago I was making $180K running other people&apos;s marketing. Today
                I make $4K writing a newsletter. The weird part isn&apos;t the pay cut. It&apos;s
                that I&apos;d do it again tomorrow.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
                Contrarian take
              </p>
              <p className="text-base text-neutral-900 leading-relaxed">
                Everyone says &quot;don&apos;t quit your job to write.&quot; I think that&apos;s backwards.
                The job was the thing killing my writing. The risk wasn&apos;t quitting — the
                risk was staying.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
                Question to readers
              </p>
              <p className="text-base text-neutral-900 leading-relaxed">
                Genuine question for anyone who&apos;s gone full-time on their newsletter: what&apos;s
                the thing nobody warned you about? Not the money stuff. The other stuff.
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
