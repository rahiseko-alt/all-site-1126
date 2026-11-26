import React from 'react';
import { PenTool, Settings, MoreHorizontal, MessageSquare, RefreshCw } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

export function RightPanel() {
  const rightPanelTab = useUIStore((state) => state.rightPanelTab);
  const setRightPanelTab = useUIStore((state) => state.setRightPanelTab);

  return (
    <aside className="right-panel">
      <div className="panel-tabs">
        <button
          className={`panel-tab${rightPanelTab === 'history' ? ' active' : ''}`}
          onClick={() => setRightPanelTab('history')}
        >
          History
        </button>
        <button
          className={`panel-tab${rightPanelTab === 'chat' ? ' active' : ''}`}
          onClick={() => setRightPanelTab('chat')}
        >
          Chat
        </button>
      </div>

      <div className="panel-body">
        {rightPanelTab === 'history' ? (
          <>
            <div className="panel-section-label">
              <PenTool size={12} /> Write
            </div>
            <div className="panel-meta">
              <span>Looked at:</span>
              <span className="model-badge">
                <span style={{fontSize:10}}>✨</span> Muse
              </span>
            </div>

            <div className="suggestion-card">
              <p className="suggestion-text">
                Seamus had once found a starling's nest constructed entirely from the shredded jerky of his father's old hunting jacket, and this, he thought, prefigured much about the house he came from. Now, years later, on the threshold of that house, he felt the leather ghosts circling overhead—swooping
              </p>
              <div className="suggestion-actions">
                <button className="insert-btn">
                  <RefreshCw size={12} /> Insert
                </button>
                <div className="suggestion-icons">
                  <button><Settings size={14} /></button>
                  <button><MoreHorizontal size={14} /></button>
                </div>
              </div>

              <div className="sticky-note">
                Pick one of the written suggestions and click <span className="highlight">Insert</span>.
                <svg style={{position:'absolute', bottom:12, right:12, width:20, height:20}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              </div>
            </div>
          </>
        ) : (
          <div className="chat-area">
            <div className="chat-messages">No messages yet. Start a conversation!</div>
            <div className="chat-input-area">
              <input className="chat-input" placeholder="Type a message..." />
            </div>
          </div>
        )}
      </div>

      <div className="panel-footer">
        <button className="btn-support">
          <MessageSquare size={15} /> Support
        </button>
        <button className="btn-upgrade">Upgrade</button>
      </div>
    </aside>
  );
}
