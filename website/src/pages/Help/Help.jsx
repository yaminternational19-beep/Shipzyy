import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFAQs, getHelpSupportContacts, createSupportTicket } from "../../utils/helpApi"; 
import { toast } from "react-toastify";

const fakeFaqs = [
  { question: "How do I track my order?", answer: "Go to 'My Orders' section in your profile to see real-time updates." },
  { question: "What is your refund policy?", answer: "Refunds are processed within 5-7 business days." }
];

const fakeContacts = [
  { id: 1, name: "General Support", working_hours: "24/7 Available" },
  { id: 2, name: "Returns Department", working_hours: "9 AM - 6 PM" }
];

function Help() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [faqData, setFaqData] = useState(fakeFaqs);
  const [supportContacts, setSupportContacts] = useState(fakeContacts);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("refreshToken"));

  const [ticketForm, setTicketForm] = useState({ subject: "", message: "", support_contact_id: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRealData = async () => {
    try {
      setIsLoading(true);
      const [faqRes, contactRes] = await Promise.all([getFAQs(), getHelpSupportContacts()]);
      
      if (faqRes?.success) setFaqData(faqRes.data.records);
      if (contactRes?.success) {
        setSupportContacts(contactRes.data.records);
        if (contactRes.data.records.length > 0) {
          setTicketForm(prev => ({ ...prev, support_contact_id: contactRes.data.records[0].id }));
        }
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("refreshToken");
    if (token) {
      setIsLoggedIn(true);
      fetchRealData();
    }
  }, []); 

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.message) return toast.error("Please fill all fields");

    try {
      setIsSubmitting(true);
      const res = await createSupportTicket(ticketForm);
      if (res?.success) {
        toast.success("Ticket Created!");
        setTicketForm({ ...ticketForm, subject: "", message: "" });
      }
    } catch (err) {
      toast.error("Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full -mt-[50px] font-sans bg-slate-50 min-h-screen">
      <div className="relative h-[35vh] flex items-center justify-center bg-[#0f172a]">
        <h1 className="text-4xl md:text-[50px] font-black text-white">Help <span className="text-blue-500">Center</span></h1>
      </div>

      <div className="relative z-20 max-w-[1200px] mx-auto px-5 -mt-16 pb-20 flex flex-col gap-8">
        
        {/* FAQs */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="border border-slate-100 rounded-2xl">
                <div className="p-5 flex justify-between cursor-pointer" onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
                  <span className="font-bold text-slate-700">{faq.question}</span>
                  <span className="text-blue-500">{activeFaq === index ? "−" : "+"}</span>
                </div>
                {activeFaq === index && <div className="px-5 pb-5 text-slate-500 text-sm">{faq.answer}</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ticket Form */}
          <div className="relative bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
            {!isLoggedIn && (
              <div className="absolute inset-0 z-30 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                <h3 className="text-xl font-black mb-2">Login Required</h3>
                <p className="text-slate-500 text-sm mb-6">Access support tickets after login.</p>
                <Link to="/login" className="bg-blue-600 text-white px-8 py-3 rounded-full font-black text-xs">LOGIN NOW</Link>
              </div>
            )}
            <h2 className="text-xl font-black mb-6">Submit a Ticket</h2>
            <form onSubmit={handleTicketSubmit} className="flex flex-col gap-4">
              <select name="support_contact_id" value={ticketForm.support_contact_id} onChange={(e) => setTicketForm({...ticketForm, support_contact_id: e.target.value})} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-none">
                {supportContacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input value={ticketForm.subject} onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})} placeholder="Subject" className="p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-none" />
              <textarea value={ticketForm.message} onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})} rows="4" placeholder="Message..." className="p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-none resize-none" />
              <button type="submit" disabled={isSubmitting || !isLoggedIn} className="py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg">
                {isSubmitting ? "Sending..." : "Submit Ticket"}
              </button>
            </form>
          </div>

          {/* Contact Details */}
          <div className="bg-[#1e293b] p-8 rounded-[32px] text-white">
            <h2 className="text-xl font-black mb-8">Direct Contact</h2>
            <div className="space-y-6">
              {supportContacts.map((contact) => (
                <div key={contact.id} className="pb-6 border-b border-slate-700 last:border-0">
                  <p className="font-black text-blue-400 text-lg uppercase">{contact.name}</p>
                  {isLoggedIn ? (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm opacity-90">{contact.email}</p>
                      <p className="text-sm opacity-90">{contact.country_code} {contact.phone_number}</p>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[10px] font-black uppercase mt-2">Login to view details</p>
                  )}
                  <p className="text-xs text-slate-400 mt-2 italic">{contact.working_hours}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Help;