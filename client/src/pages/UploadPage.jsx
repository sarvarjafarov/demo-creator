import { useState, useCallback, useEffect } from 'react';
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

  // Auto-capture state
  const [captureStatus, setCaptureStatus] = useState('idle'); // idle | capturing | done | error
  const [captureResult, setCaptureResult] = useState(null);

  // Manual upload state
  const [manualFiles, setManualFiles] = useState([]);
  const [showManualUpload, setShowManualUpload] = useState(false);

  const onVoiceRecorded = useCallback((file) => {
    setVoiceFile(file);
  }, []);

  const onManualFiles = useCallback((files) => {
    setManualFiles((prev) => [...prev, ...files]);
  }, []);

  function removeManualFile(index) {
    setManualFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // Auto-capture screenshots from product URL on mount
  useEffect(() => {
    let cancelled = false;

    async function runCapture() {
      setCaptureStatus('capturing');
      try {
        const result = await api.captureScreenshots(id);
        if (!cancelled) {
          setCaptureStatus('done');
          setCaptureResult(result);
        }
      } catch (err) {
        if (!cancelled) {
          setCaptureStatus('error');
          setError(`Screenshot capture failed: ${err.message}`);
        }
      }
    }

    runCapture();
    return () => { cancelled = true; };
  }, [id]);

  async function handleContinue() {
    setError(null);

    if (!voiceFile) {
      setError('Please record your voice sample.');
      return;
    }

    const hasCaptures = captureStatus === 'done' && captureResult?.screenshots?.length > 0;
    const hasManual = manualFiles.length > 0;

    if (!hasCaptures && !hasManual) {
      setError('No screenshots available. Please wait for capture or add your own.');
      return;
    }

    setSubmitting(true);
    try {
      await api.uploadVoice(id, voiceFile);

      if (manualFiles.length > 0) {
        await api.uploadAssets(id, manualFiles);
      }

      navigate(`/projects/${id}/progress`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const hasAssets =
    (captureStatus === 'done' && captureResult?.screenshots?.length > 0) ||
    manualFiles.length > 0;
  const ready = voiceFile && hasAssets;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <StepIndicator steps={WIZARD_STEPS} current={1} />

      <h1 className="text-3xl font-bold mb-2">Record & Capture</h1>
      <p className="text-gray-500 mb-8">
        Record your voice while we automatically capture screenshots from your product.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Auto Screenshot Capture */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-2">Product Screenshots</h2>
          <p className="text-sm text-gray-500 mb-4">
            We automatically capture screenshots from your product URL.
          </p>

          {captureStatus === 'idle' && (
            <div className="flex items-center gap-3 text-gray-400 text-sm">
              <Spinner /> Preparing capture...
            </div>
          )}

          {captureStatus === 'capturing' && (
            <div className="flex items-center gap-3 text-brand-600 text-sm font-medium">
              <Spinner /> Visiting your product and capturing screenshots...
            </div>
          )}

          {captureStatus === 'done' && captureResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-medium text-sm">
                Captured {captureResult.screenshots.length} screenshots
              </p>
              <div className="flex gap-2 flex-wrap mt-3">
                {captureResult.screenshots.map((s, i) => (
                  <div
                    key={s.id || i}
                    className="w-20 h-14 bg-gray-100 rounded border border-gray-200 overflow-hidden"
                  >
                    <img
                      src={s.url}
                      alt={`Screenshot ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {captureStatus === 'error' && (
            <div className="flex items-center gap-3">
              <span className="text-red-500 text-sm">Capture failed.</span>
              <button
                onClick={() => {
                  setError(null);
                  setCaptureStatus('idle');
                  (async () => {
                    setCaptureStatus('capturing');
                    try {
                      const result = await api.captureScreenshots(id);
                      setCaptureStatus('done');
                      setCaptureResult(result);
                    } catch (err) {
                      setCaptureStatus('error');
                      setError(`Screenshot capture failed: ${err.message}`);
                    }
                  })();
                }}
                className="text-sm text-brand-600 font-medium hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Manual upload toggle */}
          {(captureStatus === 'done' || captureStatus === 'error') && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowManualUpload((v) => !v)}
                className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1"
              >
                {showManualUpload ? 'Hide manual upload' : 'Add your own screenshots or video'}
                <svg
                  className={`w-4 h-4 transition-transform ${showManualUpload ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showManualUpload && (
                <div className="mt-4 space-y-3">
                  <FileUploader
                    label="Drop screenshots or video here, or click to browse"
                    accept="image/*,video/*"
                    multiple
                    onFiles={onManualFiles}
                    hint="PNG, JPG, MP4, or MOV"
                  />
                  {manualFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-green-600 font-medium">
                        {manualFiles.length} file(s) added
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {manualFiles.map((f, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {f.type.startsWith('video/') ? <VideoIcon /> : <ImageIcon />}
                            <span className="max-w-[120px] truncate">{f.name}</span>
                            <button
                              onClick={() => removeManualFile(i)}
                              className="text-gray-400 hover:text-red-500 ml-0.5"
                              title="Remove"
                            >
                              &times;
                            </button>
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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-2">Voice Sample</h2>
          <p className="text-sm text-gray-500 mb-4">
            Read the script below aloud and record your voice. This will be used to generate narration.
          </p>
          <VoiceRecorder onRecorded={onVoiceRecorded} />
        </div>

        <button
          onClick={handleContinue}
          disabled={submitting || !ready}
          className="w-full py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Uploading...' : 'Continue to Generation'}
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
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}
