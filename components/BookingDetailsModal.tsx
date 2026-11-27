import React, { useState } from 'react';
import {
  X, CheckCircle2, Clock, MapPin, Phone, Navigation, MessageCircle,
  RefreshCw, AlertTriangle, Package, Truck, FileText, Sparkles, ShieldCheck
} from 'lucide-react';
import { AparaBooking, Booking, Order } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { BRAND_CONTACT } from '../constants';
import { getBookingCancellationPolicy } from '../utils/bookingRules';
import {
  buildPurohitWhatsAppUrl,
  getBookingMapDirectionsUrl,
  getAparaPriorDispatchInfo,
  buildAparaOrganizerWhatsAppUrl,
} from '../utils/whatsapp';
import { BookingActivityCard } from './BookingActivityCard';

interface Props {
  booking?: Booking | null;
  aparaBooking?: AparaBooking | null;
  order?: Order | null;
  viewerRole?: 'Devotee' | 'Purohit';
  onClose: () => void;
  onOpenInvoice?: (order: Order) => void;
  actionSlot?: React.ReactNode;
}

export const BookingDetailsModal: React.FC<Props> = ({
  booking,
  aparaBooking,
  order,
  viewerRole = 'Devotee',
  onClose,
  onOpenInvoice,
  actionSlot,
}) => {
  const {
    user,
    language,
    rescheduleBooking,
    requestDevoteeCancellation,
    createTicket,
    markBookingWhatsappSent,
    markAparaWhatsappSent,
    addToast,
  } = useAppContext();

  const [showSwapForm, setShowSwapForm] = useState(false);
  const [swapDate, setSwapDate] = useState(booking?.date || '');
  const [swapTime, setSwapTime] = useState(booking?.time || '');
  const [swapReason, setSwapReason] = useState('');

  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportMsg, setSupportMsg] = useState('');

  if (!booking && !aparaBooking && !order) return null;

  const isTe = language === 'te';

  // Build visual 4-step progress state for ritual bookings
  const renderBookingView = (b: Booking) => {
    const policy = getBookingCancellationPolicy(b);
    const mapUrl = getBookingMapDirectionsUrl(b);
    const isRejected = b.status === 'Rejected by Purohit' || b.status === 'Cancelled';
    const isMuhurthamDone = b.muhurthamFinalized || b.status === 'Muhurtham Finalized' || b.status === 'Confirmed' || b.status === 'Completed';

    const steps = [
      { label: isTe ? '₹11 టోకెన్ ధృవీకరణ' : '₹11 Token Paid', done: true },
      { label: isTe ? 'పురోహితుడికి పంపబడింది' : 'Sent to Purohit', done: true },
      { label: isTe ? 'ముహూర్తం ఖరారు' : 'Muhurtham Set', done: isMuhurthamDone && !isRejected },
      { label: isTe ? 'పూజా సామగ్రి & అలర్ట్' : 'Reminders & Kits Ready', done: Boolean(b.guruPadukamTeamAction) && !isRejected },
    ];

    return (
      <>
        {/* Header */}
        <div className="bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk text-cream p-5 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 bg-gold text-maroon-dk rounded">
                {b.id}
              </span>
              {b.bookingType === 'immediate' && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-red-600 text-white rounded-full">
                  ⚡ Immediate Booking
                </span>
              )}
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                isRejected
                  ? 'bg-red-100 text-red-900'
                  : isMuhurthamDone
                  ? 'bg-green-100 text-green-900'
                  : 'bg-amber-100 text-amber-900'
              }`}>
                {b.status}
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold">{b.occasion}</h2>
            <p className="text-xs text-cream/80 mt-0.5">
              ₹{b.total} {b.paymentStatus || 'Verified'} via {b.paymentMethod || 'Cashfree'}
              {b.cashfreePaymentId && <> · Txn: <span className="font-mono">{b.cashfreePaymentId}</span></>}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking details"
            className="text-cream/75 hover:text-gold transition-colors shrink-0 p-1"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-cream/60">
          {/* Step-by-Step Progress Bar */}
          {!isRejected ? (
            <div className="bg-white border border-gold/30 rounded-lg p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-maroon mb-3">
                {isTe ? 'బుకింగ్ పురోగతి స్థితి' : 'Current Progress & Actions Status'}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {steps.map((st, idx) => (
                  <div
                    key={st.label}
                    className={`p-2.5 rounded-md border flex items-center gap-2 text-xs ${
                      st.done
                        ? 'bg-green-50 border-green-300 text-green-900 font-semibold'
                        : 'bg-cream/40 border-gold/20 text-text-lt'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      st.done ? 'bg-green-600 text-white' : 'bg-gold/20 text-maroon'
                    }`}>
                      {st.done ? '✓' : idx + 1}
                    </span>
                    <span className="leading-tight">{st.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 space-y-2 text-xs text-red-900">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle size={15} className="text-red-600" />
                {b.status}
              </div>
              {b.purohitActionReason && (
                <div><strong>Reason:</strong> {b.purohitActionReason}</div>
              )}
              {b.refundCreditedToWallet && (
                <div className="inline-flex items-center gap-1 font-bold text-green-800 bg-green-100 px-3 py-1 rounded-full">
                  <CheckCircle2 size={13} /> ₹{b.total} Auto-Credited to Devotee Wallet
                </div>
              )}
            </div>
          )}

          {/* At-a-Glance Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gold/25 rounded-lg p-4 space-y-2 text-xs">
              <div className="font-cinzel text-[11px] font-bold uppercase tracking-wider text-maroon border-b border-gold/15 pb-1.5 flex items-center gap-1.5">
                <Clock size={13} /> {isTe ? 'ముహూర్తం & తేదీ వివరాలు' : 'Schedule & Muhurtham Details'}
              </div>
              <div><strong>Date:</strong> {b.date}</div>
              <div><strong>Time:</strong> {b.time}</div>
              {b.nakshatram && (
                <div className="text-maroon font-semibold">
                  <strong>Nakshatram / Muhurtham:</strong> {b.nakshatram}
                </div>
              )}
              {b.guruPadukamTeamAction && (
                <div className="bg-green-50 border border-green-200 text-green-900 px-2.5 py-1.5 rounded font-medium flex items-center gap-1.5">
                  <Sparkles size={13} className="shrink-0" /> {b.guruPadukamTeamAction}
                </div>
              )}
              {b.samagriMode && (
                <div className="text-text-md">
                  <strong>Samagri Plan:</strong>{' '}
                  {b.samagriMode === 'marketplace-30min'
                    ? 'Guru Padukam Express (30-min prior dispatch)'
                    : b.samagriMode === 'purohit-brings'
                    ? 'Purohit Brings Samagri'
                    : 'Family Arranges Samagri'}
                </div>
              )}
            </div>

            <div className="bg-white border border-gold/25 rounded-lg p-4 space-y-2 text-xs">
              <div className="font-cinzel text-[11px] font-bold uppercase tracking-wider text-maroon border-b border-gold/15 pb-1.5 flex items-center gap-1.5">
                <MapPin size={13} /> {viewerRole === 'Purohit' ? 'Devotee & Venue' : 'Purohit & Venue Details'}
              </div>
              <div>
                <strong>{viewerRole === 'Purohit' ? 'Devotee Host:' : 'Assigned Purohit:'}</strong>{' '}
                {viewerRole === 'Purohit' ? `${b.userName} (+91 ${b.userPhone})` : b.purohitName}
              </div>
              <div>
                <strong>Venue:</strong> {b.address}, {b.city} – {b.pincode}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={`tel:+${viewerRole === 'Purohit' ? `91${b.userPhone}` : (b.purohitPhone || BRAND_CONTACT.phoneRaw)}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-maroon text-gold-pale font-bold rounded text-[11px]"
                >
                  <Phone size={12} /> {viewerRole === 'Purohit' ? 'Call Devotee' : 'Call Purohit'}
                </a>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-maroon/30 text-maroon font-bold rounded text-[11px]"
                >
                  <Navigation size={12} /> Google Maps
                </a>
                {viewerRole === 'Devotee' && (
                  <a
                    href={buildPurohitWhatsAppUrl(b)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => markBookingWhatsappSent(b.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#25D366] text-white font-bold rounded text-[11px]"
                  >
                    <MessageCircle size={12} /> WhatsApp Map
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Role-Specific Controls */}
          {actionSlot ? (
            <div className="bg-white border border-gold/30 rounded-lg p-4">{actionSlot}</div>
          ) : viewerRole === 'Devotee' && !isRejected ? (
            <div className="bg-white border border-gold/30 rounded-lg p-4 space-y-3 text-xs">
              <div className={`px-3 py-2 rounded border text-[11px] font-medium ${
                policy.canDevoteeSelfCancelOrSwap
                  ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                {isTe ? policy.summaryTe : policy.summaryEn}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {policy.canDevoteeSelfCancelOrSwap ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSwapForm(v => !v);
                        setShowCancelForm(false);
                        setSwapDate(b.date);
                        setSwapTime(b.time);
                      }}
                      className="px-3.5 py-2 bg-gold/25 border border-gold/40 text-maroon font-bold rounded flex items-center gap-1.5 hover:bg-gold/35"
                    >
                      <RefreshCw size={13} /> {isTe ? 'తేదీ మార్చండి (ఉచితం)' : 'Swap Date / Time (Free)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCancelForm(v => !v);
                        setShowSwapForm(false);
                      }}
                      className="px-3.5 py-2 bg-red-50 border border-red-200 text-red-700 font-bold rounded hover:bg-red-100"
                    >
                      {isTe ? 'రద్దు అభ్యర్థన' : 'Request Cancellation'}
                    </button>
                  </>
                ) : policy.isSameDay && !policy.isImmediate ? (
                  <a
                    href={`tel:+${b.purohitPhone || BRAND_CONTACT.phoneRaw}`}
                    className="px-3.5 py-2 bg-maroon text-gold-pale font-bold rounded flex items-center gap-1.5"
                  >
                    <Phone size={13} /> {isTe ? 'ఈరోజు మార్పుకు పురోహితుడికి కాల్ చేయండి' : 'Speak Directly With Purohit'}
                  </a>
                ) : null}

                <button
                  type="button"
                  onClick={() => setShowSupportForm(v => !v)}
                  className="px-3.5 py-2 bg-cream border border-maroon/30 text-maroon font-bold rounded hover:bg-maroon/5 ml-auto"
                >
                  {isTe ? 'సహాయం పొందండి' : 'Get Support / Raise Ticket'}
                </button>
              </div>

              {showSwapForm && (
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    rescheduleBooking(b.id, swapDate, swapTime, swapReason || 'Updated schedule by devotee');
                    setShowSwapForm(false);
                  }}
                  className="bg-cream/60 border border-gold/35 p-3 rounded space-y-2"
                >
                  <div className="font-bold text-maroon text-[11px]">Choose New Date &amp; Time (₹0 Fee)</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={swapDate}
                      onChange={e => setSwapDate(e.target.value)}
                      className="px-2.5 py-1.5 border border-gold/30 bg-white rounded text-xs"
                    />
                    <input
                      type="time"
                      required
                      value={swapTime}
                      onChange={e => setSwapTime(e.target.value)}
                      className="px-2.5 py-1.5 border border-gold/30 bg-white rounded text-xs"
                    />
                  </div>
                  <input
                    type="text"
                    value={swapReason}
                    onChange={e => setSwapReason(e.target.value)}
                    placeholder="Reason for schedule change (optional)…"
                    className="w-full px-2.5 py-1.5 border border-gold/30 bg-white rounded text-xs"
                  />
                  <button type="submit" className="px-4 py-1.5 bg-maroon text-gold-pale font-bold rounded text-xs">
                    Confirm Free Swap
                  </button>
                </form>
              )}

              {showCancelForm && (
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    requestDevoteeCancellation(b.id, cancelReason);
                    setShowCancelForm(false);
                    setCancelReason('');
                  }}
                  className="bg-red-50 border border-red-200 p-3 rounded space-y-2"
                >
                  <div className="font-bold text-red-900 text-[11px]">
                    Routes directly to Purohit &amp; Guru Padukam Admin
                  </div>
                  <input
                    type="text"
                    required
                    minLength={5}
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    placeholder="Enter valid cancellation reason…"
                    className="w-full px-2.5 py-1.5 border border-red-300 bg-white rounded text-xs"
                  />
                  <button type="submit" className="px-4 py-1.5 bg-red-700 text-white font-bold rounded text-xs">
                    Submit Cancellation Request
                  </button>
                </form>
              )}

              {showSupportForm && (
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    createTicket({
                      bookingId: b.id,
                      userName: user?.name || b.userName,
                      userPhone: user?.phone || b.userPhone,
                      category: 'Other',
                      severity: 'Urgent',
                      description: supportMsg.trim() || `Support needed for ${b.id}`,
                    });
                    setShowSupportForm(false);
                    setSupportMsg('');
                  }}
                  className="bg-cream/60 border border-gold/35 p-3 rounded space-y-2"
                >
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      required
                      value={supportMsg}
                      onChange={e => setSupportMsg(e.target.value)}
                      placeholder="Describe issue (schedule, delay, samagri)…"
                      className="flex-1 min-w-[200px] px-2.5 py-1.5 border border-gold/30 bg-white rounded text-xs"
                    />
                    <button type="submit" className="px-3.5 py-1.5 bg-maroon text-gold-pale font-bold rounded text-xs">
                      Submit Ticket
                    </button>
                    <a
                      href={`https://wa.me/${BRAND_CONTACT.phoneRaw}?text=${encodeURIComponent(`Namaste Guru Padukam Support 🙏 Help needed for booking ${b.id} (${b.occasion}): `)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 bg-[#25D366] text-white font-bold rounded text-xs"
                    >
                      WhatsApp Support
                    </a>
                  </div>
                </form>
              )}
            </div>
          ) : null}

          {/* Chronological Action History & Mutual Advance Log */}
          <div className="bg-white border border-gold/25 rounded-lg p-4">
            <BookingActivityCard booking={b} viewerRole={viewerRole} />
          </div>
        </div>
      </>
    );
  };

  const renderAparaView = (a: AparaBooking) => {
    const prior = getAparaPriorDispatchInfo(a.date);
    return (
      <>
        <div className="bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk text-cream p-5 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 bg-gold text-maroon-dk rounded">
                {a.id}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-900">
                ₹{a.tokenFee} Confirmed · {a.status}
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold">{a.ceremonyType}</h2>
            <p className="text-xs text-cream/80 mt-0.5">{a.peetaName} · {a.purohitGroup}</p>
          </div>
          <button type="button" onClick={onClose} className="text-cream/75 hover:text-gold p-1" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-cream/60 text-xs">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3.5 text-green-900 flex items-center gap-2 font-medium">
            <ShieldCheck size={17} className="shrink-0" />
            Emergency Team Swap Guarantee Active · Peeta Phone Unlocked
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-gold/25 rounded-lg p-4">
            <div className="space-y-1.5">
              <div><strong>Date &amp; Time:</strong> {a.date} at {a.time}</div>
              <div><strong>Ritual Mode:</strong> {a.ritualMode}</div>
              <div><strong>Purohit Group:</strong> {a.purohitGroup}</div>
              <div><strong>Attendees:</strong> {a.attendeeCount} Guests</div>
            </div>
            <div className="space-y-1.5">
              <div><strong>Peeta Address:</strong> {a.peetaAddress}</div>
              <div>
                <strong>Unlocked Organizer Phone:</strong>{' '}
                <a href={`tel:+${a.peetaPhone}`} className="text-maroon font-bold underline">
                  +{a.peetaPhone.slice(0, 2)} {a.peetaPhone.slice(2)}
                </a>
              </div>
              <div><strong>Food Package:</strong> {a.foodPackage === 'with-food' ? `With Bhojanam (${a.foodMenuType || 'Custom'})` : 'Ritual Only'}</div>
              <div><strong>1-Day Prior Checklist:</strong> {prior.formattedPrior}</div>
            </div>
          </div>

          <div className="bg-white border border-gold/25 rounded-lg p-4 flex flex-wrap gap-2 justify-between items-center">
            <button
              type="button"
              onClick={() => {
                createTicket({
                  bookingId: a.id,
                  userName: a.userName,
                  userPhone: a.userPhone,
                  category: 'Emergency Swap',
                  severity: 'Urgent',
                  description: `Support requested for Apara Seva ${a.id} (${a.ceremonyType}).`,
                });
                addToast(`Support ticket raised for ${a.id}!`, 'info');
              }}
              className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 font-bold rounded flex items-center gap-1.5"
            >
              <AlertTriangle size={13} /> Request Emergency Support
            </button>
            <a
              href={buildAparaOrganizerWhatsAppUrl(a)}
              target="_blank"
              rel="noreferrer"
              onClick={() => markAparaWhatsappSent(a.id)}
              className="px-4 py-2 bg-[#25D366] text-white font-bold rounded flex items-center gap-1.5"
            >
              <MessageCircle size={13} /> Send Checklist on WhatsApp
            </a>
          </div>
        </div>
      </>
    );
  };

  const renderOrderView = (o: Order) => {
    return (
      <>
        <div className="bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk text-cream p-5 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 bg-gold text-maroon-dk rounded">
                {o.id}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900">
                {o.status}
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold">Marketplace Order · ₹{o.total}</h2>
            <p className="text-xs text-cream/80 mt-0.5">
              Ordered on {new Date(o.date).toLocaleDateString()} · {o.paymentMethod || 'Paid Online'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-cream/75 hover:text-gold p-1" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-cream/60 text-xs">
          {/* Status Steps */}
          <div className="bg-white border border-gold/25 rounded-lg p-4 flex items-center justify-around">
            {([
              { label: 'Processing', icon: Package, active: true },
              { label: 'Shipped', icon: Truck, active: o.status === 'Shipped' || o.status === 'Delivered' },
              { label: 'Delivered', icon: CheckCircle2, active: o.status === 'Delivered' },
            ]).map(st => {
              const Icon = st.icon;
              return (
                <div key={st.label} className="flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                    st.active ? 'bg-maroon border-maroon text-gold-pale' : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <span className={`font-bold text-[11px] ${st.active ? 'text-maroon' : 'text-gray-400'}`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Items & Address */}
          <div className="bg-white border border-gold/25 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center border-b border-gold/15 pb-2">
              <span className="font-cinzel font-bold uppercase text-maroon text-[11px]">Ordered Items ({o.items.length})</span>
              {onOpenInvoice && (
                <button
                  type="button"
                  onClick={() => onOpenInvoice(o)}
                  className="inline-flex items-center gap-1 text-maroon font-bold bg-gold/20 px-2.5 py-1 rounded border border-gold/30"
                >
                  <FileText size={12} /> View Invoice
                </button>
              )}
            </div>
            <div className="divide-y divide-gold/15">
              {o.items.map(item => (
                <div key={item.id} className="py-2 flex justify-between items-center">
                  <span className="font-medium text-text-dk">{item.name} × {item.qty}</span>
                  <span className="font-bold text-maroon">₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-gold/20 text-text-md">
              <strong>Delivery Address:</strong> {o.shippingAddress}
            </div>
          </div>

          {/* Partner Store Aggregator Mediation */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
            <div className="text-[11px] text-amber-950 leading-relaxed">
              <strong>Partner Pooja Store Policy:</strong> Fulfilled directly by our partner store owner (not cancellable once packed). Having a missing, damaged, or quality concern? Raise an escalation below — <strong>Guru Padukam Support speaks directly with the merchant on your behalf.</strong>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                createTicket({
                  bookingId: o.id,
                  userName: user?.name || o.userName,
                  userPhone: user?.phone || o.userPhone,
                  category: 'Samagri / Essentials',
                  severity: 'Urgent',
                  description: `Merchant Mediation Requested for Order ${o.id}: ${supportMsg.trim()}`,
                });
                setSupportMsg('');
              }}
              className="flex flex-wrap gap-2"
            >
              <input
                type="text"
                required
                value={supportMsg}
                onChange={e => setSupportMsg(e.target.value)}
                placeholder="Describe missing/damaged item concern for the merchant…"
                className="flex-1 min-w-[200px] px-3 py-2 border border-gold/40 bg-white rounded text-xs"
              />
              <button type="submit" className="px-4 py-2 bg-maroon text-gold-pale font-bold rounded text-xs">
                Escalate to Merchant
              </button>
              <a
                href={`https://wa.me/${BRAND_CONTACT.phoneRaw}?text=${encodeURIComponent(`Namaste Guru Padukam Support 🙏 Please speak with the merchant regarding Marketplace Order ${o.id} (₹${o.total}): `)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#25D366] text-white font-bold rounded text-xs inline-flex items-center gap-1"
              >
                <MessageCircle size={12} /> WhatsApp
              </a>
            </form>
          </div>
        </div>
      </>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[9992] bg-text-dk/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-3xl max-h-[92vh] bg-cream rounded-xl shadow-2xl border border-gold/40 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {booking && renderBookingView(booking)}
        {!booking && aparaBooking && renderAparaView(aparaBooking)}
        {!booking && !aparaBooking && order && renderOrderView(order)}
      </div>
    </div>
  );
};
