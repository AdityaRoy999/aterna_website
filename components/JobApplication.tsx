import React, { useState, useRef } from 'react';
import { PageHero } from './PageHero';
import { Upload, CheckCircle, AlertCircle, X } from 'lucide-react';
import { supabase } from '../src/supabaseClient';

interface JobApplicationProps {
  job: {
    title: string;
    department: string;
    location: string;
  };
  onNavigate: (page: string) => void;
}

export const JobApplication: React.FC<JobApplicationProps> = ({ job, onNavigate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    resume: null as File | null,
    answers: {} as Record<string, string>
  });

  // Dynamic questions based on job title
  const getQuestions = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('watchmaker')) {
      return [
        { id: 'experience', label: 'Years of experience with high complications?', type: 'number' },
        { id: 'specialization', label: 'What is your specialization (e.g., Tourbillon, Minute Repeater)?', type: 'text' }
      ];
    }
    if (lowerTitle.includes('gemologist')) {
      return [
        { id: 'certification', label: 'Do you hold a GIA or FGA certification?', type: 'text' },
        { id: 'sourcing', label: 'Describe your experience sourcing in conflict-free zones.', type: 'textarea' }
      ];
    }
    if (lowerTitle.includes('advisor') || lowerTitle.includes('sales')) {
      return [
        { id: 'portfolio', label: 'What is the approximate size of your client portfolio?', type: 'text' },
        { id: 'languages', label: 'Which languages do you speak fluently?', type: 'text' }
      ];
    }
    if (lowerTitle.includes('art director') || lowerTitle.includes('creative')) {
      return [
        { id: 'portfolio_url', label: 'Link to your portfolio', type: 'url' },
        { id: 'tools', label: 'Which design tools are you most proficient in?', type: 'text' }
      ];
    }
    // Default questions
    return [
      { id: 'motivation', label: 'Why do you want to join AETERNA?', type: 'textarea' },
      { id: 'notice', label: 'What is your notice period?', type: 'text' }
    ];
  };

  const questions = getQuestions(job?.title || '');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAnswerChange = (id: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [id]: value
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        return;
      }
      setError(null);
      setFormData({ ...formData, resume: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let resumeUrl = '';

      // 1. Upload Resume
      if (formData.resume) {
        const fileExt = formData.resume.name.split('.').pop();
        const fileName = `${Date.now()}_${formData.fullName.replace(/\s+/g, '_')}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, formData.resume);

        if (uploadError) throw uploadError;
        
        // Get public URL (or just store the path if bucket is private)
        // Since bucket is private, we store the path. Admin can generate signed URL later.
        resumeUrl = uploadData.path;
      } else {
        throw new Error('Resume is required');
      }

      // 2. Insert Application Record
      const { error: dbError } = await supabase
        .from('job_applications')
        .insert([
          {
            job_title: job.title,
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            linkedin_url: formData.linkedin,
            resume_url: resumeUrl,
            answers: formData.answers
          }
        ]);

      if (dbError) throw dbError;

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err: any) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-offwhite text-2xl mb-4">Job not found</h2>
          <button onClick={() => onNavigate('careers')} className="text-luxury underline">Return to Careers</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void animate-fade-in">
      <PageHero 
        title="APPLY NOW" 
        subtitle={job.title}
        bgImage="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2000&auto=format&fit=crop"
      />
      
      <section className="py-24 px-6 max-w-4xl mx-auto">
        {isSuccess ? (
           <div className="min-h-[50vh] flex flex-col items-center justify-center text-center animate-fade-in">
              <div className="w-24 h-24 rounded-full bg-luxury/10 flex items-center justify-center text-luxury mb-8 border border-luxury/20 shadow-[0_0_40px_rgba(232,207,160,0.2)]">
                <CheckCircle size={48} />
              </div>
              <h2 className="font-display text-4xl text-offwhite mb-6">Application Received</h2>
              <p className="font-body text-offwhite/60 max-w-lg mb-8 text-lg leading-relaxed">
                Thank you for your interest in joining AETERNA. We have received your application for the position of <span className="text-luxury">{job.title}</span>. Our team will review your profile and contact you shortly.
              </p>
              <button 
                onClick={() => onNavigate('careers')}
                className="font-ui text-luxury uppercase tracking-widest text-xs border-b border-luxury/30 pb-1 hover:text-white transition-colors"
              >
                Return to Careers
              </button>
           </div>
        ) : (
          <div className="bg-stone-900/30 p-8 md:p-12 rounded-[2rem] border border-white/5 backdrop-blur-sm">
            <div className="mb-12 border-b border-white/5 pb-8">
              <h3 className="font-display text-2xl text-offwhite mb-2">Role Details</h3>
              <div className="flex flex-wrap gap-6 text-sm text-offwhite/60 mt-4">
                <span className="flex items-center gap-2"><span className="text-luxury">Department:</span> {job.department}</span>
                <span className="flex items-center gap-2"><span className="text-luxury">Location:</span> {job.location}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-3">
                  <AlertCircle size={20} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">Full Name *</label>
                  <input required name="fullName" type="text" value={formData.fullName} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-offwhite placeholder:text-white/30 focus:outline-none focus:border-luxury transition-colors" />
                </div>
                <div>
                  <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">Email Address *</label>
                  <input required name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-offwhite placeholder:text-white/30 focus:outline-none focus:border-luxury transition-colors" />
                </div>
                <div>
                  <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">Phone Number</label>
                  <input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-offwhite placeholder:text-white/30 focus:outline-none focus:border-luxury transition-colors" />
                </div>
                <div>
                  <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">LinkedIn URL</label>
                  <input name="linkedin" type="url" value={formData.linkedin} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-offwhite placeholder:text-white/30 focus:outline-none focus:border-luxury transition-colors" />
                </div>
              </div>

              {/* Dynamic Questions */}
              <div className="space-y-6 pt-6 border-t border-white/5">
                <h4 className="font-display text-lg text-offwhite">Role Specific Questions</h4>
                {questions.map((q) => (
                  <div key={q.id}>
                    <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">{q.label} *</label>
                    {q.type === 'textarea' ? (
                      <textarea 
                        required 
                        rows={4}
                        value={formData.answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-offwhite placeholder:text-white/30 focus:outline-none focus:border-luxury transition-colors resize-none"
                      />
                    ) : (
                      <input 
                        required 
                        type={q.type}
                        value={formData.answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-offwhite placeholder:text-white/30 focus:outline-none focus:border-luxury transition-colors"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Resume Upload */}
              <div className="pt-6 border-t border-white/5">
                <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-4">Resume / CV (PDF only, Max 5MB) *</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                    formData.resume 
                      ? 'border-luxury bg-luxury/5' 
                      : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="hidden"
                  />
                  {formData.resume ? (
                    <div className="flex items-center justify-center gap-3 text-luxury">
                      <CheckCircle size={24} />
                      <span className="font-ui text-sm">{formData.resume.name}</span>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, resume: null });
                        }}
                        className="p-1 hover:bg-luxury/20 rounded-full ml-2"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-offwhite/40">
                      <Upload size={32} />
                      <span className="font-ui text-xs tracking-widest uppercase">Click to upload PDF</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-8">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-luxury text-void font-ui font-bold text-sm uppercase tracking-widest py-4 rounded-lg hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(232,207,160,0.1)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
};
