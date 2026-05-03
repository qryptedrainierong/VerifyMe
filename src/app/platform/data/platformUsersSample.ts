export type PortalUserRole =
  | "Super Admin"
  | "Admin"
  | "Operations Manager"
  | "Support / Customer Success"
  | "Finance / Billing Admin"
  | "Security / Compliance Admin";
export type PortalUserStatus = "active" | "invited" | "suspended";

export type PlatformPortalUser = {
  id: string;
  name: string;
  email: string;
  role: PortalUserRole;
  status: PortalUserStatus;
  organizationScope: "All Organizations";
  created: string;
  lastLogin: string | null;
};

export type PlatformEndUserAssociation = {
  id: string;
  verifymeUsername: string;
  email: string;
  enterpriseUsername: string;
  organization: string;
  organizationId: string;
  status: "active" | "pending" | "suspended";
  apiCalls: number;
  lastActive: string | null;
  created: string;
};

export const platformPortalUsers: PlatformPortalUser[] = [
  {
    id: "PLT-001",
    name: "Rainier Ong",
    email: "rainier@verifyme.com",
    role: "Super Admin",
    status: "active",
    organizationScope: "All Organizations",
    created: "2023-09-12",
    lastLogin: "2024-04-09T11:10:00",
  },
  {
    id: "PLT-002",
    name: "Alyssa Chua",
    email: "alyssa@verifyme.com",
    role: "Admin",
    status: "active",
    organizationScope: "All Organizations",
    created: "2023-11-03",
    lastLogin: "2024-04-09T09:55:00",
  },
  {
    id: "PLT-003",
    name: "Miguel Santos",
    email: "miguel@verifyme.com",
    role: "Operations Manager",
    status: "active",
    organizationScope: "All Organizations",
    created: "2024-01-08",
    lastLogin: "2024-04-09T08:42:00",
  },
  {
    id: "PLT-004",
    name: "Nicole Tan",
    email: "nicole@verifyme.com",
    role: "Support / Customer Success",
    status: "invited",
    organizationScope: "All Organizations",
    created: "2024-04-02",
    lastLogin: null,
  },
  {
    id: "PLT-005",
    name: "Paolo Reyes",
    email: "paolo@verifyme.com",
    role: "Finance / Billing Admin",
    status: "suspended",
    organizationScope: "All Organizations",
    created: "2024-02-11",
    lastLogin: "2024-03-30T15:20:00",
  },
  {
    id: "PLT-006",
    name: "Camille Dizon",
    email: "camille@verifyme.com",
    role: "Security / Compliance Admin",
    status: "active",
    organizationScope: "All Organizations",
    created: "2024-01-19",
    lastLogin: "2024-04-09T07:50:00",
  },
];

export const platformEndUserAssociations: PlatformEndUserAssociation[] = [
  {
    id: "USR-00145",
    verifymeUsername: "john.smith",
    email: "john.smith@gmail.com",
    enterpriseUsername: "jsmith",
    organization: "Acme Corporation",
    organizationId: "ORG-001",
    status: "active",
    apiCalls: 2450,
    lastActive: "2024-04-09T10:30:00",
    created: "2024-01-15",
  },
  {
    id: "USR-00145-2",
    verifymeUsername: "john.smith",
    email: "john.smith@gmail.com",
    enterpriseUsername: "john.s",
    organization: "Design Studio Pro",
    organizationId: "ORG-005",
    status: "active",
    apiCalls: 980,
    lastActive: "2024-04-08T11:20:00",
    created: "2024-02-19",
  },
  {
    id: "USR-00238",
    verifymeUsername: "sarah.johnson",
    email: "sarah.johnson@outlook.com",
    enterpriseUsername: "sjohnson",
    organization: "TechStart Inc.",
    organizationId: "ORG-002",
    status: "active",
    apiCalls: 1823,
    lastActive: "2024-04-09T09:15:00",
    created: "2024-02-03",
  },
  {
    id: "USR-00421",
    verifymeUsername: "michael.chen",
    email: "michael.chen88@gmail.com",
    enterpriseUsername: "mchen",
    organization: "Global Ventures",
    organizationId: "ORG-003",
    status: "active",
    apiCalls: 3912,
    lastActive: "2024-04-09T10:15:00",
    created: "2023-12-08",
  },
  {
    id: "USR-00421-2",
    verifymeUsername: "michael.chen",
    email: "michael.chen88@gmail.com",
    enterpriseUsername: "michael.chen",
    organization: "CloudScale Systems",
    organizationId: "ORG-007",
    status: "active",
    apiCalls: 1245,
    lastActive: "2024-04-09T11:00:00",
    created: "2024-02-10",
  },
  {
    id: "USR-00892",
    verifymeUsername: "emily.davis",
    email: "emily.davis@yahoo.com",
    enterpriseUsername: "",
    organization: "Innovation Labs",
    organizationId: "ORG-004",
    status: "pending",
    apiCalls: 0,
    lastActive: null,
    created: "2024-03-22",
  },
  {
    id: "USR-00893",
    verifymeUsername: "robert.martinez",
    email: "robert.martinez@outlook.com",
    enterpriseUsername: "",
    organization: "TechStart Inc.",
    organizationId: "ORG-002",
    status: "pending",
    apiCalls: 0,
    lastActive: null,
    created: "2024-04-01",
  },
  {
    id: "USR-01204",
    verifymeUsername: "james.wilson",
    email: "jameswilson@icloud.com",
    enterpriseUsername: "jwilson",
    organization: "Design Studio Pro",
    organizationId: "ORG-005",
    status: "active",
    apiCalls: 5234,
    lastActive: "2024-04-08T16:45:00",
    created: "2024-01-28",
  },
  {
    id: "USR-01567",
    verifymeUsername: "lisa.anderson",
    email: "lisa.anderson@gmail.com",
    enterpriseUsername: "landerson",
    organization: "Finance Corp",
    organizationId: "ORG-006",
    status: "active",
    apiCalls: 1567,
    lastActive: "2024-04-09T08:20:00",
    created: "2023-11-12",
  },
  {
    id: "USR-01892",
    verifymeUsername: "david.brown",
    email: "davidbrown@hotmail.com",
    enterpriseUsername: "dbrown",
    organization: "CloudScale Systems",
    organizationId: "ORG-007",
    status: "suspended",
    apiCalls: 892,
    lastActive: "2024-03-15T14:30:00",
    created: "2024-02-14",
  },
  {
    id: "USR-02134",
    verifymeUsername: "ana.rodriguez",
    email: "ana.rodriguez@gmail.com",
    enterpriseUsername: "arodriguez",
    organization: "DataFlow Analytics",
    organizationId: "ORG-008",
    status: "active",
    apiCalls: 2981,
    lastActive: "2024-04-09T07:50:00",
    created: "2024-03-05",
  },
];
