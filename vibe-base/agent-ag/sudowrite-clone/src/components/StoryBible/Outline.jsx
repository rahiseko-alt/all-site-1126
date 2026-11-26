import React from 'react';
import { GripVertical, AlignLeft } from 'lucide-react';

export function Outline() {
  return (
    <div>
      <div className="sb-header">
        <h3 className="sb-title">Outline</h3>
        <button className="btn-outline-sm">Generate Outline</button>
      </div>

      <div className="outline-hint">
        <AlignLeft size={15} /> Drag and drop to reorder scenes
      </div>

      <div className="outline-items">
        <div className="outline-item">
          <button className="grip-handle">
            <GripVertical size={16} />
          </button>
          <div className="outline-item-body">
            <div className="outline-item-title">Act 1: The Return</div>
            <p className="outline-item-desc">Seamus arrives at the old house. He discovers the starling's nest and reminisces about his father.</p>
          </div>
        </div>

        <div className="outline-item">
          <button className="grip-handle">
            <GripVertical size={16} />
          </button>
          <div className="outline-item-body">
            <div className="outline-item-title">Act 2: The Discovery</div>
            <p className="outline-item-desc">While cleaning out the attic, he finds a hidden compartment in his father's desk.</p>
          </div>
        </div>

        <button className="add-scene-btn">+ Add Scene</button>
      </div>
    </div>
  );
}
