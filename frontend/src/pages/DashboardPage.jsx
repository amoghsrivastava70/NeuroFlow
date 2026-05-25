import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, BarChart2, Clock, Flame, GraduationCap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { fetchDashboard } from '../lib/api';
import { formatDate, formatDuration } from '../lib/utils';
import { Badge, Skeleton, EmptyState } from '../components/SharedUI';
import { useCountUp } from '../hooks/useCountUp';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard().then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const scoreTimeline = (data.recentSessions || []).map((session) => ({
    date: session.ended_at,
    score: Math.round((session.quiz_score / session.total_questions) * 100),
  }));

  const kpis = [
    { label: "Videos Studied", value: data.totalVideos, icon: BookOpen, color: "text-accent-indigo" },
    { label: "Average Score", value: data.avgScore, suffix: "%", icon: BarChart2, color: "text-accent-teal" },
    { label: "Hours Saved", value: Math.round((data.timeSaved || 0) / 60), icon: Clock, color: "text-accent-amber" },
    { label: "Quiz Sessions", value: data.recentSessions?.length || 0, icon: Flame, color: "text-accent-rose" }
  ];

  const chartGrid = 'rgb(var(--color-border) / 0.18)';
  const chartAxis = 'rgb(var(--color-text-faint))';
  const chartText = 'rgb(var(--color-text-muted))';
  const chartSurface = 'rgb(var(--color-card))';
  const chartAccent = 'rgb(var(--color-accent-indigo))';
  const chartSupport = 'rgb(var(--color-accent-teal))';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-6xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-display font-bold mb-2">Learning Dashboard</h1>
        <p className="text-text-muted text-lg">Track your progress and mastery over time.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {kpis.map((kpi, i) => (
          <KPICard key={i} {...kpi} delay={i * 0.1} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Timeline Chart */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-xl mb-6">Quiz Performance</h3>
          {scoreTimeline.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} vertical={false} />
                  <XAxis dataKey="date" stroke={chartAxis} tick={{ fill: chartText }} tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, {month:'short', day:'numeric'})} />
                  <YAxis stroke={chartAxis} tick={{ fill: chartText }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: chartSurface, borderColor: chartAccent, borderRadius: '12px', color: 'rgb(var(--color-text-primary))' }} />
                  <Line type="monotone" dataKey="score" stroke={chartAccent} strokeWidth={3} dot={{ fill: chartSupport, strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="h-[300px] flex items-center justify-center"><p className="text-text-muted">Take a quiz to see your performance timeline.</p></div>}
        </div>

        {/* Topic Mastery */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-xl mb-6">Topic Mastery</h3>
          {false ? (
             <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topicMastery} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke={chartAxis} tick={{ fill: chartText }} />
                  <YAxis type="category" dataKey="topic" stroke={chartAxis} tick={{ fill: chartText }} width={120} tickFormatter={(t) => t.length > 20 ? t.substring(0,20)+'...' : t} />
                  <Tooltip cursor={{ fill: 'rgb(var(--color-accent-indigo) / 0.08)' }} contentStyle={{ backgroundColor: chartSurface, borderColor: chartAccent, borderRadius: '12px', color: 'rgb(var(--color-text-primary))' }} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {data.topicMastery.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score > 70 ? chartSupport : entry.score > 40 ? chartAccent : 'rgb(var(--color-accent-rose))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="h-[300px] flex items-center justify-center"><p className="text-text-muted">No topic data available yet.</p></div>}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-border/20">
          <h3 className="font-bold text-xl">Recent Sessions</h3>
        </div>
        {data.recentSessions?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-card-hover/70 text-text-muted text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Video Title</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Score</th>
                  <th className="p-4 font-medium">Time</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/15">
                {data.recentSessions.map(session => {
                  const percent = Math.round((session.quiz_score / session.total_questions) * 100);
                  return (
                    <tr key={session.id} onClick={() => navigate('/library')} className="cursor-pointer transition-colors group hover:bg-card-hover/60">
                      <td className="p-4 font-medium max-w-[300px] truncate group-hover:text-accent-indigo transition">{session.title || `Video ID: ${session.video_id}`}</td>
                      <td className="p-4 text-text-muted">{formatDate(session.ended_at)}</td>
                      <td className="p-4 font-bold">{session.quiz_score}/{session.total_questions} <span className="text-xs text-text-muted ml-1">({percent}%)</span></td>
                      <td className="p-4 text-text-muted">{formatDuration(session.time_spent_seconds)}</td>
                      <td className="p-4"><Badge variant={percent >= 70 ? 'success' : 'warning'}>{percent >= 70 ? 'Passed' : 'Review'}</Badge></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : <EmptyState icon={GraduationCap} title="No sessions yet" subtitle="Complete a quiz to see your history here." />}
      </div>
    </motion.div>
  );
}

function KPICard({ label, value, suffix = '', icon: Icon, color, delay }) {
  const numValue = parseFloat(value) || 0;
  const animatedValue = useCountUp(numValue);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card p-6 relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 w-24 h-24 bg-current opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-500 ${color}`} />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h4 className="text-text-muted font-medium text-sm uppercase tracking-wider">{label}</h4>
        <Icon size={20} className={color} />
      </div>
      <div className="text-4xl font-display font-bold relative z-10">
        {animatedValue}{suffix}
      </div>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto mt-10 space-y-8">
      <div className="grid grid-cols-4 gap-6"><Skeleton className="h-32"/><Skeleton className="h-32"/><Skeleton className="h-32"/><Skeleton className="h-32"/></div>
      <div className="grid grid-cols-2 gap-8"><Skeleton className="h-[350px]"/><Skeleton className="h-[350px]"/></div>
      <Skeleton className="h-64" />
    </div>
  );
}
