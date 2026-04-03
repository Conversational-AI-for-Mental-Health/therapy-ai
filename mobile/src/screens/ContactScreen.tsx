import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius } from '../constants/theme';

const ContactScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!name || !email || !message) {
      Alert.alert('Please fill all fields');
      return;
    }

    Alert.alert('Thanks', 'We received your message.');
    setName('');
    setEmail('');
    setMessage('');
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Contact Us</Text>
      </View>

      {/* Intro */}
      <View style={styles.card}>
        <Text style={styles.intro}>
          We're here to help and answer any questions you may have. Reach out to our team and we will respond promptly.
        </Text>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            style={styles.input}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Your email"
            keyboardType="email-address"
            style={styles.input}
          />

          <Text style={styles.label}>Message</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Your message"
            multiline
            style={[styles.input, styles.textarea]}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Send Message</Text>
          </TouchableOpacity>
        </View>

        {/* Other Ways */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Ways to Connect</Text>
          <Text style={styles.text}>Email: support@mindguide.ai</Text>
          <Text style={styles.text}>Address: University of Texas at Arlington, 701 S Nedderman Dr, Arlington, TX 76019</Text>
          <Text style={styles.text}>Follow us on social platforms for updates and resources.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ContactScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.lg },

  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  backButton: { paddingRight: spacing.md },
  backText: { fontSize: 16, color: colors.accent },
  topBarTitle: { fontSize: 20, fontWeight: '700', color: colors.primary },

  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  intro: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.md },

  form: { marginBottom: spacing.lg },
  label: { fontSize: 14, color: colors.textMuted, marginBottom: 4, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.md, color: colors.text },
  textarea: { height: 120, textAlignVertical: 'top' },

  button: { backgroundColor: colors.primary, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: 'center', marginTop: spacing.md },
  buttonText: { color: colors.white, fontWeight: '700' },

  section: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.primary, marginBottom: spacing.sm },
  text: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.xs },
});