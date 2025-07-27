// This file now contains the Loader component.
import React from 'react';

interface LoaderProps {
    message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-4 animate-fade-in">
            <div className="relative flex justify-center items-center w-24 h-24 mb-6">
                <div className="absolute w-full h-full border-4 border-t-teal-400 border-gray-700 rounded-full animate-spin"></div>
                <span className="text-3xl text-purple-400 animate-pulse">✨</span>
            </div>
            <p className="text-lg text-gray-300">{message}</p>
        </div>
    );
};

export default Loader;
