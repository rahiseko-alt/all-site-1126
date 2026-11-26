import React from 'react';
import { Sidebar } from './components/Sidebar';
import { TopToolbar } from './components/TopToolbar';
import { RightPanel } from './components/RightPanel';
import { StoryBibleModal } from './components/StoryBibleModal';
import { EditorCanvas } from './components/EditorCanvas';
import { EditorProvider } from './store/EditorContext';

function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        <TopToolbar />
        <EditorProvider>
          <EditorCanvas />
        </EditorProvider>
      </main>
      <RightPanel />
      <StoryBibleModal />
    </div>
  )
}

export default App
