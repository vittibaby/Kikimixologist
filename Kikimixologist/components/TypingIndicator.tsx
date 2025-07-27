
// This file now contains the SpinningWheel component.
import React, { useState, useMemo } from 'react';

interface SpinningWheelProps {
  items: string[];
  onSpinEnd: (selectedItem: string) => void;
}

const WheelSegment: React.FC<{
  index: number;
  text: string;
  isWinner: boolean;
  color: string;
}> = ({ index, text, isWinner, color }) => {
  const segmentAngle = 45; // 360 / 8
  const startAngle = index * segmentAngle;
  
  const getCoordinatesForAngle = (angle: number, radius: number) => {
    return [
      Math.cos(angle * Math.PI / 180) * radius,
      Math.sin(angle * Math.PI / 180) * radius,
    ];
  };

  const [startX, startY] = getCoordinatesForAngle(startAngle, 150);
  const [endX, endY] = getCoordinatesForAngle(startAngle + segmentAngle, 150);

  const pathData = `M 0,0 L ${startX},${startY} A 150,150 0 0,1 ${endX},${endY} Z`;
  const textAngle = startAngle + segmentAngle / 2;

  return (
    <g
      transform="translate(160, 160)"
      className={isWinner ? 'wheel-winner' : ''}
      style={{ transition: 'transform 0.3s, filter 0.3s' }}
    >
      <path d={pathData} fill={color} />
      {/* Group for rotating text to be radial */}
      <g transform={`rotate(${textAngle})`}>
        <text
          x={95} // Distance from center
          y={0}
          textAnchor="middle"
          dy=".35em"
          fill="#fff"
          fontSize="12"
          fontWeight="bold"
          className="select-none"
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)', pointerEvents: 'none' }}
        >
          {text.length > 15 ? text.substring(0, 14) + '...' : text}
        </text>
      </g>
    </g>
  );
};

const SpinningWheel: React.FC<SpinningWheelProps> = ({ items, onSpinEnd }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  
  const colors = useMemo(() => ['#6d28d9', '#be185d', '#059669', '#b45309', '#1d4ed8', '#86198f', '#15803d', '#9f1239'], []);
  const segmentAngle = 360 / items.length;

  const handleSpin = () => {
    if (isSpinning) return;
    
    setWinnerIndex(null);
    setIsSpinning(true);
    
    const randomExtraRotations = Math.floor(Math.random() * 3) + 5;
    const randomStopAngle = Math.floor(Math.random() * 360);
    const newRotation = rotation + (360 * randomExtraRotations) + randomStopAngle;
    
    setRotation(newRotation);

    // This timeout should be the length of the spin animation
    setTimeout(() => {
      setIsSpinning(false);
      
      const finalAngle = newRotation % 360;
      const pointerAngle = 270; // Top of the wheel
      // Calculate the angle on the wheel that is under the pointer
      const winningAngle = (360 - (finalAngle % 360) + pointerAngle) % 360;
      // Calculate the index of the segment that contains the winning angle
      const winningIndex = Math.floor(winningAngle / segmentAngle);

      setWinnerIndex(winningIndex);

      // Pause to show the winner, then proceed
      setTimeout(() => {
        onSpinEnd(items[winningIndex]);
      }, 3000); // 3s highlight duration
      
    }, 6000); // Must match CSS transition duration
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-4 animate-fade-in">
      <h2 className="text-3xl font-bold text-teal-300 mb-4 text-center">Your cosmic cocktails are ready!</h2>
      <p className="text-purple-300 mb-8 text-center">Spin the wheel to reveal your destiny.</p>
      
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center mb-8">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10" style={{ filter: 'drop-shadow(0 4px 5px rgba(0,0,0,0.5))' }}>
           <svg width="40" height="50" viewBox="0 0 40 50">
             <path d="M20 50 L0 25 L0 0 L40 0 L40 25 Z" fill="#34d399" />
             <path d="M20 45 L5 25 L5 5 L35 5 L35 25 Z" fill="#10b981" />
           </svg>
        </div>

        {/* Wheel container */}
        <div
          className="relative w-full h-full"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 6s cubic-bezier(0.25, 1, 0.5, 1)' 
          }}
        >
          <svg viewBox="0 0 320 320" className="w-full h-full drop-shadow-2xl">
              <defs>
                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#4c1d95" floodOpacity="0.7"/>
                  </filter>
              </defs>
              <g filter="url(#shadow)">
                  {items.map((item, index) => (
                      <WheelSegment 
                          key={index}
                          index={index}
                          text={item}
                          color={colors[index % colors.length]}
                          isWinner={winnerIndex === index && !isSpinning}
                      />
                  ))}
              </g>
          </svg>
        </div>
        
        {/* Winner Reveal Overlay */}
        {winnerIndex !== null && !isSpinning && (
          <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm flex flex-col justify-center items-center rounded-full animate-fade-in z-20">
              <p className="text-purple-300 text-lg">Your destiny is...</p>
              <h3 className="text-4xl font-bold text-teal-300 text-center p-2" style={{ filter: 'drop-shadow(0 0 10px rgba(45, 212, 191, 0.5))' }}>
                  {items[winnerIndex]}
              </h3>
          </div>
        )}
      </div>
      
      <button
        onClick={handleSpin}
        disabled={isSpinning || winnerIndex !== null}
        className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 shadow-lg shadow-teal-800/50 text-xl"
      >
        {isSpinning ? 'Spinning...' : (winnerIndex !== null ? 'Revealed!' : 'Spin!')}
      </button>
    </div>
  );
};

export default SpinningWheel;