import React, { useState } from 'react';
import { User, Briefcase, Camera, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

const Profile = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { t } = useLanguage();

  const [profileName, setProfileName] = useState(() => localStorage.getItem('profileName') || 'Smart Lunch');
  const [profileDesignation, setProfileDesignation] = useState(() => localStorage.getItem('profileDesignation') || 'MESS MASTER');
  const [profilePhoto, setProfilePhoto] = useState(() => localStorage.getItem('profilePhoto') || '');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profileName.trim() || !profileDesignation.trim()) {
      addNotification('Name and Designation are required.', 'warning');
      return;
    }
    localStorage.setItem('profileName', profileName);
    localStorage.setItem('profileDesignation', profileDesignation);
    localStorage.setItem('profilePhoto', profilePhoto);
    window.dispatchEvent(new Event('profile-change'));
    addNotification('Website branding identity updated successfully!', 'success');
  };

  const getInitials = (name) => {
    if (!name) return 'SL';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen pb-12 w-full max-w-2xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="space-y-6">
        {/* Profile Card Header */}
        <div className="glass-panel rounded-[24px] p-6 border border-white/5 relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="absolute -right-20 -top-20 w-48 h-48 bg-accentPurple/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Profile Photo Display */}
          <div className="h-24 w-24 rounded-full border-2 border-accentPurple/30 overflow-hidden bg-black/40 flex items-center justify-center flex-shrink-0 relative shadow-xl shadow-purple-500/10">
            {profilePhoto ? (
              <img src={profilePhoto} alt={profileName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-extrabold text-accentPurple">{getInitials(profileName)}</span>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white tracking-tight">{profileName}</h2>
            <p className="text-xs text-accentPurple font-semibold uppercase tracking-wider mt-1">{profileDesignation}</p>
            <p className="text-xs text-gray-400 mt-2 max-w-md">
              Customize the name, photo, and subtitle designation shown in the top-left branding header of the sidebar.
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="glass-panel rounded-[24px] p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-accentPurple" />
            Edit Header Profile
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="space-y-4">
              {/* Display Name Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-gray-500" />
                  Website Name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Smart Lunch"
                  className="w-full glass-panel px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accentPurple/50 focus:shadow-[0_0_10px_rgba(168,85,247,0.1)] transition-all"
                />
              </div>

              {/* Designation Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-gray-500" />
                  Designation / Subtitle
                </label>
                <input
                  type="text"
                  required
                  value={profileDesignation}
                  onChange={(e) => setProfileDesignation(e.target.value)}
                  placeholder="e.g. MESS MASTER"
                  className="w-full glass-panel px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accentPurple/50 focus:shadow-[0_0_10px_rgba(168,85,247,0.1)] transition-all"
                />
              </div>

              {/* Photo URL Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-gray-500" />
                  Header Logo / Profile Photo URL
                </label>
                <input
                  type="text"
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full glass-panel px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accentPurple/50 focus:shadow-[0_0_10px_rgba(168,85,247,0.1)] transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-accentPurple to-accentOrange text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer min-h-[44px]"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
