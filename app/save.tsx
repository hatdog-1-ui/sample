import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { Colors } from '../src/utils/colors';
import { getDocument, getPagesForDocument, updateDocument } from '../src/database/repository';
import { generatePdf } from '../src/utils/pdfGenerator';
import type { Document, Page, ExportFormat } from '../src/types';

const FORMATS: ExportFormat[] = ['PDF', 'JPG', 'PNG'];

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
          <Text style={[styles.segmentText, selected === opt && styles.segmentTextActive]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function SaveScreen() {
  const router = useRouter();
  const { documentId } = useLocalSearchParams<{ documentId: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [fileName, setFileName] = useState('');
  const [format, setFormat] = useState<ExportFormat>('PDF');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!documentId) return;
    const [doc, p] = await Promise.all([
      getDocument(documentId),
      getPagesForDocument(documentId),
    ]);
    setDocument(doc);
    setPages(p);
    if (doc) setFileName(doc.name);
  }, [documentId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSave = async () => {
    if (!documentId) return;
    setSaving(true);
    try {
      if (format === 'PDF') {
        const uri = await generatePdf(pages, 'A4');
        await updateDocument(documentId, { name: fileName, pdfUri: uri });
      } else {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          for (const page of pages) {
            await MediaLibrary.saveToLibraryAsync(page.imageUri);
          }
        }
        await updateDocument(documentId, { name: fileName });
      }
      router.push('/home');
    } catch (e) {
      Alert.alert('Error', 'Failed to save document.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Save Document</Text>
        <View style={styles.iconButton} />
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionLabel}>File Name</Text>
        <TextInput
          style={styles.nameInput}
          value={fileName}
          onChangeText={setFileName}
          placeholder="Document name"
          placeholderTextColor={Colors.textSecondary}
        />

        <Text style={styles.sectionLabel}>Format</Text>
        <SegmentedControl options={FORMATS} selected={format} onSelect={setFormat} />

        <Text style={styles.sectionLabel}>Save Location</Text>
        <TouchableOpacity style={styles.locationCard} activeOpacity={0.8}>
          <View style={styles.locationIconWrap}>
            <Ionicons name="folder-outline" size={22} color={Colors.primary} />
          </View>
          <View style={styles.locationTextWrap}>
            <Text style={styles.locationTitle}>Documents</Text>
            <Text style={styles.locationSubtitle}>Internal Storage / Documents</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
          <Ionicons name="download-outline" size={18} color={Colors.white} />
          <Text style={styles.saveButtonText}>Save Document</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 20,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
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
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  locationIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.blue50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationTextWrap: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  locationSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
