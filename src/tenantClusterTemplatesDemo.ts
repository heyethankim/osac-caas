import { RedhatIcon } from '@patternfly/react-icons/dist/esm/icons/redhat-icon'

export type ClusterPlatform = 'OpenShift' | 'Kubernetes'

export type ClusterUseCaseKey = 'production' | 'ai-ml' | 'edge' | 'high-performance'

export type ClusterUseCaseFilterTag =
  | 'production'
  | 'ai-ml'
  | 'edge'
  | 'high-performance'
  | 'analytics'

export type TenantClusterTemplate = {
  id: string
  title: string
  subtitle: string
  project: string
  platform: ClusterPlatform
  platformVersion: string
  useCase: ClusterUseCaseKey
  useCaseFilterTags: ClusterUseCaseFilterTag[]
  controlPlane: string
  workers: string
  storage: string
  cardRegionDisplay?: string
  cardNetworkDisplay?: string
  cardUseCaseDisplay?: string
}

export const CLUSTER_TEMPLATE_DETAIL_DEFAULTS = {
  storage: 'Default storage class',
  network: 'Private SDN overlay',
} as const

export const CLUSTER_USE_CASE_LABEL: Record<ClusterUseCaseKey, string> = {
  production: 'Production',
  'ai-ml': 'AI / ML',
  edge: 'Edge',
  'high-performance': 'High performance',
}

export const CARD_CLUSTER_USE_CASE_DISPLAY_LABELS = [
  'Production',
  'AI / ML',
  'Edge',
  'High performance',
  'Analytics',
] as const

export const CARD_CLUSTER_REGION_DISPLAY_LABELS = [
  'UK, London',
  'UK, Manchester',
  'EU-West edge zone',
  'Dedicated enclave',
] as const

export const CARD_CLUSTER_NETWORK_DISPLAY_LABELS = [
  'Private SDN overlay',
  'Shared service network',
  'DMZ segment',
  'GPU fabric network',
] as const

const TENANT_CLUSTER_TEMPLATES_SOURCE: TenantClusterTemplate[] = [
  {
    id: 'ocp-analytics-production',
    title: 'OpenShift analytics production',
    subtitle: 'Multi-AZ OpenShift for regulated analytics and batch scoring workloads',
    project: 'tenant-prod',
    platform: 'OpenShift',
    platformVersion: '4.16.8',
    useCase: 'production',
    useCaseFilterTags: ['production', 'analytics'],
    controlPlane: '3 nodes',
    workers: '6 nodes',
    storage: '120 TiB',
  },
  {
    id: 'ocp-gpu-serving',
    title: 'OpenShift GPU serving cluster',
    subtitle: 'NVLink-ready node pools for model serving and low-latency inference',
    project: 'model-serving',
    platform: 'OpenShift',
    platformVersion: '4.16.8',
    useCase: 'ai-ml',
    useCaseFilterTags: ['ai-ml', 'high-performance'],
    controlPlane: '3 nodes',
    workers: '4 nodes',
    storage: '80 TiB',
  },
  {
    id: 'ocp-edge-standard',
    title: 'OpenShift edge cluster',
    subtitle: 'Compact footprint for edge-aligned tenant production services',
    project: 'tenant-prod',
    platform: 'OpenShift',
    platformVersion: '4.15.27',
    useCase: 'edge',
    useCaseFilterTags: ['edge', 'production'],
    controlPlane: '3 nodes',
    workers: '5 nodes',
    storage: '48 TiB',
  },
  {
    id: 'ocp-hpc-research',
    title: 'OpenShift HPC research cluster',
    subtitle: 'High-core worker pools for research batch and simulation jobs',
    project: 'research-hpc',
    platform: 'OpenShift',
    platformVersion: '4.16.8',
    useCase: 'high-performance',
    useCaseFilterTags: ['high-performance', 'analytics'],
    controlPlane: '3 nodes',
    workers: '8 nodes',
    storage: '200 TiB',
  },
  {
    id: 'ocp-compliance-standard',
    title: 'OpenShift compliance cluster',
    subtitle: 'Hardened baseline for compliance-sensitive batch and audit workloads',
    project: 'compliance',
    platform: 'OpenShift',
    platformVersion: '4.15.27',
    useCase: 'production',
    useCaseFilterTags: ['production'],
    controlPlane: '3 nodes',
    workers: '4 nodes',
    storage: '64 TiB',
  },
  {
    id: 'k8s-dev-lightweight',
    title: 'Kubernetes dev cluster',
    subtitle: 'Lightweight upstream Kubernetes for sandbox and archive environments',
    project: 'archive',
    platform: 'Kubernetes',
    platformVersion: '1.29.4',
    useCase: 'edge',
    useCaseFilterTags: ['edge'],
    controlPlane: '3 nodes',
    workers: '2 nodes',
    storage: '16 TiB',
  },
]

function shuffleTemplates(templates: TenantClusterTemplate[]): TenantClusterTemplate[] {
  const out = [...templates]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function assignRandomCardLabels(templates: TenantClusterTemplate[]): TenantClusterTemplate[] {
  const useCases = CARD_CLUSTER_USE_CASE_DISPLAY_LABELS
  const regions = CARD_CLUSTER_REGION_DISPLAY_LABELS
  const networks = CARD_CLUSTER_NETWORK_DISPLAY_LABELS
  return templates.map((template) => ({
    ...template,
    cardUseCaseDisplay: useCases[Math.floor(Math.random() * useCases.length)],
    cardRegionDisplay: regions[Math.floor(Math.random() * regions.length)],
    cardNetworkDisplay: networks[Math.floor(Math.random() * networks.length)],
  }))
}

const TENANT_CLUSTER_TEMPLATES = assignRandomCardLabels(
  shuffleTemplates(TENANT_CLUSTER_TEMPLATES_SOURCE),
)

export function getTenantClusterTemplateById(id: string): TenantClusterTemplate | undefined {
  return TENANT_CLUSTER_TEMPLATES.find((template) => template.id === id)
}

export function listOrderedClusterCatalogTemplates(): TenantClusterTemplate[] {
  return TENANT_CLUSTER_TEMPLATES
}

export const CLUSTER_TEMPLATE_ICON = RedhatIcon

export const CLUSTER_TEMPLATE_ICON_TILE_BG =
  'var(--pf-t--global--background--color--secondary--default)'

export function clusterTemplateIconColor(platform: ClusterPlatform): string {
  return platform === 'OpenShift'
    ? '#ee0000'
    : 'var(--pf-t--global--icon--color--brand--default)'
}
