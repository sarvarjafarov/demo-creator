import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import StepIndicator from '../components/StepIndicator';

const WIZARD_STEPS = ['Product Details', 'Record & Capture', 'Generate', 'Result'];

const DEMO_STYLES = [
  'clean SaaS demo',
  'mobile app promo',
  'startup launch demo',
  'investor-style feature showcase',
  'e-commerce product walkthrough',
];

const VIDEO_LENGTHS = ['30 sec', '45 sec', '60 sec', '90 sec'];

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    productName: '',
    productCategory: '',
    shortDescription: '',
    targetAudience: '',
    productUrl: '',
    preferredDemoStyle: 'clean SaaS demo',
    preferredVideoLength: '60 sec',
    callToAction: '',
    brandColors: '',
    toneOfVoice: '',
    keyFeatures: '',
    competitorNames: '',
    desiredOutcome: '',
  });

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.productName || !form.shortDescription) {
      setError('Product name and description are required.');
      return;
    }

    setLoading(true);
    try {
      const project = await api.createProject(form);
      navigate(`/projects/${project.id}/upload`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <StepIndicator steps={WIZARD_STEPS} current={0} />

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Create Your Demo Video</h1>
        <p className="text-gray-500">
          Tell us about your product and we'll generate a professional demo video.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <Section title="Product Details" icon={<BoxIcon />}>
          <Field label="Product Name" name="productName" value={form.productName} onChange={onChange} placeholder="e.g. Acme Dashboard" required />
          <Field label="Short Description" name="shortDescription" value={form.shortDescription} onChange={onChange} placeholder="Describe what your product does in 1-2 sentences" required textarea />
          <Field label="Product Category" name="productCategory" value={form.productCategory} onChange={onChange} placeholder="e.g. Project Management, Analytics, CRM" />
          <Field label="Target Audience" name="targetAudience" value={form.targetAudience} onChange={onChange} placeholder="e.g. SaaS founders, marketing teams, developers" />
          <Field label="Product URL" name="productUrl" value={form.productUrl} onChange={onChange} placeholder="https://your-product.com" />
        </Section>

        <Section title="Demo Preferences" icon={<SlidersIcon />}>
          <SelectField label="Demo Style" name="preferredDemoStyle" value={form.preferredDemoStyle} onChange={onChange} options={DEMO_STYLES} />
          <SelectField label="Video Length" name="preferredVideoLength" value={form.preferredVideoLength} onChange={onChange} options={VIDEO_LENGTHS} />
          <Field label="Call to Action" name="callToAction" value={form.callToAction} onChange={onChange} placeholder="e.g. Start your free trial today" />
        </Section>

        <Section title="Optional Details" icon={<TuneIcon />}>
          <Field label="Brand Colors" name="brandColors" value={form.brandColors} onChange={onChange} placeholder="e.g. #2563eb, #1e3a8a" />
          <Field label="Tone of Voice" name="toneOfVoice" value={form.toneOfVoice} onChange={onChange} placeholder="e.g. Professional, Friendly, Bold" />
          <Field label="Key Features" name="keyFeatures" value={form.keyFeatures} onChange={onChange} placeholder="List main features, comma separated" textarea />
          <Field label="Competitor Names" name="competitorNames" value={form.competitorNames} onChange={onChange} placeholder="e.g. Competitor A, Competitor B" />
          <Field label="Desired Outcome" name="desiredOutcome" value={form.desiredOutcome} onChange={onChange} placeholder="e.g. Increase signups, impress investors" />
        </Section>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating...
            </span>
          ) : 'Continue'}
        </button>
      </form>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, required, textarea }) {
  const cls = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white outline-none transition-all text-sm";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-brand-500">*</span>}
      </label>
      {textarea ? (
        <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} rows={3} className={cls} />
      ) : (
        <input name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} className={cls} />
      )}
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <select name={name} value={value} onChange={onChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white outline-none transition-all text-sm">
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function BoxIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
  );
}

function TuneIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
