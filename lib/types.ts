export interface TeamMember {
  name?: string;
  position?: string;
  email?: string;
  linkedin?: string;
}

export interface CompanyProfile {
  name?: string;
  description?: string;
  location?: string;
  industry?: string;
  foundingYear?: number;
  emails: string[];
  phones: string[];
  services: string[];
  team: TeamMember[];
  history?: string;
  socialLinks: Record<string, string>;
  completionScore: number;
  loginProtected?: boolean;
  logoSourceUrl?: string;
  companyNameFromLogo?: string;
  sloganFromLogo?: string;
  logoNameConfidence?: number;
}

export interface PersonalizedContent {
  emailSubject?: string;
  openingLine?: string;
  valueProposition?: string;
  fullMessage?: string;
  status?: string;
}

export interface Company {
  id: string;
  domain: string;
  name?: string;
  crawlStatus: 'PENDING' | 'CRAWLING' | 'COMPLETED' | 'FAILED' | 'BLOCKED';
  crawlNote?: string;
  lastCrawledAt?: string;
  profile?: CompanyProfile;
  personalizedContents?: PersonalizedContent[];
}

export interface SearchQuery {
  persona: string;
  location: string;
  keywords?: string;
  maxResults?: number;
  _errorNote?: string;
}

export interface Batch {
  id: string;
  fileName?: string;
  sourceType?: 'UPLOAD' | 'PERSONA_SEARCH';
  searchQuery?: SearchQuery;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalCompanies: number;
  processedCompanies: number;
  completionPercentage: number;
  createdAt: string;
}

export interface PersonaSearchResult {
  batchId: string;
  message: string;
}

export interface PaginatedCompanies {
  data: Company[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UploadResult {
  batchId: string;
  totalCompanies: number;
  jobsEnqueued: number;
  skipped: number;
  invalidRows?: number;
}

export type CandidateStatus = 'KEPT' | 'FILTERED' | 'BLOCKED' | 'EXCLUDED';

export interface DiscoveryCandidate {
  id: string;
  batchId: string;
  domain: string;
  url: string;
  title?: string;
  snippet?: string;
  status: CandidateStatus;
  createdAt: string;
}

export interface TenantProfile {
  name: string;
  website: string | null;
  contactPersonName: string | null;
  contactPersonTitle: string | null;
  contactPersonEmail: string | null;
  contactPersonPhone: string | null;
}

export interface EmailTemplate {
  id: string;
  tenantId: string;
  name: string;
  subject: string;
  body: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  token: string;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    tenantId: string;
    role?: string;
  };
  /** Only present in development (NODE_ENV !== 'production' and EMAIL_HOST unset). Never in production. */
  devVerificationUrl?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  monthlyDomainLimit: number | null;
  createdAt: string;
  tenantId: string;
  domainsUsedThisMonth: number;
}

export interface AuditLogEntry {
  id: string;
  createdAt: string;
  action: string;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  adminUser: { id: string; email: string };
  targetUser: { id: string; email: string };
}

export interface PaginatedAuditLog {
  data: AuditLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
