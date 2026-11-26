import React from 'react';
import { PenTool } from 'lucide-react';
import { useEditor } from '../store/EditorContext';

export function EditorCanvas() {
  const { content, setContent } = useEditor();

  return (
    <>
      <div className="editor-scroll">
        <div className="editor-inner">
          <div className="editor-title-bar">
            <span className="editor-title">Untitled ...</span>
            <div className="format-btns">
              <button style={{fontWeight:700}}>B</button>
              <button style={{fontStyle:'italic'}}>I</button>
              <button style={{textDecoration:'underline'}}>U</button>
              <div className="sep"></div>
              <button>Aa</button>
              <button style={{fontWeight:600}}>H1</button>
            </div>
          </div>

          <textarea
            className="editor-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your story here..."
          />
        </div>
      </div>

      <div className="editor-bottom-bar">
        <button className="bottom-btn">
          Generate a Rough Draft
        </button>
        <button className="bottom-btn">
          <PenTool size={15} /> Generate 3 Openings
        </button>
      </div>
    </>
  );
}
