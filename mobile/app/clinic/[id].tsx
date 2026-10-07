import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { fetchClinic, type Clinic } from "@/lib/api";

export default function ClinicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void fetchClinic(id).then(setClinic).catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Clínica não encontrada.")).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ScreenContainer style={styles.center}><ActivityIndicator color="#0d9488" size="large" /></ScreenContainer>;
  if (error || !clinic) return <ScreenContainer style={styles.center}><Text style={styles.error}>{error ?? "Clínica não encontrada."}</Text><Pressable onPress={() => router.back()} style={styles.button}><Text style={styles.buttonText}>Voltar</Text></Pressable></ScreenContainer>;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button"><Ionicons name="arrow-back" size={20} color="#0d9488" /><Text style={styles.backText}>Voltar</Text></Pressable>
        <View style={styles.hero}><View style={styles.heroIcon}><Text style={styles.heroPlus}>+</Text></View><Text style={styles.eyebrow}>PERFIL DA CLÍNICA</Text><Text style={styles.title}>{clinic.name}</Text>{clinic.isVerified ? <Text style={styles.verified}>✓ Clínica verificada</Text> : null}</View>
        {clinic.description ? <View style={styles.card}><Text style={styles.heading}>Sobre</Text><Text style={styles.body}>{clinic.description}</Text></View> : null}
        <View style={styles.card}><Text style={styles.heading}>Informações</Text><InfoRow icon="location-outline" text={`${clinic.address}\n${clinic.city}, ${clinic.state}`} /><InfoRow icon="star-outline" text={clinic.averageRating ? `${Number(clinic.averageRating).toFixed(1)} de 5 (${clinic.totalRatings ?? 0} avaliações)` : "Sem avaliações"} />{clinic.phone ? <Pressable onPress={() => void Linking.openURL(`tel:${clinic.phone}`)} style={styles.contact}><Ionicons name="call-outline" size={19} color="#0d9488" /><Text style={styles.contactText}>{clinic.phone}</Text></Pressable> : null}{clinic.email ? <Pressable onPress={() => void Linking.openURL(`mailto:${clinic.email}`)} style={styles.contact}><Ionicons name="mail-outline" size={19} color="#0d9488" /><Text style={styles.contactText}>{clinic.email}</Text></Pressable> : null}</View>
        <Text style={styles.note}>Para agendar, entre no site Clínicas Próximas e escolha um horário disponível.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function InfoRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) { return <View style={styles.contact}><Ionicons name={icon} size={19} color="#0d9488" /><Text style={styles.body}>{text}</Text></View>; }

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", padding: 24 },
  content: { padding: 20, paddingBottom: 36 },
  back: { alignItems: "center", flexDirection: "row", gap: 6, marginBottom: 18 },
  backText: { color: "#0d9488", fontSize: 15, fontWeight: "700" },
  hero: { alignItems: "center", backgroundColor: "#0d9488", borderRadius: 20, padding: 24 },
  heroIcon: { alignItems: "center", backgroundColor: "#ffffff", borderRadius: 20, height: 64, justifyContent: "center", marginBottom: 16, width: 64 },
  heroPlus: { color: "#0d9488", fontSize: 38, fontWeight: "800" },
  eyebrow: { color: "#ccfbf1", fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: "#ffffff", fontSize: 28, fontWeight: "800", marginTop: 8, textAlign: "center" },
  verified: { color: "#ccfbf1", fontSize: 14, fontWeight: "700", marginTop: 10 },
  card: { backgroundColor: "#ffffff", borderColor: "#dcebe8", borderRadius: 16, borderWidth: 1, marginTop: 16, padding: 18 },
  heading: { color: "#0f172a", fontSize: 19, fontWeight: "800", marginBottom: 12 },
  body: { color: "#475569", fontSize: 15, lineHeight: 22 },
  contact: { alignItems: "center", flexDirection: "row", gap: 10, marginTop: 12 },
  contactText: { color: "#0d9488", flex: 1, fontSize: 15, fontWeight: "600" },
  note: { color: "#64748b", fontSize: 13, lineHeight: 20, marginTop: 18, textAlign: "center" },
  button: { backgroundColor: "#0d9488", borderRadius: 10, marginTop: 14, paddingHorizontal: 18, paddingVertical: 11 },
  buttonText: { color: "#ffffff", fontWeight: "700" },
  error: { color: "#b91c1c", textAlign: "center" },
});
