import { useState } from 'react';
import { galleryImages } from '../data/products.js';
import { CloseIcon } from './icons';

const Gallery = () => {
    const [lightboxImage, setLightboxImage] = useState(null);

    return (
        <section id="gallery" className="py-20 bg-brown-900">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="text-gold font-medium tracking-widest uppercase text-sm">Gallery</span>
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-2 mb-4">
                        Behind the Scenes
                    </h2>
                    <p className="text-brown-300 max-w-2xl mx-auto">
                        Take a peek into our kitchen where magic happens every day.
                    </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {galleryImages.map((image, index) => (
                        <div 
                            key={index}
                            className={`relative overflow-hidden rounded-xl cursor-pointer group ${
                                index === 0 || index === 5 ? 'md:col-span-2 md:row-span-2' : ''
                            }`}
                            onClick={() => setLightboxImage(image)}
                        >
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-4 left-4 text-white">
                                    <p className="font-medium">{image.alt}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Lightbox */}
            {lightboxImage && (
                <div 
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setLightboxImage(null)}
                >
                    <button 
                        className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full transition-colors duration-300"
                        onClick={() => setLightboxImage(null)}
                    >
                        <CloseIcon />
                    </button>
                    <img 
                        src={lightboxImage.src} 
                        alt={lightboxImage.alt}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </section>
    );
};

export default Gallery;
