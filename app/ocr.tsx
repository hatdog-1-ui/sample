import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/utils/colors';
import { getPage, updatePage } from '../src/database/repository';
import type { Page } from '../src/types';

const DEMO_OCR_TEXT =
  'Chapter 5: Cell Biology\n\n' +
  'The cell is the basic structural and functional unit of all organisms. ' +
  'Cells are the smallest unit of life that can replicate independently, and are ' +
  'often called the "building blocks of life."\n\n' +
  'All cells share several key features: a plasma membrane that separates the ' +
  'cell from its environment, cytoplasm containing the cell\'s internal contents, ' +
  'DNA that carries genetic information, and ribosomes that synthesize proteins.';

export default function OcrScreen() {
  const router = useRouter();
  const { pageId } = useLocalSearchParams<{ pageId: string }>();

  const [page, setPage] = useState<Page | null>(null);
  const [processing, setProcessing] = useState(true);
  const [extractedText, setExtractedText] = useState('');

  const loadData = useCallback(async () => {
    if (!pageId) {
      setProcessing(false);
      return;
    }
    const loadedPage = await getPage(pageId);
    setPage(loadedPage);

    if (loadedPage?.ocrText) {
      setExtractedText(loadedPage.ocrText);
      setProcessing(false);
      return;
    }

    // OCR (e.g. ML Kit text recognition) requires a native development build
    // and isn't available in Expo Go. Simulate a short processing delay and
    // fall back to demo text so the flow can still be exercised here.
    setProcessing(true);
    setTimeout(async () => {
      setExtractedText(DEMO_OCR_TEXT);
      setProcessing(false);
      if (loadedPage) {
        await updatePage(loadedPage.id, { ocrText: DEMO_OCR_TEXT });
      }
    }, 1200);
  }, [pageId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectAll = useCallback(() => {
    // Text is already fully visible/selectable in the scroll view; this is a
    // no-op affordance to mirror the native "select all" action.
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      const Clipboard = require('expo-clipboard');
      await Clipboard.setStringAsync(extractedText);
    } catch (e) {
      // Fallback if expo-clipboard isn't available.
    }
  }, [extractedText]);

  const handleShare = useCallback(async () => {
    if (!extractedText) return;
    try {
      await Share.share({ message: extractedText });
    } catch (e) {
      // Ignore share cancellation/errors.
    }
  }, [extractedText]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Text Recognition</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {page?.imageUri ? (
          <Image source={{ uri: page.imageUri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={[styles.preview, styles.previewPlaceholder]}>
            <Ionicons name="image-outline" size={32} color={Colors.textSecondary} />
          </View>
        )}

        <View style={styles.headerRow}>
          <Text style={styles.headerLabel}>Extracted Text</Text>
          <TouchableOpacity onPress={handleSelectAll}>
            <Text style={styles.selectAll}>Select All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.textArea}>
          {processing ? (
            <View style={styles.centerFill}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.processingText}>Recognizing text…</Text>
            </View>
          ) : extractedText ? (
            <Text style={styles.extractedText}>{extractedText}</Text>
          ) : (
            <View style={styles.centerFill}>
              <Ionicons name="document-text-outline" size={28} color={Colors.textSecondary} />
              <Text style={styles.noTextMessage}>No text detected</Text>
            </View>
          )}
        </View>

        <Text style={styles.devBuildNote}>
          Note: on-device text recognition requires a development build. Demo text is shown in
          Expo Go.
        </Text>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleCopy}
          disabled={!extractedText}
        >
          <Ionicons name="copy-outline" size={16} color={Colors.white} />
          <Text style={styles.primaryButtonText}>Copy Text</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.outlineButton]}
          onPress={handleShare}
          disabled={!extractedText}
        >
          <Ionicons name="share-outline" size={16} color={Colors.primary} />
          <Text style={styles.outlineButtonText}>Share</Text>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 54,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  preview: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  previewPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  selectAll: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  textArea: {
    minHeight: 220,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  extractedText: {
    fontSize: 13,
    lineHeight: 21,
    color: Colors.text,
  },
  centerFill: {
    flex: 1,
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  processingText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  noTextMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  devBuildNote: {
    fontSize: 10,
    color: Colors.textTertiary ?? Colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 24,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  outlineButton: {
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  outlineButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
