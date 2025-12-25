const About = () => {
    return (
        <section id="about" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative">
                        <div className="relative z-10">
                            <img
                                src="https://images.unsplash.com/photo-1556217477-d325251ece38?w=600"
                                alt="Baker at work"
                                className="rounded-2xl shadow-2xl w-full"
                            />
                        </div>
                        <div className="absolute -bottom-8 -right-8 z-0">
                            <img
                                src="https://images.unsplash.com/photo-1517433670267-30f41c09e7b6?w=300"
                                alt="Fresh bread"
                                className="rounded-2xl shadow-xl w-64 h-64 object-cover border-4 border-white"
                            />
                        </div>
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-gold rounded-full flex items-center justify-center shadow-lg">
                            <div className="text-center">
                                <span className="block text-2xl font-bold text-brown-900">39</span>
                                <span className="text-xs text-brown-700">Years</span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <span className="text-gold font-medium tracking-widest uppercase text-sm">Our Story</span>
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-brown-900 mt-2 mb-6">
                            Baking Happiness Since 1985
                        </h2>
                        <p className="text-brown-600 text-lg mb-6 leading-relaxed">
                            What started as a small family bakery has grown into a beloved community landmark. 
                            Our founder, Maria Patel, brought her grandmother's secret recipes from her homeland, 
                            blending traditional techniques with Indian flavors.
                        </p>
                        <p className="text-brown-600 text-lg mb-8 leading-relaxed">
                            Every morning at 4 AM, our artisan bakers begin their craft, ensuring that by the 
                            time you walk through our doors, you're greeted with the irresistible aroma of 
                            freshly baked goodness.
                        </p>
                        
                        <div className="grid grid-cols-3 gap-8">
                            <div className="text-center">
                                <span className="block text-4xl font-bold text-gold mb-2">50+</span>
                                <span className="text-brown-600">Daily Fresh Items</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-4xl font-bold text-gold mb-2">10K+</span>
                                <span className="text-brown-600">Happy Customers</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-4xl font-bold text-gold mb-2">100%</span>
                                <span className="text-brown-600">Natural Ingredients</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
