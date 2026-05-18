import raw from "@/data/dan_team_data.json";

export type RiskTier = "high" | "medium" | "low";

export interface RiskItem {
  tier: RiskTier;
  category: string;
  title: string;
  detail: string;
  affectedPeople: string[];
  affectedItems: string[];
  suggestedAction: string;
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
  status:
    | "completed-current"
    | "completed-expired"
    | "overdue"
    | "due-soon"
    | "incomplete";
}

export interface Person {
  studentId: number;
  fullName: string;
  jobCodeDescription: string;
  jobTitle: string;
  site: string;
  isContractor: boolean;
  hireDate: string | null;
  assigned: number;
  completed: number;
  overdue: number;
  dueSoon: number;
  completionPct: number;
  tnaSheets: string[];
  tnaNameMatch: string;
  tnaGap: number;
  items: PersonItem[];
  riskBadges: { high: number; medium: number; low: number };
}

export interface AppData {
  schemaVersion: string;
  generated: { at: string; sfSnapshot: string; tnaSnapshot: string };
  viewer: {
    name: string;
    studentId: number;
    jobCode: string;
    site: string;
    organisation: string;
    hireDate: string;
  };
  team: { label: string; peopleCount: number; sites: string[] };
  hardFacts: {
    scope: string;
    peopleCount: number;
    distinctItemsAssigned: number;
    totalAssignments: number;
    completedAssignments: number;
    incompleteAssignments: number;
    overdueAssignments: number;
    dueSoonAssignments: number;
    completionPct: number;
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
  const n = typeof id === "string" ? Number(id) : id;
  return data.people.find((p) => p.studentId === n);
}

export function getRisksByTier(tier: RiskTier): RiskItem[] {
  return data.risks.items[tier] ?? [];
}

export function sortPeopleByCompletion(people: Person[]): Person[] {
  return [...people].sort((a, b) => a.completionPct - b.completionPct);
}

export const TIER_META: Record<
  RiskTier,
  { label: string; icon: string; blurb: string; text: string; bg: string; border: string; ring: string }
> = {
  high: {
    label: "HIGH-RISK",
    icon: "🔴",
    blurb: "Compliance gaps that could cause real failure if missed.",
    text: "text-red-700 dark:text-red-300",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-900",
    ring: "#DC2626",
  },
  medium: {
    label: "MEDIUM-RISK",
    icon: "🟡",
    blurb: "Process fragility — fix soon.",
    text: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-900",
    ring: "#D97706",
  },
  low: {
    label: "LOW-RISK",
    icon: "🟢",
    blurb: "Cumulative debt — fix steadily.",
    text: "text-green-700 dark:text-green-300",
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-900",
    ring: "#16A34A",
  },
};

export const CATEGORY_ICON: Record<string, string> = {
  "validity-bug": "🛠",
  "no-assignment": "🚫",
  overdue: "⏰",
  "coverage-gap": "↔️",
  "name-typo": "✏️",
  "cumulative-typos": "📚",
};
