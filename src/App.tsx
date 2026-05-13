import React, { useState, useEffect } from "react";
import { auth, db, OperationType, handleFirestoreError } from "./lib/firebase";
import { 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  User
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc,
  updateDoc, 
  collection,
  onSnapshot,
  serverTimestamp 
} from "firebase/firestore";
import { 
  Facebook, 
  Globe, 
  Smartphone, 
  Headset, 
  LogOut, 
  LogIn, 
  ShieldCheck,
  MessageSquare,
  Instagram,
  Mail,
  User as UserIcon,
  CheckCircle,
  LayoutDashboard,
  Menu,
  PlusCircle,
  Users,
  Wallet,
  ArrowRightLeft,
  Youtube,
  Send,
  Home,
  Zap,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FacebookForm, 
  WebsiteForm, 
  AppForm, 
  SimOffers,
  TopUpForm,
  DigitalServices
} from "./components/ServiceForms";
import { AdminPanel } from "./components/AdminPanel";
import { ProfileEdit } from "./components/ProfileEdit";
import { TallyNote } from "./components/TallyNote";
import { SubmissionsHistory } from "./components/SubmissionsHistory";
import { NotificationView } from "./components/NotificationView";
import { ChangePasswordView } from "./components/ChangePasswordView";
import { ADMIN_EMAILS, UserProfile, PlatformService } from "./types";

import { Sidebar } from "./components/Sidebar";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [services, setServices] = useState<PlatformService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [authLoading, setAuthLoading] = useState(false);

  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [manualAuth, setManualAuth] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState<string | null>(null);

  const handleManualLogin = async () => {
    if (!manualAuth.email || !manualAuth.password) {
      setAuthError("Email and password are required");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, manualAuth.email, manualAuth.password);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleManualRegister = async () => {
    if (!manualAuth.email || !manualAuth.password) {
      setAuthError("Email and password are required");
      return;
    }
    if (manualAuth.password.length < 6) {
      setAuthError("Password must be at least 6 characters");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, manualAuth.email, manualAuth.password);
      
      // Log new registration
      await addDoc(collection(db, "notifications"), {
        userId: cred.user.uid,
        userEmail: cred.user.email,
        type: 'profile',
        title: 'New User Registered',
        message: `A new user signed up with email ${cred.user.email}.`,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!manualAuth.email) {
      setAuthError("Please enter your email address to reset password");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, manualAuth.email);
      alert("Password reset email sent! Please check your inbox.");
      
      // Log the request
      await addDoc(collection(db, "notifications"), {
        userId: "SYSTEM",
        userEmail: manualAuth.email,
        type: 'profile',
        title: 'Password Reset Requested',
        message: `User ${manualAuth.email} requested a password reset email.`,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex(prev => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Set global persistence once
    setPersistence(auth, browserLocalPersistence).catch(err => console.error("Persistence error:", err));

    let unsubServices: (() => void) | null = null;
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      try {
        setUser(u);
        
        // Cleanup old listeners
        if (unsubServices) { unsubServices(); unsubServices = null; }
        if (unsubProfile) { unsubProfile(); unsubProfile = null; }

        if (u) {
          // Listen to services
          unsubServices = onSnapshot(collection(db, "services"), (snapshot) => {
            setServices(snapshot.docs.map(doc => doc.data() as PlatformService));
          }, (err) => {
            handleFirestoreError(err, OperationType.LIST, "services");
          });

          // Check if profile exists and listen to it
          const profileDoc = await getDoc(doc(db, "users", u.uid));
          if (!profileDoc.exists()) {
            const newProfile: UserProfile = {
              uid: u.uid,
              name: u.displayName || "New User",
              mobile: u.phoneNumber || "01XXX-XXXXXX",
              balance: 0,
              role: (u.email && ADMIN_EMAILS.includes(u.email)) ? 'admin' : 'user',
              createdAt: serverTimestamp()
            };
            await setDoc(doc(db, "users", u.uid), newProfile);
            setProfile(newProfile);
          } else {
            const currentProfile = profileDoc.data() as UserProfile;
            // Sync role if email is in ADMIN_EMAILS but role is not admin
            if (u.email && ADMIN_EMAILS.includes(u.email) && currentProfile.role !== 'admin') {
              await updateDoc(doc(db, "users", u.uid), { role: 'admin' });
              currentProfile.role = 'admin';
            }
            setProfile(currentProfile);
          }
          
          unsubProfile = onSnapshot(doc(db, "users", u.uid), (doc) => {
            if (doc.exists()) setProfile(doc.data() as UserProfile);
          }, (err) => {
            handleFirestoreError(err, OperationType.GET, `users/${u.uid}`);
          });
        } else {
          setProfile(null);
        }
      } catch (err: any) {
        console.error("Auth state change error detail:", err);
        // If it's a JSON string from handleFirestoreError, it will be easier to read
        try {
          const detail = JSON.parse(err.message);
          console.error("Parsed Auth Error:", detail);
        } catch {
          // not a json string
        }
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubServices) unsubServices();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const login = async () => {
    if (authLoading) return;
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Ensure popup is allowed
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.code === 'auth/popup-blocked') {
        alert("আপনার ব্রাউজার পপ-আপ ব্লক করেছে। অনুগ্রহ করে ব্রাউজার সেটিং থেকে পপ-আপ এলাউ করুন এবং আবার চেষ্টা করুন। টিপস: আপনি যদি মেসেঞ্জার বা ফেসবুকের ভেতর থেকে অ্যাপটি চালান, তবে এটি কাজ করবে না। দয়া করে Chrome ব্রাউজার ব্যবহার করুন।");
      } else if (err.code === 'auth/unauthorized-domain') {
        alert("এই ডোমেইনটি আপনার ফায়ারবেস কনসোলে অনুমোদিত নয়।\n\nদয়া করে Firebase Console > Authentication > Settings > Authorized Domains-এ আপনার বর্তমান ডোমেইনটি যোগ করুন।");
      } else if (err.code === 'auth/invalid-credential') {
        alert("গুগল লগইন করতে সমস্যা হচ্ছে (Invalid Credential)। এটি সাধারণত ফায়ারবেস কনসোলে গুগল লগইন সঠিক ভাবে সেটআপ না থাকলে হয়। দয়া করে ফায়ারবেস কনসোলে Google Provider চেক করুন।");
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Just ignore if user closed it manually or a previous one was pending
      } else {
        alert("লগইন করতে সমস্যা হচ্ছে: " + (err.code || err.message));
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const loginWithFacebook = async () => {
    if (authLoading) return;
    setAuthLoading(true);
    try {
      const provider = new FacebookAuthProvider();
      // Ensure popup is allowed
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Facebook Login Error:", err);
      if (err.code === 'auth/popup-blocked') {
        alert("আপনার ব্রাউজার পপ-আপ ব্লক করেছে। অনুগ্রহ করে ব্রাউজার সেটিং থেকে পপ-আপ এলাউ করুন এবং আবার চেষ্টা করুন। টিপস: আপনি যদি মেসেঞ্জার বা ফেসবুকের ভেতর থেকে অ্যাপটি চালান, তবে এটি কাজ করবে না। দয়া করে Chrome ব্রাউজার ব্যবহার করুন।");
      } else if (err.code === 'auth/unauthorized-domain') {
        alert("এই ডোমেইনটি আপনার ফায়ারবেস কনসোলে অনুমোদিত নয়।\n\nদয়া করে Firebase Console > Authentication > Settings > Authorized Domains-এ আপনার বর্তমান ডোমেইনটি যোগ করুন।");
      } else if (err.code === 'auth/invalid-credential') {
        alert("ফেসবুক লগইন করতে সমস্যা হচ্ছে (Invalid Credential)। এটি সাধারণত ফায়ারবেস কনসোলে ফেসবুক অ্যাপ আইডি সঠিক ভাবে সেটআপ না থাকলে হয়।");
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        alert("এই ইমেইল দিয়ে ইতমধ্যেই একটি অ্যাকাউন্ট আছে। অনুগ্রহ করে গুগল দিয়ে লগইন করুন।");
      } else {
        alert("ফেসবুক লগইন করতে সমস্যা হচ্ছে: " + (err.code || err.message));
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setIsAdminView(false);
    setActiveService(null);
  };

  const handleSuccess = () => {
    setActiveService(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F4F4F4]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} 
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-12 h-12 border-4 border-[#006400] rounded-full border-t-white"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F4F7FE] items-center">
        {/* Top Header Background */}
        <div className="w-full h-16 bg-[#006400]" />
        
        {/* Logo Section */}
        <div className="mt-8 mb-8">
          <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-lg border border-gray-100 p-2 overflow-hidden">
            <div className="flex flex-col items-center">
               <div className="w-16 h-12 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-blue-600 rotate-12 rounded-lg opacity-20" />
                  <Smartphone className="text-blue-600" size={32} />
                  <Globe className="absolute -top-1 -right-1 text-green-500" size={16} />
               </div>
               <div className="text-[8px] font-black uppercase text-blue-900 mt-1 flex flex-col items-center leading-tight text-center px-2">
                  <span className="text-blue-600">Àbdüllāh Aĺ</span>
                  <span className="text-green-700 text-[9px]">Hỗŝŝâîň</span>
               </div>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="w-[90%] max-w-md bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6"
        >
          {/* Inputs */}
          <div className="space-y-4">
            <div className="relative">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-700">
                  <Mail size={20} />
               </div>
               <input 
                type="email" 
                placeholder="Email Address" 
                value={manualAuth.email}
                onChange={e => setManualAuth({...manualAuth, email: e.target.value})}
                className="w-full bg-[#F0F2F5] border-0 py-4 pl-12 pr-4 rounded-xl font-bold placeholder:text-gray-400 focus:ring-2 ring-green-700/20"
               />
            </div>
            <div className="relative">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-700">
                  <ShieldCheck size={20} />
               </div>
               <input 
                type="password" 
                placeholder="Password" 
                value={manualAuth.password}
                onChange={e => setManualAuth({...manualAuth, password: e.target.value})}
                className="w-full bg-[#F0F2F5] border-0 py-4 pl-12 pr-4 rounded-xl font-bold placeholder:text-gray-400 focus:ring-2 ring-green-700/20"
               />
            </div>
            <div className="flex justify-end px-2">
               <button 
                onClick={handleForgotPassword}
                className="text-[10px] font-black text-[#006400] uppercase tracking-widest hover:underline"
               >
                 Forgot Password?
               </button>
            </div>
          </div>

          {authError && (
            <p className="text-red-500 text-[10px] font-bold text-center bg-red-50 p-2 rounded-lg italic">
              {authError}
            </p>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
             <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={handleManualLogin}
                  disabled={authLoading}
                  className="py-4 bg-[#006400] text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-green-900/10 hover:bg-green-800 transition-all active:scale-95 disabled:opacity-50"
                >
                  {authLoading ? 'Wait...' : 'Login'}
                </button>
                <button 
                  onClick={handleManualRegister}
                  disabled={authLoading}
                  className="py-4 border-2 border-[#006400] text-[#006400] font-black rounded-xl uppercase tracking-widest hover:bg-green-50 transition-all active:scale-95 disabled:opacity-50"
                >
                  {authLoading ? 'Wait...' : 'Register'}
                </button>
             </div>

             <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                <div className="relative bg-white px-4 text-[8px] font-bold text-gray-300 uppercase tracking-widest">Or Continue With</div>
             </div>

             <div className="flex flex-col gap-3">
               <button 
                onClick={login}
                disabled={authLoading}
                className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 font-black rounded-xl text-[11px] uppercase tracking-widest hover:shadow-md transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 shadow-sm"
               >
                 <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                 Continue with Google
               </button>

               <button 
                onClick={loginWithFacebook}
                disabled={authLoading}
                className="w-full py-3.5 bg-[#1877F2] text-white font-black rounded-xl text-[11px] uppercase tracking-widest hover:bg-[#166fe5] shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
               >
                 <Facebook size={20} fill="white" />
                 Continue with Facebook
               </button>
             </div>
          </div>

          <p className="text-[10px] text-center text-gray-500 font-bold flex flex-wrap justify-center gap-1">
             By logging or Reg, you agree to our 
             <span className="text-green-700">Privacy Policy</span>
          </p>
        </motion.div>

        {/* Bottom Social Grid */}
        <div className="mt-8 w-[90%] max-w-md bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
           <div className="grid grid-cols-4 gap-2">
              <SocialIconItem href="https://wa.me/+8801876357998" icon={<MessageSquare className="text-green-500" />} label="Whatsapp" />
              <SocialIconItem href="https://t.me/user" icon={<Send className="text-blue-500" />} label="Telegram" />
              <SocialIconItem href="https://www.facebook.com/share/18kDS9BVwe/" icon={<Facebook className="text-blue-700" />} label="Facebook" />
              <SocialIconItem icon={<Smartphone className="text-green-700" />} label="Helpline" />
           </div>
        </div>
      </div>
    );
  }

  // Adding the helper component inside App or outside
  function SocialIconItem({ icon, label, href }: { icon: any, label: string, href?: string }) {
    const Component = href ? 'a' : 'div';
    return (
      <Component 
        href={href} 
        target={href ? "_blank" : undefined}
        rel={href ? "noreferrer" : undefined}
        className="flex flex-col items-center gap-1 group cursor-pointer active:scale-95 transition-all"
      >
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-all">
           {React.cloneElement(icon, { size: 28 })}
        </div>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{label}</span>
      </Component>
    );
  }

  if (isAdminView && profile?.role === 'admin') {
     return (
       <div className="bg-[#f0f2f5] min-h-screen">
         <div className="bg-[#006400] text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} />
              <span className="font-bold tracking-tight">ADMIN DASHBOARD</span>
            </div>
            <button onClick={() => setIsAdminView(false)} className="text-xs font-bold bg-white text-[#006400] px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors active:scale-95">Exit Admin</button>
         </div>
         <AdminPanel />
       </div>
     )
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-black font-sans selection:bg-[#006400] selection:text-white pb-32">
      {/* Header */}
      <header className="bg-[#006400] p-4 text-white flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-[#004d00] rounded-full active:scale-90 transition-all">
            <Menu size={24} />
          </button>
          {profile?.role === 'admin' && (
            <button 
              onClick={() => setIsAdminView(true)} 
              className="flex items-center gap-2 bg-white text-[#006400] px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              <ShieldCheck size={14} /> Admin panel
            </button>
          )}
        </div>
        <h1 className="font-bold text-lg uppercase tracking-wider truncate ml-2">Àbdüllāh Aĺ Hỗŝŝâîň</h1>
        <div className="flex items-center gap-2">
           <button onClick={logout} className="p-2 hover:bg-[#004d00] rounded-full active:scale-90 transition-all">
              <LogOut size={20} />
           </button>
        </div>
      </header>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        profile={profile}
        onNavigate={(view) => {
          if (view === 'admin') {
            setIsAdminView(true);
          } else {
            setActiveService(view);
          }
        }}
        onLogout={logout}
      />

      <main className="max-w-xl mx-auto p-4 md:p-6 space-y-6">
        <AnimatePresence mode="wait">
          {!activeService ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* User Profile Card */}
              <div 
                onClick={() => setActiveService('profile')}
                className="bg-white border-2 border-[#006400] rounded-2xl p-4 flex justify-between items-center shadow-sm cursor-pointer hover:bg-gray-50 transition-colors active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[#006400]">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#006400] text-sm">Welcome back!</h3>
                    <p className="font-black text-gray-900">{profile?.name || "User"}</p>
                    <p className="text-[10px] uppercase font-bold text-gray-400">{profile?.role === 'admin' ? 'Managing Director' : 'Active Member'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-[#006400]/10 px-3 py-1 rounded-full text-[#006400] font-black text-sm">
                    {profile?.balance || 0} TK
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase mt-1 block">Free Tier</span>
                </div>
              </div>

              {/* Balance Section */}
              <section className="bg-white rounded-3xl p-6 shadow-sm flex flex-col items-center">
                 <h2 className="w-full text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Account Balance</h2>
                 <div className="flex items-center justify-between w-full">
                   <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowBalance(!showBalance)}
                    className="w-40 h-40 bg-[#006400] rounded-full shadow-[0_10px_30px_rgba(0,100,0,0.3)] flex items-center justify-center text-white border-8 border-white group"
                   >
                     <div className="text-center">
                        <span className="text-[10px] font-black uppercase opacity-80 group-hover:opacity-100 mb-1 block">
                          {showBalance ? 'Current' : 'Tap for'}
                        </span>
                        <div className="text-xl font-black">
                          {showBalance ? `${profile?.balance || 0} TK` : 'Balance'}
                        </div>
                     </div>
                   </motion.button>
                   <div className="flex-1 ml-6 flex flex-col justify-center">
                      <button 
                        onClick={() => setActiveService('topup')}
                        className="bg-[#006400] text-white py-3 px-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-[#006400]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <PlusCircle size={16} /> Top Up Now
                      </button>
                      <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase text-center leading-tight">Add balance manually<br/>via Bkash/Nagad</p>
                   </div>
                 </div>
              </section>

              {/* Quick Links Section */}
              <section className="bg-white rounded-3xl p-6 shadow-sm">
                 <h2 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest pl-2">Quick Services</h2>
                 <div className="grid grid-cols-4 gap-y-8 gap-x-4">
                    {/* Hardcoded defaults if Firestore is empty or for mapping */}
                    {[
                      { id: 'sim_gp', icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/Grameenphone_Logo.svg/1024px-Grameenphone_Logo.svg.png', label: 'GP' },
                      { id: 'sim_robi', icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Robi_Axiata_Logo.svg/1024px-Robi_Axiata_Logo.svg.png', label: 'Robi' },
                      { id: 'sim_airtel', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Airtel_logo.svg/1024px-Airtel_logo.svg.png', label: 'Airtel' },
                      { id: 'sim_bl', icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Banglalink_Logo.svg/1024px-Banglalink_Logo.svg.png', label: 'Banglalink' },
                      { id: 'sim_family', icon: <Users size={28} />, label: 'Family' },
                      { id: 'digital', icon: <Zap className="text-amber-500" />, label: 'Digital' },
                    ].map(item => {
                      const serviceId = item.id.startsWith('sim_') ? 'sim_offer' : (item.id === 'digital' ? 'facebook_verification' : item.id);
                      const serviceConfig = services.find(s => s.id === serviceId);
                      
                      return (
                        <DashboardIcon 
                          key={item.id} 
                          icon={typeof item.icon === 'string' ? <img src={item.icon} alt={item.label} className="w-8 h-8 object-contain" /> : item.icon} 
                          label={item.label} 
                          onClick={() => {
                            if (item.id.startsWith('sim_')) {
                              const op = item.id.split('_')[1];
                              const opName = op === 'bl' ? 'Banglalink' : op.toUpperCase();
                              setActiveService(`sim:${opName}`);
                            } else if (item.id === 'digital') {
                               setActiveService('digital');
                            } else {
                               setActiveService(item.id);
                            }
                          }} 
                        />
                      );
                    })}
                    
                    {/* Other static icons */}
                    <DashboardIcon icon={<Wallet className="text-[#006400]" />} label="Top Up" onClick={() => setActiveService('topup')} />
                    <DashboardIcon icon={<Users className="text-red-500" />} label="My Team" />
                    <DashboardIcon icon={<Headset className="text-[#006400]" />} label="Agent" onClick={() => setActiveService('agent')} />
                 </div>
              </section>

              {/* Social Section */}
              <section className="bg-white rounded-3xl p-6 shadow-sm">
                 <h2 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest flex justify-between items-center px-2">
                   Contact Media
                   <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded">LIVE HELP</span>
                 </h2>
                 <div className="grid grid-cols-4 gap-4">
                    <SocialIcon icon={<MessageSquare className="text-green-500" />} label="WhatsApp" href="https://wa.me/+8801876357998" />
                    <SocialIcon icon={<Send className="text-blue-400" />} label="Telegram" href="https://t.me/user" />
                    <SocialIcon icon={<Facebook className="text-blue-600" />} label="Facebook" href="https://www.facebook.com/share/18kDS9BVwe/" />
                    <SocialIcon icon={<Youtube className="text-red-600" />} label="Youtube" href="https://youtube.com" />
                 </div>
              </section>

              {/* Daily Updates & Promotional Animation */}
              <section className="relative overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-100">
                 <div className="p-5 border-b border-[#006400]/10 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <h2 className="text-sm font-black uppercase text-gray-900 tracking-tighter">Live Updates</h2>
                    </div>
                    <span className="text-[10px] font-black bg-[#006400] text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                      {new Date().toLocaleDateString('en-GB')}
                    </span>
                 </div>
                 
                 <div className="relative h-64 bg-[#001a00] flex items-center justify-center overflow-hidden">
                    {/* Animated Background Elements */}
                    <motion.div 
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute w-[150%] h-[150%] border-[40px] border-[#006400]/10 rounded-full"
                    />
                    
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={promoIndex}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 1.1 }}
                        className="relative z-10 text-center px-8"
                      >
                         {promoIndex === 0 && (
                           <>
                             <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-2xl">
                               <Zap className="text-amber-400" size={40} />
                             </div>
                             <h3 className="text-white font-black text-xl uppercase tracking-tight mb-1">Super Sim Offers</h3>
                             <p className="text-[#00ff00] text-[10px] font-black uppercase tracking-[0.2em]">Up to 60% Discount Today</p>
                           </>
                         )}
                         {promoIndex === 1 && (
                           <>
                             <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-2xl">
                               <Facebook className="text-blue-400" size={40} />
                             </div>
                             <h3 className="text-white font-black text-xl uppercase tracking-tight mb-1">FB Verification</h3>
                             <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em]">Official Blue Badge Service</p>
                           </>
                         )}
                         {promoIndex === 2 && (
                           <>
                             <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-2xl">
                               <Globe className="text-emerald-400" size={40} />
                             </div>
                             <h3 className="text-white font-black text-xl uppercase tracking-tight mb-1">Fast Delivery</h3>
                             <p className="text-emerald-200 text-[10px] font-black uppercase tracking-[0.2em]">Automated Process 24/7</p>
                           </>
                         )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Progress Bar */}
                    <div className="absolute bottom-4 left-4 right-4 h-1 bg-white/10 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: "0%" }}
                         animate={{ width: "100%" }}
                         transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                         className="h-full bg-[#00ff00]"
                       />
                    </div>
                 </div>

                 <div className="p-6 bg-white space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                       <div className="w-10 h-10 bg-[#006400] rounded-xl flex items-center justify-center text-white shrink-0">
                          <CheckCircle size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active System Time</p>
                          <div className="text-lg font-black text-gray-900">
                             {new Date().toLocaleTimeString('en-US', { hour12: false })}
                          </div>
                       </div>
                       <div className="ml-auto flex items-center gap-1 bg-[#00ff00]/10 px-2 py-1 rounded text-[#006400] text-[8px] font-black uppercase">
                          <div className="w-1.5 h-1.5 bg-[#006400] rounded-full animate-ping" />
                          Online
                       </div>
                    </div>
                    
                    <button 
                      onClick={() => setActiveService('notification')}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#006400] text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-green-900/10 active:scale-95 transition-all"
                    >
                       View All News & Updates
                    </button>
                 </div>
              </section>

            </motion.div>
          ) : (
            <motion.div 
              key="service"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-6 rounded-3xl shadow-lg border-t-8 border-[#006400]"
            >
              {activeService?.startsWith('sim:') && (
                <SimOffers 
                  initialOperator={activeService.split(':')[1]} 
                  onBack={() => setActiveService(null)} 
                  onSuccess={handleSuccess} 
                />
              )}
              {activeService === 'sim' && <SimOffers onBack={() => setActiveService(null)} onSuccess={handleSuccess} />}
              {activeService === 'digital' && <DigitalServices onBack={() => setActiveService(null)} onSuccess={handleSuccess} />}
              {activeService === 'topup' && <TopUpForm onBack={() => setActiveService(null)} onSuccess={handleSuccess} />}
              {activeService === 'history' && <SubmissionsHistory onBack={() => setActiveService('profile')} />}
              {activeService === 'notification' && <NotificationView onBack={() => setActiveService(null)} />}
              {activeService === 'change_password' && <ChangePasswordView onBack={() => setActiveService(null)} />}
              {activeService === 'tally' && <TallyNote onBack={() => setActiveService(null)} />}
              {activeService === 'agent' && <AgentLinks onBack={() => setActiveService(null)} />}
              {activeService === 'profile' && profile && (
                <ProfileEdit 
                  profile={profile} 
                  onClose={() => setActiveService(null)} 
                  onUpdate={(updated) => {
                    if ((updated as any).showHistory) {
                      setActiveService('history');
                    } else {
                      setProfile(prev => prev ? { ...prev, ...updated } : prev);
                    }
                  }} 
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#006400] text-white flex justify-around items-center h-20 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-50">
         <BottomNavItem icon={<Home size={24} />} label="Home" onClick={() => setActiveService(null)} isActive={!activeService} />
         <BottomNavItem icon={<Zap size={24} />} label="Offers" onClick={() => setActiveService('sim')} isActive={activeService === 'sim'} />
         <BottomNavItem icon={<BookOpen size={24} />} label="Tally" onClick={() => setActiveService('tally')} isActive={activeService === 'tally'} />
      </nav>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#006400] text-white px-8 py-4 rounded-full flex items-center gap-3 font-bold shadow-2xl z-50 border-2 border-white"
          >
            <CheckCircle className="text-white" />
            Request Submitted Successfully!
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

const DashboardIcon = ({ icon, label, onClick }: any) => {
  const isLucideIcon = React.isValidElement(icon) && typeof (icon.type as any) !== 'string';
  
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group cursor-pointer active:scale-90 transition-all">
      <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center p-2 transition-all group-hover:bg-white group-hover:shadow-md group-hover:scale-105 overflow-hidden">
        {isLucideIcon ? React.cloneElement(icon as React.ReactElement, { size: 28 }) : icon}
      </div>
      <span className="text-[10px] font-black uppercase text-gray-500 tracking-tighter text-center leading-tight">{label}</span>
    </button>
  );
};

const SocialIcon = ({ icon, label, href }: any) => (
  <a href={href} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 group active:scale-90 transition-all">
    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 group-hover:shadow-md transition-all">
      {React.cloneElement(icon as React.ReactElement, { size: 24 })}
    </div>
    <span className="text-[9px] font-bold text-gray-400 uppercase">{label}</span>
  </a>
);

const BottomNavItem = ({ icon, label, onClick, isActive }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 flex-1 transition-all active:scale-90 ${isActive ? 'scale-110 opacity-100' : 'opacity-60 hover:opacity-100'}`}
  >
    {icon}
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const AgentLinks = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-6">
    <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#006400] mb-4">
      <ArrowLeft size={16} /> Back
    </button>
    <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-[#006400]">Contact Agent</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[
        { name: 'WhatsApp', icon: <MessageSquare />, link: 'https://wa.me/+8801876357998', color: 'bg-green-500' },
        { name: 'Facebook', icon: <Facebook />, link: 'https://www.facebook.com/share/18kDS9BVwe/', color: 'bg-blue-600' },
        { name: 'Instagram', icon: <Instagram />, link: 'https://www.instagram.com/ali_8khan?igsh=N2FxZnVuZjR3ZWZ1', color: 'bg-pink-600' },
        { name: 'Gmail', icon: <Mail />, link: 'mailto:mhossenali740@gmail.com', color: 'bg-red-600' }
      ].map(link => (
        <a 
          key={link.name}
          href={link.link} 
          target="_blank" 
          rel="noreferrer"
          className={`p-4 rounded-xl flex items-center gap-4 font-black uppercase tracking-wider text-white transition-all shadow-md active:scale-95 ${link.color}`}
        >
          {link.icon} {link.name}
        </a>
      ))}
    </div>
  </div>
);

const ArrowLeft = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);
