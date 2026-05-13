import React, { useState, useEffect } from "react";
import { db, auth, OperationType, handleFirestoreError } from "../lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import { Plus, Trash2, Edit3, Save, X, ArrowLeft, BookOpen, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: any;
  updatedAt?: any;
}

export const TallyNote = ({ onBack }: { onBack: () => void }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "notes"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note)));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "notes");
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) return;
    
    try {
      await addDoc(collection(db, "notes"), {
        userId: auth.currentUser?.uid,
        title: newNote.title,
        content: newNote.content,
        createdAt: serverTimestamp()
      });

      // Log activity
      await addDoc(collection(db, "notifications"), {
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        type: 'tally',
        title: 'New Tally Note',
        message: `User created a new tally note: ${newNote.title}`,
        read: false,
        createdAt: serverTimestamp()
      });

      setNewNote({ title: "", content: "" });
      setIsAdding(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "notes");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteDoc(doc(db, "notes", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `notes/${id}`);
    }
  };

  const handleUpdate = async (id: string, title: string, content: string) => {
    try {
      await updateDoc(doc(db, "notes", id), {
        title,
        content,
        updatedAt: serverTimestamp()
      });
      setEditingId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notes/${id}`);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#006400]">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2 text-[#006400]">
          <BookOpen size={20} />
          <h2 className="font-black uppercase tracking-widest text-sm">আমার হিসাব (Tally)</h2>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#006400] text-white p-2 rounded-full shadow-lg active:scale-90 transition-all"
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {isAdding && (
        <motion.form 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleAddNote}
          className="bg-white p-6 rounded-3xl shadow-xl border-t-4 border-[#006400] space-y-4"
        >
          <input 
            required
            className="w-full bg-gray-50 border-0 p-4 rounded-xl font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-[#006400]"
            placeholder="হিসাবের নাম (Title)"
            value={newNote.title}
            onChange={e => setNewNote({...newNote, title: e.target.value})}
          />
          <textarea 
            required
            rows={4}
            className="w-full bg-gray-50 border-0 p-4 rounded-xl font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-[#006400] resize-none"
            placeholder="হিসাবের বিস্তারিত (Details)..."
            value={newNote.content}
            onChange={e => setNewNote({...newNote, content: e.target.value})}
          />
          <button className="w-full bg-[#006400] text-white font-black py-4 rounded-xl uppercase tracking-widest flex items-center justify-center gap-2">
            <Save size={18} /> হিসাব যোগ করুন
          </button>
        </motion.form>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input 
          type="text"
          placeholder="হিসাব খুঁজুন (Search notes)..."
          className="w-full bg-white border border-gray-100 p-4 pl-12 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#006400] font-bold outline-none"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-[#006400] rounded-full border-t-transparent animate-spin" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-gray-300">
            <BookOpen className="mx-auto text-gray-200 mb-4" size={48} />
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">আপনার কোনো হিসাব নেই</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredNotes.map(note => (
              <motion.div 
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group relative overflow-hidden"
              >
                {editingId === note.id ? (
                  <div className="space-y-4">
                    <input 
                      className="w-full bg-gray-50 border-0 p-2 rounded-lg font-black text-[#006400]"
                      defaultValue={note.title}
                      autoFocus
                      id={`edit-title-${note.id}`}
                    />
                    <textarea 
                      className="w-full bg-gray-50 border-0 p-2 rounded-lg font-bold text-gray-600 resize-none"
                      rows={5}
                      defaultValue={note.content}
                      id={`edit-content-${note.id}`}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const t = (document.getElementById(`edit-title-${note.id}`) as HTMLInputElement).value;
                          const c = (document.getElementById(`edit-content-${note.id}`) as HTMLTextAreaElement).value;
                          handleUpdate(note.id, t, c);
                        }}
                        className="flex-1 bg-[#006400] text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        <Save size={16} /> Save
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="bg-gray-100 text-gray-400 px-4 py-2 rounded-xl font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-black text-[#006400] text-lg uppercase tracking-tight">{note.title}</h4>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingId(note.id)} className="p-2 text-gray-400 hover:text-[#006400] hover:bg-[#006400]/10 rounded-full transition-all">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(note.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 font-bold whitespace-pre-wrap text-sm leading-relaxed">{note.content}</p>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                       <span className="text-[9px] font-black uppercase text-gray-300">
                         {note.createdAt?.toDate().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                       </span>
                       {note.updatedAt && (
                         <span className="text-[8px] font-bold text-green-400 uppercase italic">Updated</span>
                       )}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
