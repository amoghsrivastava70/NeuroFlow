import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';

export default function Study() {
  const { youtubeId } = useParams();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('summary');
  const [error, setError] = useState('');

  // Quiz State
  const [qIndex, setQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Flashcard State
  const [fIndex, setFIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/videos/${youtubeId}`)
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load study pack.'));
  }, [youtubeId]);

  const handleAnswer = (opt) => {
    if (selectedOpt) return;
    setSelectedOpt(opt);
    if (opt === data.questions[qIndex].correct_option) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (qIndex < data.questions.length - 1) {
      setQIndex(qIndex + 1);
      setSelectedOpt(null);
    } else {
      setQuizFinished(true);
      axios.post('http://localhost:5000/api/sessions', {
        youtubeId, time_spent_seconds: 300, quiz_score: score + (selectedOpt === data.questions[qIndex].correct_option ? 1 : 0), total_questions: data.questions.length
      });
    }
  };

  if (error) return <div className="text-red-500">{error}</div>;
  if (!data) return <div className="text-center py-20 animate-pulse text-teal-500">Loading Study Pack...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex gap-6 items-center mb-8">
        <img src={data.video.thumbnail_url} alt="thumbnail" className="w-48 rounded-xl shadow-lg border border-gray-200 dark:border-navy-700" />
        <div>
          <h1 className="text-3xl font-bold mb-2">{data.video.title}</h1>
          <p className="text-gray-500 dark:text-gray-400">{data.video.channel}</p>
        </div>
      </div>

      <div className="flex border-b border-gray-200 dark:border-navy-800 mb-8">
        {['summary', 'quiz', 'flashcards'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-6 py-4 font-semibold capitalize transition-colors ${tab === t ? 'text-teal-500 border-b-2 border-teal-500' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-navy-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-navy-700 min-h-[400px]">

        {/* SUMMARY */}
        {tab === 'summary' && (
          <ul className="space-y-4 list-disc pl-6 text-lg text-slate-700 dark:text-slate-300">
            {data.summary.map((pt, i) => <li key={i}>{pt}</li>)}
          </ul>
        )}

        {/* QUIZ */}
        {tab === 'quiz' && !quizFinished && (
          <div>
            <p className="text-sm font-bold text-teal-500 mb-4">Question {qIndex + 1} of {data.questions.length}</p>
            <h2 className="text-2xl font-bold mb-6">{data.questions[qIndex].question_text}</h2>
            <div className="space-y-3">
              {['a', 'b', 'c', 'd'].map((opt) => {
                const isSelected = selectedOpt === opt;
                const isCorrect = data.questions[qIndex].correct_option === opt;
                const showCorrect = selectedOpt && isCorrect;
                const showWrong = isSelected && !isCorrect;
                return (
                  <button key={opt} onClick={() => handleAnswer(opt)} disabled={!!selectedOpt}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${!selectedOpt ? 'border-gray-200 dark:border-navy-700 hover:border-teal-500 dark:hover:border-teal-500' : showCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : showWrong ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-navy-700 opacity-50'}`}
                  >
                    <span className="uppercase font-bold mr-3 text-gray-400">{opt}</span>
                    {data.questions[qIndex][`option_${opt}`]}
                    {showCorrect && <CheckCircle className="inline float-right text-green-500" />}
                    {showWrong && <XCircle className="inline float-right text-red-500" />}
                  </button>
                );
              })}
            </div>
            {selectedOpt && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-navy-900 rounded-xl">
                <p className="font-semibold text-slate-700 dark:text-slate-300 mb-4"><span className="text-teal-500">Explanation:</span> {data.questions[qIndex].explanation}</p>
                <button onClick={nextQuestion} className="bg-teal-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-teal-600">Next Question</button>
              </div>
            )}
          </div>
        )}

        {tab === 'quiz' && quizFinished && (
          <div className="text-center py-10">
            <h2 className="text-4xl font-bold mb-4">Quiz Complete!</h2>
            <p className="text-2xl mb-8">You scored <span className="text-teal-500 font-bold">{score}</span> / {data.questions.length}</p>
            <button onClick={() => { setQIndex(0); setScore(0); setQuizFinished(false); setSelectedOpt(null); }} className="bg-navy-800 dark:bg-white text-white dark:text-navy-900 px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto">
              <RefreshCw size={20} /> Retry Quiz
            </button>
          </div>
        )}

        {/* FLASHCARDS */}
        {tab === 'flashcards' && (
          <div className="flex flex-col items-center">
            <p className="text-sm font-bold text-teal-500 mb-6">Card {fIndex + 1} of {data.flashcards.length}</p>
            <div className="relative w-full max-w-lg h-64 perspective-1000 cursor-pointer" onClick={() => setFlipped(!flipped)}>
              <div className={`w-full h-full transition-transform duration-500 transform-style-3d relative ${flipped ? 'rotate-y-180' : ''}`}>
                <div className="absolute w-full h-full backface-hidden bg-gray-50 dark:bg-navy-900 rounded-2xl flex items-center justify-center p-8 border-2 border-teal-500/20 shadow-lg">
                  <h3 className="text-2xl font-bold text-center">{data.flashcards[fIndex].front_text}</h3>
                </div>
                <div className="absolute w-full h-full backface-hidden bg-teal-500 text-white rounded-2xl flex items-center justify-center p-8 rotate-y-180 shadow-lg">
                  <p className="text-xl font-medium text-center">{data.flashcards[fIndex].back_text}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => { setFIndex(Math.max(0, fIndex - 1)); setFlipped(false); }} disabled={fIndex === 0} className="p-3 rounded-full bg-gray-200 dark:bg-navy-700 disabled:opacity-50"><ArrowLeft /></button>
              <button onClick={() => { setFIndex(Math.min(data.flashcards.length - 1, fIndex + 1)); setFlipped(false); }} disabled={fIndex === data.flashcards.length - 1} className="p-3 rounded-full bg-gray-200 dark:bg-navy-700 disabled:opacity-50"><ArrowRight /></button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}