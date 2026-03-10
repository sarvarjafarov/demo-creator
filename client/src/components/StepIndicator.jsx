/**
 * Horizontal step indicator for the wizard flow.
 * Shows which step the user is on.
 *
 * @param {Array} steps - Array of step labels
 * @param {number} current - Zero-based index of the current step
 */
export default function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i < current
                  ? 'bg-green-500 text-white'
                  : i === current
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i < current ? '\u2713' : i + 1}
            </div>
            <span
              className={`text-sm font-medium hidden sm:inline ${
                i <= current ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 ${
                i < current ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
