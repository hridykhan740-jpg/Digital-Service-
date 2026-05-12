import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  setDoc,
  deleteDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db, OperationType, handleFirestoreError } from "../lib/firebase";
import { Submission, SimOffer, UserProfile, PlatformService } from "../types";
import { format } from "date-fns";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  Plus, 
  Smartphone, 
  FileText, 
  Eye,
  Filter,
  Users,
  TrendingUp,
  Settings,
  LayoutGrid
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const AdminPanel: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [offers, setOffers] = useState<SimOffer[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [services, setServices] = useState<PlatformService[]>([]);
  const [activeTab, setActiveTab] = useState<'submissions' | 'offers' | 'users' | 'services'>('submissions');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  
  // New Offer Form State
  const [newOffer, setNewOffer] = useState<Partial<SimOffer>>({
    operator: 'GP',
    type: 'Bundle',
    title: '',
    price: '',
    validity: '30 Days',
    description: '',
    active: true
  });

  // New Service Form State
  const [newService, setNewService] = useState<Partial<PlatformService>>({
    id: '',
    title: '',
    description: '',
    active: true,
    priceInfo: ''
  });

  useEffect(() => {
    const subQuery = query(collection(db, "submissions"), orderBy("createdAt", "desc"));
    const unsubSub = onSnapshot(subQuery, (snapshot) => {
      setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "submissions"));

    const offerQuery = query(collection(db, "sim_offers"), orderBy("operator"));
    const unsubOffer = onSnapshot(offerQuery, (snapshot) => {
      setOffers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SimOffer)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "sim_offers"));

    const userQuery = query(collection(db, "users"), orderBy("name"));
    const unsubUsers = onSnapshot(userQuery, (snapshot) => {
      setUsers(snapshot.docs.map(doc => doc.data() as UserProfile));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "users"));

    const serviceQuery = query(collection(db, "services"), orderBy("title"));
    const unsubServices = onSnapshot(serviceQuery, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ ...doc.data() } as PlatformService)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "services"));

    return () => {
      unsubSub();
      unsubOffer();
      unsubUsers();
      unsubServices();
    };
  }, []);

  const handleStatusUpdate = async (id: string, status: 'success' | 'rejected') => {
    if (!confirm(`Are you sure you want to mark this as ${status}?`)) return;
    try {
      await updateDoc(doc(db, "submissions", id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `submissions/${id}`);
    }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const offerData = {
        operator: newOffer.operator || 'GP',
        type: newOffer.type || 'Bundle',
        title: newOffer.title || '',
        price: newOffer.price || '',
        validity: newOffer.validity || '30 Days',
        active: true
      };
      await addDoc(collection(db, "sim_offers"), offerData);
      setNewOffer({ operator: 'GP', type: 'Bundle', title: '', price: '', validity: '30 Days', description: '', active: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "sim_offers");
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.id) return alert("Service ID is required");
    try {
      await setDoc(doc(db, "services", newService.id), {
        id: newService.id,
        title: newService.title || '',
        description: newService.description || '',
        active: newService.active ?? true,
        priceInfo: newService.priceInfo || ''
      });
      setNewService({ id: '', title: '', description: '', active: true, priceInfo: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "services");
    }
  };

  const toggleServiceStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? 'disable' : 'enable';
    if (!confirm(`Are you sure you want to ${action} this service?`)) return;
    try {
      await updateDoc(doc(db, "services", id), { active: !currentStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `services/${id}`);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, "sim_offers", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `sim_offers/${id}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 bg-[#f0f2f5] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl font-black text-[#006400] flex items-center gap-2">
          <Settings size={28} /> CONTROL PANEL
        </h1>
        <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'submissions', label: 'Orders', icon: <TrendingUp size={16} /> },
            { id: 'offers', label: 'Offers', icon: <Smartphone size={16} /> },
            { id: 'users', label: 'Users', icon: <Users size={16} /> },
            { id: 'services', label: 'Services', icon: <LayoutGrid size={16} /> }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-[#006400] text-white shadow-md scale-105' : 'text-gray-500 hover:text-[#006400] hover:bg-[#006400]/5'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'submissions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {submissions.length === 0 && <p className="text-gray-400 italic">No submissions yet.</p>}
             {submissions.map((sub) => (
                <div key={sub.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4 relative overflow-hidden group hover:shadow-xl transition-all">
                  <div className={`absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rotate-45 ${sub.status === 'success' ? 'bg-green-500' : sub.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  
                  <div className="flex justify-between items-start">
                    <div className="z-10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#006400] bg-[#006400]/10 px-2 py-0.5 rounded">{sub.serviceType.replace('_', ' ')}</span>
                      <h3 className="font-black text-gray-900 mt-2">{sub.userEmail}</h3>
                    </div>
                  </div>
                  
                  <div className="text-sm bg-gray-50 p-4 rounded-xl space-y-2">
                    {Object.entries(sub.details).map(([key, val]) => (
                      <div key={key} className="flex justify-between border-b border-gray-200/50 pb-1 last:border-0 last:pb-0">
                        <span className="text-gray-400 capitalize font-bold text-[10px] uppercase">{key}:</span>
                        <span className="font-bold text-gray-700 truncate max-w-[150px]">{String(val)}</span>
                      </div>
                    ))}
                  </div>

                  {sub.paymentScreenshot && (
                    <button 
                      onClick={() => setSelectedScreenshot(sub.paymentScreenshot!)}
                      className="flex items-center justify-center gap-2 bg-[#006400] text-white text-xs font-bold py-3 rounded-xl hover:bg-[#004d00]"
                    >
                      <Eye size={14} /> View Proof
                    </button>
                  )}

                  <div className="mt-auto pt-2 grid grid-cols-2 gap-2">
                     <button 
                        disabled={sub.status === 'success'}
                        onClick={() => handleStatusUpdate(sub.id!, 'success')}
                        className={`font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-all ${sub.status === 'success' ? 'bg-gray-100 text-gray-400' : 'bg-green-600 text-white hover:bg-green-700'}`}
                     >
                       {sub.status === 'success' ? 'Success' : 'Approve'}
                     </button>
                     <button 
                        disabled={sub.status === 'rejected'}
                        onClick={() => handleStatusUpdate(sub.id!, 'rejected')}
                        className={`font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-all ${sub.status === 'rejected' ? 'bg-gray-100 text-gray-400' : 'bg-red-600 text-white hover:bg-red-700'}`}
                     >
                       {sub.status === 'rejected' ? 'Rejected' : 'Reject'}
                     </button>
                  </div>
                </div>
             ))}
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-[#006400] mb-6 flex items-center gap-2">
                <Plus size={24} /> New Sim Package
              </h2>
              <form onSubmit={handleAddOffer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Operator</label>
                    <select 
                      value={newOffer.operator}
                      onChange={e => setNewOffer({...newOffer, operator: e.target.value as any})}
                      className="w-full bg-gray-50 border-0 p-4 rounded-xl font-bold"
                    >
                      <option>GP</option>
                      <option>Robi</option>
                      <option>Banglalink</option>
                      <option>Airtel</option>
                      <option>Robi/Airtel Family</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Type</label>
                    <select 
                      value={newOffer.type}
                      onChange={e => setNewOffer({...newOffer, type: e.target.value as any})}
                      className="w-full bg-gray-50 border-0 p-4 rounded-xl font-bold"
                    >
                      <option>Bundle</option>
                      <option>Minute</option>
                      <option>Internet</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Title</label>
                    <input required value={newOffer.title} onChange={e => setNewOffer({...newOffer, title: e.target.value})} className="w-full bg-gray-50 border-0 p-4 rounded-xl" placeholder="5GB + 200 Min" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Price (TK)</label>
                    <input required value={newOffer.price} onChange={e => setNewOffer({...newOffer, price: e.target.value})} type="number" className="w-full bg-gray-50 border-0 p-4 rounded-xl" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Validity</label>
                    <input value={newOffer.validity} onChange={e => setNewOffer({...newOffer, validity: e.target.value})} className="w-full bg-gray-50 border-0 p-4 rounded-xl" />
                 </div>
                 <div className="lg:col-span-2 flex items-end">
                    <button type="submit" className="w-full bg-[#006400] text-white font-black py-4 rounded-xl uppercase tracking-widest hover:bg-[#004d00] transition-all shadow-lg">
                      Add Package
                    </button>
                 </div>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {offers.map(offer => (
                <div key={offer.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group hover:shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-4">
                     <div className="flex flex-col gap-1">
                       <span className="bg-[#006400] text-white px-3 py-1 rounded-full text-[8px] font-black w-fit uppercase">{offer.operator}</span>
                       <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-[8px] font-black w-fit uppercase">{offer.type}</span>
                     </div>
                     <button onClick={() => handleDeleteOffer(offer.id!)} className="text-gray-300 hover:text-red-600"><Trash2 size={20} /></button>
                  </div>
                  <h3 className="font-black text-xl leading-tight text-gray-900 mb-1">{offer.title}</h3>
                  <p className="text-2xl font-black text-red-600">{offer.price} TK</p>
                  <p className="text-xs font-bold text-gray-400 mt-2 uppercase">{offer.validity}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-[#006400] text-white">
                   <tr>
                      <th className="px-6 py-4 font-black uppercase text-xs">Name</th>
                      <th className="px-6 py-4 font-black uppercase text-xs">Mobile</th>
                      <th className="px-6 py-4 font-black uppercase text-xs">Balance</th>
                      <th className="px-6 py-4 font-black uppercase text-xs text-right">Role</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {users.map(u => (
                      <tr key={u.uid} className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4 font-bold text-gray-900">{u.name}</td>
                         <td className="px-6 py-4 font-bold text-gray-500">{u.mobile}</td>
                         <td className="px-6 py-4">
                            <span className="bg-green-100 text-green-700 font-black px-3 py-1 rounded-full text-xs">
                               {u.balance} TK
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${u.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                               {u.role}
                            </span>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
               <h2 className="text-xl font-black text-[#006400] mb-6 flex items-center gap-2">
                 <Plus size={24} /> Configure Service
               </h2>
               <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                     <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Service ID (e.g. facebook_verification)</label>
                     <select 
                        value={newService.id}
                        onChange={e => setNewService({...newService, id: e.target.value})}
                        className="w-full bg-gray-50 border-0 p-4 rounded-xl font-bold"
                     >
                        <option value="">Select ID</option>
                        <option value="facebook_verification">Facebook Verification</option>
                        <option value="website_dev">Website Development</option>
                        <option value="app_dev">App Development</option>
                        <option value="sim_offer">SIM Offers</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Title</label>
                     <input required value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})} className="w-full bg-gray-50 border-0 p-4 rounded-xl" placeholder="Display Name" />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Price Info</label>
                     <input value={newService.priceInfo} onChange={e => setNewService({...newService, priceInfo: e.target.value})} className="w-full bg-gray-50 border-0 p-4 rounded-xl" placeholder="e.g. 500 TK" />
                  </div>
                  <div className="md:col-span-3">
                     <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Description</label>
                     <textarea value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} className="w-full bg-gray-50 border-0 p-4 rounded-xl h-24" placeholder="Service details..." />
                  </div>
                  <div className="md:col-span-3 flex items-end">
                     <button type="submit" className="w-full bg-[#006400] text-white font-black py-4 rounded-xl uppercase tracking-widest hover:bg-[#004d00] transition-all shadow-lg">
                       Update/Add Service
                     </button>
                  </div>
               </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {services.map(service => (
                 <div key={service.id} className={`p-6 rounded-3xl shadow-sm border transition-all ${service.active ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-200 grayscale'}`}>
                    <div className="flex justify-between items-start mb-4">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${service.active ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                          {service.active ? 'Active' : 'Disabled'}
                       </span>
                    <div className="flex gap-2">
                       <button onClick={() => setNewService(service)} className="p-2 rounded-xl text-xs font-black uppercase transition-all bg-amber-50 text-amber-600 hover:bg-amber-100">
                          Edit
                       </button>
                       <button onClick={() => toggleServiceStatus(service.id, service.active)} className={`p-2 rounded-xl text-xs font-black uppercase transition-all ${service.active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                          {service.active ? 'Disable' : 'Enable'}
                       </button>
                    </div>
                    </div>
                    <h3 className="font-black text-xl text-gray-900 mb-1">{service.title}</h3>
                    <p className="text-gray-400 text-xs font-bold uppercase mb-3">{service.id}</p>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">{service.description}</p>
                    {service.priceInfo && (
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <span className="text-[10px] font-black text-gray-400 uppercase">Pricing:</span>
                        <p className="font-black text-gray-900">{service.priceInfo}</p>
                      </div>
                    )}
                 </div>
               ))}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-2 rounded-3xl relative max-w-2xl w-full">
            <button 
              onClick={() => setSelectedScreenshot(null)}
              className="absolute -top-12 right-0 text-white flex items-center gap-2 font-bold"
            >
              Close <XCircle size={28} />
            </button>
            <img src={selectedScreenshot} alt="Payment" className="max-w-full max-h-[80vh] mx-auto object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
