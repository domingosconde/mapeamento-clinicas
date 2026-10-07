import { SafeAreaView } from "react-native-safe-area-context";
import type { PropsWithChildren } from "react";
import type { ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

export function ScreenContainer({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return (
    <View style={styles.outer}>
      <SafeAreaView edges={["top", "left", "right"]} style={[styles.safe, style]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "#f5fbfa" },
  safe: { flex: 1 },
});
