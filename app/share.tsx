import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as MailComposer from 'expo-mail-composer';
import * as Sharing from 'expo-sharing';
import { Colors } from '../src/utils/colors';
import { getDocument } from '../src/database/repository';
import type { Document } from '../src/types';

function formatSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export default function ShareScreen() {
  const router = useRouter();
  const { documentId } = useLocalSearchParams<{ documentId: string }>();
  const [document, setDocument] = useState<Document | null>(null);

  const loadData = useCallback(async () => {
    if (!documentId) return;
    const doc = await getDocument(documentId);
    setDocument(doc);
  }, [documentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getFileUri = useCallback(() => {
    return document?.pdfUri ?? document?.thumbnailUri ?? null;
  }, [document]);

  const handleGmailShare = useCallback(async () => {
    if (!document) return;
    const fileUri = getFileUri();
    try {
      const available = await MailComposer.isAvailableAsync();
      if (!available) {
        Alert.alert('Mail not available', 'No email account is configured on this device.');
        return;
      }
      await MailComposer.composeAsync({
        subject: document.name,
        attachments: fileUri ? [fileUri] : [],
      });
    } catch (e) {
      Alert.alert('Error', 'Could not open the mail composer.');
    }
  }, [document, getFileUri]);

  const handleOtherAppShare = useCallback(async () => {
    const fileUri = getFileUri();
    if (!fileUri) {
      Alert.alert('Nothing to share', 'This document does not have a file yet.');
      return;
    }
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Sharing not available', 'Sharing is not supported on this device.');
        return;
      }
      await Sharing.shareAsync(fileUri);
    } catch (e) {
      Alert.alert('Error', 'Could not share this document.');
    }
  }, [getFileUri]);

  const otherApps: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'drive', label: 'Drive', icon: 'logo-google' },
    { key: 'messages', label: 'Messages', icon: 'chatbubble-ellipses-outline' },
    { key: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp' },
    { key: 'more', label: 'More', icon: 'ellipsis-horizontal' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Share</Text>
        <View style={styles.iconButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.fileCard}>
          <View style={styles.fileIconCircle}>
            <Ionicons name="document-text" size={42} color={Colors.primary} />
          </View>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {document?.name ?? 'Document'}.pdf
            </Text>
            <Text style={styles.fileMeta}>
              {document?.pageCount ?? 0} pages · {formatSize(document?.totalSizeBytes ?? 0)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Send via</Text>

        <TouchableOpacity style={styles.gmailCard} onPress={handleGmailShare} activeOpacity={0.8}>
          <View style={styles.gmailIconSquare}>
            <Ionicons name="mail" size={22} color={Colors.white} />
          </View>
          <View style={styles.gmailInfo}>
            <Text style={styles.gmailTitle}>Gmail</Text>
            <Text style={styles.gmailSubtitle}>Send as email attachment</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>

        <Text style={styles.sectionHeader}>Other Apps</Text>

        <View style={styles.appsRow}>
          {otherApps.map((app) => (
            <TouchableOpacity
              key={app.key}
              style={styles.appItem}
              onPress={handleOtherAppShare}
              activeOpacity={0.8}
            >
              <View style={styles.appIconCircle}>
                <Ionicons name={app.icon} size={22} color={Colors.text} />
              </View>
              <Text style={styles.appLabel}>{app.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  fileIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.blue50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  fileMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 10,
    marginTop: 4,
  },
  gmailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.blue50,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
  },
  gmailIconSquare: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gmailInfo: {
    flex: 1,
  },
  gmailTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  gmailSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  appsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  appItem: {
    alignItems: 'center',
    gap: 8,
    width: '23%',
  },
  appIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
