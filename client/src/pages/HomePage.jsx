import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
        Turn product info into
        <br />
        <span className="text-brand-600">polished demo videos</span>
      </h1>

      <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
        Upload screenshots and a voice sample. Our AI writes the script,
        generates narration in your voice, and produces a ready-to-share
        product demo video in minutes.
      </p>

      <div className="flex justify-center gap-4 mb-16">
        <button
          onClick={() => navigate('/projects/new')}
          className="px-8 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors"
        >
          Create Demo Video
        </button>
        <a
          href="#how-it-works"
          className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          How It Works
        </a>
      </div>

      <div id="how-it-works" className="grid md:grid-cols-3 gap-8 text-left">
        <StepCard
          step="1"
          title="Describe your product"
          description="Enter product details, target audience, and preferred demo style. Upload screenshots of your product."
        />
        <StepCard
          step="2"
          title="AI generates everything"
          description="Amazon Nova writes the script, storyboard, and narration. ElevenLabs generates voiceover in your voice."
        />
        <StepCard
          step="3"
          title="Download your demo"
          description="Get a polished MP4 demo video with animated screenshots, subtitles, and professional narration."
        />
      </div>

      <div className="mt-20 py-8 px-6 bg-gray-100 rounded-xl">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Powered by
        </h3>
        <div className="flex justify-center gap-12 text-gray-400 font-medium">
          <span>Amazon Nova</span>
          <span>Amazon Bedrock</span>
          <span>ElevenLabs</span>
          <span>FFmpeg</span>
        </div>
      </div>
    </div>
  );
}

function StepCard({ step, title, description }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center mb-4">
        {step}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
