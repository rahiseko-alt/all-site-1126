import React from 'react';
import { PenTool, Plus, ArrowLeft } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

export function Sidebar() {
  const isStoryBibleOpen = useUIStore((state) => state.isStoryBibleOpen);
  const setStoryBibleOpen = useUIStore((state) => state.setStoryBibleOpen);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="back-btn">
          <ArrowLeft size={16} />
          Projects
        </button>
      </div>

      <div className="sidebar-body">
        <div className="sidebar-actions">
          <button className="btn-sidebar-action">
            <Plus size={16} /> New
          </button>
          <button className="btn-sidebar-action">
            Import
          </button>
        </div>

        <div className="doc-item">
          <div className="doc-icon"></div>
          Untitled
        </div>
      </div>

      <div className="story-bible-area">
        <div className="story-bible-header">
          <div className="story-bible-label">
            <div className="story-bible-icon">
              <PenTool size={15} />
            </div>
            Story Bible
          </div>
          <button
            className={`toggle-switch${isStoryBibleOpen ? ' active' : ''}`}
            onClick={() => setStoryBibleOpen(!isStoryBibleOpen)}
            role="switch"
            aria-checked={isStoryBibleOpen}
          />
        </div>

        {isStoryBibleOpen && (
          <div className="story-bible-items">
            <button><span>❀</span> Braindump</button>
            <button><span>⚘</span> Genre</button>
            <button><span>∞</span> Style</button>
            <button><span>♦</span> Synopsis</button>
            <button><span>☆</span> Characters</button>
            <button><span>⊕</span> Worldbuilding</button>
            <button><span>≡</span> Outline</button>
          </div>
        )}
      </div>
    </aside>
  );
}
