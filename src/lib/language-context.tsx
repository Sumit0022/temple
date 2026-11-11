"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  "nav.home": { en: "Home", hi: "मुख्य पृष्ठ" },
  "nav.about": { en: "About Temple", hi: "मंदिर परिचय" },
  "nav.darshan": { en: "Darshan Timings", hi: "दर्शन एवं आरती" },
  "nav.donations": { en: "Online Donations", hi: "ऑनलाइन दान" },
  "nav.prasad": { en: "Prasad & Store", hi: "प्रसाद एवं भंडार" },
  "nav.sevas": { en: "Puja & Sevas", hi: "पूजा एवं सेवा" },
  "nav.events": { en: "Festivals & Events", hi: "उत्सव एवं पर्व" },
  "nav.gallery": { en: "Gallery", hi: "चित्रशाला" },
  "nav.contact": { en: "Contact Us", hi: "संपर्क" },
  "nav.adminLogin": { en: "Staff Login", hi: "प्रशासन लॉगिन" },
  "nav.devoteeLogin": { en: "Devotee Portal", hi: "भक्त पोर्टल" },
  "nav.donateNow": { en: "Donate Now", hi: "दान करें" },
  "nav.cart": { en: "Cart", hi: "टोकरी" },

  // Hero Section
  "hero.subtitle": { en: "Divine Abode of Dharma, Peace & Spiritual Radiance", hi: "धर्म, शांति एवं दिव्य आध्यात्मिक ऊर्जा का पवित्र धाम" },
  "hero.title": { en: "Shri Ram Janmabhoomi & Mahadev Mandir", hi: "श्री राम जन्मभूमि एवं महादेव मंदिर" },
  "hero.desc": {
    en: "Experience sacred darshan, consecrated prasad, ancient Vedic rituals, and contribute to the eternal tradition of Annadan and Gau Seva.",
    hi: "पावन दर्शन, अभिमंत्रित महाप्रसाद, प्राचीन वैदिक अनुष्ठान का अनुभव करें तथा नित्य अन्नदान एवं गौ सेवा की अमर परंपरा में सहभागी बनें।"
  },
  "hero.darshanBtn": { en: "View Darshan Timings", hi: "दर्शन समय देखें" },
  "hero.bookSevaBtn": { en: "Book a Seva", hi: "पूजा सेवा बुक करें" },

  // Darshan & Aarti
  "darshan.heading": { en: "Today's Sacred Aarti & Darshan Schedule", hi: "आज के पावन आरती एवं दर्शन समय" },
  "darshan.sub": { en: "General Darshan opens daily from 05:00 AM to 12:30 PM & 04:00 PM to 09:30 PM", hi: "दैनिक सामान्य दर्शन प्रातः 05:00 से दोपहर 12:30 एवं सायं 04:00 से रात्रि 09:30 बजे तक" },
  "darshan.mangala": { en: "Mangala Aarti", hi: "मंगला आरती" },
  "darshan.shringar": { en: "Shringar Aarti", hi: "शृंगार आरती" },
  "darshan.bhog": { en: "Bhog Aarti", hi: "भोग आरती" },
  "darshan.sandhya": { en: "Sandhya Deepa Aarti", hi: "संध्या आरती" },
  "darshan.shayan": { en: "Shayan Aarti", hi: "शयन आरती" },

  // Donations
  "donate.heading": { en: "Sacred Temple Contributions & Seva Funds", hi: "पवित्र मंदिर दान एवं सेवा कोष" },
  "donate.sub": { en: "All donations directly support daily Annadan feeding, temple restoration, and cow protection.", hi: "समस्त दान राशि नित्य अन्नदान, मंदिर जीर्णोद्धार एवं गौ संवर्धन में उपयोग की जाती है।" },
  "donate.taxNotice": { en: "Donations are eligible for 50% Tax Exemption under Sec 80G of the IT Act (if opted).", hi: "दान राशि आयकर अधिनियम की धारा 80G के अंतर्गत कर कटौती हेतु पात्र है (वैकल्पिक)।" },
  "donate.customAmount": { en: "Enter Custom Amount (INR)", hi: "इच्छानुसार राशि दर्ज करें (₹)" },
  "donate.donorName": { en: "Devotee / Donor Full Name", hi: "भक्त / दानदाता का पूरा नाम" },
  "donate.donorPhone": { en: "Mobile Phone Number", hi: "मोबाइल नंबर" },
  "donate.donorEmail": { en: "Email Address (Optional)", hi: "ईमेल पता (वैकल्पिक)" },
  "donate.gotra": { en: "Gotra (गोत्र - Optional)", hi: "गोत्र (वैकल्पिक)" },
  "donate.pan": { en: "PAN Card Number (Required for 80G Tax Exemption Receipt)", hi: "पैन कार्ड नंबर (80G कर छूट रसीद हेतु आवश्यक)" },
  "donate.anonymous": { en: "Make this contribution anonymously (Gupt Daan)", hi: "गुप्त दान रखें (नाम प्रदर्शित न करें)" },
  "donate.payBtn": { en: "Proceed to Divine Contribution", hi: "दान राशि समर्पित करें" },

  // Prasad Store
  "store.heading": { en: "Consecrated Temple Prasad & Devotional Items", hi: "पवित्र मंदिर महाप्रसाद एवं पूजा सामग्री" },
  "store.sub": { en: "Prepared fresh in the divine temple kitchen with pure cow ghee and traditional devotion.", hi: "मंदिर पाकशाला में शुद्ध गोघृत एवं पारंपरिक निष्ठा से निर्मित ताज़ा प्रसाद।" },
  "store.addToCart": { en: "Add to Cart", hi: "टोकरी में जोड़ें" },
  "store.inStock": { en: "In Stock", hi: "उपलब्ध है" },
  "store.outOfStock": { en: "Sold Out", hi: "समाप्त" },
  "store.price": { en: "Price", hi: "मूल्य" },
  "store.pickup": { en: "Temple Counter Pickup", hi: "मंदिर काउंटर से लें" },
  "store.delivery": { en: "Safe Home Delivery (All India)", hi: "सुरक्षित होम डिलीवरी (अखिल भारतीय)" },

  // Sevas
  "seva.heading": { en: "Book Sacred Pujas, Archana & Abhishek", hi: "पावन पूजा, अर्चना एवं अभिषेक बुकिंग" },
  "seva.sub": { en: "Experienced Vedic priests perform rituals with your family's personal Sankalpa.", hi: "विद्वान वैदिक आचार्यों द्वारा आपके पारिवारिक संकल्प सहित अनुष्ठान संपन्न।" },
  "seva.dakshina": { en: "Dakshina", hi: "दक्षिणा" },
  "seva.duration": { en: "Duration", hi: "अवधि" },
  "seva.bookNow": { en: "Book Seva Slot", hi: "तिथि व समय चुनें" },

  // Common & Footer
  "common.viewAll": { en: "View All", hi: "सभी देखें" },
  "common.downloadReceipt": { en: "Download PDF Receipt", hi: "रसीद डाउनलोड करें" },
  "footer.rights": { en: "All Rights Reserved. Dedicated to Dharma & Devotion.", hi: "सर्वाधिकार सुरक्षित। धर्म एवं भक्ति को समर्पित।" },
  "footer.quickLinks": { en: "Quick Links", hi: "त्वरित लिंक" },
  "footer.contactInfo": { en: "Temple Trust Office", hi: "मंदिर ट्रस्ट कार्यालय" },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("tms_lang") as Language;
    if (saved === "en" || saved === "hi") {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("tms_lang", newLang);
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][lang]) {
      return translations[key][lang];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
