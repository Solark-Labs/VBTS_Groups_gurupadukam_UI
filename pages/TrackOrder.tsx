import React, { useState } from 'react';
import {
  Search, Package, Truck, CheckCircle, FileText, MapPin, MessageCircle,
  Calendar, ExternalLink, Phone, Utensils, AlertTriangle, Edit3, Save
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { Order, Booking, AparaBooking } from '../types';
import { InvoiceModal } from '../components/InvoiceModal';
import { BookingDetailsModal } from '../components/BookingDetailsModal';
import {
  buildPurohitWhatsAppUrl,
  getBookingMapDirectionsUrl,
  getReminderWindowInfo,
  buildAparaOrganizerWhatsAppUrl,
  getAparaPriorDispatchInfo,
} from '../utils/whatsapp';

export const TrackOrder: React.FC = () => {
  const {
    orders,
    bookings,
    aparaBookings,
    tickets,
    user,
    markBookingWhatsappSent,
    markAparaWhatsappSent,
    updateAparaFoodCustomization,
    createTicket,
    addToast,
    t,
  } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [phoneQuery, setPhoneQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [matchedOrders, setMatchedOrders] = useState<Order[]>([]);
  const [matchedBookings, setMatchedBookings] = useState<Booking[]>([]);
  const [matchedApara, setMatchedApara] = useState<AparaBooking[]>([]);
  const [showInvoiceOrder, setShowInvoiceOrder] = useState<Order | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<{
    booking?: Booking;
    apara?: AparaBooking;
    order?: Order;
  } | null>(null);

  // 2-Day Prior Apara Food Edit State
  const [editingAparaId, setEditingAparaId] = useState<string | null>(null);
  const [editAttendees, setEditAttendees] = useState<number>(25);
  const [editMenu, setEditMenu] = useState<string>('');
  const [editPreferred, setEditPreferred] = useState<string>('');
  const [editCustom, setEditCustom] = useState<string>('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const rawId = searchQuery.trim().toLowerCase();
    const digits = phoneQuery.replace(/\D/g, '');
    if (!rawId || digits.length < 10) {
      const msg = 'Please enter both your Booking/Order ID and 10-digit mobile number to track.';
      setSearchError(msg);
      addToast(msg, 'error');
      return;
    }
    setSearchError(null);
    setHasSearched(true);

    const last10 = digits.slice(-10);
    const ord = orders.filter(
      o => o.id.toLowerCase() === rawId && o.userPhone.replace(/\D/g, '').endsWith(last10)
    );
    const bkg = bookings.filter(
      b => b.id.toLowerCase() === rawId && b.userPhone.replace(/\D/g, '').endsWith(last10)
    );
    const apr = aparaBookings.filter(
      a => a.id.toLowerCase() === rawId && a.userPhone.replace(/\D/g, '').endsWith(last10)
    );

    setMatchedOrders(ord);
    setMatchedBookings(bkg);
    setMatchedApara(apr);
  };

  const getStepStatus = (status: string, step: string) => {
    const flow = ['Processing', 'Shipped', 'Delivered'];
    const currentIndex = flow.indexOf(status);
    const stepIndex = flow.indexOf(step);
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const displayOrders = hasSearched
    ? matchedOrders
    : user
      ? orders.filter(o => o.userId === user.id || user.role === 'admin')
      : [];

  const displayBookings = hasSearched
    ? matchedBookings
    : user
      ? bookings.filter(b => b.userId === user.id || user.role === 'admin')
      : [];

  const displayApara = hasSearched
    ? matchedApara
    : user
      ? aparaBookings.filter(b => b.userId === user.id || user.role === 'admin')
      : [];

  const displayTickets = user
    ? tickets.filter(t => t.userPhone === user.phone || user.role === 'admin')
    : hasSearched
      ? tickets.filter(t => {
        const digits = phoneQuery.replace(/\D/g, '');
        return (
          (t.id.toLowerCase() === searchQuery.trim().toLowerCase() ||
            t.bookingId?.toLowerCase() === searchQuery.trim().toLowerCase()) &&
          digits.length >= 10 &&
          t.userPhone.replace(/\D/g, '').endsWith(digits.slice(-10))
        );
      })
      : [];

  const canCustomizeFood2DaysPrior = (ab: AparaBooking) => {
    if (!ab.foodEditableUntil) return true;
    const today = new Date().toISOString().split('T')[0];
    return today <= ab.foodEditableUntil;
  };

  const handleReportDelay = (bookingId: string, phone: string, name: string, label: string) => {
    createTicket({
      bookingId,
      userName: name,
      userPhone: phone,
      category: 'Purohit Delay',
      severity: 'Urgent',
      description: `Devotee reported delay/issue for ${label} (${bookingId}). Immediate coordination requested.`,
    });
  };

  return (
    <div className="min-h-screen bg-cream py-16 px-4 pt-28">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-cinzel text-3xl font-bold text-maroon tracking-widest uppercase">
            {t('trackTitle')}
          </h1>
          <p className="text-text-md mt-3 text-sm">
            {t('trackDesc')}
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-10 max-w-2xl mx-auto space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              aria-label="Booking or Order ID"
              placeholder="Booking / Order ID (e.g. ORD123456)"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchError(null); }}
              className="flex-1 px-4 py-3 border border-gold/30 bg-white focus:outline-none focus:border-maroon font-cinzel text-sm shadow-sm"
            />
            <input
              type="tel"
              aria-label="10-digit Mobile Number"
              placeholder="10-digit Mobile Number"
              value={phoneQuery}
              onChange={(e) => { setPhoneQuery(e.target.value.replace(/\D/g, '').slice(0, 10)); setSearchError(null); }}
              className="sm:w-52 px-4 py-3 border border-gold/30 bg-white focus:outline-none focus:border-maroon font-cinzel text-sm shadow-sm"
            />
            <button
              type="submit"
              className="bg-maroon text-gold-pale px-6 py-3 clip-btn hover:bg-maroon-md transition-colors flex items-center justify-center gap-2 font-cinzel tracking-widest uppercase text-sm shadow-md"
            >
              <Search size={18} /> {t('trackBtn')}
            </button>
          </div>
          {searchError && (
            <p className="text-xs text-red-700 font-medium text-center">{searchError}</p>
          )}
        </form>

        {hasSearched && displayOrders.length === 0 && displayBookings.length === 0 && displayApara.length === 0 && (
          <div className="bg-white p-8 text-center border border-red-200 rounded-md shadow-sm max-w-2xl mx-auto mb-10">
            <p className="text-red-700 font-cinzel text-base font-bold">
              No bookings or orders found for &ldquo;{searchQuery}&rdquo;.
            </p>
            <p className="text-xs text-text-md mt-1">
              Check the Booking ID or 10-digit mobile number used during booking.
            </p>
          </div>
        )}

        {/* ─── PUROHIT BOOKINGS ─── */}
        {displayBookings.length > 0 && (
          <div className="mt-8 animate-fade-in">
            <h3 className="font-cinzel text-xl font-bold text-maroon mb-5 border-b border-gold/20 pb-2 flex items-center gap-2">
              <Calendar size={20} /> Purohit Ceremony Bookings ({displayBookings.length})
            </h3>
            <div className="grid gap-4">
              {displayBookings.map(b => {
                const mapUrl = getBookingMapDirectionsUrl(b);
                const reminder = getReminderWindowInfo(b.date, b.time, b.reminderHoursBefore || 2);
                const latestEvent = b.timeline && b.timeline.length > 0 ? b.timeline[b.timeline.length - 1] : null;
                return (
                  <div
                    key={b.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedDetail({ booking: b })}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDetail({ booking: b }); } }}
                    className="bg-white p-5 border border-gold/25 hover:border-gold rounded-sm shadow-sm hover:shadow-md transition-all space-y-3 cursor-pointer"
                  >
                    <div className="flex justify-between items-start gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-cinzel font-bold text-maroon text-base">{b.id}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{b.status}</span>
                          {b.handoffStatus === 'reassigned' && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-300">
                              ✓ Reassigned to {b.purohitName}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-sm text-text-dk mt-1">{b.purohitName} · <span className="text-maroon">{b.occasion}</span></p>
                        <p className="text-xs text-text-md mt-0.5">Scheduled: <strong>{b.date}</strong> at <strong>{b.time}</strong> · ₹{b.total} Token</p>
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${b.whatsappDispatchStatus === 'Sent'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                        {b.whatsappDispatchStatus === 'Sent' ? '✓ Map Sent to Purohit' : reminder.label}
                      </span>
                    </div>

                    <div className="text-xs text-text-md bg-cream/60 p-3 rounded-sm border border-gold/15 space-y-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-maroon shrink-0" />
                          <span>{b.address}, {b.city} – {b.pincode}</span>
                        </span>
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-maroon font-bold hover:underline inline-flex items-center gap-1"
                        >
                          View Google Map <ExternalLink size={11} />
                        </a>
                      </div>
                      {latestEvent && (
                        <div className="text-[11px] text-maroon font-medium pt-1">
                          <strong>Latest Action:</strong> {latestEvent.actor} — {latestEvent.action}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleReportDelay(b.id, b.userPhone, b.userName, b.occasion);
                        }}
                        className="inline-flex items-center gap-1.5 border border-red-300 bg-red-50 text-red-700 text-xs font-bold px-3 py-2 rounded-sm hover:bg-red-100 transition-colors"
                      >
                        <AlertTriangle size={13} /> Report Delay / Issue
                      </button>
                      <div className="flex items-center gap-2">
                        <a
                          href={buildPurohitWhatsAppUrl(b)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => {
                            e.stopPropagation();
                            markBookingWhatsappSent(b.id);
                          }}
                          className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1fb858] text-white text-xs font-bold px-3.5 py-2 rounded-sm shadow-sm transition-colors"
                        >
                          <MessageCircle size={14} /> Send Map to Purohit WhatsApp
                        </a>
                        <span className="text-[11px] font-bold text-maroon underline px-1">
                          Full View &amp; Timeline →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── APARA PEETA BOOKINGS & 2-DAY PRIOR FOOD CUSTOMIZATION ─── */}
        {displayApara.length > 0 && (
          <div className="mt-12 animate-fade-in">
            <h3 className="font-cinzel text-xl font-bold text-maroon mb-5 border-b border-gold/20 pb-2 flex items-center gap-2">
              <Utensils size={20} /> Apara Peeta Bookings &amp; 1-Day Prior Checklists ({displayApara.length})
            </h3>
            <div className="grid gap-4">
              {displayApara.map(ab => {
                const prior = getAparaPriorDispatchInfo(ab.date);
                const editable = canCustomizeFood2DaysPrior(ab);
                const isEditing = editingAparaId === ab.id;
                return (
                  <div
                    key={ab.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedDetail({ apara: ab })}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDetail({ apara: ab }); } }}
                    className="bg-white p-5 border border-gold/25 hover:border-gold rounded-sm shadow-sm hover:shadow-md transition-all space-y-3 cursor-pointer"
                  >
                    <div className="flex justify-between items-start gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-cinzel font-bold text-maroon text-base">{ab.id}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{ab.status}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-200">
                            Emergency Swap Protected
                          </span>
                        </div>
                        <p className="font-semibold text-sm text-text-dk mt-1">{ab.peetaName} · <span className="text-maroon">{ab.ceremonyType}</span></p>
                        <p className="text-xs text-text-md mt-0.5">
                          Scheduled: <strong>{ab.date}</strong> at <strong>{ab.time}</strong> · {ab.purohitGroup} · {ab.attendeeCount} Attendees
                        </p>
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${ab.whatsappDispatchStatus === 'Sent'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}>
                        {ab.whatsappDispatchStatus === 'Sent' ? '✓ Checklist Sent to Peeta' : `1-Day Prior Alert: ${prior.formattedPrior}`}
                      </span>
                    </div>

                    <div className="text-xs text-text-md bg-cream/60 p-3 rounded-sm border border-gold/15 space-y-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span><strong>Revealed Peeta Phone:</strong> +{ab.peetaPhone.slice(0, 2)} {ab.peetaPhone.slice(2)}</span>
                        <a
                          href={`tel:+${ab.peetaPhone}`}
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-maroon font-bold hover:underline"
                        >
                          <Phone size={11} /> Call Peeta
                        </a>
                      </div>
                      <div>
                        <strong>Food:</strong> {ab.foodPackage === 'with-food' ? `With Bhojanam (${ab.foodMenuType})` : 'Without Food (Ritual Only)'}
                        {ab.preferredItems && ` · Items: ${ab.preferredItems}`}
                      </div>
                      {ab.customizations && <div><strong>Customizations:</strong> {ab.customizations}</div>}
                    </div>

                    {/* 2-Day Prior Food Customization Editor */}
                    {isEditing && (
                      <div onClick={e => e.stopPropagation()} className="bg-ivory border border-gold/30 p-3.5 rounded-sm space-y-2.5">
                        <div className="text-xs font-bold text-maroon">Customize Food (Allowed up to 2 days prior: {ab.foodEditableUntil || 'Before ceremony'})</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="number"
                            min={1}
                            value={editAttendees}
                            onChange={e => setEditAttendees(Number(e.target.value))}
                            placeholder="Attendee Count"
                            className="px-3 py-1.5 text-xs border border-gold/30 bg-white rounded-sm"
                          />
                          <input
                            type="text"
                            value={editMenu}
                            onChange={e => setEditMenu(e.target.value)}
                            placeholder="Menu Type (e.g. 4 Curries & 4 Pickles)"
                            className="px-3 py-1.5 text-xs border border-gold/30 bg-white rounded-sm"
                          />
                        </div>
                        <input
                          type="text"
                          value={editPreferred}
                          onChange={e => setEditPreferred(e.target.value)}
                          placeholder="Preferred Sweets, Hot & Curry Items"
                          className="w-full px-3 py-1.5 text-xs border border-gold/30 bg-white rounded-sm"
                        />
                        <input
                          type="text"
                          value={editCustom}
                          onChange={e => setEditCustom(e.target.value)}
                          placeholder="Dietary Customizations"
                          className="w-full px-3 py-1.5 text-xs border border-gold/30 bg-white rounded-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              updateAparaFoodCustomization(ab.id, {
                                attendeeCount: editAttendees,
                                foodMenuType: editMenu,
                                preferredItems: editPreferred,
                                customizations: editCustom,
                              });
                              setEditingAparaId(null);
                            }}
                            className="px-3.5 py-1.5 bg-maroon text-gold-pale text-xs font-bold rounded-sm inline-flex items-center gap-1"
                          >
                            <Save size={12} /> Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingAparaId(null)}
                            className="px-3 py-1.5 border border-maroon/30 text-maroon text-xs font-bold rounded-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                      <div className="flex items-center gap-2">
                        {ab.foodPackage === 'with-food' && editable && !isEditing && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setEditingAparaId(ab.id);
                              setEditAttendees(ab.attendeeCount);
                              setEditMenu(ab.foodMenuType || '');
                              setEditPreferred(ab.preferredItems || '');
                              setEditCustom(ab.customizations || '');
                            }}
                            className="inline-flex items-center gap-1 border border-gold/40 bg-ivory text-maroon text-xs font-bold px-3 py-2 rounded-sm hover:bg-gold/15"
                          >
                            <Edit3 size={12} /> Customize Food (2-Day Prior)
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            createTicket({
                              bookingId: ab.id,
                              userName: ab.userName,
                              userPhone: ab.userPhone,
                              category: 'Emergency Swap',
                              severity: 'Emergency',
                              description: `Emergency support / Peeta swap requested for Apara booking ${ab.id}.`,
                            });
                            addToast('Emergency Support Ticket sent to Guru Padukam team!', 'info');
                          }}
                          className="inline-flex items-center gap-1 border border-red-300 bg-red-50 text-red-700 text-xs font-bold px-3 py-2 rounded-sm hover:bg-red-100"
                        >
                          <AlertTriangle size={12} /> Emergency Support
                        </button>
                      </div>

                      <a
                        href={buildAparaOrganizerWhatsAppUrl(ab)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => {
                          e.stopPropagation();
                          markAparaWhatsappSent(ab.id);
                        }}
                        className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1fb858] text-white text-xs font-bold px-3.5 py-2 rounded-sm shadow-sm transition-colors"
                      >
                        <MessageCircle size={14} /> Send 1-Day Prior Checklist
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── MARKETPLACE ORDERS ─── */}
        {displayOrders.length > 0 && (
          <div className="mt-12 animate-fade-in">
            <h3 className="font-cinzel text-xl font-bold text-maroon mb-5 border-b border-gold/20 pb-2">
              Pooja Marketplace Orders ({displayOrders.length})
            </h3>
            <div className="grid gap-4">
              {displayOrders.map(order => (
                <div
                  key={order.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedDetail({ order })}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDetail({ order }); } }}
                  className="bg-white p-6 border border-gold/20 hover:border-gold shadow-sm hover:shadow-md transition-all rounded-sm space-y-4 cursor-pointer"
                >
                  <div className="flex justify-between items-center border-b border-gold/10 pb-3">
                    <div>
                      <p className="font-cinzel text-lg font-bold text-maroon">{order.id}</p>
                      <p className="text-xs text-text-md">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="font-cinzel text-lg font-bold text-maroon">₹{order.total}</span>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setShowInvoiceOrder(order); }}
                        className="flex items-center gap-1 text-xs font-cinzel font-bold text-gold-dk bg-gold/10 px-3 py-1.5 rounded-sm border border-gold/30"
                      >
                        <FileText size={14} /> Invoice
                      </button>
                    </div>
                  </div>

                  <div className="relative flex justify-between items-center px-4 pt-2">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${getStepStatus(order.status, 'Processing') !== 'pending' ? 'bg-maroon border-maroon text-gold-pale' : 'bg-white border-gray-300 text-gray-400'}`}>
                        <Package size={16} />
                      </div>
                      <span className="text-[11px] font-bold">Processing</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${getStepStatus(order.status, 'Shipped') !== 'pending' ? 'bg-maroon border-maroon text-gold-pale' : 'bg-white border-gray-300 text-gray-400'}`}>
                        <Truck size={16} />
                      </div>
                      <span className="text-[11px] font-bold">Shipped</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${getStepStatus(order.status, 'Delivered') !== 'pending' ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                        <CheckCircle size={16} />
                      </div>
                      <span className="text-[11px] font-bold">Delivered</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gold/15 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-text-md">
                      Fulfilled by Partner Store Owner · Need help? Click card to view items or escalate.
                    </span>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        createTicket({
                          bookingId: order.id,
                          userName: order.userName,
                          userPhone: order.userPhone,
                          category: 'Samagri / Essentials',
                          severity: 'Urgent',
                          description: `Merchant Mediation requested for Marketplace Order ${order.id} (₹${order.total}).`,
                        });
                        addToast(`Support ticket raised for ${order.id} — Guru Padukam team will contact the store merchant!`, 'info');
                      }}
                      className="inline-flex items-center gap-1.5 border border-maroon/30 bg-cream text-maroon text-xs font-bold px-3 py-1.5 rounded-sm hover:bg-gold/15"
                    >
                      <AlertTriangle size={12} /> Escalate Order Concern to Store
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── SUPPORT TICKETS ─── */}
        {displayTickets.length > 0 && (
          <div className="mt-12 animate-fade-in">
            <h3 className="font-cinzel text-xl font-bold text-maroon mb-4 border-b border-gold/20 pb-2">
              Your Incident &amp; Support Tickets ({displayTickets.length})
            </h3>
            <div className="grid gap-3">
              {displayTickets.map(t => (
                <div key={t.id} className="bg-white p-4 border border-gold/25 rounded-sm flex justify-between items-start gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-cinzel font-bold text-maroon text-sm">{t.id}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">{t.severity}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">{t.status}</span>
                    </div>
                    <div className="text-xs font-semibold text-text-dk mt-1">{t.category} {t.bookingId && `· Booking ${t.bookingId}`}</div>
                    <p className="text-xs text-text-md mt-0.5">{t.description}</p>
                    {t.assignedTo && <div className="text-[11px] text-green-700 font-semibold mt-1">Assigned to: {t.assignedTo}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showInvoiceOrder && (
        <InvoiceModal order={showInvoiceOrder} onClose={() => setShowInvoiceOrder(null)} />
      )}

      {selectedDetail && (
        <BookingDetailsModal
          booking={
            selectedDetail.booking
              ? bookings.find(b => b.id === selectedDetail.booking?.id) || selectedDetail.booking
              : null
          }
          aparaBooking={
            selectedDetail.apara
              ? aparaBookings.find(a => a.id === selectedDetail.apara?.id) || selectedDetail.apara
              : null
          }
          order={
            selectedDetail.order
              ? orders.find(o => o.id === selectedDetail.order?.id) || selectedDetail.order
              : null
          }
          viewerRole="Devotee"
          onClose={() => setSelectedDetail(null)}
          onOpenInvoice={ord => {
            setSelectedDetail(null);
            setShowInvoiceOrder(ord);
          }}
        />
      )}
    </div>
  );
};
