import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getContentDetails} from "../../utils/contentApi"; 
import {getFAQs} from "../../utils/helpApi";
function LegalPage() {
  const { type } = useParams(); 
  const [content, setContent] = useState("");
  const [faqList, setFaqList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        if (type.toLowerCase() === 'faq') {
          const res = await getFAQs();
          if (res?.success) {
            const faqs = res.data?.records || res.data || [];
            if (Array.isArray(faqs)) {
              setFaqList(faqs);
            } else {
              setContent(faqs.content || "FAQs not available at the moment.");
            }
          }
        } else {
          const res = await getContentDetails();
          if (res?.success) {
            const record = res.data.records.find(item => item.page_key === type);
            setContent(record?.content || "Content not found.");
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
    window.scrollTo(0, 0); 
  }, [type]);

  const getPageTitle = () => {
    if (type.toLowerCase() === 'faq') return 'Frequently Asked Questions';
    return type.replace(/([A-Z])/g, ' $1');
  };

  return (
    <div className="min-h-[70vh] py-10 md:py-16 px-5 flex items-start justify-center">
      <div className="max-w-4xl w-full bg-white p-6 md:p-14 rounded-3xl shadow-sm border border-slate-200">
        
        <div className="mb-10 border-b border-slate-100 pb-6 relative">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 capitalize tracking-tight">
            {getPageTitle()}
          </h1>
          <div className="absolute bottom-0 left-0 w-20 h-1.5 bg-blue-600 rounded-full"></div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
            <div className="h-4 bg-slate-100 rounded-full w-full"></div>
            <div className="h-4 bg-slate-100 rounded-full w-5/6"></div>
            <div className="h-4 bg-slate-100 rounded-full w-4/5"></div>
          </div>
        ) : (
          <div>
            {type.toLowerCase() === 'faq' && faqList.length > 0 ? (
              <div className="space-y-4">
                {faqList.map((faq, index) => (
                  <div key={faq.id || index} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <h3 className="text-[16px] font-black text-slate-900 mb-3 leading-relaxed">
                      {faq.question}
                    </h3>
                    <p className="text-[14px] font-bold text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div 
                className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-bold text-[14px] sm:text-[15px] 
                prose-headings:text-slate-900 prose-headings:font-black prose-p:mb-6 prose-a:text-blue-600"
                dangerouslySetInnerHTML={{ __html: content }} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LegalPage;