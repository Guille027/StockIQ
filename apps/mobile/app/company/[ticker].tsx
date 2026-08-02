import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";
import { useAiReport, useCompanyProfile, useGenerateAiReport, useNews } from "@/api/hooks";
import { ApiError } from "@/api/client";
import { Card } from "@/components/Card";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SectionHeader } from "@/components/SectionHeader";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { PriceChart } from "@/components/PriceChart";
import { Disclaimer } from "@/components/Disclaimer";
import { CATEGORY_LABELS } from "@/theme/score-color";
import { cn } from "@/utils/cn";

const AI_TABS = ["Resumen", "Financiero", "Riesgos", "Noticias"] as const;
type AiTab = (typeof AI_TABS)[number];

function fmt(v: number | undefined, opts: { pct?: boolean; suffix?: string } = {}): string {
  if (v === undefined) return "n/d";
  if (opts.pct) return `${(v * 100).toFixed(1)}%`;
  return `${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}${opts.suffix ?? ""}`;
}

function fmtLarge(v: number | undefined): string {
  if (v === undefined) return "n/d";
  if (Math.abs(v) >= 1e12) return `${(v / 1e12).toFixed(2)}T`;
  if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  return v.toLocaleString();
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View className="w-1/2 mb-3 pr-2">
      <Text className="text-muted dark:text-mutedDark text-xs">{label}</Text>
      <Text className="text-ink dark:text-inkDark font-medium mt-0.5">{value}</Text>
    </View>
  );
}

export default function CompanyProfileScreen() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  const [aiTab, setAiTab] = useState<AiTab>("Resumen");
  const { data, isLoading, isError, refetch } = useCompanyProfile(ticker);
  const aiReport = useAiReport(ticker);
  const generateReport = useGenerateAiReport(ticker);
  const news = useNews(ticker);

  const reportMissing = aiReport.error instanceof ApiError && aiReport.error.status === 404;

  const f = data?.fundamentals;

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark" edges={["bottom"]}>
      <Stack.Screen options={{ title: ticker ?? "" }} />

      {isLoading ? <LoadingState label="Cargando empresa..." /> : null}
      {isError ? <ErrorState message="No se pudo cargar esta empresa." onRetry={() => refetch()} /> : null}

      {data && f ? (
        <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 40 }}>
          <View className="mt-2">
            <Text className="text-2xl font-bold text-ink dark:text-inkDark">{data.company.name}</Text>
            <Text className="text-muted dark:text-mutedDark text-sm mt-0.5">
              {data.company.ticker} · {data.company.sector} · {data.company.industry}
            </Text>
          </View>

          {data.isMock ? (
            <View className="bg-primary/10 rounded-lg px-3 py-2 mt-3">
              <Text className="text-primary dark:text-primaryDark text-xs">Datos de ejemplo (mock) -- configura las API keys del backend para datos reales.</Text>
            </View>
          ) : null}

          <Disclaimer />

          <Card className="mt-4">
            <PriceChart bars={data.priceHistory} />
          </Card>

          <SectionHeader title="Puntuación global" />
          <Card className="flex-row items-center gap-4">
            <ScoreBadge value={data.scores.globalScore} size="lg" />
            <View className="flex-1">
              <Text className="text-ink dark:text-inkDark text-sm">
                Combinación ponderada de fundamentales, momentum, riesgo, noticias y confianza de la IA. Cada componente está desglosado abajo.
              </Text>
            </View>
          </Card>

          <View className="gap-2 mt-3">
            {data.scores.breakdowns.map((b) => (
              <Card key={b.category}>
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-ink dark:text-inkDark font-medium">{CATEGORY_LABELS[b.category] ?? b.category}</Text>
                  <ScoreBadge value={b.value} size="sm" />
                </View>
                <Text className="text-muted dark:text-mutedDark text-xs leading-4">{b.summary}</Text>
              </Card>
            ))}
          </View>

          <SectionHeader title="Fundamentales" />
          <Card className="flex-row flex-wrap">
            <Metric label="Precio" value={fmt(f.price, { suffix: ` ${data.company.currency}` })} />
            <Metric label="Capitalización" value={fmtLarge(f.marketCap)} />
            <Metric label="PER" value={fmt(f.peRatio)} />
            <Metric label="PEG" value={fmt(f.pegRatio)} />
            <Metric label="ROE" value={fmt(f.roe, { pct: true })} />
            <Metric label="ROIC" value={fmt(f.roic, { pct: true })} />
            <Metric label="Margen bruto" value={fmt(f.grossMargin, { pct: true })} />
            <Metric label="Margen operativo" value={fmt(f.operatingMargin, { pct: true })} />
            <Metric label="Margen neto" value={fmt(f.netMargin, { pct: true })} />
            <Metric label="BPA" value={fmt(f.eps)} />
            <Metric label="Crec. ingresos (YoY)" value={fmt(f.revenueGrowthYoY, { pct: true })} />
            <Metric label="Crec. BPA (YoY)" value={fmt(f.epsGrowthYoY, { pct: true })} />
            <Metric label="Free Cash Flow" value={fmtLarge(f.freeCashFlow)} />
            <Metric label="Deuda total" value={fmtLarge(f.totalDebt)} />
            <Metric label="Caja" value={fmtLarge(f.cash)} />
            <Metric label="Deuda neta/EBITDA" value={fmt(f.netDebtToEbitda)} />
            <Metric label="Dividendo" value={fmt(f.dividendYield, { pct: true })} />
            <Metric label="Ownership institucional" value={fmt(f.institutionalOwnershipPct, { pct: true })} />
            <Metric label="Insider net buys (3m)" value={f.insiderNetBuys3m?.toLocaleString() ?? "n/d"} />
            <Metric label="Beta" value={fmt(f.beta)} />
          </Card>

          <SectionHeader title="Informe IA" />
          <View className="flex-row gap-2 mb-3">
            {AI_TABS.map((tab) => (
              <Pressable key={tab} onPress={() => setAiTab(tab)} className="flex-1">
                <View className={cn("py-2 rounded-lg items-center", aiTab === tab ? "bg-primary" : "bg-surface dark:bg-surfaceDark")}>
                  <Text className={aiTab === tab ? "text-white text-xs font-medium" : "text-ink dark:text-inkDark text-xs"}>{tab}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          {reportMissing && !generateReport.data ? (
            <Card className="items-center">
              <Text className="text-ink dark:text-inkDark text-sm text-center mb-3">Todavía no se ha generado un informe IA para {ticker}.</Text>
              <Pressable
                onPress={() => generateReport.mutate()}
                disabled={generateReport.isPending}
                className="bg-primary dark:bg-primaryDark rounded-xl px-5 py-2.5"
              >
                <Text className="text-white font-semibold">{generateReport.isPending ? "Generando..." : "Generar informe IA"}</Text>
              </Pressable>
            </Card>
          ) : null}

          {aiReport.isLoading ? <LoadingState label="Buscando informe IA..." /> : null}

          {(aiReport.data ?? generateReport.data) ? (
            <AiReportPanel report={(generateReport.data ?? aiReport.data)!} tab={aiTab} />
          ) : null}

          <SectionHeader title="Comparación con competidores" />
          <Card>
            {data.competitors.length === 0 ? (
              <Text className="text-muted dark:text-mutedDark text-sm">Sin competidores comparables en el universo.</Text>
            ) : (
              data.competitors.map((c) => (
                <View key={c.ticker} className="flex-row items-center justify-between py-2 border-b border-border dark:border-borderDark last:border-b-0">
                  <View className="flex-1 pr-2">
                    <Text className="text-ink dark:text-inkDark font-medium">{c.ticker}</Text>
                    <Text className="text-muted dark:text-mutedDark text-xs" numberOfLines={1}>
                      PER {fmt(c.peRatio)} · ROE {fmt(c.roe, { pct: true })}
                    </Text>
                  </View>
                  {c.globalScore !== undefined ? <ScoreBadge value={c.globalScore} size="sm" /> : null}
                </View>
              ))
            )}
          </Card>

          <SectionHeader title="Noticias" />
          <View className="gap-2">
            {(news.data?.items ?? []).map((n) => (
              <Card key={n.id}>
                <Text className="text-ink dark:text-inkDark text-sm font-medium">{n.headline}</Text>
                <Text className="text-muted dark:text-mutedDark text-xs mt-1">{n.impactNote}</Text>
              </Card>
            ))}
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

function AiReportPanel({ report, tab }: { report: NonNullable<ReturnType<typeof useAiReport>["data"]>; tab: AiTab }) {
  return (
    <Card>
      {report.isMock ? <Text className="text-primary dark:text-primaryDark text-xs mb-2">Informe de ejemplo (mock)</Text> : null}

      {tab === "Resumen" ? (
        <View className="gap-3">
          <Text className="text-ink dark:text-inkDark text-sm leading-5">{report.businessSummary}</Text>
          <Text className="text-ink dark:text-inkDark text-sm leading-5">{report.howItMakesMoney}</Text>
          <Text className="text-ink dark:text-inkDark text-sm leading-5">{report.marketExpectations}</Text>
        </View>
      ) : null}

      {tab === "Financiero" ? (
        <View className="gap-3">
          <Text className="text-ink dark:text-inkDark text-sm leading-5">{report.financialSituation}</Text>
          <Text className="text-ink dark:text-inkDark text-sm leading-5">{report.valuation}</Text>
          <Text className="text-ink dark:text-inkDark text-sm leading-5">{report.pastEarningsSummary}</Text>
        </View>
      ) : null}

      {tab === "Riesgos" ? (
        <View className="gap-3">
          <BulletList title="Riesgos" items={report.risks} />
          <BulletList title="Debilidades" items={report.weaknesses} />
          <BulletList title="Catalizadores negativos" items={report.negativeCatalysts} />
          <BulletList title="Fortalezas" items={report.strengths} />
          <BulletList title="Catalizadores positivos" items={report.positiveCatalysts} />
        </View>
      ) : null}

      {tab === "Noticias" ? <Text className="text-ink dark:text-inkDark text-sm leading-5">{report.recentNewsSummary}</Text> : null}

      <View className="flex-row items-center gap-2 mt-4 pt-3 border-t border-border dark:border-borderDark">
        <Text className="text-muted dark:text-mutedDark text-xs">AI Confidence Score</Text>
        <ScoreBadge value={report.aiConfidenceScore} size="sm" />
      </View>
    </Card>
  );
}

function BulletList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <View>
      <Text className="text-ink dark:text-inkDark font-medium text-sm mb-1">{title}</Text>
      {items.map((item, i) => (
        <Text key={i} className="text-muted dark:text-mutedDark text-sm leading-5">
          • {item}
        </Text>
      ))}
    </View>
  );
}
