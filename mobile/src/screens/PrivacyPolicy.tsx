import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius } from '../constants/theme';

const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation<any>(); // use any to avoid type issues

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Top Bar with Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Privacy Policy</Text>
      </View>

      {/* Main Content */}
      <View style={styles.card}>
        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.text}>
            Welcome to Therapy AI. This Privacy Policy explains how we handle your personal data when you use our services, in alignment with HIPAA-like privacy and data protection standards.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          <View style={styles.indent}>
            <Text style={styles.text}><Text style={styles.bold}>Personal Information:</Text> Name, email address, and communication logs.</Text>
            <Text style={styles.text}><Text style={styles.bold}>Usage Data:</Text> How you interact with the app, session timestamps, preferences.</Text>
            <Text style={styles.text}><Text style={styles.bold}>Device Data:</Text> Browser type, device ID, IP address (for security monitoring).</Text>
          </View>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. How We Use Information</Text>
          <Text style={styles.text}>
            We use the data to personalize sessions, improve conversational accuracy, ensure account security, and maintain compliance. We never sell your data.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Sharing</Text>
          <Text style={styles.text}>
            We may share information only with trusted infrastructure partners such as Google Cloud for storage and model hosting, under strict data agreements. No advertising partners receive identifiable user data.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Security & Storage</Text>
          <Text style={styles.text}>
            Your data is encrypted in transit (HTTPS) and at rest (AES-256). Access is restricted to authorized personnel only, monitored under multi-factor authentication and audit logging.
          </Text>
        </View>

        {/* Section 6 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Your Rights & Choices</Text>
          <View style={styles.indent}>
            <Text style={styles.text}>• Access or request a copy of your data</Text>
            <Text style={styles.text}>• Request correction or deletion</Text>
            <Text style={styles.text}>• Opt out of analytics tracking</Text>
          </View>
        </View>

        {/* Section 7 */}
        <View style={[styles.section, styles.sectionBorder]}>
          <Text style={styles.sectionTitle}>7. Updates to This Policy</Text>
          <Text style={styles.text}>
            We may update this Privacy Policy from time to time. Major updates will be communicated via email or in-app notice. Last updated: October 2025.
          </Text>
        </View>

      </View>
    </ScrollView>
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.lg },

  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  backButton: { paddingRight: spacing.md },
  backText: { fontSize: 16, color: colors.accent },
  topBarTitle: { fontSize: 20, fontWeight: '700', color: colors.primary },

  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },

  section: { marginBottom: spacing.md },
  sectionBorder: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, marginTop: spacing.md },

  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.primary, marginBottom: 6 },
  text: { fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: 4 },
  bold: { fontWeight: '600', color: colors.text },
  indent: { marginLeft: spacing.md },
});