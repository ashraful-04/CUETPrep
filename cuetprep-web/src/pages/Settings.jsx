import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { API_URL } from '../config';

export default function Settings() {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteData = async () => {
    setIsDeleting(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/data`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userInfo.token}`
        }
      });

      if (response.ok) {
        alert("All your study data has been successfully deleted. Your progress has been reset to zero.");
        setShowConfirm(false);
        // Optionally redirect to dashboard to see empty state
        navigate('/dashboard');
      } else {
        const err = await response.json();
        alert(`Failed to delete data: ${err.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting data', error);
      alert("An error occurred while deleting data.");
    } finally {
      setIsDeleting(false);
    }
  };



  const testPush = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo) {
        const res = await fetch(`${API_URL}/api/notifications/test`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userInfo.token}`
          }
        });
        if (res.ok) {
          alert('Test push sent by server! Check your device notifications.');
        } else {
          const err = await res.json();
          alert(`Server failed to send push: ${err.message}`);
        }
      }
    } catch (error) {
      console.error('Error sending test push:', error);
      alert('Network error sending test push.');
    }
  };

  return (
    <Layout>
      <div className="max-w-container mx-auto flex flex-col gap-8">
        {/* Header Section */}
        <section className="mb-4">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Settings</h1>
          <p className="text-on-surface-variant font-body-md text-body-md mt-1">Manage your account preferences and data.</p>
        </section>


        {/* Notifications Section */}
        <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl custom-shadow border border-gray-100 flex flex-col gap-6">
          <h3 className="font-title-lg text-title-lg text-on-surface border-b border-outline-variant pb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">notifications</span>
            Push Notifications
          </h3>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-on-surface">Test Notification</p>
              <p className="text-label-sm text-on-surface-variant mt-1">Send a test notification to verify your device is properly connected.</p>
            </div>
            <button 
              onClick={testPush}
              className="px-6 py-2.5 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary-container transition-colors whitespace-nowrap"
            >
              Test Push
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-[#FFF8F8] p-6 md:p-8 rounded-2xl border border-error/20 flex flex-col gap-6">
          <h3 className="font-title-lg text-title-lg text-error border-b border-error/20 pb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            Danger Zone
          </h3>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-xl">
              <p className="font-bold text-error">Delete All Study Data</p>
              <p className="text-label-sm text-[#991B1B] mt-1 leading-relaxed">
                This will permanently erase all your logged study sessions, mock test results, and reset your streaks and total hours to zero. 
                <span className="font-bold"> This action cannot be undone.</span> Your login credentials will remain active.
              </p>
            </div>
            
            {!showConfirm ? (
              <button 
                onClick={() => setShowConfirm(true)}
                className="px-6 py-2.5 rounded-xl bg-error/10 text-error font-bold hover:bg-error hover:text-white transition-colors border border-error/20"
              >
                Delete Data
              </button>
            ) : (
              <div className="flex flex-col gap-3 min-w-[200px]">
                <button 
                  onClick={handleDeleteData}
                  disabled={isDeleting}
                  className="px-6 py-2.5 rounded-xl bg-error text-white font-bold hover:bg-error/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
                </button>
                <button 
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  className="px-6 py-2 rounded-xl bg-transparent text-on-surface-variant font-bold hover:bg-surface-container-low transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
