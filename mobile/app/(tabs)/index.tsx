import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { fetchClinics, type Clinic } from "@/lib/api";

export default function ExploreScreen() {
  const [search, setSearch] = useState("");
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClinics = async (term = "") => {
    setLoading(true);
    setError(null);
    try {
      setClinics(await fetchClinics(term));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Erro ao carregar clínicas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadClinics(); }, []);

  return (
    <ScreenContainer style={styles.container}>
      <FlatList
        data={clinics}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <Text style={styles.eyebrow}>CLÍNICAS PRÓXIMAS</Text>
            <Text style={styles.title}>Encontre cuidados com confiança.</Text>
            <Text style={styles.subtitle}>Pesquise clínicas e consulte informações essenciais antes de dar o próximo passo.</Text>
            <View style={styles.searchRow}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={() => void loadClinics(search)}
                placeholder="Nome da clínica"
                placeholderTextColor="#64748b"
                returnKeyType="search"
                style={styles.input}
                accessibilityLabel="Pesquisar pelo nome da clínica"
              />
              <Pressable onPress={() => void loadClinics(search)} style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]} accessibilityRole="button">
                <Text style={styles.searchButtonText}>Pesquisar</Text>
              </Pressable>
            </View>
            <Text style={styles.sectionTitle}>{search.trim() ? "Resultados" : "Clínicas em destaque"}</Text>
          </View>
        }
        ListEmptyComponent={loading ? <ActivityIndicator color="#0d9488" style={styles.loader} /> : error ? (
          <View style={styles.empty}><Text style={styles.error}>{error}</Text><Pressable onPress={() => void loadClinics(search)} style={styles.retry}><Text style={styles.retryText}>Tentar novamente</Text></Pressable></View>
        ) : <Text style={styles.emptyText}>Nenhuma clínica encontrada.</Text>}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push({ pathname: "/clinic/[id]", params: { id: String(item.id) } })} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} accessibilityRole="button">
            <View style={styles.cardTop}>
              <View style={styles.icon}><Text style={styles.iconText}>+</Text></View>
              <View style={styles.cardHeading}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardLocation}>{item.city}, {item.state}</Text>
              </View>
              {item.isVerified ? <Text style={styles.verified}>✓</Text> : null}
            </View>
            <Text style={styles.address}>{item.address}</Text>
            <View style={styles.cardBottom}>
              <Text style={styles.rating}>{item.averageRating ? `${Number(item.averageRating).toFixed(1)} ★` : "Sem avaliações"}</Text>
              <Text style={styles.more}>Ver perfil →</Text>
            </View>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#f5fbfa" },
  content: { padding: 20, paddingBottom: 32 },
  eyebrow: { color: "#0d9488", fontSize: 12, fontWeight: "800", letterSpacing: 1.5, marginBottom: 10 },
  title: { color: "#092f2d", fontSize: 32, fontWeight: "800", lineHeight: 38, maxWidth: 360 },
  subtitle: { color: "#475569", fontSize: 15, lineHeight: 23, marginTop: 10 },
  searchRow: { flexDirection: "row", gap: 8, marginTop: 22, marginBottom: 26 },
  input: { backgroundColor: "#ffffff", borderColor: "#cbdedb", borderRadius: 12, borderWidth: 1, color: "#0f172a", flex: 1, fontSize: 15, paddingHorizontal: 14, paddingVertical: 12 },
  searchButton: { alignItems: "center", backgroundColor: "#0d9488", borderRadius: 12, justifyContent: "center", paddingHorizontal: 14 },
  searchButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },
  pressed: { opacity: 0.78 },
  sectionTitle: { color: "#0f172a", fontSize: 20, fontWeight: "800", marginBottom: 12 },
  loader: { marginTop: 28 },
  card: { backgroundColor: "#ffffff", borderColor: "#dcebe8", borderRadius: 16, borderWidth: 1, marginBottom: 12, padding: 16 },
  cardPressed: { opacity: 0.72 },
  cardTop: { alignItems: "center", flexDirection: "row" },
  icon: { alignItems: "center", backgroundColor: "#ccfbf1", borderRadius: 12, height: 42, justifyContent: "center", width: 42 },
  iconText: { color: "#0d9488", fontSize: 25, fontWeight: "700" },
  cardHeading: { flex: 1, marginLeft: 12 },
  cardTitle: { color: "#0f172a", fontSize: 16, fontWeight: "800" },
  cardLocation: { color: "#64748b", fontSize: 13, marginTop: 3 },
  verified: { color: "#0d9488", fontSize: 22, fontWeight: "800" },
  address: { color: "#475569", fontSize: 14, lineHeight: 20, marginTop: 14 },
  cardBottom: { borderTopColor: "#eef5f3", borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 14, paddingTop: 12 },
  rating: { color: "#b45309", fontSize: 13, fontWeight: "700" },
  more: { color: "#0d9488", fontSize: 13, fontWeight: "700" },
  empty: { alignItems: "center", paddingVertical: 30 },
  emptyText: { color: "#64748b", paddingVertical: 30, textAlign: "center" },
  error: { color: "#b91c1c", textAlign: "center" },
  retry: { backgroundColor: "#0d9488", borderRadius: 10, marginTop: 12, paddingHorizontal: 16, paddingVertical: 10 },
  retryText: { color: "#ffffff", fontWeight: "700" },
});
