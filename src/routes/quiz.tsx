import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { QuizFlow, QuizState } from "@/components/quiz/QuizFlow";
import { CalendlyEmbed, trackLeadEvent } from "./index";
import logoImg from "@/assets/logo-header.webp";
import { submitLead } from "@/lib/leads.functions";

export const Route = createFileRoute("/quiz")({
  component: QuizPage,
});

function QuizPage() {
  const [calendlyCompleted, setCalendlyCompleted] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);
  const [quizData, setQuizData] = useState<QuizState | null>(null);

  const handleShowCalendly = (data: QuizState) => {
    setQuizData(data);
    setShowCalendly(true);
  };

  const handleCalendlyScheduled = () => {
    setCalendlyCompleted(true);
    setShowCalendly(false); // Go back to quiz flow for final lead form (step 5)
  };

  const handleCalendlyBack = () => {
    setShowCalendly(false);
  };

  const handleQuizComplete = async (finalData: QuizState) => {
    try {
      const notes = [
        `Homeowner: ${finalData.homeowner}`,
        `Upgrade: ${finalData.desiredUpgrade}`,
        `Problem: ${finalData.mainProblem}`
      ].join('\n');

      const leadData = {
        name: "Provided in Calendly", // We don't ask for name anymore in step 5
        email: "calendly@provided.com",
        phone: finalData.phone,
        address: finalData.address,
        timeframe: finalData.timeline,
        notes: notes,
        source: "Facebook/Messenger Quiz",
      };

      // Save the lead to the database
      await submitLead({ data: leadData });
      trackLeadEvent(`quiz:${finalData.phone}`, { phone: finalData.phone });

      alert("Thank you! Your visit is confirmed.");
      const mw = (window as any).MessengerExtensions;
      if (mw) {
        mw.requestCloseBrowser(
          function success() {
            // Closed webview successfully
          },
          function error(err: any) {
            window.location.href = "/";
          }
        );
      } else {
        window.location.href = "/";
      }
    } catch (e) {
      console.error(e);
      alert("Failed to submit. Please try again.");
      throw e;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
      <header className="w-full bg-background border-b border-border py-4 px-6 flex justify-center shadow-sm z-10 relative">
        <a href="/">
          <img src={logoImg} alt="Texas Bath Solutions" className="h-10 object-contain" />
        </a>
      </header>

      <main className="flex-1 w-full flex flex-col justify-center py-12 px-4 sm:px-6 relative">
        <div className={showCalendly ? "hidden" : "block w-full"}>
          <QuizFlow
            onShowCalendly={handleShowCalendly}
            onComplete={handleQuizComplete}
            calendlyCompleted={calendlyCompleted}
          />
        </div>

        <div className={showCalendly ? "block w-full max-w-3xl mx-auto bg-background p-6 rounded-2xl shadow-sm border border-border" : "hidden"}>
          <CalendlyEmbed
            prefill={{
              name: "",
              email: "",
              phone: "",
            }}
            onBack={handleCalendlyBack}
            onScheduled={handleCalendlyScheduled}
            title="Pick a time for your free estimate"
            subtitle="Lock in your appointment to discuss your project."
          />
        </div>
      </main>
    </div>
  );
}
