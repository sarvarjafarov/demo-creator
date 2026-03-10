import { useState, useRef, useCallback, useEffect } from 'react';

const SAMPLE_SCRIPTS = [
  "Hi, I'm excited to show you what our product can do. It's designed to save you time, simplify your workflow, and help your team move faster than ever before.",
  "Welcome to the future of productivity. Our platform automates the repetitive tasks that slow your team down, so you can focus on building what matters most.",
  "Imagine a tool that understands your workflow and does the heavy lifting for you. That's exactly what we've built, and I can't wait to walk you through it.",
];

/**
 * In-browser voice recorder.
 * Shows a script for the user to read aloud, records via MediaRecorder API,
 * and returns the recorded audio as a File object.
 *
 * @param {Function} onRecorded - Callback receiving a File object of the recording
 */
export default function VoiceRecorder({ onRecorded }) {
  const [state, setState] = useState('idle'); // idle | ready | recording | done
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState(null);
  const [scriptIndex] = useState(() => Math.floor(Math.random() * SAMPLE_SCRIPTS.length));
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const stream = useRef(null);
  const interval = useRef(null);

  // Request mic permission
  const requestMic = useCallback(async () => {
    setError(null);
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      setState('ready');
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access and try again.');
    }
  }, []);

  // Start recording
  const startRecording = useCallback(() => {
    if (!stream.current) return;

    chunks.current = [];
    const recorder = new MediaRecorder(stream.current, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };

    recorder.onstop = () => {
      const mimeType = recorder.mimeType;
      const ext = mimeType.includes('webm') ? 'webm' : 'm4a';
      const blob = new Blob(chunks.current, { type: mimeType });
      const file = new File([blob], `voice-sample.${ext}`, { type: mimeType });

      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setState('done');
      onRecorded(file);
    };

    mediaRecorder.current = recorder;
    recorder.start();
    setState('recording');
    setTimer(0);

    interval.current = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
  }, [onRecorded]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
    }
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
  }, []);

  // Re-record
  const reRecord = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setState('ready');
    setTimer(0);
  }, [audioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream.current) {
        stream.current.getTracks().forEach((t) => t.stop());
      }
      if (interval.current) clearInterval(interval.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-4">
      {/* Script to read */}
      <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Read this aloud
        </p>
        <p className="text-gray-800 leading-relaxed text-lg">
          "{SAMPLE_SCRIPTS[scriptIndex]}"
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        {state === 'idle' && (
          <button
            onClick={requestMic}
            className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors"
          >
            <MicIcon />
            Enable Microphone
          </button>
        )}

        {state === 'ready' && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
          >
            <RecordDot />
            Start Recording
          </button>
        )}

        {state === 'recording' && (
          <>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors"
            >
              <StopIcon />
              Stop Recording
            </button>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-mono text-gray-600">{formatTime(timer)}</span>
            </div>
          </>
        )}

        {state === 'done' && (
          <button
            onClick={reRecord}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Re-record
          </button>
        )}
      </div>

      {/* Playback */}
      {state === 'done' && audioUrl && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-green-600 font-medium text-sm">Recording saved ({formatTime(timer)})</span>
          </div>
          <audio controls src={audioUrl} className="w-full mt-2" />
        </div>
      )}
    </div>
  );
}

function MicIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 7v4m-4 0h8m-4-18a3 3 0 00-3 3v4a3 3 0 006 0V7a3 3 0 00-3-3z" />
    </svg>
  );
}

function RecordDot() {
  return <span className="w-3 h-3 bg-white rounded-full" />;
}

function StopIcon() {
  return <span className="w-3.5 h-3.5 bg-white rounded-sm" />;
}
