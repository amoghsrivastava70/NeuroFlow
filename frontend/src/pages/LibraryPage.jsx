import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, GraduationCap } from 'lucide-react';
import { fetchVideos } from '../lib/api';
import { formatDuration, formatDate } from '../lib/utils';
import { Badge, Skeleton, EmptyState, Button } from '../components/SharedUI';

export default function LibraryPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos().then(res => setVideos(res.data || [])).finally(() => setLoading(false));
  }, []);

  const tabs = ['All', 'Not Started', 'In Progress', 'Completed'];

  const filteredVideos = videos.filter(v => {
    const status = v.last_score === null || v.last_score === undefined ? 'Not Started' : 'Completed';
    if (filter !== 'All' && status !== filter) return false;
    if (search && !v.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <LibrarySkeleton />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">My Library</h1>
          <p className="text-text-muted">{videos.length} video{videos.length !== 1 ? 's' : ''} processed</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" size={18} />
            <input type="text" placeholder="Search videos..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-card/90 border border-border/25 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-accent-indigo w-full sm:w-64 placeholder:text-text-faint" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter === t ? 'bg-accent-indigo text-white shadow-[0_0_18px_rgba(59,130,246,0.35)]' : 'bg-card/70 text-text-muted hover:bg-card-hover hover:text-text-primary border border-border/20'}`}>
            {t}
          </button>
        ))}
      </div>

      {filteredVideos.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Your library is empty" subtitle={search || filter !== 'All' ? "No videos match your current filters." : "Paste a YouTube URL on the home page to start building your library."} action={!search && filter === 'All' ? <Button onClick={() => navigate('/')}>Go to Home</Button> : null} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredVideos.map((video, i) => {
              const status = video.last_score === null || video.last_score === undefined ? 'Not Started' : 'Completed';
              return (
                <motion.div key={video.youtube_id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2, delay: i * 0.05 }} onClick={() => navigate(`/study/${video.youtube_id}`)} className="glass-card cursor-pointer group flex flex-col h-full overflow-hidden">
                <div className="relative aspect-video overflow-hidden">
                  <img src={video.thumbnail_url} alt="thumbnail" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute top-3 right-3">
                    <Badge variant={status === 'Completed' ? 'success' : 'neutral'} className="backdrop-blur-md bg-overlay/40 text-white border-white/15">{status}</Badge>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-overlay/78 backdrop-blur-md px-2 py-1 rounded text-xs font-semibold text-white">
                    {formatDuration(video.duration_seconds)}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-lg line-clamp-2 leading-snug mb-2 group-hover:text-accent-indigo transition-colors">{video.title}</h3>
                  <p className="text-text-faint text-sm mb-4 mt-auto">{video.channel}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-border/20">
                    <span className="text-xs text-text-muted">{formatDate(video.processed_at)}</span>
                    {video.last_score !== null && video.last_score !== undefined ? (
                      <span className="text-sm font-bold text-accent-teal">Score: {video.last_score}</span>
                    ) : (
                      <span className="text-xs text-text-muted uppercase">Unscored</span>
                    )}
                  </div>
                </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

function LibrarySkeleton() {
  return (
    <div className="max-w-7xl mx-auto mt-10">
      <div className="flex justify-between mb-10"><Skeleton className="w-48 h-10"/><Skeleton className="w-64 h-10"/></div>
      <div className="grid grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-72" />)}
      </div>
    </div>
  );
}
