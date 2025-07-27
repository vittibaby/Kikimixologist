// This file now contains the ResultCard component.
import React from 'react';
import type { Cocktail } from '../../types';

interface ResultCardProps {
  cocktail: Cocktail;
  onRestart: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ cocktail, onRestart }) => {
  return (
    <div className="w-full max-w-xl mx-auto bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-2xl shadow-purple-900/50 border border-purple-700 p-6 sm:p-8 relative animate-fade-in-up">
      <div className="text-center mb-6">
        <p className="text-purple-300 text-lg mb-1">Your destined drink is...</p>
        <h2 className="text-4xl font-bold text-teal-300" style={{ filter: 'drop-shadow(0 0 10px rgba(45, 212, 191, 0.5))' }}>
          {cocktail.name}
        </h2>
        <p className="text-gray-300 mt-3 max-w-md mx-auto italic">
          "{cocktail.explanation}"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-6">
        {/* Left Side: Image and Adjectives */}
        <div className="relative flex justify-center items-center">
            <img 
              src={cocktail.imageUrl}
              alt={`A vibrant image of a ${cocktail.name} cocktail`}
              className="rounded-xl w-64 h-64 object-cover shadow-lg shadow-black/50 border-2 border-purple-800 animate-image-reveal"
            />
            {cocktail.adjectives.map((adj, i) => (
                <span
                  key={i}
                  className="absolute bg-teal-400/90 text-black text-sm font-bold px-3 py-1 rounded-full shadow-md animate-fade-in"
                  style={{
                      animationDelay: `${0.5 + i * 0.2}s`,
                      transform: `rotate(${i * 70 - 45}deg) translate(${i % 2 === 0 ? 120 : 135}px) rotate(${-i * 70 + 45}deg)`
                  }}
                >
                    {adj}
                </span>
            ))}
        </div>

        {/* Right Side: Recipe */}
        <div>
          <h3 className="font-semibold text-xl text-purple-300 mb-3 border-b-2 border-purple-800 pb-1">📜 Recipe:</h3>
          <div>
              <h4 className="font-bold text-gray-200 mb-2">Ingredients</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-300 pl-2">
                  {cocktail.recipe.ingredients.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
          </div>
          <div className="mt-4">
              <h4 className="font-bold text-gray-200 mb-2">Instructions</h4>
              <ul className="list-decimal list-inside space-y-1 text-gray-300 pl-2">
                  {cocktail.recipe.instructions.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
          </div>
        </div>
      </div>


      <div className="text-center mt-6">
        <button
          onClick={onRestart}
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-full transition-transform transform hover:scale-105"
        >
          Find Another Cocktail
        </button>
      </div>
    </div>
  );
};

export default ResultCard;