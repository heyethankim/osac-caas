import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerColorVariant,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  ExpandableSection,
  Gallery,
  GalleryItem,
  SearchInput,
  Sidebar,
  SidebarContent,
  SidebarPanel,
  Tab,
  TabContentBody,
  Tabs,
  TabTitleText,
  Title,
} from '@patternfly/react-core'
import {
  CLUSTER_TEMPLATE_DETAIL_DEFAULTS,
  CLUSTER_TEMPLATE_ICON,
  CLUSTER_TEMPLATE_ICON_TILE_BG,
  CLUSTER_USE_CASE_LABEL,
  clusterTemplateIconColor,
  getTenantClusterTemplateById,
  listOrderedClusterCatalogTemplates,
  type TenantClusterTemplate,
} from './tenantClusterTemplatesDemo'
import { specRow } from './TenantVmTemplatesCatalog'

type PlatformFilters = { openshift: boolean; kubernetes: boolean }
type UseCaseFilters = {
  production: boolean
  aiMl: boolean
  edge: boolean
  highPerformance: boolean
  analytics: boolean
}

const initialPlatform: PlatformFilters = { openshift: false, kubernetes: false }
const initialUseCase: UseCaseFilters = {
  production: false,
  aiMl: false,
  edge: false,
  highPerformance: false,
  analytics: false,
}

function platformGroupActive(filters: PlatformFilters): boolean {
  return filters.openshift || filters.kubernetes
}

function useCaseGroupActive(filters: UseCaseFilters): boolean {
  return (
    filters.production ||
    filters.aiMl ||
    filters.edge ||
    filters.highPerformance ||
    filters.analytics
  )
}

function templateMatchesPlatform(template: TenantClusterTemplate, filters: PlatformFilters): boolean {
  if (!platformGroupActive(filters)) return true
  return (
    (filters.openshift && template.platform === 'OpenShift') ||
    (filters.kubernetes && template.platform === 'Kubernetes')
  )
}

function templateMatchesUseCase(template: TenantClusterTemplate, filters: UseCaseFilters): boolean {
  if (!useCaseGroupActive(filters)) return true
  const tags = template.useCaseFilterTags
  return (
    (filters.production && tags.includes('production')) ||
    (filters.aiMl && tags.includes('ai-ml')) ||
    (filters.edge && tags.includes('edge')) ||
    (filters.highPerformance && tags.includes('high-performance')) ||
    (filters.analytics && tags.includes('analytics'))
  )
}

function clusterTemplateCardResourceCell(label: string, value: string) {
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

/** Icon, title, and subtitle for a cluster template card (use inside `CardHeader`). */
export function ClusterWizardTemplateCardHeader({
  template,
  titleIdPrefix = 'cluster-catalog-template-card-title',
}: {
  template: TenantClusterTemplate
  titleIdPrefix?: string
}) {
  const Icon = CLUSTER_TEMPLATE_ICON
  return (
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
        <Icon
          aria-hidden
          style={{
            width: 24,
            height: 24,
            flexShrink: 0,
            color: clusterTemplateIconColor(template.platform),
          }}
        />
      </div>
      <div style={{ minWidth: 0, width: '100%', textAlign: 'start' }}>
        <span
          id={`${titleIdPrefix}-${template.id}`}
          style={{
            display: 'block',
            fontSize: 'var(--pf-t--global--font--size--body--lg)',
            fontWeight: 'var(--pf-t--global--font--weight--heading--default)',
            color: 'var(--pf-t--global--text--color--regular)',
            wordBreak: 'break-word',
          }}
        >
          {template.title}
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
        {template.subtitle}
      </Content>
    </div>
  )
}

/** Control plane / workers / storage grid and metadata rows (use inside `CardBody`). */
export function ClusterWizardTemplateCardBody({ template }: { template: TenantClusterTemplate }) {
  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 'var(--pf-t--global--spacer--sm)',
          alignItems: 'start',
        }}
      >
        {clusterTemplateCardResourceCell('Control plane', template.controlPlane)}
        {clusterTemplateCardResourceCell('Workers', template.workers)}
        {clusterTemplateCardResourceCell('Storage', template.storage)}
      </div>
      <Divider component="div" role="separator" style={{ marginBlock: 0 }} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--pf-t--global--spacer--sm)',
        }}
      >
        {specRow(
          'Network',
          template.cardNetworkDisplay ?? CLUSTER_TEMPLATE_DETAIL_DEFAULTS.network,
        )}
        {specRow(
          'Use case',
          template.cardUseCaseDisplay ?? CLUSTER_USE_CASE_LABEL[template.useCase],
        )}
      </div>
    </>
  )
}

function ClusterTemplateCardPresentation({ template }: { template: TenantClusterTemplate }) {
  return (
    <Card isFullHeight id={`cluster-catalog-${template.id}`} component="article">
      <CardHeader>
        <ClusterWizardTemplateCardHeader template={template} />
      </CardHeader>
      <CardBody
        style={{
          paddingTop: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--pf-t--global--spacer--md)',
        }}
      >
        <ClusterWizardTemplateCardBody template={template} />
      </CardBody>
    </Card>
  )
}

export type TenantClusterTemplatesCatalogProps = {
  onOpenCreateClusterFromTemplate: (templateId: string, initialClusterName: string) => void
  navReselectSeq?: number
  pageTitle?: string
  pageDescription?: string
}

export function TenantClusterTemplatesCatalog({
  onOpenCreateClusterFromTemplate,
  navReselectSeq = 0,
  pageTitle = 'Cluster templates',
  pageDescription = 'Browse cluster templates by platform and use case.',
}: TenantClusterTemplatesCatalogProps) {
  const templates = useMemo(() => listOrderedClusterCatalogTemplates(), [])
  const [platform, setPlatform] = useState<PlatformFilters>(initialPlatform)
  const [useCase, setUseCase] = useState<UseCaseFilters>(initialUseCase)
  const [platformExpanded, setPlatformExpanded] = useState(true)
  const [useCaseExpanded, setUseCaseExpanded] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [templateDetailTab, setTemplateDetailTab] = useState<string | number>('details')

  const selectedTemplate = useMemo(
    () => (selectedTemplateId ? getTenantClusterTemplateById(selectedTemplateId) : null),
    [selectedTemplateId],
  )

  const closeTemplateDrawer = () => {
    setSelectedTemplateId(null)
  }

  useEffect(() => {
    setTemplateDetailTab('details')
  }, [selectedTemplateId])

  useEffect(() => {
    if (navReselectSeq === 0) return
    setSelectedTemplateId(null)
  }, [navReselectSeq])

  const openCreateClusterWizard = () => {
    if (!selectedTemplate) return
    onOpenCreateClusterFromTemplate(selectedTemplate.id, `${selectedTemplate.id}-cluster`)
    closeTemplateDrawer()
  }

  const filtersActive = platformGroupActive(platform) || useCaseGroupActive(useCase)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return templates.filter((item) => {
      if (!templateMatchesPlatform(item, platform) || !templateMatchesUseCase(item, useCase)) {
        return false
      }
      if (!q) return true
      const hay = [
        item.title,
        item.subtitle,
        item.project,
        item.platform,
        item.platformVersion,
        item.cardUseCaseDisplay ?? CLUSTER_USE_CASE_LABEL[item.useCase],
        item.cardRegionDisplay ?? 'UK, London',
        item.cardNetworkDisplay ?? CLUSTER_TEMPLATE_DETAIL_DEFAULTS.network,
        item.controlPlane,
        item.workers,
        item.storage,
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [templates, platform, useCase, search])

  const clearFilters = () => {
    setPlatform(initialPlatform)
    setUseCase(initialUseCase)
  }

  const drawerPanel = (
    <DrawerPanelContent
      className="tenant-vm-template-drawer-panel"
      colorVariant={DrawerColorVariant.default}
      widths={{
        default: 'width_100',
        lg: 'width_50',
        xl: 'width_50',
        '2xl': 'width_50',
      }}
      focusTrap={
        selectedTemplate
          ? {
              enabled: true,
              'aria-labelledby': 'tenant-cluster-template-drawer-title',
              elementToFocusOnExpand: '#tenant-cluster-template-drawer-title',
            }
          : { enabled: false }
      }
    >
      {selectedTemplate ? (
        <>
          <DrawerHead className="tenant-vm-template-drawer-head">
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--pf-t--global--spacer--md)',
                minWidth: 0,
                flex: '1 1 auto',
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
                <CLUSTER_TEMPLATE_ICON
                  aria-hidden
                  style={{
                    width: 24,
                    height: 24,
                    flexShrink: 0,
                    color: clusterTemplateIconColor(selectedTemplate.platform),
                  }}
                />
              </div>
              <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                <Title headingLevel="h2" size="xl" style={{ margin: 0 }}>
                  <span id="tenant-cluster-template-drawer-title" tabIndex={-1}>
                    {selectedTemplate.title}
                  </span>
                </Title>
              </div>
            </div>
            <DrawerActions>
              <DrawerCloseButton onClick={closeTemplateDrawer} />
            </DrawerActions>
            <div className="tenant-vm-template-drawer-head-create">
              <Button variant="primary" onClick={openCreateClusterWizard}>
                Create cluster
              </Button>
            </div>
          </DrawerHead>
          <DrawerPanelBody className="tenant-vm-template-drawer-body">
            <div className="tenant-vm-template-drawer-scroll">
              <Content
                component="p"
                style={{
                  margin: '0 0 var(--pf-t--global--spacer--md)',
                  color: 'var(--pf-t--global--text--color--subtle)',
                  fontSize: 'var(--pf-t--global--font--size--body--default)',
                }}
              >
                {selectedTemplate.subtitle}
              </Content>
              <Tabs
                activeKey={templateDetailTab}
                onSelect={(_e, key) => setTemplateDetailTab(key)}
                aria-label="Cluster template detail sections"
                mountOnEnter
                className="tenant-vm-template-drawer-tabs"
              >
                <Tab eventKey="details" title={<TabTitleText>Details</TabTitleText>}>
                  <TabContentBody>
                    <div className="tenant-vm-template-detail-stack">
                      <DescriptionList isCompact aria-label="Cluster template details">
                        <DescriptionListGroup>
                          <DescriptionListTerm>Platform</DescriptionListTerm>
                          <DescriptionListDescription>
                            {selectedTemplate.platform} {selectedTemplate.platformVersion}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Project</DescriptionListTerm>
                          <DescriptionListDescription>
                            {selectedTemplate.project}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Control plane</DescriptionListTerm>
                          <DescriptionListDescription>
                            {selectedTemplate.controlPlane}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Workers</DescriptionListTerm>
                          <DescriptionListDescription>
                            {selectedTemplate.workers}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Storage</DescriptionListTerm>
                          <DescriptionListDescription>
                            {selectedTemplate.storage}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Region</DescriptionListTerm>
                          <DescriptionListDescription>
                            {selectedTemplate.cardRegionDisplay ?? 'UK, London'}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Network</DescriptionListTerm>
                          <DescriptionListDescription>
                            {selectedTemplate.cardNetworkDisplay ??
                              CLUSTER_TEMPLATE_DETAIL_DEFAULTS.network}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Use case</DescriptionListTerm>
                          <DescriptionListDescription>
                            {selectedTemplate.cardUseCaseDisplay ??
                              CLUSTER_USE_CASE_LABEL[selectedTemplate.useCase]}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      </DescriptionList>
                    </div>
                  </TabContentBody>
                </Tab>
                <Tab eventKey="parameters" title={<TabTitleText>Parameters</TabTitleText>}>
                  <TabContentBody>{null}</TabContentBody>
                </Tab>
              </Tabs>
            </div>
          </DrawerPanelBody>
        </>
      ) : null}
    </DrawerPanelContent>
  )

  return (
    <div
      className="tenant-vm-templates-catalog-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        minHeight: 0,
        width: '100%',
        minWidth: 0,
      }}
    >
      <div className="osac-page-toolbar-sticky">
        <div className="osac-page-toolbar-sticky__lead">
          <Title headingLevel="h1" size="2xl" style={{ margin: 0, minWidth: 0 }}>
            {pageTitle}
          </Title>
          <Content
            component="p"
            style={{
              margin: 0,
              maxWidth: '48rem',
              color: 'var(--pf-t--global--text--color--subtle)',
              fontSize: 'var(--pf-t--global--font--size--body--default)',
            }}
          >
            {pageDescription}
          </Content>
        </div>
      </div>

      <div className="tenant-vm-templates-drawer-host">
        <Drawer
          isExpanded={selectedTemplate !== null}
          position="end"
          className="tenant-vm-templates-drawer"
        >
          <DrawerContent panelContent={drawerPanel}>
            <DrawerContentBody className="tenant-vm-templates-drawer__main">
              <Sidebar
                className="catalog-vm-templates-sidebar"
                hasGutter
                hasBorder
                style={{ flex: '1 1 auto', minHeight: 0 }}
              >
                <SidebarPanel hasPadding variant="static">
                  <Title
                    headingLevel="h2"
                    size="md"
                    style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
                  >
                    Categories
                  </Title>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--pf-t--global--spacer--md)',
                    }}
                  >
                    <Button
                      variant={!filtersActive ? 'secondary' : 'plain'}
                      isBlock
                      onClick={clearFilters}
                    >
                      All items
                    </Button>

                    <ExpandableSection
                      toggleText="Platform"
                      isExpanded={platformExpanded}
                      onToggle={(_e, expanded) => setPlatformExpanded(expanded)}
                      isIndented
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 'var(--pf-t--global--spacer--sm)',
                        }}
                      >
                        <Checkbox
                          id="tenant-cat-platform-openshift"
                          label="OpenShift"
                          isChecked={platform.openshift}
                          onChange={(_e, checked) =>
                            setPlatform((state) => ({ ...state, openshift: checked }))
                          }
                        />
                        <Checkbox
                          id="tenant-cat-platform-kubernetes"
                          label="Kubernetes"
                          isChecked={platform.kubernetes}
                          onChange={(_e, checked) =>
                            setPlatform((state) => ({ ...state, kubernetes: checked }))
                          }
                        />
                      </div>
                    </ExpandableSection>

                    <ExpandableSection
                      toggleText="Use case"
                      isExpanded={useCaseExpanded}
                      onToggle={(_e, expanded) => setUseCaseExpanded(expanded)}
                      isIndented
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 'var(--pf-t--global--spacer--sm)',
                        }}
                      >
                        <Checkbox
                          id="tenant-cat-usecase-production"
                          label="Production"
                          isChecked={useCase.production}
                          onChange={(_e, checked) =>
                            setUseCase((state) => ({ ...state, production: checked }))
                          }
                        />
                        <Checkbox
                          id="tenant-cat-usecase-ai-ml"
                          label="AI / ML"
                          isChecked={useCase.aiMl}
                          onChange={(_e, checked) =>
                            setUseCase((state) => ({ ...state, aiMl: checked }))
                          }
                        />
                        <Checkbox
                          id="tenant-cat-usecase-edge"
                          label="Edge"
                          isChecked={useCase.edge}
                          onChange={(_e, checked) =>
                            setUseCase((state) => ({ ...state, edge: checked }))
                          }
                        />
                        <Checkbox
                          id="tenant-cat-usecase-hpc"
                          label="High performance"
                          isChecked={useCase.highPerformance}
                          onChange={(_e, checked) =>
                            setUseCase((state) => ({ ...state, highPerformance: checked }))
                          }
                        />
                        <Checkbox
                          id="tenant-cat-usecase-analytics"
                          label="Analytics"
                          isChecked={useCase.analytics}
                          onChange={(_e, checked) =>
                            setUseCase((state) => ({ ...state, analytics: checked }))
                          }
                        />
                      </div>
                    </ExpandableSection>
                  </div>
                </SidebarPanel>

                <SidebarContent hasPadding>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--pf-t--global--spacer--md)',
                      minHeight: 0,
                    }}
                  >
                    <SearchInput
                      placeholder="Filter by keyword..."
                      value={search}
                      onChange={(_e, value) => setSearch(value)}
                      onClear={() => setSearch('')}
                      aria-label="Filter cluster catalog by keyword"
                    />
                    <Content
                      component="p"
                      style={{
                        margin: 0,
                        color: 'var(--pf-t--global--text--color--subtle)',
                        fontSize: 'var(--pf-t--global--font--size--body--sm)',
                      }}
                    >
                      {filtered.length} item{filtered.length === 1 ? '' : 's'}
                    </Content>
                    <Gallery hasGutter minWidths={{ default: '260px', md: '280px', lg: '300px' }}>
                      {filtered.map((item) => (
                        <GalleryItem key={item.id}>
                          <div
                            className="tenant-vm-catalog-template-card-wrap"
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedTemplateId(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                setSelectedTemplateId(item.id)
                              }
                            }}
                            aria-labelledby={`cluster-catalog-template-card-title-${item.id}`}
                            aria-label={`View details for cluster template ${item.title}`}
                          >
                            <ClusterTemplateCardPresentation template={item} />
                          </div>
                        </GalleryItem>
                      ))}
                    </Gallery>
                    {filtered.length === 0 && (
                      <Content
                        component="p"
                        style={{
                          textAlign: 'center',
                          padding: 'var(--pf-t--global--spacer--2xl)',
                        }}
                      >
                        No cluster templates match your filters. Try clearing categories or
                        adjusting your keyword.
                      </Content>
                    )}
                  </div>
                </SidebarContent>
              </Sidebar>
            </DrawerContentBody>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}
