import {
  Film,
  Type,
  Sparkles,
  ArrowRight,
  Play,
  Video,
  Zap,
  Scissors,
  CheckCircle2,
} from 'lucide-react';
import { useRouter } from '../router';
import SEO from './SEO';
import JSONLD from './JSONLD';

export default function Landing() {
  const { navigate } = useRouter();

  const features = [
    {
      icon: Film,
      title: 'Pick or upload a clip',
      description:
        'Choose from the gallery of trending clips or upload your own video. Find the perfect 3–6 second hook for Shorts, Reels, and TikTok.',
    },
    {
      icon: Type,
      title: 'Style it with bold text',
      description:
        'Six short‑form‑ready styles: Comic, Neon, Retro, Bold, Elegant, and Outline. Tune colors so your message jumps off the screen.',
    },
    {
      icon: Sparkles,
      title: 'Create, save, and share',
      description:
        'Generate a finished clip in your browser, download in one click, and share it anywhere. No signup, no watermarks, just your content.',
    },
  ];

  const steps = [
    {
      step: 1,
      label: 'Select or upload',
      detail: 'Start from a trending clip or upload your own footage from your device.',
    },
    {
      step: 2,
      label: 'Trim & style',
      detail: 'Use the timeline to set in/out points, then add a text style that fits your brand.',
    },
    {
      step: 3,
      label: 'Export & post',
      detail: 'Export locally from your browser and post to Shorts, Reels, or TikTok in seconds.',
    },
  ];

  const useCases = [
    'Meme clips and reaction videos',
    'Product teasers and quick ads',
    'Quotes and motivational shorts',
    'Tutorial hooks, tips, and callouts',
  ];

  return (
    <>
      <SEO
        title="CamCut – Browser-Based Short-Form Video Editor | camcut.fun"
        description="CamCut is a free, browser-based PWA for short-form video. Pick or upload a clip, trim the perfect 3–6 second moment, add bold text styles, and export locally. No signup, no installs, no watermarks."
        keywords="video editor, short-form video, viral clips, video creator, meme maker, video trimmer, text overlay, social media video, camcut, camcut.fun, PWA video editor"
        url="https://camcut.fun/"
      />
      <JSONLD
        type="WebApplication"
        data={{
          name: 'CamCut',
          applicationCategory: 'MultimediaApplication',
          operatingSystem: 'Web',
          featureList: [
            'Video upload and gallery selection',
            'Precise video trimming for short clips',
            'Text overlay with 6+ short-form styles',
            'Real-time preview in the browser',
            'Instant local export, no watermark',
          ],
        }}
      />
      <JSONLD
        type="WebSite"
        data={{
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://camcut.fun/gallery?search={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        }}
      />

      <div className="min-h-screen bg-primary">
        {/* Hero */}
        <section className="pt-16 pb-10 sm:pt-20 sm:pb-12 lg:pt-24 lg:pb-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-secondary border border-theme rounded-full px-3 py-1.5 text-sm font-medium text-primary shadow-theme-sm mb-4">
                <Scissors className="w-4 h-4 text-[var(--accent-main)]" />
                <span>Video Editor and Player · PWA</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-primary font-outfit mb-4 leading-[1.1]">
                What Microst {' '}
                <span className="text-[var(--accent-main)]">Dont have By Default</span>
              </h1>

              <p className="text-base sm:text-lg text-secondary mb-6 leading-relaxed">
                CamCut runs entirely in your browser as a installable PWA. Pick or upload a clip, trim the
                perfect moment, layer on bold text styles, and export — all without uploads, signups, or
                watermarks.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-tertiary mb-6">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-main)]" />
                  Free & browser-based
                </span>
                <span className="text-tertiary opacity-60">·</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-main)]" />
                  No signup, no installs
                </span>
                <span className="text-tertiary opacity-60">·</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-main)]" />
                  No watermarks
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <button
                  onClick={() => navigate('/studio')}
                  className="group w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 text-[var(--accent-contrast)] bg-[var(--accent-main)] hover:opacity-95 shadow-theme-md transition-all duration-200 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] focus-visible:ring-[var(--accent-main)]"
                >
                  <span>Open editor</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={() => navigate('/gallery')}
                  className="w-full sm:w-auto bg-secondary hover:bg-tertiary text-primary border border-theme px-5 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-theme-sm hover:shadow-theme-md active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
                >
                  <Play className="w-4 h-4" />
                  <span>Browse gallery</span>
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-left">
                {[
                  { title: 'Fast workflow', desc: 'Pick → trim → style → export — all in the browser.' },
                  { title: 'Optimized for short-form', desc: '3–6 second clips that hook viewers fast.' },
                  {
                    title: 'Private by default',
                    desc: 'Videos are processed locally; you stay in control of your files.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-lg border border-theme bg-secondary px-3 py-3 shadow-theme-sm"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-tertiary border border-theme">
                        <Sparkles className="h-3.5 w-3.5 text-[var(--accent-main)]" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-primary text-sm">{item.title}</div>
                        <div className="text-xs text-secondary mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-10 sm:py-14 lg:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-2xl font-black text-primary font-outfit mb-2">How CamCut works</h2>
              <p className="text-secondary text-sm sm:text-base max-w-xl mx-auto">
                A focused, three-step flow from idea to finished short-form clip — with everything happening in
                your browser.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-10">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="rounded-lg border border-theme bg-secondary p-4 sm:p-5 shadow-theme-sm hover:shadow-theme-md transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-lg bg-tertiary border border-theme flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-[var(--accent-main)]" />
                    </div>
                    <h3 className="text-base font-bold text-primary font-outfit mb-1.5">{feature.title}</h3>
                    <p className="text-secondary text-sm leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
              {steps.map(({ step, label, detail }) => (
                <div key={step} className="flex flex-col sm:items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] flex items-center justify-center font-bold text-xs mb-2">
                    {step}
                  </div>
                  <h4 className="font-semibold text-primary text-sm mb-0.5">{label}</h4>
                  <p className="text-xs text-secondary">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Video creation block */}
        <section className="py-10 sm:py-14 border-t border-theme bg-secondary">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-tertiary border border-theme text-primary px-2.5 py-1.5 rounded-md text-xs font-medium mb-3">
                  <Video className="w-3.5 h-3.5 text-[var(--accent-main)]" />
                  <span>Editor</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-primary font-outfit mb-3">
                  + Offline Player
                </h2>
                <p className="text-secondary text-sm sm:text-base leading-relaxed mb-4">
                  Use the built-in timeline to set frame-accurate in and out points, then layer on text overlays
                  with one of six styles. Everything is rendered directly in your browser, so you get instant
                  feedback and never wait on a server. install app and play offline.
                </p>
                <ul className="space-y-2 mb-4">
                  {[
                    'Frame-accurate trimming for tight hooks',
                    'Instant in-browser preview',
                    'Local export with multiple formats',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-secondary text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[var(--accent-main)] flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/studio')}
                  className="group inline-flex items-center gap-2 text-[var(--accent-contrast)] px-4 py-2.5 rounded-lg font-semibold bg-[var(--accent-main)] hover:opacity-95 shadow-theme-md transition-all duration-200 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent-main)]"
                >
                  <span>Open editor</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
              <div className="rounded-lg border border-theme bg-tertiary aspect-video flex items-center justify-center shadow-theme-md">
                <div className="flex flex-col items-center gap-2 text-primary">
                  <Film className="w-12 h-12 text-[var(--accent-main)]" />
                  <span className="text-sm font-medium">Upload or pick a clip</span>
                  <span className="text-xs text-secondary">Then trim, style, and export locally</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Text styles block */}
        <section className="py-10 sm:py-14 border-t border-theme bg-primary">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="order-1 lg:order-2">
                <div className="aspect-video rounded-lg bg-tertiary border border-theme flex items-center justify-center shadow-theme-sm">
                   <img src="/dev/windows-trim.png" height="100%" width="100%" alt="microsoft shitty video player trimmer"/>
                </div>
              </div>
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 bg-tertiary border border-theme text-primary px-2.5 py-1.5 rounded-md text-xs font-medium mb-3">
                  <Zap className="w-3.5 h-3.5 text-[var(--accent-main)]" />
                  <span>Why ?</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-primary font-outfit mb-3">
                  Because No One Deserve This Shit
                </h2>
                <p className="text-secondary text-sm sm:text-base leading-relaxed mb-4">
                  Default On Microsoft, Trim is not fun :|
                </p>
                <ul className="space-y-2 mb-4">
                  {[
                    '6 unique text styles built for short-form',
                    'Customizable colors and emphasis',
                    'Real-time preview in the editor',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-secondary text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[var(--accent-main)] flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/about')}
                  className="group inline-flex items-center gap-2 text-[var(--accent-contrast)] px-4 py-2.5 rounded-lg font-semibold bg-[var(--accent-main)] hover:opacity-95 shadow-theme-md transition-all duration-200 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2"
                >
                  <span>Who Did This ?</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-10 sm:py-14 border-t border-theme bg-secondary">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-primary font-outfit mb-2">
                Built for every-form
              </h2>
              <p className="text-secondary text-sm sm:text-base max-w-xl mx-auto">
                Whether you&apos;re a creator, marketer, or just sharing with friends, CamCut helps you ship
                scroll-stopping clips fast.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {useCases.map((useCase, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-lg bg-primary border border-theme shadow-theme-sm hover:shadow-theme-md transition-shadow"
                >
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-main)] flex-shrink-0" />
                  <span className="text-primary text-sm font-medium">{useCase}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
 

        {/* Final CTA */}
        <section className="py-10 sm:py-14 border-t border-theme bg-secondary">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-lg border border-theme bg-primary px-6 sm:px-8 py-6 sm:py-8 text-center shadow-theme-md">
              <h2 className="text-xl sm:text-2xl font-black font-outfit mb-2 text-[var(--accent-main)]">
                Ready to ship your next short?
              </h2>
              <p className="text-secondary text-sm mb-6 max-w-xl mx-auto">
                Open CamCut in your browser, trim a clip, add text, and export — free, no signup, no watermarks.
              </p>
              <button
                onClick={() => navigate('/studio')}
                className="group inline-flex items-center gap-2 text-[var(--accent-contrast)] px-5 py-2.5 rounded-lg font-semibold bg-[var(--accent-main)] hover:opacity-95 shadow-theme-md transition-all duration-200 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2"
              >
                <span>Get started now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}