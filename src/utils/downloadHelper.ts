import { saveAs } from 'file-saver';

/**
 * Cleanly saves a Uint8Array or Blob as a PDF file
 */
export function savePdfFile(data: Uint8Array | Blob, filename: string): void {
  if (data instanceof Blob) {
    saveAs(data, filename);
  } else {
    // Cast to BlobPart to satisfy strict TypeScript DOM definitions
    const blob = new Blob([data as unknown as BlobPart], { type: 'application/pdf' });
    saveAs(blob, filename);
  }
}
