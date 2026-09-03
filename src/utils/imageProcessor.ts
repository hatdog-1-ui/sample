import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export async function cropImage(
  uri: string,
  cropRegion: { originX: number; originY: number; width: number; height: number }
): Promise<string> {
  const result = await manipulateAsync(
    uri,
    [{ crop: cropRegion }],
    { format: SaveFormat.JPEG, compress: 0.8 }
  );
  return result.uri;
}

export async function rotateImage(uri: string, degrees: number): Promise<string> {
  const result = await manipulateAsync(
    uri,
    [{ rotate: degrees }],
    { format: SaveFormat.JPEG, compress: 0.8 }
  );
  return result.uri;
}

/**
 * Apply a visual filter to the image.
 * expo-image-manipulator only supports geometric transforms (crop, rotate, resize, flip).
 * True color filters (black & white, contrast, brightness) require a native image
 * processing module such as react-native-image-filter-kit or a custom native module.
 * For now, 'original' returns as-is and the others return the unmodified URI with a
 * console note. Replace the placeholder implementations when a native filter module
 * is integrated.
 */
export async function applyFilter(
  uri: string,
  filter: 'original' | 'bw' | 'magic' | 'grayscale'
): Promise<string> {
  if (filter === 'original') {
    return uri;
  }

  // expo-image-manipulator does not support color/contrast manipulation.
  // A full implementation would use a native module for these filters.
  console.warn(
    `Filter "${filter}" is not natively supported by expo-image-manipulator. ` +
    'Returning original image. Integrate a native image filter library for full support.'
  );
  return uri;
}

/**
 * Adjust image brightness.
 * expo-image-manipulator does not support brightness adjustment directly.
 * This is a placeholder — integrate a native module for real brightness control.
 */
export async function adjustBrightness(uri: string, _value: number): Promise<string> {
  console.warn(
    'Brightness adjustment is not supported by expo-image-manipulator. ' +
    'Returning original image.'
  );
  return uri;
}
