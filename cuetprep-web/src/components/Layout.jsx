import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import profilePic from '../assets/profile.jpeg';
import { API_URL } from '../config';

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [permission, setPermission] = useState(Notification.permission);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const [syllabusData, setSyllabusData] = useState([]);
  
  const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

  const isActive = (path) => location.pathname === path;

  // Handle clicking outside to close popups
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setShowMobileSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifRef, searchRef, mobileSearchRef, profileRef]);

  // Fetch Syllabus Data for Search
  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
          const res = await fetch(`${API_URL}/api/syllabus`, {
            headers: { 'Authorization': `Bearer ${userInfo.token}` }
          });
          const data = await res.json();
          if (Array.isArray(data)) setSyllabusData(data);
        }
      } catch (error) {
        console.error('Error fetching syllabus for search:', error);
      }
    };
    fetchSyllabus();
  }, []);

  const pages = [
    { title: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { title: 'Syllabus', path: '/syllabus', icon: 'menu_book' },
    { title: 'Study Log', path: '/studylog', icon: 'history_edu' },
    { title: 'Study History', path: '/studylog/history', icon: 'history' },
    { title: 'Mock Test', path: '/mocktest', icon: 'quiz' },
    { title: 'Analytics', path: '/analytics', icon: 'analytics' },
    { title: 'Settings', path: '/settings', icon: 'settings' }
  ];

  const runSearch = (query) => {
    if (query.trim().length > 0) {
      const lowerQuery = query.toLowerCase();
      const results = [];
      pages.forEach(page => {
        if (page.title.toLowerCase().includes(lowerQuery)) {
          results.push({ type: 'page', ...page });
        }
      });
      syllabusData.forEach(chapter => {
        if (chapter.chapterName.toLowerCase().includes(lowerQuery)) {
          results.push({ type: 'syllabus', title: chapter.chapterName, subtitle: 'Chapter' });
        }
        chapter.topics.forEach(topic => {
          if (topic.topicName.toLowerCase().includes(lowerQuery)) {
            results.push({ type: 'syllabus', title: topic.topicName, subtitle: `In ${chapter.chapterName}` });
          }
        });
      });
      setSearchResults(results.slice(0, 8));
    } else {
      setSearchResults([]);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    runSearch(query);
    setShowSearch(true);
  };

  const handleMobileSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    runSearch(query);
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const handleResultClick = (result) => {
    setShowSearch(false);
    setSearchQuery('');
    if (result.type === 'page') {
      navigate(result.path);
    } else if (result.type === 'syllabus') {
      navigate('/syllabus');
    }
  };

  // Auto-subscribe if permission is already granted but we haven't sent it to server this session
  useEffect(() => {
    if (Notification.permission === 'granted') {
      subscribeToPush(true);
    }
  }, []);

  const subscribeToPush = async (silent = false) => {
    if (!silent) setIsSubscribing(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'granted') {
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
          await fetch(`${API_URL}/api/notifications/subscribe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userInfo.token}`
            },
            body: JSON.stringify({ subscription })
          });
          if (!silent) alert('Successfully subscribed to Push Notifications!');
        }
      } else {
        if (!silent) alert('Permission for notifications was denied.');
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
      if (!silent) alert('Failed to subscribe to push notifications.');
    } finally {
      if (!silent) setIsSubscribing(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-gutter h-16 bg-surface shadow-sm">
        <div className="flex items-center">
          <img 
            alt="CUETPrep Logo" 
            className="h-10 w-auto object-contain" 
            src="data:image/png;base64,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" 
          />
        </div>
        <div className="flex items-center gap-6 ml-auto">
          <div className="hidden md:flex items-center bg-surface-container-low rounded-full px-4 py-1.5 border border-outline-variant relative" ref={searchRef}>
            <span className="material-symbols-outlined text-on-surface-variant text-body-md">search</span>
            <input 
              type="text" 
              placeholder="Search resources..." 
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => setShowSearch(true)}
              className="bg-transparent border-none focus:ring-0 text-label-md w-64 text-on-surface ml-2 outline-none" 
            />
            {showSearch && (
              <div className="absolute top-12 left-0 w-80 bg-surface-container-lowest rounded-xl custom-shadow border border-outline-variant/30 py-2 z-50 max-h-96 overflow-y-auto">
                {searchQuery.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-on-surface-variant text-center">
                    Type to search pages and syllabus...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((res, i) => (
                    <div 
                      key={i}
                      onClick={() => handleResultClick(res)}
                      className="px-4 py-2 hover:bg-surface-container-low cursor-pointer flex items-center gap-3 transition-colors"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                        {res.type === 'page' ? res.icon : 'menu_book'}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-on-surface">{res.title}</span>
                        {res.subtitle && <span className="text-[10px] text-on-surface-variant">{res.subtitle}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-on-surface-variant text-center">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Search Button */}
          <div className="md:hidden flex items-center justify-center relative" ref={mobileSearchRef}>
            <button 
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors"
            >
              search
            </button>
            {showMobileSearch && (
              <div className="absolute top-12 right-0 w-[85vw] max-w-sm bg-surface-container-lowest rounded-xl custom-shadow border border-outline-variant/30 py-2 z-50">
                <div className="px-4 py-2 border-b border-outline-variant/30 flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
                  <input 
                    type="text" 
                    placeholder="Search resources..." 
                    value={searchQuery}
                    onChange={handleMobileSearch}
                    autoFocus
                    className="bg-transparent border-none focus:ring-0 text-label-md w-full text-on-surface outline-none" 
                  />
                </div>
                <div className="max-h-80 overflow-y-auto pt-2">
                  {searchQuery.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-on-surface-variant text-center">
                      Type to search pages and syllabus...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((res, i) => (
                      <div 
                        key={i}
                        onClick={() => handleResultClick(res)}
                        className="px-4 py-3 hover:bg-surface-container-low cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                          {res.type === 'page' ? res.icon : 'menu_book'}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-on-surface leading-tight">{res.title}</span>
                          {res.subtitle && <span className="text-[10px] text-on-surface-variant mt-0.5">{res.subtitle}</span>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-on-surface-variant text-center">
                      No results found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors relative"
            >
              notifications
              {/* Notification Badge */}
              {permission !== 'granted' && <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>}
            </button>
            
            {showNotifications && (
              <div className="absolute top-12 right-12 w-80 bg-surface-container-lowest rounded-xl custom-shadow border border-outline-variant/30 py-4 z-50 flex flex-col gap-2">
                <div className="px-4 pb-2 border-b border-outline-variant/30 font-bold text-on-surface">
                  Notifications
                </div>
                <div className="px-4 py-4 flex flex-col items-center justify-center text-center gap-3">
                  {permission === 'granted' ? (
                    <>
                      <span className="material-symbols-outlined text-4xl text-primary mb-2">notifications_active</span>
                      <p className="text-label-sm text-on-surface-variant">You are subscribed to push notifications.</p>
                      <p className="text-xs text-on-surface-variant/70 mt-2">Manage notifications in Settings.</p>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-4xl text-outline mb-2">notifications_off</span>
                      <p className="text-label-sm text-on-surface-variant">Enable push notifications to receive study reminders on your device.</p>
                      <button 
                        onClick={subscribeToPush}
                        disabled={isSubscribing}
                        className="px-4 py-2 bg-primary text-white font-bold rounded-lg text-sm mt-2 hover:shadow-md transition-all disabled:opacity-50"
                      >
                        {isSubscribing ? 'Subscribing...' : 'Enable Notifications'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="relative" ref={profileRef}>
              <div 
                className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary-container cursor-pointer active:scale-95 transition-transform bg-gray-200"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                {/* Placeholder Avatar */}
                <img 
                  src={profilePic} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>

              {showProfileMenu && (
                <div className="absolute top-12 right-0 w-48 bg-surface-container-lowest rounded-xl custom-shadow border border-outline-variant/30 py-2 z-50 flex flex-col">
                  <div className="px-4 py-3 border-b border-outline-variant/30 mb-1">
                    <p className="text-sm font-bold text-on-surface truncate">
                      {(() => {
                        try {
                          const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                          return userInfo?.name || 'User';
                        } catch (e) {
                          return 'User';
                        }
                      })()}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-surface-container-low text-error transition-colors w-full text-left"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    <span className="text-sm font-semibold">Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-full flex-col p-4 z-40 bg-surface-container-lowest w-64 hidden md:flex pt-20 border-r border-outline-variant/30">
        <nav className="flex-1 space-y-2">
          <Link 
            to="/dashboard" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive('/dashboard') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-secondary hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md text-label-md">Dashboard</span>
          </Link>
          <Link 
            to="/syllabus" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive('/syllabus') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-secondary hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined">menu_book</span>
            <span className="font-label-md text-label-md">Syllabus</span>
          </Link>
          <Link 
            to="/studylog" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive('/studylog') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-secondary hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined">history_edu</span>
            <span className="font-label-md text-label-md">Study Log</span>
          </Link>
          <Link 
            to="/mocktest" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive('/mocktest') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-secondary hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined">quiz</span>
            <span className="font-label-md text-label-md">Mock Test</span>
          </Link>
          <Link 
            to="/analytics" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive('/analytics') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-secondary hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-label-md text-label-md">Analytics</span>
          </Link>
          <Link 
            to="/settings" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 bottom-4 absolute w-56 ${isActive('/settings') ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-secondary hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 pt-24 pb-24 px-margin-mobile md:px-margin-desktop min-h-screen">
        {children}
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-surface shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden rounded-t-xl no-select">
        <Link 
          to="/dashboard" 
          className={`flex flex-col items-center justify-center rounded-full px-4 py-1 transition-transform ${isActive('/dashboard') ? 'bg-primary-container text-on-primary-container scale-100' : 'text-on-surface-variant scale-90 hover:scale-100'}`}
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-label-sm text-label-sm">Home</span>
        </Link>
        <Link 
          to="/syllabus" 
          className={`flex flex-col items-center justify-center rounded-full px-4 py-1 transition-transform ${isActive('/syllabus') ? 'bg-primary-container text-on-primary-container scale-100' : 'text-on-surface-variant scale-90 hover:scale-100'}`}
        >
          <span className="material-symbols-outlined">menu_book</span>
          <span className="font-label-sm text-label-sm">Syllabus</span>
        </Link>
        <Link 
          to="/studylog" 
          className={`flex flex-col items-center justify-center rounded-full px-4 py-1 transition-transform ${isActive('/studylog') ? 'bg-primary-container text-on-primary-container scale-100' : 'text-on-surface-variant scale-90 hover:scale-100'}`}
        >
          <span className="material-symbols-outlined">history_edu</span>
          <span className="font-label-sm text-label-sm">Log</span>
        </Link>
        <Link 
          to="/mocktest" 
          className={`flex flex-col items-center justify-center rounded-full px-4 py-1 transition-transform ${isActive('/mocktest') ? 'bg-primary-container text-on-primary-container scale-100' : 'text-on-surface-variant scale-90 hover:scale-100'}`}
        >
          <span className="material-symbols-outlined">quiz</span>
          <span className="font-label-sm text-label-sm">Tests</span>
        </Link>
      </footer>
    </div>
  );
}
