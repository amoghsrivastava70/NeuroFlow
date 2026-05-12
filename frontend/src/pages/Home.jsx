import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleProcess = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/process', { url });
      navigate(`/study/${res.data.videoId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-center pt-20">
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
        Turn watching into <span className="text-teal-500">learning.</span>
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
        Paste any educational YouTube URL. We extract the transcript, clean it, and use AI to generate summaries, quizzes, and flashcards instantly.
      </p>

      <form onSubmit={handleProcess} className="relative shadow-2xl rounded-2xl overflow-hidden flex bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700">
        <input 
          type="url" 
          required
          placeholder="https://youtube.com/watch?v=..."
          className="flex-1 px-6 py-5 bg-transparent outline-none text-lg text-slate-800 dark:text-white placeholder-gray-400"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-teal-500 hover:bg-teal-600 text-white px-8 font-semibold flex items-center gap-2 transition-colors"
        >
          {loading ? <><Loader2 className="animate-spin" /> Processing...</> : <><ArrowRight /> Generate</>}
        </button>
      </form>
      {error && <p className="mt-4 text-red-500 font-medium">{error}</p>}
      
      {loading && (
        <div className="mt-12 space-y-4 max-w-2xl mx-auto">
           <div className="h-4 bg-gray-200 dark:bg-navy-800 rounded animate-pulse w-3/4 mx-auto"></div>
           <div className="h-4 bg-gray-200 dark:bg-navy-800 rounded animate-pulse w-1/2 mx-auto"></div>
        </div>
      )}
    </div>
  );
}