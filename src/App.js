import React, { useState, useRef, useEffect } from 'react';
import { Upload, BookOpen, Sparkles, Download, Wand2, Camera, Loader2, Star, Scroll, Moon, Book, Flame } from 'lucide-react';

// ==========================================
// 🔴 PASTE YOUR GOOGLE API KEY BELOW
// ==========================================
const apiKey = "AIzaSyA9b6hO_2k5iu_o5pbwffNcoU7zxD6dXPU"; 


// --- 1. CONFIGURATION & CONSTANTS ---
const JEWISH_THEMES = {
  "Holidays": [
    "Shabbat Shalom", "Rosh Hashana (The New Year)", "Yom Kippur (Day of Atonement)",
    "Sukkot (In the Sukkah)", "Simchat Torah (Dancing with Torah)", "Hanukkah (The Festival of Lights)",
    "Tu B'Shvat (Birthday of Trees)", "Purim (Costumes & Joy)", "Passover (The Seder Night)",
    "Lag B'Omer (Bonfires)", "Shavuot (Receiving the Torah)"
  ],
  "Daily Routine": [
    "Modeh Ani (Waking Up)", "Netilat Yadayim (Washing Hands)", "Making Brachot (Blessings on Food)",
    "Giving Tzedakah (Charity)", "Gemilut Chasadim (Helping Others)", "Kriat Shema (Going to Sleep)"
  ],
  "Special Events": [
    "Upsherin (First Haircut - Boy 3yo)", "First Day of Cheder/School", "Baking Challah",
    "Lighting Shabbat Candles", "Visiting the Kotel (Western Wall)", "Finding the Afikoman"
  ]
};

const STYLE_PROMPT_SUFFIX = `depicted in a stylized-realist, feature-animation aesthetic: a high-resolution digital 3D render with PBR materials and HDRI natural daylight. Use a complementary warm-accent vs cool-blue palette (teal/blue environment with warm focal tones), high-key exposure, soft global illumination, gentle rim and bounce light, and subtle bloom. Keep surfaces matte-clean with fine micro-detail (fabric/skin roughness), no ink outlines, smooth shading, and crisp anti-aliasing. Compose with the rule of thirds and strong volumetric depth (foreground → midground → background), mild depth-of-field, and an eye-level camera on a normal lens. Maintain an optimistic, family-friendly mood with polished CG finish and restrained grading—no heavy grain or vignette. full body.`;

// --- 2. API FUNCTIONS ---

async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
}

async function analyzeCharacter(base64Image) {
  const prompt = `
    Analyze this image and create a precise visual prompt description of the main person for an AI image generator.
    Format: "A stylized 3D animated [boy/girl/man/woman], [hair color] hair in [style], [eye color] eyes, wearing [specific clothing], [skin tone] skin".
    Keep it strictly descriptive of the person only. No background, no actions. 
    Example: "A stylized 3D animated boy, curly brown hair, round glasses, blue t-shirt, denim shorts, fair skin".
  `;
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/png", data: base64Image } }
        ]
      }]
    })
  });

  if (!response.ok) throw new Error("Failed to analyze image. Check API Key.");
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text ? text.replace(/Here is a description.*:/i, '').trim() : "A stylized 3D animated character";
}

async function generateStory(name, theme, age) {
  const systemPrompt = `You are a writer for Aish, creating a high-quality children's book.
  Write a 10-page story.

  STYLE GUIDE RULES (STRICTLY FOLLOW):
  1. Tone: Speak with clarity and authority. Be direct. Be authentic. Do not be corny, cheesy, or sappy. 
  2. Voice: Use ACTIVE voice (e.g., "The boy lit the candle" NOT "The candle was lit by the boy").
  3. Perspective: Engage the reader with "you" (e.g., "When you light the menorah") instead of "we".
  4. Spellings: Hanukkah, Rosh Hashana, Shabbat (not Shabbos unless specific context), God (Capital G).
  5. Terms: Use "Jewish" instead of "Judaism". Use "Torah observant" instead of "Orthodox".
  
  CRITICAL: In 'scene_description', 'cover_scene', and 'end_scene', describe ONLY the background, lighting, and action. 
  DO NOT describe the main character's appearance (hair, clothes, face) because that is handled by a separate system.
  
  Output valid JSON:
  {
    "title": "Book Title",
    "cover_scene": "Description of the cover background and action...",
    "end_scene": "Description of a heartwarming final image, typically the character waving goodbye or looking happy at home...",
    "pages": [
      { "text": "Story text...", "scene_description": "Action and background description..." }
    ]
  }
  `;

  const userPrompt = `
  Name: ${name}
  Theme: ${theme}
  Audience: ${age}
  
  Create a story that teaches about the selected Jewish value or tradition.
  Ensure there are exactly 10 pages.
  For 'scene_description', focus on the environment, Jewish symbols (e.g., Menorah, Sukkah, Siddur if applicable), and what the character is doing.
  `;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) throw new Error("Failed to generate story");
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(text);
}

async function generateImage(characterDesc, sceneDesc) {
  const finalPrompt = encodeURIComponent(`Make ${characterDesc}, ${sceneDesc}, ${STYLE_PROMPT_SUFFIX}`);
  const seed = Math.floor(Math.random() * 100000);
  return `https://pollinations.ai/p/${finalPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;
}

// --- 3. COMPONENTS ---

const DancingChasidim = () => (
  <svg width="100" height="80" viewBox="0 0 100 80" className="mx-auto my-4">
    <style>
      {`
        @keyframes dance {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .dancer-1 { animation: dance 0.8s ease-in-out infinite; }
        .dancer-2 { animation: dance 0.8s ease-in-out infinite 0.2s; }
        .dancer-3 { animation: dance 0.8s ease-in-out infinite 0.4s; }
      `}
    </style>
    <g className="dancer-1" fill="#1B1B1B">
      <circle cx="20" cy="30" r="10" />
      <rect x="12" y="20" width="16" height="4" />
      <rect x="14" y="10" width="12" height="15" />
      <path d="M10 40 L30 40 L35 70 L5 70 Z" />
    </g>
    <g className="dancer-2" fill="#FA4B0E">
      <circle cx="50" cy="30" r="10" />
      <rect x="42" y="20" width="16" height="4" />
      <rect x="44" y="10" width="12" height="15" />
      <path d="M40 40 L60 40 L65 70 L35 70 Z" />
    </g>
    <g className="dancer-3" fill="#1B1B1B">
      <circle cx="80" cy="30" r="10" />
      <rect x="72" y="20" width="16" height="4" />
      <rect x="74" y="10" width="12" height="15" />
      <path d="M70 40 L90 40 L95 70 L65 70 Z" />
    </g>
  </svg>
);

const LoadingStep = ({ text, active }) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${active ? 'bg-orange-50 border border-orange-200 shadow-sm' : 'opacity-50'}`}>
    {active ? <Loader2 className="w-5 h-5 text-[#FA4B0E] animate-spin" /> : <div className="w-5 h-5 rounded-full border-2 border-gray-300" />}
    <span className={active ? 'text-[#1B1B1B] font-medium' : 'text-gray-500'}>{text}</span>
  </div>
);

// --- 4. MAIN APPLICATION ---

export default function MagicStorybook() {
  const [step, setStep] = useState('input'); 
  const [formData, setFormData] = useState({ name: '', category: 'Holidays', theme: 'Shabbat Shalom', age: 'Toddler (2-4 years)', image: null, imagePreview: null });
  const [progress, setProgress] = useState({ status: '', percent: 0, logs: [] });
  const [bookData, setBookData] = useState(null);
  const [error, setError] = useState(null);
  const bookRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result.split(',')[1], imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setFormData(prev => ({
      ...prev,
      category: newCategory,
      theme: JEWISH_THEMES[newCategory][0] 
    }));
  };

  const addLog = (msg) => {
    setProgress(prev => ({ ...prev, logs: [...prev.logs, msg] }));
  };

  const createBook = async () => {
    if (!formData.name || !formData.theme || !formData.image) {
      setError("Please fill in all fields and upload a photo!");
      return;
    }

    setStep('processing');
    setError(null);
    setProgress({ status: 'analyzing', percent: 5, logs: ['Initializing creative engine...'] });

    try {
      // 1. Analyze Character
      addLog('Extracting character DNA from photo...');
      const charDescription = await retryOperation(() => analyzeCharacter(formData.image));
      addLog(`DNA Locked: ${charDescription.substring(0, 40)}...`);
      setProgress(prev => ({ ...prev, percent: 15, status: 'storyboarding' }));

      // 2. Write Story 
      addLog(`Writing story about "${formData.theme}"...`);
      const storyData = await retryOperation(() => generateStory(formData.name, formData.theme, formData.age));
      addLog(`Script written: "${storyData.title}"`);
      setProgress(prev => ({ ...prev, percent: 25, status: 'rendering' }));

      // 3. Generate Images
      const totalImages = storyData.pages.length + 2; 
      
      // Cover
      addLog(`Rendering Cover Art...`);
      const coverUrl = await retryOperation(() => generateImage(charDescription, storyData.cover_scene));
      addLog(`Cover Art complete.`);
      setProgress(prev => ({ ...prev, percent: 25 + (1/totalImages)*70 }));

      // Pages
      const finalPages = [];
      for (let i = 0; i < storyData.pages.length; i++) {
        addLog(`Rendering page ${i + 1} of ${storyData.pages.length}...`);
        const imageUrl = await retryOperation(() => generateImage(charDescription, storyData.pages[i].scene_description));
        finalPages.push({ ...storyData.pages[i], imageUrl });
        setProgress(prev => ({ ...prev, percent: 25 + ((i + 2) / totalImages) * 70 }));
      }

      // End Scene
      addLog(`Rendering The End...`);
      const endUrl = await retryOperation(() => generateImage(charDescription, storyData.end_scene || "smiling and waving goodbye in a warm, cozy room"));
      setProgress(prev => ({ ...prev, percent: 100 }));

      setBookData({ ...storyData, coverUrl, endUrl, pages: finalPages });
      setStep('result');
    } catch (err) {
      console.error(err);
      setError("Oh no! The animation studio had a hiccup. " + err.message);
      setStep('input');
    }
  };

  const downloadPDF = () => {
    if (!bookRef.current) return;
    const element = bookRef.current;
    // @ts-ignore
    window.html2pdf().set({
      margin: 0,
      filename: `${formData.name}_Storybook.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(element).save();
  };

  return (
    <div className="min-h-screen bg-white font-['Poppins'] text-[#1B1B1B] selection:bg-[#00FFD1] selection:text-[#1B1B1B]">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex flex-col select-none leading-none">
            <span className="text-sm font-medium text-[#1B1B1B] ml-1">My</span>
            <div className="flex items-center -mt-1">
              <span className="text-5xl font-bold tracking-tighter text-[#1B1B1B]">aish</span>
              <Flame className="w-8 h-8 text-[#FA4B0E] ml-0.5 fill-[#FA4B0E]" />
            </div>
            <span className="text-2xl font-normal text-[#FA4B0E] tracking-tight -mt-1 ml-1">AI Story</span>
          </div>
          
          {step === 'result' && (
            <button 
              onClick={() => setStep('input')}
              className="text-sm font-medium text-[#FA4B0E] border border-[#FA4B0E] px-4 py-2 rounded-full hover:bg-[#FA4B0E] hover:text-white transition-all"
            >
              Make Another Book
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        
        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full">!</div>
            <p>{error}</p>
          </div>
        )}

        {/* STEP 1: INPUT */}
        {step === 'input' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-6 text-[#1B1B1B] tracking-tight">
                Star in your own <br/>
                <span className="text-[#FA4B0E]">Jewish Adventure</span>
              </h1>
              <p className="text-xl text-[#303030] max-w-xl mx-auto leading-relaxed">
                choose a story, and create a personalized 3D storybook!
              </p>
            </div>

            <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-8 md:p-10 space-y-8">
              
              {/* Photo Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-bold uppercase tracking-wider text-[#303030]">The Star</label>
                <div className="relative group cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`border-4 border-dashed rounded-2xl p-8 transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[200px]
                    ${formData.imagePreview ? 'border-[#00FFD1] bg-[#F0FFFC]' : 'border-gray-200 hover:border-[#00CEA9] hover:bg-gray-50'}
                  `}>
                    {formData.imagePreview ? (
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="text-white w-8 h-8" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-[#F0FFFC] text-[#00CEA9] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8" />
                        </div>
                        <p className="font-bold text-[#1B1B1B] text-lg">Upload a Photo</p>
                        <p className="text-gray-400 text-sm mt-1">Clear face photos work best</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Name Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold uppercase tracking-wider text-[#303030]">Character Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="e.g., David"
                    className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#FA4B0E] focus:ring-0 font-bold text-lg outline-none transition-all placeholder:font-medium placeholder:text-gray-400 text-[#1B1B1B]"
                  />
                </div>

                {/* Age Group */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold uppercase tracking-wider text-[#303030]">Reader Age</label>
                  <select 
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({...prev, age: e.target.value}))}
                    className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#FA4B0E] focus:ring-0 font-bold text-lg outline-none transition-all text-[#1B1B1B] cursor-pointer"
                  >
                    <option>Toddler (1-3 years)</option>
                    <option>Preschool (3-5 years)</option>
                    <option>Early Reader (5-8 years)</option>
                    <option>Pre-Teen (8-12 years)</option>
                  </select>
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-bold uppercase tracking-wider text-[#303030]">Choose Category</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.keys(JEWISH_THEMES).map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange({ target: { value: cat } })}
                      className={`py-4 px-2 rounded-xl font-bold text-sm transition-all border-2 flex flex-col items-center gap-2
                        ${formData.category === cat 
                          ? 'bg-[#FA4B0E] border-[#FA4B0E] text-white shadow-lg shadow-orange-200' 
                          : 'bg-white border-gray-200 text-[#303030] hover:border-[#00CEA9]'}`}
                    >
                      {cat === 'Holidays' && <Star className="w-5 h-5" />}
                      {cat === 'Daily Routine' && <Moon className="w-5 h-5" />}
                      {cat === 'Special Events' && <Scroll className="w-5 h-5" />}
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific Theme Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-bold uppercase tracking-wider text-[#303030]">Choose Story Theme</label>
                <select 
                  value={formData.theme}
                  onChange={(e) => setFormData(prev => ({...prev, theme: e.target.value}))}
                  className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-[#FA4B0E] focus:ring-0 font-bold text-lg outline-none transition-all cursor-pointer text-[#1B1B1B]"
                >
                  {JEWISH_THEMES[formData.category].map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Create Button */}
              <div className="space-y-2 pt-4">
                <button 
                  onClick={createBook}
                  className="w-full py-5 rounded-full bg-[#FA4B0E] text-white font-bold text-xl tracking-wide shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
                >
                  <Wand2 className="w-6 h-6" />
                  Generate Storybook
                </button>
              </div>

            </div>
          </div>
        )}

        {/* STEP 2: PROCESSING */}
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
            {/* Custom Dancing Animation */}
            <div className="w-32 h-32 mb-4 relative flex items-center justify-center">
                <DancingChasidim />
            </div>
            
            <h2 className="text-3xl font-bold text-[#1B1B1B] mb-2">Creating Your Story...</h2>
            <p className="text-[#303030] mb-12 max-w-md">Our digital artists are writing and illustrating your book in high-fidelity 3D.</p>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 text-left space-y-4 border border-gray-100">
              <LoadingStep text="Analyzing Character DNA" active={progress.status === 'analyzing'} />
              <LoadingStep text="Writing Script" active={progress.status === 'storyboarding'} />
              <LoadingStep text={`Rendering Illustrations (${Math.floor((progress.percent - 25) / 6)}/12)`} active={progress.status === 'rendering'} />
            </div>
            
            <div className="w-full max-w-md mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#FA4B0E] transition-all duration-500" style={{ width: `${progress.percent}%` }}></div>
            </div>
            
            <div className="mt-8 h-48 w-full max-w-md overflow-y-auto bg-[#1B1B1B] rounded-lg p-4 font-mono text-xs text-[#00FFD1] text-left">
              {progress.logs.map((log, i) => (
                <div key={i} className="mb-1 opacity-80">{'>'} {log}</div>
              ))}
              <div className="animate-pulse">{'>'}_</div>
            </div>
          </div>
        )}

        {/* STEP 3: RESULT */}
        {step === 'result' && bookData && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-bold text-[#1B1B1B] mb-2">Your Book is Ready!</h2>
                <p className="text-[#303030] font-medium">Directed by You • Starring {formData.name}</p>
              </div>
              <button 
                onClick={downloadPDF}
                className="px-8 py-3 bg-[#1B1B1B] text-white rounded-full font-bold hover:bg-[#303030] transition-colors flex items-center gap-2 shadow-lg"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </div>

            {/* BOOK PREVIEW AREA */}
            <div id="book-content" ref={bookRef} className="bg-white shadow-2xl rounded-sm overflow-hidden print:shadow-none font-['Poppins']">
              
              {/* COVER PAGE */}
              <div className="w-full aspect-[1/1.4] relative flex flex-col break-after-page overflow-hidden">
                <img src={bookData.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>
                
                <div className="relative z-10 h-full flex flex-col justify-between p-12 text-center">
                    <div className="mt-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="text-[#FA4B0E] font-bold tracking-[0.2em] uppercase drop-shadow-md">My AISH AI Story</span>
                        </div>
                        <h1 className="text-7xl font-extrabold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] leading-tight">
                            {bookData.title}
                        </h1>
                    </div>
                    <div className="mb-8">
                        <div className="inline-block bg-[#FA4B0E] border-2 border-white/20 rounded-full px-8 py-2 mb-4 shadow-xl">
                            <p className="text-white font-bold text-lg tracking-widest uppercase">Starring {formData.name}</p>
                        </div>
                    </div>
                </div>
              </div>

              {/* PAGES */}
              {bookData.pages.map((page, idx) => (
                <div key={idx} className="w-full aspect-[1/1.4] flex flex-col bg-[#F9F9F9] break-after-page relative p-8">
                  <div className="absolute inset-4 border-2 border-gray-200 rounded-2xl pointer-events-none"></div>
                  
                  <div className="flex-1 flex flex-col z-10">
                      <div className="w-full h-[60%] relative p-4 pb-0">
                        <div className="w-full h-full rounded-xl overflow-hidden shadow-xl border-4 border-white relative">
                             <img 
                                src={page.imageUrl} 
                                alt={`Page ${idx + 1}`} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                      </div>

                      <div className="h-[40%] px-8 flex flex-col justify-center items-center text-center">
                        <div className="w-8 h-1 bg-[#FA4B0E] rounded-full mb-6"></div>
                        <p className="text-2xl md:text-[1.75rem] text-[#1B1B1B] leading-relaxed max-w-2xl font-medium">
                            {page.text}
                        </p>
                        <div className="mt-6 text-gray-400 font-bold text-sm tracking-widest">
                            PAGE {idx + 1}
                        </div>
                      </div>

                  </div>
                </div>
              ))}

               {/* BACK COVER */}
               <div className="w-full aspect-[1/1.4] relative flex flex-col break-after-page overflow-hidden">
                 <img src={bookData.endUrl} alt="The End" className="absolute inset-0 w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#1B1B1B] via-[#1B1B1B]/60 to-transparent"></div>

                 <div className="relative z-10 h-full flex flex-col justify-between p-12 text-center text-white">
                    <div className="mt-12">
                        <BookOpen className="w-16 h-16 text-[#FA4B0E] mx-auto mb-6 drop-shadow-md" />
                        <h3 className="text-6xl font-extrabold mb-2 drop-shadow-lg">The End</h3>
                        <div className="w-24 h-1 bg-[#FA4B0E] mx-auto rounded-full shadow-lg"></div>
                    </div>
                    
                    <div className="mb-8">
                         <div className="bg-[#1B1B1B]/80 backdrop-blur-md p-6 rounded-2xl border border-gray-700 shadow-2xl max-w-sm mx-auto">
                            <p className="text-gray-300 text-sm mb-4">Created specially for {formData.name}</p>
                            <div className="flex items-center justify-center gap-1 opacity-90">
                                <span className="font-bold">My</span>
                                <span className="font-bold text-xl">aish</span>
                                <Flame className="w-4 h-4 fill-white" />
                                <span className="text-sm">AI Story</span>
                            </div>
                         </div>
                    </div>
                 </div>
               </div>

            </div>

            <div className="text-center text-gray-400 text-sm pt-8 pb-12">
              <p>Tip: For best results when printing, enable "Background Graphics" in your printer settings.</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}