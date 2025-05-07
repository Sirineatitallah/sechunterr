import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, forkJoin } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface CorrelationNode {
  id: string;
  name: string;
  type: 'threat' | 'vulnerability' | 'asset' | 'incident' | 'playbook';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  domain: 'cti' | 'vi' | 'asm' | 'soar';
  details?: any;
}

export interface CorrelationLink {
  source: string;
  target: string;
  type: 'affects' | 'exploits' | 'mitigates' | 'contains' | 'triggers' | 'related';
  strength: number; // 0-1
}

export interface CorrelationData {
  nodes: CorrelationNode[];
  links: CorrelationLink[];
}

export interface CorrelationQuery {
  domains?: string[];
  types?: string[];
  severities?: string[];
  nodeIds?: string[];
  depth?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CorrelationService {
  private correlationDataSubject = new BehaviorSubject<CorrelationData>({ nodes: [], links: [] });
  correlationData$ = this.correlationDataSubject.asObservable();
  
  constructor(private http: HttpClient) {}
  
  /**
   * Récupère les données de corrélation en fonction des critères spécifiés
   */
  getCorrelationData(query: CorrelationQuery = {}): Observable<CorrelationData> {
    // Dans une implémentation réelle, cela ferait un appel API
    // Pour le moment, nous utilisons des données simulées
    return this.getMockCorrelationData(query).pipe(
      tap(data => this.correlationDataSubject.next(data))
    );
  }
  
  /**
   * Récupère les relations pour un nœud spécifique
   */
  getNodeRelations(nodeId: string, depth: number = 1): Observable<CorrelationData> {
    return this.getCorrelationData({ nodeIds: [nodeId], depth });
  }
  
  /**
   * Récupère les données de corrélation pour plusieurs domaines
   */
  getMultiDomainCorrelation(domains: string[]): Observable<CorrelationData> {
    return this.getCorrelationData({ domains });
  }
  
  /**
   * Récupère les données de corrélation pour un chemin d'attaque
   */
  getAttackPath(sourceId: string, targetId: string): Observable<CorrelationData> {
    // Simulation d'un chemin d'attaque
    return this.getMockAttackPath(sourceId, targetId);
  }
  
  /**
   * Récupère les données de corrélation pour un incident
   */
  getIncidentCorrelation(incidentId: string): Observable<CorrelationData> {
    return this.getNodeRelations(incidentId, 2);
  }
  
  /**
   * Récupère les données de corrélation pour une vulnérabilité
   */
  getVulnerabilityCorrelation(vulnerabilityId: string): Observable<CorrelationData> {
    return this.getNodeRelations(vulnerabilityId, 2);
  }
  
  /**
   * Récupère les données de corrélation pour une menace
   */
  getThreatCorrelation(threatId: string): Observable<CorrelationData> {
    return this.getNodeRelations(threatId, 2);
  }
  
  /**
   * Récupère les données de corrélation pour un actif
   */
  getAssetCorrelation(assetId: string): Observable<CorrelationData> {
    return this.getNodeRelations(assetId, 2);
  }
  
  /**
   * Récupère les données de corrélation pour un playbook
   */
  getPlaybookCorrelation(playbookId: string): Observable<CorrelationData> {
    return this.getNodeRelations(playbookId, 2);
  }
  
  /**
   * Calcule un score de risque global basé sur les corrélations
   */
  calculateRiskScore(nodeId: string): Observable<number> {
    return this.getNodeRelations(nodeId, 2).pipe(
      map(data => {
        // Algorithme simplifié de calcul de score de risque
        let score = 0;
        
        // Compter les nœuds critiques et élevés
        const criticalNodes = data.nodes.filter(node => node.severity === 'critical').length;
        const highNodes = data.nodes.filter(node => node.severity === 'high').length;
        
        // Calculer le score en fonction du nombre de nœuds critiques et élevés
        score = (criticalNodes * 25 + highNodes * 15) / (data.nodes.length || 1);
        
        // Limiter le score à 100
        return Math.min(Math.round(score), 100);
      })
    );
  }
  
  /**
   * Génère des données de corrélation simulées
   */
  private getMockCorrelationData(query: CorrelationQuery): Observable<CorrelationData> {
    // Données de test pour le développement
    const mockData: CorrelationData = {
      nodes: [
        // Nœuds CTI
        { id: 'threat1', name: 'APT28', type: 'threat', severity: 'critical', domain: 'cti', details: { origin: 'Russie', threatType: 'APT', tactics: ['Initial Access', 'Execution', 'Persistence'] } },
        { id: 'threat2', name: 'Emotet', type: 'threat', severity: 'high', domain: 'cti', details: { origin: 'Unknown', threatType: 'Malware', tactics: ['Initial Access', 'Execution'] } },
        { id: 'threat3', name: 'Ransomware Conti', type: 'threat', severity: 'critical', domain: 'cti', details: { origin: 'Russie', threatType: 'Ransomware', tactics: ['Impact', 'Exfiltration'] } },
        
        // Nœuds VI
        { id: 'vuln1', name: 'CVE-2023-1234', type: 'vulnerability', severity: 'critical', domain: 'vi', details: { cve: 'CVE-2023-1234', cvss: 9.8, status: 'Non corrigée' } },
        { id: 'vuln2', name: 'CVE-2023-5678', type: 'vulnerability', severity: 'high', domain: 'vi', details: { cve: 'CVE-2023-5678', cvss: 8.5, status: 'En cours de correction' } },
        { id: 'vuln3', name: 'CVE-2023-9012', type: 'vulnerability', severity: 'medium', domain: 'vi', details: { cve: 'CVE-2023-9012', cvss: 6.5, status: 'Corrigée' } },
        
        // Nœuds ASM
        { id: 'asset1', name: 'Serveur Web', type: 'asset', severity: 'medium', domain: 'asm', details: { assetType: 'Server', exposure: 'External', criticality: 'High' } },
        { id: 'asset2', name: 'Base de données', type: 'asset', severity: 'high', domain: 'asm', details: { assetType: 'Database', exposure: 'Internal', criticality: 'Critical' } },
        { id: 'asset3', name: 'Firewall', type: 'asset', severity: 'low', domain: 'asm', details: { assetType: 'Network', exposure: 'External', criticality: 'High' } },
        { id: 'asset4', name: 'Poste de travail', type: 'asset', severity: 'medium', domain: 'asm', details: { assetType: 'Endpoint', exposure: 'Internal', criticality: 'Medium' } },
        
        // Nœuds SOAR
        { id: 'incident1', name: 'Incident-2023-001', type: 'incident', severity: 'critical', domain: 'soar', details: { status: 'En cours', date: '2023-10-15', assignee: 'John Doe' } },
        { id: 'incident2', name: 'Incident-2023-002', type: 'incident', severity: 'high', domain: 'soar', details: { status: 'Résolu', date: '2023-09-28', assignee: 'Jane Smith' } },
        { id: 'playbook1', name: 'Playbook-Ransomware', type: 'playbook', severity: 'medium', domain: 'soar', details: { status: 'Actif', steps: 12, automated: true } },
        { id: 'playbook2', name: 'Playbook-Phishing', type: 'playbook', severity: 'low', domain: 'soar', details: { status: 'Actif', steps: 8, automated: true } }
      ],
      links: [
        // Relations entre les nœuds
        { source: 'threat1', target: 'vuln1', type: 'exploits', strength: 0.9 },
        { source: 'vuln1', target: 'asset1', type: 'affects', strength: 0.8 },
        { source: 'asset1', target: 'incident1', type: 'contains', strength: 0.7 },
        { source: 'incident1', target: 'playbook1', type: 'triggers', strength: 0.9 },
        { source: 'playbook1', target: 'vuln1', type: 'mitigates', strength: 0.6 },
        { source: 'threat2', target: 'vuln2', type: 'exploits', strength: 0.7 },
        { source: 'vuln2', target: 'asset2', type: 'affects', strength: 0.8 },
        { source: 'asset1', target: 'asset2', type: 'related', strength: 0.5 },
        { source: 'threat3', target: 'asset4', type: 'affects', strength: 0.8 },
        { source: 'asset4', target: 'incident2', type: 'contains', strength: 0.7 },
        { source: 'incident2', target: 'playbook2', type: 'triggers', strength: 0.9 },
        { source: 'vuln3', target: 'asset3', type: 'affects', strength: 0.6 },
        { source: 'asset3', target: 'asset1', type: 'related', strength: 0.4 },
        { source: 'asset3', target: 'asset2', type: 'related', strength: 0.4 },
        { source: 'threat2', target: 'vuln3', type: 'exploits', strength: 0.5 }
      ]
    };
    
    // Appliquer les filtres de la requête
    let filteredData = { ...mockData };
    
    if (query.domains && query.domains.length > 0) {
      filteredData.nodes = filteredData.nodes.filter(node => 
        query.domains!.includes(node.domain)
      );
    }
    
    if (query.types && query.types.length > 0) {
      filteredData.nodes = filteredData.nodes.filter(node => 
        query.types!.includes(node.type)
      );
    }
    
    if (query.severities && query.severities.length > 0) {
      filteredData.nodes = filteredData.nodes.filter(node => 
        query.severities!.includes(node.severity)
      );
    }
    
    if (query.nodeIds && query.nodeIds.length > 0) {
      // Commencer par les nœuds spécifiés
      const initialNodes = filteredData.nodes.filter(node => 
        query.nodeIds!.includes(node.id)
      );
      
      // Si une profondeur est spécifiée, ajouter les nœuds connectés
      if (query.depth && query.depth > 0) {
        const connectedNodeIds = new Set<string>();
        initialNodes.forEach(node => connectedNodeIds.add(node.id));
        
        // Pour chaque niveau de profondeur
        for (let i = 0; i < query.depth; i++) {
          // Trouver tous les liens connectés aux nœuds actuels
          const connectedLinks = filteredData.links.filter(link => 
            connectedNodeIds.has(link.source as string) || 
            connectedNodeIds.has(link.target as string)
          );
          
          // Ajouter les nœuds connectés
          connectedLinks.forEach(link => {
            connectedNodeIds.add(link.source as string);
            connectedNodeIds.add(link.target as string);
          });
        }
        
        // Filtrer les nœuds pour ne garder que ceux qui sont connectés
        filteredData.nodes = filteredData.nodes.filter(node => 
          connectedNodeIds.has(node.id)
        );
      } else {
        filteredData.nodes = initialNodes;
      }
    }
    
    // Filtrer les liens pour ne garder que ceux dont les deux extrémités sont visibles
    const visibleNodeIds = new Set(filteredData.nodes.map(node => node.id));
    filteredData.links = filteredData.links.filter(link => 
      visibleNodeIds.has(link.source as string) && 
      visibleNodeIds.has(link.target as string)
    );
    
    return of(filteredData);
  }
  
  /**
   * Génère un chemin d'attaque simulé
   */
  private getMockAttackPath(sourceId: string, targetId: string): Observable<CorrelationData> {
    // Simuler un chemin d'attaque entre deux nœuds
    return this.getMockCorrelationData({}).pipe(
      map(data => {
        // Trouver un chemin entre sourceId et targetId
        // Ceci est une implémentation simplifiée
        const path = this.findPath(data, sourceId, targetId);
        return path;
      })
    );
  }
  
  /**
   * Trouve un chemin entre deux nœuds
   */
  private findPath(data: CorrelationData, sourceId: string, targetId: string): CorrelationData {
    // Implémentation simplifiée d'un algorithme de recherche de chemin
    // Dans une implémentation réelle, on utiliserait un algorithme plus sophistiqué
    
    const result: CorrelationData = { nodes: [], links: [] };
    const visited = new Set<string>();
    const queue: { id: string, path: string[] }[] = [{ id: sourceId, path: [sourceId] }];
    
    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      
      if (id === targetId) {
        // Chemin trouvé
        // Ajouter les nœuds du chemin
        for (let i = 0; i < path.length; i++) {
          const node = data.nodes.find(n => n.id === path[i]);
          if (node) {
            result.nodes.push(node);
          }
          
          // Ajouter les liens entre les nœuds du chemin
          if (i < path.length - 1) {
            const link = data.links.find(l => 
              (l.source === path[i] && l.target === path[i + 1]) ||
              (l.source === path[i + 1] && l.target === path[i])
            );
            if (link) {
              result.links.push(link);
            }
          }
        }
        
        return result;
      }
      
      if (visited.has(id)) {
        continue;
      }
      
      visited.add(id);
      
      // Trouver tous les nœuds connectés
      const links = data.links.filter(link => 
        link.source === id || link.target === id
      );
      
      for (const link of links) {
        const nextId = link.source === id ? link.target : link.source;
        if (!visited.has(nextId as string)) {
          queue.push({ id: nextId as string, path: [...path, nextId as string] });
        }
      }
    }
    
    // Aucun chemin trouvé
    return result;
  }
}
