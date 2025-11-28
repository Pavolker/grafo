import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  type: 'concept' | 'person' | 'place' | 'event' | 'other';
  description: string;
  importance: number; // 1-10
  group?: string; // For communities
  order?: number; // For timeline/hierarchy
}

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  relation: string;
  strength: number; // 1-10
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export enum DetailLevel {
  LOW = 'Baixo',
  MEDIUM = 'Médio',
  HIGH = 'Alto',
}

export enum GraphType {
  DEFAULT = 'Normal',
  TREE = 'Árvore',
  TIMELINE = 'Linha do Tempo',
  HIERARCHICAL = 'Hierárquico',
  COMMUNITY = 'Comunidades'
}

export interface AppState {
  inputText: string;
  graphData: GraphData | null;
  isLoading: boolean;
  detailLevel: DetailLevel;
  graphType: GraphType;
  error: string | null;
}