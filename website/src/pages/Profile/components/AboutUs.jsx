import React, { useState, useEffect } from "react";
import { getContentDetails } from "../../../utils/contentApi";

function AboutUs() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await getContentDetails();
        if (res && res.success && res.data && res.data.records) {
          const record = res.data.records.find(item => item.page_key === "aboutUs");
          setContent(record?.content || null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="p-6 md:p-8 bg-[var(--card-bg)] rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-sm)] w-full h-[414px] flex flex-col overflow-hidden">
      <div className="mb-6 pb-4 border-b border-[var(--border)] relative shrink-0">
        <h2 className="text-2xl font-black bg-[image:var(--brand-gradient)] bg-clip-text text-transparent inline-block">
          About Us
        </h2>
        <div className="absolute bottom-[-1px] left-0 w-16 h-[3px] bg-[image:var(--brand-gradient)] rounded-full"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
        {loading ? (
          <div className="h-full flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : content ? (
          <div className="text-[14px] text-[var(--text-light)] leading-relaxed prose prose-slate max-w-none prose-headings:text-[var(--primary)] prose-a:text-[var(--primary)]" dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <div className="text-[14px] text-[var(--text-light)] leading-relaxed bg-[var(--bg-soft)] p-5 rounded-2xl border border-[var(--border)]">
            <h4 className="text-lg font-black text-[var(--primary)] mb-2 flex items-center gap-2">
              🎯 Our Mission
            </h4>
            <p>
              At Shipzyy, we bring premium quality essentials to your doorstep in minutes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AboutUs;