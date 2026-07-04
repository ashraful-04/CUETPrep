import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MockResults() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const savedResult = localStorage.getItem('lastTestResult');
    if (!savedResult) {
      navigate('/mocktest');
      return;
    }
    try {
      setResult(JSON.parse(savedResult));
    } catch (e) {
      navigate('/mocktest');
    }
  }, [navigate]);

  if (!result) return <div className="h-screen flex items-center justify-center">Loading results...</div>;

  const totalQuestions = result.totalQuestions || 0;
  
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  result.questions?.forEach(q => {
    if (q.isCorrect) correctCount++;
    else if (q.userAnswer) wrongCount++;
    else skippedCount++;
  });

  const accuracy = totalQuestions > 0 ? ((correctCount / (correctCount + wrongCount)) * 100 || 0).toFixed(1) : 0;
  const isPass = correctCount >= (totalQuestions * 0.4); // Just an arbitrary 40% pass line

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky bg-surface border-b border-surface-variant shadow-sm z-50">
        <div className="flex justify-between items-center h-16 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="font-headline-md text-headline-md font-bold text-primary">CUETPrep</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-8 items-center">
              <span className="font-label-md text-label-md text-primary font-bold border-b-2 border-primary px-3 py-2">Test Results</span>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-bold hover:opacity-90"
            >
              Exit to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center py-10 px-4 md:px-8">
        <div className="max-w-4xl w-full flex flex-col gap-8">
          {/* Result Hero Section */}
          <section className="bg-gradient-to-br from-primary to-[#630ed4] rounded-xl p-8 md:p-12 text-white shadow-lg relative overflow-hidden text-center hover:scale-[1.02] transition-transform duration-200">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="text-6xl mb-2">{isPass ? '😊' : '😔'}</div>
              <div className={`${isPass ? 'bg-green-500' : 'bg-red-500'} text-white px-4 py-1 rounded-full font-bold text-sm tracking-wide shadow-sm inline-block`}>
                {isPass ? 'PASS' : 'NEEDS WORK'}
              </div>
              <h2 className="font-headline-lg text-headline-lg font-bold">Mock Test Performance</h2>
              <div className="flex flex-col md:flex-row items-center gap-8 mt-4">
                <div className="flex flex-col">
                  <span className="text-white/80 font-label-md text-label-md uppercase tracking-widest">Your Score</span>
                  <span className="text-5xl font-extrabold">{result.score} <span className="text-2xl text-white/70">/ {totalQuestions * 4}</span></span>
                </div>
                <div className="h-12 w-px bg-white/20 hidden md:block"></div>
                <div className="flex flex-col">
                  <span className="text-white/80 font-label-md text-label-md uppercase tracking-widest">Accuracy</span>
                  <span className="text-5xl font-extrabold">{accuracy}%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Score Breakdown Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-surface-variant shadow-sm flex flex-col items-center gap-2 hover:scale-[1.02] transition-transform">
              <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
              <span className="font-body-md text-body-md text-on-surface-variant">Correct</span>
              <span className="font-headline-md text-headline-md font-bold text-green-600">{correctCount} <span className="text-sm font-medium">(+{(correctCount*4)})</span></span>
            </div>
            <div className="bg-white p-6 rounded-xl border border-surface-variant shadow-sm flex flex-col items-center gap-2 hover:scale-[1.02] transition-transform">
              <span className="material-symbols-outlined text-error text-4xl">cancel</span>
              <span className="font-body-md text-body-md text-on-surface-variant">Wrong</span>
              <span className="font-headline-md text-headline-md font-bold text-error">{wrongCount} <span className="text-sm font-medium">(-{wrongCount})</span></span>
            </div>
            <div className="bg-white p-6 rounded-xl border border-surface-variant shadow-sm flex flex-col items-center gap-2 hover:scale-[1.02] transition-transform">
              <span className="material-symbols-outlined text-gray-400 text-4xl">do_not_disturb_on</span>
              <span className="font-body-md text-body-md text-on-surface-variant">Skipped</span>
              <span className="font-headline-md text-headline-md font-bold text-gray-500">{skippedCount}</span>
            </div>
          </section>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button 
              onClick={() => navigate('/mocktest/review')}
              className="flex-1 bg-primary text-white font-bold text-lg py-4 rounded-xl hover:bg-primary-container shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">plagiarism</span>
              Review Answers & Explanations
            </button>
            <button 
              onClick={() => navigate('/mocktest')}
              className="flex-1 bg-surface-container text-primary font-bold text-lg py-4 rounded-xl border border-outline-variant hover:bg-surface-container-high transition-all active:scale-95"
            >
              Take Another Test
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
