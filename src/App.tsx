import { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";

interface Question {
  question: string;
  choices: string[];
  answer: number;
  reason?: string;
}

export default function QuizExamApp() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== "string") {
          throw new Error("Failed to read file content");
        }
        const jsonData = JSON.parse(result) as Question[];

        // Validate JSON structure
        if (!Array.isArray(jsonData)) {
          throw new Error("JSON must be an array of questions");
        }

        jsonData.forEach((q, index) => {
          if (
            !q.question ||
            !q.choices ||
            !Array.isArray(q.choices) ||
            typeof q.answer !== "number"
          ) {
            throw new Error(`Invalid question structure at index ${index}`);
          }
        });

        setQuestions(jsonData);
        setUserAnswers({});
        setCurrentQuestion(0);
        setShowResults(false);
        setExamStarted(false);
        setUploadError("");
      } catch (error) {
        setUploadError(
          "Invalid JSON format. Please check your file structure.",
        );
        console.error("JSON parsing error:", error);
      }
    };
    reader.readAsText(file);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answerIndex,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const finishExam = () => {
    setShowResults(true);
  };

  const restartExam = () => {
    setUserAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setExamStarted(false);
  };

  const calculateResults = () => {
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(userAnswers).length;
    const correctAnswers = questions.reduce((acc, question, index) => {
      return acc + (userAnswers[index] === question.answer ? 1 : 0);
    }, 0);

    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      score:
        totalQuestions > 0
          ? ((correctAnswers / totalQuestions) * 100).toFixed(1)
          : 0,
    };
  };

  const getScoreColor = (score: number | string) => {
    const numScore = typeof score === "string" ? parseFloat(score) : score;
    if (numScore >= 80) return "text-green-600";
    if (numScore >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Upload Screen
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <FileText className="mx-auto h-16 w-16 text-indigo-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Exam</h1>
            <p className="text-gray-600">Upload your JSON quiz file to start</p>
          </div>

          <div className="mb-6">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-indigo-500 mb-2" />
                <p className="text-sm text-indigo-600 font-medium">
                  Click to upload JSON file
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".json"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">{uploadError}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600">
            <p className="font-medium mb-2">Expected JSON format:</p>
            <pre className="bg-gray-800 text-green-400 p-2 rounded text-xs overflow-x-auto">
              {`[{
  "question": "What is...?",
  "choices": ["A", "B", "C", "D"],
  "answer": 0,
  "reason": "Explanation..."
}]`}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (showResults) {
    const results = calculateResults();

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Exam Results
            </h1>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {results.totalQuestions}
                </div>
                <div className="text-sm text-blue-800">Total Questions</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.correctAnswers}
                </div>
                <div className="text-sm text-green-800">Correct Answers</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {results.totalQuestions - results.correctAnswers}
                </div>
                <div className="text-sm text-red-800">Incorrect</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div
                  className={`text-2xl font-bold ${getScoreColor(results.score)}`}
                >
                  {results.score}%
                </div>
                <div className="text-sm text-purple-800">Final Score</div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={restartExam}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Retake Exam
              </button>
              <button
                onClick={() => {
                  setQuestions([]);
                  setUserAnswers({});
                  setCurrentQuestion(0);
                  setShowResults(false);
                  setExamStarted(false);
                }}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Upload New Quiz
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Detailed Review
            </h2>
            <div className="space-y-6">
              {questions.map((question, index) => {
                const userAnswer = userAnswers[index];
                const isCorrect = userAnswer === question.answer;
                const wasAnswered = userAnswer !== undefined;

                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${isCorrect ? "border-green-200 bg-green-50" : wasAnswered ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"}`}
                  >
                    <div className="flex items-start gap-3">
                      {wasAnswered ? (
                        isCorrect ? (
                          <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                        )
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-gray-400 mt-1 flex-shrink-0"></div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800 mb-2">
                          Question {index + 1}: {question.question}
                        </h3>
                        <div className="space-y-1 mb-3">
                          {question.choices.map(
                            (choice: string, choiceIndex: number) => {
                              const isUserChoice = userAnswer === choiceIndex;
                              const isCorrectChoice =
                                question.answer === choiceIndex;

                              return (
                                <div
                                  key={choiceIndex}
                                  className={`p-2 rounded text-sm ${
                                    isCorrectChoice
                                      ? "bg-green-200 text-green-800 font-medium"
                                      : isUserChoice
                                        ? "bg-red-200 text-red-800"
                                        : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {String.fromCharCode(65 + choiceIndex)}.{" "}
                                  {choice}
                                  {isCorrectChoice && " ✓"}
                                  {isUserChoice && !isCorrectChoice && " ✗"}
                                </div>
                              );
                            },
                          )}
                        </div>
                        {question.reason && (
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm text-blue-800">
                            <strong>Explanation:</strong> {question.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pre-exam Screen
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <FileText className="mx-auto h-16 w-16 text-indigo-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Start?
          </h1>
          <p className="text-gray-600 mb-6">
            You have {questions.length} questions to answer. Take your time and
            read each question carefully.
          </p>
          <button
            onClick={() => setExamStarted(true)}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  // Exam Screen
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm text-gray-600">
                Progress: {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {question.question}
          </h2>

          <div className="space-y-3 mb-8">
            {question.choices.map((choice: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  userAnswers[currentQuestion] === index
                    ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="font-medium mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                {choice}
              </button>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={finishExam}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Finish Exam
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Next
              </button>
            )}
          </div>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-500">
              Answered: {Object.keys(userAnswers).length} / {questions.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
