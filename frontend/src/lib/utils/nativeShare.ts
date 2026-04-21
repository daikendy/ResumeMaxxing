import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

/**
 * Native Share Utility for Capacitor
 * Handles saving blobs to local filesystem and invoking the native share sheet.
 */
export const shareNativeFile = async (blob: Blob, fileName: string) => {
  if (!Capacitor.isNativePlatform()) {
    console.warn("Share API only available on native platforms.");
    return false;
  }

  try {
    // 1. Convert Blob to Base64
    const reader = new FileReader();
    const base64Data = await new Promise<string>((resolve) => {
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]); // Remove data:application/pdf;base64,
      };
      reader.readAsDataURL(blob);
    });

    // 2. Write to Filesystem (Cache)
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
    });

    // 3. Share the file
    await Share.share({
      title: 'Resume Export',
      text: 'Here is your ResumeMaxxing optimized resume.',
      url: savedFile.uri,
      dialogTitle: 'Share Resume',
    });

    return true;
  } catch (error) {
    console.error('Native Share Error:', error);
    throw error;
  }
};
