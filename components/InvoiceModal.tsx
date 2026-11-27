import React from 'react';
import { X, Printer } from 'lucide-react';
import { Order } from '../types';

interface Props {
  order: Order;
  onClose: () => void;
}

export const InvoiceModal: React.FC<Props> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-8 bg-text-dk/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-cream shadow-[0_20px_60px_rgba(0,0,0,0.6)] max-h-[95vh] flex flex-col rounded-sm overflow-hidden border border-gold/20">

        {/* Header Actions (No Print) */}
        <div className="flex justify-between items-center p-4 bg-white border-b border-gold/20 no-print shadow-sm z-10">
          <h2 className="font-cinzel text-sm font-bold text-maroon tracking-[0.2em] uppercase">Divine Invoice</h2>
          <div className="flex gap-4">
            <button onClick={handlePrint} className="flex items-center gap-2 text-text-md hover:text-maroon transition-colors text-xs font-cinzel font-bold tracking-widest uppercase">
              <Printer size={16} /> Print
            </button>
            <button onClick={onClose} className="text-text-md hover:text-red-600 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-invoice" className="flex-1 overflow-y-auto p-8 md:p-12 paper-texture relative bg-white">

          {/* Stunning Animated Stamp Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 animate-stamp-drop z-50 flex flex-col items-center justify-center border-[6px] border-[#8B0000] rounded-full w-64 h-64 stamp-ink">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-20 h-20 opacity-80 mix-blend-multiply grayscale contrast-200 sepia rounded-full"
              style={{ filter: 'brightness(0.7) sepia(1) hue-rotate(-50deg) saturate(5)' }}
            />
            <span className="text-[#8B0000] font-cinzel font-black text-5xl tracking-[0.3em] mt-1 opacity-90">PAID</span>
            <span className="text-[#8B0000] font-mono text-sm mt-2 font-bold opacity-80 border-t-2 border-[#8B0000] pt-1 px-4">{new Date(order.date).toLocaleDateString()}</span>
          </div>

          {/* Invoice Content */}
          <div className="border border-gold/30 p-8 md:p-12 relative bg-white/60 backdrop-blur-[1px]">

            {/* Minimalist Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-maroon"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-maroon"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-maroon"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-maroon"></div>

            <div className="flex justify-between items-start border-b border-gold/20 pb-8 mb-8">
              <div className="flex items-center gap-5">
                <img
                  src="/logo.png"
                  alt="Guru Padukam"
                  className="w-16 h-16 rounded-full border border-gold/40 bg-cream p-0.5 object-cover"
                />
                <div>
                  <h1 className="font-cinzelDeco text-2xl font-bold text-maroon tracking-wide">Guru Padukam</h1>
                  <p className="font-telugu text-xs text-gold-dk mt-1">గురు పాదుకం</p>
                  <p className="text-[0.65rem] text-text-md mt-2 uppercase tracking-widest">Madhuranagar, Gollagudem, Khammam - 507002</p>
                  <p className="text-[0.65rem] text-text-md mt-0.5 font-mono">+91 99497 30175 · care.gurupadukam@gmail.com</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="font-cinzel text-2xl font-bold text-gold tracking-[0.3em] uppercase">Invoice</h2>
                <div className="mt-4 text-left inline-block">
                  <p className="font-mono text-xs text-text-md"><span className="font-cinzel font-bold text-maroon uppercase tracking-widest mr-2">No:</span> {order.id}</p>
                  <p className="font-mono text-xs text-text-md mt-1"><span className="font-cinzel font-bold text-maroon uppercase tracking-widest mr-2">Date:</span> {new Date(order.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="font-cinzel text-xs font-bold text-maroon uppercase tracking-[0.2em] mb-2">Billed To</h3>
              <p className="text-text-dk font-bold text-sm">{order.userEmail}</p>
              <p className="text-xs text-text-md mt-1 font-mono">ID: {order.userId}</p>
            </div>

            <table className="w-full mb-10">
              <thead>
                <tr className="border-b border-maroon/20 text-left font-cinzel text-xs font-bold text-maroon uppercase tracking-widest">
                  <th className="py-3 px-2">Description</th>
                  <th className="py-3 px-2 text-center">Qty</th>
                  <th className="py-3 px-2 text-right">Rate</th>
                  <th className="py-3 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gold/10 text-sm">
                    <td className="py-4 px-2">
                      <p className="font-bold text-text-dk text-sm">{item.name}</p>
                      <p className="text-[0.65rem] text-text-md font-telugu mt-0.5">{item.nameTe}</p>
                    </td>
                    <td className="py-4 px-2 text-center font-mono text-text-md">{item.qty}</td>
                    <td className="py-4 px-2 text-right font-mono text-text-md">₹{item.price}</td>
                    <td className="py-4 px-2 text-right font-bold text-maroon font-mono">₹{item.price * item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2 text-xs text-text-md font-bold uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{order.total}</span>
                </div>
                <div className="flex justify-between py-2 text-xs text-text-md font-bold uppercase tracking-widest border-b border-gold/20">
                  <span>Tax (0%)</span>
                  <span className="font-mono">₹0</span>
                </div>
                <div className="flex justify-between py-4 font-cinzel text-xl font-bold text-maroon">
                  <span>Total</span>
                  <span className="font-mono">₹{order.total}</span>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-6 border-t border-gold/20 text-center">
              <p className="font-cinzel text-sm text-maroon font-bold tracking-widest uppercase">Thank you for your devotion</p>
              <p className="text-xs text-text-md mt-2 font-garamond italic">May the divine blessings be with you.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
