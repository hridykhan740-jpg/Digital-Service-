import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, addDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db, auth, OperationType, handleFirestoreError } from "../lib/firebase";
import { SimOffer, PlatformService } from "../types";
import { Smartphone, Globe, Facebook, ArrowLeft, Upload, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

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
          <p className="text-[10px] font-bold text-[#006400]">Bkash/Nagad: 01876357998</p>
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

export const SimOffers = ({ onBack, onSuccess }: { onBack: () => void, onSuccess: () => void }) => {
  const [offers, setOffers] = useState<SimOffer[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
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
      setPurchasingOffer(null);
      onSuccess();
    } catch (err) { 
      handleFirestoreError(err, OperationType.CREATE, "submissions"); 
    } finally {
      setSubmitting(false);
    }
  };

  const operators = [
    { name: 'GP', color: 'bg-[#1BB3E9]', icon: (size: number) => <Globe size={size} /> },
    { name: 'Robi', color: 'bg-[#E30613]', icon: (size: number) => <Zap size={size} /> },
    { name: 'Airtel', color: 'bg-[#FF0000]', icon: (size: number) => <Smartphone size={size} /> },
    { name: 'Banglalink', color: 'bg-[#F47920]', icon: (size: number) => <CheckCircle size={size} /> },
    { name: 'Robi/Airtel Family', color: 'bg-[#9333ea]', icon: (size: number) => <Globe size={size} /> }
  ];

  const tabs: { id: typeof activeTab, label: string }[] = [
    { id: 'Bundle', label: 'Bundle Offer' },
    { id: 'Minute', label: 'Minute Offer' },
    { id: 'Internet', label: 'Internet Offer' }
  ];

  const filteredOffers = selectedOperator 
    ? offers.filter(o => o.operator === selectedOperator && o.type === activeTab)
    : [];

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#006400]">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Operator Selection */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
        {operators.map(op => (
          <button 
            key={op.name} 
            onClick={() => {
              setSelectedOperator(op.name);
              setActiveTab('Bundle');
            }} 
            className={`flex flex-col items-center gap-2 group transition-all`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${selectedOperator === op.name ? `${op.color} shadow-lg scale-110` : 'bg-gray-50'}`}>
              <div className={`${selectedOperator === op.name ? 'text-white' : 'text-gray-300'}`}>
                {op.icon(32)}
              </div>
            </div>
            <span className={`text-[10px] font-black uppercase text-center leading-tight ${selectedOperator === op.name ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>
              {op.name}
            </span>
          </button>
        ))}
      </div>

      {selectedOperator ? (
        <div className="space-y-4 pt-4 border-t border-gray-100">
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
                  <p className="text-[10px] font-bold text-[#006400] mt-1">Bkash/Nagad: 01876357998</p>
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
                  <div className="grid grid-cols-2 gap-3">
                    {['Bkash', 'Nagad'].map(m => (
                      <button 
                        key={m} 
                        type="button" 
                        onClick={() => setPurchaseData({...purchaseData, method: m})}
                        className={`p-4 rounded-xl font-black transition-all ${purchaseData.method === m ? 'bg-pink-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                      >
                        {m === 'Bkash' ? 'bKash' : 'Nagad'}
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
