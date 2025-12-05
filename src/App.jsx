import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Star,
  ArrowRight,
  Menu,
  X,
  Tag,
  Facebook,
  Instagram,
  Twitter,
  Gift,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- IMAGES ---
import cleanerImage from './assets/images/placeholder-cleaner.jpg';
import residentialImg from './assets/images/real-livingroom.jpg';
import commercialImg from './assets/images/clean-office.jpg';
import moveInImg from './assets/images/clean-apartment.webp';

// --- HERO BACKGROUND IMAGES ---
import combinedHeroImg from './assets/images/combined-hero.png';
import mobileHeroImg from './assets/images/cleaning-counter.webp';

// --- CUSTOM SPARKLE COMPONENT ---
const CleanSparkle = ({ delay = 1, color = 'gold' }) => {
  const isWhite = color === 'white';

  return (
    <motion.svg
      width='30'
      height='30'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='absolute -top-4 -right-4 z-20 pointer-events-none'
      initial={{ scale: 0, opacity: 0, rotate: 0 }}
      animate={{
        scale: [0, 1.5, 0],
        opacity: [0, 1, 0],
        rotate: [0, 90, 180],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 3,
        ease: 'easeInOut',
        delay: delay,
      }}
    >
      <path
        d='M12 0L14 9L23 12L14 15L12 24L10 15L1 12L10 9L12 0Z'
        className={
          isWhite
            ? 'fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
            : 'fill-royal-gold drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]'
        }
      />
    </motion.svg>
  );
};

// --- REUSABLE MODAL COMPONENT ---
const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-white/95 backdrop-blur-sm z-[60] transition-all'
          />

          {/* Modal Container */}
          <div className='fixed inset-0 z-[70] flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className='bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative max-h-[90vh] overflow-y-auto'
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className='absolute top-4 right-4 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors z-20'
              >
                <X className='w-5 h-5' />
              </button>

              {/* Modal Header */}
              <div className='bg-gradient-to-r from-royal-green/5 to-teal-50 p-6 px-12 md:p-8 pb-4 text-center'>
                <h3 className='text-lg md:text-2xl font-extrabold text-slate-900 inline-block relative leading-tight'>
                  {title}
                  <CleanSparkle delay={0.5} color='gold' />
                </h3>
                <div className='w-16 h-1 bg-royal-gold mx-auto rounded-full mt-2'></div>
              </div>

              {/* Modal Content */}
              <div className='p-6 md:p-8 pt-4'>{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Modal Logic
  const [activeModal, setActiveModal] = useState(null);
  const [successType, setSuccessType] = useState('contact');

  const openContact = () => {
    setActiveModal('contact');
    setIsMenuOpen(false);
  };

  const openSubscribe = () => {
    setActiveModal('subscribe');
    setIsMenuOpen(false);
  };

  const closeModal = () => setActiveModal(null);

  // Handle Form Submits
  const handleFormSubmit = (e, type) => {
    e.preventDefault();
    setSuccessType(type);
    setActiveModal('success');
  };

  return (
    <div className='min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden font-sans'>
      {/* --- MODALS --- */}

      {/* 1. CONTACT MODAL */}
      <Modal
        isOpen={activeModal === 'contact'}
        onClose={closeModal}
        title='Get Your Free Estimate'
      >
        <p className='text-center text-slate-600 mb-6 text-sm md:text-base'>
          Tell us about your castle, and we'll provide a royal quote.
        </p>
        <form
          className='space-y-4'
          onSubmit={(e) => handleFormSubmit(e, 'contact')}
        >
          <div className='grid grid-cols-2 gap-3 md:gap-4'>
            <div>
              <label className='block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1'>
                First Name
              </label>
              <input
                type='text'
                className='w-full px-4 py-3 md:px-5 text-sm md:text-base bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none transition-all'
                placeholder='Jane'
                required
              />
            </div>
            <div>
              <label className='block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1'>
                Last Name
              </label>
              <input
                type='text'
                className='w-full px-4 py-3 md:px-5 text-sm md:text-base bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none transition-all'
                placeholder='Doe'
              />
            </div>
          </div>
          <div>
            <label className='block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1'>
              Email Address
            </label>
            <input
              type='email'
              className='w-full px-4 py-3 md:px-5 text-sm md:text-base bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none transition-all'
              placeholder='jane@example.com'
              required
            />
          </div>
          <div>
            <label className='block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1'>
              Service Type
            </label>
            <div className='relative'>
              <select className='w-full px-4 py-3 md:px-5 text-sm md:text-base bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none appearance-none cursor-pointer'>
                <option>Residential Cleaning</option>
                <option>Commercial Cleaning</option>
                <option>Move-In / Move-Out</option>
              </select>
              <ArrowRight className='absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none' />
            </div>
          </div>

          <button className='w-1/2 mx-auto bg-royal-green hover:bg-royal-dark text-white font-bold py-3 md:py-4 rounded-full transition-all shadow-lg hover:shadow-xl flex justify-center items-center gap-2 mt-4 text-sm md:text-base'>
            Send Request
            <ArrowRight className='w-4 h-4' />
          </button>
        </form>
      </Modal>

      {/* 2. SUBSCRIBE MODAL */}
      <Modal
        isOpen={activeModal === 'subscribe'}
        onClose={closeModal}
        title='Unlock Royal Offers'
      >
        <p className='text-center text-slate-600 mb-6 text-sm md:text-base'>
          Join our list for exclusive tips and a{' '}
          <span className='font-bold text-royal-green'>10% discount</span> on
          your first deep clean.
        </p>
        <form
          className='space-y-4'
          onSubmit={(e) => handleFormSubmit(e, 'subscribe')}
        >
          <div className='relative'>
            <Mail className='absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5' />
            <input
              type='email'
              placeholder='Enter your email address'
              className='pl-12 pr-5 py-3 md:py-4 w-full bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none transition-all text-sm md:text-base'
              required
            />
          </div>

          <button className='w-1/2 mx-auto bg-gradient-to-r from-royal-green to-teal-600 hover:to-royal-green text-white font-bold py-3 md:py-4 rounded-full transition-all shadow-lg hover:shadow-xl flex justify-center items-center gap-2 text-sm md:text-base'>
            Claim Offer
            <Tag className='w-4 h-4' />
          </button>

          <p className='text-[10px] md:text-xs text-center text-slate-400 mt-4'>
            We respect your privacy. Unsubscribe at any time.
          </p>
        </form>
      </Modal>

      {/* 3. SUCCESS MODAL */}
      <Modal
        isOpen={activeModal === 'success'}
        onClose={closeModal}
        title={
          successType === 'subscribe'
            ? 'Welcome to the Family!'
            : 'Message Received'
        }
      >
        <div className='text-center'>
          <div className='w-16 h-16 bg-green-100 text-royal-green rounded-full flex items-center justify-center mx-auto mb-6'>
            {successType === 'subscribe' ? (
              <Gift className='w-8 h-8' />
            ) : (
              <Check className='w-8 h-8' />
            )}
          </div>

          {successType === 'subscribe' ? (
            <>
              <p className='text-slate-600 mb-4 text-sm md:text-base'>
                Thank you for subscribing! As promised, here is your discount
                code for your first booking:
              </p>
              <div className='bg-slate-50 border-2 border-dashed border-royal-green/30 rounded-xl p-4 mb-6 cursor-text select-all'>
                <span className='text-xl md:text-2xl font-bold text-royal-green tracking-widest'>
                  ROYAL10
                </span>
              </div>
              <p className='text-xs md:text-sm text-slate-500'>
                We've also sent this code to your email address.
              </p>
            </>
          ) : (
            <>
              <p className='text-slate-600 mb-6 text-base md:text-lg'>
                Thank you for reaching out to the Queen!
              </p>
              <p className='text-slate-500 mb-6 text-sm md:text-base'>
                We have received your request and a member of our royal staff
                will be in touch within 24 hours to finalize your estimate.
              </p>
            </>
          )}

          <button
            onClick={closeModal}
            className='mt-6 text-royal-green font-bold hover:text-royal-dark transition-colors uppercase tracking-wide text-xs md:text-sm'
          >
            Close Window
          </button>
        </div>
      </Modal>

      {/* --- Navigation --- */}
      <nav className='fixed w-full z-50 bg-white/80 backdrop-blur-lg shadow-sm border-b border-slate-100 transition-all duration-300'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-20'>
            <div className='flex items-center gap-2'>
              <div className='bg-gradient-to-br from-royal-green to-teal-600 p-2.5 rounded-xl shadow-lg shadow-royal-green/20'>
                <Sparkles className='h-6 w-6 text-white' />
              </div>
              <div>
                <h1 className='text-xl font-extrabold tracking-tight text-slate-900 leading-none'>
                  DMV QUEEN
                </h1>
                <span className='text-[10px] font-bold text-royal-gold tracking-[0.2em] uppercase'>
                  Of Clean
                </span>
              </div>
            </div>

            <div className='hidden lg:flex items-center space-x-8'>
              <button
                onClick={openContact}
                className='group bg-royal-green hover:bg-royal-dark text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-royal-green/30 flex items-center gap-2'
              >
                Get a Free Estimate
                <ArrowRight className='w-4 h-4 transition-transform group-hover:translate-x-1' />
              </button>
            </div>

            <div className='lg:hidden'>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className='text-slate-600'
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className='lg:hidden bg-white border-t border-slate-100 absolute w-full shadow-xl'>
            <div className='px-4 pt-4 pb-6 space-y-2'>
              <button
                onClick={openContact}
                className='w-full text-center bg-royal-green text-white px-4 py-3 rounded-lg font-semibold'
              >
                Get a Free Estimate
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <header className='relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden'>
        {/* Image Swapping: Cleaning Counter for Mobile, Wide Hero for Desktop */}
        <div className='absolute inset-0 z-0 lg:hidden'>
          <img
            src={mobileHeroImg}
            alt='Background Texture'
            className='w-full h-full object-cover opacity-[0.3]'
          />
        </div>
        <div className='absolute inset-0 z-0 hidden lg:block'>
          <img
            src={combinedHeroImg}
            alt='Background Texture'
            className='w-full h-full object-cover opacity-[0.3]'
          />
        </div>

        <div
          className='absolute inset-0 z-0 opacity-[0.3]'
          style={{
            backgroundImage: 'radial-gradient(#059669 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        ></div>

        <motion.div
          animate={{ y: [0, -40, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className='absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-royal-gold/20 rounded-full blur-[100px]'
        />
        <motion.div
          animate={{ y: [0, 40, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className='absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-royal-green/20 rounded-full blur-[100px]'
        />

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
          <div className='text-center max-w-4xl mx-auto'>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <span className='inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/80 border border-green-100 text-royal-green text-xs md:text-sm font-bold tracking-wide uppercase mb-8 shadow-sm backdrop-blur-sm'>
                <Star className='w-4 h-4 text-royal-gold fill-royal-gold' />
                Royalty Standard Cleaning
              </span>

              <h1 className='text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight drop-shadow-sm'>
                Your Home Deserves the <br />
                <span className='relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-royal-green via-teal-500 to-royal-green bg-[length:200%_auto] animate-gradient'>
                  Royal Treatment
                  <CleanSparkle color='white' />
                </span>
              </h1>

              <p className='text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto'>
                Experience the cleanest version of your home. Serving Washington
                DC, Maryland, and Virginia with eco-friendly, meticulous care.
              </p>

              <div className='flex flex-col sm:flex-row justify-center gap-4'>
                <button
                  onClick={openContact}
                  className='w-full sm:w-auto px-8 py-4 bg-royal-green hover:bg-royal-dark text-white rounded-full font-bold text-lg shadow-xl shadow-royal-green/20 transition-all transform hover:-translate-y-1 hover:shadow-2xl'
                >
                  Book Your Cleaning
                </button>

                <button
                  onClick={openSubscribe}
                  className='w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-100 text-slate-700 hover:border-royal-green hover:text-royal-green rounded-full font-bold text-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group'
                >
                  <Tag className='w-5 h-5 text-royal-gold group-hover:rotate-12 transition-transform' />
                  Get Offers
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* --- Services Section --- */}
      <section className='py-24 bg-white relative'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl lg:text-4xl font-bold text-slate-900 mb-4'>
              Our Royal Services
            </h2>
            <div className='w-24 h-1.5 bg-gradient-to-r from-royal-gold to-orange-300 mx-auto rounded-full'></div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <ServiceCard
              title='Residential Cleaning'
              desc='Weekly, bi-weekly, or monthly maintenance.'
              icon={<Star className='w-6 h-6 text-royal-gold' />}
              image={residentialImg}
            />
            <ServiceCard
              title='Commercial Spaces'
              desc='Office & retail cleaning services.'
              icon={<CheckCircle className='w-6 h-6 text-royal-green' />}
              image={commercialImg}
            />
            <ServiceCard
              title='Move-In / Move-Out'
              desc='Deep cleaning for new beginnings.'
              icon={<Sparkles className='w-6 h-6 text-teal-400' />}
              image={moveInImg}
            />
          </div>
        </div>
      </section>

      {/* --- Subscribe Banner --- */}
      <section
        id='subscribe'
        className='py-12 bg-gradient-to-r from-royal-green/5 to-teal-50 border-y border-slate-100 relative overflow-hidden'
      >
        <div className='absolute top-0 left-0 w-32 h-32 bg-royal-green/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2'></div>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
          <div className='bg-white rounded-3xl shadow-xl p-8 md:p-12 flex flex-col lg:flex-row items-center lg:gap-12 gap-8 border border-slate-100'>
            <div className='text-center lg:text-left max-w-xl'>
              <span className='text-royal-gold font-bold tracking-widest text-sm uppercase mb-3 block'>
                Don't Miss Out
              </span>
              <h2 className='text-2xl md:text-3xl font-extrabold text-slate-900 mb-4'>
                Join Our Royal List
              </h2>
              <p className='text-slate-600 text-base md:text-lg leading-relaxed'>
                Unlock exclusive seasonal offers, cleaning tips, and a{' '}
                <span className='font-bold text-royal-green'>10% discount</span>{' '}
                on your first deep clean.
              </p>
            </div>

            {/* Mobile: 100% width (w-full), Tablet: 50% width (md:w-1/2), Desktop: auto */}
            <div className='w-full md:w-1/2 lg:w-auto mx-auto lg:mx-0'>
              <form
                className='flex w-full lg:w-auto flex-col sm:flex-row gap-3'
                onSubmit={(e) => handleFormSubmit(e, 'subscribe')}
              >
                <div className='relative w-full'>
                  <Mail className='absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5' />
                  <input
                    type='email'
                    placeholder='Enter your email address'
                    className='pl-12 pr-5 py-4 w-full lg:w-80 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none transition-all text-sm md:text-base'
                    required
                  />
                </div>
                <button className='w-full sm:w-auto bg-royal-green hover:bg-royal-dark text-white px-10 py-4 rounded-full font-bold transition-all shadow-lg shadow-royal-green/20 hover:shadow-royal-green/40 whitespace-nowrap active:scale-95 text-sm md:text-base'>
                  Sign Up
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* --- Why Choose Us --- */}
      <section className='py-24 bg-slate-900 text-white overflow-hidden'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
            <div className='text-center lg:text-left'>
              <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold mb-8 leading-tight'>
                Why Trust <br />
                <span className='text-royal-green'>The Queen?</span>
              </h2>
              <ul className='space-y-6'>
                <ListItem text="Eco-friendly 'Green' cleaning options available upon request." />
                <ListItem text='Professional, vetted, and trained staff.' />
                <ListItem text='Serving the entire DMV area (DC, MD, VA).' />
                <ListItem text='100% Satisfaction Guarantee.' />
              </ul>
            </div>
            <div className='relative group'>
              <div className='absolute inset-0 bg-royal-green rounded-2xl rotate-3 opacity-20 group-hover:rotate-6 transition-transform duration-500'></div>
              <div className='absolute inset-0 bg-royal-gold rounded-2xl -rotate-3 opacity-20 group-hover:-rotate-6 transition-transform duration-500'></div>
              <img
                src={cleanerImage}
                alt='DMV Queen of Clean Professional'
                className='relative rounded-2xl shadow-2xl w-full h-auto object-cover border-4 border-slate-800 transform transition-transform duration-500 group-hover:scale-[1.02]'
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- Contact Section --- */}
      <section id='contact' className='py-24 bg-green-50/50'>
        <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row'>
            {/* Left/Top Side (Green Info) */}
            {/* Reduced padding for mobile/tablet (p-6/p-8) vs desktop (p-12) */}
            <div className='relative p-6 md:p-8 lg:p-12 lg:w-2/5 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-royal-green to-[#065f46] text-white text-center lg:text-left'>
              <div
                className='absolute inset-0 opacity-10 pointer-events-none'
                style={{
                  backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              ></div>
              <div className='absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none'></div>
              <div className='absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-royal-gold/20 rounded-full blur-2xl pointer-events-none'></div>

              <div className='relative z-10'>
                <h2 className='text-3xl lg:text-4xl font-extrabold mb-2 tracking-tight'>
                  Contact Us
                </h2>
                <div className='w-12 h-1 bg-royal-gold rounded-full mb-6 mx-auto lg:mx-0'></div>

                {/* Reduced margin-bottom on mobile */}
                <p className='mb-6 lg:mb-10 text-green-50 text-base md:text-lg leading-relaxed font-light'>
                  Ready for a spotless space? Reach out today for your free
                  royal estimate.
                </p>

                {/* Reduced vertical spacing between items on mobile */}
                <div className='space-y-4 lg:space-y-8'>
                  <div className='flex flex-col items-center lg:flex-row lg:items-start gap-5 group'>
                    <div className='w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10 shadow-lg group-hover:bg-white/20 transition-all duration-300'>
                      <Phone className='w-5 h-5 text-royal-gold' />
                    </div>
                    <div>
                      <p className='text-xs font-bold text-green-200 uppercase tracking-wider mb-1'>
                        Call Us
                      </p>
                      <a
                        href='tel:2025698373'
                        className='font-bold text-lg md:text-xl tracking-tight hover:text-royal-gold transition-colors'
                      >
                        202-569-8373
                      </a>
                    </div>
                  </div>

                  <div className='flex flex-col items-center lg:flex-row lg:items-start gap-5 group'>
                    <div className='w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10 shadow-lg group-hover:bg-white/20 transition-all duration-300'>
                      <MapPin className='w-5 h-5 text-royal-gold' />
                    </div>
                    <div>
                      <p className='text-xs font-bold text-green-200 uppercase tracking-wider mb-1'>
                        Service Area
                      </p>
                      <span className='font-medium text-base md:text-lg'>
                        Washington DC, MD & VA
                      </span>
                    </div>
                  </div>

                  <div className='flex flex-col items-center lg:flex-row lg:items-start gap-5 group'>
                    <div className='w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10 shadow-lg group-hover:bg-white/20 transition-all duration-300'>
                      <Mail className='w-5 h-5 text-royal-gold' />
                    </div>
                    <div className='overflow-hidden'>
                      <p className='text-xs font-bold text-green-200 uppercase tracking-wider mb-1'>
                        Email Us
                      </p>
                      <span className='font-medium text-base md:text-lg break-all'>
                        dmvqueenofclean@gmail.com
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reduced margin-top for bottom section */}
              <div className='relative z-10 mt-8 lg:mt-12 pt-8 border-t border-white/10'>
                <div className='flex items-center justify-center lg:justify-start gap-3'>
                  <span className='relative flex h-2.5 w-2.5'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
                    <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400'></span>
                  </span>
                  <p className='text-xs md:text-sm font-medium text-green-50 tracking-wide'>
                    Monday - Saturday: 8am - 6pm
                  </p>
                </div>
              </div>
            </div>

            {/* Right/Bottom Side (White Form) */}
            <div className='p-8 m-auto md:p-12 lg:w-3/5 bg-white'>
              <form
                className='space-y-5'
                onSubmit={(e) => handleFormSubmit(e, 'contact')}
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                  <div>
                    <label className='block text-xs md:text-sm font-bold text-slate-700 mb-1 px-1'>
                      First Name
                    </label>
                    <input
                      type='text'
                      className='w-full px-4 md:px-5 py-4 border border-slate-200 bg-slate-50 rounded-full focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none transition-all text-sm md:text-base'
                      placeholder='Jane'
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-xs md:text-sm font-bold text-slate-700 mb-1 px-1'>
                      Last Name
                    </label>
                    <input
                      type='text'
                      className='w-full px-4 md:px-5 py-4 border border-slate-200 bg-slate-50 rounded-full focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none transition-all text-sm md:text-base'
                      placeholder='Doe'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-xs md:text-sm font-bold text-slate-700 mb-1 px-1'>
                    Email
                  </label>
                  <input
                    type='email'
                    className='w-full px-4 md:px-5 py-4 border border-slate-200 bg-slate-50 rounded-full focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none transition-all text-sm md:text-base'
                    placeholder='jane@example.com'
                    required
                  />
                </div>

                <div>
                  <label className='block text-xs md:text-sm font-bold text-slate-700 mb-1 px-1'>
                    Service Needed
                  </label>
                  <div className='relative'>
                    <select className='w-full px-4 md:px-5 py-4 border border-slate-200 bg-slate-50 rounded-full focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none appearance-none transition-all text-sm md:text-base'>
                      <option>Residential Cleaning</option>
                      <option>Commercial Cleaning</option>
                      <option>Move-In / Move-Out</option>
                    </select>
                    <ArrowRight className='absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90' />
                  </div>
                </div>

                {/* Button with px-12 to give text room */}
                <button className='w-full sm:w-auto sm:min-w-[200px] px-12 mx-auto bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-full transition-all shadow-lg hover:shadow-xl mt-12 flex justify-center items-center gap-2 group text-xs sm:text-sm md:text-base'>
                  Request Free Estimate
                  <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className='bg-slate-900 text-white pt-16 pb-8 relative overflow-hidden'>
        <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-royal-green via-teal-500 to-royal-gold'></div>
        <div
          className='absolute inset-0 opacity-[0.03]'
          style={{
            backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        ></div>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
          {/* Footer Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12 text-center lg:text-left'>
            <div className='space-y-4 flex flex-col items-center lg:items-start'>
              <div className='flex items-center gap-2'>
                <div className='bg-royal-green/20 p-2 rounded-lg border border-royal-green/30'>
                  <Sparkles className='h-5 w-5 text-royal-green' />
                </div>
                <div>
                  <h1 className='text-lg font-extrabold tracking-tight text-white leading-none'>
                    DMV QUEEN
                  </h1>
                  <span className='text-[10px] font-bold text-royal-gold tracking-[0.2em] uppercase'>
                    Of Clean
                  </span>
                </div>
              </div>
              <p className='text-slate-400 text-sm leading-relaxed max-w-xs'>
                Bringing royalty standard cleaning to homes and businesses
                across Washington DC, Maryland, and Virginia.
              </p>
            </div>

            <div>
              <h4 className='font-bold text-white mb-6 tracking-wide uppercase text-sm'>
                Quick Links
              </h4>
              <ul className='space-y-3 text-sm text-slate-400'>
                <li>
                  <button
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                    className='hover:text-royal-gold transition-colors flex items-center justify-center lg:justify-start gap-2 group w-full'
                  >
                    <span className='w-1.5 h-1.5 bg-royal-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity'></span>
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={openContact}
                    className='hover:text-royal-gold transition-colors flex items-center justify-center lg:justify-start gap-2 group w-full'
                  >
                    <span className='w-1.5 h-1.5 bg-royal-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity'></span>
                    Get an Estimate
                  </button>
                </li>
                <li>
                  <button
                    onClick={openSubscribe}
                    className='hover:text-royal-gold transition-colors flex items-center justify-center lg:justify-start gap-2 group w-full'
                  >
                    <span className='w-1.5 h-1.5 bg-royal-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity'></span>
                    Special Offers
                  </button>
                </li>
              </ul>
            </div>

            {/* Connect (Socials) - Centered in 2nd row on tablet */}
            <div className='md:col-span-2 lg:col-span-1'>
              <h4 className='font-bold text-white mb-6 tracking-wide uppercase text-sm'>
                Connect With Us
              </h4>
              <div className='flex gap-4 mb-6 justify-center lg:justify-start'>
                <a
                  href='#'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-royal-green hover:text-white transition-all'
                >
                  <Facebook className='w-5 h-5' />
                </a>
                <a
                  href='#'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-royal-green hover:text-white transition-all'
                >
                  <Instagram className='w-5 h-5' />
                </a>
                <a
                  href='#'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-royal-green hover:text-white transition-all'
                >
                  <Twitter className='w-5 h-5' />
                </a>
              </div>
              <p className='text-slate-500 text-xs'>
                Business Hours: Mon - Sat, 8am - 6pm
              </p>
            </div>
          </div>

          <div className='border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left'>
            <p className='text-slate-500 text-xs'>
              &copy; {new Date().getFullYear()} DMV Queen Of Clean, LLC. All
              Rights Reserved.
            </p>
            <div className='flex gap-6 text-xs text-slate-500 justify-center md:justify-start w-full md:w-auto'>
              <a href='#' className='hover:text-slate-300 transition-colors'>
                Privacy Policy
              </a>
              <a href='#' className='hover:text-slate-300 transition-colors'>
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const ServiceCard = ({ title, desc, icon, image }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className='group relative overflow-hidden rounded-2xl shadow-lg border border-slate-200 h-64 lg:h-72 cursor-pointer'
  >
    <div className='absolute inset-0'>
      <img
        src={image}
        alt={title}
        className='w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110'
      />
      {/* Overlay: Darker on mobile to help white centered text pop */}
      <div className='absolute inset-0 bg-black/40 lg:bg-transparent'></div>
      {/* Bottom Gradient: Maintained for desktop view */}
      <div className='absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/90 via-black/60 to-transparent'></div>
    </div>

    {/* Centered content for < lg, Left/Bottom for >= lg */}
    <div className='relative h-full p-6 flex flex-col justify-center lg:justify-end z-10 items-center lg:items-start text-center lg:text-left'>
      <div className='flex flex-col lg:flex-row items-center gap-3 mb-2'>
        <div className='bg-white/20 backdrop-blur-md p-2 rounded-lg border border-white/30 shadow-sm'>
          {icon}
        </div>
        <h3 className='text-xl font-bold text-white shadow-sm leading-tight'>
          {title}
        </h3>
      </div>

      <p className='text-slate-200 text-sm font-medium leading-relaxed shadow-sm opacity-90 mt-2 lg:mt-0 lg:pl-1 lg:border-l-2 border-royal-gold'>
        &nbsp;{desc}
      </p>
    </div>
  </motion.div>
);

const ListItem = ({ text }) => (
  <li className='flex items-start justify-center lg:justify-start gap-4'>
    <div className='mt-1 bg-royal-green/10 p-1 rounded-full'>
      <CheckCircle className='w-5 h-5 text-royal-green flex-shrink-0' />
    </div>
    <span className='text-base md:text-lg opacity-90 text-slate-300 font-light'>
      {text}
    </span>
  </li>
);

export default App;
