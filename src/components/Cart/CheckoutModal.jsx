import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { CloseIcon, CheckIcon } from '../icons';

const CheckoutModal = () => {
    const { 
        isCheckoutOpen, 
        setIsCheckoutOpen, 
        cart, 
        cartTotal, 
        clearCart, 
        user,
        showNotification,
        placeOrder,
        isLoading,
        paymentStatus 
    } = useCart();
    
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        paymentMethod: 'razorpay', // Default to Razorpay
        notes: ''
    });

    // Pre-fill form with user data
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                email: user.email || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step < 3) {
            setStep(step + 1);
        } else {
            // Process order using API
            const result = await placeOrder({
                shippingAddress: {
                    fullName: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    street: formData.address,
                    city: formData.city,
                    state: formData.state || 'Uttar Pradesh',
                    pincode: formData.pincode,
                    country: 'India'
                },
                paymentMethod: formData.paymentMethod,
                notes: formData.notes,
                deliveryType: 'delivery'
            });

            if (result.success) {
                setStep(1);
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    address: '',
                    city: '',
                    state: '',
                    pincode: '',
                    paymentMethod: 'cod',
                    notes: ''
                });
            }
        }
    };

    const stepInfo = [
        { num: 1, title: 'Contact', icon: '👤' },
        { num: 2, title: 'Delivery', icon: '📍' },
        { num: 3, title: 'Payment', icon: '💳' }
    ];

    if (!isCheckoutOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-white to-cream rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
                {/* Header with Gradient */}
                <div className="relative bg-gradient-to-r from-brown-900 via-brown-800 to-brown-900 p-6 text-white overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-gold rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gold rounded-full translate-x-1/2 translate-y-1/2"></div>
                    </div>
                    
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gold/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <span className="text-2xl">🛒</span>
                            </div>
                            <div>
                                <h2 className="font-display text-2xl font-bold">Checkout</h2>
                                <p className="text-cream/80 text-sm">Complete your order</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsCheckoutOpen(false)}
                            className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 hover:rotate-90"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Progress Steps */}
                    <div className="relative flex items-center justify-center mt-6 pt-4">
                        {stepInfo.map((s, idx) => (
                            <div key={s.num} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-500 transform ${
                                        step >= s.num 
                                            ? 'bg-gold text-brown-900 scale-110 shadow-lg shadow-gold/30' 
                                            : 'bg-brown-700 text-brown-400'
                                    }`}>
                                        {step > s.num ? (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <span className="text-lg">{s.icon}</span>
                                        )}
                                    </div>
                                    <span className={`text-xs mt-2 font-medium transition-colors ${
                                        step >= s.num ? 'text-gold' : 'text-brown-500'
                                    }`}>{s.title}</span>
                                </div>
                                {idx < 2 && (
                                    <div className={`w-20 h-1 mx-2 rounded-full transition-all duration-500 ${
                                        step > s.num ? 'bg-gold' : 'bg-brown-700'
                                    }`}>
                                        <div className={`h-full bg-gold rounded-full transition-all duration-500 ${
                                            step > s.num ? 'w-full' : 'w-0'
                                        }`}></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 max-h-[50vh] overflow-y-auto">
                    {step === 1 && (
                        <div className="space-y-5 animate-fade-in">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                                    <span className="text-xl">👤</span>
                                </div>
                                <div>
                                    <h3 className="font-display text-xl font-bold text-brown-900">Contact Information</h3>
                                    <p className="text-sm text-brown-500">How can we reach you?</p>
                                </div>
                            </div>
                            
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-brown-400 group-focus-within:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-brown-200 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/10 transition-all duration-300 bg-white hover:border-brown-300"
                                />
                            </div>
                            
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-brown-400 group-focus-within:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-brown-200 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/10 transition-all duration-300 bg-white hover:border-brown-300"
                                />
                            </div>
                            
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-brown-400 group-focus-within:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-brown-200 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/10 transition-all duration-300 bg-white hover:border-brown-300"
                                />
                            </div>
                        </div>
                    )}
                    
                    {step === 2 && (
                        <div className="space-y-5 animate-fade-in">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                                    <span className="text-xl">📍</span>
                                </div>
                                <div>
                                    <h3 className="font-display text-xl font-bold text-brown-900">Delivery Address</h3>
                                    <p className="text-sm text-brown-500">Where should we deliver?</p>
                                </div>
                            </div>
                            
                            <div className="relative group">
                                <div className="absolute top-4 left-4 pointer-events-none">
                                    <svg className="w-5 h-5 text-brown-400 group-focus-within:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <textarea
                                    name="address"
                                    placeholder="Street Address (House No., Building, Street)"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                    rows="3"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-brown-200 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/10 transition-all duration-300 resize-none bg-white hover:border-brown-300"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-brown-400 group-focus-within:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-brown-200 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/10 transition-all duration-300 bg-white hover:border-brown-300"
                                    />
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-brown-400 group-focus-within:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        name="state"
                                        placeholder="State"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-brown-200 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/10 transition-all duration-300 bg-white hover:border-brown-300"
                                    />
                                </div>
                            </div>
                            
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-brown-400 group-focus-within:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    name="pincode"
                                    placeholder="PIN Code"
                                    value={formData.pincode}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-brown-200 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/10 transition-all duration-300 bg-white hover:border-brown-300"
                                />
                            </div>
                            
                            <div className="relative group">
                                <div className="absolute top-4 left-4 pointer-events-none">
                                    <svg className="w-5 h-5 text-brown-400 group-focus-within:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                </div>
                                <textarea
                                    name="notes"
                                    placeholder="Order Notes (e.g., Landmark, special instructions)"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows="2"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-brown-200 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/10 transition-all duration-300 resize-none bg-white hover:border-brown-300"
                                />
                            </div>
                        </div>
                    )}
                    
                    {step === 3 && (
                        <div className="space-y-5 animate-fade-in">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                                    <span className="text-xl">💳</span>
                                </div>
                                <div>
                                    <h3 className="font-display text-xl font-bold text-brown-900">Payment Method</h3>
                                    <p className="text-sm text-brown-500">How would you like to pay?</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {[
                                    { value: 'razorpay', icon: '💳', label: 'Pay Online (Razorpay)', desc: 'Cards, UPI, Net Banking, Wallets', recommended: true },
                                    { value: 'cod', icon: '💵', label: 'Cash on Delivery', desc: 'Pay when your order arrives' }
                                ].map(method => (
                                    <label 
                                        key={method.value}
                                        className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 group ${
                                            formData.paymentMethod === method.value
                                                ? 'border-gold bg-gold/5 shadow-md'
                                                : 'border-brown-200 hover:border-gold/50 hover:bg-brown-50'
                                        }`}
                                    >
                                        {method.recommended && (
                                            <span className="absolute -top-2 left-4 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                                                Recommended
                                            </span>
                                        )}
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method.value}
                                            checked={formData.paymentMethod === method.value}
                                            onChange={handleInputChange}
                                            className="sr-only"
                                        />
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                                            formData.paymentMethod === method.value ? 'bg-gold/20' : 'bg-brown-100 group-hover:bg-brown-200'
                                        }`}>
                                            {method.icon}
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <p className="font-semibold text-brown-900">{method.label}</p>
                                            <p className="text-sm text-brown-500">{method.desc}</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                            formData.paymentMethod === method.value
                                                ? 'border-gold bg-gold'
                                                : 'border-brown-300'
                                        }`}>
                                            {formData.paymentMethod === method.value && (
                                                <svg className="w-4 h-4 text-brown-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                            
                            {/* Payment Security Note */}
                            {formData.paymentMethod === 'razorpay' && (
                                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl mt-4">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium text-green-800">Secure Payment</p>
                                        <p className="text-xs text-green-600">Your payment is protected by 256-bit SSL encryption</p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Order Summary Card */}
                            <div className="mt-6 p-5 bg-gradient-to-br from-brown-900 to-brown-800 rounded-2xl text-white">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-xl">🧾</span>
                                    <h4 className="font-bold text-lg">Order Summary</h4>
                                </div>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-cream/80">{item.name} × {item.quantity}</span>
                                            <span className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-brown-600 mt-4 pt-4">
                                    <div className="flex justify-between text-sm text-cream/70 mb-2">
                                        <span>Subtotal</span>
                                        <span>₹{cartTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-cream/70 mb-2">
                                        <span>Delivery</span>
                                        <span className="text-green-400">FREE</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-brown-600">
                                        <span className="font-bold text-lg">Total</span>
                                        <span className="font-bold text-2xl text-gold">₹{cartTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-brown-100">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={() => setStep(step - 1)}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-6 py-3 border-2 border-brown-300 text-brown-700 rounded-full hover:bg-brown-100 transition-all duration-300 disabled:opacity-50 font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back
                            </button>
                        ) : (
                            <div></div>
                        )}
                        <button
                            type="submit"
                            disabled={isLoading || paymentStatus === 'processing'}
                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-gold to-yellow-400 text-brown-900 font-bold rounded-full hover:shadow-xl hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isLoading || paymentStatus === 'processing' ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                    </svg>
                                    {paymentStatus === 'processing' ? 'Processing Payment...' : 'Processing...'}
                                </>
                            ) : step === 3 ? (
                                <>
                                    {formData.paymentMethod === 'razorpay' ? 'Pay Now' : 'Place Order'}
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </>
                            ) : (
                                <>
                                    Continue
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutModal;
