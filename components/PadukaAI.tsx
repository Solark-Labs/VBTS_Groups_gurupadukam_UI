import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Send, MessageSquare, CalendarCheck, AlertTriangle,
  ArrowRight, CheckCircle2, Share2, Globe
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { POOJA_OCCASIONS, BRAND_CONTACT } from '../constants';
import { TicketCategory, SupportTicket } from '../types';
import { PAN_INDIA_LANGUAGES, LanguageCode, getLanguageMeta } from '../i18n/languages';

interface ChatMsg {
  sender: 'ai' | 'user';
  text: string;
  actionLabel?: string;
  actionRoute?: string;
}

export const PadukaAI: React.FC = () => {
  const {
    purohits,
    user,
    createBooking,
    createTicket,
    triggerNotification,
    addToast,
    language,
    setLanguage,
    t,
  } = useAppContext();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<'chat' | 'book' | 'incident'>('chat');

  // Chat state
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      sender: 'ai',
      text: t('aiWelcome'),
    },
  ]);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].sender === 'ai') {
        return [{ sender: 'ai', text: t('aiWelcome') }];
      }
      return prev;
    });
  }, [language, t]);

  // Quick Book Priest state
  const [qbOccasion, setQbOccasion] = useState(POOJA_OCCASIONS[0]);
  const [qbPurohitId, setQbPurohitId] = useState(purohits[0]?.id || 'pr1');
  const [qbDate, setQbDate] = useState('');
  const [qbTime, setQbTime] = useState('09:00');
  const [qbName, setQbName] = useState(user?.name || '');
  const [qbPhone, setQbPhone] = useState(user?.phone || '');
  const [qbAddress, setQbAddress] = useState(user?.address || '');
  const [qbConfirmedId, setQbConfirmedId] = useState<string | null>(null);

  // Incident / Ticket state
  const [incBookingId, setIncBookingId] = useState('');
  const [incCategory, setIncCategory] = useState<TicketCategory>('Purohit Delay');
  const [incSeverity, setIncSeverity] = useState<SupportTicket['severity']>('Urgent');
  const [incPhone, setIncPhone] = useState(user?.phone || '');
  const [incDesc, setIncDesc] = useState('');
  const [createdTicket, setCreatedTicket] = useState<SupportTicket | null>(null);

  const handleChatSend = (customQuery?: string) => {
    const q = (customQuery ?? input).trim();
    if (!q) return;
    const lower = q.toLowerCase();

    const userMsg: ChatMsg = { sender: 'user', text: q };
    const langMeta = getLanguageMeta(language);
    let reply: ChatMsg = {
      sender: 'ai',
      text: `${langMeta.greeting} (${langMeta.nativeName}) I can help you across all Guru Padukam services! For any ritual (House Warming, Vehicle Pooja, Homa, Last Rites, Abdikam, Mahalaya Paksha), just pay a ₹11 token — Purohits will contact you shortly & we hand-hold every step.`,
      actionLabel: 'Browse Purohits',
      actionRoute: '/purohits',
    };

    // Detect Pan-India language switch or language inquiry
    const matchedLang = PAN_INDIA_LANGUAGES.find(
      l =>
        lower.includes(l.name.toLowerCase()) ||
        lower.includes(l.nativeName.toLowerCase())
    );

    if (lower.includes('language') || lower.includes('bhasha') || lower.includes('भाषा') || lower.includes('భాష') || lower.includes('மொழி')) {
      const list = PAN_INDIA_LANGUAGES.map(l => `${l.nativeName} (${l.name})`).join(', ');
      reply = {
        sender: 'ai',
        text: `${langMeta.greeting} PadukaAI & Guru Padukam support all 14 Pan-India languages: ${list}. You can switch anytime from the header dropdown or your Profile → Language tab!`,
        actionLabel: 'Open Language Settings',
        actionRoute: '/profile',
      };
    } else if (matchedLang && (lower.includes('speak') || lower.includes('switch') || lower.includes('change') || lower.includes('bolo') || lower.includes('in ') || lower === matchedLang.name.toLowerCase())) {
      setLanguage(matchedLang.code);
      reply = {
        sender: 'ai',
        text: `${matchedLang.greeting} Switched website & PadukaAI to ${matchedLang.nativeName} (${matchedLang.name})! How can I assist your sacred ritual today?`,
      };
    } else if (
      lower.includes('apara') || lower.includes('last rite') || lower.includes('abdikam') ||
      lower.includes('masikam') || lower.includes('samvatsarikam') || lower.includes('mahalaya') ||
      q.includes('अपरा') || q.includes('श्राद्ध') || q.includes('అపర') || q.includes('అబ్దికం') || q.includes('அபர')
    ) {
      reply = {
        sender: 'ai',
        text: `${langMeta.greeting} For Last Rites, Masikam, Abdikam, Samvatsarikam & Mahalaya Paksha: our Apara Peetas offer Online, Home Service & Peeta Venue options with 2/3/5 Purohits and customizable Bhojanam (3 or 4 curries & pickles, sweets/hot). You can customize food up to 2 days prior, and we guarantee immediate emergency team swap!`,
        actionLabel: 'Open Apara Peetas',
        actionRoute: '/apara',
      };
    } else if (
      lower.includes('item') || lower.includes('samagri') || lower.includes('gift') ||
      lower.includes('essential') || lower.includes('market') ||
      q.includes('सामग्री') || q.includes('సామగ్రి') || q.includes('பொருட்கள்')
    ) {
      reply = {
        sender: 'ai',
        text: `${langMeta.greeting} Our Marketplace delivers everyday pooja essentials in minutes, return gifts for guests, and ritual kits shipped 30 minutes prior to your ceremony!`,
        actionLabel: 'Open Marketplace',
        actionRoute: '/marketplace',
      };
    } else if (
      lower.includes('delay') || lower.includes('issue') || lower.includes('ticket') ||
      lower.includes('late') || lower.includes('emergency') ||
      q.includes('समस्या') || q.includes('సమస్య') || q.includes('புகார்')
    ) {
      reply = {
        sender: 'ai',
        text: `${langMeta.greeting} I am opening the Incident & Ticket Reporter for you right now so we can notify Admin and trigger an immediate Purohit swap if needed.`,
      };
      setTab('incident');
    } else if (lower.includes('track') || lower.includes('status') || lower.includes('booking id') || q.includes('ट्रैक') || q.includes('ట్రాక్')) {
      reply = {
        sender: 'ai',
        text: `${langMeta.greeting} You can track any Purohit Booking, Apara Seva, or Marketplace Order using your Booking ID OR 10-digit Mobile Number on our Tracker page.`,
        actionLabel: 'Open Booking Tracker',
        actionRoute: '/track-order',
      };
    } else if (
      lower.includes('book') || lower.includes('purohit') || lower.includes('priest') ||
      lower.includes('homa') || lower.includes('vehicle') || lower.includes('house') ||
      q.includes('पूजा') || q.includes('पुरोहित') || q.includes('పూజ') || q.includes('పురోహిత్') || q.includes('பூஜை')
    ) {
      reply = {
        sender: 'ai',
        text: `${langMeta.greeting} You can book a verified Purohit directly in my "Book Priest" tab right here! Pay just ₹11 token and our Purohit will contact you shortly.`,
      };
    } else if (lower.includes('handoff') || lower.includes('dashboard')) {
      reply = {
        sender: 'ai',
        text: `${langMeta.greeting} Purohits can manage ceremonies, schedule 30-min prior pooja items, or trigger an Emergency Locality Handoff in the Purohit Operations Portal.`,
        actionLabel: 'Open Purohit Portal',
        actionRoute: '/purohit-dashboard',
      };
    }

    setMessages(prev => [...prev, userMsg, reply]);
    if (!customQuery) setInput('');
  };

  const handleQuickBook = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = (qbPhone || user?.phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      addToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }
    const chosenPurohit = purohits.find(p => p.id === qbPurohitId) || purohits[0];
    const id = 'BKG' + Math.floor(100000 + Math.random() * 900000);
    createBooking({
      id,
      userId: user?.id || `guest_${cleanPhone}`,
      userName: qbName || user?.name || 'Devotee',
      userPhone: cleanPhone,
      userEmail: user?.email || 'devotee@gurupadukam.com',
      purohitId: chosenPurohit.id,
      purohitName: chosenPurohit.name,
      purohitPhone: chosenPurohit.phone || BRAND_CONTACT.phoneRaw,
      occasion: qbOccasion,
      date: qbDate,
      time: qbTime,
      address: qbAddress || user?.address || 'Khammam',
      city: user?.city || 'Khammam',
      pincode: user?.pincode || '507002',
      status: 'Confirmed',
      total: BRAND_CONTACT.bookingTokenFee,
      samagriMode: 'marketplace-30min',
      shipBefore30Min: true,
      handoffStatus: 'none',
      locality: user?.city || 'Khammam',
      whatsappDispatchStatus: 'Scheduled',
      reminderHoursBefore: 2,
    });
    setQbConfirmedId(id);
    addToast(`Booked ${chosenPurohit.name} (${id})! Purohit will contact you shortly.`, 'success');
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = (incPhone || user?.phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      addToast('Please enter a valid 10-digit contact number.', 'error');
      return;
    }
    const tkt = createTicket({
      bookingId: incBookingId.trim() || undefined,
      userName: user?.name || 'Devotee',
      userPhone: cleanPhone,
      category: incCategory,
      severity: incSeverity,
      description: incDesc.trim(),
    });
    if (incCategory === 'Purohit Delay') {
      triggerNotification({
        title: `Purohit Delay Alert (${tkt.id})`,
        message: `Delay reported for ${incBookingId || 'ceremony'}. Support team alerted to coordinate or swap.`,
        type: 'urgent',
        bookingId: incBookingId || undefined,
      });
    }
    setCreatedTicket(tkt);
    setIncDesc('');
  };

  const shareTicketWhatsAppUrl = createdTicket
    ? `https://wa.me/${BRAND_CONTACT.phoneRaw}?text=${encodeURIComponent(
        `🚨 *Guru Padukam Incident / Support Ticket*\n` +
        `📌 *Ticket ID:* ${createdTicket.id}\n` +
        `⚠️ *Category:* ${createdTicket.category} (${createdTicket.severity})\n` +
        (createdTicket.bookingId ? `🆔 *Booking ID:* ${createdTicket.bookingId}\n` : '') +
        `👤 *Devotee:* ${createdTicket.userName} (+91 ${createdTicket.userPhone})\n` +
        `📝 *Details:* ${createdTicket.description}`
      )}`
    : '#';

  return (
    <>
      {/* Floating PadukaAI Launcher — Official Logo Only at Bottom-Right */}
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        title="PadukaAI — Guru Padukam Assistant"
        aria-label="Open PadukaAI Assistant"
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full border-2 border-gold bg-cream shadow-2xl hover:scale-105 transition-transform flex items-center justify-center p-0.5 overflow-hidden"
      >
        <img src="/logo.png" alt="Guru Padukam AI" className="w-full h-full rounded-full object-cover" />
      </button>

      {/* Assistant Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[9995] w-[calc(100vw-2rem)] max-w-md bg-cream border border-gold/40 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[78vh] animate-fade-in">
          {/* Header */}
          <div className="bg-maroon p-4 flex items-center justify-between gap-2 text-cream">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src="/logo.png" alt="PadukaAI" className="w-8 h-8 rounded-full border border-gold/50 bg-cream shrink-0" />
              <div className="min-w-0">
                <div className="font-serif text-base font-bold text-gold-lt leading-none truncate">{t('aiTitle')}</div>
                <div className="text-[10px] text-cream/75 mt-0.5 truncate">{t('aiSubtitle')}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="relative flex items-center bg-maroon-dk border border-gold/40 rounded px-1.5 py-1">
                <Globe size={11} className="text-gold mr-1" />
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value as LanguageCode)}
                  aria-label={t('aiLanguageLabel')}
                  className="bg-transparent text-[10px] font-bold text-gold-lt focus:outline-none cursor-pointer"
                >
                  {PAN_INDIA_LANGUAGES.map(l => (
                    <option key={l.code} value={l.code} className="text-text-dk bg-white">
                      {l.nativeName} ({l.code.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-cream/70 hover:text-cream">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 3 Mode Tabs */}
          <div className="grid grid-cols-3 bg-maroon-dk text-[11px] font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setTab('chat')}
              className={`py-2.5 flex items-center justify-center gap-1 border-b-2 transition-colors ${
                tab === 'chat' ? 'border-gold text-gold bg-white/5' : 'border-transparent text-cream/65 hover:text-cream'
              }`}
            >
              <MessageSquare size={12} /> {t('aiTabChat')}
            </button>
            <button
              type="button"
              onClick={() => setTab('book')}
              className={`py-2.5 flex items-center justify-center gap-1 border-b-2 transition-colors ${
                tab === 'book' ? 'border-gold text-gold bg-white/5' : 'border-transparent text-cream/65 hover:text-cream'
              }`}
            >
              <CalendarCheck size={12} /> {t('aiTabBook')}
            </button>
            <button
              type="button"
              onClick={() => setTab('incident')}
              className={`py-2.5 flex items-center justify-center gap-1 border-b-2 transition-colors ${
                tab === 'incident' ? 'border-gold text-gold bg-white/5' : 'border-transparent text-cream/65 hover:text-cream'
              }`}
            >
              <AlertTriangle size={12} /> {t('aiTabIssue')}
            </button>
          </div>

          {/* TAB 1: CHAT */}
          {tab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-ivory/40">
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-lg text-xs leading-relaxed shadow-sm ${
                        m.sender === 'user'
                          ? 'bg-maroon text-gold-pale'
                          : 'bg-white border border-gold/25 text-text-dk'
                      }`}
                    >
                      {m.text}
                    </div>
                    {m.actionLabel && m.actionRoute && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          navigate(m.actionRoute!);
                        }}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-maroon bg-gold/20 border border-gold/40 px-3 py-1 rounded-full hover:bg-gold/30"
                      >
                        {m.actionLabel} <ArrowRight size={11} />
                      </button>
                    )}
                  </div>
                ))}

                {/* Quick Chips */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {['Apara / Last Rites', 'Purohit Delayed', '30-min Pooja Items', 'Supported Languages', 'Track Booking'].map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleChatSend(chip)}
                      className="text-[10px] font-semibold px-2.5 py-1 bg-white border border-gold/30 text-maroon rounded-full hover:bg-maroon hover:text-gold-pale transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleChatSend();
                }}
                className="p-3 bg-white border-t border-gold/20 flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={t('aiPlaceholder')}
                  className="flex-1 px-3 py-2 text-xs border border-gold/30 rounded-sm focus:outline-none focus:border-maroon"
                />
                <button
                  type="submit"
                  className="bg-maroon text-gold-pale px-3.5 py-2 rounded-sm hover:bg-maroon-md"
                >
                  <Send size={14} />
                </button>
              </form>
            </>
          )}

          {/* TAB 2: QUICK BOOK PRIEST */}
          {tab === 'book' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {qbConfirmedId ? (
                <div className="bg-green-50 border border-green-200 p-4 rounded-sm space-y-3 text-center">
                  <CheckCircle2 size={32} className="text-green-600 mx-auto" />
                  <div className="font-cinzel text-sm font-bold text-green-900">
                    Booking Confirmed: {qbConfirmedId}
                  </div>
                  <p className="text-xs text-green-800">
                    ₹11 token recorded! Our Purohit will contact you shortly, and Pooja items are scheduled 30 mins prior.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/track-order');
                      }}
                      className="flex-1 py-2 bg-maroon text-gold-pale text-xs font-bold uppercase rounded-sm"
                    >
                      Track Booking
                    </button>
                    <button
                      type="button"
                      onClick={() => setQbConfirmedId(null)}
                      className="px-3 py-2 border border-maroon/30 text-maroon text-xs font-bold rounded-sm"
                    >
                      Book Another
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleQuickBook} className="space-y-2.5">
                  <div className="text-[11px] bg-amber-50 border border-amber-200 p-2 rounded-sm text-amber-950">
                    Pay just ₹11 token — Purohits will contact you shortly &amp; Guru Padukam supports every step!
                  </div>
                  <select
                    value={qbOccasion}
                    onChange={e => setQbOccasion(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gold/30 bg-white rounded-sm"
                  >
                    {POOJA_OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <select
                    value={qbPurohitId}
                    onChange={e => setQbPurohitId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gold/30 bg-white rounded-sm"
                  >
                    {purohits.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={qbDate}
                      onChange={e => setQbDate(e.target.value)}
                      className="px-2.5 py-2 text-xs border border-gold/30 bg-white rounded-sm"
                    />
                    <input
                      type="time"
                      required
                      value={qbTime}
                      onChange={e => setQbTime(e.target.value)}
                      className="px-2.5 py-2 text-xs border border-gold/30 bg-white rounded-sm"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    value={qbName}
                    onChange={e => setQbName(e.target.value)}
                    placeholder="Your Full Name *"
                    className="w-full px-3 py-2 text-xs border border-gold/30 bg-white rounded-sm"
                  />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={qbPhone}
                    onChange={e => setQbPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-Digit Mobile Number *"
                    className="w-full px-3 py-2 text-xs border border-gold/30 bg-white rounded-sm"
                  />
                  <input
                    type="text"
                    required
                    value={qbAddress}
                    onChange={e => setQbAddress(e.target.value)}
                    placeholder="Doorstep Address *"
                    className="w-full px-3 py-2 text-xs border border-gold/30 bg-white rounded-sm"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-maroon text-gold-pale font-cinzel text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-maroon-md"
                  >
                    🙏 Pay ₹11 &amp; Book Priest
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: INCIDENT REPORTING & SUPPORT TICKET */}
          {tab === 'incident' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {createdTicket ? (
                <div className="bg-amber-50 border border-amber-300 p-4 rounded-sm space-y-3">
                  <div className="font-cinzel text-sm font-bold text-maroon flex items-center gap-1.5">
                    <CheckCircle2 size={18} className="text-green-600" />
                    Ticket Created: {createdTicket.id}
                  </div>
                  <p className="text-xs text-text-dk">
                    Your <strong>{createdTicket.category}</strong> ({createdTicket.severity}) ticket has been logged in the Admin Dashboard &amp; triggered an event notification.
                  </p>
                  <a
                    href={shareTicketWhatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5"
                  >
                    <Share2 size={14} /> Share Ticket to Admin WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => setCreatedTicket(null)}
                    className="w-full py-2 border border-maroon/30 text-maroon text-xs font-bold rounded-sm"
                  >
                    Report Another Issue
                  </button>
                </div>
              ) : (
                <form onSubmit={handleIncidentSubmit} className="space-y-2.5">
                  <div className="text-[11px] bg-red-50 border border-red-200 p-2 rounded-sm text-red-900">
                    Purohit delayed, emergency swap, or new custom ritual request? Create a Ticket &amp; alert Admin instantly.
                  </div>
                  <input
                    type="text"
                    value={incBookingId}
                    onChange={e => setIncBookingId(e.target.value)}
                    placeholder="Booking ID (e.g. BKG123456 or APR123456, optional)"
                    className="w-full px-3 py-2 text-xs border border-gold/30 bg-white rounded-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={incCategory}
                      onChange={e => setIncCategory(e.target.value as TicketCategory)}
                      className="px-2.5 py-2 text-xs border border-gold/30 bg-white rounded-sm"
                    >
                      <option value="Purohit Delay">Purohit Delay</option>
                      <option value="Emergency Swap">Emergency Swap</option>
                      <option value="Samagri / Essentials">Samagri / Essentials</option>
                      <option value="Food Customization">Food Customization</option>
                      <option value="New Request">New Custom Request</option>
                      <option value="Other">Other</option>
                    </select>
                    <select
                      value={incSeverity}
                      onChange={e => setIncSeverity(e.target.value as SupportTicket['severity'])}
                      className="px-2.5 py-2 text-xs border border-gold/30 bg-white rounded-sm"
                    >
                      <option value="Urgent">Urgent</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Normal">Normal</option>
                    </select>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={incPhone}
                    onChange={e => setIncPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Your 10-Digit Mobile Number *"
                    className="w-full px-3 py-2 text-xs border border-gold/30 bg-white rounded-sm"
                  />
                  <textarea
                    required
                    rows={3}
                    value={incDesc}
                    onChange={e => setIncDesc(e.target.value)}
                    placeholder="Describe the delay, incident, or new request…"
                    className="w-full px-3 py-2 text-xs border border-gold/30 bg-white rounded-sm resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-red-600 text-white font-cinzel text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-red-700"
                  >
                    Create Ticket &amp; Notify Admin
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
