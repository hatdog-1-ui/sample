import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/utils/colors';
import { generateId } from '../src/database/db';
import { saveDocument, savePage } from '../src/database/repository';

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [isBatchMode, setIsBatchMode] = useState(false);
  const [capturedUris, setCapturedUris] = useState<string[]>([]);
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [isCapturing, setIsCapturing] = useState(false);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const toggleFlash = useCallback(() => {
    setFlashMode((prev) => (prev === 'off' ? 'on' : 'off'));
  }, []);

  const toggleBatchMode = useCallback(() => {
    setIsBatchMode((prev) => !prev);
  }, []);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo) {
        Alert.alert('Error', 'Failed to capture photo.');
        return;
      }

      if (isBatchMode) {
        setCapturedUris((prev) => [...prev, photo.uri]);
      } else {
        router.push(`/crop?uri=${encodeURIComponent(photo.uri)}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }, [isBatchMode, isCapturing, router]);

  const handleBatchDone = useCallback(async () => {
    if (capturedUris.length === 0) return;

    try {
      const docId = generateId();
      const docName = `Scan ${new Date().toLocaleDateString()}`;

      await saveDocument({
        id: docId,
        name: docName,
        pageCount: capturedUris.length,
        thumbnailUri: capturedUris[0],
      });

      for (let i = 0; i < capturedUris.length; i++) {
        await savePage({
          documentId: docId,
          imageUri: capturedUris[i],
          pageNumber: i + 1,
        });
      }

      router.replace(`/edit?documentId=${docId}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save batch scan.');
    }
  }, [capturedUris, router]);

  const handleGalleryImport = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        if (isBatchMode) {
          setCapturedUris((prev) => [...prev, uri]);
        } else {
          router.push(`/crop?uri=${encodeURIComponent(uri)}`);
        }
      }
    } catch {
      Alert.alert('Error', 'Failed to open gallery.');
    }
  }, [isBatchMode, router]);

  // Permission not yet determined
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={Colors.textSecondary} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          DocScan Pro needs camera access to scan documents.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.cameraBg} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={28} color={Colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.batchButton, isBatchMode && styles.batchButtonActive]}
          onPress={isBatchMode && capturedUris.length > 0 ? handleBatchDone : toggleBatchMode}
        >
          <Ionicons name="layers-outline" size={18} color={Colors.white} />
          <Text style={styles.batchButtonText}>
            {isBatchMode
              ? capturedUris.length > 0
                ? `Done (${capturedUris.length})`
                : 'Batch'
              : 'Batch'}
          </Text>
          {isBatchMode && capturedUris.length > 0 && (
            <View style={styles.batchBadge}>
              <Text style={styles.batchBadgeText}>{capturedUris.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          flash={flashMode}
        />

        {/* Document Frame Overlay */}
        <View style={styles.overlay}>
          <View style={styles.frameContainer}>
            <View style={styles.frame}>
              {/* Corner dots */}
              <View style={[styles.cornerDot, styles.cornerTopLeft]} />
              <View style={[styles.cornerDot, styles.cornerTopRight]} />
              <View style={[styles.cornerDot, styles.cornerBottomLeft]} />
              <View style={[styles.cornerDot, styles.cornerBottomRight]} />
            </View>

            <Text style={styles.frameText}>
              Position document{'\n'}within frame
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.sideButton} onPress={toggleFlash}>
          <Ionicons
            name={flashMode === 'on' ? 'flash' : 'flash-off'}
            size={22}
            color={Colors.white}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleCapture}
          disabled={isCapturing}
          activeOpacity={0.7}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.sideButton} onPress={handleGalleryImport}>
          <Ionicons name="image-outline" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cameraBg,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  batchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    gap: 6,
  },
  batchButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
  },
  batchButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  batchBadge: {
    backgroundColor: Colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  batchBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameContainer: {
    width: '78%',
    aspectRatio: 3 / 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 4,
  },
  cornerDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
  },
  cornerTopLeft: {
    top: -7,
    left: -7,
  },
  cornerTopRight: {
    top: -7,
    right: -7,
  },
  cornerBottomLeft: {
    bottom: -7,
    left: -7,
  },
  cornerBottomRight: {
    bottom: -7,
    right: -7,
  },
  frameText: {
    color: Colors.white,
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 18,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: Colors.cameraBg,
    backgroundColor: Colors.white,
  },
});
