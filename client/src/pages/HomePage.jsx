import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-violet-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            Powered by Amazon Nova AI
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            Turn any product into a
            <br />
            <span className="gradient-text">polished demo video</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            Just paste your URL and record your voice. AI writes the script,
            captures screenshots, generates narration, and produces a
            ready-to-share demo video in minutes.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <button
              onClick={() => navigate('/projects/new')}
              className="btn-primary text-lg px-10 py-4"
            >
              Create Demo Video
            </button>
            <a href="#how-it-works" className="btn-secondary text-lg px-10 py-4">
              How It Works
            </a>
          </div>

          <p className="text-sm text-gray-400">No credit card required. Free to try.</p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Three simple steps to create a professional product demo video.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <StepCard
            step="1"
            icon={<PencilIcon />}
            title="Describe your product"
            description="Enter product details and your URL. We'll auto-capture screenshots and you record a short voice sample."
          />
          <StepCard
            step="2"
            icon={<SparklesIcon />}
            title="AI generates everything"
            description="Amazon Nova writes the script and storyboard. ElevenLabs generates professional voiceover narration."
          />
          <StepCard
            step="3"
            icon={<DownloadIcon />}
            title="Download your demo"
            description="Get a polished MP4 video with animated screenshots, smooth transitions, and background music."
          />
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl px-8 py-10 text-center">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">
            Built With
          </h3>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-gray-300 font-medium text-lg">
            <span>Amazon Nova</span>
            <span>Amazon Bedrock</span>
            <span>ElevenLabs</span>
            <span>FFmpeg</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function StepCard({ step, icon, title, description }) {
  return (
    <div className="card p-8 card-hover group">
      <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5 group-hover:bg-brand-100 transition-colors">
        {icon}
      </div>
      <div className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">
        Step {step}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}
