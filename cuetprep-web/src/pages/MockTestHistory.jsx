import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { API_URL } from '../config';

export default function MockTestHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${API_URL}/api/mocktest/history`, {
        headers: {
          'Authorization': `Bearer ${userInfo?.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching mock test history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMockTest = async (testId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${API_URL}/api/mocktest/${testId}`, {
        headers: {
          'Authorization': `Bearer ${userInfo?.token}`
        }
      });
      if (response.ok) {
        const testData = await response.json();
        localStorage.setItem('lastTestResult', JSON.stringify(testData));
        navigate('/mocktest/results');
      }
    } catch (error) {
      console.error('Failed to fetch mock test data', error);
    }
  };

  const handleDeleteTest = async (e, testId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this mock test? This cannot be undone.')) return;
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${API_URL}/api/mocktest/${testId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userInfo?.token}`
        }
      });
      if (response.ok) {
        setHistory(prev => prev.filter(test => test._id !== testId));
      } else {
        alert('Failed to delete mock test');
      }
    } catch (error) {
      console.error('Failed to delete mock test', error);
    }
  };

  return (
    <Layout>
      <div className="max-w-[1000px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Mock Test History</h1>
            <p className="text-body-lg text-on-surface-variant mt-1">Review all your past mock tests and scores</p>
          </div>
          <button 
            onClick={() => navigate('/mocktest')}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-container transition-colors shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            New Test
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
            <span className="material-symbols-outlined animate-spin text-primary text-[32px]">sync</span>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 text-center">
            <div className="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px]">assignment</span>
            </div>
            <h3 className="text-title-lg font-bold mb-2">No tests taken yet</h3>
            <p className="text-on-surface-variant mb-6">Start taking mock tests to see your history here.</p>
            <button 
              onClick={() => navigate('/mocktest')}
              className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:opacity-90"
            >
              Take First Test
            </button>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-outline-variant/30">
                  <tr>
                    <th className="px-6 py-4 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Subjects</th>
                    <th className="px-6 py-4 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Score</th>
                    <th className="px-6 py-4 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {history.map((test) => {
                    const sections = Object.entries(test.sections || {}).filter(([_, count]) => count > 0);
                    
                    const maxScore = test.totalQuestions * 4;
                    const accuracy = ((test.score / maxScore) * 100).toFixed(1);
                    const date = new Date(test.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    });

                    return (
                      <tr 
                        key={test._id}
                        onClick={() => handleViewMockTest(test._id)}
                        className="hover:bg-surface-container-low transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="text-body-md text-on-surface font-medium">{date}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {sections.length > 0 ? sections.map(([subj]) => (
                              <span key={subj} className="text-[12px] font-bold bg-[#eff6ff] text-[#1d4ed8] px-2.5 py-1 rounded-md border border-[#bfdbfe]">
                                {subj}
                              </span>
                            )) : (
                              <span className="text-[12px] font-bold bg-surface-container-high text-on-surface-variant px-2.5 py-1 rounded-md">
                                Mock Test
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-title-md font-bold ${test.score > 0 ? 'text-[#10b981]' : test.score < 0 ? 'text-[#ef4444]' : 'text-on-surface'}`}>
                              {test.score}
                            </span>
                            <span className="text-label-sm text-on-surface-variant">/ {maxScore}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-body-md font-bold">{accuracy}%</span>
                            <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden hidden sm:block">
                              <div 
                                className="h-full bg-primary transition-all" 
                                style={{ width: `${Math.max(0, accuracy)}%` }}
                              ></div>
                            </div>
                            <div className="flex items-center ml-auto gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => handleDeleteTest(e, test._id)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-error hover:bg-error/10 transition-colors"
                                title="Delete Test"
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                              <span className="material-symbols-outlined text-outline text-[20px]">
                                chevron_right
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
