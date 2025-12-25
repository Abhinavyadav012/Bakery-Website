// Simple Chart Components for Dashboard
export const BarChart = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div className="flex items-end justify-between gap-2" style={{ height }}>
            {data.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                        className="w-full bg-gold/20 rounded-t-lg relative overflow-hidden group cursor-pointer"
                        style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: '20px' }}
                    >
                        <div 
                            className="absolute bottom-0 left-0 right-0 bg-gold rounded-t-lg transition-all duration-300 group-hover:bg-yellow-500"
                            style={{ height: '100%' }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-bold text-brown-900">₹{item.value}</span>
                        </div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export const LineChart = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * 100,
        y: 100 - ((d.value - minValue) / range) * 80 - 10
    }));

    const pathD = points.reduce((acc, point, i) => {
        if (i === 0) return `M ${point.x} ${point.y}`;
        const prev = points[i - 1];
        const cp1x = prev.x + (point.x - prev.x) / 3;
        const cp2x = point.x - (point.x - prev.x) / 3;
        return `${acc} C ${cp1x} ${prev.y}, ${cp2x} ${point.y}, ${point.x} ${point.y}`;
    }, '');

    const areaD = `${pathD} L 100 100 L 0 100 Z`;

    return (
        <div style={{ height }} className="relative">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f0f0f0" strokeWidth="0.5" />
                ))}
                
                {/* Area fill */}
                <path d={areaD} fill="url(#goldGradient)" opacity="0.3" />
                
                {/* Line */}
                <path d={pathD} fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
                
                {/* Dots */}
                {points.map((point, i) => (
                    <circle 
                        key={i} 
                        cx={point.x} 
                        cy={point.y} 
                        r="2" 
                        fill="#D4AF37" 
                        className="hover:r-3 transition-all"
                    />
                ))}

                <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#D4AF37" />
                        <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
            
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 transform translate-y-6">
                {data.map((d, i) => (
                    <span key={i} className="text-xs text-gray-500">{d.label}</span>
                ))}
            </div>
        </div>
    );
};

export const DonutChart = ({ data, size = 150 }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let currentAngle = -90;

    const segments = data.map(d => {
        const angle = (d.value / total) * 360;
        const segment = {
            ...d,
            startAngle: currentAngle,
            endAngle: currentAngle + angle
        };
        currentAngle += angle;
        return segment;
    });

    const polarToCartesian = (angle, radius) => {
        const rad = (angle * Math.PI) / 180;
        return {
            x: 50 + radius * Math.cos(rad),
            y: 50 + radius * Math.sin(rad)
        };
    };

    const describeArc = (startAngle, endAngle, radius) => {
        const start = polarToCartesian(endAngle, radius);
        const end = polarToCartesian(startAngle, radius);
        const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
        return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
    };

    return (
        <div className="flex items-center gap-6">
            <div style={{ width: size, height: size }} className="relative">
                <svg viewBox="0 0 100 100" className="transform -rotate-0">
                    {segments.map((segment, i) => (
                        <path
                            key={i}
                            d={describeArc(segment.startAngle, segment.endAngle, 40)}
                            fill="none"
                            stroke={segment.color}
                            strokeWidth="20"
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{total}</p>
                        <p className="text-xs text-gray-500">Total</p>
                    </div>
                </div>
            </div>
            
            {/* Legend */}
            <div className="space-y-2">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-sm text-gray-600">{d.label}</span>
                        <span className="text-sm font-medium text-gray-900">{d.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
