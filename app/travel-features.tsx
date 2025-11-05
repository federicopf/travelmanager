import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TravelFeaturesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Risorse viaggio',
    });
  }, [navigation]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Checklist Section */}
        <ThemedView style={styles.section}>
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => Alert.alert('Checklist', 'Funzionalità in arrivo')}
            activeOpacity={0.7}>
            <View style={styles.featureCardHeader}>
              <View style={styles.featureIconContainer}>
                <IconSymbol name="checklist" size={24} color="#0a7ea4" />
              </View>
              <View style={styles.featureCardContent}>
                <ThemedText style={styles.featureCardTitle}>Checklist</ThemedText>
                <ThemedText style={styles.featureCardSubtitle}>
                  Gestisci le cose da fare per questo viaggio
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#687076" />
            </View>
            <View style={styles.featureCardFooter}>
              <ThemedText style={styles.featureCardPlaceholder}>
                0 elementi • Funzionalità in arrivo
              </ThemedText>
            </View>
          </TouchableOpacity>
        </ThemedView>

        {/* Documents Section */}
        <ThemedView style={styles.section}>
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => Alert.alert('Documenti', 'Funzionalità in arrivo')}
            activeOpacity={0.7}>
            <View style={styles.featureCardHeader}>
              <View style={styles.featureIconContainer}>
                <IconSymbol name="documents" size={24} color="#0a7ea4" />
              </View>
              <View style={styles.featureCardContent}>
                <ThemedText style={styles.featureCardTitle}>Archivio Documentale</ThemedText>
                <ThemedText style={styles.featureCardSubtitle}>
                  Conserva i documenti del viaggio
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#687076" />
            </View>
            <View style={styles.featureCardFooter}>
              <ThemedText style={styles.featureCardPlaceholder}>
                0 documenti • Funzionalità in arrivo
              </ThemedText>
            </View>
          </TouchableOpacity>
        </ThemedView>

        {/* Tricount Section */}
        <ThemedView style={styles.section}>
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => Alert.alert('Tricount', 'Funzionalità in arrivo')}
            activeOpacity={0.7}>
            <View style={styles.featureCardHeader}>
              <View style={styles.featureIconContainer}>
                <IconSymbol name="tricount" size={24} color="#0a7ea4" />
              </View>
              <View style={styles.featureCardContent}>
                <ThemedText style={styles.featureCardTitle}>Tricount</ThemedText>
                <ThemedText style={styles.featureCardSubtitle}>
                  Gestisci e dividi le spese del viaggio
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#687076" />
            </View>
            <View style={styles.featureCardFooter}>
              <ThemedText style={styles.featureCardPlaceholder}>
                0€ totali • Funzionalità in arrivo
              </ThemedText>
            </View>
          </TouchableOpacity>
        </ThemedView>

        {/* Members Section */}
        <ThemedView style={styles.section}>
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => Alert.alert('Gestisci membri', 'Funzionalità in arrivo')}
            activeOpacity={0.7}>
            <View style={styles.featureCardHeader}>
              <View style={styles.featureIconContainer}>
                <IconSymbol name="person.2.fill" size={24} color="#0a7ea4" />
              </View>
              <View style={styles.featureCardContent}>
                <ThemedText style={styles.featureCardTitle}>Gestisci membri</ThemedText>
                <ThemedText style={styles.featureCardSubtitle}>
                  Gestisci i membri del viaggio
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#687076" />
            </View>
            <View style={styles.featureCardFooter}>
              <ThemedText style={styles.featureCardPlaceholder}>
                0 membri • Funzionalità in arrivo
              </ThemedText>
            </View>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  featureCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    overflow: 'hidden',
  },
  featureCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureCardContent: {
    flex: 1,
    gap: 4,
  },
  featureCardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  featureCardSubtitle: {
    fontSize: 13,
    opacity: 0.7,
  },
  featureCardFooter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  featureCardPlaceholder: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
  },
});

