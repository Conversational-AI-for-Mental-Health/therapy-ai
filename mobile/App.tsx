import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import type { LoginRequest } from '@therapy-ai/shared';

export default function App() {
  const starterPayload: LoginRequest = {
    email: 'demo@example.com',
    password: 'password123',
  };

  return (
    <View style={styles.container}>
      <Text>Therapy AI Mobile app</Text>
      <Text style={styles.subText}>
        Shared types ready: {starterPayload.email}
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subText: {
    marginTop: 8,
    color: '#555',
  },
});
