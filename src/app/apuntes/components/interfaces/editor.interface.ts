// Interfaces para el manejo de Deltas de Quill

import Delta  from 'quill';

export interface QuillDelta {
  ops: DeltaOperation[];
}

export interface DeltaOperation {
  insert?: any;
  delete?: number;
  retain?: number;
  attributes?: {
    [key: string]: any;
  };
}

// Interface para el estado del editor
export interface EditorState {
  content: QuillDelta;
  version: number;
  lastModifiedBy: string;
  timestamp: number;
}

// Interface para los cambios del editor
export interface EditorChange {
  delta: QuillDelta;
  userId: string;
  timestamp: number;
  version: number;
}

// Interface para el buffer de cambios
export interface BufferEntry {
  changes: EditorChange[];
  startVersion: number;
  endVersion: number;
}

// Interface para eventos de sincronización
export interface SyncEvent {
  type: 'sync' | 'ack' | 'error';
  version: number;
  userId: string;
  timestamp: number;
  payload?: any;
}
