import {
  Info,
  Heart,
  Code,
  Users,
  ArrowLeft,
  Crown,
  Send,
  Sparkles,
} from 'lucide-react';
import { useRouter } from '../router';
import SEO from './SEO';

export default function About() {
  const { navigate } = useRouter();

  return (
    <>
      <SEO
        title="About - CamCut | camcut.fun"
        description="Learn about CamCut, the free short-form video editor for creating viral clips in seconds."
        keywords="about camcut, video editor, short-form video creator"
        url="https://camcut.fun/about"
      />

      <div className="min-h-screen bg-primary">
        {/* Header */}
        <section className="pt-16 pb-8 sm:pt-20 sm:pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-secondary hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to home</span>
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-secondary border border-theme rounded-full px-3 py-1.5 text-sm font-medium text-primary shadow-theme-sm mb-4">
                <Info className="w-4 h-4 text-[var(--accent-main)]" />
                <span>About CamCut</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-primary font-outfit mb-4">
                Making Video Editing{' '}
                <span className="text-[var(--accent-main)]">simple</span>
              </h1>

              <p className="text-base sm:text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
                CamCut is a free, no-signup video editor designed for creators who want to make viral short-form content quickly and easily.
              </p>
            </div>
          </div>
        </section>
 

        {/* Features highlight */}
        <section className="py-8 sm:py-10 border-t border-theme bg-primary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-black text-primary font-outfit mb-6 text-center">
              What makes us different
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  icon: Heart,
                  title: 'Free forever',
                  description: 'No subscriptions, no watermarks, no hidden fees.',
                },
                {
                  icon: Code,
                  title: 'No signup required',
                  description: 'Start creating immediately. No account needed.',
                },
                {
                  icon: Users,
                  title: 'Built for creators',
                  description: 'Designed with short-form content in mind.',
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="rounded-lg border border-theme bg-secondary p-5 shadow-theme-sm hover:shadow-theme-md transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-lg bg-tertiary border border-theme flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-[var(--accent-main)]" />
                    </div>
                    <h3 className="text-base font-bold text-primary font-outfit mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-secondary text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Creator */}
        <section className="py-10 sm:py-12 border-t border-theme bg-secondary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-lg opacity-50" />

              <div className="relative rounded-3xl border border-theme bg-primary p-6 sm:p-8 shadow-theme-md">
                <div className="grid lg:grid-cols-3 gap-8 items-center">
                  <div className="text-center lg:text-left">
                    <div className="relative mb-5">
                      <div className="w-32 h-32 rounded-full mx-auto lg:mx-0 bg-gradient-to-br from-[var(--accent-main)] to-secondary flex items-center justify-center shadow-theme-md border border-theme">
                        <img
                          src="/dev/alihd.jpg"
                          className="rounded-full p-1 w-32 h-32 object-cover"
                          alt="Ali HD (Ali Heydari) - Founder of CamCut"
                          title="Ali HD (Ali Heydari) - CEO"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    <h3 className="text-2xl font-black text-primary font-outfit mb-1">
                      Ali HD
                    </h3>
                  
                    <p className="text-secondary text-sm mb-4">
                      Developer
                    </p>

                    <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                      <a
                        href="https://t.me/lifelongcoder"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-theme bg-secondary px-3 py-2 text-sm font-semibold text-primary shadow-theme-sm hover:shadow-theme-md transition-shadow"
                      >
                        <Send className="w-4 h-4 text-[var(--accent-main)]" />
                        Telegram
                      </a>
                      <a
                        href="https://solanam.com/dev-talk"
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-lg border border-theme bg-secondary px-3 py-2 text-sm font-semibold text-primary shadow-theme-sm hover:shadow-theme-md transition-shadow"
                      >
                        <Crown className="w-4 h-4 text-[var(--accent-main)]" />
                        Dev Talk
                      </a>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg sm:text-xl font-black text-primary font-outfit mb-2 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-[var(--accent-main)]" />
                          About the Creator
                        </h4>
                        <p className="text-secondary text-sm sm:text-base leading-relaxed">
                          Read on Solanam platform
                          <br/>
                          <a href="https://solanam.com/about" target="_blank" rel="noreferrer" className="text-accent-main text-sm sm:text-base leading-relaxed">About Me</a>
                        </p>
                      </div>
 
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-8 sm:py-10 border-t border-theme bg-secondary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-lg border border-theme bg-primary px-6 sm:px-8 py-6 sm:py-8 text-center shadow-theme-md">
              <h2 className="text-xl sm:text-2xl font-black font-outfit mb-2 text-primary">
                Ready to create?
              </h2>
              <p className="text-secondary text-sm mb-6 max-w-xl mx-auto">
                Start making viral clips in seconds. No signup required.
              </p>
              <button
                onClick={() => navigate('/studio')}
                className="group inline-flex items-center gap-2 text-[var(--accent-contrast)] px-5 py-2.5 rounded-lg font-semibold bg-[var(--accent-main)] hover:opacity-95 shadow-theme-md transition-all duration-200 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2"
              >
                <span>Get started</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

