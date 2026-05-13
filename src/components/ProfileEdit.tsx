import React, { useState } from 'react';
import { User, Phone, Save, X, History } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { motion } from 'motion/react';

interface ProfileEditProps {
  profile: UserProfile;
  onClose: () => void;
  onUpdate: (updatedProfile: Partial<UserProfile>) => void;
}

export const ProfileEdit: React.FC<ProfileEditProps> = ({ profile, onClose, onUpdate }) => {
  const [name, setName] = useState(profile.name);
  const [mobile, setMobile] = useState(profile.mobile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      setError("Name and mobile are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userRef = doc(db, "users", profile.uid);
      await updateDoc(userRef, {
        name: name.trim(),
        mobile: mobile.trim()
      });
      onUpdate({ name: name.trim(), mobile: mobile.trim() });
      onClose();
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Edit Profile</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95">
          <X size={20} className="text-gray-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1">Full Name</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006400]">
              <User size={18} />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border-0 py-4 pl-12 pr-4 rounded-2xl font-bold placeholder:text-gray-300 focus:ring-2 ring-[#006400]/20 transition-all"
              placeholder="Your Name"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1">Mobile Number</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006400]">
              <Phone size={18} />
            </div>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full bg-gray-50 border-0 py-4 pl-12 pr-4 rounded-2xl font-bold placeholder:text-gray-300 focus:ring-2 ring-[#006400]/20 transition-all"
              placeholder="01XXX-XXXXXX"
              required
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100 italic">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#006400] text-white font-black py-4 rounded-2xl shadow-xl shadow-[#006400]/20 flex items-center justify-center gap-2 hover:bg-[#004d00] transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save size={20} /> Update Profile
            </>
          )}
        </button>

        <div className="pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => onUpdate({ showHistory: true } as any)}
            className="w-full bg-white border-2 border-gray-100 text-gray-500 font-extrabold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 hover:text-[#006400] hover:border-[#006400]/20 transition-all active:scale-95"
          >
            <History size={20} /> View Service History
          </button>
        </div>
      </form>
    </div>
  );
};
