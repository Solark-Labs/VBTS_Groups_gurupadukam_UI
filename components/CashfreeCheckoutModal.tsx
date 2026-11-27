import React, { useState } from 'react';
import { ShieldCheck, Lock, X, Smartphone, CreditCard, Building2, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import {
  CashfreeOrderResponse,
  completeSandboxCashfreeOrder,
  verifyCashfreeTokenPayment,
} from '../services/paymentService';

interface Props {
  order: CashfreeOrderResponse;
  bookingRef: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  description: string;
  onSuccess: (receipt: { cfOrderId: string; cfPaymentId: string }) => void;
  onCancel: (reason?: string) => void;
}

declare global {
  interface Window {
    Cashfree?: (opts: { mode: 'sandbox' | 'production' }) => {
      checkout: (opts: { paymentSessionId: string; redirectTarget: string }) => Promise<unknown>;
    };
  }
}

export const CashfreeCheckoutModal: React.FC<Props> = ({
  order,
  bookingRef,
  userId,
  customerName,
  customerPhone,
  description,
  onSuccess,
  onCancel,
}) => {
  const [method, setMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [bankName, setBankName] = useState('SBI');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const payableAmount = Number(order.amount || 11);

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (order.mode === 'cashfree-sandbox-local') {
      if (method === 'UPI' && (!upiId.includes('@') || upiId.trim().length < 5)) {
        setErrorMsg(`Please enter a valid UPI ID (e.g. mobile@upi or name@okicici) to authorize ₹${payableAmount}.`);
        return;
      }
      if (method === 'CARD' && cardLast4.replace(/\D/g, '').length < 4) {
        setErrorMsg(`Please enter at least the last 4 digits of your card to authorize ₹${payableAmount}.`);
        return;
      }
    }

    setProcessing(true);

    try {
      // If live Cashfree SDK & session exist, launch Cashfree Checkout v3 Drop-in
      if (order.mode === 'cashfree-live' && typeof window !== 'undefined' && window.Cashfree) {
        const cashfree = window.Cashfree({ mode: 'production' });
        await cashfree.checkout({
          paymentSessionId: order.paymentSessionId,
          redirectTarget: '_modal',
        });
      } else {
        // Explicit user authorization inside Sandbox Cashfree Checkout Modal
        await new Promise(r => setTimeout(r, 700));
        await completeSandboxCashfreeOrder(order.cfOrderId, 'PAY', `${method}:${upiId || cardLast4 || bankName}`);
      }

      // Strictly verify with backend/gateway whether payment is actually PAID
      const verified = await verifyCashfreeTokenPayment({
        cfOrderId: order.cfOrderId,
        bookingRef,
        userId,
        expectedAmount: payableAmount,
      });

      if (!verified.verified || verified.status !== 'PAID' || !verified.cfPaymentId) {
        setErrorMsg(verified.message || `₹${payableAmount} payment was not confirmed by Cashfree.`);
        setProcessing(false);
        return;
      }

      onSuccess({
        cfOrderId: verified.cfOrderId,
        cfPaymentId: verified.cfPaymentId,
      });
    } catch {
      setErrorMsg('Payment verification failed. Please retry or check your connection.');
      setProcessing(false);
    }
  };

  const handleSimulateFailure = async () => {
    setProcessing(true);
    await completeSandboxCashfreeOrder(order.cfOrderId, 'FAIL', method);
    const check = await verifyCashfreeTokenPayment({
      cfOrderId: order.cfOrderId,
      bookingRef,
      userId,
      expectedAmount: payableAmount,
    });
    setProcessing(false);
    setErrorMsg(check.message || `₹${payableAmount} payment declined / failed.`);
  };

  return (
    <div className="fixed inset-0 z-[9998] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full bg-white border border-gold/40 rounded-xl shadow-2xl overflow-hidden">
        {/* Cashfree Header */}
        <div className="bg-[#1b1138] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Guru Padukam" className="w-10 h-10 rounded-full bg-cream p-0.5 object-cover border border-gold" />
            <div>
              <div className="text-xs uppercase tracking-widest text-purple-200 font-bold flex items-center gap-1">
                <Lock size={11} /> Cashfree Payments Gateway
              </div>
              <div className="font-bold text-base">
                Guru Padukam · {payableAmount === 1 ? '₹1 KYC Witness' : `₹${payableAmount} Token`}
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={processing}
            onClick={() => onCancel('Payment cancelled before completion.')}
            className="text-white/70 hover:text-white"
            aria-label="Close Cashfree Checkout"
          >
            <X size={20} />
          </button>
        </div>

        {/* Order Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-slate-800">{description}</div>
            <div className="text-slate-500 font-mono text-[11px] mt-0.5">
              Order: {order.cfOrderId} · {customerName} (+91 {customerPhone})
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] uppercase text-slate-500 font-semibold">Payable</div>
            <div className="text-lg font-extrabold text-[#1b1138]">₹{payableAmount}.00</div>
          </div>
        </div>

        <form onSubmit={handlePayNow} className="p-5 space-y-4">
          {order.mode === 'cashfree-sandbox-local' && (
            <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded text-[11px] text-blue-900 flex items-center gap-2">
              <ShieldCheck size={14} className="shrink-0 text-blue-700" />
              <span>
                <strong>Cashfree Verification Mode:</strong> Complete UPI / Card / Bank details below to authorize ₹{payableAmount}. Closing or cancelling keeps verification <strong>incomplete</strong>.
              </span>
            </div>
          )}

          {/* Method Tabs */}
          <div className="grid grid-cols-3 gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMethod('UPI'); setErrorMsg(null); }}
              className={`py-2.5 px-2 rounded border flex flex-col items-center gap-1 transition-all ${
                method === 'UPI' ? 'border-[#6d3df4] bg-purple-50 text-[#4c1d95]' : 'border-slate-200 text-slate-600'
              }`}
            >
              <Smartphone size={15} /> UPI
            </button>
            <button
              type="button"
              onClick={() => { setMethod('CARD'); setErrorMsg(null); }}
              className={`py-2.5 px-2 rounded border flex flex-col items-center gap-1 transition-all ${
                method === 'CARD' ? 'border-[#6d3df4] bg-purple-50 text-[#4c1d95]' : 'border-slate-200 text-slate-600'
              }`}
            >
              <CreditCard size={15} /> Card
            </button>
            <button
              type="button"
              onClick={() => { setMethod('NETBANKING'); setErrorMsg(null); }}
              className={`py-2.5 px-2 rounded border flex flex-col items-center gap-1 transition-all ${
                method === 'NETBANKING' ? 'border-[#6d3df4] bg-purple-50 text-[#4c1d95]' : 'border-slate-200 text-slate-600'
              }`}
            >
              <Building2 size={15} /> NetBanking
            </button>
          </div>

          {method === 'UPI' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Enter UPI ID (GPay / PhonePe / Paytm) *</label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="e.g. 9949730175@ybl"
                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-[#6d3df4]"
              />
            </div>
          )}

          {method === 'CARD' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Debit / Credit Card Last 4 Digits *</label>
              <input
                type="text"
                maxLength={4}
                value={cardLast4}
                onChange={e => setCardLast4(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 4242"
                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-[#6d3df4]"
              />
            </div>
          )}

          {method === 'NETBANKING' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Select Bank</label>
              <select
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-[#6d3df4]"
              >
                <option value="SBI">State Bank of India (SBI)</option>
                <option value="HDFC">HDFC Bank</option>
                <option value="ICICI">ICICI Bank</option>
                <option value="AXIS">Axis Bank</option>
                <option value="UNION">Union Bank of India</option>
              </select>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 p-3 rounded text-xs text-red-800 flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 bg-[#00a651] hover:bg-[#008f45] text-white font-bold text-xs uppercase tracking-wider rounded shadow flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {processing ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Verifying ₹{payableAmount} With Cashfree…
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} /> Authorize &amp; Pay ₹{payableAmount}.00
                </>
              )}
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={processing}
                onClick={handleSimulateFailure}
                className="flex-1 py-2 border border-red-200 text-red-700 hover:bg-red-50 text-[11px] font-bold rounded"
              >
                Simulate Payment Failed
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={() => onCancel('Payment cancelled before completion — booking not submitted.')}
                className="flex-1 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-bold rounded"
              >
                Cancel &amp; Go Back
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
