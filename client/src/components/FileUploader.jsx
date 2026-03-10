import { useCallback } from 'react';

/**
 * Drag-and-drop file upload component.
 *
 * @param {string} label - Upload area label
 * @param {string} accept - File accept attribute (e.g. "image/*", "audio/*")
 * @param {boolean} multiple - Allow multiple files
 * @param {Function} onFiles - Callback receiving selected File[]
 * @param {string} hint - Helper text below the upload area
 */
export default function FileUploader({ label, accept, multiple, onFiles, hint }) {
  const handleChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) onFiles(files);
    },
    [onFiles]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onFiles(files);
    },
    [onFiles]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-brand-400 transition-colors cursor-pointer"
    >
      <label className="cursor-pointer block">
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
        <div className="text-gray-400 mb-2">
          <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      </label>
    </div>
  );
}
