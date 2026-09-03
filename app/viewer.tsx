import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/utils/colors';
import { getDocument, getPagesForDocument, deleteDocument } from '../src/database/repository';
import type { Document, Page } from '../src/types';

export default function ViewerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [document, setDocument] = useState<Document | null>(null);
  const [pages, setPages] = useState<Page[]>([]);

  const loadData = useCallback(async () => {
    if (!id) return;
    const doc = await getDocument(id);
    const docPages = await getPagesForDocument(id);
    setDocument(doc);
    setPages(docPages);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = useCallback(() => {
    if (!id) return;
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteDocument(id);
            router.back();
          },
        },
      ]
    );
  }, [id, router]);

  const formattedDate = document
    ? new Date(document.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const firstPageId = pages.length > 0 ? pages[0].id : '';

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {document?.name ?? 'Document'}
          </Text>
          <Text style={styles.subtitle}>
            {pages.length} {pages.length === 1 ? 'page' : 'pages'} · {formattedDate}
          </Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="ellipsis-horizontal" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {pages.map((page) => (
          <View key={page.id} style={styles.pageCard}>
            <Text style={styles.pageLabel}>PAGE {page.pageNumber}</Text>
            {page.imageUri ? (
              <Image source={{ uri: page.imageUri }} style={styles.pageImage} resizeMode="cover" />
            ) : (
              <View style={styles.placeholder}>
                <View style={styles.placeholderLine} />
                <View style={[styles.placeholderLine, { width: '80%' }]} />
                <View style={[styles.placeholderLine, { width: '60%' }]} />
              </View>
            )}
          </View>
        ))}
        {pages.length === 0 && (
          <Text style={styles.emptyText}>No pages in this document yet.</Text>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/camera')}>
          <Ionicons name="add-circle-outline" size={22} color={Colors.text} />
          <Text style={styles.actionLabel}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/share?documentId=${id}`)}
        >
          <Ionicons name="share-outline" size={22} color={Colors.text} />
          <Text style={styles.actionLabel}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/pdf-preview?documentId=${id}`)}
        >
          <Ionicons name="document-outline" size={22} color={Colors.text} />
          <Text style={styles.actionLabel}>PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/ocr?pageId=${firstPageId}`)}
        >
          <Ionicons name="text-outline" size={22} color={Colors.text} />
          <Text style={styles.actionLabel}>OCR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={22} color={Colors.error} />
          <Text style={[styles.actionLabel, { color: Colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingHorizontal: 8,
    paddingTop: 54,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  pageCard: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  pageLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pageImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  placeholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    padding: 16,
    justifyContent: 'center',
  },
  placeholderLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginBottom: 10,
    width: '100%',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 40,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: 24,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionLabel: {
    fontSize: 10,
    color: Colors.text,
  },
});
