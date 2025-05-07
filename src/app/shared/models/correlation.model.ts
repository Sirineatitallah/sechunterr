/**
 * Correlation models for integrating data across CTI, VI, ASM, and SOAR domains
 */

// Base interface for all correlated items
export interface CorrelatedItem {
  id: string;
  name: string;
  description: string;
  source: SecurityDomain;
  severity: SeverityLevel;
  timestamp: Date;
  relatedItems?: CorrelatedItem[];
}

// Security domains in the VOC
export enum SecurityDomain {
  CTI = 'cti',
  VI = 'vi',
  ASM = 'asm',
  SOAR = 'soar'
}

// Severity levels
export enum SeverityLevel {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

// Correlation types
export enum CorrelationType {
  DIRECT = 'direct',           // Direct relationship between items
  INDIRECT = 'indirect',       // Indirect relationship
  POTENTIAL = 'potential',     // Potential relationship that needs verification
  HISTORICAL = 'historical'    // Historical relationship
}

// Relationship between correlated items
export interface ItemRelationship {
  sourceId: string;
  targetId: string;
  type: CorrelationType;
  confidence: number;          // 0-100 confidence score
  description: string;
}

// CTI specific item
export interface CTIItem extends CorrelatedItem {
  threatType: string;
  threatActors?: string[];
  iocs?: IndicatorOfCompromise[];
  ttps?: string[];             // Tactics, Techniques, and Procedures
  mitreReferences?: string[];
}

// Indicator of Compromise
export interface IndicatorOfCompromise {
  type: IOCType;
  value: string;
  confidence: number;
}

export enum IOCType {
  IP = 'ip',
  DOMAIN = 'domain',
  URL = 'url',
  FILE_HASH = 'file_hash',
  EMAIL = 'email'
}

// VI specific item
export interface VIItem extends CorrelatedItem {
  cveId?: string;
  cvssScore?: number;
  affectedAssets: string[];
  patchAvailable: boolean;
  exploitAvailable: boolean;
}

// ASM specific item
export interface ASMItem extends CorrelatedItem {
  assetType: AssetType;
  exposureLevel: number;       // 0-100 exposure score
  discoveryMethod: string;
  isExternal: boolean;         // EASM vs IASM
}

export enum AssetType {
  SERVER = 'server',
  ENDPOINT = 'endpoint',
  NETWORK_DEVICE = 'network_device',
  CLOUD_RESOURCE = 'cloud_resource',
  APPLICATION = 'application',
  DATABASE = 'database'
}

// SOAR specific item
export interface SOARItem extends CorrelatedItem {
  incidentId?: string;
  status: IncidentStatus;
  playbooks: string[];
  assignedTo?: string;
  resolutionTime?: number;     // Time to resolve in minutes
}

export enum IncidentStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  PENDING = 'pending',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

// Correlation result
export interface CorrelationResult {
  items: CorrelatedItem[];
  relationships: ItemRelationship[];
  riskScore: number;           // 0-100 risk score
  confidence: number;          // 0-100 confidence score
  generatedAt: Date;
}

// Correlation filter options
export interface CorrelationFilter {
  domains: SecurityDomain[];
  severities: SeverityLevel[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
  minConfidence?: number;
}
