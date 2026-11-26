import React from 'react';
import { Plus, User } from 'lucide-react';

export function Characters() {
  return (
    <div>
      <div className="sb-header">
        <h3 className="sb-title">Characters</h3>
        <button className="btn-primary-sm">
          <Plus size={14} /> Add Character
        </button>
      </div>

      <div className="cards-grid">
        <div className="character-card">
          <div className="character-top">
            <div className="character-avatar">
              <User size={20} />
            </div>
            <div>
              <div className="character-name">Seamus</div>
              <div className="character-role">Protagonist</div>
            </div>
          </div>
          <p className="character-desc">
            A somewhat cynical hunter who grew up in the old house. He has a complicated relationship with his father's legacy.
          </p>
        </div>

        <div className="add-card">
          <Plus size={24} />
          <span>Create New</span>
        </div>
      </div>
    </div>
  );
}
