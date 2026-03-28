import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { InputPage } from "./components/InputPage";
import { ResultsPage } from "./components/ResultsPage";
import { SelectedDesignPage } from "./components/SelectedDesignPage";
import type { FormInputs, Layout } from "./types/house";

type Page = "input" | "results" | "selected";

export default function App() {
  const [page, setPage] = useState<Page>("input");
  const [inputs, setInputs] = useState<FormInputs | null>(null);
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null);

  const handleGenerate = (newInputs: FormInputs, newLayouts: Layout[]) => {
    setInputs(newInputs);
    setLayouts(newLayouts);
    setPage("results");
  };

  const handleSelect = (layout: Layout) => {
    setSelectedLayout(layout);
    setPage("selected");
  };

  return (
    <>
      <Toaster />
      <AnimatePresence mode="wait">
        {page === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <InputPage onGenerate={handleGenerate} />
          </motion.div>
        )}

        {page === "results" && inputs && (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
          >
            <ResultsPage
              inputs={inputs}
              layouts={layouts}
              onSelect={handleSelect}
              onBack={() => setPage("input")}
            />
          </motion.div>
        )}

        {page === "selected" && selectedLayout && inputs && (
          <motion.div
            key="selected"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
          >
            <SelectedDesignPage
              layout={selectedLayout}
              inputs={inputs}
              onBack={() => setPage("results")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
