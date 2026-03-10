import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import StepIndicator from '../components/StepIndicator';

const WIZARD_STEPS = ['Product Details', 'Record & Capture', 'Generate', 'Result'];

const GENERATION_STEPS = [
  { key: 'brief', label: 'Generating product brief', detail: 'Amazon Nova is analyzing your product details...', endpoint: 'generateBrief', statusKey: 'brief_generated' },
  { key: 'script', label: 'Generating demo script', detail: 'Writing a persuasive, scene-ready script...', endpoint: 'generateScript', statusKey: 'script_generated' },
  { key: 'storyboard', label: 'Generating storyboard & narration', detail: 'Creating scene plan, narration, and subtitles...', endpoint: 'generateStoryboard', statusKey: 'storyboard_generated' },
  { key: 'video', label: 'Generating voiceover & rendering video', detail: 'Producing voiceover and assembling final MP4...', endpoint: 'generateVideo', statusKey: 'video_rendered' },
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <StepIndicator steps={WIZARD_STEPS} current={2} />

      <h1 className="text-3xl font-bold mb-2 text-center">Creating Your Demo Video</h1>
      <p className="text-gray-500 mb-10 text-center">
        Amazon Nova is generating your script, storyboard, and narration.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p>{error}</p>
          <button
            onClick={() => { setError(null); started.current = false; runPipeline(); }}
            className="mt-2 text-sm font-medium underline"
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
              className={`p-4 rounded-lg border transition-all ${
                state === 'complete' ? 'border-green-200 bg-green-50' :
                state === 'active' ? 'border-brand-300 bg-brand-50 shadow-sm' :
                'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  state === 'complete' ? 'bg-green-500 text-white' :
                  state === 'active' ? 'bg-brand-500 text-white' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {state === 'complete' ? '\u2713' : state === 'active' ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : i + 1}
                </div>
                <div>
                  <p className={`font-medium ${
                    state === 'complete' ? 'text-green-700' :
                    state === 'active' ? 'text-brand-700' :
                    'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                  {state === 'active' && (
                    <p className="text-xs text-brand-500 mt-0.5">{step.detail}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {generating && (
        <p className="text-center text-sm text-gray-400 mt-8">
          This may take 1-2 minutes. Please don't close this page.
        </p>
      )}
    </div>
  );
}
