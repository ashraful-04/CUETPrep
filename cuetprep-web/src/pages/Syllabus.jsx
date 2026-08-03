import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { API_URL } from '../config';

export default function Syllabus() {
  const [openSection, setOpenSection] = useState(null);
  const [syllabusData, setSyllabusData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const fetchSyllabus = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${API_URL}/api/syllabus`, {
        headers: { 'Authorization': `Bearer ${userInfo?.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSyllabusData(data);
      }
    } catch (error) {
      console.error('Failed to fetch syllabus', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (sectionName) => {
    setOpenSection(openSection === sectionName ? null : sectionName);
  };

  const cycleStatus = async (subjectName, topicName, currentStatus) => {
    const nextStatusMap = {
      'Not Started': 'In Progress',
      'In Progress': 'Completed',
      'Completed': 'Not Started'
    };
    const newStatus = nextStatusMap[currentStatus];

    // Optimistic update
    setSyllabusData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const subject = newData.subjects.find(s => s.name === subjectName);
      const topic = subject.topics.find(t => t.name === topicName);
      topic.status = newStatus;
      return newData;
    });

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      await fetch(`${API_URL}/api/syllabus/topic`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify({ subjectName, topicName, status: newStatus })
      });
    } catch (error) {
      console.error('Failed to update topic status', error);
      // Rollback on failure by refetching
      fetchSyllabus();
    }
  };

  if (isLoading || !syllabusData) {
    return <Layout><div className="p-8 text-center flex items-center justify-center min-h-screen text-on-surface-variant">Loading syllabus...</div></Layout>;
  }

  // Calculations
  let totalTopics = 0;
  let completedTopics = 0;
  
  const subjectStats = syllabusData.subjects.map(sub => {
    const total = sub.topics.length;
    const completed = sub.topics.filter(t => t.status === 'Completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    totalTopics += total;
    completedTopics += completed;
    
    // icons and colors based on name
    let icon = '📐';
    let colorClass = 'bg-secondary-container text-on-secondary-container';
    let progressColor = 'bg-primary-container';
    let isLowProgress = false;
    if (sub.name === 'cs') {
      icon = '💻';
      colorClass = 'bg-tertiary-container text-on-tertiary-container';
      progressColor = 'bg-tertiary-container';
      if (percentage < 30) isLowProgress = true;
    }
    if (sub.name === 'reason') {
      icon = '🧠';
      colorClass = 'bg-secondary-container text-on-secondary-container';
      progressColor = 'bg-primary-container';
    }

    return { ...sub, total, completed, percentage, icon, colorClass, progressColor, isLowProgress };
  });

  const overallPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="whitespace-nowrap px-3 py-1 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#bbf7d0] transition-colors shadow-sm">Completed</span>;
      case 'In Progress':
        return <span className="whitespace-nowrap px-3 py-1 rounded-full bg-[#fef3c7] text-[#92400e] text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#fde68a] transition-colors shadow-sm">In Progress</span>;
      default:
        return <span className="whitespace-nowrap px-3 py-1 rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface-variant text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-surface-container-low transition-colors shadow-sm">Not Started</span>;
    }
  };

  return (
    <Layout>
      <div className="max-w-container-max mx-auto">
        {/* Page Header & Overall Progress */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Syllabus Checklist</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">Track your topic completion for CUET PG MCA</p>
          </div>
          <div className="bg-surface-container-lowest ambient-shadow p-6 rounded-xl border border-outline-variant flex-1 max-w-md">
            <div className="flex justify-between items-center mb-3">
              <span className="font-title-lg text-title-lg text-primary font-bold">Overall Progress</span>
              <span className="font-title-lg text-title-lg font-black">{overallPercentage}% Complete</span>
            </div>
            <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-primary-container transition-all duration-500 ease-out" style={{ width: `${overallPercentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* Section Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {subjectStats.map(stat => (
            <div key={stat.name} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 ambient-shadow hover:scale-[1.02] transition-transform cursor-default">
              <div className="flex justify-between items-start mb-4">
                <span className="text-3xl">{stat.icon}</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  <span className={`font-label-md text-label-md px-2.5 py-1 rounded-full font-bold ${stat.colorClass}`}>
                    {stat.displayName}
                  </span>
                  {stat.isLowProgress && (
                    <span className="flex items-center gap-1 font-label-md text-label-md px-2.5 py-1 rounded-full font-bold bg-error-container text-error">
                      <span className="material-symbols-outlined text-[14px]">warning</span> Low Progress
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-baseline mb-2 mt-6">
                <span className="font-headline-md text-headline-md font-black">{stat.percentage}%</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">{stat.completed}/{stat.total} topics</span>
              </div>
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 ease-out ${stat.progressColor}`} style={{ width: `${stat.percentage}%` }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Collapsible Sections */}
        <div className="flex flex-col gap-6">
          {subjectStats.map(stat => (
            <div key={stat.name} className="bg-surface-container-lowest border border-outline-variant rounded-xl ambient-shadow overflow-hidden group">
              <button 
                className="w-full flex items-center justify-between p-6 hover:bg-surface-container-low transition-colors"
                onClick={() => toggleSection(stat.name)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{stat.icon}</span>
                  <div className="text-left">
                    <h3 className="font-headline-md text-headline-md font-bold text-on-surface">{stat.displayName}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="font-label-md text-label-md text-on-surface-variant font-bold">{stat.completed}/{stat.total} topics</span>
                      <div className="w-32 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ease-out ${stat.progressColor}`} style={{ width: `${stat.percentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <span className={`material-symbols-outlined transition-transform duration-300 ${openSection === stat.name ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
              <div className={`transition-all duration-300 border-t border-outline-variant ${openSection === stat.name ? 'block' : 'hidden'}`}>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stat.topics.map(topic => (
                    <div 
                      key={topic.name} 
                      className="flex items-center justify-between p-4 border border-outline-variant rounded-lg hover:bg-primary/5 transition-colors group/item"
                    >
                      <span className="font-body-lg text-body-lg font-semibold text-on-surface">{topic.name}</span>
                      <div onClick={() => cycleStatus(stat.name, topic.name, topic.status)} className="active:scale-95 transition-transform">
                        {getStatusBadge(topic.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
