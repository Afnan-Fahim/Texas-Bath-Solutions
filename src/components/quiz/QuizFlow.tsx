import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuizCard } from "./QuizCard";
import { supabase } from "@/integrations/supabase/client";

export type QuizState = {
  desiredUpgrade: string;
  mainProblem: string;
  timeline: string;
  phone: string;
  address: string;
  homeowner: "Yes" | "No" | "";
};

const QUIZ_DATA = {
  question1: {
    title: "What do you want most?",
    description: "Tap the picture that fits.",
    options: [
      { id: "Walk-in shower", label: "Walk-in shower", image: "/images/quiz/walk-in-shower.jpg" },
      { id: "New tub remodel", label: "New tub remodel", image: "/images/quiz/new-tub.jpg" },
    ],
  },
  question2: {
    title: "What's the main problem?",
    description: "What's driving you crazy right now?",
    options: [
      { id: "Hard to step over", label: "Hard to step over", image: "/images/quiz/hard-step.jpg" },
      { id: "Looks dated", label: "Looks dated", image: "/images/quiz/looks-dated.jpg" },
      { id: "Leak or damage", label: "Leak or damage", image: "/images/quiz/leak.jpg" },
      { id: "Not guest-ready", label: "Not guest-ready", image: "/images/quiz/not-guest-ready.jpg" },
    ],
  },
  question3: {
    title: "When do you want it done?",
    description: "Pick the one that matches your timeline.",
    options: [
      { id: "ASAP", label: "ASAP" },
      { id: "2 weeks", label: "2 weeks" },
      { id: "1–3 months", label: "1–3 months" },
      { id: "Just looking", label: "Just looking" },
    ],
  },
};

interface QuizFlowProps {
  onComplete: (data: QuizState) => Promise<void>;
  onShowCalendly: (data: QuizState) => void;
  calendlyCompleted: boolean;
}

export function QuizFlow({ onComplete, onShowCalendly, calendlyCompleted }: QuizFlowProps) {
  const [step, setStep] = useState(1);
  const [quizData, setQuizData] = useState<any>(QUIZ_DATA);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await supabase
          .from("quiz_settings")
          .select("quiz_data")
          .eq("id", 1)
          .single();

        if (data && data.quiz_data) {
          setQuizData(data.quiz_data);
        }
      } catch (err) {
        console.error("Failed to load dynamic quiz data", err);
      } finally {
        setIsLoadingQuiz(false);
      }
    };
    fetchQuiz();
  }, []);

  const [state, setState] = useState<QuizState>({
    desiredUpgrade: "",
    mainProblem: "",
    timeline: "",
    phone: "",
    address: "",
    homeowner: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const currentStep = calendlyCompleted ? 4 : step;

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const updateState = (key: keyof QuizState, value: string) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const handleOptionSelect = (key: keyof QuizState, value: string) => {
    updateState(key, value);
    setTimeout(() => {
      if (key === "timeline") {
        onShowCalendly({ ...state, timeline: value });
      } else {
        handleNext();
      }
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.phone || !state.address || !state.homeowner) {
      setError("Please fill out all fields.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onComplete(state);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (isLoadingQuiz) {
    return <div className="w-full max-w-2xl mx-auto p-12 text-center text-muted-foreground">Loading quiz...</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-card rounded-[2rem] shadow-2xl border border-teal/20 relative overflow-hidden transition-all duration-500 group hover:shadow-[0_10px_50px_rgba(13,59,102,0.12)]">
      
      {/* Decorative gradient backgrounds */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-teal/10 blur-3xl opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-navy/5 blur-3xl opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity duration-700"></div>
      
      {/* "Start Here" Attention Grabber for the first step */}
      {currentStep === 1 && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-4 z-20">
          <span className="flex h-8 items-center justify-center rounded-full bg-teal px-4 text-xs font-bold uppercase tracking-wider text-white shadow-md animate-bounce">
            Start Here
          </span>
        </div>
      )}

      <div className="relative z-10 p-5 sm:p-8 md:p-10">
        {/* Progress */}
      {currentStep <= 3 && (
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`text-sm font-medium transition-opacity ${currentStep === 1 ? "opacity-0" : "opacity-100 text-muted-foreground hover:text-foreground"}`}
          >
            ← Back
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentStep} of 3
          </span>
          <div className="w-12"></div>
        </div>
      )}

      {/* QUESTION 1 */}
      {currentStep === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{quizData.question1.title}</h2>
            <p className="text-muted-foreground">{quizData.question1.description}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quizData.question1.options.map((opt: any) => (
              <QuizCard
                key={opt.id}
                title={opt.label}
                image={opt.image}
                selected={state.desiredUpgrade === opt.id}
                onClick={() => handleOptionSelect("desiredUpgrade", opt.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* QUESTION 2 */}
      {currentStep === 2 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{quizData.question2.title}</h2>
            <p className="text-muted-foreground">{quizData.question2.description}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quizData.question2.options.map((opt: any) => (
              <QuizCard
                key={opt.id}
                title={opt.label}
                image={opt.image}
                selected={state.mainProblem === opt.id}
                onClick={() => handleOptionSelect("mainProblem", opt.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* QUESTION 3 */}
      {currentStep === 3 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{quizData.question3.title}</h2>
            <p className="text-muted-foreground">{quizData.question3.description}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quizData.question3.options.map((opt: any) => (
              <Button
                key={opt.id}
                variant={state.timeline === opt.id ? "default" : "outline"}
                className={`h-auto py-4 text-lg border-2 ${state.timeline === opt.id ? "border-primary" : "border-border hover:border-primary/50"}`}
                onClick={() => handleOptionSelect("timeline", opt.id)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* FINAL CAPTURE FORM (After Calendly) */}
      {currentStep === 4 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-2 leading-tight">You're all set —<br />just confirm the visit.</h2>
            <p className="text-muted-foreground text-base mt-4">Free estimate at your house from a local Texas company. No pressure. We just need a phone and address so we can show up.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6 mx-auto text-left">
            {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 rounded-md">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="quiz-phone" className="text-base font-semibold text-navy">Mobile phone *</Label>
              <Input
                id="quiz-phone"
                type="tel"
                placeholder="(   ) ___-____"
                className="h-12 text-base"
                value={state.phone}
                onChange={(e) => updateState("phone", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quiz-address" className="text-base font-semibold text-navy">Street address *</Label>
              <Input
                id="quiz-address"
                type="text"
                placeholder="123 Main St, Apt # or Unit"
                className="h-12 text-base"
                value={state.address}
                onChange={(e) => updateState("address", e.target.value)}
                required
              />
            </div>

            <div className="space-y-4 pt-2">
              <Label className="text-base font-semibold text-navy">Are you the homeowner?</Label>
              <div className="flex gap-8">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${state.homeowner === "Yes" ? "border-navy" : "border-border group-hover:border-navy"}`}>
                    {state.homeowner === "Yes" && <div className="w-3 h-3 bg-navy rounded-full" />}
                  </div>
                  <input 
                    type="radio" 
                    name="homeowner" 
                    value="Yes"
                    className="hidden"
                    onChange={(e) => updateState("homeowner", e.target.value)}
                    required
                  />
                  <span className="text-lg text-foreground">Yes</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${state.homeowner === "No" ? "border-navy" : "border-border group-hover:border-navy"}`}>
                    {state.homeowner === "No" && <div className="w-3 h-3 bg-navy rounded-full" />}
                  </div>
                  <input 
                    type="radio" 
                    name="homeowner" 
                    value="No"
                    className="hidden"
                    onChange={(e) => updateState("homeowner", e.target.value)}
                    required
                  />
                  <span className="text-lg text-foreground">No.</span>
                </label>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full h-14 text-lg bg-[#0d2240] hover:bg-[#0d2240]/90 text-white mt-8" disabled={submitting}>
              {submitting ? "Confirming..." : "Confirm my visit"}
            </Button>
          </form>
        </div>
      )}
      </div>
    </div>
  );
}
