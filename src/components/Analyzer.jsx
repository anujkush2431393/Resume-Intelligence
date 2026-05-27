import React, { useState, useEffect, useCallback } from "react";
import Header from "./Header";
import PdfUploader from "./PdfUploader";
import PdfHighlightViewer from "./PdfHighlightViewer";
import Results from "./Results";
import HistoryDrawer from "./HistoryDrawer";
import { Textarea } from "./ui/input";
import { Button } from "./ui/button";
import { analyzeResume } from "../lib/llm";
import { saveAnalysis } from "../lib/history";
import { toast } from "sonner";
import { Sparkles, FileText, ArrowRight, ShieldCheck, Database, KeySquare } from "lucide-react";

export default function Analyzer() {
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem("byok_llm_key") || "");
  const [provider, setProvider] = useState(() => sessionStorage.getItem("byok_provider") || "openai");
  
  const [fileData, setFileData] = useState(null); // { fullText, pagesData, fileName, file }
  const [jobDescription, setJobDescription] = useState("");
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(null);
  
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("byok_llm_key", apiKey);
  }, [apiKey]);

  useEffect(() => {
    sessionStorage.setItem("byok_provider", provider);
  }, [provider]);

  const runAnalysis = async () => {
    if (!apiKey) {
      toast.error("Please add your API key in the header.");
      return;
    }
    if (!fileData?.fullText) {
      toast.error("Please upload and parse a valid PDF first.");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please provide a job description.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setActiveSuggestionIndex(null);

    try {
      const result = await analyzeResume({
        provider,
        apiKey,
        resume: fileData.fullText,
        jobDescription
      });

      setAnalysisResult(result);
      
      // Save history
      const record = {
        id: Date.now().toString(),
        createdAt: Date.now(),
        fileName: fileData.fileName,
        resumeText: fileData.fullText,
        jobDescription,
        result
      };
      await saveAnalysis(record);
      
      toast.success("Analysis complete");
      
      // Scroller
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 500);
      
    } catch (err) {
      toast.error(err.message || "Failed to analyze resume");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSampleJd = () => {
    setJobDescription(`Senior Frontend Engineer

We are looking for a Senior Frontend Engineer with 5+ years of experience to join our core product team. You will be responsible for architecting and building high-performance, accessible, and scalable React applications.

Requirements:
- 5+ years of experience in frontend development, primarily with React and modern JavaScript/TypeScript.
- Deep understanding of browser internals, rendering performance, and optimization techniques.
- Experience with state management (Redux, Zustand, Context).
- Familiarity with CI/CD, testing (Jest, Cypress), and frontend build tools (Vite, Webpack).
- Strong communication skills and ability to mentor junior engineers.

Nice to have:
- Experience with Node.js and GraphQL.
- Contributions to open-source projects.`);
  };

  const handleClear = () => {
    setFileData(null);
    setJobDescription("");
    setAnalysisResult(null);
    setActiveSuggestionIndex(null);
  };

  const onHistorySelect = (record) => {
    setJobDescription(record.jobDescription);
    setAnalysisResult(record.result);
    // Note: We can't perfectly restore the local PDF file object for security reasons,
    // so we just warn the user they need to re-upload if they want the visual PDF overlay.
    if (!fileData || fileData.fileName !== record.fileName) {
      setFileData(null);
      toast.info(`Loaded analysis for ${record.fileName}. Please re-upload the PDF to see the visual highlight overlays.`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
      <div className="bg-tech-grid" />
      <div className="ambient-blobs" />

      <Header 
        apiKey={apiKey} setApiKey={setApiKey}
        provider={provider} setProvider={setProvider}
      />
      
      <main className="flex-1 container mx-auto max-w-7xl px-4 py-8 relative z-10">
        
        {/* Intro */}
        <div className="mb-12 text-center space-y-4 pt-4">
          <div className="flex justify-center gap-2 mb-2">
            <span className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold border rounded-sm bg-background/50 font-mono">Local-First · BYOK</span>
            <span className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold border rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono animate-breath relative">Privacy First</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display mb-2">
            Resume <span className="anim-gradient-text px-1">Intelligence</span> for the ATS era.
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto font-mono">
            Directly from your browser to the LLM. Zero middleman servers.
          </p>
          
          <div className="flex justify-center mt-8 pt-4">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border p-px rounded-xl overflow-hidden max-w-3xl mx-auto shadow-sm">
                <div className="bg-card px-4 py-3 flex flex-col items-center justify-center min-h-[80px]">
                   <ShieldCheck className="w-5 h-5 text-emerald-500 mb-1" />
                   <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Servers touched</span>
                   <span className="font-mono font-bold text-lg">0</span>
                </div>
                <div className="bg-card px-4 py-3 flex flex-col items-center justify-center min-h-[80px]">
                   <Database className="w-5 h-5 text-amber-500 mb-1" />
                   <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Authenticity dims</span>
                   <span className="font-mono font-bold text-lg">8</span>
                </div>
                <div className="bg-card px-4 py-3 flex flex-col items-center justify-center min-h-[80px]">
                   <KeySquare className="w-5 h-5 text-primary mb-1" />
                   <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Your API key</span>
                   <span className="font-mono font-bold text-lg">100%</span>
                </div>
                <div className="bg-card px-4 py-3 flex flex-col items-center justify-center min-h-[80px]">
                   <Sparkles className="w-5 h-5 text-emerald-500 mb-1" />
                   <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Target Score</span>
                   <span className="font-mono font-bold text-lg">85+</span>
                </div>
             </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="bg-card border rounded-2xl shadow-xl overflow-hidden mb-12">
          
          {/* Top Control Bar */}
          <div className="bg-muted/40 border-b px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs font-bold uppercase tracking-widest">Workspace</span>
              <HistoryDrawer open={historyOpen} setOpen={setHistoryOpen} onSelect={onHistorySelect} />
            </div>
            <Button variant="ghost" size="sm" onClick={handleClear} className="h-8 text-xs">Clear Workspace</Button>
          </div>
          
          <div className="p-6 grid md:grid-cols-2 gap-8">
            <div className="space-y-4 flex flex-col hover-float transition-transform duration-300">
              <div className="flex justify-between items-center">
                <label className="font-bold text-sm tracking-tight">Resume PDF</label>
                {!fileData && <span className="text-xs text-muted-foreground">Max 10MB</span>}
              </div>
              <PdfUploader onParsed={setFileData} disabled={isAnalyzing} />
            </div>
            
            <div className="space-y-4 flex flex-col hover-float transition-transform duration-300">
              <div className="flex justify-between items-center">
                <label className="font-bold text-sm tracking-tight">Job Description (JD)</label>
                <button type="button" onClick={loadSampleJd} className="text-xs text-primary hover:underline font-medium">Load sample</button>
              </div>
              <Textarea 
                placeholder="Paste the target job description here..."
                className="flex-1 min-h-[160px] resize-none text-xs font-mono"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isAnalyzing}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !isAnalyzing && fileData && jobDescription) {
                    runAnalysis();
                  }
                }}
              />
            </div>
          </div>
          
          <div className="p-6 bg-muted/20 border-t flex flex-col items-center justify-center space-y-4">
            <Button 
              size="lg"
              className="w-full max-w-sm relative overflow-hidden group"
              onClick={runAnalysis}
              disabled={isAnalyzing}
              data-testid="run-analysis-btn"
            >
              {isAnalyzing ? (
                <>
                  <div className="absolute inset-0 bg-primary/20">
                    <div className="h-full w-full animate-tracing-beam bg-white/20 blur-md" />
                  </div>
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  Running Neural Analysis...
                </>
              ) : (
                <>
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  Run ATS Analysis <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
            {isAnalyzing && (
               <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground flex items-center">
                  Parsing resume <span className="mx-2 w-1 h-1 bg-amber-500 rounded-full animate-pulse-beam" />
                  matching keywords <span className="mx-2 w-1 h-1 bg-amber-500 rounded-full animate-pulse-beam" style={{animationDelay: '0.3s'}} />
                  generating rewrites
               </p>
            )}
          </div>
        </div>

        {/* Results layout */}
        {analysisResult && (
          <div id="results" className="pt-8">
            <div className="grid lg:grid-cols-12 gap-8 items-start relative">
              {/* Left Column (PDF) */}
              <div className="lg:col-span-7 pr-2">
                {fileData?.pagesData ? (
                  <PdfHighlightViewer 
                    pagesData={fileData.pagesData} 
                    analysisResult={analysisResult} 
                    activeSuggestionIndex={activeSuggestionIndex}
                  />
                ) : (
                  <div className="h-64 border rounded-xl bg-muted/20 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                    <FileText className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm font-medium">PDF preview unavailable</p>
                    <p className="text-xs mt-1">Please re-upload your resume PDF to see visual highlight overlays for this historical analysis.</p>
                  </div>
                )}
              </div>
              
              {/* Right Column (Metrics & Rewrites) */}
              <div className="lg:col-span-5 pb-32">
                <Results data={analysisResult} setActiveSuggestionIndex={setActiveSuggestionIndex} />
              </div>
            </div>
          </div>
        )}

      </main>
      
      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur pb-8 pt-6 mt-auto">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <p className="text-xs text-muted-foreground mb-2">
            Your data is processed locally. We don't store your API key or files.
          </p>
        </div>
      </footer>
    </div>
  );
}
