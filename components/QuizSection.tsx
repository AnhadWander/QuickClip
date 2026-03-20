"use client";

/**
 * components/QuizSection.tsx
 * Interactive multiple-choice quiz based on the transcript.
 * Shows score after all questions are answered.
 */

import { useState } from "react";
import type { SummaryResult } from "@/lib/types";
import { Brain, CheckCircle2, XCircle, Trophy } from "lucide-react";

interface Props {
  quiz: SummaryResult["quiz"];
}

type AnswerState = "unanswered" | "correct" | "incorrect";

export default function QuizSection({ quiz }: Props) {
  const [answers, setAnswers] = useState<(string | null)[]>(
    new Array(quiz.length).fill(null)
  );
  const [revealed, setRevealed] = useState<boolean[]>(
    new Array(quiz.length).fill(false)
  );

  if (!quiz?.length) return null;

  const handleAnswer = (qIdx: number, option: string) => {
    if (revealed[qIdx]) return; // Can't change after reveal
    const newAnswers = [...answers];
    newAnswers[qIdx] = option;
    setAnswers(newAnswers);

    const newRevealed = [...revealed];
    newRevealed[qIdx] = true;
    setRevealed(newRevealed);
  };

  const score = answers.filter(
    (a, i) => a === quiz[i].correctAnswer
  ).length;

  const allAnswered = revealed.every(Boolean);
   const handleRetake = () => {
    setAnswers(new Array(quiz.length).fill(null));
    setRevealed(new Array(quiz.length).fill(false));
  };

  const getOptionState = (qIdx: number, option: string): AnswerState => {
    if (!revealed[qIdx]) return "unanswered";
    if (option === quiz[qIdx].correctAnswer) return "correct";
    if (option === answers[qIdx]) return "incorrect";
    return "unanswered";
  };

  const optionStyles = (state: AnswerState) => ({
    borderColor:
      state === "correct"
        ? "var(--color-success)"
        : state === "incorrect"
        ? "var(--color-error)"
        : "var(--color-border)",
    background:
      state === "correct"
        ? "rgba(34,197,94,0.08)"
        : state === "incorrect"
        ? "rgba(248,113,113,0.08)"
        : "var(--color-surface-2)",
  });

  const letters = ["A", "B", "C", "D"];

  return (
    <div className="section-card fade-in-up fade-in-up-delay-4">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ padding: "0.35rem", borderRadius: 8, background: "rgba(167,139,250,0.12)" }}>
            <Brain size={16} color="var(--color-accent)" />
          </div>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Quiz
          </h3>
        </div>
        {allAnswered && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.9rem", borderRadius: 999, background: "rgba(250,204,21,0.1)", border: "1px solid rgba(250,204,21,0.25)", color: "#fbbf24" }}>
            <Trophy size={15} />
            <span style={{ fontWeight: 700, fontSize: "0.88rem" }}>
              {score}/{quiz.length} correct
            </span>
          </div>
        )}
        
        {allAnswered && (
          <button
            onClick={handleRetake}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: 999,
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "var(--color-accent)",
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: "pointer",
            }}
          >
            Retake Quiz
          </button>
        )}
        
      </div>

      {/* Questions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {quiz.map((q, qIdx) => (
          <div key={qIdx}>
            <p style={{ fontWeight: 600, color: "var(--color-text)", marginBottom: "0.875rem", lineHeight: 1.5, fontSize: "0.97rem" }}>
              <span style={{ color: "var(--color-accent)", marginRight: "0.4rem", fontFamily: "monospace" }}>
                Q{qIdx + 1}.
              </span>
              {q.question}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {q.options.map((option, oIdx) => {
                const state = getOptionState(qIdx, option);
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleAnswer(qIdx, option)}
                    disabled={revealed[qIdx]}
                    className="quiz-option"
                    style={{
                      ...optionStyles(state),
                      cursor: revealed[qIdx] ? "default" : "pointer",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <span style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: state === "correct" ? "rgba(34,197,94,0.2)" : state === "incorrect" ? "rgba(248,113,113,0.2)" : "rgba(99,102,241,0.12)",
                      border: `1px solid ${state === "correct" ? "rgba(34,197,94,0.4)" : state === "incorrect" ? "rgba(248,113,113,0.4)" : "rgba(99,102,241,0.25)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: "0.72rem", flexShrink: 0,
                      color: state === "correct" ? "var(--color-success)" : state === "incorrect" ? "var(--color-error)" : "var(--color-accent)",
                    }}>
                      {state === "correct" ? <CheckCircle2 size={14} /> : state === "incorrect" ? <XCircle size={14} /> : letters[oIdx]}
                    </span>
                    <span style={{ color: "var(--color-text)", fontSize: "0.92rem", lineHeight: 1.4 }}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {revealed[qIdx] && (
              <div style={{
                marginTop: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: 10,
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.2)",
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.6,
              }}>
                <span style={{ fontWeight: 600, color: "var(--color-accent)" }}>Explanation: </span>
                {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
