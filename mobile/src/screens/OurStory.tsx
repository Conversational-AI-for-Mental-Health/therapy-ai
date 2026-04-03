import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, radius } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';

export default function OurStoryScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Custom Top Bar with Back Button */}
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>Our Story</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Our Story</Text>
          <Text style={styles.subtitle}>
            Empowering minds through accessible mental health support
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Mission */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.text}>
              Therapy AI is designed by the <Text style={styles.bold}>Mind Guide</Text> team...
            </Text>
          </View>

          {/* Vision */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Vision</Text>
            <Text style={styles.text}>We envision a world...</Text>
          </View>

          {/* Values */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Values</Text>
            <Text style={styles.text}>• Empathy and Respect</Text>
            <Text style={styles.text}>• Data Privacy and Security</Text>
            <Text style={styles.text}>• Accessibility and Inclusion</Text>
          </View>

          {/* Team */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meet the Team</Text>
            <Text style={styles.text}>
              The project is developed by students from the{' '}
              <Text style={styles.bold}>University of Texas at Arlington (UTA)</Text>...
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: spacing.md, 
    paddingVertical: 12,
    borderBottomWidth: 1, 
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  backBtn: { paddingRight: 16 },
  backText: { fontSize: 16, color: colors.primary },
  topbarTitle: { fontSize: 18, fontWeight: '600', color: colors.primary },

  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', maxWidth: 300 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  section: { marginBottom: spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.primary, marginBottom: 6 },
  text: { fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: 4 },
  bold: { fontWeight: '600', color: colors.text },
});