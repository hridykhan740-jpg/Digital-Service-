import React, { useState, useEffect } from "react";
import { auth, db, OperationType, handleFirestoreError } from "./lib/firebase";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
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
  SimOffers 
} from "./components/ServiceForms";
import { AdminPanel } from "./components/AdminPanel";
import { ProfileEdit } from "./components/ProfileEdit";
import { ADMIN_EMAILS, UserProfile, PlatformService } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [services, setServices] = useState<PlatformService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  const [authLoading, setAuthLoading] = useState(false);

  const [showPaymentInfo, setShowPaymentInfo] = useState(false);

  useEffect(() => {
    // Listen to services
    const unsubServices = onSnapshot(collection(db, "services"), (snapshot) => {
      setServices(snapshot.docs.map(doc => doc.data() as PlatformService));
    });

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      try {
        setUser(u);
        if (u) {
          // Check if profile exists
          const profileDoc = await getDoc(doc(db, "users", u.uid));
          if (!profileDoc.exists()) {
            // If using google auth, auto-create a basic profile if missing
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
            setProfile(profileDoc.data() as UserProfile);
          }
          
          // Listen to profile updates (for balance/role changes)
          onSnapshot(doc(db, "users", u.uid), (doc) => {
            if (doc.exists()) setProfile(doc.data() as UserProfile);
          }, (err) => {
            handleFirestoreError(err, OperationType.GET, `users/${u.uid}`);
          });
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      unsubServices();
    };
  }, []);

  const login = async () => {
    setAuthLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      // Ensure popup is allowed
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.code === 'auth/popup-blocked') {
        alert("আপনার ব্রাউজার পপ-আপ ব্লক করেছে। অনুগ্রহ করে পপ-আপ এলাউ করুন।");
      } else {
        alert("লগইন করতে সমস্যা হচ্ছে: " + (err.code || err.message));
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
                  <MessageSquare size={20} />
               </div>
               <input 
                type="text" 
                placeholder="Mobile number" 
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
                className="w-full bg-[#F0F2F5] border-0 py-4 pl-12 pr-4 rounded-xl font-bold placeholder:text-gray-400 focus:ring-2 ring-green-700/20"
               />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
             <button 
              onClick={login}
              disabled={authLoading}
              className="w-full py-4 border-2 border-green-700 text-green-700 font-black rounded-full uppercase tracking-widest hover:bg-green-50 transition-all active:scale-95 disabled:opacity-50"
             >
               {authLoading ? 'Wait...' : 'Login with Google'}
             </button>
             
             <button 
              onClick={login}
              disabled={authLoading}
              className="w-full py-4 bg-[#006400] text-white font-black rounded-full uppercase tracking-widest shadow-xl shadow-green-900/20 hover:bg-green-800 transition-all active:scale-95 disabled:opacity-50"
             >
               {authLoading ? 'Processing...' : 'Create Account'}
             </button>
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
        <div className="flex items-center gap-4">
          <Menu size={24} />
          <h1 className="font-bold text-xl uppercase tracking-wider">Àbdüllāh Aĺ Hỗŝŝâîň</h1>
        </div>
        <div className="flex items-center gap-2">
           {profile?.role === 'admin' && (
             <button onClick={() => setIsAdminView(true)} className="p-2 hover:bg-[#004d00] rounded-full active:scale-90 transition-all">
               <LayoutDashboard size={20} />
             </button>
           )}
           <button onClick={logout} className="p-2 hover:bg-[#004d00] rounded-full active:scale-90 transition-all">
              <LogOut size={20} />
           </button>
        </div>
      </header>

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
                   <div className="flex-1 ml-6 space-y-3">
                      <div className="h-10 bg-gray-100 rounded-lg w-full animate-pulse" />
                      <div className="h-10 bg-gray-100 rounded-lg w-3/4 animate-pulse" />
                   </div>
                 </div>
              </section>

              {/* Quick Links Section */}
              <section className="bg-white rounded-3xl p-6 shadow-sm">
                 <h2 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest pl-2">Quick Services</h2>
                 <div className="grid grid-cols-4 gap-y-8 gap-x-4">
                    {/* Hardcoded defaults if Firestore is empty or for mapping */}
                    {[
                      { id: 'fb', icon: <PlusCircle className="text-blue-600" />, label: 'Verification', dbId: 'facebook_verification' },
                      { id: 'web', icon: <Globe className="text-purple-600" />, label: 'Web Dev', dbId: 'website_dev' },
                      { id: 'app', icon: <Smartphone className="text-emerald-600" />, label: 'App Dev', dbId: 'app_dev' },
                      { id: 'sim', icon: <Zap className="text-amber-500" />, label: 'All Offers', dbId: 'sim_offer' },
                    ].map(item => {
                      const serviceConfig = services.find(s => s.id === item.dbId);
                      // If service configuration exists in Firestore, use its active status. 
                      // If not, show it as active by default for standard ones.
                      if (serviceConfig) {
                        if (!serviceConfig.active) return null;
                        if (serviceConfig.adminOnly && profile?.role !== 'admin') return null;
                      }
                      
                      return (
                        <DashboardIcon 
                          key={item.id} 
                          icon={item.icon} 
                          label={serviceConfig?.title || item.label} 
                          onClick={() => setActiveService(item.id)} 
                        />
                      );
                    })}
                    
                    {/* Other static icons */}
                    <DashboardIcon icon={<Wallet className="text-[#006400]" />} label="Payments" onClick={() => setShowPaymentInfo(true)} />
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

              {/* Prayer Schedule Placeholder (Styled like screenshot) */}
              <section className="relative overflow-hidden bg-white rounded-3xl shadow-sm">
                 <div className="p-6 border-b border-[#006400]/10 flex justify-between items-center">
                    <h2 className="text-sm font-black uppercase text-[#006400]">Daily Updates</h2>
                    <span className="text-xs font-bold text-gray-400">12-05-2026</span>
                 </div>
                 <div className="p-8 text-center bg-gradient-to-b from-white to-gray-50">
                    <div className="text-4xl font-black text-gray-900 tracking-tighter mb-2">04:47 <span className="text-sm align-top">41</span></div>
                    <p className="text-sm font-bold text-[#006400] uppercase tracking-widest">Active System Time</p>
                    {/* Visual Curve like screenshot */}
                    <div className="mt-8 border-t-2 border-[#006400] w-full h-8 rounded-[100%] border-b-0 opacity-20" />
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
              {activeService === 'fb' && <FacebookForm onBack={() => setActiveService(null)} onSuccess={handleSuccess} />}
              {activeService === 'web' && <WebsiteForm onBack={() => setActiveService(null)} onSuccess={handleSuccess} />}
              {activeService === 'app' && <AppForm onBack={() => setActiveService(null)} onSuccess={handleSuccess} />}
              {activeService === 'sim' && <SimOffers onBack={() => setActiveService(null)} onSuccess={handleSuccess} />}
              {activeService === 'agent' && <AgentLinks onBack={() => setActiveService(null)} />}
              {activeService === 'profile' && profile && (
                <ProfileEdit 
                  profile={profile} 
                  onClose={() => setActiveService(null)} 
                  onUpdate={(updated) => setProfile(prev => prev ? { ...prev, ...updated } : prev)} 
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#006400] text-white flex justify-around items-center h-20 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-50">
         <BottomNavItem icon={<Home size={24} />} label="Home" onClick={() => setActiveService(null)} isActive={!activeService} />
         <BottomNavItem icon={<Zap size={24} />} label="Recharge" onClick={() => setActiveService('sim')} isActive={activeService === 'sim'} />
         <BottomNavItem icon={<BookOpen size={24} />} label="TallyKhata" onClick={() => window.open('https://tallykhata.com', '_blank')} />
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

      {/* Payment Info Modal */}
      <AnimatePresence>
        {showPaymentInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowPaymentInfo(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl overflow-hidden relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#006400]/5 -mr-8 -mt-8 rounded-full" />
              <div className="relative text-center">
                <div className="w-16 h-16 bg-[#006400] text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Wallet size={32} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Add Balance</h3>
                <p className="text-sm text-gray-500 font-bold mb-6">Payment Methods for Manual Top-up</p>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Payment Number</p>
                    <p className="text-2xl font-black text-[#006400]">01876357998</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">( Send Money )</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-left">
                     {['Bkash', 'Nagad', 'Rocket', 'Upay', 'Dutch-Bangla'].map(m => (
                       <div key={m} className="bg-gray-50 px-3 py-2 rounded-xl text-[10px] font-bold text-gray-600 flex items-center gap-2">
                         <div className="w-2 h-2 bg-[#006400] rounded-full" />
                         {m}
                       </div>
                     ))}
                  </div>
                </div>

                <div className="mt-8">
                  <button 
                    onClick={() => setShowPaymentInfo(false)}
                    className="w-full bg-[#006400] text-white font-black py-4 rounded-2xl shadow-xl shadow-[#006400]/20 active:scale-95 transition-all"
                  >
                    Got it
                  </button>
                  <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase">After Payment, Send Screenshot to Agent</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const DashboardIcon = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 group cursor-pointer active:scale-90 transition-all">
    <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center transition-all group-hover:bg-white group-hover:shadow-md group-hover:scale-105">
      {React.cloneElement(icon as React.ReactElement, { size: 28 })}
    </div>
    <span className="text-[10px] font-black uppercase text-gray-500 tracking-tighter text-center">{label}</span>
  </button>
);

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
