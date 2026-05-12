import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Library() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/videos').then(res => setVideos(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Study Library</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {videos.map(v => (
          <Link key={v.youtube_id} to={`/study/${v.youtube_id}`} className="bg-white dark:bg-navy-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-navy-700 hover:shadow-lg hover:border-teal-500 transition-all group">
            <div className="relative h-48 overflow-hidden">
              <img src={v.thumbnail_url} alt="Thumb" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg mb-1 truncate">{v.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{new Date(v.processed_at).toLocaleDateString()}</p>
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-teal-500 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-full">
                  {v.last_score !== null ? `Last Score: ${v.last_score}` : 'Not Started'}
                </span>
              </div>
            </div>
          </Link>
        ))}
        {videos.length === 0 && <p className="text-gray-500 col-span-3">No videos processed yet. Go to Home to add one!</p>}
      </div>
    </div>
  );
}