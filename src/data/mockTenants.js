export const mockTenants = [
  {
    id: "t1",
    name: "BurgerMe – Mülheim",
    plan: "Standard",
    status: "active",
    ownerEmail: "owner@burgerme.example",
    locations: 1,
    createdAt: "2025-09-01",
    features: {
      scheduling: true,
      attendance: true,
      inventory: false,
      riderGps: true,
      reports: true,
      integrations: false,
    },
  },
  {
    id: "t2",
    name: "Mr Baker – City Center",
    plan: "Pro",
    status: "trialing",
    ownerEmail: "manager@mrbaker.example",
    locations: 3,
    createdAt: "2025-09-15",
    features: {
      scheduling: true,
      attendance: true,
      inventory: true,
      riderGps: false,
      reports: true,
      integrations: true,
    },
  },
];
export const MODULES = [
  { key: "scheduling", label: "Scheduling" },
  { key: "attendance", label: "Attendance" },
  { key: "inventory", label: "Inventory" },
  { key: "riderGps", label: "Rider GPS" },
  { key: "reports", label: "Reports" },
  { key: "integrations", label: "Integrations" },
];
