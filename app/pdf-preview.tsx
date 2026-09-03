import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { Colors } from '../src/utils/colors';
import { getDocument, getPagesForDocument } from '../src/database/repository';
import { generatePdf } from '../src/utils/pdfGenerator';
import type { Document, Page, PageSize, Quality } from '../src/types';

const PAGE_SIZES: PageSize[] = ['A4', 'Letter', 'Legal'];
const QUALITIES: Quality[] = ['Low', 'Medium', 'High'];

function SegmentedControl<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: T[];
  selected: T;
  onSelect: (v: T) => void;
}) {
  return (
    <View style={styles.segmentContainer}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[styles.segmentButton, selected === opt && styles.segmentButtonActive]}
          onPress={() => onSelect(opt)}
        >
          <Text
            style={[styles.segmentText, selected === opt && styles.segmentTextActive]}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function PdfPreviewScreen() {
  const router = useRouter();
  const { documentId } = useLocalSearchParams<{ documentId: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [quality, setQuality] = useState<Quality>('Medium');
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    if (!documentId) return;
    const [doc, p] = await Promise.all([
      getDocument(documentId),
      getPagesForDocument(documentId),
    ]);
    setDocument(doc);
    setPages(p);
  }, [documentId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSave = async () => {
    if (!documentId) return;
    setBusy(true);
    try {
      await generatePdf(pages, pageSize);
      router.push(`/save?documentId=${documentId}`);
    } catch (e) {
      Alert.alert('Error', 'Failed to generate PDF.');
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    if (!documentId) return;
    setBusy(true);
    try {
      const uri = await generatePdf(pages, pageSize);
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to share PDF.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>PDF Preview</Text>
        <View style={styles.iconButton} />
      </View>

      <View style={styles.body}>
        <View style={styles.previewCard}>
          <View style={styles.previewLines}>
            <View style={[styles.line, { width: '80%' }]} />
            <View style={[styles.line, { width: '95%' }]} />
            <View style={[styles.line, { width: '70%' }]} />
            <View style={[styles.line, { width: '90%' }]} />
            <View style={[styles.line, { width: '60%' }]} />
            <View style={[styles.line, { width: '85%' }]} />
          </View>
          <Text style={styles.pageNumber}>1 / {pages.length || 1}</Text>
        </View>

        <View style={styles.selectorBlock}>
          <Text style={styles.selectorLabel}>Page Size</Text>
          <SegmentedControl options={PAGE_SIZES} selected={pageSize} onSelect={setPageSize} />
        </View>

        <View style={styles.selectorBlock}>
          <Text style={styles.selectorLabel}>Quality</Text>
          <SegmentedControl options={QUALITIES} selected={quality} onSelect={setQuality} />
        </View>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={busy}>
          <Ionicons name="download-outline" size={18} color={Colors.white} />
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare} disabled={busy}>
          <Ionicons name="share-outline" size={18} color={Colors.primary} />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  previewCard: {
    alignSelf: 'center',
    width: '70%',
    aspectRatio: 1 / 1.414,
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 20,
    marginBottom: 28,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    justifyContent: 'space-between',
  },
  previewLines: {
    gap: 10,
  },
  line: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  pageNumber: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  selectorBlock: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: Colors.primary,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.white,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
