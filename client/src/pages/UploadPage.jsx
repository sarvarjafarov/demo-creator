import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import StepIndicator from '../components/StepIndicator';
import FileUploader from '../components/FileUploader';
import VoiceRecorder from '../components/VoiceRecorder';

const WIZARD_STEPS = ['Product Details', 'Record & Capture', 'Generate', 'Result'];

export default function UploadPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voiceFile, setVoiceFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [captureStatus, setCaptureStatus] = useState('idle');
  const [captureResult, setCaptureResult] = useState(null);
  const [manualFiles, setManualFiles] = useState([]);
  const [showManualUpload, setShowManualUpload] = useState(false);
  const captureStarted = useRef(false);

  const onVoiceRecorded = useCallback((file) => setVoiceFile(file), []);
  const onManualFiles = useCallback((files) => setManualFiles((prev) => [...prev, ...files]), []);
  function removeManualFile(index) { setManualFiles((prev) => prev.filter((_, i) => i !== index)); }

  useEffect(() => {
    if (captureStarted.current) return;
    captureStarted.current = true;
    let cancelled = false;
    async function runCapture() {
      setCaptureStatus('capturing');
      try {
        const result = await api.captureScreenshots(id);
        if (!cancelled) { setCaptureStatus('done'); setCaptureResult(result); }
      } catch (err) {
        if (!cancelled) { setCaptureStatus('error'); setError(`Screenshot capture failed: ${err.message}`); }
      }
    }
    runCapture();
    return () => { cancelled = true; };
  }, [id]);

  async function handleContinue() {
    setError(null);
    if (!voiceFile) { setError('Please record your voice sample.'); return; }
    const hasCaptures = captureStatus === 'done' && captureResult?.screenshots?.length > 0;
    if (!hasCaptures && manualFiles.length === 0) { setError('No screenshots available. Please wait for capture or add your own.'); return; }

    setSubmitting(true);
    try {
      await api.uploadVoice(id, voiceFile);
      if (manualFiles.length > 0) await api.uploadAssets(id, manualFiles);
      navigate(`/projects/${id}/progress`);
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  const hasAssets = (captureStatus === 'done' && captureResult?.screenshots?.length > 0) || manualFiles.length > 0;
  const ready = voiceFile && hasAssets;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <StepIndicator steps={WIZARD_STEPS} current={1} />

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Record & Capture</h1>
        <p className="text-gray-500">
          Record your voice while we automatically capture screenshots from your product.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Auto Screenshot Capture */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Product Screenshots</h2>
              <p className="text-sm text-gray-500">Auto-captured from your product URL</p>
            </div>
          </div>

          {captureStatus === 'idle' && (
            <div className="flex items-center gap-3 text-gray-400 text-sm py-6 justify-center">
              <Spinner /> Preparing capture...
            </div>
          )}

          {captureStatus === 'capturing' && (
            <div className="flex items-center gap-3 text-brand-600 text-sm font-medium py-6 justify-center">
              <Spinner /> Visiting your product and capturing screenshots...
            </div>
          )}

          {captureStatus === 'done' && captureResult && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <p className="text-green-700 font-semibold text-sm">
                  Captured {captureResult.screenshots.length} screenshots
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {captureResult.screenshots.map((s, i) => (
                  <div key={s.id || i} className="w-24 h-16 bg-white rounded-lg border border-green-200 overflow-hidden shadow-sm">
                    <img src={s.url} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {captureStatus === 'error' && (
            <div className="flex items-center gap-3 py-4">
              <span className="text-red-500 text-sm">Capture failed.</span>
              <button
                onClick={() => {
                  setError(null); setCaptureStatus('capturing');
                  api.captureScreenshots(id).then(r => { setCaptureStatus('done'); setCaptureResult(r); })
                    .catch(e => { setCaptureStatus('error'); setError(`Screenshot capture failed: ${e.message}`); });
                }}
                className="text-sm text-brand-600 font-semibold hover:text-brand-700"
              >
                Retry
              </button>
            </div>
          )}

          {(captureStatus === 'done' || captureStatus === 'error') && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowManualUpload((v) => !v)}
                className="text-sm text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1.5 transition-colors"
              >
                {showManualUpload ? 'Hide manual upload' : 'Add your own screenshots or video'}
                <svg className={`w-4 h-4 transition-transform duration-200 ${showManualUpload ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showManualUpload && (
                <div className="mt-4 space-y-3">
                  <FileUploader label="Drop screenshots or video here, or click to browse" accept="image/*,video/*" multiple onFiles={onManualFiles} hint="PNG, JPG, MP4, or MOV" />
                  {manualFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-green-600 font-medium">{manualFiles.length} file(s) added</p>
                      <div className="flex gap-2 flex-wrap">
                        {manualFiles.map((f, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 px-2.5 py-1.5 rounded-lg border border-gray-200">
                            {f.type.startsWith('video/') ? <VideoIcon /> : <ImageIcon />}
                            <span className="max-w-[120px] truncate">{f.name}</span>
                            <button onClick={() => removeManualFile(i)} className="text-gray-400 hover:text-red-500 ml-0.5">&times;</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Voice Sample */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Voice Sample</h2>
              <p className="text-sm text-gray-500">Read the script aloud to generate narration</p>
            </div>
          </div>
          <VoiceRecorder onRecorded={onVoiceRecorded} />
        </div>

        <button
          onClick={handleContinue}
          disabled={submitting || !ready}
          className="w-full btn-primary py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner /> Uploading...
            </span>
          ) : 'Continue to Generation'}
        </button>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function ImageIcon() {
  return <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
}

function VideoIcon() {
  return <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
}
