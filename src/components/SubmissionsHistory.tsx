import React, { useState, useEffect } from "react";
import { db, auth, OperationType, handleFirestoreError } from "../lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy 
} from "firebase/firestore";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  History, 
  ChevronRight,
  ExternalLink,
  Smartphone,
  Globe,
  Facebook,
  Wallet,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Submission, ServiceType } from "../types";

export const SubmissionsHistory = ({ onBack }: { onBack: () => void }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "submissions"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission)));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "submissions");
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const getServiceIcon = (type: ServiceType) => {
    switch (type) {
      case 'facebook_verification': return <Facebook className="text-blue-600" />;
      case 'website_dev': return <Globe className="text-purple-600" />;
      case 'app_dev': return <Smartphone className="text-emerald-600" />;
      case 'sim_offer': return <Zap className="text-amber-500" />;
      case 'top_up': return <Wallet className="text-[#006400]" />;
      default: return <History className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 size={14} />;
      case 'rejected': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  if (selectedSubmission) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedSubmission(null)} className="flex items-center gap-2 text-sm font-bold text-[#006400]">
          <ArrowLeft size={16} /> Back to History
        </button>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                {getServiceIcon(selectedSubmission.serviceType)}
              </div>
              <div>
                <h3 className="font-black uppercase tracking-tight text-gray-900">
                  {selectedSubmission.serviceType.replace('_', ' ')}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {selectedSubmission.createdAt?.toDate().toLocaleString()}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(selectedSubmission.status)}`}>
              {getStatusIcon(selectedSubmission.status)}
              {selectedSubmission.status}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Submission Details</h4>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(selectedSubmission.details).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[9px] font-black uppercase text-gray-400 mb-1">{key}</p>
                  <p className="font-bold text-gray-800 break-words">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>

          {selectedSubmission.paymentScreenshot && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Payment Proof</h4>
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
                <img 
                  src={selectedSubmission.paymentScreenshot} 
                  alt="Payment Proof" 
                  className="w-full object-cover max-h-64"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#006400]">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2 text-[#006400]">
          <History size={20} />
          <h2 className="font-black uppercase tracking-widest text-sm">Service History</h2>
        </div>
        <div className="w-8" /> {/* Placeholder for balance */}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-[#006400] rounded-full border-t-transparent animate-spin" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center p-16 bg-white rounded-[32px] border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="text-gray-200" size={32} />
            </div>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No service history found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {submissions.map(sub => (
              <motion.div 
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedSubmission(sub)}
                className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group cursor-pointer hover:shadow-md hover:border-[#006400]/20 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-[#006400]/5 transition-colors">
                    {getServiceIcon(sub.serviceType)}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 uppercase tracking-tight text-sm">
                      {sub.serviceType.replace('_', ' ')}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${getStatusColor(sub.status)}`}>
                        {getStatusIcon(sub.status)}
                        {sub.status}
                      </div>
                      <span className="text-[9px] font-bold text-gray-300">
                        {sub.createdAt?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-gray-300 group-hover:text-[#006400] transition-colors">
                  <ChevronRight size={20} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
