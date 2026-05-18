import raw from "@/data/dan_team_data.json";

export type RiskTier = "high" | "medium" | "low";

export interface Stats {
  assigned: number;
  completed: number;
  incomplete: number;
  completionPct: number;
}

export interface PersonItem {
  itemId: string;
  itemName: string;
  itemType: string;
  curriculumId: string;
  curriculumTitle: string;
  assignmentType: string;
  completed: boolean;
  completionDate: string | null;
  daysRemaining: number | null;
  status: "completed" | "incomplete";
}

export interface RiskItem {
  tier: RiskTier;
  category: string;
  title: string;
  detail: string;
  affectedPeople: string[];
  affectedItems: string[];
  suggestedAction: string;
}

export interface Person {
  studentId: number | string;
  fullName: string;
  jobTitle: string;
  jobCodeDescription: string;
  site: string;
  organisation: string;
  personType: "Employee" | "Contractor";
  contractorCompany: string | null;
  contractorType: string | null;
  isContractor?: boolean;
  hireDate: string | null;
  level: number;
  managedById: number | string;
  hasTeam: boolean;
  teamSize: number;
  teamStats: Stats | null;
  personalStats: Stats;
  items: PersonItem[];
  tnaSheets: string[];
  tnaNameMatch: string;
  tnaGap: number;
  riskBadges: { high: number; medium: number; low: number };
}

export interface Viewer {
  studentId: number;
  fullName: string;
  jobTitle: string;
  site: string;
  organisation: string;
  personType: "Employee" | "Contractor";
  hasTeam: boolean;
  teamSize: number;
  teamComposition: { employees: number; contractors: number };
  personalStats: Stats;
  teamStats: Stats;
}

export interface AppData {
  schemaVersion: string;
  demoMode: boolean;
  anonymisationNote: string;
  generated: { at: string; sfSnapshot: string; tnaSnapshot: string };
  viewer: Viewer;
  team: {
    label: string;
    peopleCount: number;
    sites: string[];
    distinctItemsRequired: number;
  };
  orgTree?: {
    label: string;
    totalPeople: number;
    maxDepth: number;
    peoplePerLevel: Record<string, number>;
    rootViewerStudentId: number;
  };
  inferredFacts: {
    scope: string;
    tnaRequiredItemsUnion: number;
    tnaGapTotal: number;
    tnaGapsByPerson: Record<string, number>;
    confidence: "high" | "medium" | "low";
    confidenceNotes: string[];
    perPersonMatch: Record<string, string>;
  };
  issuesSummary: {
    totalIssues: number;
    byTier: { high: number; medium: number; low: number };
    byCategory: Record<string, number>;
    topConcerns: string[];
    description?: string;
  };
  risks: {
    highCount: number;
    mediumCount: number;
    lowCount: number;
    items: { high: RiskItem[]; medium: RiskItem[]; low: RiskItem[] };
  };
  people: Person[];
  items: { itemId: string; itemName: string; itemType: string }[];
}

export const data = raw as unknown as AppData;

export function getData(): AppData {
  return data;
}

export function getPersonById(id: number | string): Person | undefined {
  return data.people.find((p) => String(p.studentId) === String(id));
}

export function getDirectReports(ownerId: number | string): Person[] {
  const key = String(ownerId);
  return data.people.filter((p) => String(p.managedById) === key);
}

export function getTeamCompositionFor(
  ownerId: number | string,
): { employees: number; contractors: number } {
  const reports = getDirectReports(ownerId);
  let employees = 0;
  let contractors = 0;
  for (const p of reports) {
    if (p.personType === "Contractor") contractors++;
    else employees++;
  }
  return { employees, contractors };
}

export function aggregateInferredFor(ownerId: number | string): {
  tnaGapTotal: number;
  tnaRequiredItemsUnion: number;
  confidence: "high" | "medium" | "low";
  matched: number;
  fuzzy: number;
  none: number;
  total: number;
} {
  const reports = getDirectReports(ownerId);
  const total = reports.length;
  let matched = 0;
  let fuzzy = 0;
  let none = 0;
  let tnaGapTotal = 0;
  const itemUnion = new Set<string>();
  for (const p of reports) {
    tnaGapTotal += p.tnaGap || 0;
    if (p.tnaNameMatch === "exact") matched++;
    else if (typeof p.tnaNameMatch === "string" && p.tnaNameMatch.startsWith("fuzzy")) fuzzy++;
    else none++;
    for (const it of p.items) itemUnion.add(it.itemId);
  }
  const matchedRatio = total ? matched / total : 0;
  const partialRatio = total ? (matched + fuzzy) / total : 0;
  const confidence: "high" | "medium" | "low" =
    matchedRatio >= 0.66 ? "high" : partialRatio >= 0.5 ? "medium" : "low";
  return {
    tnaGapTotal,
    tnaRequiredItemsUnion: itemUnion.size,
    confidence,
    matched,
    fuzzy,
    none,
    total,
  };
}

export function getRisksByTier(tier: RiskTier): RiskItem[] {
  return data.risks.items[tier] ?? [];
}

export function effectiveStats(p: Person): Stats {
  return p.teamStats ?? p.personalStats;
}

export function sortByCompletion(people: Person[]): Person[] {
  return [...people].sort(
    (a, b) => effectiveStats(a).completionPct - effectiveStats(b).completionPct,
  );
}

export const TIER_META: Record<
  RiskTier,
  {
    label: string;
    icon: string;
    blurb: string;
    text: string;
    bg: string;
    border: string;
    ring: string;
  }
> = {
  high: {
    label: "High",
    icon: "🔴",
    blurb: "Compliance gaps that could cause real failure if missed.",
    text: "text-red-300",
    bg: "bg-red-950/40",
    border: "border-red-800/60",
    ring: "#DC2626",
  },
  medium: {
    label: "Medium",
    icon: "🟡",
    blurb: "Process fragility — fix soon.",
    text: "text-amber-300",
    bg: "bg-amber-950/40",
    border: "border-amber-800/60",
    ring: "#D97706",
  },
  low: {
    label: "Low",
    icon: "🟢",
    blurb: "Cumulative debt — fix steadily.",
    text: "text-green-300",
    bg: "bg-green-950/40",
    border: "border-green-800/60",
    ring: "#16A34A",
  },
};
