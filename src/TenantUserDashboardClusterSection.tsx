import { useMemo } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Content, Title } from '@patternfly/react-core'
import {
  ClusterProvisioningNoticeAlert,
  type ClusterProvisioningNotice,
} from './ClusterProvisioningNoticeAlert'
import {
  buildDashboardClusterStatusStats,
  type ClusterStatus,
  type TenantCluster,
} from './dashboardClusterDemo'
import type { DemoTenantId } from './demoTenant'
import { DashboardVmQuotaSection } from './DashboardVmQuotaSection'
import { DashboardVmUtilizationSection } from './DashboardVmUtilizationSection'
import type { TenantVirtualMachine } from './TenantVirtualMachinesPage'

export type { ClusterProvisioningNotice } from './ClusterProvisioningNoticeAlert'

export type TenantUserDashboardClusterSectionProps = {
  demoTenantId: Extract<DemoTenantId, 'northstar' | 'evergreen'>
  isDarkTheme: boolean
  fleetVirtualMachines: readonly TenantVirtualMachine[]
  clustersCreatedFromModal?: readonly TenantCluster[]
  provisioningNotice?: ClusterProvisioningNotice | null
  onDismissProvisioningNotice?: () => void
  onNavigateToMyClusters: (statusFilter?: ClusterStatus | null) => void
  onOpenRecentActivities: () => void
}

const STAT_CARD_BODY_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--pf-t--global--spacer--xs)',
  height: '100%',
} as const

const STAT_LABEL_STYLE = {
  margin: 0,
  color: 'var(--pf-t--global--text--color--regular)',
  fontSize: 'var(--pf-t--global--font--size--heading--xs)',
  fontWeight: 'var(--pf-t--global--font--weight--heading--bold)',
  lineHeight: 'var(--pf-t--global--font--line-height--heading)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minWidth: 0,
} as const

const STAT_CAPTION_STYLE = {
  margin: 0,
  marginTop: 'auto',
  paddingTop: 'var(--pf-t--global--spacer--xs)',
  color: 'var(--pf-t--global--text--color--subtle)',
  fontSize: 'var(--pf-t--global--font--size--body--sm)',
  lineHeight: 'var(--pf-t--global--font--line-height--body)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minWidth: 0,
} as const

export function TenantUserDashboardClusterSection({
  demoTenantId,
  isDarkTheme,
  fleetVirtualMachines,
  clustersCreatedFromModal = [],
  provisioningNotice = null,
  onDismissProvisioningNotice,
  onNavigateToMyClusters,
  onOpenRecentActivities,
}: TenantUserDashboardClusterSectionProps) {
  const clusterStats = useMemo(
    () => buildDashboardClusterStatusStats(demoTenantId, clustersCreatedFromModal),
    [demoTenantId, clustersCreatedFromModal],
  )

  const showProvisioningNotice =
    provisioningNotice != null &&
    clustersCreatedFromModal.some(
      (c) => c.id === provisioningNotice.clusterId && c.status === 'provisioning',
    )

  return (
    <>
      {showProvisioningNotice ? (
        <ClusterProvisioningNoticeAlert
          clusterName={provisioningNotice.clusterName}
          onDismiss={onDismissProvisioningNotice}
          showViewProvisioningLink
          onViewProvisioning={() => onNavigateToMyClusters('provisioning')}
        />
      ) : null}

      <div className="osac-dashboard-vm-stats-grid osac-dashboard-vm-stats-grid--five-cols">
        {clusterStats.map((stat) => {
          const valueTitleStyle = {
            margin: 0,
            ...('valueColor' in stat ? { color: stat.valueColor } : {}),
            fontWeight: 'var(--pf-t--global--font--weight--heading--bold)',
            whiteSpace: 'nowrap' as const,
            overflow: 'hidden' as const,
            textOverflow: 'ellipsis' as const,
            minWidth: 0,
          }

          return (
            <Card
              key={stat.key}
              id={`osac-dashboard-${stat.key}-cluster-card`}
              isClickable
              isFullHeight
              component="article"
              className="osac-dashboard-vm-stat-card osac-dashboard-vm-stat-card--link"
            >
              <CardHeader
                selectableActions={{
                  onClickAction: () => onNavigateToMyClusters(stat.statusFilter),
                  selectableActionAriaLabel: `${stat.label}, ${stat.value}, ${stat.caption}. Open My clusters${
                    stat.statusFilter ? ` filtered to ${stat.label.toLowerCase()}` : ''
                  }`,
                }}
              >
                <CardTitle component="h2" style={STAT_LABEL_STYLE}>
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardBody style={STAT_CARD_BODY_STYLE}>
                <Title headingLevel="h3" size="4xl" style={valueTitleStyle}>
                  {stat.value}
                </Title>
                <Content component="p" title={stat.caption} style={STAT_CAPTION_STYLE}>
                  {stat.caption}
                </Content>
              </CardBody>
            </Card>
          )
        })}
      </div>

      <DashboardVmUtilizationSection
        isDarkTheme={isDarkTheme}
        onOpenRecentActivities={onOpenRecentActivities}
        fleetVirtualMachines={fleetVirtualMachines}
        demoTenantId={demoTenantId}
        variant="clusters"
      />

      <DashboardVmQuotaSection
        isDarkTheme={isDarkTheme}
        fleetVirtualMachines={fleetVirtualMachines}
        tenantUserPersona={demoTenantId}
      />
    </>
  )
}
