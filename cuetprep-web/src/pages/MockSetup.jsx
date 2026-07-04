import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { API_URL } from '../config';

export default function MockSetup() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('Medium');
  const [qCount, setQCount] = useState(10);
  const [duration, setDuration] = useState(15);
  const [subject, setSubject] = useState(['math']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleQCount = (count, time) => {
    setQCount(count);
    setDuration(time);
  };

  const generateTest = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      
      const response = await fetch(`${API_URL}/api/mocktest/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify({
          subjects: subject,
          difficulty: difficulty,
          testLength: qCount
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate test. Please check API settings.');
      }

      const data = await response.json();
      
      // Save current exam state to localStorage so MockExam can pick it up
      localStorage.setItem('currentExam', JSON.stringify({
        questions: data.questions,
        subject,
        durationSeconds: duration * 60,
        totalQuestions: qCount
      }));

      // Navigate to exam page
      navigate('/mocktest/exam');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error generating test. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center w-full">
        <div className="w-full max-w-[600px]">
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Start Mock Test</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">AI-powered questions from CUET PG MCA syllabus</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full border border-outline-variant">
              <span className="text-[12px] font-semibold text-on-surface-variant">Powered by Claude AI</span>
              <span>🤖</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Configuration Card */}
          <div className="bg-surface-container-lowest rounded-xl p-8 custom-shadow border border-outline-variant/30">
            {/* Section 1: Subject Selection */}
            <div className="mb-8">
              <h3 className="text-label-md font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">layers</span>
                1. Section Selection (Select multiple)
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'math', title: 'Mathematics', icon: 'functions' },
                  { id: 'computers', title: 'Computers', icon: 'computer' },
                  { id: 'reasoning', title: 'Reasoning', icon: 'psychology' }
                ].map((sub) => {
                  const isChecked = subject.includes(sub.id);
                  return (
                    <label key={sub.id} className="relative cursor-pointer group">
                      <input 
                        type="checkbox" 
                        name="subject"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked && subject.length === 1) return; // Prevent unchecking the last option
                          setSubject(prev => isChecked ? prev.filter(s => s !== sub.id) : [...prev, sub.id]);
                        }}
                        className="peer sr-only" 
                      />
                      <div className="flex items-center justify-between p-4 border rounded-xl transition-all peer-checked:bg-primary-container peer-checked:border-primary-container border-outline-variant hover:bg-surface-container-low">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-peer-checked:bg-white/20 group-peer-checked:text-white transition-colors">
                            <span className="material-symbols-outlined">{sub.icon}</span>
                          </div>
                          <span className="font-medium text-on-surface peer-checked:text-white transition-colors">{sub.title}</span>
                        </div>
                        <span className="material-symbols-outlined text-primary peer-checked:text-white opacity-0 peer-checked:opacity-100 transition-opacity">
                          check_box
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Difficulty */}
            <div className="mb-8">
              <h3 className="text-label-md font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">speed</span>
                2. Difficulty
              </h3>
              <div className="flex gap-2 p-1 bg-surface-container rounded-full border border-outline-variant/30">
                {['Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 py-2 px-4 rounded-full text-label-md transition-all ${
                      difficulty === diff ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Question Count */}
            <div className="mb-8">
              <h3 className="text-label-md font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">format_list_numbered</span>
                3. Question Count
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { count: 5, time: 5 },
                  { count: 10, time: 15 },
                  { count: 25, time: 30 },
                  { count: 75, time: 90, recommended: true }
                ].map((opt) => (
                  <button
                    key={opt.count}
                    onClick={() => handleQCount(opt.count, opt.time)}
                    className={`relative p-4 rounded-xl transition-all text-center border-2 ${
                      qCount === opt.count 
                        ? 'border-primary bg-primary-container/5' 
                        : 'border-outline-variant hover:border-primary/50'
                    }`}
                  >
                    {opt.recommended && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter w-24">
                        Real Exam
                      </span>
                    )}
                    <span className={`block text-title-lg font-bold ${qCount === opt.count ? 'text-primary' : 'text-on-surface'}`}>
                      {opt.count}
                    </span>
                    <span className={`text-[12px] ${qCount === opt.count ? 'text-primary/70' : 'text-on-surface-variant'}`}>
                      Q's
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 4: Duration */}
            <div className="mb-8">
              <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl border border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">timer</span>
                  <span className="text-label-md font-medium text-on-surface-variant">Test Duration</span>
                </div>
                <span className="text-title-lg font-bold text-primary">{duration} mins</span>
              </div>
            </div>



            {/* CTA */}
            <button 
              onClick={generateTest}
              disabled={isGenerating}
              className="w-full bg-primary hover:bg-primary-container text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 group shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  Claude is thinking...
                </>
              ) : (
                <>
                  Generate & Start Test
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </>
              )}
            </button>
            <p className="text-center text-[12px] text-on-surface-variant mt-6">
              Questions are generated fresh by AI each time. Please wait 10-15 seconds.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
