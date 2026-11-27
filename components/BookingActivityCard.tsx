import React, { useState } from 'react';
import { Clock, CheckCircle2, FileText, Wallet, Edit3 } from 'lucide-react';
import { Booking } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface Props {
  booking: Booking;
  viewerRole: 'Devotee' | 'Purohit';
}

export const BookingActivityCard: React.FC<Props> = ({ booking, viewerRole }) => {
  const { updateBookingNoteAndAdvance, language } = useAppContext();
  const [editing, setEditing] = useState(false);
  const [noteInput, setNoteInput] = useState(booking.notes || '');
  const [advanceInput, setAdvanceInput] = useState<string>(
    booking.advancePaidToPurohit !== undefined ? String(booking.advancePaidToPurohit) : ''
  );

  const timeline = booking.timeline || [];
  const isTe = language === 'te';

  const handleSave = (e: React.FormEvent, acknowledge: boolean) => {
    e.preventDefault();
    const parsedAdvance = advanceInput.trim() !== '' ? Number(advanceInput) : undefined;
    updateBookingNoteAndAdvance(booking.id, {
      actor: viewerRole,
      note: noteInput.trim(),
      advancePaidToPurohit: parsedAdvance !== undefined && !isNaN(parsedAdvance) ? parsedAdvance : undefined,
      acknowledgeAdvance: acknowledge,
    });
    setEditing(false);
  };

  return (
    <div className="mt-3 pt-3 border-t border-gold/20 space-y-3 text-xs">
      {/* Direct Advance & Mutual Acknowledgment Bar */}
      <div className="bg-amber-50/70 border border-amber-200 rounded p-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-bold text-maroon flex items-center gap-1.5">
            <Wallet size={13} className="text-gold-dk" />
            {isTe ? 'ప్రైవేట్ అడ్వాన్స్ & పరస్పర ఆమోదం' : 'Direct Purohit Advance & Mutual Acknowledgment'}
          </div>
          <button
            type="button"
            onClick={() => setEditing(v => !v)}
            className="text-[11px] font-bold text-maroon underline flex items-center gap-1"
          >
            <Edit3 size={11} /> {editing ? (isTe ? 'మూసివేయండి' : 'Close') : (isTe ? 'నోట్స్ / అడ్వాన్స్ అప్‌డేట్' : 'Update Notes / Advance')}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-dk">
          <span>
            <strong>{isTe ? 'నేరుగా చెల్లించిన అడ్వాన్స్:' : 'Direct Advance Paid to Purohit:'}</strong>{' '}
            {booking.advancePaidToPurohit !== undefined && booking.advancePaidToPurohit > 0
              ? `₹${booking.advancePaidToPurohit}`
              : isTe ? 'నమోదు కాలేదు (₹0)' : 'Not recorded (₹0)'}
          </span>
          <span className={`px-2 py-0.5 rounded-full font-semibold ${
            booking.advanceAcknowledgedByDevotee ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}>
            {booking.advanceAcknowledgedByDevotee
              ? isTe ? '✓ భక్తుడు ఆమోదించారు' : '✓ Devotee Ack'
              : isTe ? 'భక్తుని ఆమోదం పెండింగ్' : 'Devotee Ack Pending'}
          </span>
          <span className={`px-2 py-0.5 rounded-full font-semibold ${
            booking.advanceAcknowledgedByPurohit ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}>
            {booking.advanceAcknowledgedByPurohit
              ? isTe ? '✓ పురోహితుడు ఆమోదించారు' : '✓ Purohit Ack'
              : isTe ? 'పురోహితుని ఆమోదం పెండింగ్' : 'Purohit Ack Pending'}
          </span>
        </div>

        <p className="text-[10px] text-amber-950 leading-snug">
          {isTe
            ? 'గమనిక: gurupadukam.com కేవలం ₹11 మాత్రమే తీసుకుంటుంది. పురోహితుడితో మాట్లాడిన అడ్వాన్స్ లేదా దక్షిణ విషయాల్లో మాకు ఎటువంటి సంబంధం లేదు; ఇరువురు పరస్పరం మాట్లాడుకుని ఇక్కడ ఆమోదం నమోదు చేసుకోవాలి.'
            : 'Disclaimer: Guru Padukam collects ONLY ₹11 token and is not involved in private advance or Dakshina settlements with the Purohit. Speak directly and confirm mutual acknowledgment from both sides here.'}
        </p>

        {editing && (
          <form onSubmit={e => handleSave(e, false)} className="bg-white border border-gold/30 p-3 rounded space-y-2 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-maroon mb-1">
                  {isTe ? 'పురోహితుడికి ఇచ్చిన అడ్వాన్స్ (₹)' : 'Direct Advance Paid to Purohit (₹)'}
                </label>
                <input
                  type="number"
                  min={0}
                  value={advanceInput}
                  onChange={e => setAdvanceInput(e.target.value)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 text-xs border border-gold/30 rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-maroon mb-1">
                  {isTe ? 'బుకింగ్ నోట్స్ / వివరాలు' : 'Booking Notes / Updates'}
                </label>
                <input
                  type="text"
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  placeholder={isTe ? 'వివరాలు నమోదు చేయండి…' : 'Gotram, samagri, or discussion note…'}
                  className="w-full px-2.5 py-1.5 text-xs border border-gold/30 rounded"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="px-3 py-1.5 bg-maroon text-gold-pale text-[11px] font-bold rounded hover:bg-maroon-md"
              >
                {isTe ? 'నోట్స్ సేవ్ చేయండి' : 'Save Note / Advance'}
              </button>
              <button
                type="button"
                onClick={e => handleSave(e, true)}
                className="px-3 py-1.5 bg-green-700 text-white text-[11px] font-bold rounded hover:bg-green-800 flex items-center gap-1"
              >
                <CheckCircle2 size={12} />
                {isTe ? `${viewerRole} ఆమోదం నమోదు చేయండి` : `Record ${viewerRole} Acknowledgment`}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Chronological Activity Timeline */}
      {timeline.length > 0 && (
        <div className="bg-white border border-gold/25 rounded p-3 space-y-2">
          <div className="font-bold text-[11px] uppercase tracking-wider text-maroon flex items-center gap-1.5">
            <FileText size={12} /> {isTe ? 'బుకింగ్ కార్యాచరణ కాలక్రమం (టైమ్‌లైన్)' : 'Booking Activity & Record Timeline'}
          </div>
          <div className="space-y-1.5 border-l-2 border-gold/40 pl-3 ml-1">
            {timeline.map(ev => (
              <div key={ev.id} className="relative">
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="px-1.5 py-0.5 rounded bg-maroon/10 text-maroon font-bold text-[10px]">
                    {ev.actor}
                  </span>
                  <span className="font-semibold text-text-dk">{ev.action}</span>
                  <span className="text-[10px] text-text-lt flex items-center gap-0.5 ml-auto">
                    <Clock size={10} /> {new Date(ev.timestamp).toLocaleString()}
                  </span>
                </div>
                {ev.details && <div className="text-[11px] text-text-md mt-0.5">{ev.details}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
