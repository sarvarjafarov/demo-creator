export default function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center justify-center mb-12">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  done
                    ? 'bg-green-500 text-white shadow-sm'
                    : active
                    ? 'bg-brand-600 text-white shadow-glow ring-4 ring-brand-100'
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : i + 1}
              </div>
              <span
                className={`text-sm font-medium hidden sm:inline transition-colors ${
                  done ? 'text-green-600' : active ? 'text-brand-700' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-10 h-0.5 mx-3 rounded-full transition-colors ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
