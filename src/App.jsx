import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  CheckCircle,
  Facebook,
  Gift,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Phone,
  Sparkles,
  Star,
  Tag,

  X,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

// --- IMAGES ---
import moveInImg from './assets/images/clean-apartment.webp'
import commercialImg from './assets/images/clean-office.jpg'
import logoImg from './assets/images/logo-head-transparent-nav-image.png'
import cleanerImage from './assets/images/placeholder-cleaner.jpg'
import residentialImg from './assets/images/real-livingroom.jpg'
import luxuryHeroImg from './assets/images/luxury-hero.png'

// --- HERO BACKGROUND IMAGES ---
import mobileHeroImg from './assets/images/cleaning-counter.webp'
import combinedHeroImg from './assets/images/combined-hero.png'

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
                <h3 className='text-lg md:text-2xl font-serif font-extrabold text-slate-900 inline-block relative leading-tight'>
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

// --- IMAGE RESIZE UTILITY ---
const resizeImage = (file, maxDim = 800, quality = 0.6) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height && width > maxDim) { height *= maxDim / width; width = maxDim; }
        else if (height > maxDim) { width *= maxDim / height; height = maxDim; }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Modal Logic
  const [activeModal, setActiveModal] = useState(null);
  const [successType, setSuccessType] = useState('contact');

  // --- Contact Form State ---
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', serviceType: 'Residential Cleaning', message: '', phone: '',
  });
  const [images, setImages] = useState([]); // array of { file, preview, base64 }
  const [formStatus, setFormStatus] = useState('idle'); // idle | loading | success | error
  const [formError, setFormError] = useState('');

  // --- Subscribe Form State ---
  const [subEmail, setSubEmail] = useState('');
  const [subName, setSubName] = useState('');
  const [honeypot, setHoneypot] = useState('');

  // --- reCAPTCHA ---
  const recaptchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState('');

  useEffect(() => {
    if (activeModal !== 'contact') return;
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (!siteKey) return;
    // Avoid loading multiple scripts
    if (document.querySelector('script[src*="recaptcha/enterprise"]')) {
      if (window.grecaptcha && window.grecaptcha.enterprise) {
        window.grecaptcha.enterprise.ready(() => {
          const container = document.getElementById('recaptcha-container-dmv');
          if (container && !container.hasChildNodes()) {
            recaptchaRef.current = window.grecaptcha.enterprise.render('recaptcha-container-dmv', {
              sitekey: siteKey,
              callback: (token) => setCaptchaToken(token),
            });
          }
        });
      }
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/enterprise.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.grecaptcha.enterprise.ready(() => {
        const container = document.getElementById('recaptcha-container-dmv');
        if (container && !container.hasChildNodes()) {
          recaptchaRef.current = window.grecaptcha.enterprise.render('recaptcha-container-dmv', {
            sitekey: siteKey,
            callback: (token) => setCaptchaToken(token),
          });
        }
      });
    };
    document.body.appendChild(script);
  }, [activeModal]);

  // --- Image Upload Handler ---
  const handleImageUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      setFormError('Maximum 5 images allowed');
      return;
    }
    setFormError('');
    const newImages = await Promise.all(
      files.map(async (file) => {
        const base64 = await resizeImage(file);
        return { file, preview: URL.createObjectURL(file), base64 };
      })
    );
    setImages((prev) => [...prev, ...newImages]);
  }, [images.length]);

  const removeImage = useCallback((index) => {
    setImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  }, []);

  // --- Form Field Handler ---
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openContact = () => {
    setActiveModal('contact');
    setIsMenuOpen(false);
  };

  const openSubscribe = () => {
    setActiveModal('subscribe');
    setIsMenuOpen(false);
  };

  const resetForms = () => {
    setFormData({ firstName: '', lastName: '', email: '', serviceType: 'Residential Cleaning', message: '', phone: '' });
    setImages([]);
    setFormStatus('idle');
    setFormError('');
    setCaptchaToken('');
    setSubEmail('');
    setSubName('');
    setHoneypot('');
  };

  const closeModal = () => {
    setActiveModal(null);
    resetForms();
  };

  // --- Contact Submit ---
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!captchaToken) { setFormError('Please complete the CAPTCHA'); return; }
    setFormStatus('loading');
    setFormError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: images.map((img) => img.base64),
          'g-recaptcha-response': captchaToken,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to send');
      setFormStatus('success');
      setActiveModal('success');
      setSuccessType('contact');
    } catch (err) {
      setFormError(err.message);
      setFormStatus('error');
    }
  };

  // --- Subscribe Submit ---
  const handleSubscribeSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('loading');
    setFormError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail, name: subName, website: honeypot, discountCode: 'ROYAL10' }),
      });
      if (!res.ok) throw new Error('Failed');
      setActiveModal('success');
      setSuccessType('subscribe');
    } catch (err) {
      setFormError(err.message);
      setFormStatus('error');
    }
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
          onSubmit={handleContactSubmit}
        >
          <div className='grid grid-cols-2 gap-3 md:gap-4'>
            <div>
              <label className='block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1'>
                First Name
              </label>
              <input
                type='text'
                name='firstName'
                value={formData.firstName}
                onChange={handleFieldChange}
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
                name='lastName'
                value={formData.lastName}
                onChange={handleFieldChange}
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
              name='email'
              value={formData.email}
              onChange={handleFieldChange}
              className='w-full px-4 py-3 md:px-5 text-sm md:text-base bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none transition-all'
              placeholder='jane@example.com'
              required
            />
          </div>
          <div>
            <label className='block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1'>
              Phone (optional)
            </label>
            <input
              type='tel'
              name='phone'
              value={formData.phone}
              onChange={handleFieldChange}
              className='w-full px-4 py-3 md:px-5 text-sm md:text-base bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none transition-all'
              placeholder='(202) 555-0100'
            />
          </div>
          <div>
            <label className='block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1'>
              Service Type
            </label>
            <div className='relative'>
              <select
                name='serviceType'
                value={formData.serviceType}
                onChange={handleFieldChange}
                className='w-full px-4 py-3 md:px-5 text-sm md:text-base bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none appearance-none cursor-pointer'
              >
                <option>Residential Cleaning</option>
                <option>Commercial Cleaning</option>
                <option>Move-In / Move-Out</option>
              </select>
              <ArrowRight className='absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none' />
            </div>
          </div>
          <div>
            <label className='block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1'>
              Message / Details
            </label>
            <textarea
              name='message'
              value={formData.message}
              onChange={handleFieldChange}
              rows={3}
              className='w-full px-4 py-3 md:px-5 text-sm md:text-base bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none transition-all resize-none'
              placeholder='Tell us about your space, special requests, preferred schedule...'
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className='block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1'>
              Upload Photos (optional, max 5)
            </label>
            <label className='flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-royal-green/50 hover:bg-slate-100 transition-all text-sm text-slate-500'>
              <ArrowRight className='w-4 h-4 -rotate-90' />
              <span>Choose images...</span>
              <input
                type='file'
                accept='image/*'
                multiple
                onChange={handleImageUpload}
                className='hidden'
              />
            </label>
            {images.length > 0 && (
              <div className='flex flex-wrap gap-2 mt-3'>
                {images.map((img, i) => (
                  <div key={i} className='relative group/thumb'>
                    <img src={img.preview} alt={`Upload ${i + 1}`} className='w-16 h-16 object-cover rounded-xl border border-slate-200' />
                    <button
                      type='button'
                      onClick={() => removeImage(i)}
                      className='absolute -top-2 -right-2 w-5 h-5 bg-royal-gold text-white rounded-full text-xs flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover/thumb:opacity-100 transition-opacity shadow-sm'
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* reCAPTCHA */}
          <div id='recaptcha-container-dmv' className='flex justify-center my-4'></div>

          {/* Error Message */}
          {formError && (
            <p className='text-red-500 text-sm text-center'>{formError}</p>
          )}

          <button
            type='submit'
            disabled={formStatus === 'loading'}
            className='w-1/2 mx-auto bg-royal-green hover:bg-royal-dark text-white font-bold py-3 md:py-4 rounded-full transition-all shadow-lg hover:shadow-xl flex justify-center items-center gap-2 mt-4 text-sm md:text-base disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {formStatus === 'loading' ? (
              <>
                <svg className='animate-spin w-4 h-4' viewBox='0 0 24 24' fill='none'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                </svg>
                Sending...
              </>
            ) : (
              <>
                Send Request
                <ArrowRight className='w-4 h-4' />
              </>
            )}
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
          onSubmit={handleSubscribeSubmit}
        >
          {/* Honeypot field */}
          <input name='website' value={honeypot} onChange={(e) => setHoneypot(e.target.value)} style={{ position: 'absolute', left: '-9999px' }} tabIndex={-1} autoComplete='off' />

          <div>
            <label className='block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1'>
              Your Name
            </label>
            <input
              type='text'
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              className='w-full px-4 py-3 md:px-5 text-sm md:text-base bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none transition-all'
              placeholder='Jane Doe'
            />
          </div>
          <div className='relative'>
            <Mail className='absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5' />
            <input
              type='email'
              value={subEmail}
              onChange={(e) => setSubEmail(e.target.value)}
              placeholder='Enter your email address'
              className='pl-12 pr-5 py-3 md:py-4 w-full bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none transition-all text-sm md:text-base'
              required
            />
          </div>

          {/* Error Message */}
          {formError && (
            <p className='text-red-500 text-sm text-center'>{formError}</p>
          )}

          <button
            type='submit'
            disabled={formStatus === 'loading'}
            className='w-1/2 mx-auto bg-gradient-to-r from-royal-green to-teal-600 hover:to-royal-green text-white font-bold py-3 md:py-4 rounded-full transition-all shadow-lg hover:shadow-xl flex justify-center items-center gap-2 text-sm md:text-base disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {formStatus === 'loading' ? (
              <>
                <svg className='animate-spin w-4 h-4' viewBox='0 0 24 24' fill='none'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                </svg>
                Subscribing...
              </>
            ) : (
              <>
                Claim Offer
                <Tag className='w-4 h-4' />
              </>
            )}
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
            <div className='flex items-center gap-3'>
              <img src={logoImg} alt='DMV Queen Logo' className='h-16 w-auto drop-shadow-sm' />
              <div className='flex flex-col justify-center translate-y-1'>
                <div className='font-serif text-royal-dark tracking-wide leading-none flex items-baseline'>
                  <span className='text-3xl font-semibold'>Q</span>
                  <span className='text-xl font-semibold md:text-2xl'>UEEN</span>
                  <span className='text-base italic px-1.5 font-medium'>of</span>
                  <span className='text-3xl font-semibold'>C</span>
                  <span className='text-xl font-semibold md:text-2xl'>LEAN</span>
                </div>
                <div className='font-serif text-royal-dark text-sm md:text-base font-bold tracking-[0.3em] text-center mt-1 leading-none pl-1'>
                  LLC
                </div>
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

      {/* --- HERO SECTION (Modern Split Layout) --- */}
      <header className='relative pt-28 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-royal-beige'>
        {/* Background Decorative Orbs */}
        <motion.div
          animate={{ y: [0, -40, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className='absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-royal-gold/10 rounded-full blur-[100px] pointer-events-none'
        />
        <motion.div
          animate={{ y: [0, 40, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className='absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-royal-green/10 rounded-full blur-[100px] pointer-events-none'
        />

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center'>
            
            {/* Left Column: Text & CTA */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className='text-center lg:text-left pt-10 lg:pt-0'
            >
              <span className='inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/80 border border-royal-green/20 text-royal-dark text-xs md:text-sm font-bold tracking-wide uppercase mb-8 shadow-sm backdrop-blur-sm'>
                <Star className='w-4 h-4 text-royal-gold fill-royal-gold' />
                Royalty Standard Cleaning
              </span>

              <h1 className='text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-extrabold tracking-tight text-royal-dark mb-6 leading-[1.1] drop-shadow-sm'>
                Your Home <br className="hidden lg:block"/> Deserves the <br />
                <span className='relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-royal-gold via-yellow-400 to-royal-gold bg-[length:200%_auto] animate-gradient mt-2'>
                  Royal Treatment
                  <CleanSparkle color='gold' />
                </span>
              </h1>

              <p className='text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0'>
                We don’t just clean homes; our services are designed to leave your space refreshed, refined, and renewed to a royal standard.
              </p>

              <div className='flex flex-col sm:flex-row justify-center lg:justify-start gap-4'>
                <button
                  onClick={openContact}
                  className='w-full sm:w-auto px-8 py-4 bg-royal-green hover:bg-royal-dark text-white rounded-full font-bold text-lg shadow-xl shadow-royal-green/30 transition-all transform hover:-translate-y-1 hover:shadow-2xl'
                >
                  Book Your Cleaning
                </button>

                <button
                  onClick={openSubscribe}
                  className='w-full sm:w-auto px-8 py-4 bg-white text-royal-dark border-2 border-slate-200 hover:border-royal-gold hover:text-royal-gold rounded-full font-bold text-lg transition-all flex justify-center items-center gap-2 hover:bg-slate-50'
                >
                  <Gift className='w-5 h-5' />
                  Get 10% Off
                </button>
              </div>
            </motion.div>

            {/* Right Column: Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className='relative group flex justify-center lg:justify-end items-center h-full px-4 sm:px-0 mt-8 lg:mt-0'
            >
              <div className='relative w-full max-w-md lg:max-w-lg xl:max-w-xl aspect-[4/5]'>
                {/* Decorative Offset Frame */}
                <div className='absolute inset-0 bg-gradient-to-br from-royal-gold to-orange-400 rounded-t-[10rem] rounded-b-[3rem] transform translate-x-4 translate-y-4 opacity-70 transition-transform duration-700 group-hover:translate-x-6 group-hover:translate-y-6'></div>
                
                {/* Image Container */}
                <div className='absolute inset-0 rounded-t-[10rem] rounded-b-[3rem] overflow-hidden border-4 border-white shadow-2xl z-10 bg-white'>
                  <img
                    src={residentialImg}
                    alt='Beautiful clean living room'
                    className='w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105'
                  />
                  {/* Subtle inner shadow overlay */}
                  <div className='absolute inset-0 rounded-t-[10rem] rounded-b-[3rem] shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none'></div>
                </div>

                {/* Floating "Satisfaction" Badge */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className='absolute -bottom-6 -left-6 z-20 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100'
                >
                  <div className='bg-royal-gold/20 p-2 rounded-full'>
                    <CheckCircle className='w-6 h-6 text-royal-gold' />
                  </div>
                  <div>
                    <p className='text-xs font-bold text-slate-500 uppercase tracking-wider'>Guarantee</p>
                    <p className='text-sm font-bold text-royal-dark'>100% Satisfaction</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>
      </header>

      {/* --- Services Section --- */}
      <motion.section 
        className='py-24 bg-white relative'
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl lg:text-4xl font-serif font-bold text-slate-900 mb-4'>
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
      </motion.section>

      {/* --- Subscribe Banner --- */}
      <motion.section
        id='subscribe'
        className='py-12 bg-gradient-to-r from-royal-green/5 to-teal-50 border-y border-slate-100 relative overflow-hidden'
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <div className='absolute top-0 left-0 w-32 h-32 bg-royal-green/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2'></div>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
          <div className='bg-white rounded-3xl shadow-xl p-8 md:p-12 flex flex-col lg:flex-row items-center lg:gap-12 gap-8 border border-slate-100'>
            <div className='text-center lg:text-left max-w-xl'>
              <span className='text-royal-gold font-bold tracking-widest text-sm uppercase mb-3 block'>
                Don't Miss Out
              </span>
              <h2 className='text-2xl md:text-3xl font-serif font-extrabold text-slate-900 mb-4'>
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
                onSubmit={handleSubscribeSubmit}
              >
                <input name='website' value={honeypot} onChange={(e) => setHoneypot(e.target.value)} style={{ position: 'absolute', left: '-9999px' }} tabIndex={-1} autoComplete='off' />
                <div className='relative w-full'>
                  <Mail className='absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5' />
                  <input
                    type='email'
                    value={subEmail}
                    onChange={(e) => setSubEmail(e.target.value)}
                    placeholder='Enter your email address'
                    className='pl-12 pr-5 py-4 w-full lg:w-80 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none transition-all text-sm md:text-base'
                    required
                  />
                </div>
                <button
                  type='submit'
                  disabled={formStatus === 'loading'}
                  className='w-full sm:w-auto bg-royal-green hover:bg-royal-dark text-white px-10 py-4 rounded-full font-bold transition-all shadow-lg shadow-royal-green/20 hover:shadow-royal-green/40 whitespace-nowrap active:scale-95 text-sm md:text-base disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  {formStatus === 'loading' ? 'Sending...' : 'Sign Up'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- Why Choose Us --- */}
      <motion.section 
        className='py-28 bg-royal-dark text-royal-beige relative overflow-hidden'
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className='absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-royal-gold/10 rounded-full blur-[100px]'></div>
        <div className='absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-royal-green/20 rounded-full blur-[100px]'></div>
        
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center'>
            
            {/* Left Content */}
            <div className='text-center lg:text-left z-20'>
              <h2 className='text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-10 leading-tight drop-shadow-sm text-white'>
                Why Trust <br />
                <span className='italic font-light text-royal-gold'>The Queen?</span>
              </h2>
              
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 text-left'>
                <FeatureCard 
                  icon={<Sparkles className='w-6 h-6' />} 
                  title="Eco-Friendly" 
                  desc="'Green' cleaning options available upon request for a safer home." 
                />
                <FeatureCard 
                  icon={<CheckCircle className='w-6 h-6' />} 
                  title="Professional" 
                  desc="Vetted, trained, and dedicated staff delivering royal standards." 
                />
                <FeatureCard 
                  icon={<MapPin className='w-6 h-6' />} 
                  title="Local Service" 
                  desc="Proudly serving Washington DC, Maryland, and Virginia." 
                />
                <FeatureCard 
                  icon={<Star className='w-6 h-6' />} 
                  title="Guaranteed" 
                  desc="100% Satisfaction Guarantee. We aren't satisfied until you are." 
                />
              </div>
            </div>
            
            {/* Right Image element with modern styling */}
            <div className='relative group h-full flex items-center justify-center mt-10 lg:mt-0 z-20 px-2 sm:px-6 mb-4 sm:mb-8'>
              {/* Thinner, responsive offset box */}
              <div className='absolute inset-2 sm:inset-4 bg-gradient-to-br from-royal-gold to-orange-400 rounded-2xl transform translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4 transition-transform duration-500 group-hover:translate-x-4 group-hover:translate-y-4 sm:group-hover:translate-x-6 sm:group-hover:translate-y-6 opacity-80'></div>
              <img
                src={cleanerImage}
                alt='DMV Queen of Clean Professional'
                className='relative z-20 rounded-2xl shadow-xl w-full h-auto max-h-[600px] object-cover border-4 border-royal-dark transform transition-transform duration-500 hover:-translate-y-2 hover:shadow-2xl'
              />
            </div>
            
          </div>
        </div>
      </motion.section>

      {/* --- Contact Section --- */}
      <motion.section 
        id='contact' 
        className='py-24 bg-green-50/50'
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row'>
            {/* Left/Top Side (Green Info) */}
            <div className='relative p-6 md:p-8 lg:p-12 lg:w-2/5 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-royal-green to-[#065f46] text-white'>
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
                <h2 className='text-2xl md:text-3xl lg:text-4xl font-serif font-extrabold mb-2 tracking-tight text-center lg:text-left'>
                  Contact Us
                </h2>
                <div className='w-12 h-1 bg-royal-gold rounded-full mb-4 lg:mb-6 mx-auto lg:mx-0'></div>

                <p className='mb-5 lg:mb-10 text-green-50 text-sm md:text-base lg:text-lg leading-relaxed font-light text-center lg:text-left'>
                  Ready for a spotless space? Reach out today for your free
                  royal estimate.
                </p>

                {/* Contact info — 3-col grid on tablet, stacked rows on mobile, list on desktop */}
                {/* Mobile: centered fit-content column. Tablet: 3-col grid. Desktop: left-aligned list */}
                <div className='flex justify-center md:block'>
                  <div className='flex flex-col gap-3 md:grid md:grid-cols-3 lg:grid-cols-1 lg:gap-5'>
                    <a href='tel:2025698373' className='flex items-center gap-3 lg:gap-4 bg-white/5 md:bg-white/10 rounded-xl px-4 py-3 lg:p-0 lg:bg-transparent lg:rounded-none group hover:bg-white/15 lg:hover:bg-transparent transition-all'>
                      <div className='w-9 h-9 lg:w-12 lg:h-12 bg-white/10 backdrop-blur-md rounded-lg lg:rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10 shadow-lg group-hover:bg-white/20 transition-all duration-300'>
                        <Phone className='w-4 h-4 lg:w-5 lg:h-5 text-royal-gold' />
                      </div>
                      <div className='text-left'>
                        <p className='text-[9px] lg:text-xs font-bold text-green-200 uppercase tracking-wider leading-tight'>
                          Call Us
                        </p>
                        <span className='font-bold text-sm lg:text-xl tracking-tight group-hover:text-royal-gold transition-colors'>
                          202-569-8373
                        </span>
                      </div>
                    </a>

                    <div className='flex items-center gap-3 lg:gap-4 bg-white/5 md:bg-white/10 rounded-xl px-4 py-3 lg:p-0 lg:bg-transparent lg:rounded-none group hover:bg-white/15 lg:hover:bg-transparent transition-all'>
                      <div className='w-9 h-9 lg:w-12 lg:h-12 bg-white/10 backdrop-blur-md rounded-lg lg:rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10 shadow-lg group-hover:bg-white/20 transition-all duration-300'>
                        <MapPin className='w-4 h-4 lg:w-5 lg:h-5 text-royal-gold' />
                      </div>
                      <div className='text-left'>
                        <p className='text-[9px] lg:text-xs font-bold text-green-200 uppercase tracking-wider leading-tight'>
                          Service Area
                        </p>
                        <span className='font-medium text-sm lg:text-lg'>
                          DC, MD & VA
                        </span>
                      </div>
                    </div>

                    <div className='flex items-center gap-3 lg:gap-4 bg-white/5 md:bg-white/10 rounded-xl px-4 py-3 lg:p-0 lg:bg-transparent lg:rounded-none group hover:bg-white/15 lg:hover:bg-transparent transition-all'>
                      <div className='w-9 h-9 lg:w-12 lg:h-12 bg-white/10 backdrop-blur-md rounded-lg lg:rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10 shadow-lg group-hover:bg-white/20 transition-all duration-300'>
                        <Mail className='w-4 h-4 lg:w-5 lg:h-5 text-royal-gold' />
                      </div>
                      <div className='text-left overflow-hidden'>
                        <p className='text-[9px] lg:text-xs font-bold text-green-200 uppercase tracking-wider leading-tight'>
                          Email Us
                        </p>
                        <span className='font-medium text-xs lg:text-lg'>
                          dmvqueenofclean@gmail.com
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business hours */}
              <div className='relative z-10 mt-5 lg:mt-12 pt-4 lg:pt-8 border-t border-white/10'>
                <div className='flex items-center justify-center lg:justify-start gap-2'>
                  <span className='relative flex h-2 w-2 lg:h-2.5 lg:w-2.5'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
                    <span className='relative inline-flex rounded-full h-2 w-2 lg:h-2.5 lg:w-2.5 bg-green-400'></span>
                  </span>
                  <p className='text-xs font-medium text-green-50 tracking-wide'>
                    Monday - Saturday: 8am - 6pm
                  </p>
                </div>
              </div>
            </div>

            {/* Right/Bottom Side (White Form) */}
            <div className='p-8 m-auto md:p-12 lg:w-3/5 bg-white'>
              <form
                className='space-y-5'
                onSubmit={handleContactSubmit}
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                  <div>
                    <label className='block text-xs md:text-sm font-bold text-slate-700 mb-1 px-1'>
                      First Name
                    </label>
                    <input
                      type='text'
                      name='firstName'
                      value={formData.firstName}
                      onChange={handleFieldChange}
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
                      name='lastName'
                      value={formData.lastName}
                      onChange={handleFieldChange}
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
                    name='email'
                    value={formData.email}
                    onChange={handleFieldChange}
                    className='w-full px-4 md:px-5 py-4 border border-slate-200 bg-slate-50 rounded-full focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none transition-all text-sm md:text-base'
                    placeholder='jane@example.com'
                    required
                  />
                </div>

                <div>
                  <label className='block text-xs md:text-sm font-bold text-slate-700 mb-1 px-1'>
                    Phone (optional)
                  </label>
                  <input
                    type='tel'
                    name='phone'
                    value={formData.phone}
                    onChange={handleFieldChange}
                    className='w-full px-4 md:px-5 py-4 border border-slate-200 bg-slate-50 rounded-full focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none transition-all text-sm md:text-base'
                    placeholder='(202) 555-0100'
                  />
                </div>

                <div>
                  <label className='block text-xs md:text-sm font-bold text-slate-700 mb-1 px-1'>
                    Service Needed
                  </label>
                  <div className='relative'>
                    <select
                      name='serviceType'
                      value={formData.serviceType}
                      onChange={handleFieldChange}
                      className='w-full px-4 md:px-5 py-4 border border-slate-200 bg-slate-50 rounded-full focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none appearance-none transition-all text-sm md:text-base'
                    >
                      <option>Residential Cleaning</option>
                      <option>Commercial Cleaning</option>
                      <option>Move-In / Move-Out</option>
                    </select>
                    <ArrowRight className='absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90' />
                  </div>
                </div>

                <div>
                  <label className='block text-xs md:text-sm font-bold text-slate-700 mb-1 px-1'>
                    Message / Details
                  </label>
                  <textarea
                    name='message'
                    value={formData.message}
                    onChange={handleFieldChange}
                    rows={3}
                    className='w-full px-4 md:px-5 py-4 border border-slate-200 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-royal-green focus:border-transparent outline-none transition-all text-sm md:text-base resize-none'
                    placeholder='Tell us about your space, special requests, preferred schedule...'
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className='block text-xs md:text-sm font-bold text-slate-700 mb-1 px-1'>
                    Upload Photos (optional, max 5)
                  </label>
                  <label className='flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-royal-green/50 hover:bg-slate-100 transition-all text-sm text-slate-500'>
                    <ArrowRight className='w-4 h-4 -rotate-90' />
                    <span>Choose images...</span>
                    <input
                      type='file'
                      accept='image/*'
                      multiple
                      onChange={handleImageUpload}
                      className='hidden'
                    />
                  </label>
                  {images.length > 0 && (
                    <div className='flex flex-wrap gap-2 mt-3'>
                      {images.map((img, i) => (
                        <div key={i} className='relative group/thumb'>
                          <img src={img.preview} alt={`Upload ${i + 1}`} className='w-16 h-16 object-cover rounded-xl border border-slate-200' />
                          <button
                            type='button'
                            onClick={() => removeImage(i)}
                            className='absolute -top-2 -right-2 w-5 h-5 bg-royal-gold text-white rounded-full text-xs flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover/thumb:opacity-100 transition-opacity shadow-sm'
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {formError && (
                  <p className='text-red-500 text-sm text-center'>{formError}</p>
                )}

                {/* Button with px-12 to give text room */}
                <button
                  type='submit'
                  disabled={formStatus === 'loading'}
                  className='w-full sm:w-auto sm:min-w-[200px] px-12 mx-auto bg-royal-dark hover:bg-black text-white font-bold py-4 rounded-full transition-all shadow-lg hover:shadow-xl mt-12 flex justify-center items-center gap-2 group text-xs sm:text-sm md:text-base disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  {formStatus === 'loading' ? (
                    <>
                      <svg className='animate-spin w-4 h-4' viewBox='0 0 24 24' fill='none'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Request Free Estimate
                      <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.section>

      <footer className='bg-royal-dark text-white pt-16 pb-8 relative overflow-hidden'>
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
          <div className='grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 mb-10 md:mb-12'>
            {/* Brand — full width on mobile */}
            <div className='col-span-2 md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left gap-3'>
              <div className='flex items-center gap-3'>
                <img src={logoImg} alt='DMV Queen Logo' className='h-10 md:h-12 w-auto drop-shadow-sm brightness-0 invert opacity-90' />
                <div className='flex flex-col justify-center translate-y-0.5'>
                  <div className='font-serif text-white tracking-wide leading-none flex items-baseline'>
                    <span className='text-xl md:text-2xl font-semibold'>Q</span>
                    <span className='text-base md:text-lg font-semibold'>UEEN</span>
                    <span className='text-xs md:text-sm italic px-1 font-medium'>of</span>
                    <span className='text-xl md:text-2xl font-semibold'>C</span>
                    <span className='text-base md:text-lg font-semibold'>LEAN</span>
                  </div>
                  <div className='font-serif text-white/90 text-[10px] md:text-xs font-bold tracking-[0.3em] text-center mt-0.5 leading-none pl-1'>
                    LLC
                  </div>
                </div>
              </div>
              <p className='text-slate-400 text-xs md:text-sm leading-relaxed max-w-xs'>
                Bringing royalty standard cleaning to homes and businesses
                across Washington DC, Maryland, and Virginia.
              </p>
            </div>

            {/* Quick Links */}
            <div className='text-center md:text-left'>
              <h4 className='font-bold text-white mb-4 md:mb-6 tracking-wide uppercase text-xs md:text-sm'>
                Quick Links
              </h4>
              <ul className='space-y-2 md:space-y-3 text-xs md:text-sm text-slate-400'>
                <li>
                  <button
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                    className='hover:text-royal-gold transition-colors inline-flex items-center gap-2 group'
                  >
                    <span className='w-1.5 h-1.5 bg-royal-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity'></span>
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={openContact}
                    className='hover:text-royal-gold transition-colors inline-flex items-center gap-2 group'
                  >
                    <span className='w-1.5 h-1.5 bg-royal-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity'></span>
                    Get an Estimate
                  </button>
                </li>
                <li>
                  <button
                    onClick={openSubscribe}
                    className='hover:text-royal-gold transition-colors inline-flex items-center gap-2 group'
                  >
                    <span className='w-1.5 h-1.5 bg-royal-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity'></span>
                    Special Offers
                  </button>
                </li>
              </ul>
            </div>

            {/* Connect (Socials) */}
            <div className='text-center md:text-left'>
              <h4 className='font-bold text-white mb-4 md:mb-6 tracking-wide uppercase text-xs md:text-sm'>
                Connect With Us
              </h4>
              <div className='flex gap-3 mb-4 md:mb-6 justify-center md:justify-start'>
                <a
                  href='https://www.facebook.com/DMVQueenOfClean'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:bg-royal-gold hover:text-white transition-all'
                >
                  <Facebook className='w-4 h-4 md:w-5 md:h-5' />
                </a>
                <a
                  href='https://www.instagram.com/dmvqueenofclean_llc/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:bg-royal-gold hover:text-white transition-all'
                >
                  <Instagram className='w-4 h-4 md:w-5 md:h-5' />
                </a>
                <a
                  href='https://www.tiktok.com/@dmvqueenofclean?_r=1&_t=ZP-95mpEAfWt82'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:bg-royal-gold hover:text-white transition-all'
                >
                  <svg className='w-4 h-4 md:w-5 md:h-5' viewBox='0 0 24 24' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.27a8.16 8.16 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.7z' />
                  </svg>
                </a>
              </div>
              <p className='text-slate-500 text-[11px] md:text-xs'>
                Mon - Sat, 8am - 6pm
              </p>
            </div>
          </div>

          <div className='border-t border-white/10 pt-6 md:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-4'>
            <p className='text-slate-500 text-[11px] md:text-xs'>
              &copy; {new Date().getFullYear()} DMV Queen Of Clean, LLC. All
              Rights Reserved.
            </p>
            <div className='flex gap-4 md:gap-6 text-[11px] md:text-xs text-slate-500'>
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
        <h3 className='text-xl font-serif font-bold text-white shadow-sm leading-tight'>
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

const FeatureCard = ({ icon, title, desc }) => (
  <div className='bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 flex flex-col items-start gap-4 group'>
    <div className='p-3 bg-royal-gold/10 text-royal-gold rounded-xl group-hover:scale-110 group-hover:bg-royal-gold/20 transition-all'>
      {icon}
    </div>
    <div>
      <h3 className='text-lg font-serif font-bold text-white mb-2'>{title}</h3>
      <p className='text-royal-beige/80 text-sm leading-relaxed'>{desc}</p>
    </div>
  </div>
);

export default App;
