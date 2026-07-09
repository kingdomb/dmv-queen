import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Send, X, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';

const MotionDiv = motion.div;

const SUGGESTED_QUESTIONS = [
  'What cleaning services do you offer?',
  'How much does a cleaning cost?',
  'Do you serve my area?',
  'How do I book a cleaning?',
];

const OPENING =
  "Hi there! 👋 I'm the DMV Queen of Clean assistant. I can help with our services, pricing, availability, and getting you a free estimate. What can I help you with?";

const markdownComponents = {
  strong: (props) => <strong className='text-royal-green font-bold' {...props} />,
  a: (props) => <a className='text-royal-green font-medium underline break-words' target='_blank' rel='noreferrer' {...props} />,
  ul: (props) => <ul className='list-disc pl-4 space-y-1 my-2' {...props} />,
  ol: (props) => <ol className='list-decimal pl-4 space-y-1 my-2' {...props} />,
  p: (props) => <p className='mb-2 last:mb-0' {...props} />,
};

const newSessionId = () =>
  (globalThis.crypto?.randomUUID?.() ??
    `sess-${Date.now()}-${Math.random().toString(16).slice(2)}`);

export default function ChatInterface({ isOpen, onClose, onRequestBooking }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: OPENING }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // End-chat + feedback flow
  const [ending, setEnding] = useState(false);      // showing the rating panel
  const [rating, setRating] = useState(null);       // 'up' | 'down' | null
  const [comment, setComment] = useState('');
  const [feedbackDone, setFeedbackDone] = useState(false);
  const sessionId = useRef(newSessionId());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Reset to a brand-new session (called after the window has closed).
  const resetSession = () => {
    setMessages([{ role: 'assistant', content: OPENING }]);
    setInput('');
    setEnding(false);
    setRating(null);
    setComment('');
    setFeedbackDone(false);
    sessionId.current = newSessionId();
  };

  // Close the window, then quietly reset once the exit animation has played so
  // the next open starts a fresh session (and the reset isn't seen mid-close).
  const finishAndClose = () => {
    onClose();
    setTimeout(resetSession, 350);
  };

  const sendFeedback = async () => {
    try {
      await supabase.functions.invoke('chat-feedback', {
        body: {
          sessionId: sessionId.current,
          rating,
          comment: comment.trim(),
          messageCount: messages.length,
          transcript: messages.map((m) => ({ role: m.role, content: m.content })),
        },
      });
    } catch {
      // Never block closing on a feedback failure.
    }
  };

  const handleSubmitFeedback = async () => {
    setFeedbackDone(true);        // show the thank-you immediately
    sendFeedback();               // fire-and-forget; closing shouldn't wait
    setTimeout(finishAndClose, 1100);
  };

  useEffect(() => {
    // Only auto-scroll to the latest once a conversation is underway, so the
    // opening greeting stays visible from the top when the chat first opens.
    if (messages.length > 1 || loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const handleSend = async (messageText) => {
    const text = (messageText || input).trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        },
      });
      if (error) throw error;
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "Sorry, I'm having trouble connecting right now. Please try again in a moment, or reach us through our contact form and we'll be glad to help!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  const showSuggestions = messages.length === 1 && !loading;

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionDiv
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className='fixed z-50 flex flex-col overflow-hidden bg-white rounded-2xl shadow-2xl border border-slate-200 top-4 bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[400px] lg:top-auto lg:bottom-6 lg:h-[82vh] lg:max-h-[720px]'
        >
          {/* Header */}
          <div className='bg-royal-green text-white p-4 flex justify-between items-center'>
            <div className='flex items-center gap-2.5'>
              <span className='relative flex h-2.5 w-2.5'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-royal-gold opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-royal-gold'></span>
              </span>
              <div className='leading-tight'>
                <h3 className='font-serif font-bold text-base'>DMV Queen of Clean</h3>
                <p className='text-[11px] text-green-100'>Cleaning Assistant • Online</p>
              </div>
            </div>
            <div className='flex items-center gap-1'>
              {!ending && (
                <button
                  onClick={() => setEnding(true)}
                  className='text-[11px] font-semibold text-green-100 hover:text-white border border-green-100/40 hover:border-white rounded-full px-2.5 py-1 transition-colors'
                >
                  End chat
                </button>
              )}
              <button
                onClick={onClose}
                aria-label='Minimize chat'
                title='Minimize'
                className='text-green-100 hover:text-white transition-colors p-1'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
          </div>

          {!ending && (
           <>
          {/* Messages */}
          <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50'>
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm break-words ${
                    msg.role === 'user'
                      ? 'bg-royal-green text-white rounded-br-sm'
                      : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className='whitespace-pre-wrap'>{msg.content}</p>
                  ) : (
                    <div className='leading-relaxed'>
                      <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {showSuggestions && (
              <div className='space-y-2 pt-1'>
                <p className='text-xs text-slate-400 text-center'>Try asking:</p>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className='w-full text-left text-sm text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 hover:border-royal-green hover:text-royal-green transition-colors'
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className='flex justify-start'>
                <div className='bg-white border border-slate-200 px-3.5 py-3 rounded-2xl rounded-bl-sm shadow-sm'>
                  <div className='flex gap-1'>
                    <span className='w-2 h-2 bg-royal-green/50 rounded-full animate-bounce'></span>
                    <span className='w-2 h-2 bg-royal-green/50 rounded-full animate-bounce [animation-delay:0.15s]'></span>
                    <span className='w-2 h-2 bg-royal-green/50 rounded-full animate-bounce [animation-delay:0.3s]'></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Free estimate CTA */}
          {onRequestBooking && (
            <button
              onClick={onRequestBooking}
              className='mx-3 mt-3 flex items-center justify-center gap-2 bg-royal-gold text-royal-dark font-bold text-sm rounded-xl py-2.5 hover:brightness-95 transition-all'
            >
              <Sparkles className='w-4 h-4' />
              Get a Free Estimate
            </button>
          )}
          <p className='text-center text-[10px] text-slate-400 px-4 pt-1'>
            Opens our booking form so the team can reach you.
          </p>

          {/* Input */}
          <form onSubmit={handleSubmit} className='p-3 flex gap-2'>
            <input
              ref={inputRef}
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Type your question…'
              className='flex-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal-green focus:border-transparent'
            />
            <button
              type='submit'
              disabled={loading || !input.trim()}
              aria-label='Send message'
              className='bg-royal-green text-white w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center hover:bg-royal-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
            >
              <Send className='w-4 h-4' />
            </button>
          </form>
           </>
          )}

          {/* End-chat / feedback panel */}
          {ending && (
            <div className='flex-1 overflow-y-auto p-5 bg-slate-50 flex flex-col'>
              {feedbackDone ? (
                <div className='m-auto text-center'>
                  <div className='text-4xl mb-2'>💚</div>
                  <p className='font-serif font-bold text-royal-green text-lg'>Thanks for your feedback!</p>
                  <p className='text-sm text-slate-500 mt-1'>Take care — we're here whenever you need us.</p>
                </div>
              ) : (
                <>
                  <div className='text-center mb-4'>
                    <h4 className='font-serif font-bold text-royal-green text-lg'>Thanks for chatting! 👋</h4>
                    <p className='text-sm text-slate-500 mt-1'>
                      How was your experience? <span className='text-slate-400'>(optional)</span>
                    </p>
                  </div>

                  <div className='flex justify-center gap-3 mb-4'>
                    <button
                      onClick={() => setRating(rating === 'up' ? null : 'up')}
                      className={`flex flex-col items-center gap-1 w-24 py-3 rounded-xl border transition-colors ${
                        rating === 'up'
                          ? 'bg-royal-green text-white border-royal-green'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-royal-green'
                      }`}
                    >
                      <ThumbsUp className='w-6 h-6' />
                      <span className='text-xs font-semibold'>Helpful</span>
                    </button>
                    <button
                      onClick={() => setRating(rating === 'down' ? null : 'down')}
                      className={`flex flex-col items-center gap-1 w-24 py-3 rounded-xl border transition-colors ${
                        rating === 'down'
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-red-400'
                      }`}
                    >
                      <ThumbsDown className='w-6 h-6' />
                      <span className='text-xs font-semibold'>Not helpful</span>
                    </button>
                  </div>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder='Any comments to help us improve? (optional)'
                    className='w-full text-sm text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-royal-green focus:border-transparent'
                  />

                  <div className='mt-auto pt-4 space-y-2'>
                    <button
                      onClick={handleSubmitFeedback}
                      className='w-full bg-royal-green text-white font-bold text-sm rounded-xl py-2.5 hover:bg-royal-dark transition-colors'
                    >
                      Submit &amp; close
                    </button>
                    <div className='flex justify-between text-xs'>
                      <button
                        onClick={() => setEnding(false)}
                        className='text-slate-500 hover:text-royal-green px-2 py-1'
                      >
                        ← Back to chat
                      </button>
                      <button
                        onClick={finishAndClose}
                        className='text-slate-400 hover:text-slate-600 px-2 py-1'
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
