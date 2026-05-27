import { jsPDF } from "jspdf";

export async function exportPdfReport(analysisResult) {
  const doc = new jsPDF();
  let y = 20;

  const addText = (text, size, isBold = false) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(size);
    const split = doc.splitTextToSize(text, 170);
    doc.text(split, 20, y);
    y += split.length * (size * 0.4) + 4;
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  };

  addText("Resume ATS Analysis Report", 22, true);
  y += 5;

  addText(`Authenticity Score: ${analysisResult.authenticity_score}/100`, 14, true);
  addText(`ATS Score: ${analysisResult.ats_score_before} -> ${analysisResult.ats_score_after}`, 14, true);
  y += 5;

  addText("HR Perspective Verdict", 16, true);
  addText(`Verdict: ${analysisResult.hr_perspective.verdict}`, 12);
  addText(`Summary: ${analysisResult.hr_perspective.first_impression}`, 12);
  y += 10;

  addText("Top Missing Keywords", 16, true);
  addText(analysisResult.ats_missing_keywords.join(", "), 12);
  y += 10;

  addText("Recommended Rewrites", 16, true);
  analysisResult.suggestions.forEach((s) => {
    addText(`${s.priority.toUpperCase()} - Improve by ${s.impact_points} pts`, 12, true);
    addText(`Original: ${s.original}`, 11);
    addText(`Improved: ${s.improved}`, 11, true);
    addText(`Reason: ${s.reason}`, 10);
    y += 5;
  });

  doc.save("resume-ats-report.pdf");
}
