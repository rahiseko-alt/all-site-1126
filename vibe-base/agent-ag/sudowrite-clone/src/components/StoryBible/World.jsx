import React from 'react';
import { Globe, MapPin } from 'lucide-react';

export function World() {
  return (
    <div>
      <div className="sb-header">
        <h3 className="sb-title">World Building</h3>
        <button className="btn-primary-sm">
          <Globe size={14} /> Add Location
        </button>
      </div>

      <div className="world-overview">
        <h4>Setting Overview</h4>
        <textarea
          className="world-textarea"
          placeholder="Describe the overall setting, time period, and rules of your world..."
          defaultValue="A secluded, old hunting house surrounded by a dense forest. The time period is contemporary, but the house feels stuck in the past."
        />
      </div>

      <h4 className="sub-title">Key Locations</h4>
      <div className="cards-grid">
        <div className="location-card">
          <div className="location-name">
            <MapPin size={14} /> The Old House
          </div>
          <p className="location-desc">
            Filled with taxidermy and old leather. Smells like dust and memories.
          </p>
        </div>
      </div>
    </div>
  );
}
