import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { getHistory } from "../lib/history";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";

export default function HistoryDrawer({ open, setOpen, onSelect }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (open) {
      getHistory().then(setHistory);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="hidden sm:flex" data-testid="history-trigger">
          <Clock className="w-4 h-4 mr-2" />
          History
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-mono uppercase tracking-widest text-sm">Past Analyses</SheetTitle>
        </SheetHeader>
        
        {history.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
             No local history found.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div 
                key={item.id} 
                onClick={() => {
                  onSelect(item);
                  setOpen(false);
                }}
                className="p-3 border rounded-md hover:border-primary/50 bg-muted/20 cursor-pointer transition-all hover:bg-muted/40"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium truncate pr-4">{item.fileName || 'Resume'}</span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-muted">Score: {item.result.ats_score_before} &rarr; {item.result.ats_score_after}</span>
                  <span className={`px-1.5 py-0.5 rounded text-white ${item.result.hr_perspective.verdict === 'yes' || item.result.hr_perspective.verdict === 'strong_yes' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                    {item.result.hr_perspective.verdict.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
