import { useEffect, useState, useRef, useCallback } from "react";

interface QuestionType {
  question: string;
  options: string[];
  correctAnswer: string;
}

function generateQuestion(): QuestionType {
  const { text, answer, options } = generateOperation();
  return {
    question: text,
    options: options.map((opt) => opt.toString()),
    correctAnswer: answer.toString(),
  };
}

function generateOperation() {
  const ops = [
    { symbol: "+", method: (a: number, b: number) => a + b },
    { symbol: "-", method: (a: number, b: number) => a - b },
    { symbol: "×", method: (a: number, b: number) => a * b },
  ];

  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const opIndex = Math.floor(Math.random() * ops.length);
  const op = ops[opIndex];
  const answer = op.method(a, b);

  const optionsSet = new Set<number>([answer]);
  while (optionsSet.size < 4) {
    const offset = Math.floor(Math.random() * 5) + 1;
    const sign = Math.random() > 0.5 ? 1 : -1;
    const distractor = answer + sign * offset;
    optionsSet.add(distractor);
  }

  const optionsArray = Array.from(optionsSet);
  for (let i = optionsArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [optionsArray[i], optionsArray[j]] = [optionsArray[j], optionsArray[i]];
  }

  return {
    text: `${a} ${op.symbol} ${b} = ?`,
    answer,
    options: optionsArray,
  };
}

export function MathQuiz() {
  const totalQuestions = 10;
  const [timeLeft, setTimeLeft] = useState(10);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionType>(() => generateQuestion());
  const [progressCircles, setProgressCircles] = useState<Array<"correct" | "wrong" | "unanswered">>(
    Array(totalQuestions).fill("unanswered")
  );
  const [quizFinished, setQuizFinished] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (quizFinished) return;

    if (timeLeft > 0) {
      const countdown = window.setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(countdown);
    }

    if (timeLeft === 0) {
      setIsTimeUp(true);
      setProgressCircles((prev) => {
        const arr = [...prev];
        arr[questionNumber - 1] = "unanswered";
        return arr;
      });

      timeoutRef.current = window.setTimeout(() => {
        if (questionNumber < totalQuestions) {
          resetQuestion();
        } else {
          setQuizFinished(true);
        }
      }, 2000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [timeLeft, questionNumber, quizFinished]);

  const handleAnswerSelect = (option: string) => {
    if (isTimeUp || selectedAnswer) return;

    setSelectedAnswer(option);

    if (option === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
      setProgressCircles((prev) => {
        const arr = [...prev];
        arr[questionNumber - 1] = "correct";
        return arr;
      });
    } else {
      setProgressCircles((prev) => {
        const arr = [...prev];
        arr[questionNumber - 1] = "wrong";
        return arr;
      });
    }

    timeoutRef.current = window.setTimeout(() => {
      if (questionNumber < totalQuestions) {
        resetQuestion();
      } else {
        setQuizFinished(true);
      }
    }, 1500);
  };

  const resetQuestion = useCallback(() => {
    setCurrentQuestion(generateQuestion());
    setTimeLeft(10);
    setIsTimeUp(false);
    setSelectedAnswer(null);
    setQuestionNumber((prev) => prev + 1);
  }, []);

  const restartQuiz = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setCurrentQuestion(generateQuestion());
    setTimeLeft(10);
    setIsTimeUp(false);
    setSelectedAnswer(null);
    setQuestionNumber(1);
    setScore(0);
    setProgressCircles(Array(totalQuestions).fill("unanswered"));
    setQuizFinished(false);
  };

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl overflow-hidden md:max-w-2xl mt-4 sm:mt-10 border border-indigo-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Matematika Testi
          </h2>
          <span className="ml-3 bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full">
            Savol {questionNumber}/{totalQuestions}
          </span>
        </div>
        <div className={`flex items-center ${timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-indigo-500"}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-bold text-lg">{timeLeft}s</span>
        </div>
      </div>

      <div className="flex justify-center space-x-3 mb-6">
        {progressCircles.map((status, index) => (
          <div
            key={index}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
              status === "correct"
                ? "bg-green-500 border-2 border-green-600"
                : status === "wrong"
                ? "bg-red-500 border-2 border-red-600"
                : "bg-white border-2 border-indigo-300"
            }`}
          >
            {status === "correct" ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : status === "wrong" ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <span className="text-xs text-indigo-500 font-bold">{index + 1}</span>
            )}
          </div>
        ))}
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="bg-white border border-indigo-200 rounded-xl px-4 py-2 shadow-sm">
          <span className="text-sm font-medium text-indigo-700">To'g'ri javoblar:</span>
          <span className="ml-2 text-lg font-bold text-indigo-800">{score}</span>
        </div>
        <div className="bg-white border border-indigo-200 rounded-xl px-4 py-2 shadow-sm">
          <span className="text-sm font-medium text-indigo-700">Umumiy:</span>
          <span className="ml-2 text-lg font-bold text-indigo-800">{totalQuestions}</span>
        </div>
      </div>

      {!quizFinished && (
        <div className="text-center mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100 mb-6">
            <p className="text-4xl sm:text-5xl font-bold text-indigo-900 mb-4">
              {currentQuestion.question}
            </p>
          </div>
        </div>
      )}

      {!quizFinished && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {currentQuestion.options.map((option, index) => {
            const isCorrect = option === currentQuestion.correctAnswer;
            const isSelected = selectedAnswer === option;
            
            let buttonClass = "bg-white text-indigo-800 border-indigo-200 hover:bg-indigo-50";
            
            if (isSelected) {
              buttonClass = isCorrect 
                ? "bg-green-100 text-green-800 border-green-300" 
                : "bg-red-100 text-red-800 border-red-300";
            } else if (isTimeUp && isCorrect) {
              buttonClass = "bg-green-50 text-green-800 border-green-300";
            }

            return (
              <button
                key={index}
                className={`flex items-center justify-between p-4 rounded-xl border-2 shadow-sm transition-all duration-200 transform hover:scale-[1.02] ${buttonClass}`}
                onClick={() => handleAnswerSelect(option)}
                disabled={isTimeUp || !!selectedAnswer || quizFinished}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <span className="text-indigo-700 font-bold">{String.fromCharCode(65 + index)}</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-medium">{option}</span>
                </div>
                
                {isSelected && (
                  <div className="w-6 h-6">
                    {isCorrect ? (
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {!quizFinished && selectedAnswer && (
        <div
          className={`mb-6 p-4 rounded-xl text-center text-lg font-medium shadow-md transition-all ${
            selectedAnswer === currentQuestion.correctAnswer
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {selectedAnswer === currentQuestion.correctAnswer
            ? "✅ To'g'ri! Ajoyib javob!"
            : "❌ Noto'g'ri. Keyingi safar yaxshiroq urinib ko'ring!"}
        </div>
      )}

      {!quizFinished && isTimeUp && !selectedAnswer && (
        <div className="mb-6 p-4 bg-amber-100 text-amber-800 rounded-xl text-center font-medium border border-amber-300">
          <div className="flex items-center justify-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>⏰ Vaqt tugadi! To'g'ri javob: {currentQuestion.correctAnswer}</span>
          </div>
        </div>
      )}

      {quizFinished && (
        <div className="mb-6 p-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl text-center border border-indigo-200 shadow-lg">
          <div className="mb-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-indigo-800 mb-3">Test Yakunlandi!</h3>
            <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {score}/{totalQuestions}
            </div>
            <div className="text-indigo-700 mb-6">
              {score === totalQuestions 
                ? "💯 Ajoyib natija! Siz barcha savollarga to'g'ri javob berdingiz!"
                : score >= totalQuestions * 0.8
                ? "🎉 Juda yaxshi! Siz matematikada juda zo'rsiz!"
                : score >= totalQuestions * 0.6
                ? "👍 Yaxshi natija! Biroz mashq qilishingiz kerak!"
                : "✏️ O'rganishda davom eting! Keyingi safar yaxshiroq natija ko'rsatasiz!"}
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={restartQuiz}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Testni Qayta Boshlash
            </button>
          </div>
        </div>
      )}
      
      <div className="text-center text-sm text-indigo-500 mt-4">
        Matematika bilimingizni sinab ko'ring
      </div>
    </div>
  );
}