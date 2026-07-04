import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MockReview() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [filter, setFilter] = useState('All'); // All, Correct, Wrong, Skipped

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

  if (!result) return <div className="h-screen flex items-center justify-center">Loading review...</div>;

  let activeSection = Object.entries(result.sections || {}).find(([k, v]) => v > 0);
  const subjectName = activeSection ? activeSection[0] : 'Mock Test';
  
  const sectionsToRender = Object.entries(result.sections || {}).filter(([k, v]) => v > 0);
  if (sectionsToRender.length === 0) sectionsToRender.push(['Mock Test', result.totalQuestions]);

  let wrongCount = 0;
  let correctCount = 0;
  let skippedCount = 0;
  result.questions.forEach(q => {
    if (q.isCorrect) correctCount++;
    else if (!q.userAnswer) skippedCount++;
    else wrongCount++;
  });

  const questionsToRender = result.questions
    .map((q, idx) => ({ ...q, originalIndex: idx + 1 }))
    .filter(q => {
      if (filter === 'All') return true;
      if (filter === 'Correct') return q.isCorrect;
      if (filter === 'Wrong') return !q.isCorrect && q.userAnswer;
      if (filter === 'Skipped') return !q.userAnswer;
      return true;
    });

  return (
    <div className="bg-surface font-sans text-on-surface min-h-screen pb-20">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-outline-variant px-4 md:px-8 py-4 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => navigate('/mocktest/results')} className="flex items-center gap-1 text-primary font-bold hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              <span>Back to Results</span>
            </button>
            <div className="h-6 w-px bg-outline-variant hidden md:block mx-2"></div>
            <h1 className="text-xl font-bold text-on-surface">Review Answers</h1>
          </div>
          
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto justify-start md:justify-end no-scrollbar">
            {['All', 'Correct', 'Wrong', 'Skipped'].map(f => {
              const isActive = filter === f;
              let bgClass = isActive ? 'bg-primary text-white shadow-md' : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]';
              if (isActive && f === 'Correct') bgClass = 'bg-[#10b981] text-white shadow-md';
              if (isActive && f === 'Wrong') bgClass = 'bg-[#7c3aed] text-white shadow-md';
              
              return (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${bgClass}`}
                >
                  {f} {f === 'Correct' ? '✅' : f === 'Wrong' ? '❌' : f === 'Skipped' ? '⏭' : ''}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Sticky Summary Bar */}
      <div className="sticky top-[115px] md:top-[73px] z-40 bg-white border-b border-outline-variant shadow-sm py-3 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            <span className="text-sm font-semibold text-on-surface-variant">
              {filter === 'All' && `Showing all ${result.totalQuestions} questions`}
              {filter === 'Wrong' && `Showing ${wrongCount} wrong answers`}
              {filter === 'Correct' && `Showing ${correctCount} correct answers`}
              {filter === 'Skipped' && `Showing ${skippedCount} skipped answers`}
            </span>
          </div>
          <div className="flex items-center gap-4 flex-1 max-w-md sm:justify-end">
            <span className="text-xs font-bold text-primary whitespace-nowrap">Accuracy: {((correctCount/result.totalQuestions)*100).toFixed(1)}%</span>
            <div className="w-full bg-surface-variant h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full transition-all duration-500" style={{width: `${(correctCount/result.totalQuestions)*100}%`}}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar: Navigation */}
        <aside className="hidden lg:block w-64 shrink-0">
          <nav className="sticky top-40 space-y-2">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4 px-3">Sections</p>
            
            <button 
              onClick={() => navigate('/mocktest/results')}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>bar_chart</span>
                <span className="font-semibold text-[15px]">Overview</span>
              </div>
            </button>
            
            {/* Dynamic Subjects */}
            {sectionsToRender.map(([subject, count]) => (
              <button key={subject} className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#7c3aed] text-white shadow-md transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-white" style={{fontVariationSettings: "'FILL' 1"}}>school</span>
                  <span className="font-semibold text-[15px]">{subject}</span>
                </div>
                <span className="text-xs font-bold bg-white text-[#7c3aed] px-2 py-0.5 rounded-full">{count}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-10">
          
          {questionsToRender.length === 0 && (
            <div className="text-center py-20 text-on-surface-variant text-lg font-medium bg-white rounded-2xl border border-outline-variant">
              No questions match this filter.
            </div>
          )}

          {questionsToRender.map((q) => {
            const isCorrect = q.isCorrect;
            const isSkipped = !q.userAnswer;
            const isWrong = !isCorrect && !isSkipped;

            return (
              <section key={q.originalIndex} className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden p-6 md:p-8">
                {/* Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-outline-variant/30">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 rounded-md bg-[#111827] text-white text-sm font-black tracking-wide">Q{q.originalIndex}</span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#eff6ff] text-[#1d4ed8] text-sm font-bold">
                      <span className="material-symbols-outlined text-[16px]">computer</span>
                      {(() => {
                        const s = q.subject || subjectName;
                        return Array.isArray(s) ? s.join(', ') : s;
                      })()}
                    </span>
                  </div>
                  {isCorrect && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#dcfce7] text-[#166534] text-sm font-black tracking-wide">
                      <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                      Correct
                    </div>
                  )}
                  {isWrong && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fee2e2] text-[#991b1b] text-sm font-black tracking-wide">
                      <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>cancel</span>
                      Wrong
                    </div>
                  )}
                  {isSkipped && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-highest text-on-surface-variant text-sm font-black tracking-wide">
                      <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>do_not_disturb_on</span>
                      Skipped
                    </div>
                  )}
                </div>
                
                {/* Question Content */}
                <div className="mb-8">
                  <div className="text-[20px] font-bold text-on-surface leading-snug whitespace-pre-wrap">
                    {q.questionText.split(/\\n|\n/).map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Answers Display */}
                <div className="space-y-4 mb-10">
                  {q.options && q.options.length > 0 ? (
                    // Deduplicate options first to prevent duplicate rendering
                    [...new Set(q.options)].map((opt, optIdx) => {
                      const isOptCorrect = opt === q.correctAnswer;
                      const isOptUser = opt === q.userAnswer;
                      // Only mark as wrong user if they picked it AND it's not correct
                      const isOptWrongUser = isOptUser && !isOptCorrect;

                      if (isOptCorrect && isOptUser) {
                        // User picked the correct answer
                        return (
                          <div key={optIdx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border-2 border-[#10b981] bg-[#ecfdf5]">
                            <div className="flex flex-col">
                              <span className="text-[#065f46] font-bold text-[16px]">{opt}</span>
                              <span className="text-[11px] font-black text-[#10b981] tracking-widest mt-1 uppercase">CORRECT ANSWER ✓ YOUR ANSWER</span>
                            </div>
                            <span className="material-symbols-outlined text-[#10b981] text-[24px] mt-2 sm:mt-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          </div>
                        );
                      }

                      if (isOptCorrect) {
                        return (
                          <div key={optIdx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border-2 border-[#10b981] bg-[#ecfdf5]">
                            <div className="flex flex-col">
                              <span className="text-[#065f46] font-bold text-[16px]">{opt}</span>
                              <span className="text-[11px] font-black text-[#10b981] tracking-widest mt-1 uppercase">CORRECT ANSWER</span>
                            </div>
                            <span className="material-symbols-outlined text-[#10b981] text-[24px] mt-2 sm:mt-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          </div>
                        );
                      }

                      if (isOptWrongUser) {
                        return (
                          <div key={optIdx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border-2 border-[#ef4444] bg-[#fef2f2]">
                            <div className="flex flex-col">
                              <span className="text-[#991b1b] font-bold text-[16px]">{opt}</span>
                              <span className="text-[11px] font-black text-[#ef4444] tracking-widest mt-1 uppercase">YOUR ANSWER</span>
                            </div>
                            <span className="material-symbols-outlined text-[#ef4444] text-[24px] mt-2 sm:mt-0" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                          </div>
                        );
                      }

                      return (
                        <div key={optIdx} className="flex items-center justify-between p-4 rounded-xl border border-outline-variant bg-white">
                          <span className="text-on-surface-variant font-medium text-[16px]">{opt}</span>
                          <span className="material-symbols-outlined text-outline-variant text-[24px]">radio_button_unchecked</span>
                        </div>
                      );
                    })
                  ) : (
                    /* Fallback for old tests without options array */
                    <>
                      <div className="flex items-center justify-between p-4 rounded-xl border-2 border-[#10b981] bg-[#ecfdf5]">
                        <div className="flex flex-col">
                          <span className="text-[#065f46] font-bold text-[16px]">{q.correctAnswer}</span>
                          <span className="text-[11px] font-black text-[#10b981] tracking-widest mt-1 uppercase">CORRECT ANSWER</span>
                        </div>
                        <span className="material-symbols-outlined text-[#10b981] text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </div>
                      {isWrong && (
                        <div className="flex items-center justify-between p-4 rounded-xl border-2 border-[#ef4444] bg-[#fef2f2]">
                          <div className="flex flex-col">
                            <span className="text-[#991b1b] font-bold text-[16px]">{q.userAnswer}</span>
                            <span className="text-[11px] font-black text-[#ef4444] tracking-widest mt-1 uppercase">YOUR ANSWER</span>
                          </div>
                          <span className="material-symbols-outlined text-[#ef4444] text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Explanation Box */}
                {q.explanation && (
                  <div className="flex gap-4 p-6 rounded-xl bg-[#f5f3ff] border-l-[6px] border-[#7c3aed]">
                    <span className="material-symbols-outlined text-[#7c3aed] shrink-0 text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
                    <div className="flex flex-col gap-2">
                      <p className="text-[15px] font-bold text-[#7c3aed]">Explanation</p>
                      <p className="text-[15px] text-on-surface-variant leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}
