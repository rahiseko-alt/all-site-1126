import React, { createContext, useContext, useState } from 'react';

const EditorContext = createContext(undefined);

export function EditorProvider({ children }) {
  const [content, setContent] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  const value = {
    content,
    setContent,
    selectedText,
    setSelectedText,
    cursorPosition,
    setCursorPosition
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
