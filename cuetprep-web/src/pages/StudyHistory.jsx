import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { API_URL } from '../config';

function StudyHistory() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('All');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_URL}/api/studylog`, {
          headers: {
            'Authorization': `Bearer ${userInfo.token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setLogs(data.logs || []);
        }
      } catch (error) {
        console.error('Failed to fetch study logs', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [navigate]);

  const filteredLogs = filterSubject === 'All' 
    ? logs 
    : logs.filter(log => log.subject === filterSubject);

  return (
    <Layout>
      <div className="max-w-container mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button 
                onClick={() => navigate('/studylog')}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h1 className="font-display text-display-sm text-on-surface font-bold">Study History</h1>
            </div>
            <p className="text-body-lg text-on-surface-variant max-w-2xl ml-13">
              Review all your past study sessions and topics covered.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl ambient-shadow border border-outline-variant/30 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-label-lg font-medium text-on-surface-variant">Filter by Subject:</span>
            <div className="flex flex-wrap gap-2">
              {['All', 'Mathematics', 'Computers', 'Reasoning'].map(sub => (
                <button
                  key={sub}
                  onClick={() => setFilterSubject(sub)}
                  className={`px-4 py-2 rounded-lg text-label-md font-bold uppercase tracking-wide transition-all ${
                    filterSubject === sub 
                      ? 'bg-primary text-on-primary shadow-md' 
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-surface-container-lowest rounded-2xl ambient-shadow border border-outline-variant/30 p-6 md:p-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-outline mb-4">history</span>
              <h3 className="font-title-lg text-on-surface font-bold mb-2">No Study Logs Found</h3>
              <p className="text-on-surface-variant">
                {filterSubject === 'All' 
                  ? "You haven't logged any study sessions yet." 
                  : `You haven't logged any ${filterSubject} sessions yet.`}
              </p>
              <button 
                onClick={() => navigate('/studylog')}
                className="mt-6 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Log a Session
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredLogs.map(log => (
                <div key={log._id} className="p-5 rounded-xl bg-surface-container-low/50 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-container-low hover:border-outline-variant transition-colors group">
                  
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded bg-primary-container/20 text-primary text-[10px] font-bold uppercase tracking-wide">
                        {log.subject}
                      </span>
                      <span className="text-label-sm text-outline font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {log.durationHours} {log.durationHours === 1 ? 'Hour' : 'Hours'}
                      </span>
                    </div>
                    <p className="text-body-lg text-on-surface">"{log.description}"</p>
                  </div>

                  <div className="flex flex-col md:items-end justify-center">
                    <div className="text-label-lg font-bold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
                      {new Date(log.date).toLocaleDateString(undefined, { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                    <div className="text-label-sm text-outline mt-1">
                      Added at {new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default StudyHistory;
