import React, { useState } from 'react';
import { User, Briefcase, Camera, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

const Profile = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { language, t } = useLanguage();

  const [profileName, setProfileName] = useState(() => localStorage.getItem('profileName') || 'Smart Lunch');
  const [profileDesignation, setProfileDesignation] = useState(() => localStorage.getItem('profileDesignation') || 'MESS MASTER');
  const [profilePhoto, setProfilePhoto] = useState(() => localStorage.getItem('profilePhoto') || '');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profileName.trim() || !profileDesignation.trim()) {
      addNotification('Name and Designation are required.', 'warning');
      return;
    }

    try {
      localStorage.setItem('profileName', profileName);
      localStorage.setItem('profileDesignation', profileDesignation);
      localStorage.setItem('profilePhoto', profilePhoto);
      window.dispatchEvent(new Event('profile-change'));
      addNotification('Successfully changed', 'success');
      navigate('/');
    } catch (err) {
      console.error(err);
      addNotification('Failed to save profile changes. Image storage space might be full.', 'warning');
    }
  };

  const compressAndSetPhoto = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setProfilePhoto(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const readPhotoFile = (file) => {
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        addNotification("Image is too large. Please select an image under 10MB.", "warning");
        return;
      }
      compressAndSetPhoto(file);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    readPhotoFile(file);
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

          {/* Circular Profile Photo Upload Dropzone */}
          <div className="relative group flex-shrink-0">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="profile-photo-input"
            />
            <label
              htmlFor="profile-photo-input"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('border-accentPurple', 'scale-105');
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-accentPurple', 'scale-105');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-accentPurple', 'scale-105');
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  readPhotoFile(e.dataTransfer.files[0]);
                }
              }}
              className="h-24 w-24 rounded-full border-2 border-dashed border-white/20 hover:border-accentPurple flex flex-col items-center justify-center bg-black/40 overflow-hidden cursor-pointer relative shadow-xl shadow-purple-500/10 transition-all duration-300 group"
            >
              {profilePhoto ? (
                <>
                  <img src={profilePhoto} alt={profileName} className="w-full h-full object-cover group-hover:opacity-40 transition-opacity duration-300" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 text-white text-[10px] font-bold">
                    <Camera className="h-4 w-4 mb-1 text-accentPurple" />
                    Change
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-2 text-center">
                  <Camera className="h-5 w-5 text-gray-500 mb-1 group-hover:text-accentPurple group-hover:scale-110 transition-all duration-300" />
                  <span className="text-[9px] font-semibold text-gray-400">Upload Logo</span>
                </div>
              )}
            </label>
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

              {/* Profile Photo Control */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-gray-500" />
                  Header Logo / Profile Photo
                </label>
                <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="flex-1">
                    <p className="text-xs text-white font-semibold">
                      {profilePhoto ? 'Custom logo uploaded' : 'Using default Chef Hat icon'}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Upload an image file directly or drop it in the circular upload zone above.
                    </p>
                  </div>
                  {profilePhoto && (
                    <button
                      type="button"
                      onClick={() => setProfilePhoto('')}
                      className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Reset to Default
                    </button>
                  )}
                </div>
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
