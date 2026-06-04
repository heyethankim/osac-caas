import { useEffect, useMemo, useState } from 'react'
import { EllipsisVIcon } from '@patternfly/react-icons/dist/esm/icons/ellipsis-v-icon'
import { FilterIcon } from '@patternfly/react-icons/dist/esm/icons/filter-icon'
import { ListIcon } from '@patternfly/react-icons/dist/esm/icons/list-icon'
import { ThIcon } from '@patternfly/react-icons/dist/esm/icons/th-icon'
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Gallery,
  GalleryItem,
  Label,
  MenuToggle,
  SearchInput,
  Tab,
  TabContentBody,
  Tabs,
  TabTitleText,
  Title,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core'
import tableStyles from '@patternfly/react-styles/css/components/Table/table'
import type { DemoTenantId } from './demoTenant'
import {
  buildTenantClustersForTenant,
  type ClusterStatus,
  type TenantCluster,
} from './dashboardClusterDemo'
import {
  ClusterProvisioningNoticeAlert,
  type ClusterProvisioningNotice,
} from './ClusterProvisioningNoticeAlert'
import {
  CLUSTER_TEMPLATE_ICON,
  CLUSTER_TEMPLATE_ICON_TILE_BG,
  clusterTemplateIconColor,
} from './tenantClusterTemplatesDemo'

const ClusterFleetIcon = CLUSTER_TEMPLATE_ICON

const STATUS_LABEL: Record<ClusterStatus, string> = {
  running: 'Running',
  provisioning: 'Provisioning',
  degraded: 'Needs attention',
  stopped: 'Stopped',
}

type StatusFilterValue = 'all' | ClusterStatus
type PlatformFilterValue = 'all' | TenantCluster['platform']
type CreatedFilterValue = 'all' | 'newest'

const STATUS_FILTER_OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'running', label: 'Running' },
  { value: 'provisioning', label: 'Provisioning' },
  { value: 'degraded', label: 'Needs attention' },
  { value: 'stopped', label: 'Stopped' },
]

const PLATFORM_FILTER_OPTIONS: { value: PlatformFilterValue; label: string }[] = [
  { value: 'all', label: 'All platforms' },
  { value: 'OpenShift', label: 'OpenShift' },
  { value: 'Kubernetes', label: 'Kubernetes' },
]

const CREATED_FILTER_OPTIONS: { value: CreatedFilterValue; label: string }[] = [
  { value: 'all', label: 'All creation dates' },
  { value: 'newest', label: 'Newest created' },
]

function statusFilterLabel(value: StatusFilterValue): string {
  return STATUS_FILTER_OPTIONS.find((o) => o.value === value)?.label ?? ''
}

function platformFilterLabel(value: PlatformFilterValue): string {
  return PLATFORM_FILTER_OPTIONS.find((o) => o.value === value)?.label ?? ''
}

function createdFilterLabel(value: CreatedFilterValue): string {
  return CREATED_FILTER_OPTIONS.find((o) => o.value === value)?.label ?? ''
}

function statusLabelColor(status: ClusterStatus): React.ComponentProps<typeof Label>['color'] {
  switch (status) {
    case 'running':
      return 'green'
    case 'provisioning':
      return 'blue'
    case 'degraded':
      return 'orange'
    case 'stopped':
      return 'grey'
    default:
      return 'grey'
  }
}

function filterToNewestCreated(clusters: TenantCluster[]): TenantCluster[] {
  if (clusters.length === 0) return clusters
  const maxMs = Math.max(...clusters.map((c) => c.createdAtMs))
  return clusters.filter((c) => c.createdAtMs === maxMs)
}

function clusterCardResourceCell(label: string, value: string) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--pf-t--global--spacer--xs)',
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: 'var(--pf-t--global--font--size--body--sm)',
          color: 'var(--pf-t--global--text--color--subtle)',
          fontWeight: 'var(--pf-t--global--font--weight--body--bold)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 'var(--pf-t--global--font--size--body--default)',
          color: 'var(--pf-t--global--text--color--regular)',
          wordBreak: 'break-word',
        }}
      >
        {value}
      </span>
    </div>
  )
}

function specRow(label: string, value: string) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 42%) minmax(0, 1fr)',
        gap: 'var(--pf-t--global--spacer--sm)',
        fontSize: 'var(--pf-t--global--font--size--body--sm)',
        alignItems: 'baseline',
      }}
    >
      <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>{label}</span>
      <span style={{ color: 'var(--pf-t--global--text--color--regular)', wordBreak: 'break-word' }}>
        {value}
      </span>
    </div>
  )
}

export type TenantClustersPageProps = {
  demoTenantId: Extract<DemoTenantId, 'northstar' | 'evergreen'>
  navReselectSeq?: number
  statusFilterIntent?: ClusterStatus | null
  /** When set with `statusFilterIntent`, shows the “from dashboard” filter affordance. */
  statusFilterIntentSource?: 'dashboard' | null
  clustersCreatedFromModal?: TenantCluster[]
  provisioningNotice?: ClusterProvisioningNotice | null
  onDismissProvisioningNotice?: () => void
  onOpenCreateCluster: () => void
}

function isDashboardStatusFilterIntent(
  value: ClusterStatus | null | undefined,
): value is ClusterStatus {
  return value === 'running' || value === 'provisioning' || value === 'degraded' || value === 'stopped'
}

export function TenantClustersPage({
  demoTenantId,
  navReselectSeq = 0,
  statusFilterIntent = null,
  statusFilterIntentSource = null,
  clustersCreatedFromModal = [],
  provisioningNotice = null,
  onDismissProvisioningNotice,
  onOpenCreateCluster,
}: TenantClustersPageProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>(
    () => statusFilterIntent ?? 'all',
  )
  const [dashboardStatusFilterHint, setDashboardStatusFilterHint] = useState<ClusterStatus | null>(
    () => (isDashboardStatusFilterIntent(statusFilterIntent) ? statusFilterIntent : null),
  )
  const [platformFilter, setPlatformFilter] = useState<PlatformFilterValue>('all')
  const [createdFilter, setCreatedFilter] = useState<CreatedFilterValue>('all')
  const [search, setSearch] = useState('')
  const [listDisplayMode, setListDisplayMode] = useState<'grid' | 'table'>('grid')
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const [platformMenuOpen, setPlatformMenuOpen] = useState(false)
  const [createdMenuOpen, setCreatedMenuOpen] = useState(false)
  const [actionsMenuOpenId, setActionsMenuOpenId] = useState<string | null>(null)
  const [detailClusterId, setDetailClusterId] = useState<string | null>(null)
  const [detailActiveTab, setDetailActiveTab] = useState<string | number>('overview')

  const allClusters = useMemo(
    () => [...clustersCreatedFromModal, ...buildTenantClustersForTenant(demoTenantId)],
    [demoTenantId, clustersCreatedFromModal],
  )

  const detailCluster = useMemo(
    () => allClusters.find((c) => c.id === detailClusterId),
    [allClusters, detailClusterId],
  )

  useEffect(() => {
    if (detailClusterId) setDetailActiveTab('overview')
  }, [detailClusterId])

  useEffect(() => {
    if (navReselectSeq === 0) return
    setDetailClusterId(null)
  }, [navReselectSeq])

  useEffect(() => {
    if (isDashboardStatusFilterIntent(statusFilterIntent)) {
      setStatusFilter(statusFilterIntent)
      setDashboardStatusFilterHint(
        statusFilterIntentSource === 'dashboard' ? statusFilterIntent : null,
      )
    } else {
      setStatusFilter('all')
      setDashboardStatusFilterHint(null)
    }
  }, [statusFilterIntent, statusFilterIntentSource])

  const showStatusFilterDashboardHint =
    dashboardStatusFilterHint !== null && statusFilter === dashboardStatusFilterHint

  const showProvisioningNotice =
    provisioningNotice != null &&
    clustersCreatedFromModal.some(
      (c) => c.id === provisioningNotice.clusterId && c.status === 'provisioning',
    )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = allClusters.filter((cluster) => {
      if (statusFilter !== 'all' && cluster.status !== statusFilter) return false
      if (platformFilter !== 'all' && cluster.platform !== platformFilter) return false
      if (!q) return true
      return cluster.name.toLowerCase().includes(q)
    })
    if (createdFilter === 'all') return base
    return filterToNewestCreated(base)
  }, [allClusters, statusFilter, platformFilter, createdFilter, search])

  const pageShellStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--pf-t--global--spacer--lg)',
    height: '100%',
    minHeight: 0,
  }

  if (detailCluster) {
    return (
      <div className="tenant-vm-page-root" style={pageShellStyle}>
        <div className="tenant-vm-page-sticky-heading tenant-vm-page-sticky-heading--detail">
          <Breadcrumb aria-label="Cluster">
            <BreadcrumbItem>
              <Button variant="link" isInline onClick={() => setDetailClusterId(null)}>
                My clusters
              </Button>
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{detailCluster.name}</BreadcrumbItem>
          </Breadcrumb>
          <Title headingLevel="h1" size="2xl" style={{ margin: 0, minWidth: 0 }}>
            {detailCluster.name}
          </Title>
        </div>
        <Tabs
          activeKey={detailActiveTab}
          onSelect={(_e, key) => setDetailActiveTab(key)}
          aria-label="Cluster detail sections"
          mountOnEnter
        >
          <Tab eventKey="overview" title={<TabTitleText>Overview</TabTitleText>}>
            <TabContentBody>
              <div className="tenant-vm-detail-overview-layout">
                <Card isFullHeight className="tenant-vm-detail-overview-card">
                  <CardBody>
                    <DescriptionList>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Name</DescriptionListTerm>
                        <DescriptionListDescription>{detailCluster.name}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Description</DescriptionListTerm>
                        <DescriptionListDescription>{detailCluster.description}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Platform</DescriptionListTerm>
                        <DescriptionListDescription>
                          {detailCluster.platform} {detailCluster.version}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Status</DescriptionListTerm>
                        <DescriptionListDescription>
                          <Label color={statusLabelColor(detailCluster.status)}>
                            {STATUS_LABEL[detailCluster.status]}
                          </Label>
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Project</DescriptionListTerm>
                        <DescriptionListDescription>{detailCluster.project}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Region</DescriptionListTerm>
                        <DescriptionListDescription>{detailCluster.region}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Control plane</DescriptionListTerm>
                        <DescriptionListDescription>{detailCluster.controlPlane}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Workers</DescriptionListTerm>
                        <DescriptionListDescription>{detailCluster.workers}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Owner</DescriptionListTerm>
                        <DescriptionListDescription>{detailCluster.owner}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Created</DescriptionListTerm>
                        <DescriptionListDescription>{detailCluster.created}</DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </CardBody>
                </Card>
              </div>
            </TabContentBody>
          </Tab>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="tenant-vm-page-root" style={pageShellStyle}>
      <div className="tenant-vm-page-sticky-heading">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--pf-t--global--spacer--md)',
            marginBottom: 'var(--pf-t--global--spacer--xs)',
          }}
        >
          <Title headingLevel="h1" size="2xl" style={{ margin: 0, minWidth: 0, flex: '1 1 auto' }}>
            My clusters
          </Title>
          <div style={{ flexShrink: 0 }}>
            <Button variant="primary" onClick={onOpenCreateCluster} aria-label="Create cluster">
              Create cluster
            </Button>
          </div>
        </div>
        <Content
          component="p"
          className="tenant-clusters-page__lede"
          style={{
            margin: 0,
            color: 'var(--pf-t--global--text--color--subtle)',
          }}
        >
          View and filter clusters. Use the layout toggle for grid cards or a compact table.
        </Content>
      </div>

      {showProvisioningNotice ? (
        <ClusterProvisioningNoticeAlert
          clusterName={provisioningNotice.clusterName}
          onDismiss={onDismissProvisioningNotice}
          className="create-cluster-provisioning-notice--my-clusters"
        />
      ) : null}

      <div
        className="tenant-vm-page-filters tenant-vm-page-filters__toolbar"
        role="search"
        aria-label="Cluster filters"
      >
        <div className="tenant-vm-page-filters__controls">
          <div className="tenant-vm-page-filters__search-wrap">
            <SearchInput
              className="tenant-vm-page-filters__search"
              placeholder="Filter by cluster name"
              value={search}
              onChange={(_e, v) => setSearch(v)}
              onClear={() => setSearch('')}
              aria-label="Filter by cluster name"
            />
          </div>
          <Dropdown
            className="tenant-vm-page-filters__dropdown"
            isOpen={statusMenuOpen}
            onOpenChange={setStatusMenuOpen}
            onSelect={() => setStatusMenuOpen(false)}
            popperProps={{ placement: 'bottom-start' }}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                className={
                  showStatusFilterDashboardHint
                    ? 'tenant-vm-filter-dropdown tenant-vm-filter-dropdown--power tenant-vm-power-filter--dashboard-hint'
                    : 'tenant-vm-filter-dropdown tenant-vm-filter-dropdown--power'
                }
                icon={<FilterIcon />}
                isExpanded={statusMenuOpen}
                onClick={() => setStatusMenuOpen((o) => !o)}
                aria-label={
                  showStatusFilterDashboardHint
                    ? `Status filter, ${statusFilterLabel(statusFilter)} selected. Filter applied from dashboard.`
                    : `Status filter, ${statusFilterLabel(statusFilter)} selected`
                }
              >
                {statusFilterLabel(statusFilter)}
              </MenuToggle>
            )}
          >
            <DropdownList>
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <DropdownItem
                  key={opt.value}
                  isSelected={statusFilter === opt.value}
                  onClick={() => {
                    setStatusFilter(opt.value)
                    setDashboardStatusFilterHint(null)
                    setStatusMenuOpen(false)
                  }}
                >
                  {opt.label}
                </DropdownItem>
              ))}
            </DropdownList>
          </Dropdown>
          <Dropdown
            className="tenant-vm-page-filters__dropdown"
            isOpen={platformMenuOpen}
            onOpenChange={setPlatformMenuOpen}
            onSelect={() => setPlatformMenuOpen(false)}
            popperProps={{ placement: 'bottom-start' }}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                className="tenant-vm-filter-dropdown tenant-vm-filter-dropdown--os"
                icon={<FilterIcon />}
                isExpanded={platformMenuOpen}
                onClick={() => setPlatformMenuOpen((o) => !o)}
                aria-label={`Platform filter, ${platformFilterLabel(platformFilter)} selected`}
              >
                {platformFilterLabel(platformFilter)}
              </MenuToggle>
            )}
          >
            <DropdownList>
              {PLATFORM_FILTER_OPTIONS.map((opt) => (
                <DropdownItem
                  key={opt.value}
                  isSelected={platformFilter === opt.value}
                  onClick={() => {
                    setPlatformFilter(opt.value)
                    setPlatformMenuOpen(false)
                  }}
                >
                  {opt.label}
                </DropdownItem>
              ))}
            </DropdownList>
          </Dropdown>
          <Dropdown
            className="tenant-vm-page-filters__dropdown"
            isOpen={createdMenuOpen}
            onOpenChange={setCreatedMenuOpen}
            onSelect={() => setCreatedMenuOpen(false)}
            popperProps={{ placement: 'bottom-start' }}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                className="tenant-vm-filter-dropdown tenant-vm-filter-dropdown--created"
                icon={<FilterIcon />}
                isExpanded={createdMenuOpen}
                onClick={() => setCreatedMenuOpen((o) => !o)}
                aria-label={`Created date filter, ${createdFilterLabel(createdFilter)} selected`}
              >
                {createdFilterLabel(createdFilter)}
              </MenuToggle>
            )}
          >
            <DropdownList>
              {CREATED_FILTER_OPTIONS.map((opt) => (
                <DropdownItem
                  key={opt.value}
                  isSelected={createdFilter === opt.value}
                  onClick={() => {
                    setCreatedFilter(opt.value)
                    setCreatedMenuOpen(false)
                  }}
                >
                  {opt.label}
                </DropdownItem>
              ))}
            </DropdownList>
          </Dropdown>
        </div>
        <div className="tenant-vm-page-filters__view-toggle">
          <ToggleGroup
            isCompact
            role="group"
            aria-label="Cluster list layout"
            className="tenant-vm-page-filters__toggle-group"
          >
            <ToggleGroupItem
              icon={<ThIcon />}
              aria-label="Grid view"
              isSelected={listDisplayMode === 'grid'}
              onChange={(_event, selected) => {
                if (selected) setListDisplayMode('grid')
              }}
            />
            <ToggleGroupItem
              icon={<ListIcon />}
              aria-label="Table view"
              isSelected={listDisplayMode === 'table'}
              onChange={(_event, selected) => {
                if (selected) setListDisplayMode('table')
              }}
            />
          </ToggleGroup>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--pf-t--global--spacer--md)',
          minHeight: 0,
          flex: '1 1 auto',
        }}
      >
        <Content
          component="p"
          style={{
            margin: 0,
            color: 'var(--pf-t--global--text--color--subtle)',
            fontSize: 'var(--pf-t--global--font--size--body--sm)',
          }}
        >
          {filtered.length} cluster{filtered.length === 1 ? '' : 's'}
          {createdFilter === 'newest' && filtered.length > 0 ? ' (newest created)' : ''}
        </Content>
        {filtered.length === 0 ? (
          <Content
            component="p"
            style={{
              textAlign: 'center',
              padding: 'var(--pf-t--global--spacer--2xl)',
            }}
          >
            No clusters match your filters. Try adjusting status, platform, or the name search.
          </Content>
        ) : listDisplayMode === 'grid' ? (
          <Gallery hasGutter minWidths={{ default: '260px', md: '280px', lg: '300px' }}>
            {filtered.map((cluster) => (
              <GalleryItem key={cluster.id}>
                <Card
                  isFullHeight
                  id={`tenant-cluster-${cluster.id}`}
                  className="tenant-vm-instance-card"
                  tabIndex={0}
                  aria-labelledby={`tenant-cluster-card-title-${cluster.id}`}
                  onClick={() => setDetailClusterId(cluster.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setDetailClusterId(cluster.id)
                    }
                  }}
                >
                  <CardHeader>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--pf-t--global--spacer--sm)',
                        width: '100%',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 'var(--pf-t--global--spacer--md)',
                          width: '100%',
                        }}
                      >
                        <div
                          style={{
                            flexShrink: 0,
                            width: 44,
                            height: 44,
                            borderRadius: 'var(--pf-t--global--border--radius--medium)',
                            backgroundColor: CLUSTER_TEMPLATE_ICON_TILE_BG,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ClusterFleetIcon
                            aria-hidden
                            style={{
                              width: 24,
                              height: 24,
                              flexShrink: 0,
                              color: clusterTemplateIconColor(cluster.platform),
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: 'var(--pf-t--global--spacer--xs)',
                            marginLeft: 'auto',
                          }}
                        >
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            isDisabled={cluster.status !== 'running'}
                          >
                            Console
                          </Button>
                          <div role="presentation" className="tenant-vm-card__state">
                            <Label color={statusLabelColor(cluster.status)}>
                              {STATUS_LABEL[cluster.status]}
                            </Label>
                          </div>
                          <div role="presentation" onClick={(e) => e.stopPropagation()}>
                            <Dropdown
                              isOpen={actionsMenuOpenId === cluster.id}
                              onOpenChange={(open) => setActionsMenuOpenId(open ? cluster.id : null)}
                              onSelect={() => setActionsMenuOpenId(null)}
                              popperProps={{ placement: 'bottom-end' }}
                              toggle={(toggleRef) => (
                                <MenuToggle
                                  ref={toggleRef}
                                  variant="plain"
                                  size="sm"
                                  isExpanded={actionsMenuOpenId === cluster.id}
                                  onClick={() =>
                                    setActionsMenuOpenId((cur) =>
                                      cur === cluster.id ? null : cluster.id,
                                    )
                                  }
                                  aria-label={`Actions for ${cluster.name}`}
                                  icon={<EllipsisVIcon />}
                                />
                              )}
                            >
                              <DropdownList>
                                <DropdownItem onClick={(e) => e.preventDefault()}>Scale</DropdownItem>
                                <DropdownItem onClick={(e) => e.preventDefault()}>Upgrade</DropdownItem>
                                <DropdownItem onClick={(e) => e.preventDefault()}>Delete</DropdownItem>
                              </DropdownList>
                            </Dropdown>
                          </div>
                        </div>
                      </div>
                      <div style={{ minWidth: 0, width: '100%', textAlign: 'start' }}>
                        <span
                          id={`tenant-cluster-card-title-${cluster.id}`}
                          style={{
                            display: 'block',
                            fontSize: 'var(--pf-t--global--font--size--body--lg)',
                            fontWeight: 'var(--pf-t--global--font--weight--heading--default)',
                            color: 'var(--pf-t--global--text--color--regular)',
                            wordBreak: 'break-word',
                          }}
                        >
                          {cluster.name}
                        </span>
                      </div>
                      <Content
                        component="p"
                        style={{
                          margin: 0,
                          color: 'var(--pf-t--global--text--color--subtle)',
                          fontSize: 'var(--pf-t--global--font--size--body--sm)',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical' as const,
                          overflow: 'hidden',
                        }}
                      >
                        {cluster.description}
                      </Content>
                    </div>
                  </CardHeader>
                  <CardBody
                    style={{
                      paddingTop: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--pf-t--global--spacer--md)',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                        gap: 'var(--pf-t--global--spacer--sm)',
                        alignItems: 'start',
                      }}
                    >
                      {clusterCardResourceCell('Control plane', cluster.controlPlane)}
                      {clusterCardResourceCell('Workers', cluster.workers)}
                      {clusterCardResourceCell('Total nodes', cluster.totalNodes)}
                    </div>
                    <Divider component="div" role="separator" style={{ marginBlock: 0 }} />
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--pf-t--global--spacer--xs)',
                      }}
                    >
                      {specRow('Platform', `${cluster.platform} ${cluster.version}`)}
                      {specRow('Project', cluster.project)}
                      {specRow('Created', cluster.created)}
                    </div>
                  </CardBody>
                </Card>
              </GalleryItem>
            ))}
          </Gallery>
        ) : (
          <div className="tenant-vm-page-table-wrap">
            <table
              className={`${tableStyles.table} ${tableStyles.modifiers.compact} ${tableStyles.modifiers.striped} ${tableStyles.modifiers.truncate} tenant-vm-table`}
              aria-label="My clusters"
            >
              <thead className={tableStyles.tableThead}>
                <tr className={tableStyles.tableTr}>
                  <th className={`${tableStyles.tableTh} tenant-vm-table__th--name`} scope="col">
                    Name
                  </th>
                  <th className={`${tableStyles.tableTh} tenant-vm-table__th--status`} scope="col">
                    Status
                  </th>
                  <th
                    className={`${tableStyles.tableTh} ${tableStyles.modifiers.fitContent}`}
                    scope="col"
                  >
                    Console
                  </th>
                  <th className={`${tableStyles.tableTh} tenant-vm-table__th--workspace`} scope="col">
                    Project
                  </th>
                  <th className={`${tableStyles.tableTh} tenant-vm-table__th--metric`} scope="col">
                    Control plane
                  </th>
                  <th className={`${tableStyles.tableTh} tenant-vm-table__th--metric`} scope="col">
                    Workers
                  </th>
                  <th className={`${tableStyles.tableTh} tenant-vm-table__th--storage`} scope="col">
                    Total nodes
                  </th>
                  <th className={`${tableStyles.tableTh} tenant-vm-table__th--os`} scope="col">
                    Platform
                  </th>
                  <th className={`${tableStyles.tableTh} tenant-vm-table__th--created`} scope="col">
                    Created
                  </th>
                  <th
                    className={`${tableStyles.tableTh} ${tableStyles.tableAction} ${tableStyles.modifiers.fitContent}`}
                    aria-label="Row actions"
                    scope="col"
                  />
                </tr>
              </thead>
              <tbody className={tableStyles.tableTbody}>
                {filtered.map((cluster) => (
                  <tr
                    key={cluster.id}
                    className={`${tableStyles.tableTr} ${tableStyles.modifiers.clickable}`}
                    tabIndex={0}
                    onClick={() => setDetailClusterId(cluster.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setDetailClusterId(cluster.id)
                      }
                    }}
                  >
                    <td className={`${tableStyles.tableTd} tenant-vm-table__td--name`} data-label="Name">
                      <Button
                        variant="link"
                        isInline
                        className="tenant-vm-table__name-link"
                        title={cluster.name}
                        onClick={(e) => {
                          e.stopPropagation()
                          setDetailClusterId(cluster.id)
                        }}
                      >
                        {cluster.name}
                      </Button>
                    </td>
                    <td
                      className={`${tableStyles.tableTd} tenant-vm-table__td--status tenant-vm-table__td--no-row-nav`}
                      data-label="Status"
                    >
                      <Label color={statusLabelColor(cluster.status)}>
                        {STATUS_LABEL[cluster.status]}
                      </Label>
                    </td>
                    <td
                      className={`${tableStyles.tableTd} tenant-vm-table__td--no-row-nav`}
                      data-label="Console"
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        isDisabled={cluster.status !== 'running'}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Console
                      </Button>
                    </td>
                    <td
                      className={`${tableStyles.tableTd} tenant-vm-table__td--workspace`}
                      data-label="Project"
                    >
                      {cluster.project}
                    </td>
                    <td
                      className={`${tableStyles.tableTd} tenant-vm-table__td--metric`}
                      data-label="Control plane"
                    >
                      {cluster.controlPlane}
                    </td>
                    <td
                      className={`${tableStyles.tableTd} tenant-vm-table__td--metric`}
                      data-label="Workers"
                    >
                      {cluster.workers}
                    </td>
                    <td
                      className={`${tableStyles.tableTd} tenant-vm-table__td--storage`}
                      data-label="Total nodes"
                    >
                      {cluster.totalNodes}
                    </td>
                    <td className={`${tableStyles.tableTd} tenant-vm-table__td--os`} data-label="Platform">
                      <span className="tenant-vm-table__os-text">
                        {cluster.platform} {cluster.version}
                      </span>
                    </td>
                    <td
                      className={`${tableStyles.tableTd} tenant-vm-table__td--created`}
                      data-label="Created"
                    >
                      {cluster.created}
                    </td>
                    <td
                      className={`${tableStyles.tableTd} ${tableStyles.tableAction} tenant-vm-table__td--no-row-nav`}
                      data-label="Actions"
                    >
                      <Dropdown
                        isOpen={actionsMenuOpenId === cluster.id}
                        onOpenChange={(open) => setActionsMenuOpenId(open ? cluster.id : null)}
                        onSelect={() => setActionsMenuOpenId(null)}
                        popperProps={{ placement: 'bottom-end' }}
                        toggle={(toggleRef) => (
                          <MenuToggle
                            ref={toggleRef}
                            variant="plain"
                            isExpanded={actionsMenuOpenId === cluster.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              setActionsMenuOpenId((cur) => (cur === cluster.id ? null : cluster.id))
                            }}
                            aria-label={`Actions for ${cluster.name}`}
                            icon={<EllipsisVIcon />}
                          />
                        )}
                      >
                        <DropdownList>
                          <DropdownItem onClick={(e) => e.preventDefault()}>Scale</DropdownItem>
                          <DropdownItem onClick={(e) => e.preventDefault()}>Upgrade</DropdownItem>
                          <DropdownItem onClick={(e) => e.preventDefault()}>Delete</DropdownItem>
                        </DropdownList>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
