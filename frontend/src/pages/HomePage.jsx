import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link2, Sparkles, Loader2, PlayCircle } from 'lucide-react';
import { processVideo, fetchVideos } from '../lib/api';
import { Button, ErrorMessage, Skeleton, Badge } from '../components/SharedUI';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, error
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingStage, setLoadingStage] = useState(0);
  const [recent, setRecent] = useState([]);
  const navigate = useNavigate();

  const loadingMessages = ["Fetching transcript...", "Generating AI content...", "Finalizing study pack..."];

  useEffect(() => {
    fetchVideos().then(res => setRecent(res.data.slice(0, 3) || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (status === 'loading') {
      const interval = setInterval(() => {
        setLoadingStage(prev => (prev < 2 ? prev + 1 : prev));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      setErrorMsg("Please enter a valid YouTube URL.");
      setStatus('error');
      return;
    }
    setStatus('loading');
    setLoadingStage(0);
    try {
      const res = await processVideo(url);
      navigate(`/study/${res.data.videoId}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Something went wrong. Please retry.");
      setStatus('error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-[calc(100vh-80px)] flex flex-col relative">
      <div className="absolute inset-0 bg-dot-grid -z-10 opacity-80 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(circle_at_top,rgb(var(--color-page-glow)/0.18),transparent_72%)]" />
      
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <Badge variant="default" className="mb-6"><Sparkles size={14} className="inline mr-2 -mt-0.5" /> AI-Powered Learning</Badge>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight relative">
          <div className="absolute inset-0 blur-3xl bg-accent-indigo/20 rounded-full -z-10" />
          Turn Watching Into <span className="bg-clip-text text-transparent bg-gradient-primary">Learning</span>
        </h1>
        
        <p className="text-xl text-text-muted mb-12 max-w-2xl">
          Paste any YouTube lecture URL and instantly get a smart summary, interactive quiz, and flashcards.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-3xl relative mb-8">
          <div className="relative flex items-center">
            <Link2 className="absolute left-6 text-text-faint" size={24} />
            <input 
              type="text" 
              value={url}
              onChange={(e) => { setUrl(e.target.value); setStatus('idle'); }}
              placeholder="Paste YouTube URL here..."
              disabled={status === 'loading'}
              className="w-full pl-16 pr-48 py-5 rounded-2xl bg-card/90 border border-border/30 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo outline-none text-lg transition-all shadow-[0_20px_60px_rgba(30,64,175,0.12)] placeholder:text-text-faint disabled:opacity-50"
            />
            <Button type="submit" disabled={status === 'loading'} className="absolute right-2 py-3 px-8">
              Generate
            </Button>
          </div>
        </form>

        {status === 'error' && <div className="max-w-3xl w-full text-left"><ErrorMessage message={errorMsg} /></div>}
        
        {status === 'loading' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 text-accent-indigo font-medium bg-accent-indigo/10 px-6 py-3 rounded-full border border-accent-indigo/20">
            <Loader2 className="animate-spin" />
            {loadingMessages[loadingStage]}
          </motion.div>
        )}

        {recent.length > 0 && status !== 'loading' && (
          <div className="mt-24 w-full max-w-5xl text-left">
            <h3 className="font-display font-bold text-xl mb-6">Continue Learning</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recent.map((video, i) => (
                <motion.div key={video.youtube_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} onClick={() => navigate(`/study/${video.youtube_id}`)} className="glass-card cursor-pointer p-3 group flex items-center gap-4">
                  <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 relative">
                     <img src={video.thumbnail_url} className="w-full h-full object-cover" alt="thumb" />
                     <div className="absolute inset-0 bg-overlay/28 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><PlayCircle className="text-white dark:text-white" /></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm line-clamp-2 leading-snug group-hover:text-accent-indigo transition-colors">{video.title}</h4>
                    <p className="text-xs text-text-faint mt-1 truncate">{video.channel}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </motion.div>
  );
}
