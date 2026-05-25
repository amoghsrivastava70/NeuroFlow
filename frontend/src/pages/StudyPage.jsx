import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { fetchStudyPack, saveSession } from '../lib/api';
import { formatDuration, scorePercent, scoreColor } from '../lib/utils';
import { Button, Badge, Skeleton, ErrorMessage } from '../components/SharedUI';
import { useCountUp } from '../hooks/useCountUp';

export default function StudyPage() {
  const { youtubeId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    loadData();
  }, [youtubeId]);

  const loadData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetchStudyPack(youtubeId);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load study pack.");
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className="max-w-3xl mx-auto mt-20"><ErrorMessage message={error} onRetry={loadData} /></div>;
  if (loading || !data) return <StudySkeleton />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto pb-20">
      
      {/* Header */}
      <div className="relative w-full h-[300px] rounded-2xl overflow-hidden shadow-2xl mb-8 group">
        <img src={data.video.thumbnail_url} className="w-full h-full object-cover" alt="Cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 p-2 bg-overlay/36 backdrop-blur-md rounded-full hover:bg-overlay/52 transition text-white"><ChevronLeft /></button>
        <div className="absolute bottom-6 left-6 right-6">
          <Badge variant="neutral" className="mb-3 backdrop-blur-md bg-overlay/30 text-white border-white/20"><Clock size={12} className="inline mr-1" /> {formatDuration(data.video.duration_seconds)}</Badge>
          <h1 className="text-3xl font-display font-bold text-white mb-1 drop-shadow-lg">{data.video.title}</h1>
          <p className="text-slate-200 font-medium">{data.video.channel}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-accent-indigo/20 mb-8 px-2 relative">
        {['summary', 'quiz', 'flashcards'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-lg font-semibold capitalize relative ${activeTab === tab ? 'text-accent-indigo' : 'text-text-muted hover:text-text-primary'}`}>
            {tab}
            {activeTab === tab && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-indigo shadow-[0_0_10px_#6366f1]" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'summary' && <SummaryTab summary={data.summary} onStartQuiz={() => setActiveTab('quiz')} />}
        {activeTab === 'quiz' && <QuizTab questions={data.questions} videoId={data.video.youtube_id} />}
        {activeTab === 'flashcards' && <FlashcardsTab cards={data.flashcards} />}
      </div>
    </motion.div>
  );
}

// --- SUB-COMPONENTS ---

function SummaryTab({ summary, onStartQuiz }) {
  return (
    <div className="glass-card p-8 md:p-12">
      <h2 className="text-2xl font-bold mb-8">Key Takeaways</h2>
      <div className="space-y-6">
        {summary.map((point, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex items-start gap-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30 flex items-center justify-center font-bold text-sm mt-0.5">
              {idx + 1}
            </div>
            <p className="text-lg text-text-primary leading-relaxed">{point}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-12 pt-8 border-t border-border/20 flex justify-end">
        <Button onClick={onStartQuiz}>Start Quiz <ArrowRight size={18} className="ml-2" /></Button>
      </div>
    </div>
  );
}

function QuizTab({ questions, videoId }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [startTime] = useState(Date.now());

  const q = questions[index];
  const isRevealed = selected !== null;

  const handleSelect = (opt) => {
    if (isRevealed) return;
    setSelected(opt);
    if (opt === q.correct_option) setScore(s => s + 1);
  };

  const handleNext = async () => {
    if (index < questions.length - 1) {
      setIndex(i => i + 1);
      setSelected(null);
    } else {
      setFinished(true);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      try {
        await saveSession({ youtubeId: videoId, time_spent_seconds: timeSpent, quiz_score: score + (selected === q.correct_option ? 1 : 0), total_questions: questions.length });
      } catch (e) { console.error("Failed to save session"); }
    }
  };

  if (finished) return <ScoreCard score={score} total={questions.length} onRetake={() => { setIndex(0); setSelected(null); setScore(0); setFinished(false); }} />;

  const options = [
    { id: 'a', text: q.option_a }, { id: 'b', text: q.option_b }, { id: 'c', text: q.option_c }, { id: 'd', text: q.option_d }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between text-sm font-semibold text-text-muted mb-4">
        <span>Question {index + 1} of {questions.length}</span>
        <span>Score: {score}</span>
      </div>
      <div className="w-full h-1 bg-card rounded-full mb-8 overflow-hidden"><div className="h-full bg-accent-indigo transition-all duration-300" style={{ width: `${((index) / questions.length) * 100}%` }} /></div>

      <AnimatePresence mode="wait">
        <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-8">
          <h3 className="text-xl md:text-2xl font-bold mb-8">{q.question_text}</h3>
          <div className="space-y-4">
            {options.map((opt) => {
              const isSelected = selected === opt.id;
              const isCorrect = q.correct_option === opt.id;
              
              let btnClass = "w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ";
              if (!isRevealed) {
                btnClass += "bg-card border-accent-indigo/20 hover:border-accent-indigo/50 hover:bg-card-hover";
              } else if (isCorrect) {
                btnClass += "bg-accent-teal/10 border-accent-teal text-text-primary";
              } else if (isSelected) {
                btnClass += "bg-accent-rose/10 border-accent-rose text-text-primary";
              } else {
                btnClass += "bg-card border-border/20 opacity-50 cursor-not-allowed";
              }

              return (
                <button key={opt.id} onClick={() => handleSelect(opt.id)} className={btnClass} disabled={isRevealed}>
                  <div className="flex gap-4 items-start">
                    <span className="font-bold opacity-70 uppercase">{opt.id}</span>
                    <span className={isRevealed && isCorrect ? 'text-white' : ''}>{opt.text}</span>
                  </div>
                  {isRevealed && isCorrect && <CheckCircle2 className="text-accent-teal shrink-0" />}
                  {isRevealed && isSelected && !isCorrect && <XCircle className="text-accent-rose shrink-0" />}
                </button>
              );
            })}
          </div>

          {isRevealed && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 pt-6 border-t border-border/20">
              <p className="text-text-muted mb-6"><span className="font-bold text-accent-indigo">Explanation:</span> {q.explanation}</p>
              <Button onClick={handleNext} className="w-full">{index === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}</Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ScoreCard({ score, total, onRetake }) {
  const percent = scorePercent(score, total);
  const animatedPercent = useCountUp(percent, 2000);
  const color = scoreColor(percent);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 text-center max-w-md mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-8">Quiz Complete!</h2>
      <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="96" cy="96" r="88" className="stroke-card-hover fill-none" strokeWidth="12" />
          <motion.circle cx="96" cy="96" r="88" className={`fill-none ${color}`} strokeWidth="12" strokeDasharray={553} strokeDashoffset={553 - (553 * animatedPercent) / 100} strokeLinecap="round" transition={{ duration: 2, ease: "easeOut" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-display font-bold ${color}`}>{animatedPercent}%</span>
          <span className="text-text-muted text-sm mt-1">{score} of {total} correct</span>
        </div>
      </div>
      <Button onClick={onRetake} className="w-full"><RefreshCw size={18} className="mr-2" /> Retake Quiz</Button>
    </motion.div>
  );
}

function FlashcardsTab({ cards }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [viewed, setViewed] = useState(new Set([0]));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === ' ') { e.preventDefault(); setFlipped(f => !f); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index]);

  const handleNext = () => { setFlipped(false); setTimeout(() => { setIndex(i => Math.min(cards.length - 1, i + 1)); setViewed(v => new Set(v).add(index + 1)); }, 150); };
  const handlePrev = () => { setFlipped(false); setTimeout(() => setIndex(i => Math.max(0, i - 1)), 150); };

  return (
    <div className="flex flex-col items-center py-10 max-w-2xl mx-auto">
      <div className="flex justify-between w-full mb-6 text-sm font-semibold text-text-muted">
        <span>Card {index + 1} of {cards.length}</span>
        <div className="flex gap-1.5 mt-1.5">
          {cards.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${viewed.has(i) ? 'bg-accent-indigo' : 'bg-border/40'}`} />)}
        </div>
      </div>

      <div className="relative w-full h-[350px] perspective-1000 cursor-pointer group" onClick={() => setFlipped(!flipped)}>
        <div className={`w-full h-full preserve-3d transition-transform duration-700 ease-out ${flipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front */}
          <div className="absolute inset-0 backface-hidden glass-card flex flex-col items-center justify-center p-10 text-center group-hover:border-accent-indigo/50">
            <span className="absolute top-6 text-xs font-bold tracking-widest text-accent-indigo/60 uppercase">Question</span>
            <h3 className="text-3xl font-display font-bold leading-tight">{cards[index].front_text}</h3>
            <span className="absolute bottom-6 text-sm text-text-faint opacity-0 group-hover:opacity-100 transition">Click or press Space to flip</span>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden glass-card flex flex-col items-center justify-center p-10 text-center rotate-y-180 bg-accent-indigo/5 border-accent-indigo/30">
            <span className="absolute top-6 text-xs font-bold tracking-widest text-accent-teal/60 uppercase">Answer</span>
            <p className="text-2xl text-text-primary leading-relaxed">{cards[index].back_text}</p>
          </div>

        </div>
      </div>

      <div className="flex gap-4 mt-12">
        <Button variant="secondary" onClick={handlePrev} disabled={index === 0} className="rounded-full w-14 h-14 p-0"><ChevronLeft size={24} /></Button>
        <Button variant="secondary" onClick={handleNext} disabled={index === cards.length - 1} className="rounded-full w-14 h-14 p-0"><ChevronRight size={24} /></Button>
      </div>
    </div>
  );
}

function StudySkeleton() {
  return (
    <div className="max-w-4xl mx-auto pb-20 mt-10">
      <Skeleton className="w-full h-[300px] mb-8" />
      <div className="flex gap-8 mb-8"><Skeleton className="w-24 h-6" /><Skeleton className="w-24 h-6" /></div>
      <div className="glass-card p-12 space-y-6">
        {[1,2,3,4,5].map(i => <Skeleton key={i} className="w-full h-8" />)}
      </div>
    </div>
  );
}
