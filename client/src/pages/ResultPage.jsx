import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import StepIndicator from '../components/StepIndicator';

const WIZARD_STEPS = ['Product Details', 'Record & Capture', 'Generate', 'Result'];

export default function ResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        const data = await api.getResult(id);
        setResult(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-3 text-gray-500">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading result...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <StepIndicator steps={WIZARD_STEPS} current={4} />

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-50 mb-5">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Your Demo Video is Ready</h1>
        <p className="text-gray-500">
          {result?.productName} &mdash; Generated with Amazon Nova
        </p>
      </div>

      {/* Video Preview */}
      {result?.video?.url ? (
        <div className="relative rounded-2xl overflow-hidden mb-8 shadow-xl bg-gray-900">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10 rounded-2xl" />
          <video
            controls
            className="w-full relative z-0"
            src={result.video.url}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <div className="card p-16 text-center mb-8">
          <p className="text-gray-500">
            {result?.status === 'completed'
              ? 'Video will appear here once the signed URL is refreshed.'
              : `Status: ${result?.status || 'unknown'}`}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4 mb-14">
        {result?.video?.url && (
          <a href={result.video.url} download className="btn-primary flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download MP4
          </a>
        )}
        <Link to="/" className="btn-secondary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Another
        </Link>
      </div>

      {/* Generated Content Summary */}
      {result?.content && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-gray-900">Generated Content</h2>

          {result.content.brief && (
            <ContentCard title="Product Brief" icon={<BriefIcon />}>
              <p className="text-gray-600">{result.content.brief.productSummary}</p>
              {result.content.brief.keyMessages && (
                <ul className="mt-4 space-y-2">
                  {result.content.brief.keyMessages.map((m, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </ContentCard>
          )}

          {result.content.script && (
            <ContentCard title="Demo Script" icon={<ScriptIcon />}>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                {result.content.script.fullScript}
              </p>
            </ContentCard>
          )}

          {result.content.narration && (
            <ContentCard title="Narration" icon={<MicIcon />}>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                {result.content.narration.fullNarration}
              </p>
            </ContentCard>
          )}
        </div>
      )}

      {/* Attribution */}
      <div className="mt-14 py-6 text-center border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Content generated by Amazon Nova via Amazon Bedrock.
          Voice generated by ElevenLabs. Video assembled with FFmpeg.
        </p>
      </div>
    </div>
  );
}

function ContentCard({ title, icon, children }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-brand-500">{icon}</span>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function BriefIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
}

function ScriptIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>;
}

function MicIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>;
}
