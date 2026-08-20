'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import Mark from 'mark.js'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Required setup for pdf.js worker in Next.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PdfViewerProps {
  fileUrl: string
  activeHighlights?: any[]
}

export function PdfViewer({ fileUrl, activeHighlights }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>()
  const viewerRef = useRef<HTMLDivElement>(null)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  // The Magic "Resume Worded" Highlighter
  const applyHighlights = useCallback(() => {
    if (!viewerRef.current) return;

    setTimeout(() => {
      const textLayers = viewerRef.current?.querySelectorAll('.react-pdf__Page__textContent');
      if (!textLayers) return;
      
      textLayers.forEach(layer => {
        const marker = new Mark(layer as HTMLElement);
        
        // ALWAYS clear previous marks when the category tab changes
        marker.unmark(); 

        if (!activeHighlights) return;

        activeHighlights.forEach((issue: any) => {
          if (issue.word) {
            // Determine color based on severity
            let colorClass = 'bg-indigo-300/60 border-indigo-500';
            if (issue.severity === 'HIGH') colorClass = 'bg-rose-300/60 border-rose-500';
            if (issue.severity === 'MEDIUM') colorClass = 'bg-amber-300/60 border-amber-500';

            marker.mark(issue.word, {
              className: `${colorClass} text-transparent border-b-2 font-bold cursor-help transition-colors mix-blend-multiply`,
              accuracy: 'partially',
              acrossElements: true,
              separateWordSearch: false
            });
          }
        });
      });
    }, 150);
  }, [activeHighlights]);

  // CRITICAL FIX: The PDF text layer only renders once. 
  // We MUST use a useEffect to re-run the highlighter whenever the user clicks a different tab!
  useEffect(() => {
    applyHighlights();
  }, [applyHighlights]);

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
