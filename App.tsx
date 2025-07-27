
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { STAR_SIGNS } from './constants';
import type { Step, UserDetails, Cocktail } from './types';
import StarSignSelector from './components/MessageBubble';
import QuestionScreen from './components/icons/UserIcon';
import Loader from './components/icons/BotIcon';
import SpinningWheel from './components/TypingIndicator';
import ResultCard from './components/icons/SendIcon';


const App: React.FC = () => {
    const [step, setStep] = useState<Step>('start');
    const [userDetails, setUserDetails] = useState<UserDetails>({ starSign: '', mood: '', character: '' });
    const [cocktails, setCocktails] = useState<string[]>([]);
    const [result, setResult] = useState<Cocktail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleStart = () => {
      setStep('starSign');
    };

    const handleStarSignSelect = (starSign: string) => {
        setUserDetails(prev => ({ ...prev, starSign }));
        setStep('mood');
    };

    const handleMoodSubmit = (mood: string) => {
        setUserDetails(prev => ({ ...prev, mood }));
        setStep('character');
    };

    const handleCharacterSubmit = async (character: string) => {
        setIsLoading(true);
        setError(null);
        setLoadingMessage("Brewing up some cosmic cocktails...");
        setStep('generating');
        const finalUserDetails = { ...userDetails, character };
        setUserDetails(finalUserDetails);

        try {
             if (!process.env.API_KEY) {
                throw new Error("API key is missing. Please set the API_KEY environment variable.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `A user's profile is: Star Sign: ${finalUserDetails.starSign}, Mood: ${finalUserDetails.mood}, Character: ${finalUserDetails.character}. Generate 8 cocktail names uniquely inspired by this profile.`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    systemInstruction: "You are Kiki, a mystic mixologist. You create unique cocktail names that perfectly match a user's astrological sign, current mood, and core character. Your creations are always creative, personal, and slightly magical. You will ONLY respond with the requested JSON array of strings.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "An array of 8 unique and creative cocktail names."
                    },
                },
            });
            
            const responseText = response.text.trim();
            const cocktailList = JSON.parse(responseText);

            if (Array.isArray(cocktailList) && cocktailList.length > 0) {
                setCocktails(cocktailList.slice(0, 8)); // Ensure we have exactly 8
                setStep('spinning');
            } else {
                throw new Error("Failed to generate a valid list of cocktails.");
            }
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "An unexpected error occurred while generating cocktails.");
            setStep('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSpinEnd = async (selectedCocktail: string) => {
        setIsLoading(true);
        setError(null);
        setStep('generating');

        try {
            if (!process.env.API_KEY) {
                throw new Error("API key is missing.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            // Step 1: Get description and recipe
            setLoadingMessage("Distilling your drink's destiny...");
            const detailsPrompt = `The user's profile is: Star Sign: ${userDetails.starSign}, Mood: "${userDetails.mood}", Character: "${userDetails.character}". Their chosen cocktail is "${selectedCocktail}". Generate a response based on this.`;
            
            const detailsResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: detailsPrompt,
                config: {
                     systemInstruction: "You are Kiki, a mystic mixologist. Your task is to explain why a chosen cocktail is the perfect match for a user. You must explicitly connect the user's profile (star sign, mood, character) to the cocktail's name, its essence, or its ingredients in your explanation. The recipe should also subtly reflect the user's profile. Be mystical and uplifting. Respond ONLY in the requested JSON format.",
                     responseMimeType: "application/json",
                     responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                           explanation: { type: Type.STRING, description: "A concise, 1-2 sentence explanation of why this cocktail is a perfect match, directly referencing the user's star sign, mood, or character."},
                           adjectives: { type: Type.ARRAY, items: {type: Type.STRING}, description: "3-5 positive, mystical adjectives describing the user, inspired by their profile and the chosen cocktail."},
                           recipe: {
                               type: Type.OBJECT,
                               properties: {
                                   ingredients: { type: Type.ARRAY, items: {type: Type.STRING}},
                                   instructions: { type: Type.ARRAY, items: {type: Type.STRING}},
                               },
                               required: ["ingredients", "instructions"],
                               description: "A simple recipe. The ingredients or instructions should subtly link to the user's profile."
                           },
                        },
                        required: ["explanation", "adjectives", "recipe"]
                     },
                },
            });
            const parsedDetails = JSON.parse(detailsResponse.text.trim());

            // Step 2: Generate image
            setLoadingMessage("Conjuring a vision of your cocktail...");
            const imageResponse = await ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: `A vibrant, professional, photorealistic image of a "${selectedCocktail}" cocktail. The drink should be in an elegant glass, beautifully garnished, set against a dark, moody, and slightly magical background that reflects a feeling of "${userDetails.character}" and "${userDetails.mood}".`,
                config: {
                  numberOfImages: 1,
                  outputMimeType: 'image/jpeg',
                  aspectRatio: '1:1',
                },
            });
            const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

            setResult({ name: selectedCocktail, ...parsedDetails, imageUrl });
            setStep('result');
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "An unexpected error occurred while crafting your cocktail's story.");
            setStep('error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRestart = () => {
        setStep('start');
        setUserDetails({ starSign: '', mood: '', character: '' });
        setCocktails([]);
        setResult(null);
        setError(null);
    };

    const renderStep = () => {
        if (isLoading || (step === 'generating' && loadingMessage)) {
            return <Loader message={loadingMessage} />;
        }
        
        if (step === 'error') {
            return (
                 <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">A Cosmic Hiccup!</h2>
                    <p className="text-gray-300 mb-6 max-w-md">{error}</p>
                    <button onClick={handleRestart} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-full transition-transform transform hover:scale-105">
                        Try Again
                    </button>
                </div>
            )
        }

        switch (step) {
            case 'start':
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in">
                       <div className="mb-8">
                         <h1 className="text-5xl font-bold text-teal-300 mb-2">Kiki's Mixologist</h1>
                         <p className="text-purple-300 text-lg">Let the stars guide your sips.</p>
                       </div>
                       <button onClick={handleStart} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 shadow-lg shadow-purple-900/50 text-xl">
                            Discover Your Drink
                        </button>
                    </div>
                )
            case 'starSign':
                return <StarSignSelector starSigns={STAR_SIGNS} onSelect={handleStarSignSelect} />;
            case 'mood':
                return <QuestionScreen key="mood" question="How are you feeling right now?" placeholder="e.g., adventurous, relaxed..." onSubmit={handleMoodSubmit} />;
            case 'character':
                return <QuestionScreen key="character" question="Use one word to describe your character" placeholder="e.g., bold, curious, serene..." onSubmit={handleCharacterSubmit} />;
            case 'spinning':
                return <SpinningWheel items={cocktails} onSpinEnd={handleSpinEnd} />;
            case 'result':
                return result && <ResultCard cocktail={result} onRestart={handleRestart} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white font-sans overflow-hidden">
           <main className="flex-1 flex items-center justify-center p-4">
              {renderStep()}
            </main>
        </div>
    );
};

export default App;