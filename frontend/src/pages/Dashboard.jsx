import { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/dashboard').then(res => setStats(res.data));
  }, []);

  if (!stats) return <div className="text-center mt-20 animate-pulse">Loading Dashboard...</div>;

  const chartData = {
    labels: stats.recentSessions.map((_, i) => `Session ${i + 1}`),
    datasets: [{
      label: 'Quiz Score (%)',
      data: stats.recentSessions.map(s => (s.quiz_score / s.total_questions) * 100),
      borderColor: '#14b8a6', backgroundColor: '#14b8a6', tension: 0.3
    }]
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Your Progress</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Videos Studied', val: stats.totalVideos },
          { label: 'Average Score', val: `${stats.avgScore}%` },
          { label: 'Est. Time Saved', val: `${stats.timeSaved} mins` }
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-navy-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">{kpi.label}</p>
            <p className="text-4xl font-black text-teal-500 mt-2">{kpi.val}</p>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-navy-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700">
        <h2 className="text-xl font-bold mb-6">Recent Performance</h2>
        <div className="h-64"><Line data={chartData} options={{ maintainAspectRatio: false, color: '#94a3b8' }} /></div>
      </div>
    </div>
  );
}