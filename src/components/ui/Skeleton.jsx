// Skeleton Loading Components for Premium UX
const Skeleton = ({ className = '', variant = 'rectangular' }) => {
    const baseClasses = 'animate-pulse bg-gradient-to-r from-brown-100 via-brown-50 to-brown-100 bg-[length:200%_100%]';
    
    const variantClasses = {
        rectangular: 'rounded-lg',
        circular: 'rounded-full',
        text: 'rounded h-4',
    };

    return (
        <div 
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
        />
    );
};

// Product Card Skeleton
export const ProductCardSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Image Skeleton */}
        <Skeleton className="w-full h-56" />
        
        {/* Content Skeleton */}
        <div className="p-6 space-y-4">
            {/* Category and Rating */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" variant="text" />
                <Skeleton className="h-4 w-12" variant="text" />
            </div>
            
            {/* Title */}
            <Skeleton className="h-6 w-3/4" variant="text" />
            
            {/* Description */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" variant="text" />
                <Skeleton className="h-4 w-2/3" variant="text" />
            </div>
            
            {/* Price and Button */}
            <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-8 w-20" variant="text" />
                <Skeleton className="h-10 w-24 rounded-full" />
            </div>
        </div>
    </div>
);

// Product Detail Skeleton
export const ProductDetailSkeleton = () => (
    <div className="min-h-screen bg-cream py-8">
        <div className="max-w-7xl mx-auto px-4">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2 mb-8">
                <Skeleton className="h-4 w-16" variant="text" />
                <Skeleton className="h-4 w-4" variant="text" />
                <Skeleton className="h-4 w-24" variant="text" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Image Skeleton */}
                <div className="space-y-4">
                    <Skeleton className="w-full aspect-square rounded-2xl" />
                    <div className="flex gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="w-20 h-20 rounded-xl" />
                        ))}
                    </div>
                </div>
                
                {/* Info Skeleton */}
                <div className="space-y-6">
                    <Skeleton className="h-4 w-24" variant="text" />
                    <Skeleton className="h-10 w-3/4" variant="text" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-32" variant="text" />
                        <Skeleton className="h-6 w-24" variant="text" />
                    </div>
                    <Skeleton className="h-12 w-32" variant="text" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" variant="text" />
                        <Skeleton className="h-4 w-full" variant="text" />
                        <Skeleton className="h-4 w-2/3" variant="text" />
                    </div>
                    <div className="flex items-center gap-4 pt-4">
                        <Skeleton className="h-12 w-32 rounded-xl" />
                        <Skeleton className="h-14 flex-1 rounded-full" />
                        <Skeleton className="h-14 flex-1 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Products Grid Skeleton
export const ProductsGridSkeleton = ({ count = 8 }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: count }).map((_, i) => (
            <ProductCardSkeleton key={i} />
        ))}
    </div>
);

export default Skeleton;
