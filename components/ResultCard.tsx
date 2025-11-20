import React from 'react';

interface ZodiacResult {
  sign: string;
  element: string;
  imageUrl?: string;
  chineseChar: string;
  personality: string;
  luckyNumbers: string;
  luckyColors: string;
  forecast: string;
}

interface ResultCardProps {
  data: ZodiacResult;
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ data, onReset }) => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border-t border-yellow-500/30">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-red-900 to-red-800 p-6 text-center border-b border-red-700 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/chinese-pattern.png')]"></div>
           <h2 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2 drop-shadow-md font-serif tracking-wider">
             {data.sign}
           </h2>
           <p className="text-red-200 text-lg uppercase tracking-[0.3em]">{data.element} Element</p>
        </div>

        <div className="flex flex-col md:flex-row">
          
          {/* Image Section */}
          <div className="md:w-1/2 p-8 flex items-center justify-center bg-gradient-to-b from-red-900/50 to-black/20">
            <div className="relative w-64 h-64 md:w-80 md:h-80 group">
              <div className="absolute inset-0 bg-yellow-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
              {data.imageUrl ? (
                <img 
                  src={data.imageUrl} 
                  alt={data.sign} 
                  className="relative w-full h-full object-cover rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.3)] animate-float border-2 border-yellow-500/20 transform transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/30 rounded-2xl">
                  <span className="text-6xl">🐲</span>
                </div>
              )}
              <div className="absolute -bottom-4 -right-4 bg-red-600 text-white text-4xl font-bold w-16 h-16 flex items-center justify-center rounded-full border-4 border-red-900 shadow-lg chinese-font z-10">
                {data.chineseChar}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="md:w-1/2 p-8 space-y-6">
            
            <div className="space-y-2">
              <h3 className="text-yellow-500 text-xl font-semibold uppercase tracking-wide flex items-center gap-2">
                <span className="text-2xl">📜</span> Personality
              </h3>
              <p className="text-gray-200 leading-relaxed text-justify opacity-90">
                {data.personality}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h4 className="text-yellow-500 text-sm uppercase tracking-wider mb-1">Lucky Numbers</h4>
                <p className="text-2xl font-bold text-white">{data.luckyNumbers}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h4 className="text-yellow-500 text-sm uppercase tracking-wider mb-1">Lucky Colors</h4>
                <p className="text-lg font-bold text-white">{data.luckyColors}</p>
              </div>
            </div>

            <div className="space-y-2">
               <h3 className="text-yellow-500 text-xl font-semibold uppercase tracking-wide flex items-center gap-2">
                <span className="text-2xl">🔮</span> Annual Forecast
              </h3>
               <div className="p-4 bg-red-950/30 rounded-xl border border-red-500/20 italic text-gray-300">
                 "{data.forecast}"
               </div>
            </div>

          </div>
        </div>
        
        <div className="p-6 text-center bg-black/20 border-t border-white/5">
          <button 
            onClick={onReset}
            className="px-8 py-3 bg-transparent border-2 border-yellow-600 text-yellow-500 hover:bg-yellow-600 hover:text-red-900 font-bold rounded-full transition-all duration-300 uppercase tracking-widest hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
          >
            Calculate Another
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;