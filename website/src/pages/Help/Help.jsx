import React, { useState } from "react";
import "./Help.css";

function Help() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  const faqData = [
    {
      question: "How do I reset my password?",
      answer: "Go to the login page and click 'Forgot Password'. Enter your email address, and we will send you a link to securely reset your password."
    },
    {
      question: "Where can I find my billing history?",
      answer: "Log into your account, navigate to 'Settings', and click on the 'Billing' tab. You can download all past invoices from there."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time from your account settings. You will retain access until the end of your current billing cycle."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can reach us via the 'Contact Support' card above, or email us directly at support@shippzy.com. We typically respond within 24 hours."
    }
  ];

  return (
    <div className="help-page-wrapper">
      
      {/* 🌟 HERO SECTION */}
      <div className="help-hero">
        <div className="help-overlay" />

        <div className="container help-content">
          <h1>
            How can we <span className="text-gradient">help you?</span>
          </h1>

          <div className="help-search-container">
            <input 
              type="text" 
              className="help-search-input" 
              placeholder="Search for articles, questions, or topics..." 
            />
            <button className="help-search-btn">Search</button>
          </div>
        </div>
      </div>

      {/* 🌟 CARDS SECTION */}
      <div className="container help-cards-container">
        <div className="help-cards">
          {/* Card 1 */}
          <div className="help-box">
            <div className="icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <h3>FAQs</h3>
            <p>Find quick answers to our most commonly asked questions.</p>
          </div>

          {/* Card 2 */}
          <div className="help-box">
            <div className="icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h3>Contact Support</h3>
            <p>Reach our dedicated team for personalized assistance.</p>
          </div>

          {/* Card 3 */}
          <div className="help-box">
            <div className="icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <h3>Community</h3>
            <p>Join the discussion and learn from other users.</p>
          </div>
        </div>
      </div>

      {/* 🌟 FAQ ACCORDION SECTION */}
      <div className="faq-section container">
        <div className="faq-header">
          <h2>Frequently Asked Questions</h2>
          <p>Browse through our most popular help topics</p>
        </div>

        <div className="faq-list">
          {faqData.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${activeFaq === index ? "active" : ""}`}
              onClick={() => toggleFaq(index)}
            >
              <div className="faq-question">
                <h3>{faq.question}</h3>
                <span className="faq-icon">{activeFaq === index ? "−" : "+"}</span>
              </div>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Help;