import { Injectable } from '@angular/core';
import { EditorChange } from '../components/interfaces/editor.interface';

@Injectable({
  providedIn: 'root'
})
export class BufferService {
  private readonly MAX_BUFFER_SIZE = 100; // Máximo número de cambios en buffer
  private buffer: EditorChange[] = [];
  private currentVersion = 0;

  constructor() {
    console.log('[BufferService] Initializing');
  }

  /**
   * Añade un cambio al buffer
   */
  addChange(change: EditorChange): void {
    console.log('[BufferService] Adding change:', change);

    // Verificar si necesitamos comprimir el buffer
    if (this.buffer.length >= this.MAX_BUFFER_SIZE) {
      console.log('[BufferService] Buffer full, compressing...');
      this.compressBuffer();
    }

    // Actualizar versión y añadir cambio
    this.currentVersion++;
    this.buffer.push({
      ...change,
      version: this.currentVersion,
      timestamp: Date.now()
    });
  }

  /**
   * Obtiene cambios desde una versión específica
   */
  getChangesSince(version: number): EditorChange[] {
    console.log('[BufferService] Getting changes since version:', version);
    return this.buffer.filter(change => change.version > version);
  }

  /**
   * Comprime el buffer combinando cambios antiguos
   */
  private compressBuffer(): void {
    console.log('[BufferService] Compressing buffer');
    if (this.buffer.length <= 1) return;

    // Mantener solo los últimos 50 cambios
    this.buffer = this.buffer.slice(-50);

    console.log('[BufferService] Buffer compressed, new size:', this.buffer.length);
  }

  /**
   * Limpia el buffer
   */
  clearBuffer(): void {
    console.log('[BufferService] Clearing buffer');
    this.buffer = [];
    this.currentVersion = 0;
  }

  /**
   * Obtiene la versión actual
   */
  getCurrentVersion(): number {
    return this.currentVersion;
  }

  /**
   * Verifica si hay cambios pendientes
   */
  hasPendingChanges(): boolean {
    return this.buffer.length > 0;
  }

  /**
   * Obtiene el último cambio
   */
  getLastChange(): EditorChange | null {
    if (this.buffer.length === 0) return null;
    return this.buffer[this.buffer.length - 1];
  }

  /**
   * Obtiene el estado actual del buffer
   */
  getBufferStatus(): {
    size: number;
    version: number;
    lastChangeTimestamp: number | null;
  } {
    const lastChange = this.getLastChange();

    return {
      size: this.buffer.length,
      version: this.currentVersion,
      lastChangeTimestamp: lastChange ? lastChange.timestamp : null
    };
  }
}
