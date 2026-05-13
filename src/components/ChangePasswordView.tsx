import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Lock, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const ChangePasswordView = ({ onBack }: { onBack: () => void }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isSocialUser = auth.currentUser?.providerData.some(
    p => p.providerId === 'google.com' || p.providerId === 'facebook.com'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("User not found");

      // Re-authenticate
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);

      // Log the activity
      await addDoc(collection(db, "notifications"), {
        userId: user.uid,
        userEmail: user.email,
        type: 'profile',
        title: 'Password Changed',
        message: 'User successfully changed their account password.',
        read: false,
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error("Password update error:", err);
      if (err.code === 'auth/wrong-password') {
        setError("Current password is incorrect");
      } else {
        setError(err.message || "Failed to update password");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isSocialUser) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#006400]">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck size={32} />
          </div>
          <h3 className="font-black text-gray-900 uppercase">Social Account Detected</h3>
          <p className="text-sm text-gray-500 font-bold leading-relaxed">
            You are logged in with Google/Facebook. You can manage your security settings on your provider's website.
          </p>
          <button 
            onClick={onBack}
            className="w-full bg-[#006400] text-white font-black py-4 rounded-xl uppercase tracking-widest mt-4"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#006400]">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2 text-[#006400]">
          <Lock size={20} />
          <h2 className="font-black uppercase tracking-widest text-sm">Change Password</h2>
        </div>
        <div className="w-8" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Current Password</label>
          <div className="relative">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                <Lock size={18} />
             </div>
             <input 
              required
              type="password"
              className="w-full bg-gray-50 border-0 p-4 pl-12 rounded-xl font-bold placeholder:text-gray-300 focus:ring-2 ring-[#006400]/20"
              placeholder="••••••••"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
             />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">New Password</label>
          <div className="relative">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                <ShieldCheck size={18} />
             </div>
             <input 
              required
              type="password"
              className="w-full bg-gray-50 border-0 p-4 pl-12 rounded-xl font-bold placeholder:text-gray-300 focus:ring-2 ring-[#006400]/20"
              placeholder="Minimum 6 chars"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
             />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Confirm New Password</label>
          <div className="relative">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                <ShieldCheck size={18} />
             </div>
             <input 
              required
              type="password"
              className="w-full bg-gray-50 border-0 p-4 pl-12 rounded-xl font-bold placeholder:text-gray-300 focus:ring-2 ring-[#006400]/20"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
             />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 rounded-2xl flex items-center gap-3 text-red-600">
            <AlertCircle size={18} />
            <p className="text-xs font-bold">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 rounded-2xl flex items-center gap-3 text-green-600">
            <CheckCircle size={18} />
            <p className="text-xs font-bold">Password updated successfully!</p>
          </div>
        )}

        <button 
          disabled={loading}
          className="w-full bg-[#006400] text-white font-black py-4 rounded-xl shadow-xl shadow-[#006400]/20 active:scale-95 transition-all mt-4"
        >
          {loading ? 'Processing...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};
