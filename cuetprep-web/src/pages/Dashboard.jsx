import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { API_URL } from '../config';

const MOTIVATIONAL_QUOTES = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "The secret of getting ahead is getting started.",
  "It’s not about having time. It’s about making time.",
  "Push yourself, because no one else is going to do it for you.",
  "Don't stop until you're proud.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dream bigger. Do bigger.",
  "Don't wait for opportunity. Create it.",
  "Sometimes later becomes never. Do it now.",
  "Great things never come from comfort zones."
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Study log form state
  const [studyHours, setStudyHours] = useState(2);
  const [studyTopic, setStudyTopic] = useState('');
  const [studySubject, setStudySubject] = useState('Mathematics');
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        navigate('/');
        return;
      }

      const response = await fetch(`${API_URL}/api/dashboard`, {
        headers: {
          'Authorization': `Bearer ${userInfo.token}`
        }
      });

      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      } else {
        if (response.status === 401) navigate('/');
        setError('Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStudyLog = async () => {
    if (!studyTopic) {
      alert("Please enter what you studied!");
      return;
    }
    
    setIsLogging(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${API_URL}/api/studylog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({
          subject: studySubject,
          description: studyTopic,
          durationHours: studyHours
        })
      });

      if (response.ok) {
        setStudyTopic('');
        setStudyHours(2);
        // Refresh dashboard data to show updated stats
        fetchDashboardData();
      } else {
        alert("Failed to save study log");
      }
    } catch (err) {
      alert("Error saving log");
    } finally {
      setIsLogging(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-on-surface-variant font-bold text-xl">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="p-8 text-center text-error bg-error-container rounded-xl">
          <p>{error || "Error loading data"}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-container-max mx-auto space-y-8">
        {/* Hero Card */}
        <section className="hero-gradient rounded-[16px] p-8 text-on-primary ambient-shadow flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="z-10 flex-1">
            <h1 className="font-headline-lg text-headline-lg mb-2">Welcome back, {data.name}!</h1>
            <p className="font-body-lg text-body-lg opacity-90 mb-6 italic">
              "{MOTIVATIONAL_QUOTES[Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24) % MOTIVATIONAL_QUOTES.length]}"
            </p>
            <div className="space-y-3 max-w-md">
              <div className="flex justify-between text-label-md">
                <span>Preparation Progress</span>
                <span>{Math.min(100, Math.round(((data.totalStudyHours || 0) / 500) * 100))}% of goal</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full shadow-lg transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, Math.round(((data.totalStudyHours || 0) / 500) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="z-10 flex gap-4 md:gap-6">
            <div className="glass-card w-24 h-28 flex flex-col items-center justify-center rounded-xl">
              <span className="text-4xl font-bold">
                {Math.max(0, Math.ceil((new Date('2027-03-01') - new Date()) / (1000 * 60 * 60 * 24)))}
              </span>
              <span className="text-label-sm uppercase tracking-wider opacity-80">Days</span>
            </div>
          </div>
        </section>

        {/* Stats Row */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-[16px] ambient-shadow border border-outline-variant/30 flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-default">
            <div className="p-3 bg-primary/10 rounded-xl text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">timer</span>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant">Total Study</p>
              <h3 className="text-headline-md font-bold">{Math.round(data.totalStudyHours || 0)} hrs</h3>
            </div>
          </div>
          <div 
            onClick={() => navigate('/mocktest/history')}
            className="bg-surface-container-lowest p-6 rounded-[16px] ambient-shadow border border-outline-variant/30 flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <div className="p-3 bg-tertiary/10 rounded-xl text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">assignment</span>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant">Mock Tests</p>
              <h3 className="text-headline-md font-bold">{data.mockTests?.length || 0} tests</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-[16px] ambient-shadow border border-outline-variant/30 flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-default">
            <div className="p-3 bg-secondary/10 rounded-xl text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">monitoring</span>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant">Avg. Score</p>
              <h3 className="text-headline-md font-bold">
                {data.mockTests?.length > 0 
                  ? Math.round(
                      (data.mockTests.reduce((acc, test) => acc + Math.max(0, test.score), 0) / 
                      data.mockTests.reduce((acc, test) => acc + (test.totalQuestions * 4), 0)) * 100
                    ) 
                  : 0}%
              </h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-[16px] ambient-shadow border border-outline-variant/30 flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-default">
            <div className="p-3 bg-error/10 rounded-xl text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">local_fire_department</span>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant">Daily Streak</p>
              <h3 className="text-headline-md font-bold">{data.streakDays || 0} days</h3>
            </div>
          </div>
        </section>

        {/* Grid Layout for Log and Tests */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Study Log Card */}
          <section className="lg:col-span-1 bg-surface-container-lowest rounded-[16px] p-6 ambient-shadow border border-outline-variant/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-title-lg text-title-lg">Log Today's Study</h2>
              <span className="material-symbols-outlined text-on-surface-variant">edit_note</span>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-label-md block mb-2">Duration (Hours)</label>
                <div className="flex items-center justify-between bg-surface-container-low border border-outline-variant rounded-xl p-1">
                  <button 
                    onClick={() => setStudyHours(Math.max(1, studyHours - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-surface-variant rounded-lg transition-colors text-primary"
                  >
                    <span className="material-symbols-outlined">remove</span>
                  </button>
                  <span className="text-headline-md font-bold">{studyHours}</span>
                  <button 
                    onClick={() => setStudyHours(studyHours + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-surface-variant rounded-lg transition-colors text-primary"
                  >
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="text-label-md block mb-2">Subject</label>
                <select 
                  value={studySubject}
                  onChange={(e) => setStudySubject(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-body-md focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Computers">Computers</option>
                  <option value="Reasoning">Reasoning</option>
                </select>
              </div>
              <div>
                <label className="text-label-md block mb-2">What did you study?</label>
                <textarea 
                  value={studyTopic}
                  onChange={(e) => setStudyTopic(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-body-md focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all h-24 outline-none resize-none" 
                  placeholder="E.g., Matrices, Operating Systems..."
                ></textarea>
              </div>
              <button 
                onClick={handleSaveStudyLog}
                disabled={isLogging}
                className="w-full bg-primary hover:bg-primary-container text-on-primary py-3 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLogging ? 'Saving...' : 'Save Study Log'}
              </button>
            </div>
          </section>

          {/* Recent Tests Card */}
          <section id="recent-activity" className="lg:col-span-2 bg-surface-container-lowest rounded-[16px] p-6 ambient-shadow border border-outline-variant/30 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-title-lg text-title-lg">Recent Activity</h2>
              <div className="flex gap-4">
                <button onClick={() => navigate('/mocktest')} className="text-sm font-bold text-primary hover:underline">Take a Mock Test</button>
              </div>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[400px]">
                <thead>
                  <tr className="text-on-surface-variant border-b border-outline-variant/30">
                    <th className="pb-4 font-label-md">Date</th>
                    <th className="pb-4 font-label-md">Activity</th>
                    <th className="pb-4 font-label-md">Topic</th>
                    <th className="pb-4 font-label-md">Result / Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {(() => {
                    const activities = [
                      ...(data.recentLogs || []).map(log => ({
                        id: log._id,
                        date: new Date(log.date),
                        type: 'Study Log',
                        topic: log.subject ? `${log.subject}: ${log.description}` : log.description,
                        metric: `${log.durationHours.toFixed(1)} hrs`,
                        icon: 'menu_book',
                        color: 'text-primary bg-primary/10'
                      })),
                      ...(data.mockTests || []).map(test => ({
                        id: test._id,
                        date: new Date(test.testDate || test.createdAt || Date.now()),
                        type: 'Mock Test',
                        topic: Object.keys(test.sections || {})[0] || 'Mixed Subjects',
                        metric: `Score: ${Math.max(0, test.score)}/${test.totalQuestions * 4}`,
                        icon: 'assignment',
                        color: 'text-tertiary bg-tertiary/10'
                      }))
                    ].sort((a, b) => b.date - a.date).slice(0, 8);

                    if (activities.length === 0) {
                      return (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-on-surface-variant">
                            No recent activity found. Time to hit the books!
                          </td>
                        </tr>
                      );
                    }

                    return activities.map(act => (
                      <tr 
                        key={act.id + act.type} 
                        onClick={() => {
                          if (act.type === 'Mock Test') {
                            const fetchTest = async () => {
                              try {
                                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                                const response = await fetch(`${API_URL}/api/mocktest/${act.id}`, {
                                  headers: { 'Authorization': `Bearer ${userInfo.token}` }
                                });
                                if (response.ok) {
                                  const testData = await response.json();
                                  localStorage.setItem('lastTestResult', JSON.stringify(testData));
                                  navigate('/mocktest/results');
                                } else {
                                  alert("Failed to fetch mock test details.");
                                }
                              } catch (err) {
                                alert("Error fetching mock test.");
                              }
                            };
                            fetchTest();
                          }
                        }}
                        className={`hover:bg-surface-container-low transition-colors group ${act.type === 'Mock Test' ? 'cursor-pointer' : ''}`}
                      >
                        <td className="py-4 text-body-md text-on-surface-variant">
                          {act.date.toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined text-[18px] p-1.5 rounded-md ${act.color}`}>
                              {act.icon}
                            </span>
                            <span className="font-bold text-sm text-on-surface">{act.type}</span>
                          </div>
                        </td>
                        <td className="py-4 text-body-md font-medium text-on-surface">
                          {act.topic}
                        </td>
                        <td className="py-4 font-bold text-on-surface">
                          {act.metric}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
