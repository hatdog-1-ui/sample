import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera } from 'expo-camera';
import { Colors } from '../src/utils/colors';
import { getDatabase } from '../src/database/db';
import { LinearGradient } from '../src/components/LinearGradient';

export default function SplashScreen() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      await getDatabase();
      setIsReady(true);
      const timer = setTimeout(async () => {
        const { status } = await Camera.getCameraPermissionsAsync();
        if (status === 'granted') {
          router.replace('/home');
        } else {
          router.replace('/permissions');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
    init();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>📄</Text>
          </View>
          <Text style={styles.title}>DocScan Pro</Text>
          <Text style={styles.tagline}>SCAN · SAVE · SHARE</Text>
          <View style={styles.dots}>
            <View style={[styles.dot, { opacity: 0.4 }]} />
            <View style={[styles.dot, { opacity: 0.7 }]} />
            <View style={[styles.dot, { opacity: 0.4 }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontSize: 38 },
  title: {
    fontWeight: 'bold',
    fontSize: 30,
    color: Colors.white,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 3,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 36,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
});
