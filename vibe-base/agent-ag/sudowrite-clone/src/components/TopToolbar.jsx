import React from 'react';
import { PenTool, RefreshCw, MessageSquare, Edit3, Image, Shuffle, Plus, Lightbulb } from 'lucide-react';

export function TopToolbar() {
  return (
    <header className="top-toolbar">
      <div className="toolbar-actions">
        <button className="toolbar-btn primary">
          <PenTool size={15} /> Write
        </button>
        <button className="toolbar-btn">
          <RefreshCw size={15} /> Rewrite
        </button>
        <button className="toolbar-btn">
          <MessageSquare size={15} style={{color:'#a78bfa'}} /> Feedback
          <span className="pro-badge">Pro</span>
        </button>
        <button className="toolbar-btn">
          <Edit3 size={15} /> Describe
        </button>
        <button className="toolbar-btn">
          <Lightbulb size={15} /> Brainstorm
        </button>
        <button className="toolbar-btn">
          <Image size={15} style={{color:'#f472b6'}} /> Visualize
        </button>
        <button className="toolbar-btn">
          <Shuffle size={15} /> Twist
        </button>
        <button className="toolbar-btn">
          <Plus size={15} /> More Tools
        </button>
      </div>
      <button className="exit-tour-btn">Exit Tour ✕</button>
    </header>
  );
}
