import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerURL from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerURL;

export async function parsePdf(file) {
  const fileArrayBuffer = await file.arrayBuffer();
  // Using standard getDocument
  const pdf = await pdfjsLib.getDocument(fileArrayBuffer).promise;
  const numPages = pdf.numPages;

  let fullText = "";
  const pagesData = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;
    const dataUrl = canvas.toDataURL("image/png");

    const textContent = await page.getTextContent();
    const lineBoxes = [];

    // Basic heuristic to group items by line
    let currentLineY = null;
    let currentLine = null;

    for (const item of textContent.items) {
      if (!item.str) continue;

      // item.transform is [scaleX, skewY, skewX, scaleY, tx, ty]
      // In viewport coords, we use Util.transform
      const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
      const fontHeight = Math.abs(tx[3]);
      const x = tx[4];
      const y = tx[5] - fontHeight; // tx[5] is the baseline usually, so top is roughly y - fontHeight
      const width = typeof item.width === 'number' ? item.width * viewport.scale : item.str.length * fontHeight * 0.5;
      const height = fontHeight;

      if (currentLineY === null || Math.abs(currentLineY - y) > height * 0.5) {
        if (currentLine && currentLine.text.trim()) {
          lineBoxes.push(currentLine);
          fullText += currentLine.text + "\n";
        }
        currentLineY = y;
        currentLine = { text: item.str, x, y, width, height };
      } else {
        currentLine.text += item.str;
        currentLine.width = (x + width) - currentLine.x;
      }
      
      // If it ends with EOL, force a new line next
      if (item.hasEOL) {
        if (currentLine && currentLine.text.trim()) {
          lineBoxes.push(currentLine);
          fullText += currentLine.text + "\n";
        }
        currentLine = null;
        currentLineY = null;
      }
    }
    
    if (currentLine && currentLine.text.trim()) {
      lineBoxes.push(currentLine);
      fullText += currentLine.text + "\n";
    }

    pagesData.push({
      pageNumber: i,
      dataUrl,
      lineBoxes,
      width: viewport.width,
      height: viewport.height
    });
  }

  return { fullText, pagesData };
}
