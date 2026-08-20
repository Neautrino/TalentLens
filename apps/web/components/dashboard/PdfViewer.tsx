'use client'

import { useState, useRef, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import Mark from 'mark.js'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Required setup for pdf.js worker in Next.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PdfViewerProps {
  fileUrl: string
  issues?: any
}

export function PdfViewer({ fileUrl, issues }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>()
  const viewerRef = useRef<HTMLDivElement>(null)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  // The Magic "Resume Worded" Highlighter
  const applyHighlights = useCallback(() => {
    if (!viewerRef.current || !issues) return;

    // Add a tiny delay because onRenderSuccess sometimes fires a millisecond 
    // before React fully attaches the text layer spans to the DOM
    setTimeout(() => {
      const textLayers = viewerRef.current?.querySelectorAll('.react-pdf__Page__textContent');
      if (!textLayers) return;
      
      textLayers.forEach(layer => {
        const marker = new Mark(layer as HTMLElement);
        
        marker.unmark(); 

        // Helper to mark issues
        const markIssues = (issueList: any[], colorClass: string) => {
          if (!issueList) return;
          issueList.forEach((issue: any) => {
            // If it's a specific word (buzzword), highlight the word.
            // If it's a sentence-level issue (missing metric), highlight the whole sentence.
            const textToHighlight = issue.word || issue.context;
            
            if (textToHighlight) {
              marker.mark(textToHighlight, {
                className: `${colorClass} cursor-help transition-colors mix-blend-multiply`,
                accuracy: 'partially',
                acrossElements: true,
                separateWordSearch: false // CRITICAL: Don't highlight individual words of a sentence everywhere
              });
            }
          });
        };

        // Tailwind highlighting classes (using mix-blend-multiply so the black PDF text shows through the highlight)
        markIssues(issues.high, 'bg-rose-300/60 text-transparent border-b-2 border-rose-500');
        markIssues(issues.medium, 'bg-amber-300/60 text-transparent border-b-2 border-amber-500');
        markIssues(issues.low, 'bg-indigo-300/60 text-transparent border-b-2 border-indigo-500');
      });
    }, 150); // 150ms DOM paint buffer
  }, [issues]);

  return (
    <div className="w-full flex flex-col items-center" ref={viewerRef}>
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex flex-col gap-8 items-center"
        loading={
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <svg className="animate-spin h-8 w-8 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="font-semibold">Rendering Advanced PDF Engine...</p>
            <p className="text-xs mt-2 text-slate-400">Loading fonts and styles</p>
          </div>
        }
      >
        {Array.from(new Array(numPages || 0), (el, index) => (
          <div key={`page_${index + 1}`} className="shadow-2xl border border-slate-200 bg-white relative">
            <Page 
              pageNumber={index + 1} 
              width={800} 
              renderTextLayer={true}
              renderAnnotationLayer={false}
              onRenderSuccess={applyHighlights} // Run Mark.js the second the text layer hits the DOM!
            />
          </div>
        ))}
      </Document>
    </div>
  )
}
