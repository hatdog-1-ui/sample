import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import { Colors } from '../src/utils/colors';

export default function PermissionsScreen() {
  const router = useRouter();

  const handleGrant = useCallback(async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status === 'granted') {
        router.replace('/home');
      } else {
        Alert.alert(
          'Permission Needed',
          'Camera access is required to scan documents. You can enable it later in Settings.'
        );
      }
    } catch (e) {
      Alert.alert('Error', 'Could not request camera permission.');
    }
  }, [router]);

  const handleNotNow = useCallback(() => {
    router.replace('/home');
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.heroIconCircle}>
          <Ionicons name="camera" size={44} color={Colors.white} />
        </View>

        <Text style={styles.title}>Camera Access</Text>
        <Text style={styles.description}>
          DocScan Pro needs camera access to scan your documents. Your photos are processed
          on-device and never uploaded.
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoIconCircle}>
            <Ionicons name="camera-outline" size={20} color={Colors.primary} />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Camera</Text>
            <Text style={styles.infoSubtitle}>To scan and capture documents</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconCircle}>
            <Ionicons name="folder-outline" size={20} color={Colors.primary} />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Storage</Text>
            <Text style={styles.infoSubtitle}>To save scans to your device</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.grantButton} onPress={handleGrant} activeOpacity={0.85}>
          <Text style={styles.grantButtonText}>Grant Permissions</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNotNow}>
          <Text style={styles.notNowText}>Not now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  heroIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.blue50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 40,
    alignItems: 'center',
  },
  grantButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  grantButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  notNowText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
