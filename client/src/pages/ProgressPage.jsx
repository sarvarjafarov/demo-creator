import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import StepIndicator from '../components/StepIndicator';

const WIZARD_STEPS = ['Product Details', 'Record & Capture', 'Generate', 'Result'];

const GENERATION_STEPS = [
  { key: 'brief', label: 'Product brief', detail: 'Amazon Nova is analyzing your product details...', endpoint: 'generateBrief', statusKey: 'brief_generated', icon: '1' },
  { key: 'script', label: 'Demo script', detail: 'Writing a persuasive, scene-ready script...', endpoint: 'generateScript', statusKey: 'script_generated', icon: '2' },
  { key: 'storyboard', label: 'Storyboard & narration', detail: 'Creating scene plan, narration, and subtitles...', endpoint: 'generateStoryboard', statusKey: 'storyboard_generated', icon: '3' },
  { key: 'video', label: 'Voiceover & video render', detail: 'Producing voiceover and assembling final MP4...', endpoint: 'generateVideo', statusKey: 'video_rendered', icon: '4' },
];

export default function ProgressPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const started = useRef(false);

  const pollStatus = useCallback(async () => {
    try {
      return await api.getStatus(id);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [id]);

  const runPipeline = useCallback(async () => {
    if (started.current) return;
    started.current = true;
    setGenerating(true);

    try {
      for (let i = 0; i < GENERATION_STEPS.length; i++) {
        const step = GENERATION_STEPS[i];
        setCurrentStep(i);

        await api[step.endpoint](id);

        let complete = false;
        while (!complete) {
          await new Promise((r) => setTimeout(r, 2000));
          const s = await pollStatus();
          if (!s) return;

          if (s.steps[step.statusKey]) {
            complete = true;
          } else if (s.lastError) {
            setError(s.lastError);
            setGenerating(false);
            return;
          }
        }
      }

      setCurrentStep(GENERATION_STEPS.length);
      setGenerating(false);
      navigate(`/projects/${id}/result`);
    } catch (err) {
      setError(err.message);
      setGenerating(false);
    }
  }, [id, navigate, pollStatus]);

  useEffect(() => {
    runPipeline();
  }, [runPipeline]);

  const progress = (currentStep / GENERATION_STEPS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <StepIndicator steps={WIZARD_STEPS} current={2} />

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 mb-5">
          <svg className="w-8 h-8 text-brand-600 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Creating Your Demo Video</h1>
        <p className="text-gray-500">
          AI is generating your script, storyboard, and narration.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.max(progress, 5)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-400">Step {currentStep + 1} of {GENERATION_STEPS.length}</span>
          <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 text-sm">
          <p className="font-medium">Something went wrong</p>
          <p className="mt-1 text-red-600">{error}</p>
          <button
            onClick={() => { setError(null); started.current = false; runPipeline(); }}
            className="mt-3 text-sm font-semibold text-red-700 hover:text-red-800 underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      <div className="space-y-3">
        {GENERATION_STEPS.map((step, i) => {
          const state = i < currentStep ? 'complete' :
            i === currentStep && generating ? 'active' : 'pending';

          return (
            <div
              key={step.key}
              className={`p-5 rounded-xl border transition-all duration-500 ${
                state === 'complete' ? 'border-green-200 bg-green-50/50' :
                state === 'active' ? 'border-brand-200 bg-brand-50/50 shadow-glow' :
                'border-gray-100 bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300 ${
                  state === 'complete' ? 'bg-green-500 text-white' :
                  state === 'active' ? 'bg-gradient-to-br from-brand-500 to-violet-500 text-white' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {state === 'complete' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : state === 'active' ? (
                    <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : step.icon}
                </div>
                <div className="min-w-0">
                  <p className={`font-semibold transition-colors ${
                    state === 'complete' ? 'text-green-700' :
                    state === 'active' ? 'text-brand-700' :
                    'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                  {state === 'active' && (
                    <p className="text-xs text-brand-500 mt-0.5">{step.detail}</p>
                  )}
                  {state === 'complete' && (
                    <p className="text-xs text-green-500 mt-0.5">Completed</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {generating && (
        <p className="text-center text-sm text-gray-400 mt-10">
          This may take 1-2 minutes. Please don't close this page.
        </p>
      )}
    </div>
  );
}
