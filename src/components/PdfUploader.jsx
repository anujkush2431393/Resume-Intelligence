import React, { useCallback, useState } from "react";
import { UploadCloud, FileText } from "lucide-react";
import { parsePdf } from "../lib/pdfUtils";
import { toast } from "sonner";

export default function PdfUploader({ onParsed, disabled }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFile = async (file) => {
    if (!file || file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large (max 10MB).");
      return;
    }

    setIsParsing(true);
    setFileName(file.name);
    try {
      const parsedData = await parsePdf(file);
      onParsed({ file, fileName: file.name, ...parsedData });
      toast.success("PDF parsed locally.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to parse PDF.");
      setFileName("");
    } finally {
      setIsParsing(false);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [disabled]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    if (!disabled) setIsDragActive(true);
  }, [disabled]);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  if (fileName && !isParsing) {
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <p className="text-sm font-medium">{fileName}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Parsed locally · never uploaded</p>
          </div>
        </div>
        <button 
          onClick={() => { setFileName(""); onParsed(null); }}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          Replace
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        disabled ? "opacity-50 cursor-not-allowed border-border bg-muted/10" :
        isDragActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/20 hover:border-primary/50 cursor-pointer"
      }`}
      onClick={() => {
        if (disabled) return;
        document.getElementById("pdf-upload").click();
      }}
    >
      <input
        id="pdf-upload"
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
        disabled={disabled}
      />
      
      {isParsing ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm font-medium">Parsing locally...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Drag & drop your resume PDF</p>
          <p className="text-xs text-muted-foreground">or click to browse</p>
        </div>
      )}
    </div>
  );
}
