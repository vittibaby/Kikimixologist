// This file now contains the QuestionScreen component.
import React, { useState } from 'react';

interface QuestionScreenProps {
    question: string;
    placeholder: string;
    onSubmit: (value: string) => void;
}

const QuestionScreen: React.FC<QuestionScreenProps> = ({ question, placeholder, onSubmit }) => {
    const [value, setValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onSubmit(value.trim());
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-4 text-center animate-fade-in">
            <h2 className="text-3xl font-bold text-teal-300 mb-8">{question}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-full focus:ring-2 focus:ring-teal-400 focus:outline-none transition duration-300 text-center text-lg mb-6"
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={!value.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-8 rounded-full transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 shadow-lg shadow-purple-900/50"
                >
                    Continue
                </button>
            </form>
        </div>
    );
};

export default QuestionScreen;
