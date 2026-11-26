import React, { useState } from 'react';
import { useUIStore } from '../store/uiStore';
import { Characters } from './StoryBible/Characters';
import { World } from './StoryBible/World';
import { Outline } from './StoryBible/Outline';

export function StoryBibleModal() {
  const isStoryBibleOpen = useUIStore((state) => state.isStoryBibleOpen);
  const setStoryBibleOpen = useUIStore((state) => state.setStoryBibleOpen);
  const [activeTab, setActiveTab] = useState('characters');

  if (!isStoryBibleOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <header className="modal-header">
          <h2 className="modal-title">Story Bible</h2>
          <button className="modal-close" onClick={() => setStoryBibleOpen(false)}>×</button>
        </header>
        <div className="modal-body">
          <div className="modal-sidebar">
            <button
              className={`modal-tab${activeTab === 'characters' ? ' active' : ''}`}
              onClick={() => setActiveTab('characters')}
            >
              Characters
            </button>
            <button
              className={`modal-tab${activeTab === 'world' ? ' active' : ''}`}
              onClick={() => setActiveTab('world')}
            >
              World
            </button>
            <button
              className={`modal-tab${activeTab === 'outline' ? ' active' : ''}`}
              onClick={() => setActiveTab('outline')}
            >
              Outline
            </button>
          </div>
          <div className="modal-content">
            {activeTab === 'characters' && <Characters />}
            {activeTab === 'world' && <World />}
            {activeTab === 'outline' && <Outline />}
          </div>
        </div>
      </div>
    </div>
  );
}
