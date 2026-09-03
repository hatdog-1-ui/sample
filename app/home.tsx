import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/utils/colors';
import { getAllDocuments, getAllFolders, searchDocuments } from '../src/database/repository';
import type { Document, Folder } from '../src/types';

export default function HomeScreen() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const loadData = useCallback(async () => {
    const [docs, fols] = await Promise.all([getAllDocuments(), getAllFolders()]);
    setDocuments(docs);
    setFolders(fols);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSearchChange = async (text: string) => {
    setSearchQuery(text);
    if (text.trim().length > 0) {
      setIsSearching(true);
      const results = await searchDocuments(text.trim());
      setDocuments(results);
    } else {
      setIsSearching(false);
      const docs = await getAllDocuments();
      setDocuments(docs);
    }
  };

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
        <Text style={styles.title}>DocScan Pro</Text>
        <View style={styles.topBarIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search" size={22} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search documents..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
      </View>

      {folders.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.folderScroll}
          contentContainerStyle={styles.folderScrollContent}
        >
          {folders.map((folder) => (
            <TouchableOpacity
              key={folder.id}
              style={styles.folderChip}
              onPress={() => router.push(`/folder?name=${encodeURIComponent(folder.name)}`)}
            >
              <Ionicons name="folder" size={16} color={Colors.primary} />
              <Text style={styles.folderChipText}>{folder.name}</Text>
              <Text style={styles.folderChipCount}>{folder.documentCount}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {documents.length === 0 && !isSearching ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="camera" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Scan Your First Document</Text>
          <Text style={styles.emptySubtitle}>
            Tap the button below to start scanning documents with your camera.
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={() => router.push('/camera')}>
            <Text style={styles.startButtonText}>Start Scanning</Text>
          </TouchableOpacity>
        </View>
      ) : documents.length === 0 && isSearching ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptySubtitle}>No documents found.</Text>
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
        <Ionicons name="add" size={28} color={Colors.white} />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    color: Colors.text,
  },
  topBarIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  folderScroll: {
    maxHeight: 44,
    marginBottom: 8,
  },
  folderScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blue50,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginRight: 8,
  },
  folderChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  folderChipCount: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.blue50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
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
