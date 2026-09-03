import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/utils/colors';

interface SettingRowProps {
  label: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}

function SettingRow({ label, subtitle, onPress, right }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.rowRight}>{right}</View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [autoEnhance, setAutoEnhance] = useState(true);
  const [autoDelete, setAutoDelete] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>SCAN SETTINGS</Text>
        <View style={styles.section}>
          <SettingRow
            label="Default Format"
            right={<Text style={styles.valueBlue}>PDF</Text>}
          />
          <SettingRow
            label="Default Page Size"
            right={<Text style={styles.valueBlue}>A4</Text>}
          />
          <SettingRow
            label="Image Quality"
            right={<Text style={styles.valueBlue}>High</Text>}
          />
          <SettingRow
            label="Auto-Enhance"
            subtitle="Automatically improve scan quality"
            right={
              <Switch
                value={autoEnhance}
                onValueChange={setAutoEnhance}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            }
          />
        </View>

        <Text style={styles.sectionHeader}>STORAGE</Text>
        <View style={styles.section}>
          <SettingRow
            label="Save Location"
            subtitle="Internal Storage / Documents"
            onPress={() => {}}
            right={<Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />}
          />
          <SettingRow
            label="Auto-Delete"
            subtitle="Delete originals after processing"
            right={
              <Switch
                value={autoDelete}
                onValueChange={setAutoDelete}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            }
          />
        </View>

        <Text style={styles.sectionHeader}>ABOUT</Text>
        <View style={styles.section}>
          <SettingRow label="Version" right={<Text style={styles.valueGray}>1.0.0</Text>} />
          <SettingRow
            label="Privacy Policy"
            onPress={() => {}}
            right={<Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />}
          />
        </View>
      </ScrollView>
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
    fontWeight: 'bold',
    fontSize: 18,
    color: Colors.text,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  section: {
    backgroundColor: Colors.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  rowSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueBlue: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  valueGray: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
