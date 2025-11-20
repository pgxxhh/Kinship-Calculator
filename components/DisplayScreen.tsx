import React, { useState, useEffect } from 'react';
import { KinshipResponse, Language, LoadingState } from '../types';
import Loader from './Loader';

interface DisplayScreenProps {
  chain: string[];
  result: KinshipResponse | null;
  loadingState: LoadingState;
  lang: Language;
  onClear: () => void;
}

const TTS_LANG_MAP: Record<Language, string> = {
  zh: 'zh-CN',
  en: 'en-US',
  th: 'th-TH',
  id: 'id-ID',
  ms: 'ms-MY'
};

const UI_LABELS: Record<Language, { current: string, clear: string, calculating: string, call: string }> = {
  zh: { current: '当前关系', clear: '清空', calculating: '计算中...', call: '称呼' },
  en: { current: 'Chain', clear: 'Clear', calculating: 'Thinking...', call: 'Call' },
  th: { current: 'ความสัมพันธ์', clear: 'ล้าง', calculating: 'กำลังคำนวณ...', call: 'เรียก' },
  id: { current: 'Hubungan', clear: 'Hapus', calculating: 'Menghitung...', call: 'Panggilan' },
  ms: { current: 'Hubungan', clear: 'Padam', calculating: 'Mengira...', call: 'Panggilan' }
};

const DisplayScreen: React.FC<DisplayScreenProps> = ({ chain, result, loadingState, lang, onClear }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Cancel speech if result changes or component unmounts
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [result]);
  
  const ui = UI_LABELS[lang];

  const getDisplayChain = () => {
    if (chain.length === 0) {
      switch (lang) {
        case 'zh': return '请选择关系...';
        case 'th': return 'เลือกความสัมพันธ์...';
        case 'id': return 'Pilih hubungan...';
        case 'ms': return 'Pilih hubungan...';
        default: return 'Select relationship...';
      }
    }
    const separator = lang === 'en' ? ' \'s ' : ' + ';
    return chain.join(separator);
  };

  const handleSpeak = (text: string) => {
    if (!text) return;

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Set language based on app state
    utterance.lang = TTS_LANG_MAP[lang];
    // Adjust rate slightly for clarity
    utterance.rate = 0.9; 

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-inner p-6 min-h-[180px] flex flex-col justify-between relative overflow-hidden border-4 border-red-900/10">
      {/* Decorative corner patterns */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-red-800 rounded-tl-xl opacity-20"></div>
      <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-red-800 rounded-tr-xl opacity-20"></div>
      
      {/* Input Chain Display */}
      <div className="relative z-10">
         <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 flex justify-between items-center">
            <span>{ui.current}</span>
            {chain.length > 0 && (
              <button onClick={onClear} className="text-red-400 hover:text-red-600 transition-colors">
                {ui.clear}
              </button>
            )}
         </div>
         <div className={`font-medium text-gray-800 leading-relaxed ${chain.length > 5 ? 'text-sm' : 'text-lg'}`}>
           {getDisplayChain()}
         </div>
      </div>

      {/* Result Area */}
      <div className="mt-4 pt-4 border-t border-gray-100 relative z-10 min-h-[80px] flex flex-col justify-end items-end text-right">
        {loadingState === LoadingState.CALCULATING ? (
          <Loader message={ui.calculating} />
        ) : result ? (
          <div className="animate-fade-in-up flex flex-col items-end">
             
             {/* Main Title with Audio Button */}
             <div className="flex items-center gap-3 mb-1 group">
               <button 
                 onClick={() => handleSpeak(result.title)}
                 className={`p-2 rounded-full transition-all duration-300 ${
                   isSpeaking 
                     ? 'bg-yellow-500 text-white scale-110 shadow-lg shadow-yellow-500/40' 
                     : 'bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600'
                 }`}
                 title="Read Aloud"
                 aria-label="Play pronunciation"
               >
                 {isSpeaking ? (
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 animate-pulse">
                     <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 2.485.51 4.817 1.435 6.861.342 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                     <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                   </svg>
                 ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                     <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 2.485.51 4.817 1.435 6.861.342 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                   </svg>
                 )}
               </button>

               <div 
                 className="text-4xl md:text-5xl font-bold text-red-600 font-serif cursor-pointer hover:text-red-500 transition-colors select-none flex items-center gap-3"
                 onClick={() => handleSpeak(result.title)}
               >
                 <span>{result.title}</span>
                 {/* Render Emoji */}
                 {result.emoji && (
                    <span className="text-4xl filter drop-shadow-sm animate-bounce-slight" role="img" aria-label="emoji">
                        {result.emoji}
                    </span>
                 )}
               </div>
             </div>

             {result.colloquial !== result.title && (
                <div 
                  className="text-gray-500 text-sm font-medium bg-gray-100 px-2 py-1 rounded-md inline-block cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSpeak(result.colloquial)}
                >
                  {ui.call}: {result.colloquial}
                </div>
             )}
             <p className="text-gray-400 text-xs mt-2 max-w-[200px] ml-auto">{result.description}</p>
          </div>
        ) : (
           <div className="text-gray-300 text-4xl font-serif opacity-30">
             ?
           </div>
        )}
      </div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
    </div>
  );
};

export default DisplayScreen;