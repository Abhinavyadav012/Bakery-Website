import { useState } from 'react';
import { contactInfo } from '../data/products.js';
import { PhoneIcon, EmailIcon, LocationIcon, ClockIcon } from './icons';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [formStatus, setFormStatus] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setFormStatus(''), 3000);
    };

    return (
        <section id="contact" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="text-gold font-medium tracking-widest uppercase text-sm">Contact Us</span>
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-brown-900 mt-2 mb-4">
                        Get In Touch
                    </h2>
                    <p className="text-brown-600 max-w-2xl mx-auto">
                        Have questions or special requests? We'd love to hear from you!
                    </p>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div className="bg-cream rounded-2xl p-8">
                        <h3 className="font-display text-2xl font-bold text-brown-900 mb-6">Send us a Message</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border-2 border-brown-200 focus:border-gold focus:outline-none transition-colors duration-300"
                                />
                                <input
                                    type="email"
                                    placeholder="Your Email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border-2 border-brown-200 focus:border-gold focus:outline-none transition-colors duration-300"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Subject"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                required
                                className="w-full px-4 py-3 rounded-xl border-2 border-brown-200 focus:border-gold focus:outline-none transition-colors duration-300"
                            />
                            <textarea
                                placeholder="Your Message"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                required
                                rows="4"
                                className="w-full px-4 py-3 rounded-xl border-2 border-brown-200 focus:border-gold focus:outline-none transition-colors duration-300 resize-none"
                            />
                            <button
                                type="submit"
                                className="w-full py-4 bg-brown-800 text-white font-bold rounded-full hover:bg-gold hover:text-brown-900 transition-all duration-300"
                            >
                                Send Message
                            </button>
                            {formStatus === 'success' && (
                                <p className="text-green-600 text-center font-medium">
                                    ✓ Message sent successfully! We'll get back to you soon.
                                </p>
                            )}
                        </form>
                    </div>
                    
                    {/* Contact Info */}
                    <div>
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center flex-shrink-0">
                                    <LocationIcon />
                                </div>
                                <div>
                                    <h4 className="font-display font-bold text-brown-900 mb-1">Visit Us</h4>
                                    <a 
                                        href={contactInfo.mapUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-brown-600 hover:text-gold transition-colors duration-300 underline-offset-2 hover:underline"
                                    >
                                        {contactInfo.address}
                                    </a>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center flex-shrink-0">
                                    <PhoneIcon />
                                </div>
                                <div>
                                    <h4 className="font-display font-bold text-brown-900 mb-1">Call Us</h4>
                                    <a 
                                        href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                                        className="text-brown-600 hover:text-gold transition-colors duration-300 underline-offset-2 hover:underline"
                                    >
                                        {contactInfo.phone}
                                    </a>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center flex-shrink-0">
                                    <EmailIcon />
                                </div>
                                <div>
                                    <h4 className="font-display font-bold text-brown-900 mb-1">Email Us</h4>
                                    <a 
                                        href={`mailto:${contactInfo.email}`}
                                        className="text-brown-600 hover:text-gold transition-colors duration-300 underline-offset-2 hover:underline"
                                    >
                                        {contactInfo.email}
                                    </a>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center flex-shrink-0">
                                    <ClockIcon />
                                </div>
                                <div>
                                    <h4 className="font-display font-bold text-brown-900 mb-1">Opening Hours</h4>
                                    <p className="text-brown-600">Mon - Sat: 7:00 AM - 9:00 PM</p>
                                    <p className="text-brown-600">Sunday: 8:00 AM - 6:00 PM</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Map */}
                        <div className="mt-8 rounded-2xl overflow-hidden shadow-lg h-64">
                            <a 
                                href={contactInfo.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full h-full relative group"
                            >
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57657.04!2d82.6730!3d25.7464!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398fed8b2f0c2f43%3A0x3c8d0fa6d3f3c3f5!2sJaunpur%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1702915200000!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, pointerEvents: 'none' }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    title="Bakery Location"
                                />
                                <div className="absolute inset-0 bg-brown-900/0 group-hover:bg-brown-900/20 transition-colors duration-300 flex items-center justify-center">
                                    <span className="opacity-0 group-hover:opacity-100 bg-gold text-brown-900 px-4 py-2 rounded-full font-semibold transition-opacity duration-300">
                                        Open in Google Maps →
                                    </span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
