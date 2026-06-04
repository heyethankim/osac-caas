import type { DemoTenantId } from './demoTenant'
import { DEMO_TENANT_DISPLAY_USER } from './demoTenant'
import { getTenantClusterTemplateById } from './tenantClusterTemplatesDemo'
import type { VmRecentActivityItem, VmRecentActivitySeverity } from './dashboardVmRecentActivities'
import { type VmUtilizationPeriod, type VmUtilizationRow } from './dashboardVmUtilizationDemo'

export type ClusterStatus = 'running' | 'provisioning' | 'degraded' | 'stopped'

export type DemoClusterPowerCounts = Record<ClusterStatus, number>

export type TenantCluster = {
  id: string
  name: string
  description: string
  project: string
  status: ClusterStatus
  platform: 'OpenShift' | 'Kubernetes'
  version: string
  created: string
  createdAtMs: number
  owner: string
  controlPlane: string
  workers: string
  totalNodes: string
  region: string
}

type TenantClusterSeed = Omit<TenantCluster, 'owner'>

const NORTHSTAR_CLUSTER_FLEET: TenantClusterSeed[] = [
  {
    id: 'cluster-risk-analytics-ocp',
    name: 'risk-analytics-ocp',
    description: 'Production OpenShift cluster for risk analytics workloads',
    project: 'tenant-prod',
    status: 'running',
    platform: 'OpenShift',
    version: '4.16.8',
    created: 'Nov 12, 2025',
    createdAtMs: Date.UTC(2025, 10, 12),
    controlPlane: '3 nodes',
    workers: '6 nodes',
    totalNodes: '9 nodes',
    region: 'UK, London',
  },
  {
    id: 'cluster-model-serving-gpu',
    name: 'model-serving-gpu',
    description: 'GPU-enabled cluster for model serving and inference',
    project: 'model-serving',
    status: 'running',
    platform: 'OpenShift',
    version: '4.16.8',
    created: 'Jan 8, 2026',
    createdAtMs: Date.UTC(2026, 0, 8),
    controlPlane: '3 nodes',
    workers: '4 nodes',
    totalNodes: '7 nodes',
    region: 'UK, London',
  },
  {
    id: 'cluster-tenant-prod-edge',
    name: 'tenant-prod-edge',
    description: 'Edge-aligned cluster for tenant production services',
    project: 'tenant-prod',
    status: 'running',
    platform: 'OpenShift',
    version: '4.15.27',
    created: 'Sep 3, 2025',
    createdAtMs: Date.UTC(2025, 8, 3),
    controlPlane: '3 nodes',
    workers: '5 nodes',
    totalNodes: '8 nodes',
    region: 'UK, London',
  },
  {
    id: 'cluster-shared-services',
    name: 'shared-services-ocp',
    description: 'Shared platform services cluster (provisioning)',
    project: 'shared-services',
    status: 'provisioning',
    platform: 'OpenShift',
    version: '4.16.8',
    created: 'Apr 2, 2026',
    createdAtMs: Date.UTC(2026, 3, 2),
    controlPlane: '3 nodes',
    workers: '3 nodes',
    totalNodes: '6 nodes',
    region: 'UK, London',
  },
  {
    id: 'cluster-legacy-batch',
    name: 'legacy-batch',
    description: 'Stopped batch cluster retained for configuration reference',
    project: 'archive',
    status: 'stopped',
    platform: 'OpenShift',
    version: '4.14.16',
    created: 'Jun 18, 2024',
    createdAtMs: Date.UTC(2024, 5, 18),
    controlPlane: '3 nodes',
    workers: '2 nodes',
    totalNodes: '5 nodes',
    region: 'UK, London',
  },
]

const EVERGREEN_CLUSTER_FLEET: TenantClusterSeed[] = [
  {
    id: 'cluster-compliance-batch',
    name: 'compliance-batch',
    description: 'Compliance workloads with scheduled upgrade window',
    project: 'compliance',
    status: 'degraded',
    platform: 'OpenShift',
    version: '4.15.27',
    created: 'Aug 21, 2025',
    createdAtMs: Date.UTC(2025, 7, 21),
    controlPlane: '3 nodes',
    workers: '4 nodes',
    totalNodes: '7 nodes',
    region: 'UK, London',
  },
  {
    id: 'cluster-research-hpc',
    name: 'research-hpc',
    description: 'HPC-oriented cluster for research batch jobs',
    project: 'research-hpc',
    status: 'running',
    platform: 'OpenShift',
    version: '4.16.8',
    created: 'Oct 2, 2025',
    createdAtMs: Date.UTC(2025, 9, 2),
    controlPlane: '3 nodes',
    workers: '8 nodes',
    totalNodes: '11 nodes',
    region: 'UK, London',
  },
  {
    id: 'cluster-model-train-gpu',
    name: 'model-train-gpu',
    description: 'GPU cluster for model training pipelines',
    project: 'model-serving',
    status: 'running',
    platform: 'OpenShift',
    version: '4.16.8',
    created: 'Feb 14, 2026',
    createdAtMs: Date.UTC(2026, 1, 14),
    controlPlane: '3 nodes',
    workers: '6 nodes',
    totalNodes: '9 nodes',
    region: 'UK, London',
  },
  {
    id: 'cluster-archive-dev',
    name: 'archive-dev',
    description: 'Decommissioned development cluster (stopped)',
    project: 'archive',
    status: 'stopped',
    platform: 'Kubernetes',
    version: '1.29.4',
    created: 'May 9, 2024',
    createdAtMs: Date.UTC(2024, 4, 9),
    controlPlane: '3 nodes',
    workers: '2 nodes',
    totalNodes: '5 nodes',
    region: 'UK, London',
  },
]

const TENANT_CLUSTER_FLEET: Record<
  Extract<DemoTenantId, 'northstar' | 'evergreen'>,
  TenantClusterSeed[]
> = {
  northstar: NORTHSTAR_CLUSTER_FLEET,
  evergreen: EVERGREEN_CLUSTER_FLEET,
}

function withOwner(
  seeds: TenantClusterSeed[],
  tenantId: Extract<DemoTenantId, 'northstar' | 'evergreen'>,
): TenantCluster[] {
  const owner = DEMO_TENANT_DISPLAY_USER[tenantId]
  return seeds.map((seed) => ({ ...seed, owner }))
}

export function buildTenantClustersForTenant(
  tenantId: Extract<DemoTenantId, 'northstar' | 'evergreen'>,
): TenantCluster[] {
  return withOwner(TENANT_CLUSTER_FLEET[tenantId], tenantId)
}

export type ClusterEnvironment = 'production' | 'staging' | 'development'
export type ClusterTypeOption = 'standard' | 'high-availability' | 'gpu-optimized'
export type ClusterNetworkingMode = 'vpc' | 'public-network' | 'hybrid'
export type ClusterLoadBalancerType = 'application' | 'network' | 'internal'

export type ProvisionClusterFromModalPayload = {
  templateId: string
  clusterName: string
  description: string
  environment: ClusterEnvironment
  openshiftVersion: string
  clusterType: ClusterTypeOption
  nodePoolName: string
  instanceType: string
  minNodes: number
  maxNodes: number
  networkingMode: ClusterNetworkingMode
  loadBalancerType: ClusterLoadBalancerType
  enableRbac: boolean
  enableEncryptionAtRest: boolean
  complianceSoc2: boolean
  complianceHipaa: boolean
  compliancePciDss: boolean
  complianceIso27001: boolean
  addonMonitoring: boolean
  addonLogging: boolean
  addonBackups: boolean
}

const CLUSTER_TYPE_LABEL: Record<ClusterTypeOption, string> = {
  standard: 'Standard',
  'high-availability': 'High availability',
  'gpu-optimized': 'GPU Optimized',
}

const ENVIRONMENT_LABEL: Record<ClusterEnvironment, string> = {
  production: 'Production',
  staging: 'Staging',
  development: 'Development',
}

export function clusterTypeLabel(type: ClusterTypeOption): string {
  return CLUSTER_TYPE_LABEL[type]
}

export function clusterEnvironmentLabel(env: ClusterEnvironment): string {
  return ENVIRONMENT_LABEL[env]
}

/** Demo: build a fleet row after completing the create cluster modal wizard. */
export function buildTenantClusterFromModalPayload(
  payload: ProvisionClusterFromModalPayload,
  tenantId: Extract<DemoTenantId, 'northstar' | 'evergreen'>,
): TenantCluster {
  const template = getTenantClusterTemplateById(payload.templateId)
  const name = payload.clusterName.trim() || `${payload.templateId}-cluster`
  const description =
    payload.description.trim() ||
    template?.subtitle ||
    'Provisioned from the create cluster wizard.'
  const platform = template?.platform ?? 'OpenShift'
  const version = payload.openshiftVersion.trim() || template?.platformVersion || '4.16.8'
  const workers = `${payload.maxNodes} nodes (pool: ${payload.nodePoolName.trim() || 'default'})`
  const controlPlane = template?.controlPlane ?? '3 nodes'
  const totalNodes = `${payload.maxNodes + 3} nodes`
  return {
    id: `cluster-from-${payload.templateId}-${Date.now()}`,
    name,
    description,
    project: template?.project ?? 'tenant-prod',
    status: 'provisioning',
    platform,
    version,
    created: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    createdAtMs: Date.now(),
    owner: DEMO_TENANT_DISPLAY_USER[tenantId],
    controlPlane,
    workers,
    totalNodes,
    region: template?.cardRegionDisplay ?? 'UK, London',
  }
}

function countClustersByStatus(clusters: readonly TenantCluster[]): DemoClusterPowerCounts {
  return clusters.reduce(
    (acc, cluster) => {
      acc[cluster.status] += 1
      return acc
    },
    { running: 0, provisioning: 0, degraded: 0, stopped: 0 },
  )
}

/** Derived from the tenant cluster fleet — kept for legacy dashboard references. */
export const DEMO_CLUSTER_POWER_COUNTS: Record<DemoTenantId, DemoClusterPowerCounts> = {
  northstar: countClustersByStatus(buildTenantClustersForTenant('northstar')),
  evergreen: countClustersByStatus(buildTenantClustersForTenant('evergreen')),
  vertexa: { running: 0, provisioning: 0, degraded: 0, stopped: 0 },
}

export function demoClusterPowerTotal(tenantId: DemoTenantId): number {
  const c = DEMO_CLUSTER_POWER_COUNTS[tenantId]
  return c.running + c.provisioning + c.degraded + c.stopped
}

export function buildDashboardClusterStatusStats(
  tenantId: Extract<DemoTenantId, 'northstar' | 'evergreen'>,
  extraClusters: readonly TenantCluster[] = [],
) {
  const fleet = [...extraClusters, ...buildTenantClustersForTenant(tenantId)]
  const c = countClustersByStatus(fleet)
  const total = fleet.length
  return [
    {
      key: 'all-clusters',
      label: 'All clusters',
      value: total,
      caption: 'Total clusters across your projects',
      statusFilter: null as ClusterStatus | null,
    },
    {
      key: 'running',
      label: 'Running',
      value: c.running,
      valueColor: 'var(--pf-t--global--color--status--success--default)',
      caption: 'Healthy and accepting workloads',
      statusFilter: 'running' as const,
    },
    {
      key: 'provisioning',
      label: 'Provisioning',
      value: c.provisioning,
      valueColor: 'var(--pf-t--global--color--status--info--default)',
      caption: 'Control plane or nodes still coming online',
      statusFilter: 'provisioning' as const,
    },
    {
      key: 'degraded',
      label: 'Needs attention',
      value: c.degraded,
      valueColor: 'var(--pf-t--global--color--status--warning--default)',
      caption: 'Degraded health or partial node failure',
      statusFilter: 'degraded' as const,
    },
    {
      key: 'stopped',
      label: 'Stopped',
      value: c.stopped,
      valueColor: 'var(--pf-t--global--color--status--danger--default)',
      caption: 'Powered down; configuration retained',
      statusFilter: 'stopped' as const,
    },
  ] as const
}

const CLUSTER_ACTIVITY_BY_TENANT: Record<
  DemoTenantId,
  {
    id: string
    timeLabel: string
    title: string
    detail: string
    severity: VmRecentActivitySeverity
    clusterName: string
    project: string
  }[]
> = {
  northstar: [
    {
      id: 'c1',
      timeLabel: '2 hours ago',
      title: 'Cluster scaled',
      detail: 'risk-analytics-ocp scaled to 6 worker nodes',
      severity: 'success',
      clusterName: 'risk-analytics-ocp',
      project: 'tenant-prod',
    },
    {
      id: 'c2',
      timeLabel: 'Yesterday',
      title: 'Cluster provisioning completed',
      detail: 'model-serving-gpu — OpenShift 4.16 is ready',
      severity: 'success',
      clusterName: 'model-serving-gpu',
      project: 'model-serving',
    },
    {
      id: 'c3',
      timeLabel: '2 days ago',
      title: 'Configuration backup succeeded',
      detail: 'tenant-prod-edge backup completed on schedule',
      severity: 'success',
      clusterName: 'tenant-prod-edge',
      project: 'tenant-prod',
    },
    {
      id: 'c4',
      timeLabel: '3 days ago',
      title: 'Node pool updated',
      detail: 'tenant-prod-edge worker pool patched to latest RHCOS',
      severity: 'warning',
      clusterName: 'tenant-prod-edge',
      project: 'tenant-prod',
    },
    {
      id: 'c5',
      timeLabel: '5 days ago',
      title: 'Cluster health check',
      detail: 'All control plane members reported healthy',
      severity: 'success',
      clusterName: 'risk-analytics-ocp',
      project: 'tenant-prod',
    },
    {
      id: 'c6',
      timeLabel: '1 week ago',
      title: 'Cluster created',
      detail: 'model-serving-gpu provisioned from NVLink cluster template',
      severity: 'success',
      clusterName: 'model-serving-gpu',
      project: 'model-serving',
    },
  ],
  evergreen: [
    {
      id: 'c1',
      timeLabel: '4 hours ago',
      title: 'Upgrade scheduled',
      detail: 'compliance-batch cluster upgrade queued for maintenance window',
      severity: 'warning',
      clusterName: 'compliance-batch',
      project: 'compliance',
    },
    {
      id: 'c2',
      timeLabel: 'Yesterday',
      title: 'Node pool expansion',
      detail: 'research-hpc worker pool expansion in progress',
      severity: 'warning',
      clusterName: 'research-hpc',
      project: 'research-hpc',
    },
    {
      id: 'c3',
      timeLabel: '2 days ago',
      title: 'Cluster health degraded',
      detail: 'compliance-batch reported partial node failure',
      severity: 'danger',
      clusterName: 'compliance-batch',
      project: 'compliance',
    },
    {
      id: 'c4',
      timeLabel: '4 days ago',
      title: 'Cluster backup completed',
      detail: 'etcd snapshot saved for research-hpc',
      severity: 'success',
      clusterName: 'research-hpc',
      project: 'research-hpc',
    },
    {
      id: 'c5',
      timeLabel: '6 days ago',
      title: 'Cluster created',
      detail: 'compliance-batch provisioned from standard OpenShift template',
      severity: 'success',
      clusterName: 'compliance-batch',
      project: 'compliance',
    },
    {
      id: 'c6',
      timeLabel: '1 week ago',
      title: 'Quota allocation updated',
      detail: 'GPU node pool limits raised for research-hpc',
      severity: 'success',
      clusterName: 'research-hpc',
      project: 'research-hpc',
    },
  ],
  vertexa: [],
}

function clusterSeed(tenantId: DemoTenantId): number {
  const fleet =
    tenantId === 'northstar' || tenantId === 'evergreen'
      ? buildTenantClustersForTenant(tenantId)
      : []
  return fleet.reduce((sum, cluster, index) => sum + cluster.name.length * (index + 3), tenantId.length * 3)
}

function clusterUtilAt(i: number, n: number, base: number, swing: number, phase = 0): number {
  const t = n <= 1 ? 0 : i / (n - 1)
  const u =
    base +
    swing *
      (Math.sin(t * Math.PI * 2 + phase) * 0.55 + Math.sin(t * Math.PI * 4 + phase * 0.7) * 0.2)
  return Math.round(Math.min(97, Math.max(4, u)) * 10) / 10
}

function clusterLabelsForPeriod(period: VmUtilizationPeriod, n: number): string[] {
  if (period === '24h') {
    return Array.from({ length: n }, (_, i) => `${i}h`)
  }
  if (period === '7d') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return Array.from({ length: n }, (_, i) => days[i % 7])
  }
  return Array.from({ length: n }, (_, i) => `${i + 1}`)
}

/** Demo cluster utilization time series shaped like the VM dashboard charts. */
export function buildClusterUtilizationDemoData(
  period: VmUtilizationPeriod,
  tenantId: DemoTenantId,
): VmUtilizationRow[] {
  const meta: Record<VmUtilizationPeriod, number> = {
    '24h': 24,
    '7d': 7,
    '30d': 14,
    '90d': 12,
  }
  const n = meta[period]
  const seed = clusterSeed(tenantId)
  const labels = clusterLabelsForPeriod(period, n)

  return labels.map((label, i) => ({
    label,
    cpu: clusterUtilAt(i, n, 42 + (seed % 12), 18 + (seed % 9), 0.4),
    memory: clusterUtilAt(i, n, 48 + (seed % 10), 16 + (seed % 8), 0.9),
    gpu: clusterUtilAt(i, n, 34 + (seed % 14), 22 + (seed % 11), 1.2),
    storage: clusterUtilAt(i, n, 52 + (seed % 8), 12 + (seed % 6), 0.6),
  }))
}

export function buildDashboardClusterRecentActivitiesPreview(
  tenantId: DemoTenantId,
  limit = 6,
): VmRecentActivityItem[] {
  const by =
    tenantId === 'northstar' ? 'Chris Morgan' : tenantId === 'evergreen' ? 'Emerson Cruz' : 'Alex Johnson'
  const evt = tenantId === 'northstar' ? 'evt-ns' : tenantId === 'evergreen' ? 'evt-efg' : 'evt-vtx'

  return CLUSTER_ACTIVITY_BY_TENANT[tenantId].slice(0, limit).map((item, index) => ({
    id: item.id,
    timeLabel: item.timeLabel,
    title: item.title,
    detail: item.detail,
    severity: item.severity,
    occurredAt: `Apr ${Math.max(1, 6 - index)}, 2026 · 09:${10 + index} UTC`,
    resource: item.clusterName,
    resourceType: 'Cluster',
    workspace: item.project,
    initiatedBy: by,
    eventId: `${evt}-cl${index}-01k9`,
  }))
}
