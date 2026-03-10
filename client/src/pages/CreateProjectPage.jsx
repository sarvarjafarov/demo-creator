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
    <div className="max-w-3xl mx-auto px-4 py-12">
      <StepIndicator steps={WIZARD_STEPS} current={0} />

      <h1 className="text-3xl font-bold mb-2">Create Your Demo Video</h1>
      <p className="text-gray-500 mb-8">
        Tell us about your product and we'll generate a professional demo video.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <Section title="Product Details">
          <Field label="Product Name *" name="productName" value={form.productName} onChange={onChange} placeholder="e.g. Acme Dashboard" required />
          <Field label="Short Description *" name="shortDescription" value={form.shortDescription} onChange={onChange} placeholder="Describe what your product does in 1-2 sentences" required textarea />
          <Field label="Product Category" name="productCategory" value={form.productCategory} onChange={onChange} placeholder="e.g. Project Management, Analytics, CRM" />
          <Field label="Target Audience" name="targetAudience" value={form.targetAudience} onChange={onChange} placeholder="e.g. SaaS founders, marketing teams, developers" />
          <Field label="Product URL" name="productUrl" value={form.productUrl} onChange={onChange} placeholder="https://your-product.com" />
        </Section>

        <Section title="Demo Preferences">
          <SelectField label="Demo Style" name="preferredDemoStyle" value={form.preferredDemoStyle} onChange={onChange} options={DEMO_STYLES} />
          <SelectField label="Video Length" name="preferredVideoLength" value={form.preferredVideoLength} onChange={onChange} options={VIDEO_LENGTHS} />
          <Field label="Call to Action" name="callToAction" value={form.callToAction} onChange={onChange} placeholder="e.g. Start your free trial today" />
        </Section>

        <Section title="Optional Details">
          <Field label="Brand Colors" name="brandColors" value={form.brandColors} onChange={onChange} placeholder="e.g. #2563eb, #1e3a8a" />
          <Field label="Tone of Voice" name="toneOfVoice" value={form.toneOfVoice} onChange={onChange} placeholder="e.g. Professional, Friendly, Bold" />
          <Field label="Key Features" name="keyFeatures" value={form.keyFeatures} onChange={onChange} placeholder="List main features, comma separated" textarea />
          <Field label="Competitor Names" name="competitorNames" value={form.competitorNames} onChange={onChange} placeholder="e.g. Competitor A, Competitor B" />
          <Field label="Desired Outcome" name="desiredOutcome" value={form.desiredOutcome} onChange={onChange} placeholder="e.g. Increase signups, impress investors" />
        </Section>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, required, textarea }) {
  const cls = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select name={name} value={value} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none">
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
