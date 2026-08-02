// Turning the export into a file the person actually holds.
//
// The edge function returns the data; this decides what lands in their hands.
// On the phone that means writing a real file and opening the system share
// sheet, so it can go to Files, Drive, or an email to themselves — a JSON blob
// trapped inside the app would not be portability in any useful sense.

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export interface ExportFile {
  uri: string;
  name: string;
}

const stamp = () => new Date().toISOString().slice(0, 10);

/** Writes the export to disk and returns where it landed. */
export async function writeExport(data: unknown): Promise<ExportFile> {
  const name = `trace-export-${stamp()}.json`;
  const uri = `${FileSystem.documentDirectory}${name}`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(data, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return { uri, name };
}

/** Also writes each canvas as an openable .svg, since the product is drawings. */
export async function writeCanvasSvgs(data: any): Promise<ExportFile[]> {
  const out: ExportFile[] = [];
  const canvases = Array.isArray(data?.canvases) ? data.canvases : [];
  for (let i = 0; i < canvases.length; i++) {
    const svg = canvases[i]?.svg;
    if (typeof svg !== 'string' || !svg) continue;
    const name = `trace-drawing-${stamp()}-${i + 1}.svg`;
    const uri = `${FileSystem.documentDirectory}${name}`;
    await FileSystem.writeAsStringAsync(uri, svg, { encoding: FileSystem.EncodingType.UTF8 });
    out.push({ uri, name });
  }
  return out;
}

/** Opens the system share sheet. Returns false if this device can't share. */
export async function shareFile(file: ExportFile, mimeType: string): Promise<boolean> {
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(file.uri, { mimeType, UTI: mimeType });
  return true;
}
