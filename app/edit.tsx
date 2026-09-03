import { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/utils/colors';
import { getPagesForDocument, updatePage } from '../src/database/repository';
import type { Page, FilterType } from '../src/types';

const FILTERS: { key: FilterType; label: string; color: string }[] = [
  { key: 'original', label: 'Original', color: Colors.blue50 },
  { key: 'bw', label: 'B&W', color: '#374151' },
  { key: 'magic', label: 'Magic', color: '#818CF8' },
  { key: 'grayscale', label: 'Gray', color: '#9CA3AF' },
];

const SLIDER_WIDTH = 280;

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt: GestureResponderEvent) => {
      const x = evt.nativeEvent.locationX;
      const pct = Math.max(0, Math.min(100, Math.round((x / SLIDER_WIDTH) * 100)));
      onChange(pct);
    },
  });

  return (
    <View style={styles.sliderBlock}>
      <View style={styles.sliderHeaderRow}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{value}%</Text>
      </View>
      <View style={styles.sliderTrackWrap} {...panResponder.panHandlers}>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${value}%` }]} />
        </View>
        <View style={[styles.sliderThumb, { left: `${value}%` }]} />
      </View>
    </View>
  );
}

export default function EditScreen() {
  const router = useRouter();
  const { documentId } = useLocalSearchParams<{ documentId: string }>();
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('original');
  const [brightness, setBrightness] = useState(65);
  const [contrast, setContrast] = useState(50);
  const [rotation, setRotation] = useState(0);

  const loadData = useCallback(async () => {
    if (!documentId) return;
    const p = await getPagesForDocument(documentId);
    setPages(p);
  }, [documentId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const currentPage = pages[currentPageIndex];

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleSave = async () => {
    if (currentPage) {
      await updatePage(currentPage.id, { ocrText: currentPage.ocrText });
    }
    router.push(`/pdf-preview?documentId=${documentId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.previewWrap}>
          {currentPage ? (
            <Image
              source={{ uri: currentPage.imageUri }}
              style={[styles.previewImage, { transform: [{ rotate: `${rotation}deg` }] }]}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.previewImage} />
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={styles.filterItem}
              onPress={() => setCurrentFilter(f.key)}
            >
              <View
                style={[
                  styles.filterSwatch,
                  { backgroundColor: f.color },
                  currentFilter === f.key && styles.filterSwatchSelected,
                ]}
              />
              <Text
                style={[
                  styles.filterLabel,
                  currentFilter === f.key && styles.filterLabelSelected,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.rotateRow}>
          <TouchableOpacity style={styles.rotateButton} onPress={handleRotate}>
            <Ionicons name="reload-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <Slider label="Brightness" value={brightness} onChange={setBrightness} />
        <Slider label="Contrast" value={contrast} onChange={setContrast} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pageStrip}
        >
          {pages.map((p, idx) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.pageThumb,
                idx === currentPageIndex && styles.pageThumbActive,
              ]}
              onPress={() => setCurrentPageIndex(idx)}
            >
              <Image source={{ uri: p.imageUri }} style={styles.pageThumbImage} />
              <View style={styles.pageThumbBadge}>
                <Text style={styles.pageThumbBadgeText}>{idx + 1}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
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
  scrollContent: {
    paddingBottom: 24,
  },
  previewWrap: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  previewImage: {
    width: '75%',
    aspectRatio: 3 / 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 16,
  },
  filterItem: {
    alignItems: 'center',
    gap: 6,
  },
  filterSwatch: {
    width: 52,
    height: 52,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterSwatchSelected: {
    borderColor: Colors.primary,
  },
  filterLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  filterLabelSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  rotateRow: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  rotateButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sliderBlock: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sliderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  sliderValue: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  sliderTrackWrap: {
    width: SLIDER_WIDTH,
    maxWidth: '100%',
    height: 24,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  sliderFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    top: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    marginLeft: -8,
  },
  pageStrip: {
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 24,
  },
  pageThumb: {
    width: 44,
    height: 56,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  pageThumbActive: {
    borderColor: Colors.primary,
  },
  pageThumbImage: {
    width: '100%',
    height: '100%',
  },
  pageThumbBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  pageThumbBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '600',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
