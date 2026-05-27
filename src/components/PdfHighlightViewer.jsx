import React, { useMemo, useRef, useEffect } from "react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./ui/tooltip";

function cleanStr(str) {
  return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

// fuzzy match function
function findMatchBox(pagesData, targetText) {
  const tClean = cleanStr(targetText);
  if (!tClean || tClean.length < 5) return null;

  for (const page of pagesData) {
    for (const line of page.lineBoxes) {
      const lClean = cleanStr(line.text);
      if (lClean.includes(tClean) || tClean.includes(lClean)) {
        // very simple fuzzy
        return { pageNum: page.pageNumber, box: line, pWidth: page.width, pHeight: page.height };
      }
    }
  }
  return null;
}

export default function PdfHighlightViewer({ pagesData, analysisResult, activeSuggestionIndex }) {
  const containerRef = useRef(null);

  // Extract detected line highlights
  const highlights = useMemo(() => {
    if (!analysisResult || !analysisResult.ai_detected_lines || !pagesData) return [];
    
    return analysisResult.ai_detected_lines.map(dt => {
      const match = findMatchBox(pagesData, dt.text);
      if (!match) return null;
      return {
        ...dt,
        pageNum: match.pageNum,
        box: match.box, // { x, y, width, height }
        pWidth: match.pWidth,
        pHeight: match.pHeight
      };
    }).filter(Boolean);
  }, [pagesData, analysisResult]);

  // Extract suggestion matches for pulsing
  const activeBox = useMemo(() => {
    if (activeSuggestionIndex === null || !analysisResult?.suggestions || !pagesData) return null;
    const sugg = analysisResult.suggestions[activeSuggestionIndex];
    if (!sugg) return null;
    return findMatchBox(pagesData, sugg.original);
  }, [activeSuggestionIndex, pagesData, analysisResult]);

  useEffect(() => {
    if (activeBox && containerRef.current) {
      const el = document.getElementById(`pulse-box-${activeSuggestionIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeBox, activeSuggestionIndex]);

  if (!pagesData || pagesData.length === 0) return null;

  const severityColors = {
    high: "bg-red-500/30 border-red-500",
    medium: "bg-amber-500/30 border-amber-500",
    low: "bg-yellow-400/30 border-yellow-400"
  };

  return (
    <div className="flex flex-col space-y-4" ref={containerRef}>
      {analysisResult && (
        <div className="flex items-center gap-4 px-4 py-2 bg-muted/30 border rounded-md text-xs font-mono">
          <span className="text-muted-foreground uppercase tracking-widest font-bold">Severity:</span>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500/50 rounded-sm"></div> High</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-500/50 rounded-sm"></div> Med</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-yellow-400/50 rounded-sm"></div> Low</div>
        </div>
      )}
      
      <div className="space-y-6">
        {pagesData.map((page) => (
          <div key={page.pageNumber} className="relative shadow-xl border bg-white mx-auto overflow-hidden">
            <img src={page.dataUrl} alt={`Page ${page.pageNumber}`} className="w-full h-auto block" />
            
            <TooltipProvider>
              {/* Render detected AI lines */}
              {highlights.filter(h => h.pageNum === page.pageNumber).map((h, i) => {
                // box x,y,w,h are in canvas coordinates (viewport.width x viewport.height)
                // Since image scales 100% width, we use percentages
                const left = (h.box.x / page.width) * 100;
                // PDF rendering y origin is sometimes baseline or top minus font height.
                // In our pdfUtils we tried to set y to top, so top is y / page.height.
                const top = ((h.box.y) / page.height) * 100;
                const width = (h.box.width / page.width) * 100;
                const height = (h.box.height / page.height) * 100;

                return (
                  <Tooltip key={i} delayDuration={100}>
                    <TooltipTrigger asChild>
                      <div
                        className={`absolute mix-blend-multiply border border-opacity-50 cursor-help transition-all ${severityColors[h.severity]}`}
                        style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${Math.max(2, height)}%` }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[300px]">
                      <p className="font-bold text-xs uppercase text-amber-500 mb-1">{h.pattern}</p>
                      <p className="text-xs">{h.text}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>

            {/* Render active suggestion pulse */}
            {activeBox && activeBox.pageNum === page.pageNumber && (
              <div
                id={`pulse-box-${activeSuggestionIndex}`}
                className="absolute border-2 border-primary rounded-sm animate-pulse-beam pointer-events-none z-10 box-content -ml-1 -mt-1"
                style={{
                  left: `${(activeBox.box.x / page.width) * 100}%`,
                  top: `${(activeBox.box.y / page.height) * 100}%`,
                  width: `${(activeBox.box.width / page.width) * 100}%`,
                  height: `${Math.max(2, (activeBox.box.height / page.height) * 100)}%`,
                  padding: '2px'
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
