import React, { useState } from "react";
import * as Sentry from "@sentry/react";
import toast from "react-hot-toast";

// Add this button component to your app to test Sentry's error tracking
export default function ErrorButton() {
  const [eventId, setEventId] = useState(null);

  const handleBreakTheWorld = () => {
    try {
      // 1. Send Sentry log before the error
      Sentry.logger.info("User triggered test error", {
        action: "test_error_button_click",
      });

      // 2. Send Sentry test metric counter
      Sentry.metrics.count("test_counter", 1);

      // 3. Generate the test error
      throw new Error("This is your first error!");
    } catch (error) {
      // 4. Capture the exception in Sentry and transmit it without letting
      // the React development runtime error overlay crash the screen
      const id = Sentry.captureException(error);
      setEventId(id);
      toast.success("Test error captured and sent to Sentry!");
      console.log("Sentry event sent with ID:", id);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-red-900/30 transition cursor-pointer"
        onClick={handleBreakTheWorld}
      >
        Break the world
      </button>

      {eventId && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-center max-w-sm animate-in fade-in">
          <p className="text-xs font-bold text-emerald-400">
            ✓ Error successfully captured by Sentry!
          </p>
          <p className="text-[11px] text-slate-300 mt-1">
            Event ID: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[10px]">{eventId}</code>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Check your Sentry dashboard under Issues and Metrics.
          </p>
        </div>
      )}
    </div>
  );
}
