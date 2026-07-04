import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const bodyData = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Could not connect to server');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-margin-mobile">
      <main className="w-full max-w-[420px] flex flex-col items-center">
        {/* Main Login Card */}
        <div className="w-full bg-white rounded-2xl ambient-shadow overflow-hidden border border-gray-100">
          {/* Brand Area */}
          <div className="px-gutter pt-8 pb-4 text-center flex flex-col items-center gap-2">
            <img 
              alt="PrepTracker Logo" 
              className="h-10 w-auto object-contain" 
              src="data:image/png;base64,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" 
            />
            <p className="font-label-md text-label-md text-[#6B7280]">
              {isLogin ? 'CUET PG MCA Preparation Tracker' : 'Create Your CUETPrep Account'}
            </p>
          </div>
          {/* Purple Divider */}
          <div className="w-full h-[1px] bg-primary-container opacity-20"></div>
          {/* Form Section */}
          <div className="px-gutter py-8">
            {error && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            <form className="space-y-gutter" onSubmit={handleAuth}>
              {/* Name Input (Only for Register) */}
              {!isLogin && (
                <div className="space-y-base">
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                      person
                    </span>
                    <input 
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all font-body-md text-body-md" 
                      placeholder="Enter your full name" 
                    />
                  </div>
                </div>
              )}
              {/* Email Input */}
              <div className="space-y-base">
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                    mail
                  </span>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all font-body-md text-body-md" 
                    placeholder="Enter your email" 
                  />
                </div>
              </div>
              {/* Password Input */}
              <div className="space-y-base">
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                    lock
                  </span>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all font-body-md text-body-md" 
                    placeholder="Enter your password" 
                  />
                  <button 
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {isLogin && (
                  <div className="flex justify-end">
                    <a href="#" className="font-label-md text-label-md text-primary-container hover:underline transition-all">
                      Forgot Password?
                    </a>
                  </div>
                )}
              </div>
              {/* Login Button */}
              <button 
                type="submit"
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-4 rounded-xl font-title-lg text-title-lg transition-all active:scale-[0.98] duration-200 shadow-lg shadow-primary-container/20"
              >
                {isLogin ? 'Login' : 'Sign Up'}
              </button>
              
              {/* Toggle Mode */}
              <div className="text-center pt-2">
                <p className="font-body-md text-on-surface-variant">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    type="button" 
                    className="text-primary font-bold hover:underline"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? 'Sign up' : 'Log in'}
                  </button>
                </p>
              </div>

              {/* Motivational Reminder */}
              <div className="text-center pt-4">
                <p className="font-label-sm text-label-sm text-[#6B7280]">
                  CUET PG MCA | March 2027
                </p>
              </div>
            </form>
          </div>
        </div>
        {/* Exam Countdown Badge */}
        <div className="mt-gutter flex items-center gap-2 bg-[#F5F3FF] px-4 py-2 rounded-full">
          <span className="material-symbols-outlined text-primary-container text-[18px]">
            calendar_today
          </span>
          <span className="font-label-sm text-label-sm text-primary-container font-semibold">
            245 days to exam
          </span>
        </div>
      </main>
    </div>
  );
}
