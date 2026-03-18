// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { MessageCircle } from 'lucide-react';

import image1 from '../assets/1.jpg';
import image2 from '../assets/2.jpg';
import image3 from '../assets/3.jpg';
import image4 from '../assets/qrscan.jpg';
import image5 from '../assets/about.jpg';
import image6 from '../assets/Logo.png';
import indiaMapImg from '../assets/indiamap.png';

const sliderImages = [
  "https://images.pexels.com/photos/235925/pexels-photo-235925.jpeg?auto=compress&cs=tinysrgb&w=1600",
  image1, image2, image3,
];

const content = {
  en: {
    nav: { home: "Home", about: "About", howItWorks: "How It Works", benefits: "Benefits", articles: "Articles", contact: "Raise a Complaint", language: "भाषा / HI", login: "Login / Signup" },
    hero: [{ title: "Empowering Farmers, Ensuring Purity", subtitle: "Join the digital revolution in agriculture with blockchain-powered traceability for Ayurvedic herbs.", button: "Register Now" }, { title: "Rewarding Excellence. Certified Quality.", subtitle: "We reward our partner farmers with premium bonuses and a Certificate of Excellence for cultivating herbs of the highest purity and potency." }, { title: "CHAMPIONING OUR WOMEN FARMERS.", subtitle: "We provide extra bonuses to women farmers, honoring their contribution and empowering rural communities." }, { title: "AI-POWERED PURITY. VERIFIED INSTANTLY.", subtitle: "Our AI verifies herb species, quality, and origin at the source. Transparency you can trust." }],
    howItWorks: { title: "Simple Steps to a Transparent Future", steps: [{ title: "Register & List", desc: "Farmers register their land and crops on our secure platform." }, { title: "Trace with QR", desc: "Each batch gets a unique QR code, logged on the blockchain." }, { title: "Verify & Trust", desc: "Consumers scan the code to see the product's entire journey." }] },
    scanQR: { subtitle: "TRANSPARENCY IN YOUR HANDS", title: "Verify Authenticity Instantly", desc: "Curious about where your Ayurvedic products come from? Simply scan the QR code on the packaging with your smartphone to trace the complete journey of your herb, from the farm to your hands. Empower yourself with knowledge and trust in every purchase.", button: "Scan a QR Code" },
    keyFeatures: { title: "A Platform Built on Trust and Technology", desc: "Sanjeevani bridges the gap between dedicated farmers and conscious consumers, ensuring transparency at every step.", features: [{ title: "Easy Farmer Registration", desc: "A simple, voice-assisted process for quick and easy onboarding." }, { title: "Consumer Trust", desc: "Verify product authenticity and origin instantly with a QR scan." }, { title: "Fair Pricing", desc: "Get rewarded fairly for high-quality, organic produce through a transparent system." }, { title: "Women Empowerment", desc: "Special focus and benefits for women farmers and Self-Help Groups (SHGs)." }] },
    about: { subtitle: "PRESERVING HERITAGE, EMPOWERING FARMERS", title: "About Sanjeevani", desc: "Sanjeevani is a government initiative that ensures traceability and trust in Ayurvedic herbs through blockchain technology. It rewards farmers for quality produce, supports women farmers, and allows consumers to verify authenticity with QR codes, while promoting sustainable farming and preserving India’s Ayurvedic heritage." },
    benefits: { title: "How Sanjeevani Benefits You", items: [{ title: 'For Farmers', description: 'Earn more for high-quality, certified Ayurvedic herbs through a transparent system.' }, { title: 'For Women Farmers', description: 'Access special incentives, training, and recognition for your contribution.' }, { title: 'For Consumers', description: 'Trust in safe, authentic Ayurvedic products with verifiable origins.' }, { title: 'For Society', description: 'Support sustainable farming and help preserve India’s rich Ayurvedic heritage.' }, { title: 'For Government', description: 'Ensure regulatory compliance and transparency across the supply chain.' }] },
    video: { title: "Watch Our Platform in Action", desc: "See how Sanjeevani is revolutionizing the Ayurvedic supply chain. This short video demonstrates the journey of an herb from a registered farmer to a verified product, showcasing the simplicity and power of our blockchain platform." },
    articles: { title: "Resources & Announcements", relatedTitle: "Related Articles", announcementsTitle: "Latest Announcements" },
    footer: { desc: "A Government of India initiative by the Ministry of AYUSH to promote, preserve, and protect our agricultural heritage through modern technology.", quickLinks: "Quick Links", contact: "Contact", copyright: "© {year} Ministry of AYUSH, Government of India. All Rights Reserved." }
  },
  hi: { nav: { home: "होम", about: "हमारे बारे में", howItWorks: "यह कैसे काम करता है", benefits: "लाभ", articles: "लेख", contact: "संपर्क", language: "Language / EN", login: "लॉगिन / साइनअप" }, hero: [{ title: "किसानों को सशक्त बनाना, शुद्धता सुनिश्चित करना", subtitle: "आयुर्वेदिक जड़ी-बूटियों के लिए ब्लॉकचेन-संचालित ट्रेसबिलिटी के साथ कृषि में डिजिटल क्रांति में शामिल हों।", button: "किसान के रूप में पंजीकरण करें" }, { title: "उत्कृष्टता का पुरस्कार। प्रमाणित गुणवत्ता।", subtitle: "हम अपने साझेदार किसानों को उच्चतम शुद्धता और शक्ति वाली जड़ी-बूटियों की खेती के लिए प्रीमियम बोनस और उत्कृष्टता प्रमाणपत्र से पुरस्कृत करते हैं।" }, { title: "हमारी महिला किसानों का समर्थन।", subtitle: "हम महिला किसानों को अतिरिक्त बोनस प्रदान करते हैं, उनके योगदान का सम्मान करते हैं और ग्रामीण समुदायों को सशक्त बनाते हैं।" }, { title: "एआई-संचालित शुद्धता। तुरंत सत्यापित।", subtitle: "हमारा एआई स्रोत पर ही जड़ी-बूटियों की प्रजातियों, गुणवत्ता और उत्पत्ति की पुष्टि करता है। पारदर्शिता जिस पर आप भरोसा कर सकते हैं।" }], howItWorks: { title: "एक पारदर्शी भविष्य के लिए सरल कदम", steps: [{ title: "पंजीकरण और सूची", desc: "किसान हमारे सुरक्षित प्लेटफॉर्म पर अपनी भूमि और फसलों का पंजीकरण करते हैं।" }, { title: "क्यूआर से ट्रेस करें", desc: "प्रत्येक बैच को एक अद्वितीय क्यूआर कोड मिलता है, जो ब्लॉकचेन पर दर्ज होता है।" }, { title: "सत्यापित करें और भरोसा करें", desc: "उपभोक्ता उत्पाद की पूरी यात्रा देखने के लिए कोड को स्कैन करते हैं।" }] }, scanQR: { subtitle: "पारदर्शिता आपके हाथों में", title: "प्रामाणिकता को तुरंत सत्यापित करें", desc: "क्या आप जानना चाहते हैं कि आपके आयुर्वेदिक उत्पाद कहाँ से आते हैं? अपनी जड़ी-बूटी की पूरी यात्रा का पता लगाने के लिए बस अपने स्मार्टफोन से पैकेजिंग पर क्यूआर कोड स्कैन करें, खेत से लेकर आपके हाथों तक। हर खरीद में ज्ञान और विश्वास के साथ खुद को सशक्त बनाएं।", button: "क्यूआर कोड स्कैन करें" }, keyFeatures: { title: "विश्वास और प्रौद्योगिकी पर बना एक मंच", desc: "संजीवनी समर्पित किसानों और जागरूक उपभोक्ताओं के बीच की खाई को पाटती है, हर कदम पर पारदर्शिता सुनिश्चित करती है।", features: [{ title: "आसान किसान पंजीकरण", desc: "त्वरित और आसान ऑनबोर्डिंग के लिए एक सरल, आवाज-सहायता प्राप्त प्रक्रिया।" }, { title: "उपभोक्ता विश्वास", desc: "एक क्यूआर स्कैन के साथ तुरंत उत्पाद की प्रामाणिकता और उत्पत्ति को सत्यापित करें।" }, { title: "उचित मूल्य निर्धारण", desc: "एक पारदर्शी प्रणाली के माध्यम से उच्च गुणवत्ता वाली, जैविक उपज के लिए उचित पुरस्कार प्राप्त करें।" }, { title: "महिला सशक्तिकरण", desc: "महिला किसानों और स्वयं सहायता समूहों (एसएचजी) के लिए विशेष ध्यान और लाभ।" }] }, about: { subtitle: "विरासत का संरक्षण, किसानों का सशक्तिकरण", title: "संजीवनी के बारे में", desc: "संजीवनी एक सरकारी पहल है जो ब्लॉकचेन तकनीक के माध्यम से आयुर्वेदिक जड़ी-बूटियों में ट्रेसबिलिटी और विश्वास सुनिश्चित करती है। यह गुणवत्तापूर्ण उपज के लिए किसानों को पुरस्कृत करती है, महिला किसानों का समर्थन करती है, और उपभोक्ताओं को क्यूआर कोड के साथ प्रामाणिकता सत्यापित करने की अनुमति देती है, जबकि स्थायी खेती को बढ़ावा देती है और भारत की आयुर्वेदिक विरासत को संरक्षित करती है।" }, benefits: { title: "संजीवनी आपको कैसे लाभ पहुंचाती है", items: [{ title: 'किसानों के लिए', description: 'एक पारदर्शी प्रणाली के माध्यम से उच्च-गुणवत्ता, प्रमाणित आयुर्वेदिक जड़ी-बूटियों के लिए अधिक कमाएँ।' }, { title: 'महिला किसानों के लिए', description: 'आपके योगदान के लिए विशेष प्रोत्साहन, प्रशिक्षण और मान्यता प्राप्त करें।' }, { title: 'उपभोक्ताओं के लिए', description: 'सत्यापन योग्य मूल के साथ सुरक्षित, प्रामाणिक आयुर्वेदिक उत्पादों पर भरोसा करें।' }, { title: 'समाज के लिए', description: 'टिकाऊ खेती का समर्थन करें और भारत की समृद्ध आयुर्वेदिक विरासत को संरक्षित करने में मदद करें।' }, { title: 'सरकार के लिए', description: 'आपूर्ति श्रृंखला में नियामक अनुपालन और पारदर्शिता सुनिश्चित करें।' }] }, video: { title: "हमारे प्लेटफॉर्म को एक्शन में देखें", desc: "देखें कि संजीवनी आयुर्वेदिक आपूर्ति श्रृंखला में कैसे क्रांति ला रही है। यह छोटा वीडियो एक पंजीकृत किसान से एक सत्यापित उत्पाद तक एक जड़ी-बूटी की यात्रा को प्रदर्शित करता है, जो हमारे ब्लॉकचेन प्लेटफॉर्म की सादगी और शक्ति को दर्शाता है।" }, articles: { title: "संसाधन और घोषणाएँ", relatedTitle: "संबंधित लेख", announcementsTitle: "नवीनतम घोषणाएँ" }, footer: { desc: "आयुष मंत्रालय द्वारा भारत सरकार की एक पहल, जिसका उद्देश्य आधुनिक तकनीक के माध्यम से हमारी कृषि विरासत को बढ़ावा देना, संरक्षित करना और उसकी रक्षा करना है।", quickLinks: "त्वरित लिंक्स", contact: "संपर्क", copyright: "© {year} आयुष मंत्रालय, भारत सरकार। सर्वाधिकार सुरक्षित।" } }
};

const benefitIcons = [<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>, <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 14v1.5a2 2 0 01-2 2H8a2 2 0 01-2-2V14m0-4h.01M5 8h.01M21 12h.01M16 6v1a4 4 0 01-4 4h-1.5a4 4 0 01-4-4V6m6 0h.01M10 21v-2a4 4 0 014-4h.5" /></svg>, <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h7a2 2 0 002-2v-1a2 2 0 012-2h2.945M10 7l2-2m0 0l2 2M12 5v14" /></svg>, <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>];
const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-in-out w-full sm:w-64 text-center">
    <div className="flex justify-center items-center mb-4 h-16 w-16 mx-auto bg-green-100 rounded-full">{icon}</div>
    <h3 className="text-xl font-bold text-[#133215] mb-2">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
  </div>
);

const HomePage = ({ onChatToggle, language = "en", toggleLanguage }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // 🔥 FIXED HERE
  const c = content[language] ?? content.en;

  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? sliderImages.length - 1 : prev - 1));
  const nextSlide = () => setCurrentSlide((prev) => (prev === sliderImages.length - 1 ? 0 : prev + 1));

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  useEffect(() => {
    if (isScannerOpen) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { qrbox: { width: 250, height: 250 }, fps: 10 },
        false
      );

      const onScanSuccess = (decodedText) => {
        scanner.clear();
        setIsScannerOpen(false);
        const url = decodedText.startsWith("http") ? decodedText : `https://${decodedText}`;
        window.location.href = url;
      };

      scanner.render(onScanSuccess);

      return () => {
        if (scanner) scanner.clear().catch(() => {});
      };
    }
  }, [isScannerOpen]);


  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 font-sans">
      <nav className="bg-[#133215] text-white px-4 sm:px-8 py-3 flex justify-between items-center shadow-lg sticky top-0 z-40">
        <div className="flex items-center gap-3"><div className="flex-shrink-0"><img src={image6} alt="Sanjeevani Logo" className="h-12 w-auto" /></div></div>
        <ul className="hidden lg:flex gap-8 text-md font-medium items-center">
          <li><a href="#home" className="hover:text-[#92B775] cursor-pointer transition-colors duration-300">{c.nav.home}</a></li>
          <li><a href="#about" className="hover:text-[#92B775] cursor-pointer transition-colors duration-300">{c.nav.about}</a></li>
          <li><a href="#how-it-works" className="hover:text-[#92B775] cursor-pointer transition-colors duration-300">{c.nav.howItWorks}</a></li>
          <li><a href="#benefits" className="hover:text-[#92B775] cursor-pointer transition-colors duration-300">{c.nav.benefits}</a></li>
          <li><a href="#articles" className="hover:text-[#92B775] cursor-pointer transition-colors duration-300">{c.nav.articles}</a></li>
          <li><a href="#contact" className="hover:text-[#92B775] cursor-pointer transition-colors duration-300">{c.nav.contact}</a></li>
        </ul>
        <div className="hidden md:flex items-center gap-2">

          {/* Ask AI Button */}
          <button
            onClick={onChatToggle}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-[#92B775]/50 hover:bg-[#92B775]/20 hover:border-[#95d663] transition-all duration-300 group"
          >
            <MessageCircle size={18} className="text-[#92B775] group-hover:text-white" />
            <span className="text-sm font-medium text-[#92B775] group-hover:text-white">Ask AI</span>
          </button>

          <button onClick={toggleLanguage} className="px-4 py-2 text-sm bg-transparent border border-white rounded-md hover:bg-white hover:text-[#133215] transition-colors duration-300 w-28">{c.nav.language}</button>
          <button onClick={() => navigate("/signup")} className="px-4 py-2 text-sm bg-[#92B775] text-[#133215] font-bold rounded-md hover:bg-[#a7c989] transition-colors duration-300">{c.nav.login}</button>
        </div>
        <button className="md:hidden text-3xl focus:outline-none z-50 relative" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? "✖" : "☰"}</button>
        <div className={`fixed top-0 right-0 h-full w-64 bg-[#133215] text-white transform transition-transform duration-300 ease-in-out z-40 ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex flex-col p-6 space-y-6">
            <a href="#home" onClick={() => setIsMenuOpen(false)} className="block hover:text-[#92B775]">{c.nav.home}</a>
            <a href="#about" onClick={() => setIsMenuOpen(false)} className="block hover:text-[#92B775]">{c.nav.about}</a>
            <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="block hover:text-[#92B775]">{c.nav.howItWorks}</a>
            <a href="#benefits" onClick={() => setIsMenuOpen(false)} className="block hover:text-[#92B775]">{c.nav.benefits}</a>
            <a href="#articles" onClick={() => setIsMenuOpen(false)} className="block hover:text-[#92B775]">{c.nav.articles}</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="block hover:text-[#92B775]">{c.nav.contact}</a>

            {/* Mobile Ask AI Link */}
            <button onClick={() => { onChatToggle(); setIsMenuOpen(false); }} className="text-left flex items-center gap-2 hover:text-[#92B775]">
              <MessageCircle size={18} />
              Ask AI Assistant
            </button>

            <button onClick={() => { toggleLanguage(); setIsMenuOpen(false); }} className="px-4 py-2 text-sm bg-transparent border border-white rounded-md hover:bg-white hover:text-[#133215] transition">{c.nav.language}</button>
            <button onClick={() => { navigate("/signin"); setIsMenuOpen(false); }} className="px-4 py-2 text-sm bg-[#92B775] text-[#133215] font-bold rounded-md hover:bg-[#a7c989] transition">{c.nav.login}</button>
          </div>
        </div>
      </nav>

      <main>
        <section id="home" className="relative w-full h-80 md:h-[32rem] overflow-hidden">
          <div className="w-full h-full flex transition-transform ease-in-out duration-1000" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {sliderImages.map((src, index) => <img key={index} src={src} alt={`Slide ${index}`} className="w-full h-full object-cover flex-shrink-0" />)}
          </div>
          <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center text-white p-4">
            {c.hero.map((slide, index) => (currentSlide === index && (<div key={index} className="animate-fade-in"> <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">{slide.title}</h2> <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">{slide.subtitle}</p> {slide.button && (<button onClick={() => navigate("/signin")} className="mt-8 px-8 py-3 bg-[#92B775] text-[#133215] font-bold text-lg rounded-lg hover:bg-white transition-all duration-300 shadow-lg">{slide.button}</button>)} </div>)))}
          </div>
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full hover:bg-black/60 transition-colors">❮</button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full hover:bg-black/60 transition-colors">❯</button>
        </section>

        {/* --- INDIA MAP --- */}
        <section className="w-full bg-gray-50">
          <img src={indiaMapImg} alt="Kissano Ka Sapna Sakaar - Ministry of Ayush" className="w-full h-auto object-cover" />
        </section>

        <section id="how-it-works" className="py-20 px-6 bg-gray-50">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#133215] mb-12">{c.howItWorks.title}</h2>
            <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
              {c.howItWorks.steps.map((step, index) => (<div key={index} className="flex flex-col items-center"> <div className="bg-[#92B775] text-[#133215] text-2xl font-bold h-16 w-16 rounded-full flex items-center justify-center">{index + 1}</div> <h3 className="text-xl font-semibold text-[#133215] mt-4">{step.title}</h3> <p className="text-gray-600 mt-2">{step.desc}</p> </div>))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-white">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center"><img src={image4} alt="Scanning a QR code on a product" className="rounded-lg shadow-xl max-w-sm w-full" /></div>
            <div className="text-center md:text-left px-4">
              <h3 className="text-lg font-semibold text-[#92B775]">{c.scanQR.subtitle}</h3>
              <h2 className="text-3xl font-bold text-[#133215] mt-2 mb-4">{c.scanQR.title}</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-8">{c.scanQR.desc}</p>
              <button onClick={() => setIsScannerOpen(true)} className="px-8 py-3 bg-[#92B775] text-[#133215] font-bold text-lg rounded-lg hover:bg-[#133215] hover:text-white transition-all duration-300 shadow-lg">{c.scanQR.button}</button>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-[#F3E8D3]">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#133215] mb-4">{c.keyFeatures.title}</h2>
            <p className="text-gray-600 mb-12 max-w-3xl mx-auto">{c.keyFeatures.desc}</p>
            <div className="flex flex-wrap justify-center gap-8">
              <FeatureCard icon={<svg className="w-8 h-8 text-[#133215]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>} title={c.keyFeatures.features[0].title} desc={c.keyFeatures.features[0].desc} />
              <FeatureCard icon={<svg className="w-8 h-8 text-[#133215]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>} title={c.keyFeatures.features[1].title} desc={c.keyFeatures.features[1].desc} />
              <FeatureCard icon={<svg className="w-8 h-8 text-[#133215]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>} title={c.keyFeatures.features[2].title} desc={c.keyFeatures.features[2].desc} />
              <FeatureCard icon={<svg className="w-8 h-8 text-[#133215]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>} title={c.keyFeatures.features[3].title} desc={c.keyFeatures.features[3].desc} />
            </div>
          </div>
        </section>

        <section id="about" className="py-20 px-6 bg-gray-50">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="px-4"><h3 className="text-lg font-semibold text-[#92B775]">{c.about.subtitle}</h3><h2 className="text-3xl font-bold text-[#133215] mt-2 mb-4">{c.about.title}</h2><p className="text-gray-700 text-lg leading-relaxed">{c.about.desc}</p></div>
            <div className="flex justify-center p-4"><img src={image5} alt="Ayurvedic herbs and spices" className="rounded-lg shadow-xl w-full max-w-sm" /></div>
          </div>
        </section>

        <section id="benefits" className="py-20 px-6 bg-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#133215] mb-12">{c.benefits.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch justify-center">
              {c.benefits.items.slice(0, 3).map((benefit, index) => (<div key={benefit.title} className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"> <div className="flex justify-center items-center mb-4 h-16 w-16 mx-auto bg-[#92B775] rounded-full">{benefitIcons[index]}</div> <h3 className="text-xl font-bold text-[#133215] mb-2">{benefit.title}</h3> <p className="text-gray-600">{benefit.description}</p> </div>))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-8">
              {c.benefits.items.slice(3).map((benefit, index) => (<div key={benefit.title} className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"> <div className="flex justify-center items-center mb-4 h-16 w-16 mx-auto bg-[#92B775] rounded-full">{benefitIcons[index + 3]}</div> <h3 className="text-xl font-bold text-[#133215] mb-2">{benefit.title}</h3> <p className="text-gray-600">{benefit.description}</p> </div>))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-gray-50">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#133215] mb-4">{c.video.title}</h2>
            <p className="text-gray-600 mb-12 max-w-3xl mx-auto">{c.video.desc}</p>
            <div className="max-w-4xl mx-auto aspect-video rounded-lg shadow-2xl overflow-hidden">
              <iframe className="w-full h-full"
                src="https://www.youtube.com/embed/r5kgXv22JeE" title="Sanjeevani Platform Prototype" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>
          </div>
        </section>

        <section id="articles" className="py-20 px-6 bg-[#F3E8D3]">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-[#133215] mb-12">{c.articles.title}</h2>
            <div className="bg-white rounded-lg shadow-lg p-8 text-left">
              <h3 className="text-xl font-bold text-[#133215] mb-4">{c.articles.relatedTitle}</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-[#92B775] mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg><a href="https://navbharattimes.indiatimes.com/lifestyle/health/6-herbs-that-flavor-food-and-improve-health-here-are-amazing-benefits/articleshow/86062934.cms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">6 जड़ी-बूटियां, जो खाने का स्वाद बढ़ाने के साथ सेहत भी सुधारती हैं (Navbharat Times)</a></li>
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-[#92B775] mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg><a href="https://hindi.news18.com/photogallery/lifestyle/health-medicinal-plant-health-benefit-these-5-medicinal-herbs-cures-multiple-diseases-useful-for-centuries-to-stay-healthy-and-fit-7853134.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">सदियों से सेहतमंद रहने के लिए अपनाए जा रहे हैं ये 5 औषधीय पौधे (News18 Hindi)</a></li>
                <li className="flex items-start gap-3"><svg className="w-5 h-5 text-[#92B775] mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg><a href="https://www.onlymyhealth.com/topic/herbs-in-hindi" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">जड़ी-बूटियों से जुड़े लेख (OnlyMyHealth)</a></li>
              </ul>
              <hr className="my-8 border-gray-200" />
              <h3 className="text-xl font-bold text-[#133215] mb-4">{c.articles.announcementsTitle}</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b"><div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md mt-1">NEW</div><p className="text-gray-700"><span className="font-semibold">18 Sept 2025:</span> New subsidy scheme announced for herbal farmers in the Gwalior-Chambal region. <a href="#" className="text-blue-600 hover:underline">Read more...</a></p></div>
                <div className="flex items-start gap-4 pb-4 border-b"><div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-md mt-1">EVENT</div><p className="text-gray-700"><span className="font-semibold">10 Sept 2025:</span> Training workshops scheduled in Uttar Pradesh for the upcoming season. <a href="#" className="text-blue-600 hover:underline">Register here</a></p></div>
                <div className="flex items-start gap-4"><div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md mt-1">INFO</div><p className="text-gray-700"><span className="font-semibold">05 Sept 2025:</span> Blockchain traceability pilot program successfully launched in Madhya Pradesh.</p></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="bg-[#133215] text-white pt-16 pb-8 px-6 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2"><h3 className="font-bold text-xl mb-4">Sanjeevani</h3><p className="text-gray-300 text-sm">{c.footer.desc}</p></div>
          <div><h3 className="font-semibold mb-4">{c.footer.quickLinks}</h3><ul className="space-y-2 text-sm text-gray-300"><li><a href="#about" className="hover:text-white">About Us</a></li><li><a href="#articles" className="hover:text-white">Articles</a></li><li><a href="#" className="hover:text-white">RTI</a></li><li><a href="#contact" className="hover:text-white">Contact</a></li></ul></div>
          <div><h3 className="font-semibold mb-4">{c.footer.contact}</h3><ul className="space-y-2 text-sm text-gray-300"><li>Email: info@sanjeevani.gov.in</li><li>Phone: +91-11-12345678</li><li><a href="#" className="hover:text-white">Terms & Conditions</a></li><li><a href="#" className="hover:text-white">Privacy Policy</a></li></ul></div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-400"><p>{c.footer.copyright.replace('{year}', new Date().getFullYear())}</p></div>
      </footer>

      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-4 rounded-lg shadow-2xl w-full max-w-md relative">
            <button onClick={() => setIsScannerOpen(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-3xl z-10">&times;</button>
            <h3 className="text-xl font-bold text-[#133215] mb-4 text-center">Scan QR Code</h3>
            <div id="qr-reader" className="w-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;