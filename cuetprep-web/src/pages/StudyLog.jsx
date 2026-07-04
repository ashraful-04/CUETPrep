import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

export default function StudyLog() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [streakDays, setStreakDays] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationHours, setDurationHours] = useState(2);
  const [subject, setSubject] = useState('Mathematics');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${API_URL}/api/studylog`, {
        headers: { 'Authorization': `Bearer ${userInfo?.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setStreakDays(data.streakDays || 0);
      }
    } catch (error) {
      console.error('Failed to fetch study logs', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLog = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Please enter a description of what you studied.");
      return;
    }

    setIsSaving(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${API_URL}/api/studylog`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}` 
        },
        body: JSON.stringify({
          subject,
          description,
          durationHours,
          date
        })
      });

      if (response.ok) {
        // Reset form
        setDescription('');
        setDurationHours(2);
        setDate(new Date().toISOString().split('T')[0]);
        // Refresh data
        fetchLogs();
      } else {
        let errStr = "Failed to save study log";
        try {
           const errData = await response.json();
           if(errData.message) errStr += ": " + errData.message;
           if(errData.error) errStr += " | " + errData.error;
        } catch(e) {}
        alert(errStr);
      }
    } catch (error) {
      console.error('Error saving log', error);
      alert("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Generate last 90 days array for the activity map
  const last90Days = [];
  const logDateMap = {};
  logs.forEach(log => {
    const logDate = new Date(log.date).toISOString().split('T')[0];
    if (!logDateMap[logDate]) logDateMap[logDate] = 0;
    logDateMap[logDate] += log.durationHours || 0;
  });

  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last90Days.push(d.toISOString().split('T')[0]);
  }

  return (
    <Layout>
      <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Streak Card */}
          <div className="bg-surface-container-lowest p-6 rounded-xl ambient-shadow border border-outline-variant/30 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary-container/10 rounded-full flex items-center justify-center mb-4 text-5xl">
              🔥
            </div>
            <h2 className="font-headline-md text-headline-md text-primary-container mb-2 font-bold">{streakDays} Day Streak!</h2>
            <div className="flex gap-2 mb-6 mt-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                // simple mock visualization of a week based on the streak size
                const isActive = streakDays > (6 - idx);
                return (
                  <div key={day} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white mb-1 transition-colors ${isActive ? 'bg-primary-container' : 'bg-surface-container-high'}`}>
                      {isActive && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-outline">{day}</span>
                  </div>
                );
              })}
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">Keep going! Consistency is key to acing CUET PG.</p>
          </div>

          {/* Activity Heatmap */}
          <div className="bg-surface-container-lowest p-6 rounded-xl ambient-shadow border border-outline-variant/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Your Study Activity</h3>
              <div className="text-label-sm text-outline">Last 90 days</div>
            </div>
            
            {/* Months Header Mockup */}
            <div className="flex justify-between text-label-sm text-outline mb-2 px-2">
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>

            <div className="flex justify-center">
              <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-2 w-full max-w-full">
                {last90Days.map((d, i) => {
                  const hours = logDateMap[d] || 0;
                  let colorClass = 'bg-primary/5'; // default empty
                  
                  if (hours > 3) colorClass = 'bg-primary';
                  else if (hours > 1.5) colorClass = 'bg-primary/70';
                  else if (hours > 0) colorClass = 'bg-primary/40';

                  return (
                    <div 
                      key={d} 
                      title={`${d}: ${hours ? hours + ' hours' : 'No activity'}`}
                      className={`aspect-square rounded-[4px] transition-colors hover:ring-2 hover:ring-offset-1 hover:ring-primary/50 cursor-pointer ${colorClass}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-end items-center gap-1.5 mt-6 text-label-sm text-outline">
              <span>Less</span>
              <div className="w-4 h-4 rounded-[3px] bg-primary/5"></div>
              <div className="w-4 h-4 rounded-[3px] bg-primary/40"></div>
              <div className="w-4 h-4 rounded-[3px] bg-primary/70"></div>
              <div className="w-4 h-4 rounded-[3px] bg-primary"></div>
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Log Entry Form */}
          <div className="bg-surface-container-lowest p-6 rounded-xl ambient-shadow border border-outline-variant/30">
            <h3 className="font-title-lg text-title-lg text-on-surface mb-6 font-bold">Add Study Log</h3>
            <form className="space-y-6" onSubmit={handleSaveLog}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-label-md text-on-surface-variant font-medium">Date</label>
                  <input 
                    className="w-full rounded-xl border-outline-variant focus:ring-primary focus:border-primary bg-transparent text-on-surface p-2.5 outline-none" 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-label-md text-on-surface-variant font-medium">Hours Studied</label>
                  <div className="flex items-center">
                    <button 
                      onClick={() => setDurationHours(Math.max(1, durationHours - 1))}
                      className="w-12 h-[46px] flex items-center justify-center border border-outline-variant rounded-l-xl bg-surface-container-low hover:bg-surface-variant transition-colors" 
                      type="button"
                    >-</button>
                    <input 
                      className="w-full text-center border-y border-x-0 border-outline-variant focus:ring-0 bg-transparent text-on-surface h-[46px] outline-none" 
                      type="number" 
                      min="1"
                      value={durationHours} 
                      onChange={(e) => setDurationHours(Number(e.target.value))}
                    />
                    <button 
                      onClick={() => setDurationHours(durationHours + 1)}
                      className="w-12 h-[46px] flex items-center justify-center border border-outline-variant rounded-r-xl bg-surface-container-low hover:bg-surface-variant transition-colors" 
                      type="button"
                    >+</button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-label-md text-on-surface-variant font-medium">Subject</label>
                <div className="flex flex-wrap gap-3">
                  {['Mathematics', 'Computers', 'Reasoning'].map(sub => (
                    <label 
                      key={sub}
                      onClick={() => setSubject(sub)}
                      className={`cursor-pointer px-4 py-2 rounded-full border text-label-md transition-all font-bold ${subject === sub ? 'border-primary text-primary bg-primary/10' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'}`}
                    >
                      {sub}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-label-md text-on-surface-variant font-medium">What topics did you cover today?</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border-outline-variant focus:ring-primary focus:border-primary bg-transparent text-on-surface resize-none p-3 outline-none" 
                  placeholder="e.g., Practiced integration and solved 20 problems..." 
                  rows="3"
                  required
                ></textarea>
              </div>
              <button 
                className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50" 
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Entry'}
              </button>
            </form>
          </div>

          {/* Recent Entries */}
          <div className="bg-surface-container-lowest p-6 rounded-xl ambient-shadow border border-outline-variant/30 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Recent Entries</h3>
              <button 
                onClick={() => navigate('/studylog/history')}
                className="text-primary text-label-md font-bold hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center text-on-surface-variant py-4">Loading logs...</div>
              ) : logs.length === 0 ? (
                <div className="text-center text-on-surface-variant py-4">No study logs yet. Start tracking your progress!</div>
              ) : (
                logs.slice(0, 5).map(log => (
                  <div key={log._id} className="p-4 rounded-lg bg-surface-container-low/50 border-l-4 border-primary flex flex-col gap-2 hover:bg-surface-container-low transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-on-surface text-body-md">{new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p className="text-label-sm text-outline font-medium">{log.durationHours} {log.durationHours === 1 ? 'Hour' : 'Hours'}</p>
                      </div>
                      <div className="flex gap-1">
                        <span className="px-2.5 py-0.5 rounded bg-primary-container/20 text-primary text-[10px] font-bold uppercase tracking-wide">
                          {log.subject}
                        </span>
                      </div>
                    </div>
                    <p className="text-label-md text-on-surface-variant line-clamp-2 italic">"{log.description}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
