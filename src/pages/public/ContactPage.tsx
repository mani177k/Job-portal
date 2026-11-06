import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  MessageSquare
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'candidate'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please complete all required fields');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Thank you! Your message has been received. Our team will respond within 24 hours.');
      setFormData({ name: '', email: '', subject: '', message: '', type: 'candidate' });
    }, 600);
  };

  const faqs = [
    {
      q: 'How does candidate application tracking work on HireHub?',
      a: 'When you apply for an opening, you get an instant timeline in your Candidate Dashboard. As recruiters update candidate status—from Under Review to Shortlisted, Interview Scheduled, and Offer—your status tracker updates automatically in real-time with timestamped notes.'
    },
    {
      q: 'Can recruiters verify multiple candidates simultaneously?',
      a: 'Yes. Recruiter accounts have access to an applicant pipeline where they can filter candidates by skills and experience, review resumes, update statuses, schedule interviews with Google Meet / Zoom links, and leave internal evaluation notes.'
    },
    {
      q: 'Is HireHub free for job seekers?',
      a: 'Yes, HireHub is 100% free for candidates. You can build your profile, upload resumes, save jobs, and submit applications with zero hidden fees or restrictions.'
    },
    {
      q: 'How can employers get their company verified on the platform?',
      a: 'Companies undergo domain verification and corporate registry check upon registration. Recruiter accounts are vetted before postings go live to ensure high job quality.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Get in Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            We're Here to Help
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Have questions about hiring, applications, or platform integrations? Reach out to our team.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
              <h3 className="text-sm font-bold text-slate-900">Contact Details</h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Email Support</div>
                    <div className="text-slate-500">support@hirehub.com</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Response within 24 business hours</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Phone & Enterprise Support</div>
                    <div className="text-slate-500">+1 (800) 555-HIRE (4473)</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Mon - Fri, 9am - 6pm PST</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Global Headquarters</div>
                    <div className="text-slate-500">
                      555 Mission Street, Suite 2400<br />
                      San Francisco, CA 94105
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Offices */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 text-xs">
              <h4 className="font-bold text-slate-900">Regional Technology Hubs</h4>
              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="font-medium text-slate-800">New York, NY</span>
                  <span className="text-slate-400">One World Trade Center</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="font-medium text-slate-800">Seattle, WA</span>
                  <span className="text-slate-400">Pike Place Tower</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-800">London, UK</span>
                  <span className="text-slate-400">100 Bishopsgate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Send an Inquiry
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      I am a...
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="candidate">Job Seeker / Candidate</option>
                      <option value="recruiter">Recruiter / Employer</option>
                      <option value="enterprise">Enterprise Partner</option>
                      <option value="support">Technical Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help?"
                      className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your inquiry or question in detail..."
                    className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Common questions regarding recruitment, profile management, and hiring on HireHub.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200/80 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 text-xs sm:text-sm font-bold text-slate-900 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
