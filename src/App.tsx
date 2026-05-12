import React, { useState, useEffect } from "react";
import { auth, db, OperationType, handleFirestoreError } from "./lib/firebase";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
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
import { ADMIN_EMAIL, UserProfile } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
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
            role: u.email === ADMIN_EMAIL ? 'admin' : 'user',
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
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubAuth();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      console.error(err);
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
      <div className="h-screen flex flex-col items-center justify-center bg-[#F4F4F4] p-6 text-center overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border-t-4 border-[#006400]"
        >
          <div className="mb-6">
            <div className="w-20 h-20 bg-[#006400] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
              <Zap size={40} />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 leading-none">
              Service Point <span className="text-[#006400]">BD</span>
            </h1>
            <p className="text-gray-500 font-medium mt-2">Professional Digital Solutions</p>
          </div>
          
          <button 
            onClick={login}
            className="flex items-center justify-center gap-3 w-full bg-[#006400] text-white font-bold py-4 rounded-xl hover:bg-[#004d00] transition-all shadow-lg active:scale-95"
          >
            <LogIn size={20} /> Login with Google
          </button>
        </motion.div>
      </div>
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
            <button onClick={() => setIsAdminView(false)} className="text-xs font-bold bg-white text-[#006400] px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors">Exit Admin</button>
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
          <h1 className="font-bold text-xl uppercase tracking-wider">Service Point BD</h1>
        </div>
        <div className="flex items-center gap-2">
           {profile?.role === 'admin' && (
             <button onClick={() => setIsAdminView(true)} className="p-2 hover:bg-[#004d00] rounded-full">
               <LayoutDashboard size={20} />
             </button>
           )}
           <button onClick={logout} className="p-2 hover:bg-[#004d00] rounded-full">
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
              <div className="bg-white border-2 border-[#006400] rounded-2xl p-4 flex justify-between items-center shadow-sm">
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
                    <DashboardIcon icon={<PlusCircle className="text-blue-600" />} label="Verification" onClick={() => setActiveService('fb')} />
                    <DashboardIcon icon={<Globe className="text-purple-600" />} label="Web Dev" onClick={() => setActiveService('web')} />
                    <DashboardIcon icon={<Smartphone className="text-emerald-600" />} label="App Dev" onClick={() => setActiveService('app')} />
                    <DashboardIcon icon={<Zap className="text-amber-500" />} label="All Offers" onClick={() => setActiveService('sim')} />
                    
                    <DashboardIcon icon={<ArrowRightLeft className="text-gray-600" />} label="Transfer" />
                    <DashboardIcon icon={<Wallet className="text-[#006400]" />} label="Payments" />
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
                    <SocialIcon icon={<MessageSquare className="text-green-500" />} label="WhatsApp" href="https://wa.me/01700000000" />
                    <SocialIcon icon={<Send className="text-blue-400" />} label="Telegram" href="https://t.me/user" />
                    <SocialIcon icon={<Facebook className="text-blue-600" />} label="Facebook" href="https://fb.com/user" />
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
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#006400] text-white flex justify-around items-center h-20 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-50">
         <BottomNavItem icon={<Home size={24} />} label="Home" onClick={() => setActiveService(null)} isActive={!activeService} />
         <BottomNavItem icon={<Zap size={24} />} label="Recharge" onClick={() => setActiveService('sim')} isActive={activeService === 'sim'} />
         <BottomNavItem icon={<BookOpen size={24} />} label="TallyKhata" />
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

const DashboardIcon = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 group">
    <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center transition-all group-hover:bg-white group-hover:shadow-md group-hover:scale-105">
      {React.cloneElement(icon as React.ReactElement, { size: 28 })}
    </div>
    <span className="text-[10px] font-black uppercase text-gray-500 tracking-tighter text-center">{label}</span>
  </button>
);

const SocialIcon = ({ icon, label, href }: any) => (
  <a href={href} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 group">
    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 group-hover:shadow-md transition-all">
      {React.cloneElement(icon as React.ReactElement, { size: 24 })}
    </div>
    <span className="text-[9px] font-bold text-gray-400 uppercase">{label}</span>
  </a>
);

const BottomNavItem = ({ icon, label, onClick, isActive }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 flex-1 transition-all ${isActive ? 'scale-110 opacity-100' : 'opacity-60 hover:opacity-100'}`}
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
        { name: 'WhatsApp', icon: <MessageSquare />, link: 'https://wa.me/01700000000', color: 'bg-green-500' },
        { name: 'Facebook', icon: <Facebook />, link: 'https://fb.com/user', color: 'bg-blue-600' },
        { name: 'Instagram', icon: <Instagram />, link: 'https://instagram.com/user', color: 'bg-pink-600' },
        { name: 'Gmail', icon: <Mail />, link: 'mailto:hridykhan740@gmail.com', color: 'bg-red-600' }
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
