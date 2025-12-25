import { useState, useEffect } from 'react';
import { testimonials } from '../data/products';
import { StarIcon } from './icons';

const Testimonials = () => {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-20 bg-cream">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <span className="text-gold font-medium tracking-widest uppercase text-sm">Testimonials</span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-brown-900 mt-2 mb-12">
                    What Our Customers Say
                </h2>
                
                <div className="relative">
                    {testimonials.map((testimonial, index) => (
                        <div 
                            key={testimonial.id}
                            className={`transition-all duration-500 ${
                                index === currentTestimonial 
                                    ? 'opacity-100 transform translate-y-0' 
                                    : 'opacity-0 absolute inset-0 transform translate-y-4'
                            }`}
                        >
                            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                                <div className="flex justify-center mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon key={i} className="w-6 h-6" />
                                    ))}
                                </div>
                                <blockquote className="text-xl md:text-2xl text-brown-700 italic mb-8 leading-relaxed">
                                    "{testimonial.text}"
                                </blockquote>
                                <div className="flex items-center justify-center">
                                    <img
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        className="w-16 h-16 rounded-full object-cover border-4 border-gold"
                                    />
                                    <div className="ml-4 text-left">
                                        <p className="font-display font-bold text-brown-900">{testimonial.name}</p>
                                        <p className="text-brown-600">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Navigation Dots */}
                <div className="flex justify-center space-x-2 mt-8">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentTestimonial(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                index === currentTestimonial ? 'bg-gold w-8' : 'bg-brown-300 hover:bg-brown-400'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
