import React, { useState } from 'react';
import { calculateRelationship } from './services/geminiService';
import { Language, Gender, LoadingState, KinshipResponse, RelationButton, RelationType } from './types';
import DisplayScreen from './components/DisplayScreen';

// Translation Dictionaries
const UI_TEXT = {
  zh: { title: '亲戚计算器', iAm: '我是', swap: '切换' },
  en: { title: 'Kinship Calculator', iAm: 'I am', swap: 'Swap' },
  th: { title: 'เครื่องคิดเลขเครือญาติ', iAm: 'ฉันคือ', swap: 'สลับ' },
  id: { title: 'Kalkulator Kerabat', iAm: 'Saya', swap: 'Tukar' },
  ms: { title: 'Kalkulator Saudara', iAm: 'Saya', swap: 'Tukar' },
};

const RELATION_LABELS: Record<Language, Record<RelationType, string>> = {
  zh: {
    father: '父亲', mother: '母亲', husband: '丈夫', wife: '妻子',
    elder_bro: '哥哥', elder_sis: '姐姐', younger_bro: '弟弟', younger_sis: '妹妹',
    son: '儿子', daughter: '女儿',
    cousin_elder_male: '堂哥', cousin_elder_female: '堂姐'
  },
  en: {
    father: 'Father', mother: 'Mother', husband: 'Husband', wife: 'Wife',
    elder_bro: 'Older Bro', elder_sis: 'Older Sis', younger_bro: 'Younger Bro', younger_sis: 'Younger Sis',
    son: 'Son', daughter: 'Daughter',
    cousin_elder_male: 'Cousin ♂', cousin_elder_female: 'Cousin ♀'
  },
  th: {
    father: 'พ่อ', mother: 'แม่', husband: 'สามี', wife: 'ภรรยา',
    elder_bro: 'พี่ชาย', elder_sis: 'พี่สาว', younger_bro: 'น้องชาย', younger_sis: 'น้องสาว',
    son: 'ลูกชาย', daughter: 'ลูกสาว',
    cousin_elder_male: 'ลูกพี่ลูกน้อง ♂', cousin_elder_female: 'ลูกพี่ลูกน้อง ♀'
  },
  id: {
    father: 'Ayah', mother: 'Ibu', husband: 'Suami', wife: 'Istri',
    elder_bro: 'Abang', elder_sis: 'Kakak', younger_bro: 'Adik Lk', younger_sis: 'Adik Pr',
    son: 'Anak Lk', daughter: 'Anak Pr',
    cousin_elder_male: 'Sepupu ♂', cousin_elder_female: 'Sepupu ♀'
  },
  ms: {
    father: 'Bapa', mother: 'Ibu', husband: 'Suami', wife: 'Isteri',
    elder_bro: 'Abang', elder_sis: 'Kakak', younger_bro: 'Adik Lk', younger_sis: 'Adik Pr',
    son: 'Anak Lk', daughter: 'Anak Pr',
    cousin_elder_male: 'Sepupu ♂', cousin_elder_female: 'Sepupu ♀'
  }
};

const RELATION_BUTTONS: RelationButton[] = [
  { id: 'father', gender: 'm' },
  { id: 'mother', gender: 'f' },
  { id: 'husband', gender: 'm' },
  { id: 'wife', gender: 'f' },
  { id: 'elder_bro', gender: 'm' },
  { id: 'elder_sis', gender: 'f' },
  { id: 'younger_bro', gender: 'm' },
  { id: 'younger_sis', gender: 'f' },
  { id: 'son', gender: 'm' },
  { id: 'daughter', gender: 'f' },
  { id: 'cousin_elder_male', gender: 'm' },
  { id: 'cousin_elder_female', gender: 'f' },
];

const App: React.FC = () => {
  // State
  const [language, setLanguage] = useState<Language>('zh');
  const [myGender, setMyGender] = useState<Gender>('male');
  
  // REFACTOR: Chain now stores IDs (RelationType) instead of string labels.
  // This prevents logic errors by using standardized keys.
  const [chain, setChain] = useState<RelationType[]>([]);
  
  const [result, setResult] = useState<KinshipResponse | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);

  // Handlers
  const handleAddRelation = (btn: RelationButton) => {
    setLoadingState(LoadingState.IDLE);
    setResult(null); 
    // Store ID
    setChain(prev => [...prev, btn.id]);
  };

  const handleUndo = () => {
    if (chain.length === 0) return;
    setChain(prev => prev.slice(0, -1));
    setResult(null);
    setLoadingState(LoadingState.IDLE);
  };

  const handleClear = () => {
    setChain([]);
    setResult(null);
    setLoadingState(LoadingState.IDLE);
  };

  const handleCalculate = async () => {
    if (chain.length === 0) return;

    setLoadingState(LoadingState.CALCULATING);
    try {
      // Pass IDs to service
      const data = await calculateRelationship(chain, myGender, language);
      setResult(data);
      setLoadingState(LoadingState.COMPLETE);
    } catch (e) {
      console.error(e);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as Language;
    setLanguage(newLang);
    // We don't need to clear chain anymore because it uses language-agnostic IDs!
    setResult(null);
  };

  // Helper to map IDs to current language labels for UI display
  const getDisplayLabels = () => {
    return chain.map(id => RELATION_LABELS[language][id]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8B0000] to-[#2a0808] text-white font-sans selection:bg-yellow-500 selection:text-red-900 flex items-center justify-center p-4 md:p-8">
      
      <div className="w-full max-w-[420px] bg-[#4a0a0a] border-2 border-[#B8860B]/50 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col relative">
        
        <div className="h-8 bg-[#B8860B] flex items-center justify-center relative">
           <div className="absolute inset-x-0 top-1 h-[1px] bg-yellow-200 opacity-50"></div>
           <span className="text-[#4a0a0a] font-bold text-xs tracking-[0.2em] uppercase">
             {UI_TEXT[language].title}
           </span>
        </div>

        <div className="p-6 flex-grow flex flex-col gap-6">
          
          <div className="flex justify-between items-center px-2">
             <div className="relative">
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="appearance-none bg-black/30 border border-white/10 text-yellow-500 text-xs font-bold py-1 pl-3 pr-8 rounded-full focus:outline-none focus:border-[#B8860B] cursor-pointer hover:bg-black/40 transition-colors"
                >
                  <option value="zh">中文 (Chinese)</option>
                  <option value="en">English</option>
                  <option value="th">ไทย (Thai)</option>
                  <option value="id">Bahasa Indo</option>
                  <option value="ms">Bahasa Melayu</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-yellow-500">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
             </div>

             <div className="flex items-center gap-2">
               <span className="text-xs text-yellow-500/80 uppercase font-bold">{UI_TEXT[language].iAm}</span>
               <button 
                  onClick={() => setMyGender(myGender === 'male' ? 'female' : 'male')}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${myGender === 'male' ? 'border-blue-400 bg-blue-500/20 text-blue-200' : 'border-pink-400 bg-pink-500/20 text-pink-200'}`}
                  aria-label="Toggle Gender"
               >
                 {myGender === 'male' ? '♂' : '♀'}
               </button>
             </div>
          </div>

          <DisplayScreen 
            chainLabels={getDisplayLabels()} 
            result={result} 
            loadingState={loadingState}
            lang={language}
            onClear={handleClear}
          />

          {/* Keypad Grid */}
          <div className="grid grid-cols-4 gap-3 mt-2">
            
            {/* Row 1: Functional Buttons */}
            <button 
              onClick={() => setMyGender(prev => prev === 'male' ? 'female' : 'male')}
              className="col-span-1 aspect-square rounded-xl bg-[#5d1a1a] hover:bg-[#6d2a2a] active:scale-95 text-yellow-100/70 font-medium text-sm border-b-4 border-[#3d0a0a] flex flex-col items-center justify-center transition-all"
            >
               <span className="text-xs opacity-50 mb-1">{UI_TEXT[language].swap}</span>
               <span>{myGender === 'male' ? '♂' : '♀'}</span>
            </button>

            <button 
              onClick={handleUndo}
              className="col-span-1 aspect-square rounded-xl bg-[#5d1a1a] hover:bg-[#6d2a2a] active:scale-95 text-yellow-100 font-medium text-lg border-b-4 border-[#3d0a0a] transition-all flex items-center justify-center"
            >
              ↩
            </button>

            <button 
              onClick={handleClear}
              className="col-span-1 aspect-square rounded-xl bg-[#5d1a1a] hover:bg-[#6d2a2a] active:scale-95 text-red-300 font-bold text-sm border-b-4 border-[#3d0a0a] transition-all flex items-center justify-center"
            >
              AC
            </button>

            <button 
              onClick={handleCalculate}
              disabled={loadingState === LoadingState.CALCULATING || chain.length === 0}
              className="col-span-1 aspect-square rounded-xl bg-[#B8860B] hover:bg-[#C8961B] active:scale-95 text-[#4a0a0a] font-bold text-xl border-b-4 border-[#8B6508] transition-all flex items-center justify-center shadow-[0_0_15px_rgba(184,134,11,0.4)] disabled:opacity-50 disabled:shadow-none"
            >
              =
            </button>

            {/* Relatives Buttons - Now includes Cousins */}
            {RELATION_BUTTONS.map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleAddRelation(btn)}
                className={`col-span-1 aspect-square rounded-xl bg-[#FF6B6B] hover:bg-[#FF7C7C] active:scale-95 text-white border-b-4 border-[#CE4040] transition-all flex flex-col items-center justify-center shadow-sm relative overflow-hidden group ${btn.id.includes('cousin') ? 'bg-[#ff8585]' : ''}`}
              >
                <div className="absolute top-1 right-1 text-[10px] opacity-40 font-bold">
                  {btn.gender === 'm' ? '♂' : '♀'}
                </div>
                <span className={`font-bold leading-none break-words text-center px-1 ${
                  RELATION_LABELS[language][btn.id].length > 6 ? 'text-[9px]' : 
                  language === 'zh' ? 'text-lg' : 'text-[10px]'
                }`}>
                  {RELATION_LABELS[language][btn.id]}
                </span>
              </button>
            ))}

          </div>
        </div>

        <div className="pb-4 text-center opacity-30 text-[10px] font-mono">
           Gemini 2.5 Flash Powered
        </div>
      </div>
    </div>
  );
};

export default App;