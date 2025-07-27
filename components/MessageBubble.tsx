// This file now contains the StarSignSelector component.
import React from 'react';

interface StarSign {
    name: string;
    icon: string;
}

interface StarSignSelectorProps {
    starSigns: StarSign[];
    onSelect: (starSign: string) => void;
}

const StarSignSelector: React.FC<StarSignSelectorProps> = ({ starSigns, onSelect }) => {
    return (
        <div className="w-full max-w-2xl mx-auto p-4 animate-fade-in">
            <h2 className="text-3xl font-bold text-center text-teal-300 mb-8">First, what's your star sign?</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {starSigns.map((sign) => (
                    <button
                        key={sign.name}
                        onClick={() => onSelect(sign.name)}
                        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center aspect-square
                                   hover:bg-purple-600 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-800/50
                                   transition-all duration-300 transform hover:-translate-y-1 group"
                    >
                        <span className="text-4xl sm:text-5xl mb-2 transition-transform duration-300 group-hover:scale-110">{sign.icon}</span>
                        <span className="font-semibold text-sm sm:text-base text-gray-300 group-hover:text-white">{sign.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default StarSignSelector;
