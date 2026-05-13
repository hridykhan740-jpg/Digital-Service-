import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, addDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db, auth, OperationType, handleFirestoreError } from "../lib/firebase";
import { SimOffer, PlatformService } from "../types";
import { Smartphone, Globe, Facebook, ArrowLeft, Upload, Zap, CheckCircle, AlertCircle, Users } from "lucide-react";
import { motion } from "motion/react";

const operators = [
  { name: 'GP', color: 'bg-[#1BB3E9]', icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/Grameenphone_Logo.svg/1024px-Grameenphone_Logo.svg.png' },
  { name: 'Robi', color: 'bg-[#E30613]', icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Robi_Axiata_Logo.svg/1024px-Robi_Axiata_Logo.svg.png' },
  { name: 'Airtel', color: 'bg-[#FF0000]', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Airtel_logo.svg/1024px-Airtel_logo.svg.png' },
  { name: 'Banglalink', color: 'bg-[#F47920]', icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Banglalink_Logo.svg/1024px-Banglalink_Logo.svg.png' },
  { name: 'Family', color: 'bg-[#9333ea]', icon: <Users size={32} /> }
];

const paymentMethods = [
  { name: 'Bkash', color: 'bg-[#D12053]', icon: 'https://logos-download.com/wp-content/uploads/2022/01/BKash_Logo.png' },
  { name: 'Nagad', color: 'bg-[#F47920]', icon: 'https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png' },
  { name: 'Rocket', color: 'bg-[#8C3494]', icon: 'https://www.rocket.com.bd/assets/images/rocket-logo.png' },
  { name: 'Upay', color: 'bg-[#FFD400]', icon: 'https://www.upay.com.bd/assets/images/upay-logo.png' },
  { name: 'Dutch', color: 'bg-[#005CAB]', icon: 'https://www.dutchbanglabank.com/images/footer-logo.png' }
];

const ServiceHeader = ({ id, defaultTitle, defaultColor, icon: Icon }: any) => {
  const [config, setConfig] = useState<PlatformService | null>(null);

  useEffect(() => {
    getDoc(doc(db, "services", id)).then(snap => {
      if (snap.exists()) setConfig(snap.data() as PlatformService);
    });
  }, [id]);

  return (
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${defaultColor}`}>
        <Icon size={28} />
      </div>
      <div>
        <h2 className="text-2xl font-black uppercase text-gray-900">{config?.title || defaultTitle}</h2>
        {config?.priceInfo ? (
          <p className="text-[10px] font-bold text-[#006400]">{config.priceInfo}</p>
        ) : (
          <p className="text-[10px] font-bold text-[#006400]">Payment: 01876357998 (All Local Methods)</p>
        )}
        {config?.description && <p className="text-[10px] text-gray-400 mt-0.5">{config.description}</p>}
      </div>
    </div>
  );
};

export const FacebookForm = ({ onBack, onSuccess }: { onBack: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({ name: '', link: '', phone: '' });
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setScreenshot(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot) return alert("Please upload payment screenshot!");
    setLoading(true);
    try {
      await addDoc(collection(db, "submissions"), {
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        serviceType: 'facebook_verification',
        details: formData,
        paymentScreenshot: screenshot,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // User notification for activity log
      await addDoc(collection(db, "notifications"), {
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        type: 'order',
        title: 'New Order: Facebook Verification',
        message: `User submitted a request for Facebook Verification.`,
        read: false,
        createdAt: serverTimestamp()
      });

      onSuccess();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "submissions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#006400]">
        <ArrowLeft size={16} /> Back
      </button>
      
      <ServiceHeader 
        id="facebook_verification" 
        defaultTitle="FB Verification" 
        defaultColor="bg-blue-100 text-blue-600" 
        icon={Facebook} 
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Full Name</label>
          <input required className="w-full bg-gray-50 border-0 p-4 rounded-xl font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="As on ID card" />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Profile Link</label>
          <input required className="w-full bg-gray-50 border-0 p-4 rounded-xl font-bold" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} placeholder="facebook.com/..." />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Contact Phone</label>
          <input required className="w-full bg-gray-50 border-0 p-4 rounded-xl font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="01XXX-XXXXXX" />
        </div>
        
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Payment Screenshot</label>
          <label className="flex flex-col items-center justify-center w-full h-40 bg-gray-50 rounded-2xl border-2 border-dashed border-[#006400]/20 cursor-pointer hover:bg-gray-100 transition-all overflow-hidden relative">
            {screenshot ? (
              <img src={screenshot} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <Upload className="mx-auto text-[#006400] mb-2" />
                <span className="text-xs font-bold text-gray-400">Tap to upload proof</span>
              </div>
            )}
            <input type="file" className="hidden" onChange={handleFile} accept="image/*" />
          </label>
        </div>

        <button disabled={loading} className="w-full bg-[#006400] text-white font-black py-4 rounded-xl uppercase hover:bg-[#004d00] transition-all disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export const WebsiteForm = ({ onBack, onSuccess }: { onBack: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({ category: 'Personal', requirements: '', budget: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "submissions"), {
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        serviceType: 'website_dev',
        details: formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // User notification for activity log
      await addDoc(collection(db, "notifications"), {
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        type: 'order',
        title: 'New Order: Website Development',
        message: `User requested a quote for ${formData.category} website.`,
        read: false,
        createdAt: serverTimestamp()
      });

      onSuccess();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "submissions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#006400]">
        <ArrowLeft size={16} /> Back
      </button>

      <ServiceHeader 
        id="website_dev" 
        defaultTitle="Website Dev" 
        defaultColor="bg-purple-100 text-purple-600" 
        icon={Globe} 
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {['E-commerce', 'Personal', 'Business', 'Portfolio'].map(cat => (
              <button key={cat} type="button" onClick={() => setFormData({...formData, category: cat})} className={`p-4 rounded-xl font-bold transition-all ${formData.category === cat ? 'bg-[#006400] text-white' : 'bg-gray-50 text-gray-500'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Requirements</label>
          <textarea required rows={4} className="w-full bg-gray-50 border-0 p-4 rounded-xl font-bold resize-none" value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} placeholder="Tell us about your dream project..." />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Budget (TK)</label>
          <input required type="number" className="w-full bg-gray-50 border-0 p-4 rounded-xl font-bold" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
        </div>
        <button disabled={loading} className="w-full bg-[#006400] text-white font-black py-4 rounded-xl uppercase hover:bg-[#004d00] disabled:opacity-50">
          {loading ? 'Sending...' : 'Get Quotation'}
        </button>
      </form>
    </div>
  );
};

export const AppForm = ({ onBack, onSuccess }: { onBack: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({ description: '', budget: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "submissions"), {
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        serviceType: 'app_dev',
        details: formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // User notification for activity log
      await addDoc(collection(db, "notifications"), {
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        type: 'order',
        title: 'New Order: App Development',
        message: `User requested a project for app development.`,
        read: false,
        createdAt: serverTimestamp()
      });

      onSuccess();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "submissions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#006400]">
        <ArrowLeft size={16} /> Back
      </button>

      <ServiceHeader 
        id="app_dev" 
        defaultTitle="App Development" 
        defaultColor="bg-emerald-100 text-emerald-600" 
        icon={Smartphone} 
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">App Description</label>
          <textarea required rows={4} className="w-full bg-gray-50 border-0 p-4 rounded-xl font-bold resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="What should the app do?" />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Budget (TK)</label>
          <input required type="number" className="w-full bg-gray-50 border-0 p-4 rounded-xl font-bold" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
        </div>
        <button disabled={loading} className="w-full bg-[#006400] text-white font-black py-4 rounded-xl uppercase hover:bg-[#004d00] disabled:opacity-50">
          {loading ? 'Submitting...' : 'Request Project'}
        </button>
      </form>
    </div>
  );
};

export const TopUpForm = ({ onBack, onSuccess }: { onBack: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({ amount: '', method: 'Bkash', trxId: '' });
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setScreenshot(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot) return alert("Please upload payment screenshot!");
    setLoading(true);
    try {
      await addDoc(collection(db, "submissions"), {
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        serviceType: 'top_up',
        details: formData,
        paymentScreenshot: screenshot,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // User notification for activity log
      await addDoc(collection(db, "notifications"), {
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        type: 'balance',
        title: 'New Deposit Request',
        message: `User requested to top up ${formData.amount} TK via ${formData.method}.`,
        read: false,
        createdAt: serverTimestamp()
      });

      onSuccess();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "submissions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#006400]">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="text-center space-y-2 mb-6">
        <div className="w-20 h-20 bg-green-100 text-[#006400] rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <Upload size={40} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 uppercase">Top Up Balance</h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-tight">Send Money to 01876357998<br/>Then submit details below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Amount (TK)</label>
          <input 
            required 
            type="number" 
            className="w-full bg-gray-50 border-0 p-4 rounded-xl font-bold text-xl" 
            value={formData.amount} 
            onChange={e => setFormData({...formData, amount: e.target.value})} 
            placeholder="Min 10 TK" 
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            {paymentMethods.slice(0, 3).map(m => (
              <button 
                key={m.name} 
                type="button" 
                onClick={() => setFormData({...formData, method: m.name})}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl font-bold transition-all border-2 ${formData.method === m.name ? 'bg-[#006400]/5 border-[#006400] text-[#006400]' : 'bg-gray-50 border-transparent text-gray-400'}`}
              >
                <img src={m.icon as string} alt={m.name} className="h-6 object-contain" />
                <span className="text-[10px] uppercase">{m.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Transaction ID (Optional)</label>
          <input 
            className="w-full bg-gray-50 border-0 p-4 rounded-xl font-bold" 
            value={formData.trxId} 
            onChange={e => setFormData({...formData, trxId: e.target.value})} 
            placeholder="e.g. AX76B2..." 
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Payment Screenshot</label>
          <label className="flex flex-col items-center justify-center w-full h-40 bg-gray-50 rounded-2xl border-2 border-dashed border-[#006400]/20 cursor-pointer hover:bg-gray-100 transition-all overflow-hidden relative">
            {screenshot ? (
              <img src={screenshot} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <Upload className="mx-auto text-gray-200 mb-2" size={32} />
                <span className="text-[10px] font-black text-gray-400 uppercase mt-2 block">Upload Screenshot</span>
              </div>
            )}
            <input type="file" className="hidden" onChange={handleFile} accept="image/*" />
          </label>
        </div>

        <button disabled={loading} className="w-full bg-[#006400] text-white font-black py-5 rounded-2xl uppercase tracking-widest shadow-xl shadow-[#006400]/20 active:scale-95 transition-all">
          {loading ? 'Submitting...' : 'Confirm Payment'}
        </button>
      </form>
    </div>
  );
};

export const DigitalServices = ({ onBack, onSuccess }: { onBack: () => void, onSuccess: () => void }) => {
  const [selectedForm, setSelectedForm] = useState<'fb' | 'web' | 'app' | null>(null);

  const services = [
    { id: 'fb', label: 'Verification', icon: <Facebook size={32} />, color: 'bg-blue-50 text-blue-600', description: 'Blue badge request' },
    { id: 'web', label: 'Web Dev', icon: <Globe size={32} />, color: 'bg-purple-50 text-purple-600', description: 'Business & Personal' },
    { id: 'app', label: 'App Dev', icon: <Smartphone size={32} />, color: 'bg-emerald-50 text-emerald-600', description: 'iOS & Android' },
  ];

  if (selectedForm === 'fb') return <FacebookForm onBack={() => setSelectedForm(null)} onSuccess={onSuccess} />;
  if (selectedForm === 'web') return <WebsiteForm onBack={() => setSelectedForm(null)} onSuccess={onSuccess} />;
  if (selectedForm === 'app') return <AppForm onBack={() => setSelectedForm(null)} onSuccess={onSuccess} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#006400]">
          <ArrowLeft size={16} /> Back
        </button>
        <h2 className="text-sm font-black uppercase text-gray-900 tracking-widest pl-4 pr-4 py-1 bg-gray-100 rounded-full">Digital Services</h2>
        <div className="w-8" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {services.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedForm(s.id as any)}
            className="flex items-center gap-4 p-6 bg-white border border-gray-100 rounded-3xl hover:border-[#006400]/30 transition-all active:scale-[0.98] group"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${s.color}`}>
              {s.icon}
            </div>
            <div className="text-left">
              <h3 className="font-black text-lg text-gray-900 uppercase tracking-tight">{s.label}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.description}</p>
            </div>
            <div className="ml-auto w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#006400] group-hover:text-white transition-all">
               <ArrowLeft size={20} className="rotate-180" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export const SimOffers = ({ onBack, onSuccess, initialOperator }: { onBack: () => void, onSuccess: () => void, initialOperator?: string }) => {
  const [offers, setOffers] = useState<SimOffer[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(initialOperator || null);
  const [activeTab, setActiveTab] = useState<'Bundle' | 'Minute' | 'Internet'>('Bundle');
  const [purchasingOffer, setPurchasingOffer] = useState<SimOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [purchaseData, setPurchaseData] = useState({ phone: '', method: 'Bkash', screenshot: '' });

  useEffect(() => {
    const q = query(collection(db, "sim_offers"), where("active", "==", true));
    const unsub = onSnapshot(q, (snapshot) => {
      setOffers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SimOffer)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, "sim_offers"));
    return () => unsub();
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPurchaseData(prev => ({ ...prev, screenshot: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseData.screenshot) return alert("Please upload payment screenshot!");
    if (!auth.currentUser) return alert("Please log in first");
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, "submissions"), {
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        serviceType: 'sim_offer',
        details: { 
          ...purchasingOffer, 
          targetPhone: purchaseData.phone, 
          paymentMethod: purchaseData.method 
        },
        paymentScreenshot: purchaseData.screenshot,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // User notification for activity log
      await addDoc(collection(db, "notifications"), {
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        type: 'order',
        title: `SIM Offer: ${purchasingOffer?.title}`,
        message: `User purchased ${purchasingOffer?.operator} bundle for ${purchaseData.phone}.`,
        read: false,
        createdAt: serverTimestamp()
      });

      setPurchasingOffer(null);
      onSuccess();
    } catch (err) { 
      handleFirestoreError(err, OperationType.CREATE, "submissions"); 
    } finally {
      setSubmitting(false);
    }
  };

  const digitalServices = [
    { id: 'fb', name: 'Verification', icon: <Facebook size={24} /> },
    { id: 'web', name: 'Web Dev', icon: <Globe size={24} /> },
    { id: 'app', name: 'App Dev', icon: <Smartphone size={24} /> },
  ];

  const tabs: { id: typeof activeTab, label: string }[] = [
    { id: 'Bundle', label: 'Bundle Offer' },
    { id: 'Minute', label: 'Minute Offer' },
    { id: 'Internet', label: 'Internet Offer' }
  ];

  const filteredOffers = selectedOperator 
    ? offers.filter(o => o.operator === selectedOperator && o.type === activeTab)
    : [];

  if (selectedOperator === 'fb') return <FacebookForm onBack={() => setSelectedOperator(initialOperator || null)} onSuccess={onSuccess} />;
  if (selectedOperator === 'web') return <WebsiteForm onBack={() => setSelectedOperator(initialOperator || null)} onSuccess={onSuccess} />;
  if (selectedOperator === 'app') return <AppForm onBack={() => setSelectedOperator(initialOperator || null)} onSuccess={onSuccess} />;

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#006400]">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Digital Services Navigation (Replaced Operators) */}
      <div className="grid grid-cols-3 gap-3">
        {digitalServices.map(service => (
          <button 
            key={service.id} 
            onClick={() => setSelectedOperator(service.id)} 
            className={`flex flex-col items-center gap-2 group transition-all`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 ${selectedOperator === service.id ? `bg-[#006400] border-[#006400] shadow-lg text-white` : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}>
              {service.icon}
            </div>
            <span className={`text-[9px] font-black uppercase text-center leading-tight ${selectedOperator === service.id ? 'text-[#006400]' : 'text-gray-400'}`}>
              {service.name}
            </span>
          </button>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-100">
        {selectedOperator && !['fb', 'web', 'app'].includes(selectedOperator) ? (
          <div className="space-y-4">
             {/* Header for Selected Operator */}
             <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border-l-4 border-[#006400]">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow-sm">
                   <img src={operators.find(o => o.name === selectedOperator)?.icon as string || ''} alt="" className="w-full h-full object-contain" />
                </div>
                <h3 className="font-black text-gray-900 uppercase tracking-widest">{selectedOperator} Offers</h3>
             </div>
          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? 'bg-[#006400] text-white shadow-md' : 'bg-gray-50 text-gray-400'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Offer List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-10 animate-pulse text-gray-300">Loading offers...</div>
            ) : filteredOffers.length === 0 ? (
              <div className="text-center py-10">
                <AlertCircle className="mx-auto text-gray-200 mb-2" size={40} />
                <p className="text-gray-400 font-bold italic">No {activeTab}s found</p>
              </div>
            ) : (
              filteredOffers.map(offer => (
                <div key={offer.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#006400]/30 transition-all group">
                  <div className="space-y-1">
                    <h3 className="font-black text-xl text-gray-900 group-hover:text-[#006400] transition-colors">{offer.title}</h3>
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-1 text-[#006400] font-black text-sm">
                        <span>{offer.price} TK</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 font-bold text-xs">
                        <span>{offer.validity}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPurchasingOffer(offer)}
                    className="w-full sm:w-auto bg-[#006400] text-white font-black text-sm px-8 py-3 rounded-2xl uppercase tracking-wider hover:bg-[#004d00] transition-all active:scale-95"
                  >
                    Buy Now
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-amber-500 shadow-sm">
            <Zap size={32} />
          </div>
          <p className="text-amber-800 font-black uppercase text-xs tracking-widest">Select an operator to see offers</p>
        </div>
      )}
      </div>

      {/* Purchase Modal */}
      {purchasingOffer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#006400]/5 -mr-16 -mt-16 rounded-full" />
            
            <div className="relative">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 leading-tight">Secure Payment</h3>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{purchasingOffer.operator} • {purchasingOffer.type}</p>
                </div>
                <button onClick={() => setPurchasingOffer(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ArrowLeft size={24} className="rotate-90 text-gray-400" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex justify-between items-center border-l-4 border-[#006400]">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Total to Pay</p>
                  <p className="text-2xl font-black text-gray-900">{purchasingOffer.price} TK</p>
                  <p className="text-[10px] font-bold text-[#006400] mt-1 line-clamp-1">Bkash/Nagad/Rocket/Upay/Dutch: 01876357998</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500">{purchasingOffer.title}</p>
                  <p className="text-[10px] font-black text-[#006400] uppercase tracking-tighter">Instant Delivery</p>
                </div>
              </div>

              <form onSubmit={handleSubmitPurchase} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Target Number</label>
                  <input 
                    required 
                    className="w-full bg-gray-50 border-0 p-4 rounded-xl font-bold focus:ring-2 ring-[#006400]/20 transition-all" 
                    value={purchaseData.phone} 
                    onChange={e => setPurchaseData({...purchaseData, phone: e.target.value})} 
                    placeholder="01XXX-XXXXXX" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Select Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {paymentMethods.map(m => (
                      <button 
                        key={m.name} 
                        type="button" 
                        onClick={() => setPurchaseData({...purchaseData, method: m.name})}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl font-bold transition-all border-2 ${purchaseData.method === m.name ? 'bg-[#006400]/5 border-[#006400] text-[#006400] shadow-sm' : 'bg-gray-50 border-transparent text-gray-400'}`}
                      >
                        <img src={m.icon as string} alt={m.name} className="h-6 object-contain" />
                        <span className="text-[9px] uppercase">{m.name === 'Dutch' ? 'DBBL' : m.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Payment Proof</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-100 transition-all overflow-hidden relative">
                    {purchaseData.screenshot ? (
                      <img src={purchaseData.screenshot} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto text-gray-300 mb-1" size={20} />
                        <span className="text-[10px] font-black text-gray-400 uppercase">Screenshot</span>
                      </div>
                    )}
                    <input type="file" className="hidden" onChange={handleFile} accept="image/*" />
                  </label>
                </div>

                <button 
                  disabled={submitting} 
                  className="w-full bg-[#006400] text-white font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-[#004d00] shadow-xl shadow-[#006400]/20 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Confirming...' : 'Verify & Submit'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
