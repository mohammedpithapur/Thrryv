import React, { useState, useEffect } from 'react';
import { PlusCircle, Loader2, CheckCircle, AlertTriangle, X } from 'lucide-react';
import LocalDB from '../utils/localDB';
import { extractFramesFromVideo, fileToBase64 } from '../utils/mediaUtils';
import { callGroq } from '../utils/groqApi';

const UploadPage = ({ onUploadComplete, currentUser }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [caption, setCaption] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('groq_key') || '');

  useEffect(() => {
    if (apiKey) localStorage.setItem('groq_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    if (file && apiKey && !analysis && !analyzing) {
      runAgentAnalysis();
    }
  }, [file, apiKey]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setAnalysis(null);
    }
  };

  const runAgentAnalysis = async () => {
    if (!file || !apiKey) return;
    setAnalyzing(true);
    try {
      let frames = [];
      const isVideo = file.type.startsWith('video');
      if (isVideo) {
        frames = await extractFramesFromVideo(file);
      } else {
        const base64 = await fileToBase64(file);
        frames = [base64];
      }

      const contentPayload = [
        { type: "text", text: "You are the 'Thrryv Guardian'. Analyze this content. Return JSON: { \"safety_check\": { \"is_safe\": boolean, \"reason\": \"string\" }, \"quality_score\": { \"total\": 0-100 }, \"coach_feedback\": \"short tip\" }" },
        ...frames.map(f => ({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${f}` } }))
      ];

      const result = await callGroq(apiKey, contentPayload);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
      alert("Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePost = async () => {
    if (!analysis || !currentUser) return;
    
    const reputationGain = Math.round((analysis.quality_score?.total || 50) / 10);

    const newPost = {
      username: currentUser.username,
      avatar: currentUser.avatar,
      userScore: currentUser.reputationScore + reputationGain,
      image: preview, 
      caption: caption,
      reputationGain: reputationGain,
      type: file.type.startsWith('video') ? 'video' : 'image',
    };

    LocalDB.addPost(newPost);
    onUploadComplete();
  };

  return (
    <div className="pb-20 max-w-md mx-auto bg-white min-h-screen pt-8 px-6 flex flex-col">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Post Your Experience</h2>
        <p className="text-gray-500 text-sm">Upload content to show your skills and earn reputation.</p>
      </div>

      {!apiKey && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
           <input 
            type="password" 
            placeholder="Enter Groq API Key..."
            className="w-full bg-white border border-gray-200 p-2 rounded text-sm outline-none focus:border-black transition"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
      )}

      <div className="flex-1">
        {!preview ? (
          <div className="relative w-full aspect-[4/5] bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition flex flex-col items-center justify-center cursor-pointer group">
             <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-50" />
             <div className="w-12 h-12 rounded-full bg-white grid place-items-center shadow-sm mb-3 group-hover:scale-110 transition">
               <PlusCircle className="w-6 h-6 text-gray-400" />
             </div>
             <p className="font-bold text-gray-400">Tap to Upload</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative shadow-lg">
                {file.type.startsWith('video') ? (
                  <video src={preview} className="w-full h-full object-cover" />
                ) : (
                  <img src={preview} className="w-full h-full object-cover" alt="prev" />
                )}
                <button onClick={() => {setPreview(null); setFile(null); setAnalysis(null);}} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70">
                  <X className="w-4 h-4" />
                </button>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Write your reflection here</label>
              <textarea 
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-gray-100 rounded-xl p-4 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-black/5 transition resize-none"
                placeholder="Share your thoughts..."
              />
            </div>

            {analyzing ? (
               <div className="flex items-center justify-center p-4 text-gray-500 text-sm">
                 <Loader2 className="w-4 h-4 animate-spin mr-2" />
                 Verifying content authenticity...
               </div>
            ) : analysis ? (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase text-gray-400">Agent Verdict</span>
                    {analysis.safety_check?.is_safe ? (
                      <span className="text-green-600 text-xs font-bold flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Verified</span>
                    ) : (
                      <span className="text-red-600 text-xs font-bold flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> Flagged</span>
                    )}
                 </div>
                 
                 <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm">Quality Score</span>
                    <span className="font-black text-xl">{analysis.quality_score?.total || 0}/100</span>
                 </div>
                 
                 <p className="text-xs text-gray-600 italic border-l-2 border-black pl-3 py-1">
                   "{analysis.coach_feedback}"
                 </p>
              </div>
            ) : null}

            {analysis?.safety_check?.is_safe && (
              <button 
                onClick={handlePost}
                className="w-full bg-black text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition"
              >
                Post
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;