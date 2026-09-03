import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Alert,
  ActivityIndicator,
  Dimensions,
  type GestureResponderEvent,
  type PanResponderGestureState,
  type LayoutChangeEvent,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/utils/colors';
import { cropImage } from '../src/utils/imageProcessor';
import { generateId } from '../src/database/db';
import { saveDocument, savePage } from '../src/database/repository';

interface Corner {
  x: number;
  y: number;
}

const HANDLE_SIZE = 22;
const HANDLE_HIT_SLOP = 20;

const screenWidth = Dimensions.get('window').width;
const IMAGE_WIDTH = screenWidth * 0.85;
const IMAGE_HEIGHT = IMAGE_WIDTH * (4 / 3);

export default function CropScreen() {
  const router = useRouter();
  const { uri: rawUri } = useLocalSearchParams<{ uri: string }>();
  const uri = rawUri ? decodeURIComponent(rawUri) : '';

  const [imageLayout, setImageLayout] = useState({ x: 0, y: 0, width: IMAGE_WIDTH, height: IMAGE_HEIGHT });
  const [isProcessing, setIsProcessing] = useState(false);

  // Corner positions relative to the image container (top-left, top-right, bottom-right, bottom-left)
  const inset = 0.1;
  const [corners, setCorners] = useState<Corner[]>([
    { x: IMAGE_WIDTH * inset, y: IMAGE_HEIGHT * inset },
    { x: IMAGE_WIDTH * (1 - inset), y: IMAGE_HEIGHT * inset },
    { x: IMAGE_WIDTH * (1 - inset), y: IMAGE_HEIGHT * (1 - inset) },
    { x: IMAGE_WIDTH * inset, y: IMAGE_HEIGHT * (1 - inset) },
  ]);

  const cornersRef = useRef(corners);
  cornersRef.current = corners;

  const handleImageLayout = useCallback((event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setImageLayout({ x, y, width, height });

    const insetVal = 0.1;
    setCorners([
      { x: width * insetVal, y: height * insetVal },
      { x: width * (1 - insetVal), y: height * insetVal },
      { x: width * (1 - insetVal), y: height * (1 - insetVal) },
      { x: width * insetVal, y: height * (1 - insetVal) },
    ]);
  }, []);

  const startCornerRef = useRef<Corner>({ x: 0, y: 0 });

  const createPanResponder = useCallback(
    (index: number) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startCornerRef.current = cornersRef.current[index];
        },
        onPanResponderMove: (
          _event: GestureResponderEvent,
          gestureState: PanResponderGestureState
        ) => {
          setCorners((prev) => {
            const updated = [...prev];
            const newX = Math.max(0, Math.min(imageLayout.width, startCornerRef.current.x + gestureState.dx));
            const newY = Math.max(0, Math.min(imageLayout.height, startCornerRef.current.y + gestureState.dy));
            updated[index] = { x: newX, y: newY };
            return updated;
          });
        },
        onPanResponderRelease: () => {},
      }),
    [imageLayout.width, imageLayout.height]
  );

  const panResponders = useMemo(
    () => [0, 1, 2, 3].map((i) => createPanResponder(i)),
    [createPanResponder]
  );

  const handleRetake = useCallback(() => {
    router.back();
  }, [router]);

  const handleConfirm = useCallback(async () => {
    if (!uri) return;

    setIsProcessing(true);
    try {
      // Map corner positions to actual image coordinates
      // We need the actual image dimensions to compute the crop region
      const minX = Math.min(corners[0].x, corners[3].x);
      const maxX = Math.max(corners[1].x, corners[2].x);
      const minY = Math.min(corners[0].y, corners[1].y);
      const maxY = Math.max(corners[2].y, corners[3].y);

      // Scale from display coordinates to image coordinates
      // Use Image.getSize to get actual image dimensions
      const imageDims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        Image.getSize(
          uri,
          (width, height) => resolve({ width, height }),
          (error) => reject(error)
        );
      });

      const scaleX = imageDims.width / imageLayout.width;
      const scaleY = imageDims.height / imageLayout.height;

      const cropRegion = {
        originX: Math.round(Math.max(0, minX * scaleX)),
        originY: Math.round(Math.max(0, minY * scaleY)),
        width: Math.round(Math.min(imageDims.width, (maxX - minX) * scaleX)),
        height: Math.round(Math.min(imageDims.height, (maxY - minY) * scaleY)),
      };

      // Ensure valid crop dimensions
      if (cropRegion.width <= 0 || cropRegion.height <= 0) {
        Alert.alert('Invalid Crop', 'Please adjust the crop handles and try again.');
        setIsProcessing(false);
        return;
      }

      const croppedUri = await cropImage(uri, cropRegion);

      // Create document and page
      const docId = generateId();
      const docName = `Scan ${new Date().toLocaleDateString()}`;

      await saveDocument({
        id: docId,
        name: docName,
        pageCount: 1,
        thumbnailUri: croppedUri,
      });

      await savePage({
        documentId: docId,
        imageUri: croppedUri,
        pageNumber: 1,
      });

      router.replace(`/edit?documentId=${docId}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to crop and save the image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [uri, corners, imageLayout, router]);

  if (!uri) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No image provided.</Text>
        <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
          <Text style={styles.retakeButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleRetake}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Crop & Adjust</Text>
        <View style={styles.backButton} />
      </View>

      {/* Image with crop overlay */}
      <View style={styles.imageSection}>
        <View style={styles.imageWrapper} onLayout={handleImageLayout}>
          <Image source={{ uri }} style={styles.image} resizeMode="cover" />

          {/* Corner handles */}
          {corners.map((corner, index) => (
            <View
              key={index}
              {...panResponders[index].panHandlers}
              style={[
                styles.cornerHandle,
                {
                  left: corner.x - HANDLE_SIZE / 2,
                  top: corner.y - HANDLE_SIZE / 2,
                },
              ]}
              hitSlop={{
                top: HANDLE_HIT_SLOP,
                bottom: HANDLE_HIT_SLOP,
                left: HANDLE_HIT_SLOP,
                right: HANDLE_HIT_SLOP,
              }}
            />
          ))}
        </View>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.retakeButton}
          onPress={handleRetake}
          disabled={isProcessing}
        >
          <Ionicons name="refresh-outline" size={20} color={Colors.primary} />
          <Text style={styles.retakeButtonText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.confirmButton, isProcessing && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color={Colors.white} />
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  imageSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  imageWrapper: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    position: 'relative',
    borderRadius: 4,
    overflow: 'visible',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  cornerHandle: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    gap: 8,
  },
  retakeButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    gap: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
