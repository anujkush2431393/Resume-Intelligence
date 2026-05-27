import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { exportPdfReport } from "../lib/exportPdf";
import { Button } from "./ui/button";

function AtsScoreRing({ score, label, delta }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 85 ? "text-emerald-500" : score >= 70 ? "text-amber-500" : "text-red-500";

  return (
    <div className="flex flex-col items-center relative">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" className="text-muted/30 fill-transparent" />
          <circle 
            cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            className={`${color} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{score}</span>
        </div>
      </div>
      <span className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mt-2 font-mono">{label}</span>
      {delta != null && (
        <span className="absolute -top-2 -right-2 bg-emerald-500/20 text-emerald-500 font-bold text-xs px-2 py-0.5 rounded-full border border-emerald-500/30">
          +{delta} pts
        </span>
      )}
    </div>
  );
}

function SuggestionCard({ s, index, onClick, onCopy }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(s.improved);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="p-4 border rounded-lg bg-card hover:border-primary/50 transition-all cursor-pointer shadow-sm relative group overflow-hidden"
      onClick={() => onClick(index)}
    >
      <div className="flex items-center justify-between mb-3 border-b pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold tracking-widest text-muted-foreground uppercase">
            Rewrite #{index + 1}
          </span>
          {s.priority === "optional" && (
            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded uppercase font-bold tracking-wider">
              Optional
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
            +{s.impact_points} pts
          </span>
          <button onClick={handleCopy} className="p-1 text-muted-foreground hover:text-foreground bg-muted/50 rounded transition-colors z-10">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-3">
        <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-md">
          <span className="block text-[10px] text-red-500/70 font-bold uppercase tracking-widest mb-1.5">Before</span>
          <p className="text-sm line-through decoration-red-500/50 text-muted-foreground">
            {s.original}
          </p>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-md shadow-inner">
          <span className="block text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-1.5">After</span>
          <p className="text-sm font-medium text-foreground">
            {s.improved}
          </p>
        </div>
      </div>
      
      <div className="bg-muted/30 p-2.5 rounded-md border text-xs text-muted-foreground">
        <span className="font-bold text-foreground">Why: </span> {s.reason}
      </div>
    </div>
  );
}

export default function Results({ data, setActiveSuggestionIndex }) {
  if (!data) return null;

  const required = data.suggestions.filter(s => s.priority === "required");
  const optional = data.suggestions.filter(s => s.priority === "optional");

  return (
    <div className="space-y-8 animate-fade-up">
      {data.ats_score_before >= 88 && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 p-4 rounded-lg flex items-start gap-3 shadow-sm">
          <Check className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm font-medium">
            Your resume is already in submit-ready range ({data.ats_score_before}/100). Below are a couple of high-impact rewrites. Everything else is optional polish — don't feel pressured to chase 100.
          </p>
        </div>
      )}

      {/* Top Scores */}
      <div className="flex items-center justify-around p-6 lg:p-8 bg-card border rounded-xl shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid opacity-30"></div>
        <div className="z-10 bg-background/50 backdrop-blur-xl absolute inset-0"></div>
        
        <div className="z-20 flex w-full justify-around items-center font-display">
          <AtsScoreRing score={data.ats_score_before} label="Before" />
          <div className="w-16 h-px bg-border flex items-center justify-center">
            <div className="bg-background border px-2 py-1 text-[10px] tracking-widest rounded-full uppercase font-bold text-muted-foreground opacity-50">
              vs
            </div>
          </div>
          <AtsScoreRing score={data.ats_score_after} label="Target" delta={data.ats_score_after - data.ats_score_before} />
        </div>
      </div>

      {/* HR Perspective */}
      <div className="p-5 border rounded-xl shadow-sm bg-card hover-float transition-all duration-300">
        <div className="flex items-start justify-between mb-4 pb-4 border-b">
          <div>
            <h3 className="font-mono text-sm tracking-widest uppercase font-bold mb-1">HR Perspective</h3>
            <p className="text-lg font-medium">"{data.hr_perspective.first_impression}"</p>
          </div>
          <span className={`px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full border ${
            data.hr_perspective.verdict === 'strong_yes' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
            data.hr_perspective.verdict === 'no' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
            'bg-amber-500/10 text-amber-500 border-amber-500/20'
          }`}>
            {data.hr_perspective.verdict.replace('_', ' ')}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{data.hr_perspective.reasoning}</p>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-emerald-500/5 p-3 rounded-md border border-emerald-500/10">
            <span className="block text-[10px] uppercase font-bold text-emerald-500 mb-2">Strengths</span>
            <ul className="text-xs space-y-1 text-emerald-700 dark:text-emerald-400">
              {data.hr_perspective.strengths.map((s, i) => <li key={i}>• {s}</li>)}
            </ul>
          </div>
          <div className="bg-red-500/5 p-3 rounded-md border border-red-500/10">
            <span className="block text-[10px] uppercase font-bold text-red-500 mb-2">Red Flags</span>
            <ul className="text-xs space-y-1 text-red-700 dark:text-red-400">
              {data.hr_perspective.red_flags.map((s, i) => <li key={i}>• {s}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* Missing Keywords */}
      {data.ats_missing_keywords?.length > 0 && (
         <div className="p-5 border rounded-xl shadow-sm bg-card hover-float transition-all duration-300">
           <h3 className="font-mono text-sm tracking-widest uppercase font-bold mb-3">Missing ATS Keywords</h3>
           <div className="flex flex-wrap gap-2">
             {data.ats_missing_keywords.map((kw, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md text-xs font-mono bg-muted text-muted-foreground border">
                  {kw}
                </span>
             ))}
           </div>
         </div>
      )}

      {/* Rewrites */}
      <div className="space-y-6 hover-float transition-all duration-300">
        <h3 className="font-display text-2xl tracking-tight font-bold flex items-center justify-between">
          Required Rewrites
          <Button variant="outline" size="sm" onClick={() => exportPdfReport(data)}>
            Export PDF Report
          </Button>
        </h3>
        {required.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No required high-severity rewrites.</p>
        ) : (
          <div className="space-y-4">
            {required.map((s, i) => (
              <SuggestionCard key={i} s={s} index={data.suggestions.indexOf(s)} onClick={setActiveSuggestionIndex} />
            ))}
          </div>
        )}

        {optional.length > 0 && (
          <details className="mt-8 group">
            <summary className="cursor-pointer text-sm font-mono tracking-widest uppercase font-bold text-muted-foreground pb-2 border-b select-none hover:text-foreground transition-colors outline-none list-none group-open:text-primary">
              <span className="mr-2 opacity-50 text-[10px]">▶</span> Optional Polish ({optional.length} suggestions)
            </summary>
            <div className="space-y-4 pt-4 px-2 border-l-2 border-muted mt-2">
              {optional.map((s, i) => (
                <SuggestionCard key={`opt-${i}`} s={s} index={data.suggestions.indexOf(s)} onClick={setActiveSuggestionIndex} />
              ))}
            </div>
          </details>
        )}
      </div>
      
      {/* Authenticity dimensions visualization could go here */}
      <div className="p-5 border rounded-xl shadow-sm bg-card text-xs hover-float transition-all duration-300">
         <h3 className="font-mono text-sm tracking-widest uppercase font-bold mb-4">Authenticity Dimensions</h3>
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           {Object.entries(data.dimension_scores).map(([k, v]) => (
             <div key={k}>
               <div className="flex justify-between mb-1">
                 <span className="opacity-70">{k.replace(/_/g, ' ')}</span>
                 <span className="font-mono">{v}</span>
               </div>
               <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                 <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{width: `${v}%`}}></div>
               </div>
             </div>
           ))}
         </div>
      </div>

    </div>
  );
}
