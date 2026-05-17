export type Category = "people" | "technical" | "safety" | "business";

export const CATEGORIES: { key: Category; label: string; color: string; track: string }[] = [
  { key: "people", label: "People", color: "#fa114f", track: "rgba(250,17,79,0.18)" },
  { key: "technical", label: "Technical", color: "#92e82a", track: "rgba(146,232,42,0.18)" },
  { key: "safety", label: "Safety", color: "#1ad5fd", track: "rgba(26,213,253,0.18)" },
  { key: "business", label: "Business", color: "#f5a623", track: "rgba(245,166,35,0.18)" },
];

export type Training = Record<Category, { required: number; completed: number }>;

export type OrgNode = {
  id: string;
  name: string;
  type: "company" | "division" | "department" | "team" | "person";
  role?: string;
  children?: OrgNode[];
  training?: Training; // only on persons (leaf)
};

// ---- Demo data generator (deterministic) ----
function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function makePerson(id: string, name: string, role: string, seed: number): OrgNode {
  const r = rand(seed);
  const gen = (min: number, max: number) => Math.floor(min + r() * (max - min + 1));
  const t: Training = {} as Training;
  for (const c of CATEGORIES) {
    const required = gen(4, 10);
    const completed = Math.min(required, gen(1, required + 2));
    t[c.key] = { required, completed };
  }
  return { id, name, type: "person", role, training: t };
}

const firstNames = ["Ava","Liam","Noah","Mia","Ethan","Zoe","Kai","Eli","Maya","Owen","Iris","Luca","Nora","Theo","Sage","Jude"];
const lastNames = ["Reed","Chen","Patel","Kim","Singh","Lopez","Garcia","Khan","Walsh","Yamada","Brooks","Ortiz"];
const roles = ["Engineer","Analyst","Manager","Specialist","Lead","Coordinator"];

let seedCounter = 1;
function team(name: string, size: number): OrgNode {
  const people: OrgNode[] = [];
  for (let i = 0; i < size; i++) {
    const fn = firstNames[(seedCounter * 3 + i) % firstNames.length];
    const ln = lastNames[(seedCounter * 7 + i) % lastNames.length];
    const role = roles[(seedCounter + i) % roles.length];
    people.push(makePerson(`p-${seedCounter}-${i}`, `${fn} ${ln}`, role, seedCounter * 100 + i));
  }
  seedCounter++;
  return { id: `team-${seedCounter}`, name, type: "team", children: people };
}

function dept(name: string, teams: OrgNode[]): OrgNode {
  seedCounter++;
  return { id: `dept-${seedCounter}`, name, type: "department", children: teams };
}

function division(name: string, depts: OrgNode[]): OrgNode {
  seedCounter++;
  return { id: `div-${seedCounter}`, name, type: "division", children: depts };
}

export const ORG: OrgNode = {
  id: "company",
  name: "Acme Corporation",
  type: "company",
  children: [
    division("Engineering", [
      dept("Platform", [team("Infrastructure", 6), team("Developer Experience", 5)]),
      dept("Product Engineering", [team("Web", 7), team("Mobile", 5), team("Data", 4)]),
    ]),
    division("Operations", [
      dept("Manufacturing", [team("Line A", 8), team("Line B", 7)]),
      dept("Logistics", [team("Warehouse", 6), team("Fleet", 5)]),
    ]),
    division("Commercial", [
      dept("Sales", [team("Enterprise", 5), team("SMB", 6)]),
      dept("Marketing", [team("Brand", 4), team("Growth", 4)]),
    ]),
  ],
};

// ---- Aggregation ----
export function aggregate(node: OrgNode): Training {
  if (node.training) return node.training;
  const acc: Training = {
    people: { required: 0, completed: 0 },
    technical: { required: 0, completed: 0 },
    safety: { required: 0, completed: 0 },
    business: { required: 0, completed: 0 },
  };
  for (const child of node.children ?? []) {
    const t = aggregate(child);
    for (const c of CATEGORIES) {
      acc[c.key].required += t[c.key].required;
      acc[c.key].completed += t[c.key].completed;
    }
  }
  return acc;
}

export function countPeople(node: OrgNode): number {
  if (node.type === "person") return 1;
  return (node.children ?? []).reduce((s, c) => s + countPeople(c), 0);
}

export function findPath(root: OrgNode, id: string, path: OrgNode[] = []): OrgNode[] | null {
  const next = [...path, root];
  if (root.id === id) return next;
  for (const c of root.children ?? []) {
    const found = findPath(c, id, next);
    if (found) return found;
  }
  return null;
}

export function typeLabel(t: OrgNode["type"]) {
  return { company: "Company", division: "Division", department: "Department", team: "Team", person: "Person" }[t];
}
