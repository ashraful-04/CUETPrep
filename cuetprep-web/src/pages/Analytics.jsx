import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { API_URL } from '../config';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_URL}/api/analytics`, {
          headers: {
            'Authorization': `Bearer ${userInfo.token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-error">Failed to load analytics</h2>
        </div>
      </Layout>
    );
  }

  const { quickStats, focusArea, scoreTrend, studyDistribution, sectionPerformance } = data;
  const PIE_COLORS = ['#7C3AED', '#A78BFA', '#DDD6FE', '#F5F3FF'];

  return (
    <Layout>
      <div className="max-w-container-max mx-auto flex flex-col gap-8">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Your Analytics</h1>
            <p className="text-on-surface-variant font-body-md text-body-md mt-1">
              Based on {quickStats.totalTests || 0} mock tests taken
            </p>
          </div>
        </section>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Quick Stats Row */}
          <div className="md:col-span-3 bg-surface-container-lowest p-6 rounded-xl custom-shadow border border-gray-100 transition-transform hover:scale-[1.02]">
            <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Best Score</p>
            <h3 className="font-headline-md text-headline-md text-primary">{quickStats.bestScore}</h3>
          </div>
          
          <div className="md:col-span-3 bg-surface-container-lowest p-6 rounded-xl custom-shadow border border-gray-100 transition-transform hover:scale-[1.02]">
            <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Worst Score</p>
            <h3 className="font-headline-md text-headline-md text-error">{quickStats.worstScore}</h3>
            {quickStats.worstScoreDate && (
              <div className="mt-4 flex items-center gap-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">event</span>
                <span className="text-xs">On {new Date(quickStats.worstScoreDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="md:col-span-3 bg-surface-container-lowest p-6 rounded-xl custom-shadow border border-gray-100 transition-transform hover:scale-[1.02]">
            <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Most Studied</p>
            <h3 className="font-headline-md text-headline-md text-on-surface truncate">{quickStats.mostStudied}</h3>
            <div className="mt-4 flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
              <span className="text-xs">{quickStats.mostStudiedHours} hours total</span>
            </div>
          </div>

          <div className="md:col-span-3 bg-surface-container-lowest p-6 rounded-xl custom-shadow border border-gray-100 transition-transform hover:scale-[1.02]">
            <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Total Study Time</p>
            <h3 className="font-headline-md text-headline-md text-on-surface">{quickStats.totalStudyTime} hrs</h3>
          </div>

          {/* Weak Topic Alert */}
          {focusArea.name !== 'None' && (
            <div className="md:col-span-12 bg-[#FFF8F1] border-l-8 border-[#FF9800] p-6 rounded-xl flex items-start gap-4">
              <span className="material-symbols-outlined text-[#FF9800] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <div>
                <h4 className="font-title-lg text-title-lg text-[#854D0E] mb-1">Focus Area Detected</h4>
                <p className="font-body-md text-body-md text-[#A16207]">
                  Your average accuracy in <span className="font-bold">{focusArea.name}</span> is <span className="font-bold">{focusArea.percentage}%</span> across your tests. 
                  <br className="md:hidden" />
                  Recommended focus topics: {focusArea.recommended.map((r, i) => <span key={i} className="font-bold">{r}{i < focusArea.recommended.length - 1 ? ', ' : ''}</span>)}.
                </p>
              </div>
            </div>
          )}

          {/* Score Trend Line Chart */}
          <div className="md:col-span-8 bg-surface-container-lowest p-6 rounded-xl custom-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-title-lg text-title-lg text-on-surface">Score Trend (%)</h3>
            </div>
            
            <div className="h-64 w-full">
              {scoreTrend && scoreTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#7C3AED" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#7C3AED', strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-on-surface-variant">
                  Take a mock test to see your score trend!
                </div>
              )}
            </div>
          </div>

          {/* Section Scores Bar Chart */}
          <div className="md:col-span-4 bg-surface-container-lowest p-6 rounded-xl custom-shadow border border-gray-100">
            <h3 className="font-title-lg text-title-lg text-on-surface mb-8">Section Performance</h3>
            <div className="space-y-6">
              {sectionPerformance && sectionPerformance.length > 0 ? (
                sectionPerformance.map((sec, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-2">
                      <span className="font-label-md text-label-md text-on-surface">{sec.subject}</span>
                      <span className={`font-label-md text-label-md font-bold ${sec.score < 50 ? 'text-error' : 'text-primary'}`}>
                        {sec.score}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${sec.score < 50 ? 'bg-error' : 'bg-primary'}`} 
                        style={{ width: `${sec.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-on-surface-variant text-sm text-center mt-10">No section data yet.</div>
              )}
            </div>
          </div>

          {/* Study Time Distribution Pie Chart */}
          <div className="md:col-span-12 bg-surface-container-lowest p-6 rounded-xl custom-shadow border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 w-full">
              <h3 className="font-title-lg text-title-lg text-on-surface mb-2">Study Time Distribution</h3>
              <p className="text-body-sm text-on-surface-variant mb-6">A breakdown of where you spend your study hours.</p>
              
              <div className="flex flex-col gap-4">
                {studyDistribution && studyDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></div>
                    <span className="text-label-md font-medium flex-1">{item.name}</span>
                    <span className="text-label-md text-on-surface-variant font-bold">{item.value} hrs</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full h-[250px] flex justify-center">
              {studyDistribution && studyDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studyDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {studyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} Hours`, 'Time']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-on-surface-variant text-sm">
                  Log your study hours to see the chart!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
