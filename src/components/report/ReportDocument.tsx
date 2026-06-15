import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { CATEGORY_META } from "@/lib/category";
import { DISCLAIMER_TEXT } from "@/components/Disclaimer";
import type { ScreeningResult } from "@/lib/result";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 11, color: "#0f172a", lineHeight: 1.5 },
  brand: { fontSize: 12, color: "#e11d48", fontWeight: 700, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 10, color: "#64748b", marginBottom: 20 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
  },
  statLabel: { fontSize: 9, color: "#64748b", marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: 700 },
  badge: { fontSize: 14, fontWeight: 700, padding: 4 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginTop: 8, marginBottom: 6 },
  paragraph: { marginBottom: 8 },
  disclaimer: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    fontSize: 8,
    color: "#94a3b8",
  },
});

interface ReportDocumentProps {
  result: ScreeningResult;
  explanation: string;
}

export function ReportDocument({ result, explanation }: ReportDocumentProps) {
  const meta = CATEGORY_META[result.category];
  const coverage = Math.round((result.matchedSnps / result.totalSnps) * 100);

  return (
    <Document title={`CAD Risk Report - ${result.fileName}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>CardioRisk</Text>
        <Text style={styles.title}>CAD Genetic Risk Report</Text>
        <Text style={styles.subtitle}>
          {result.fileName} · Generated {new Date(result.createdAt).toLocaleString()}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Risk percentile</Text>
            <Text style={styles.statValue}>{result.percentile}th</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Risk category</Text>
            <Text style={{ ...styles.badge, color: meta.color }}>{result.category}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>SNP coverage</Text>
            <Text style={styles.statValue}>{coverage}%</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Summary &amp; interpretation</Text>
        {explanation.split("\n\n").map((paragraph, i) => (
          <Text key={i} style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}

        <Text style={styles.disclaimer}>{DISCLAIMER_TEXT}</Text>
      </Page>
    </Document>
  );
}
