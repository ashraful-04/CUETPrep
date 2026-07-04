import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

export default function MockExam() {
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionIndex]: selectedOptionIndex }
  const [markedForReview, setMarkedForReview] = useState({}); // { [questionIndex]: boolean }
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load exam data from localStorage
    const savedExam = localStorage.getItem('currentExam');
    if (!savedExam) {
      navigate('/mocktest');
      return;
    }
    
    try {
      const parsedExam = JSON.parse(savedExam);
      if (!parsedExam.questions || parsedExam.questions.length === 0) {
        navigate('/mocktest');
        return;
      }
      setExamData(parsedExam);
      setTimeLeft(parsedExam.durationSeconds || parsedExam.totalQuestions * 60);
    } catch (e) {
      navigate('/mocktest');
    }
  }, [navigate]);

  useEffect(() => {
    if (timeLeft <= 0 && examData) {
      submitTest();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, examData]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optIndex) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: optIndex }));
  };

  const toggleMarkForReview = () => {
    setMarkedForReview(prev => ({ ...prev, [currentQuestionIndex]: !prev[currentQuestionIndex] }));
  };

  const submitTest = async () => {
    if (isSubmitting || !examData) return;
    setIsSubmitting(true);
    
    // Calculate score: +4 for correct, -1 for incorrect, 0 for unattempted
    let score = 0;
    const evaluatedQuestions = examData.questions.map((q, index) => {
      const selectedOptIndex = answers[index];
      const userAnswer = selectedOptIndex !== undefined ? q.options[selectedOptIndex] : null;
      const isCorrect = userAnswer === q.correctAnswer;
      
      if (userAnswer) {
        if (isCorrect) score += 4;
        else score -= 1;
      }

      return {
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer,
        isCorrect,
        explanation: q.explanation,
        subject: q.subject || 'math'
      };
    });

    const calculatedSections = {};
    evaluatedQuestions.forEach(q => {
      calculatedSections[q.subject] = (calculatedSections[q.subject] || 0) + 1;
    });

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${API_URL}/api/mocktest/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify({
          score,
          totalQuestions: totalQuestions,
          sections: calculatedSections,
          questions: evaluatedQuestions
        })
      });

      if (response.ok) {
        const resultData = await response.json();
        // Save result to local storage for the results page to pick up
        localStorage.setItem('lastTestResult', JSON.stringify(resultData));
        localStorage.removeItem('currentExam'); // clear active exam
        navigate('/mocktest/results');
      } else {
        alert("Failed to submit test. Saving locally.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting test.");
      setIsSubmitting(false);
    }
  };

  if (!examData) {
    return <div className="flex h-screen items-center justify-center">Loading Exam...</div>;
  }

  const currentQ = examData.questions[currentQuestionIndex];
  const totalQuestions = examData.questions.length;
  
  // Status counts
  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  // Let's assume unvisited is anything we haven't answered or marked (simple approximation)
  const notVisitedCount = totalQuestions - answeredCount;

  return (
    <div className="bg-surface-container-low text-on-surface min-h-screen antialiased flex flex-col">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant shadow-sm flex justify-between items-center px-2 md:px-margin-desktop h-16">
        <div className="flex items-center gap-2 md:gap-6 shrink-0">
          <span className="font-headline-sm md:font-headline-md text-headline-sm md:text-headline-md font-bold text-primary hidden sm:block">CUETPrep</span>
          <div className="hidden md:flex items-center gap-4 text-on-surface-variant font-title-lg">
            <span className="w-1 h-6 bg-outline-variant rounded-full"></span>
            <span className="font-medium">Mock Test</span>
            <span className="text-label-md bg-surface-container-high px-3 py-1 rounded-full border border-outline-variant">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-8 shrink-0">
          <div className="flex items-center gap-1 md:gap-3 bg-primary-container/10 px-2 md:px-4 py-1.5 md:py-2 rounded-xl border border-primary/20">
            <span className="material-symbols-outlined text-primary text-[20px] md:text-[24px]">timer</span>
            <span className={`font-display text-lg md:text-2xl font-bold tracking-wider ${timeLeft < 300 ? 'text-error animate-pulse' : 'text-primary'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="flex items-center">
            <button 
              onClick={submitTest}
              disabled={isSubmitting}
              className="border-2 border-error text-error font-bold px-3 md:px-6 py-1.5 md:py-2 rounded-lg hover:bg-error hover:text-on-error transition-all duration-200 active:scale-95 disabled:opacity-50 text-sm md:text-base whitespace-nowrap"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="pt-16 pb-20 flex min-h-screen">
        {/* Left Column: Question Area */}
        <section className="flex-1 w-full md:w-[75%] md:pr-80 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <span className="bg-primary-container/20 text-primary px-4 py-1.5 rounded-full font-label-md text-label-md border border-primary/20 uppercase tracking-wide">
                {Array.isArray(examData.subject) ? examData.subject.join(', ') : examData.subject}
              </span>
              <div className="flex gap-2">
                <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-md text-label-sm">+4 Marks</span>
                <span className="bg-error-container/20 text-error px-3 py-1 rounded-md text-label-sm">-1 Mark</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-headline-md font-bold text-primary">Q{currentQuestionIndex + 1}.</span>
                <div className="font-body-lg text-body-lg text-on-surface leading-relaxed whitespace-pre-wrap">
                  {currentQ.questionText.split(/\\n|\n/).map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 gap-4 mt-8">
              {currentQ.options.map((opt, idx) => {
                const isSelected = answers[currentQuestionIndex] === idx;
                const letter = String.fromCharCode(65 + idx); // A, B, C, D
                return (
                  <button 
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`group flex items-center gap-4 p-4 md:p-5 rounded-xl border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
                        : 'border-outline-variant bg-white hover:border-primary/40 hover:bg-primary/5'
                    }`}
                  >
                    <div className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base ${
                      isSelected ? 'bg-primary text-white shadow-sm' : 'border-2 border-outline-variant text-on-surface-variant group-hover:border-primary group-hover:text-primary'
                    }`}>
                      {letter}
                    </div>
                    <span className={`font-body-md text-body-md ${isSelected ? 'font-semibold text-on-surface' : 'text-on-surface'}`}>
                      {opt}
                    </span>
                    {isSelected && (
                      <span className="ml-auto material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-outline-variant/30 gap-2">
              <button 
                onClick={toggleMarkForReview}
                className={`px-3 md:px-6 py-2 rounded-lg font-bold border-2 transition-colors text-xs md:text-base text-center leading-tight ${
                  markedForReview[currentQuestionIndex] 
                    ? 'border-tertiary bg-tertiary-container text-on-tertiary-container' 
                    : 'border-outline text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {markedForReview[currentQuestionIndex] ? 'Unmark Review' : 'Mark for Review'}
              </button>
              
              <div className="flex gap-2 md:gap-4 shrink-0">
                <button 
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-3 md:px-6 py-2 rounded-lg font-bold border-2 border-outline-variant text-primary hover:bg-primary/5 transition-colors disabled:opacity-30 disabled:hover:bg-transparent text-sm md:text-base"
                >
                  Previous
                </button>
                <button 
                  onClick={() => {
                    if (currentQuestionIndex < totalQuestions - 1) {
                      setCurrentQuestionIndex(prev => prev + 1);
                    }
                  }}
                  className="px-6 md:px-8 py-2 rounded-lg font-bold bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-md active:scale-95 text-sm md:text-base"
                >
                  {currentQuestionIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Right Column: SideNavBar */}
        <aside className="w-80 fixed right-0 top-16 h-[calc(100vh-64px)] bg-surface-container-low border-l border-outline-variant flex-col p-6 gap-6 hidden md:flex">
          <div className="space-y-1">
            <h2 className="font-title-lg text-title-lg text-on-surface">Question Palette</h2>
            <p className="text-label-md text-on-surface-variant">{totalQuestions} Questions Total</p>
          </div>
          
          {/* Stats Legend */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-highest">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              <span className="text-label-sm text-on-surface-variant">Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-highest">
              <span className="w-3 h-3 rounded-full bg-tertiary"></span>
              <span className="text-label-sm text-on-surface-variant">Marked ({markedCount})</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-highest">
              <span className="w-3 h-3 rounded-full bg-surface-container-lowest border border-outline-variant"></span>
              <span className="text-label-sm text-on-surface-variant">Not Visited</span>
            </div>
          </div>
          
          {/* Question Grid */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mt-4">
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: totalQuestions }).map((_, idx) => {
                const isAnswered = answers[idx] !== undefined;
                const isMarked = markedForReview[idx];
                const isCurrent = currentQuestionIndex === idx;
                
                let btnClasses = "w-full aspect-square max-w-[44px] flex items-center justify-center rounded-lg font-bold text-sm transition-all outline-none focus:outline-none ";
                
                if (isCurrent) {
                  btnClasses += "border-2 border-primary bg-primary/10 text-primary font-extrabold shadow-sm";
                } else if (isMarked) {
                  btnClasses += "bg-[#ab5d18] text-white shadow-sm border border-[#ab5d18]"; 
                } else if (isAnswered) {
                  btnClasses += "bg-primary text-white shadow-sm border border-primary";
                } else {
                  btnClasses += "bg-white border border-outline-variant text-on-surface-variant hover:bg-surface-container-high";
                }

                return (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={btnClasses}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
