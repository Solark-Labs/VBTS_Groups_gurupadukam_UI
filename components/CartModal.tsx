import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, Loader2, ShieldAlert, FileText, ArrowLeft, MapPin, Truck } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { InvoiceModal } from './InvoiceModal';
import { LocationPicker, buildGeoLocation } from './LocationPicker';
import { Order, GeoLocation } from '../types';

export const CartModal: React.FC = () => {
  const { isCartOpen, setCartOpen, cart, updateCartQty, removeFromCart, cartTotal, user, placeOrder, addToast } = useAppContext();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'cart' | 'shipping' | 'upi' | 'success'>('cart');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  // Mandatory Shipping Form
  const [shippingName, setShippingName] = useState(user?.name || '');
  const [shippingPhone, setShippingPhone] = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [shippingCity, setShippingCity] = useState(user?.city || 'Khammam');
  const [shippingPincode, setShippingPincode] = useState(user?.pincode || '507002');
  const [shippingLocation, setShippingLocation] = useState<GeoLocation>(() =>
    buildGeoLocation(17.2473, 80.1514, 'Khammam, Telangana')
  );

  useEffect(() => {
    if (user) {
      if (!shippingName) setShippingName(user.name || '');
      if (!shippingPhone) setShippingPhone(user.phone || '');
      if (!shippingAddress) setShippingAddress(user.address || '');
      if (!shippingCity && user.city) setShippingCity(user.city);
      if (!shippingPincode && user.pincode) setShippingPincode(user.pincode);
    }
  }, [user]);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    if (!user) {
      setCartOpen(false);
      addToast('Please login or register to complete your order.', 'info');
      navigate('/login');
      return;
    }
    setPaymentStep('shipping');
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = shippingPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      addToast('Please enter a valid 10-digit delivery mobile number.', 'error');
      return;
    }
    if (!shippingAddress.trim()) {
      addToast('Delivery doorstep address is mandatory.', 'error');
      return;
    }
    const cleanPin = shippingPincode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      addToast('Please enter a valid 6-digit postal PIN code.', 'error');
      return;
    }
    setPaymentStep('upi');
  };

  const simulateUPIPayment = async () => {
    setIsCheckingOut(true);
    const fullAddress = `${shippingAddress}, ${shippingCity} - ${shippingPincode}`;
    const order = await placeOrder({
      name: shippingName || user?.name || 'Customer',
      phone: shippingPhone || user?.phone || 'N/A',
      address: fullAddress,
      location: shippingLocation,
    });
    if (order) {
      setCompletedOrder(order);
      setPaymentStep('success');
    } else {
      setPaymentStep('cart');
    }
    setIsCheckingOut(false);
  };

  const closeAndReset = () => {
    setCartOpen(false);
    setTimeout(() => {
      setPaymentStep('cart');
      setCompletedOrder(null);
      setShowInvoice(false);
    }, 300);
  };

  return (
    <>
      <div className="fixed inset-0 z-[9990] flex justify-end">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-maroon-dk/80 backdrop-blur-sm transition-opacity" onClick={closeAndReset} />
        
        {/* Drawer */}
        <div className="relative w-full max-w-md bg-cream h-full shadow-2xl flex flex-col animate-[slideIn_0.3s_ease-out]">
          <div className="p-6 border-b border-gold/20 flex justify-between items-center bg-white">
            <div className="flex items-center gap-2">
              {paymentStep === 'shipping' && (
                <button onClick={() => setPaymentStep('cart')} className="text-maroon hover:text-gold p-1 -ml-1 transition-colors">
                  <ArrowLeft size={18} />
                </button>
              )}
              {paymentStep === 'upi' && (
                <button onClick={() => setPaymentStep('shipping')} className="text-maroon hover:text-gold p-1 -ml-1 transition-colors">
                  <ArrowLeft size={18} />
                </button>
              )}
              <h2 className="font-cinzel text-xl font-bold text-maroon">
                {paymentStep === 'cart'
                  ? 'Your Divine Cart'
                  : paymentStep === 'shipping'
                  ? 'Delivery Address'
                  : paymentStep === 'upi'
                  ? 'Secure UPI Checkout'
                  : 'Order Confirmed'}
              </h2>
            </div>
            <button onClick={closeAndReset} className="text-maroon hover:text-gold transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
            {paymentStep === 'cart' && (
              <>
                {!user && cart.length > 0 && (
                  <div className="mb-6 bg-yellow-50 border border-yellow-200 p-3 flex items-start gap-3 rounded-sm">
                    <ShieldAlert className="text-yellow-600 shrink-0" size={20} />
                    <p className="text-sm text-yellow-800">
                      You must be a registered user to checkout. <button onClick={() => { closeAndReset(); navigate('/login'); }} className="font-bold underline">Login here</button>.
                    </p>
                  </div>
                )}

                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-text-md opacity-60">
                    <ShoppingCartIcon className="w-16 h-16 mb-4 text-gold" />
                    <p className="font-cinzel text-lg">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-4 bg-white p-3 border border-gold/10 rounded-sm shadow-sm">
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-sm border border-gold/20" />
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-cinzel text-sm font-bold text-maroon">{item.name}</h4>
                              <p className="font-telugu text-xs text-brown">{item.nameTe}</p>
                              {item.deliverySpeed && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-sm mt-1">
                                  <Truck size={10} /> {item.deliverySpeed}
                                </span>
                              )}
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center border border-gold/30 rounded-sm">
                              <button onClick={() => updateCartQty(item.id, item.qty - 1)} className="px-2 py-1 text-maroon hover:bg-gold/10"><Minus size={14} /></button>
                              <span className="px-3 font-cinzel text-sm">{item.qty}</span>
                              <button onClick={() => updateCartQty(item.id, item.qty + 1)} className="px-2 py-1 text-maroon hover:bg-gold/10"><Plus size={14} /></button>
                            </div>
                            <span className="font-cinzel font-bold text-maroon">₹{item.price * item.qty}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* MANDATORY SHIPPING DETAILS STEP */}
            {paymentStep === 'shipping' && (
              <form onSubmit={handleProceedToPayment} className="space-y-4 animate-fade-in">
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-sm text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold">Doorstep Delivery Guarantee:</span> Everyday pooja essentials delivered in <strong>15–30 minutes</strong> across Khammam. Pan-India dispatch within 24 hours.
                </div>

                <div className="bg-white border border-gold/20 p-4 rounded-sm space-y-3">
                  <div className="font-cinzel text-xs font-bold tracking-widest uppercase text-maroon flex items-center justify-between">
                    <span>Recipient Information *</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-dk mb-1">Full Recipient Name *</label>
                    <input
                      type="text"
                      required
                      value={shippingName}
                      onChange={e => setShippingName(e.target.value)}
                      placeholder="Name of person receiving pooja items"
                      className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 focus:outline-none focus:border-maroon rounded-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-dk mb-1">Delivery Mobile Number (10 digits) *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-2.5 text-xs bg-gray-100 border border-r-0 border-gold/30 text-gray-600 rounded-l-sm">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={shippingPhone}
                        onChange={e => setShippingPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 9949730175"
                        className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 focus:outline-none focus:border-maroon rounded-r-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-dk mb-1">Complete Doorstep Address *</label>
                    <textarea
                      required
                      rows={2}
                      value={shippingAddress}
                      onChange={e => setShippingAddress(e.target.value)}
                      placeholder="Flat/House No, Building, Street, Landmark"
                      className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 focus:outline-none focus:border-maroon rounded-sm resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-text-dk mb-1">City / Town *</label>
                      <input
                        type="text"
                        required
                        value={shippingCity}
                        onChange={e => setShippingCity(e.target.value)}
                        placeholder="e.g. Khammam"
                        className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 focus:outline-none focus:border-maroon rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-dk mb-1">Postal PIN Code *</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={shippingPincode}
                        onChange={e => setShippingPincode(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 507002"
                        className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 focus:outline-none focus:border-maroon rounded-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Google Maps Delivery Location Pin */}
                <LocationPicker
                  compact
                  value={shippingLocation}
                  onChange={setShippingLocation}
                  onAddressDetected={(det) => {
                    if (det.address) setShippingAddress(det.address);
                    if (det.city) setShippingCity(det.city);
                    if (det.pincode) setShippingPincode(det.pincode);
                  }}
                />

                <div className="bg-white border border-gold/20 p-4 rounded-sm flex justify-between items-center text-xs">
                  <span className="text-text-md">Cart Items ({cart.reduce((s, i) => s + i.qty, 0)})</span>
                  <span className="font-cinzel font-bold text-sm text-maroon">Total: ₹{cartTotal}</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-maroon text-gold-pale font-cinzel tracking-widest uppercase clip-btn hover:bg-maroon-md transition-colors shadow-lg font-bold"
                >
                  Continue to Payment (₹{cartTotal})
                </button>
              </form>
            )}

            {paymentStep === 'upi' && (
              <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in space-y-4">
                <div className="w-20 h-20 bg-white rounded-xl shadow-md flex items-center justify-center border border-gold/20">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="w-14" />
                </div>
                <div>
                  <h3 className="font-cinzel text-lg text-maroon mb-1">Confirm &amp; Pay via UPI</h3>
                  <p className="text-xs text-text-md">Direct Instant Payment to Guru Padukam</p>
                </div>

                <div className="w-full bg-white border border-gold/20 p-3 rounded-sm text-left text-xs space-y-1">
                  <div className="font-semibold text-text-dk flex items-center gap-1 text-maroon">
                    <MapPin size={12} /> Delivery Destination:
                  </div>
                  <p className="text-text-md font-medium">{shippingName} (+91 {shippingPhone})</p>
                  <p className="text-text-lt">{shippingAddress}, {shippingCity} – {shippingPincode}</p>
                </div>

                <div className="w-full bg-cream/60 border border-gold/30 p-3 rounded-sm flex justify-between items-center">
                  <span className="font-cinzel text-xs uppercase tracking-wider text-text-md">Amount Payable:</span>
                  <span className="font-cinzel text-xl font-bold text-maroon">₹{cartTotal}</span>
                </div>
                
                <button 
                  onClick={simulateUPIPayment}
                  disabled={isCheckingOut}
                  className="w-full py-3.5 bg-green-600 text-white font-cinzel tracking-widest uppercase clip-btn flex justify-center items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-70 shadow-lg font-bold"
                >
                  {isCheckingOut ? <Loader2 className="animate-spin" /> : `🙏 Pay ₹${cartTotal} & Place Order`}
                </button>
              </div>
            )}

            {paymentStep === 'success' && completedOrder && (
              <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="font-cinzel text-2xl text-maroon mb-2">Order Placed!</h3>
                <p className="text-sm text-text-md mb-2">Your sacred materials are being prepared for doorstep delivery.</p>
                <p className="font-cinzel text-sm bg-white px-4 py-2 border border-gold/20 rounded-md mb-6 shadow-sm">Order ID: {completedOrder.id}</p>
                
                <div className="w-full space-y-3">
                  <button 
                    onClick={() => setShowInvoice(true)}
                    className="w-full py-3 bg-gold text-maroon-dk font-cinzel tracking-widest uppercase clip-btn hover:bg-gold-lt transition-colors flex justify-center items-center gap-2 shadow-md font-bold"
                  >
                    <FileText size={18} /> View Invoice
                  </button>
                  <button 
                    onClick={() => { closeAndReset(); navigate('/track-order'); }}
                    className="w-full py-3 bg-maroon text-gold-pale font-cinzel tracking-widest uppercase clip-btn hover:bg-maroon-md transition-colors shadow-md font-bold"
                  >
                    Track Order
                  </button>
                </div>
              </div>
            )}
          </div>

          {paymentStep === 'cart' && cart.length > 0 && (
            <div className="p-6 bg-white border-t border-gold/20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mb-4 font-cinzel text-lg">
                <span className="text-text-dk">Subtotal</span>
                <span className="font-bold text-maroon">₹{cartTotal}</span>
              </div>
              <p className="text-xs text-center text-text-md mb-4 italic">Shipping & taxes calculated at checkout.</p>
              <button 
                onClick={handleCheckout}
                className="w-full py-3.5 bg-maroon text-gold-pale font-cinzel tracking-widest uppercase clip-btn hover:bg-maroon-md transition-colors shadow-lg"
              >
                {user ? 'Proceed to Checkout' : 'Login to Checkout'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Render Invoice Modal if requested */}
      {showInvoice && completedOrder && (
        <InvoiceModal order={completedOrder} onClose={() => setShowInvoice(false)} />
      )}
    </>
  );
};

const ShoppingCartIcon = (props: any) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
);
