import { useState } from 'react';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 3000);
    };

    return (
        <section className="py-16 bg-gold">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-brown-900 mb-4">
                    Subscribe to Our Newsletter
                </h2>
                <p className="text-brown-700 mb-8">
                    Get exclusive offers, new product announcements, and baking tips delivered to your inbox!
                </p>
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="flex-1 px-6 py-4 rounded-full border-2 border-brown-300 focus:border-brown-900 focus:outline-none transition-colors duration-300"
                    />
                    <button
                        type="submit"
                        className="px-8 py-4 bg-brown-900 text-white font-bold rounded-full hover:bg-brown-800 transition-all duration-300 hover:shadow-lg"
                    >
                        Subscribe
                    </button>
                </form>
                {subscribed && (
                    <p className="mt-4 text-brown-900 font-medium animate-fade-in">
                        ✓ Thank you for subscribing! Check your inbox for a welcome gift.
                    </p>
                )}
            </div>
        </section>
    );
};

export default Newsletter;
