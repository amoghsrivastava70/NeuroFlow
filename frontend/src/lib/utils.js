export const formatDuration = (seconds) => {
    if (!seconds) return "0 min";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}min` : `${m} min`;
  };
  
  export const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  export const scorePercent = (score, total) => {
    if (!total) return 0;
    return Math.round((score / total) * 100);
  };
  
  export const scoreColor = (percent) => {
    if (percent >= 70) return "text-accent-teal";
    if (percent >= 40) return "text-accent-amber";
    return "text-accent-rose";
  };
  
  export const getYouTubeThumbnail = (youtubeId) => `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;