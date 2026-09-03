import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/utils/colors';
import { getDocumentsByFolder } from '../src/database/repository';
import type { Document } from '../src/types';

export default function FolderScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const folderName = typeof name === 'string' ? name : '';
  const [documents, setDocuments] = useState<Document[]>([]);

  const loadData = useCallback(async () => {
    if (!folderName) return;
    const docs = await getDocumentsByFolder(folderName);
    setDocuments(docs);
  }, [folderName]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const renderDocument = ({ item }: { item: Document }) => (
    <TouchableOpacity
      style={styles.docCard}
      activeOpacity={0.8}
      onPress={() => router.push(`/viewer?id=${item.id}`)}
    >
      <View style={styles.thumbnail}>
        <View style={styles.thumbLine} />
        <View style={[styles.thumbLine, { width: '70%' }]} />
        <View style={[styles.thumbLine, { width: '85%' }]} />
        <View style={[styles.thumbLine, { width: '50%' }]} />
      </View>
      <Text style={styles.docName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.docMeta}>
        {formatDate(item.updatedAt)} · {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {folderName}
          </Text>
          <Text style={styles.subtitle}>
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </Text>
        </View>
        <View style={styles.topBarIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="create-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {documents.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptySubtitle}>No documents in this folder yet.</Text>
        </View>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderDocument}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/camera')}>
        <Ionicons name="folder-open-outline" size={24} color={Colors.white} />
      </TouchableOpacity>
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
  titleContainer: {
    flex: 1,
    marginLeft: 4,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  topBarIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  gridContent: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  gridRow: {
    gap: 12,
  },
  docCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumbnail: {
    backgroundColor: Colors.blue50,
    borderRadius: 8,
    height: 120,
    padding: 12,
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  thumbLine: {
    height: 6,
    width: '100%',
    borderRadius: 3,
    backgroundColor: Colors.blue200,
  },
  docName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  docMeta: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
