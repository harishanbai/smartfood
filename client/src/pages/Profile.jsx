import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Globe, Camera, Save, ArrowLeft, ShieldCheck, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, mongoUser, updateUserProfile } = useAuth();
  const { addNotification } = useNotifications();
  const { language: currentLang, setLanguage } = useLanguage();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [userLang, setUserLang] = useState('en');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [saving, setSaving] = useState(false);
  const [brandName, setBrandName] = useState(() => localStorage.getItem('profileName') || 'Smart Lunch');
  const [designation, setDesignation] = useState(() => localStorage.getItem('profileDesignation') || 'MESS MASTER');

  useEffect(() => {
    if (mongoUser || currentUser) {
      const fn = mongoUser?.firstName || currentUser?.displayName?.split(' ')[0] || '';
      const ln = mongoUser?.lastName || currentUser?.displayName?.split(' ').slice(1).join(' ') || '';
      setFirstName(fn);
      setLastName(ln);
      setPhone(mongoUser?.phone || '');
      setUserLang(mongoUser?.language || currentLang || 'en');
      setProfilePhoto(mongoUser?.photo || currentUser?.photoURL || '');
    }
  }, [mongoUser, currentUser, currentLang]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      addNotification('First Name and Last Name are required.', 'warning');
      return;
    }

    setSaving(true);
    
    // Save local-only customizations immediately
    localStorage.setItem('profileName', brandName.trim());
    localStorage.setItem('profileDesignation', designation.trim());
    localStorage.setItem('profilePhoto', profilePhoto);
    localStorage.setItem('chefName', firstName.trim());
    window.dispatchEvent(new Event('profile-change'));

    try {
      const displayName = `${firstName.trim()} ${lastName.trim()}`;
      const res = await updateUserProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName,
        phone: phone.trim(),
        language: userLang,
        photo: profilePhoto
      });

      setSaving(false);

      if (res.success) {
        // Sync app language context if changed
        if (userLang !== currentLang) {
          setLanguage(userLang);
        }

        addNotification('Profile updated successfully! 🎉', 'success');
        navigate('/');
      } else {
        // Show sync warning but still acknowledge local changes
        addNotification(`Local changes saved, but could not sync with database: ${res.error || 'Unauthorized'}`, 'warning');
        
        // Also sync local language preference anyway so it feels responsive
        if (userLang !== currentLang) {
          setLanguage(userLang);
        }
        
        navigate('/');
      }
    } catch (err) {
      setSaving(false);
      console.error(err);
      addNotification('Local changes saved, but could not sync with database.', 'warning');
      navigate('/');
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

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        addNotification("Image is too large. Please select an image under 10MB.", "warning");
        return;
      }
      compressAndSetPhoto(file);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'SL';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen pb-12 w-full max-w-3xl mx-auto">
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

          {/* Profile Photo Upload */}
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
              className="h-24 w-24 rounded-full border-2 border-dashed border-white/20 hover:border-accentPurple flex flex-col items-center justify-center bg-black/40 overflow-hidden cursor-pointer relative shadow-xl shadow-purple-500/10 transition-all duration-300 group"
            >
              {profilePhoto ? (
                <>
                  <img src={profilePhoto} alt="User Profile" className="w-full h-full object-cover group-hover:opacity-40 transition-opacity duration-300" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 text-white text-[10px] font-bold">
                    <Camera className="h-4 w-4 mb-1 text-accentPurple" />
                    Change
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-accentPurple font-extrabold text-xl">
                  {getInitials(`${firstName} ${lastName}`)}
                </div>
              )}
            </label>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {firstName} {lastName}
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-accentGreen bg-accentGreen/10 border border-accentGreen/30 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="h-3 w-3" /> {mongoUser?.role || 'User'}
              </span>
            </div>

            <p className="text-xs text-gray-400 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="h-3.5 w-3.5 text-gray-500" />
              {currentUser?.email || mongoUser?.email || 'N/A'}
            </p>

            {/* Quick Session Stats */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 pt-3 border-t border-white/5 text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-accentPurple" /> Last Login: {formatDate(mongoUser?.lastLogin || new Date())}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-accentOrange" /> Member Since: {formatDate(mongoUser?.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="glass-panel rounded-[24px] p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-accentPurple" />
            Edit Profile Details
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full glass-panel px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accentPurple/50 transition-all"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full glass-panel px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accentPurple/50 transition-all"
                />
              </div>

              {/* Email (Read only) */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-gray-500">(Read Only)</span>
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || mongoUser?.email || ''}
                  className="w-full glass-panel px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm cursor-not-allowed opacity-75"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-gray-500" /> Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full glass-panel px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accentPurple/50 transition-all"
                />
              </div>

              {/* Language */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-gray-500" /> Language Preference
                </label>
                <select
                  value={userLang}
                  onChange={(e) => setUserLang(e.target.value)}
                  className="w-full glass-panel px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accentPurple/50 transition-all [&>option]:bg-bgCard"
                >
                  <option value="en">English (US)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                </select>
              </div>

              {/* Sidebar Customization Section */}
              <div className="sm:col-span-2 mt-4 pt-4 border-t border-white/5">
                <h4 className="text-sm font-bold text-white mb-2">Sidebar Customization</h4>
                <p className="text-xs text-gray-400">Customize the title and designation displayed at the top of the sidebar.</p>
              </div>

              {/* Sidebar Title (Brand) */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Sidebar Title (Brand)
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Smart Lunch"
                  className="w-full glass-panel px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accentPurple/50 transition-all"
                />
              </div>

              {/* Sidebar Designation */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Sidebar Designation
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="MESS MASTER"
                  className="w-full glass-panel px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accentPurple/50 transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t border-white/5">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-accentPurple to-accentOrange text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                {saving ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
