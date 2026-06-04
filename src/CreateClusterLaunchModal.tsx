import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'
import { CheckIcon } from '@patternfly/react-icons/dist/esm/icons/check-icon'
import { FilterIcon } from '@patternfly/react-icons/dist/esm/icons/filter-icon'
import {
  Alert,
  AlertVariant,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Checkbox,
  Content,
  Divider,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Dropdown,
  DropdownItem,
  DropdownList,
  Form,
  FormGroup,
  FormHelperText,
  FormSelect,
  FormSelectOption,
  Gallery,
  GalleryItem,
  Label,
  MenuToggle,
  Modal,
  ModalVariant,
  SearchInput,
  TextArea,
  TextInput,
  Title,
  Wizard,
  WizardFooter,
  WizardHeader,
  WizardStep,
} from '@patternfly/react-core'
import {
  clusterEnvironmentLabel,
  clusterTypeLabel,
  type ClusterEnvironment,
  type ClusterLoadBalancerType,
  type ClusterNetworkingMode,
  type ClusterTypeOption,
  type ProvisionClusterFromModalPayload,
} from './dashboardClusterDemo'
import {
  CLUSTER_TEMPLATE_DETAIL_DEFAULTS,
  CLUSTER_USE_CASE_LABEL,
  listOrderedClusterCatalogTemplates,
  type ClusterUseCaseFilterTag,
  type TenantClusterTemplate,
} from './tenantClusterTemplatesDemo'
import {
  ClusterWizardTemplateCardBody,
  ClusterWizardTemplateCardHeader,
} from './TenantClusterTemplatesCatalog'

/** 1-based Wizard startIndex when opening from catalog “Create cluster”. */
const WIZARD_STEP_INDEX_TEMPLATE_FROM_CATALOG = 1

type TemplateWizardFilterValue =
  | 'all'
  | 'platform-openshift'
  | 'platform-kubernetes'
  | 'uc-production'
  | 'uc-ai-ml'
  | 'uc-edge'
  | 'uc-high-performance'
  | 'uc-analytics'

const TEMPLATE_WIZARD_FILTER_OPTIONS: { value: TemplateWizardFilterValue; label: string }[] = [
  { value: 'all', label: 'All templates' },
  { value: 'platform-openshift', label: 'Platform: OpenShift' },
  { value: 'platform-kubernetes', label: 'Platform: Kubernetes' },
  { value: 'uc-production', label: 'Use case: Production' },
  { value: 'uc-ai-ml', label: 'Use case: AI / ML' },
  { value: 'uc-edge', label: 'Use case: Edge' },
  { value: 'uc-high-performance', label: 'Use case: High performance' },
  { value: 'uc-analytics', label: 'Use case: Analytics' },
]

const ENVIRONMENT_OPTIONS: { value: ClusterEnvironment; label: string }[] = [
  { value: 'production', label: 'Production' },
  { value: 'staging', label: 'Staging' },
  { value: 'development', label: 'Development' },
]

const OPENSHIFT_VERSION_LATEST = '4.16.8'

const OPENSHIFT_VERSION_OPTIONS = [
  { value: OPENSHIFT_VERSION_LATEST, label: `${OPENSHIFT_VERSION_LATEST} (Latest)` },
  { value: '4.16.4', label: '4.16.4' },
  { value: '4.15.27', label: '4.15.27' },
  { value: '4.14.32', label: '4.14.32' },
]

const CLUSTER_TYPE_OPTIONS: {
  value: ClusterTypeOption
  label: string
  description: string
  cardId: string
  inputId: string
}[] = [
  {
    value: 'standard',
    label: 'Standard',
    description: 'General purpose workloads',
    cardId: 'create-cluster-type-standard-card',
    inputId: 'create-cluster-type-standard',
  },
  {
    value: 'high-availability',
    label: 'High availability',
    description: 'Multi-zone deployment',
    cardId: 'create-cluster-type-ha-card',
    inputId: 'create-cluster-type-ha',
  },
  {
    value: 'gpu-optimized',
    label: 'GPU Optimized',
    description: 'ML/AI workloads',
    cardId: 'create-cluster-type-gpu-card',
    inputId: 'create-cluster-type-gpu',
  },
]

const INSTANCE_TYPE_OPTIONS = [
  'm5.xlarge — 4 vCPU, 16 GiB',
  'm5.2xlarge — 8 vCPU, 32 GiB',
  'c5.4xlarge — 16 vCPU, 32 GiB',
  'g5.2xlarge — 8 vCPU, 32 GiB, 1 GPU',
]

const NODE_COUNT_OPTIONS = Array.from({ length: 16 }, (_, i) => String(i + 1))

const CLUSTER_ESTIMATED_COST_RANGE = '$210.24 - $700.80/month'

const NETWORKING_MODE_OPTIONS: {
  value: ClusterNetworkingMode
  label: string
  description: string
  cardId: string
  inputId: string
}[] = [
  {
    value: 'vpc',
    label: 'VPC (Private Virtual Network)',
    description: 'Isolated network with full control',
    cardId: 'create-cluster-network-vpc-card',
    inputId: 'create-cluster-network-vpc',
  },
  {
    value: 'public-network',
    label: 'Public Network',
    description: 'Direct internet access (not recommended for production)',
    cardId: 'create-cluster-network-public-card',
    inputId: 'create-cluster-network-public',
  },
  {
    value: 'hybrid',
    label: 'Hybrid',
    description: 'Mix of private and public subnets',
    cardId: 'create-cluster-network-hybrid-card',
    inputId: 'create-cluster-network-hybrid',
  },
]

const LOAD_BALANCER_OPTIONS: { value: ClusterLoadBalancerType; label: string }[] = [
  { value: 'application', label: 'Application load balancer' },
  { value: 'network', label: 'Network load balancer' },
  { value: 'internal', label: 'Internal load balancer' },
]

/** Subtle secondary copy in wizard steps (e.g. template count, field hints). */
const wizardSubtleCaptionStyle = {
  margin: 0,
  color: 'var(--pf-t--global--text--color--subtle)',
  fontSize: 'var(--pf-t--global--font--size--body--sm)',
} as const

const SECURITY_FEATURE_OPTIONS = [
  {
    id: 'rbac',
    checkboxId: 'create-cluster-enable-rbac',
    title: 'Enable RBAC (Recommended)',
    description: 'Role-Based Access Control for fine-grained permissions management',
    checkedKey: 'enableRbac' as const,
  },
  {
    id: 'encryption',
    checkboxId: 'create-cluster-encryption',
    title: 'Enable Encryption at Rest (Recommended)',
    description:
      'Encrypt etcd data and persistent volumes using platform-managed keys',
    checkedKey: 'enableEncryptionAtRest' as const,
  },
] as const

const COMPLIANCE_STANDARD_LABELS = [
  'SOC 2 Compliant',
  'HIPAA Compliant',
  'PCI DSS Compliant',
  'ISO 27001 Compliant',
] as const

const ADDON_FEATURE_OPTIONS = [
  {
    id: 'monitoring',
    checkboxId: 'create-cluster-addon-monitoring',
    title: 'Monitoring & Observability',
    badge: 'Included',
    badgeColor: 'green' as const,
    description: 'Prometheus, Grafana, and custom dashboards for cluster metrics',
    checkedKey: 'addonMonitoring' as const,
  },
  {
    id: 'logging',
    checkboxId: 'create-cluster-addon-logging',
    title: 'Centralized Logging',
    badge: 'Included',
    badgeColor: 'green' as const,
    description: 'ELK stack for log aggregation, search, and analysis',
    checkedKey: 'addonLogging' as const,
  },
  {
    id: 'backups',
    checkboxId: 'create-cluster-addon-backups',
    title: 'Automatic Backups',
    badge: '+$50/month',
    badgeColor: 'blue' as const,
    description: 'Daily automated backups with 30-day retention',
    checkedKey: 'addonBackups' as const,
  },
] as const

const ADDITIONAL_ADDONS_AVAILABLE = [
  'Service Mesh (Istio)',
  'GitOps (ArgoCD/Flux)',
  'Secret Management',
  'Image Scanning',
] as const

const USE_CASE_TAG: Partial<Record<TemplateWizardFilterValue, ClusterUseCaseFilterTag>> = {
  'uc-production': 'production',
  'uc-ai-ml': 'ai-ml',
  'uc-edge': 'edge',
  'uc-high-performance': 'high-performance',
  'uc-analytics': 'analytics',
}

function templateWizardFilterOptionLabel(value: TemplateWizardFilterValue): string {
  if (value === 'all') return ''
  return TEMPLATE_WIZARD_FILTER_OPTIONS.find((o) => o.value === value)?.label ?? ''
}

function templateWizardFilterAriaLabel(value: TemplateWizardFilterValue): string {
  if (value === 'all') return 'Filter cluster templates, no category filter'
  const label = templateWizardFilterOptionLabel(value)
  return label ? `Filter cluster templates, ${label} selected` : 'Filter cluster templates'
}

function templateMatchesWizardFilter(
  t: TenantClusterTemplate,
  f: TemplateWizardFilterValue,
): boolean {
  if (f === 'all') return true
  if (f === 'platform-openshift') return t.platform === 'OpenShift'
  if (f === 'platform-kubernetes') return t.platform === 'Kubernetes'
  const tag = USE_CASE_TAG[f]
  return tag ? t.useCaseFilterTags.includes(tag) : true
}

function templateMatchesWizardSearch(t: TenantClusterTemplate, q: string): boolean {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  const hay = [
    t.title,
    t.subtitle,
    t.project,
    t.platform,
    t.platformVersion,
    t.controlPlane,
    t.workers,
    t.storage,
    t.cardUseCaseDisplay ?? CLUSTER_USE_CASE_LABEL[t.useCase],
    t.cardNetworkDisplay ?? CLUSTER_TEMPLATE_DETAIL_DEFAULTS.network,
  ]
    .join(' ')
    .toLowerCase()
  return hay.includes(needle)
}

function clusterInstancePricingName(instanceType: string): string {
  return instanceType.split(' — ')[0]?.trim() || 'm5.xlarge'
}

function networkingModeLabel(mode: ClusterNetworkingMode): string {
  return NETWORKING_MODE_OPTIONS.find((o) => o.value === mode)?.label ?? mode
}

function loadBalancerLabel(type: ClusterLoadBalancerType): string {
  return LOAD_BALANCER_OPTIONS.find((o) => o.value === type)?.label ?? type
}

type ClusterReviewPillColor = ComponentProps<typeof Label>['color']

function clusterEnvironmentPillColor(env: ClusterEnvironment): ClusterReviewPillColor {
  if (env === 'production') return 'red'
  if (env === 'staging') return 'orange'
  return 'grey'
}

function clusterTypePillColor(type: ClusterTypeOption): ClusterReviewPillColor {
  if (type === 'high-availability') return 'purple'
  if (type === 'gpu-optimized') return 'teal'
  return 'blue'
}

function securityEnabledPillColor(enabled: boolean): ClusterReviewPillColor {
  return enabled ? 'green' : 'grey'
}

function ClusterReviewPill({
  children,
  color = 'blue',
}: {
  children: ReactNode
  color?: ClusterReviewPillColor
}) {
  return (
    <Label
      color={color}
      variant="outline"
      isCompact
      className="create-cluster-review-pill"
    >
      {children}
    </Label>
  )
}

function ClusterReviewPillGroup({ children }: { children: ReactNode }) {
  return <div className="create-cluster-review-pill-group">{children}</div>
}

function ClusterReviewSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="create-cluster-review-section">
      <Title headingLevel="h4" size="lg" className="create-cluster-review-section__title">
        {title}
      </Title>
      <div className="create-cluster-review-section__details">{children}</div>
    </section>
  )
}

export type CreateClusterLaunchHandle = {
  open: () => void
  openFromCatalogTemplate: (templateId: string, initialClusterName: string) => void
}

export type CreateClusterLaunchButtonProps = {
  onProvisionCluster: (payload: ProvisionClusterFromModalPayload) => void
  hideTriggerButton?: boolean
}

const defaultFormState = () => ({
  selectedTemplateId: '',
  clusterName: '',
  description: '',
  environment: 'production' as ClusterEnvironment,
  openshiftVersion: OPENSHIFT_VERSION_LATEST,
  clusterType: 'standard' as ClusterTypeOption,
  nodePoolName: 'default-pool',
  instanceType: INSTANCE_TYPE_OPTIONS[0]!,
  minNodes: '3',
  maxNodes: '6',
  networkingMode: 'vpc' as ClusterNetworkingMode,
  loadBalancerType: 'application' as ClusterLoadBalancerType,
  enableRbac: true,
  enableEncryptionAtRest: true,
  complianceSoc2: true,
  complianceHipaa: true,
  compliancePciDss: true,
  complianceIso27001: true,
  addonMonitoring: true,
  addonLogging: true,
  addonBackups: false,
})

export const CreateClusterLaunchButton = forwardRef<
  CreateClusterLaunchHandle,
  CreateClusterLaunchButtonProps
>(function CreateClusterLaunchButton({ onProvisionCluster, hideTriggerButton = false }, ref) {
  const [open, setOpen] = useState(false)
  const [wizardKey, setWizardKey] = useState(0)
  const [wizardStartIndex, setWizardStartIndex] = useState(1)
  const [templateStepSearch, setTemplateStepSearch] = useState('')
  const [templateStepFilter, setTemplateStepFilter] =
    useState<TemplateWizardFilterValue>('all')
  const [templateFilterMenuOpen, setTemplateFilterMenuOpen] = useState(false)
  const [pinSelectedTemplateFirst, setPinSelectedTemplateFirst] = useState(false)
  const [form, setForm] = useState(defaultFormState)

  const orderedTemplates = useMemo(() => listOrderedClusterCatalogTemplates(), [])

  const filteredWizardTemplates = useMemo(
    () =>
      orderedTemplates.filter(
        (t) =>
          templateMatchesWizardFilter(t, templateStepFilter) &&
          templateMatchesWizardSearch(t, templateStepSearch),
      ),
    [orderedTemplates, templateStepFilter, templateStepSearch],
  )

  const wizardTemplateGalleryOrder = useMemo(() => {
    const list = filteredWizardTemplates
    if (!pinSelectedTemplateFirst) return list
    const sel = form.selectedTemplateId
    if (!sel) return list
    const i = list.findIndex((t) => t.id === sel)
    if (i <= 0) return list
    const rest = [...list]
    const [picked] = rest.splice(i, 1)
    return [picked, ...rest]
  }, [filteredWizardTemplates, form.selectedTemplateId, pinSelectedTemplateFirst])

  const selectedTemplate = useMemo(
    () => orderedTemplates.find((t) => t.id === form.selectedTemplateId),
    [orderedTemplates, form.selectedTemplateId],
  )

  const minNodesNum = Math.max(1, parseInt(form.minNodes, 10) || 1)
  const maxNodesNum = Math.max(minNodesNum, parseInt(form.maxNodes, 10) || minNodesNum)
  const instancePricingName = clusterInstancePricingName(form.instanceType)

  const patchForm = useCallback(
    (patch: Partial<ReturnType<typeof defaultFormState>>) => {
      setForm((prev) => ({ ...prev, ...patch }))
    },
    [],
  )

  const reset = useCallback(() => {
    setForm(defaultFormState())
    setTemplateStepSearch('')
    setTemplateStepFilter('all')
    setTemplateFilterMenuOpen(false)
    setPinSelectedTemplateFirst(false)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
    reset()
    setWizardStartIndex(1)
  }, [reset])

  const handleOpen = useCallback(() => {
    setWizardKey((k) => k + 1)
    setWizardStartIndex(1)
    reset()
    setOpen(true)
  }, [reset])

  const openFromCatalogTemplate = useCallback(
    (templateId: string, initialClusterName: string) => {
      setWizardKey((k) => k + 1)
      setWizardStartIndex(WIZARD_STEP_INDEX_TEMPLATE_FROM_CATALOG)
      reset()
      const tpl = orderedTemplates.find((t) => t.id === templateId)
      setPinSelectedTemplateFirst(true)
      patchForm({
        selectedTemplateId: templateId,
        clusterName: initialClusterName.trim() || templateId,
        openshiftVersion: tpl?.platformVersion ?? OPENSHIFT_VERSION_LATEST,
      })
      setOpen(true)
    },
    [reset, orderedTemplates, patchForm],
  )

  useImperativeHandle(
    ref,
    () => ({
      open: handleOpen,
      openFromCatalogTemplate,
    }),
    [handleOpen, openFromCatalogTemplate],
  )

  const selectWizardTemplate = useCallback((t: TenantClusterTemplate) => {
    setForm((prev) => {
      if (prev.selectedTemplateId !== '' && prev.selectedTemplateId !== t.id) {
        setPinSelectedTemplateFirst(false)
      }
      return {
        ...prev,
        selectedTemplateId: t.id,
        clusterName: prev.clusterName.trim() || t.title.toLowerCase().replace(/\s+/g, '-'),
        openshiftVersion: t.platformVersion,
      }
    })
  }, [])

  useEffect(() => {
    if (!form.selectedTemplateId) return
    if (!filteredWizardTemplates.some((t) => t.id === form.selectedTemplateId)) {
      patchForm({ selectedTemplateId: '' })
    }
  }, [filteredWizardTemplates, form.selectedTemplateId, patchForm])

  const handleProvision = useCallback(() => {
    if (!form.selectedTemplateId || !form.clusterName.trim()) return
    const payload: ProvisionClusterFromModalPayload = {
      templateId: form.selectedTemplateId,
      clusterName: form.clusterName.trim(),
      description: form.description.trim(),
      environment: form.environment,
      openshiftVersion: form.openshiftVersion,
      clusterType: form.clusterType,
      nodePoolName: form.nodePoolName.trim(),
      instanceType: form.instanceType,
      minNodes: minNodesNum,
      maxNodes: maxNodesNum,
      networkingMode: form.networkingMode,
      loadBalancerType: form.loadBalancerType,
      enableRbac: form.enableRbac,
      enableEncryptionAtRest: form.enableEncryptionAtRest,
      complianceSoc2: form.complianceSoc2,
      complianceHipaa: form.complianceHipaa,
      compliancePciDss: form.compliancePciDss,
      complianceIso27001: form.complianceIso27001,
      addonMonitoring: form.addonMonitoring,
      addonLogging: form.addonLogging,
      addonBackups: form.addonBackups,
    }
    onProvisionCluster(payload)
    handleClose()
  }, [form, minNodesNum, maxNodesNum, onProvisionCluster, handleClose])

  const titleId = 'create-cluster-launch-wizard-title'

  const complianceChecked = [...COMPLIANCE_STANDARD_LABELS]
  const selectedAddons = ADDON_FEATURE_OPTIONS.filter((opt) => form[opt.checkedKey])
  const openshiftVersionDisplay =
    OPENSHIFT_VERSION_OPTIONS.find((o) => o.value === form.openshiftVersion)?.label ??
    form.openshiftVersion
  const isLatestOpenShiftVersion = form.openshiftVersion === OPENSHIFT_VERSION_LATEST

  return (
    <>
      {hideTriggerButton ? null : (
        <Button variant="primary" onClick={handleOpen} aria-label="Create cluster">
          Create cluster
        </Button>
      )}
      <Modal
        className="osac-create-vm-launch-modal"
        variant={ModalVariant.large}
        isOpen={open}
        onClose={handleClose}
        aria-labelledby={titleId}
        ouiaId="create-cluster-launch-modal"
      >
        <Wizard
          key={wizardKey}
          startIndex={wizardStartIndex}
          className="osac-create-vm-modal-wizard"
          height="min(46rem, calc(100dvh - 6rem))"
          width="100%"
          onClose={handleClose}
          onSave={handleProvision}
          header={
            <WizardHeader
              title="Create cluster"
              titleId={titleId}
              onClose={handleClose}
              closeButtonAriaLabel="Close"
            />
          }
          footer={(activeStep, onNext, onBack, onCloseFooter) => {
            const id = activeStep?.id
            const nextDisabled =
              (id === 'template' && !form.selectedTemplateId) ||
              (id === 'basic-info' && !form.clusterName.trim()) ||
              (id === 'compute' && !form.nodePoolName.trim())

            return (
              <WizardFooter
                activeStep={activeStep}
                onNext={onNext}
                onBack={onBack}
                onClose={onCloseFooter}
                nextButtonText={id === 'review' ? 'Create cluster' : 'Next'}
                isBackDisabled={id === 'template'}
                isNextDisabled={nextDisabled}
              />
            )
          }}
        >
          <WizardStep id="template" name="Template">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--pf-t--global--spacer--md)',
                minHeight: 0,
              }}
            >
              <div>
                <Title headingLevel="h3">Select a template</Title>
                <Content
                  component="p"
                  style={{
                    marginTop: 'var(--pf-t--global--spacer--xs)',
                    marginBottom: 0,
                    color: 'var(--pf-t--global--text--color--subtle)',
                  }}
                >
                  Select a template that best fits your workload requirements
                </Content>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 'var(--pf-t--global--spacer--md)',
                }}
              >
                <Dropdown
                  className="osac-create-vm-wizard-template-filter-menu"
                  isOpen={templateFilterMenuOpen}
                  onOpenChange={setTemplateFilterMenuOpen}
                  onSelect={() => setTemplateFilterMenuOpen(false)}
                  popperProps={{ placement: 'bottom-start' }}
                  toggle={(toggleRef) => {
                    const filterDetail = templateWizardFilterOptionLabel(templateStepFilter)
                    return (
                      <MenuToggle
                        ref={toggleRef}
                        id="create-cluster-wizard-template-filter"
                        className="osac-create-vm-wizard-template-filter-toggle"
                        icon={<FilterIcon />}
                        isExpanded={templateFilterMenuOpen}
                        onClick={() => setTemplateFilterMenuOpen((o) => !o)}
                        aria-label={templateWizardFilterAriaLabel(templateStepFilter)}
                        style={{ minWidth: '12rem' }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            flexWrap: 'wrap',
                            alignItems: 'baseline',
                            gap: 'var(--pf-t--global--spacer--xs)',
                            minWidth: 0,
                          }}
                        >
                          <span>Filter</span>
                          {filterDetail ? (
                            <>
                              <span
                                style={{
                                  color: 'var(--pf-t--global--text--color--subtle)',
                                  flexShrink: 0,
                                }}
                                aria-hidden
                              >
                                ·
                              </span>
                              <span style={{ minWidth: 0, textAlign: 'start' }}>
                                {filterDetail}
                              </span>
                            </>
                          ) : null}
                        </span>
                      </MenuToggle>
                    )
                  }}
                >
                  <DropdownList>
                    {TEMPLATE_WIZARD_FILTER_OPTIONS.map((opt) => (
                      <DropdownItem
                        key={opt.value}
                        isSelected={templateStepFilter === opt.value}
                        onClick={() => {
                          setTemplateStepFilter(opt.value)
                          setTemplateFilterMenuOpen(false)
                        }}
                      >
                        {opt.label}
                      </DropdownItem>
                    ))}
                  </DropdownList>
                </Dropdown>
                <div style={{ flex: '2 1 16rem', minWidth: '14rem' }}>
                  <SearchInput
                    placeholder="Search templates..."
                    value={templateStepSearch}
                    onChange={(_e, v) => setTemplateStepSearch(v)}
                    onClear={() => setTemplateStepSearch('')}
                    aria-label="Search cluster templates by keyword"
                  />
                </div>
              </div>
              <Content component="p" style={wizardSubtleCaptionStyle}>
                {filteredWizardTemplates.length} template
                {filteredWizardTemplates.length === 1 ? '' : 's'} · Select one to continue
              </Content>
              <div
                style={{
                  maxHeight: 'min(22rem, 50dvh)',
                  overflowY: 'auto',
                  paddingInlineEnd: 'var(--pf-t--global--spacer--xs)',
                }}
              >
                <Gallery hasGutter minWidths={{ default: '260px', md: '280px', lg: '300px' }}>
                  {wizardTemplateGalleryOrder.map((item) => (
                    <GalleryItem key={item.id}>
                      <Card
                        id={`create-cluster-wizard-tpl-${item.id}`}
                        isFullHeight
                        component="article"
                        isSelectable
                        isSelected={form.selectedTemplateId === item.id}
                      >
                        <CardHeader
                          selectableActions={{
                            variant: 'single',
                            name: 'create-cluster-wizard-template',
                            selectableActionId: `wizard-cluster-tpl-${item.id}`,
                            selectableActionAriaLabelledby: `create-cluster-wizard-template-card-title-${item.id}`,
                            onChange: (_, checked) => {
                              if (checked) selectWizardTemplate(item)
                            },
                          }}
                        >
                          <ClusterWizardTemplateCardHeader
                            template={item}
                            titleIdPrefix="create-cluster-wizard-template-card-title"
                          />
                        </CardHeader>
                        <CardBody
                          style={{
                            paddingTop: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--pf-t--global--spacer--md)',
                          }}
                        >
                          <ClusterWizardTemplateCardBody template={item} />
                        </CardBody>
                      </Card>
                    </GalleryItem>
                  ))}
                </Gallery>
                {filteredWizardTemplates.length === 0 && (
                  <Content
                    component="p"
                    style={{
                      textAlign: 'center',
                      padding: 'var(--pf-t--global--spacer--2xl)',
                    }}
                  >
                    No cluster templates match your filters. Try another filter or search keyword.
                  </Content>
                )}
              </div>
            </div>
          </WizardStep>

          <WizardStep id="basic-info" name="Basic info">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--pf-t--global--spacer--md)',
              }}
            >
              <Title headingLevel="h3">Basic Information</Title>
              <Form>
                <FormGroup label="Cluster name" isRequired fieldId="create-cluster-name">
                  <TextInput
                    id="create-cluster-name"
                    value={form.clusterName}
                    onChange={(_e, v) => patchForm({ clusterName: v })}
                    aria-label="Cluster name"
                    aria-describedby="create-cluster-name-helper"
                  />
                  <FormHelperText
                    id="create-cluster-name-helper"
                    style={{
                      color: wizardSubtleCaptionStyle.color,
                      fontSize: wizardSubtleCaptionStyle.fontSize,
                    }}
                  >
                    Must be unique within your organization
                  </FormHelperText>
                </FormGroup>
                <FormGroup label="Description" fieldId="create-cluster-description">
                  <TextArea
                    id="create-cluster-description"
                    value={form.description}
                    onChange={(_e, v) => patchForm({ description: v })}
                    aria-label="Cluster description"
                    resizeOrientation="vertical"
                  />
                </FormGroup>
                <FormGroup
                  label="Environment"
                  isRequired
                  fieldId="create-cluster-environment"
                >
                  <FormSelect
                    id="create-cluster-environment"
                    value={form.environment}
                    onChange={(_e, v) =>
                      patchForm({ environment: v as ClusterEnvironment })
                    }
                    aria-label="Environment"
                  >
                    {ENVIRONMENT_OPTIONS.map((opt) => (
                      <FormSelectOption key={opt.value} value={opt.value} label={opt.label} />
                    ))}
                  </FormSelect>
                </FormGroup>
              </Form>
            </div>
          </WizardStep>

          <WizardStep id="configuration" name="Configuration">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--pf-t--global--spacer--md)',
              }}
            >
              <Title headingLevel="h3">Cluster Configuration</Title>
              <Form>
                <FormGroup label="OpenShift version" fieldId="create-cluster-ocp-version">
                  <FormSelect
                    id="create-cluster-ocp-version"
                    value={form.openshiftVersion}
                    onChange={(_e, v) => patchForm({ openshiftVersion: v })}
                    aria-label="OpenShift version"
                    aria-describedby="create-cluster-ocp-version-helper"
                  >
                    {OPENSHIFT_VERSION_OPTIONS.map((opt) => (
                      <FormSelectOption key={opt.value} value={opt.value} label={opt.label} />
                    ))}
                  </FormSelect>
                  <FormHelperText
                    id="create-cluster-ocp-version-helper"
                    style={{
                      color: wizardSubtleCaptionStyle.color,
                      fontSize: wizardSubtleCaptionStyle.fontSize,
                    }}
                  >
                    Recommended: Use the latest stable version
                  </FormHelperText>
                </FormGroup>
                <FormGroup label="Cluster type" fieldId="create-cluster-type-group">
                  <div
                    className="osac-create-vm-launch-modal__option-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      columnGap: 'var(--pf-t--global--spacer--md)',
                      rowGap: 'var(--pf-t--global--spacer--md)',
                      width: '100%',
                    }}
                  >
                    {CLUSTER_TYPE_OPTIONS.map((opt) => (
                      <div key={opt.value} style={{ minWidth: 0 }}>
                        <Card
                          id={opt.cardId}
                          isFullHeight
                          isSelectable
                          isSelected={form.clusterType === opt.value}
                        >
                          <CardHeader
                            selectableActions={{
                              variant: 'single',
                              name: 'create-cluster-type',
                              selectableActionId: opt.inputId,
                              selectableActionAriaLabel: `Select ${opt.label}, ${opt.description}`,
                              onChange: (_, checked) => {
                                if (checked) patchForm({ clusterType: opt.value })
                              },
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--pf-t--global--spacer--sm)',
                                width: '100%',
                                minWidth: 0,
                              }}
                            >
                              <CardTitle
                                style={{
                                  fontSize: 'var(--pf-t--global--font--size--body--lg)',
                                  margin: 0,
                                }}
                              >
                                {opt.label}
                              </CardTitle>
                              <Content
                                component="p"
                                style={{
                                  margin: 0,
                                  color: 'var(--pf-t--global--text--color--subtle)',
                                  fontSize: 'var(--pf-t--global--font--size--body--sm)',
                                }}
                              >
                                {opt.description}
                              </Content>
                            </div>
                          </CardHeader>
                        </Card>
                      </div>
                    ))}
                  </div>
                </FormGroup>
              </Form>
            </div>
          </WizardStep>

          <WizardStep id="compute" name="Compute">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--pf-t--global--spacer--md)',
              }}
            >
              <Title headingLevel="h3">Compute</Title>
              <Form>
                <FormGroup label="Node pool name" isRequired fieldId="create-cluster-node-pool">
                  <TextInput
                    id="create-cluster-node-pool"
                    value={form.nodePoolName}
                    onChange={(_e, v) => patchForm({ nodePoolName: v })}
                    aria-label="Node pool name"
                  />
                </FormGroup>
                <FormGroup
                  label="Instance type"
                  isRequired
                  fieldId="create-cluster-instance-type"
                >
                  <FormSelect
                    id="create-cluster-instance-type"
                    value={form.instanceType}
                    onChange={(_e, v) => patchForm({ instanceType: v })}
                    aria-label="Instance type"
                  >
                    {INSTANCE_TYPE_OPTIONS.map((opt) => (
                      <FormSelectOption key={opt} value={opt} label={opt} />
                    ))}
                  </FormSelect>
                </FormGroup>
                <FormGroup label="Auto scaling configuration" fieldId="create-cluster-autoscale">
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: 'var(--pf-t--global--spacer--md)',
                    }}
                  >
                    <FormGroup label="Minimum nodes" fieldId="create-cluster-min-nodes">
                      <FormSelect
                        id="create-cluster-min-nodes"
                        value={form.minNodes}
                        onChange={(_e, v) => {
                          const maxNum = parseInt(form.maxNodes, 10)
                          const minNum = parseInt(v, 10)
                          patchForm({
                            minNodes: v,
                            ...(Number.isFinite(maxNum) && maxNum < minNum
                              ? { maxNodes: v }
                              : {}),
                          })
                        }}
                        aria-label="Minimum nodes"
                      >
                        {NODE_COUNT_OPTIONS.map((n) => (
                          <FormSelectOption key={`min-${n}`} value={n} label={n} />
                        ))}
                      </FormSelect>
                    </FormGroup>
                    <FormGroup label="Maximum nodes" fieldId="create-cluster-max-nodes">
                      <FormSelect
                        id="create-cluster-max-nodes"
                        value={form.maxNodes}
                        onChange={(_e, v) => patchForm({ maxNodes: v })}
                        aria-label="Maximum nodes"
                      >
                        {NODE_COUNT_OPTIONS.filter(
                          (n) => parseInt(n, 10) >= minNodesNum,
                        ).map((n) => (
                          <FormSelectOption key={`max-${n}`} value={n} label={n} />
                        ))}
                      </FormSelect>
                    </FormGroup>
                  </div>
                </FormGroup>
                <FormGroup fieldId="create-cluster-estimated-cost">
                  <Alert
                    isInline
                    variant={AlertVariant.info}
                    title="Estimated Cost"
                    className="create-cluster-wizard-cost-alert"
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--pf-t--global--spacer--xs)',
                      }}
                    >
                      <span className="create-cluster-wizard-cost-alert__range">
                        {CLUSTER_ESTIMATED_COST_RANGE}
                      </span>
                      <span className="create-cluster-wizard-cost-alert__basis">
                        Based on {instancePricingName} pricing
                      </span>
                    </div>
                  </Alert>
                </FormGroup>
              </Form>
            </div>
          </WizardStep>

          <WizardStep id="networking" name="Networking">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--pf-t--global--spacer--md)',
              }}
            >
              <Title headingLevel="h3">Networking</Title>
              <Form>
                <FormGroup
                  label="Networking mode"
                  isRequired
                  fieldId="create-cluster-networking-mode"
                >
                  <div
                    className="osac-create-vm-launch-modal__option-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      columnGap: 'var(--pf-t--global--spacer--md)',
                      rowGap: 'var(--pf-t--global--spacer--md)',
                      width: '100%',
                    }}
                  >
                    {NETWORKING_MODE_OPTIONS.map((opt) => (
                      <div key={opt.value} style={{ minWidth: 0 }}>
                        <Card
                          id={opt.cardId}
                          isFullHeight
                          isSelectable
                          isSelected={form.networkingMode === opt.value}
                        >
                          <CardHeader
                            selectableActions={{
                              variant: 'single',
                              name: 'create-cluster-networking-mode',
                              selectableActionId: opt.inputId,
                              selectableActionAriaLabel: `Select ${opt.label}, ${opt.description}`,
                              onChange: (_, checked) => {
                                if (checked) patchForm({ networkingMode: opt.value })
                              },
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--pf-t--global--spacer--sm)',
                                width: '100%',
                                minWidth: 0,
                              }}
                            >
                              <CardTitle
                                style={{
                                  fontSize: 'var(--pf-t--global--font--size--body--lg)',
                                  margin: 0,
                                }}
                              >
                                {opt.label}
                              </CardTitle>
                              <Content
                                component="p"
                                style={{
                                  margin: 0,
                                  color: 'var(--pf-t--global--text--color--subtle)',
                                  fontSize: 'var(--pf-t--global--font--size--body--sm)',
                                }}
                              >
                                {opt.description}
                              </Content>
                            </div>
                          </CardHeader>
                        </Card>
                      </div>
                    ))}
                  </div>
                </FormGroup>
                <FormGroup label="Load balancer type" fieldId="create-cluster-lb-type">
                  <FormSelect
                    id="create-cluster-lb-type"
                    value={form.loadBalancerType}
                    onChange={(_e, v) =>
                      patchForm({ loadBalancerType: v as ClusterLoadBalancerType })
                    }
                    aria-label="Load balancer type"
                  >
                    {LOAD_BALANCER_OPTIONS.map((opt) => (
                      <FormSelectOption key={opt.value} value={opt.value} label={opt.label} />
                    ))}
                  </FormSelect>
                </FormGroup>
              </Form>
            </div>
          </WizardStep>

          <WizardStep id="security" name="Security">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--pf-t--global--spacer--md)',
              }}
            >
              <Title headingLevel="h3">Security &amp; Access control</Title>
              <Form>
                <FormGroup fieldId="create-cluster-security-controls">
                  <div className="create-cluster-security-feature-stack">
                    {SECURITY_FEATURE_OPTIONS.map((opt) => (
                      <Card
                        key={opt.id}
                        isFullHeight
                        className="create-cluster-security-feature-card"
                      >
                        <CardBody>
                          <Checkbox
                            id={opt.checkboxId}
                            isChecked={form[opt.checkedKey]}
                            onChange={(_e, checked) => patchForm({ [opt.checkedKey]: checked })}
                            label={
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
                                    fontSize:
                                      'var(--pf-t--global--font--size--body--default)',
                                    fontWeight:
                                      'var(--pf-t--global--font--weight--body--default)',
                                    color: 'var(--pf-t--global--text--color--regular)',
                                  }}
                                >
                                  {opt.title}
                                </span>
                                <span
                                  style={{
                                    fontSize:
                                      'var(--pf-t--global--font--size--body--sm)',
                                    color: 'var(--pf-t--global--text--color--subtle)',
                                  }}
                                >
                                  {opt.description}
                                </span>
                              </div>
                            }
                          />
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </FormGroup>
                <FormGroup label="Compliance standards" fieldId="create-cluster-compliance">
                  <div className="create-cluster-compliance-grid">
                    {COMPLIANCE_STANDARD_LABELS.map((label) => (
                      <Card
                        key={label}
                        component="article"
                        className="create-cluster-compliance-standard-card"
                      >
                        <CardBody className="create-cluster-compliance-standard-card__body">
                          <div className="create-cluster-compliance-standard-card__content">
                            <span
                              className="create-cluster-compliance-standard-card__icon-wrap"
                              aria-hidden
                            >
                              <CheckIcon className="create-cluster-compliance-standard-card__icon" />
                            </span>
                            <span className="create-cluster-compliance-standard-card__label">
                              {label}
                            </span>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </FormGroup>
              </Form>
            </div>
          </WizardStep>

          <WizardStep id="addons" name="Add-ons & Features">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--pf-t--global--spacer--md)',
              }}
            >
              <Title headingLevel="h3">Add-ons & Features</Title>
              <Form>
                <FormGroup fieldId="create-cluster-addons">
                  <div className="create-cluster-security-feature-stack">
                    {ADDON_FEATURE_OPTIONS.map((opt) => (
                      <Card
                        key={opt.id}
                        isFullHeight
                        className="create-cluster-security-feature-card create-cluster-addon-feature-card"
                      >
                        <CardBody>
                          <Checkbox
                            id={opt.checkboxId}
                            isChecked={form[opt.checkedKey]}
                            onChange={(_e, checked) => patchForm({ [opt.checkedKey]: checked })}
                            label={
                              <div className="create-cluster-addon-feature-label">
                                <div className="create-cluster-addon-feature-header">
                                  <span
                                    style={{
                                      fontSize:
                                        'var(--pf-t--global--font--size--body--default)',
                                      fontWeight:
                                        'var(--pf-t--global--font--weight--body--default)',
                                      color: 'var(--pf-t--global--text--color--regular)',
                                    }}
                                  >
                                    {opt.title}
                                  </span>
                                  <Label
                                    color={opt.badgeColor}
                                    isCompact
                                    className="create-cluster-addon-feature-badge"
                                  >
                                    {opt.badge}
                                  </Label>
                                </div>
                                <span className="create-cluster-addon-feature-description">
                                  {opt.description}
                                </span>
                              </div>
                            }
                          />
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </FormGroup>
                <FormGroup fieldId="create-cluster-addons-info">
                  <Alert
                    isInline
                    variant={AlertVariant.info}
                    title="Additional add-ons (can be enabled post-create):"
                    className="create-cluster-wizard-cost-alert"
                  >
                    <ul className="create-cluster-addons-info-list">
                      {ADDITIONAL_ADDONS_AVAILABLE.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </Alert>
                </FormGroup>
              </Form>
            </div>
          </WizardStep>

          <WizardStep id="review" name="Review">
            <div className="create-cluster-review">
              <div className="create-cluster-review-header">
                <Title headingLevel="h3" className="create-cluster-review-header__title">
                  Review
                </Title>
                <Content component="p" className="create-cluster-review-header__subtitle">
                  Confirm your choices, then create the cluster.
                </Content>
              </div>

              <Alert
                isInline
                variant={AlertVariant.info}
                title="Estimated monthly cost"
                className="create-cluster-review-cost-summary"
              >
                <div className="create-cluster-review-cost-summary__body">
                  <span className="create-cluster-review-cost-summary__amount">
                    {CLUSTER_ESTIMATED_COST_RANGE}
                  </span>
                  <span className="create-cluster-review-cost-summary__basis">
                    Based on {instancePricingName} pricing
                  </span>
                </div>
              </Alert>

              <Divider component="div" className="create-cluster-review-sections-divider" />

              <div className="create-cluster-review-sections">
                <ClusterReviewSection title="Template">
                  <DescriptionList isCompact>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Template</DescriptionListTerm>
                      <DescriptionListDescription>
                        {selectedTemplate?.title ? (
                          <ClusterReviewPill color="blue">
                            {selectedTemplate.title}
                          </ClusterReviewPill>
                        ) : (
                          '—'
                        )}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </ClusterReviewSection>

                <Divider component="div" />

                <ClusterReviewSection title="Basic info">
                  <DescriptionList isCompact>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Cluster name</DescriptionListTerm>
                      <DescriptionListDescription>
                        {form.clusterName.trim() ? (
                          <span className="create-cluster-review-value-emphasis">
                            {form.clusterName.trim()}
                          </span>
                        ) : (
                          '—'
                        )}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Description</DescriptionListTerm>
                      <DescriptionListDescription>
                        {form.description.trim() || '(none)'}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Environment</DescriptionListTerm>
                      <DescriptionListDescription>
                        <ClusterReviewPill color={clusterEnvironmentPillColor(form.environment)}>
                          {clusterEnvironmentLabel(form.environment)}
                        </ClusterReviewPill>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </ClusterReviewSection>

                <Divider component="div" />

                <ClusterReviewSection title="Cluster Configuration">
                  <DescriptionList isCompact>
                    <DescriptionListGroup>
                      <DescriptionListTerm>OpenShift version</DescriptionListTerm>
                      <DescriptionListDescription>
                        <ClusterReviewPillGroup>
                          <ClusterReviewPill color="blue">{openshiftVersionDisplay}</ClusterReviewPill>
                          {isLatestOpenShiftVersion ? (
                            <ClusterReviewPill color="green">Latest</ClusterReviewPill>
                          ) : null}
                        </ClusterReviewPillGroup>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Cluster type</DescriptionListTerm>
                      <DescriptionListDescription>
                        <ClusterReviewPill color={clusterTypePillColor(form.clusterType)}>
                          {clusterTypeLabel(form.clusterType)}
                        </ClusterReviewPill>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </ClusterReviewSection>

                <Divider component="div" />

                <ClusterReviewSection title="Compute">
                  <DescriptionList isCompact>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Node pool</DescriptionListTerm>
                      <DescriptionListDescription>
                        {form.nodePoolName.trim() || '—'}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Instance type</DescriptionListTerm>
                      <DescriptionListDescription>
                        <ClusterReviewPill color="grey">{form.instanceType}</ClusterReviewPill>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Auto scaling</DescriptionListTerm>
                      <DescriptionListDescription>
                        <ClusterReviewPill color="teal">
                          {minNodesNum}–{maxNodesNum} nodes
                        </ClusterReviewPill>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </ClusterReviewSection>

                <Divider component="div" />

                <ClusterReviewSection title="Networking">
                  <DescriptionList isCompact>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Networking mode</DescriptionListTerm>
                      <DescriptionListDescription>
                        <ClusterReviewPill color="blue">
                          {networkingModeLabel(form.networkingMode)}
                        </ClusterReviewPill>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Load balancer type</DescriptionListTerm>
                      <DescriptionListDescription>
                        <ClusterReviewPill color="grey">
                          {loadBalancerLabel(form.loadBalancerType)}
                        </ClusterReviewPill>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </ClusterReviewSection>

                <Divider component="div" />

                <ClusterReviewSection title="Security & Access control">
                  <DescriptionList isCompact>
                    <DescriptionListGroup>
                      <DescriptionListTerm>RBAC</DescriptionListTerm>
                      <DescriptionListDescription>
                        <ClusterReviewPill color={securityEnabledPillColor(form.enableRbac)}>
                          {form.enableRbac ? 'Enabled' : 'Disabled'}
                        </ClusterReviewPill>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Encryption at rest</DescriptionListTerm>
                      <DescriptionListDescription>
                        <ClusterReviewPill
                          color={securityEnabledPillColor(form.enableEncryptionAtRest)}
                        >
                          {form.enableEncryptionAtRest ? 'Enabled' : 'Disabled'}
                        </ClusterReviewPill>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Compliance standards</DescriptionListTerm>
                      <DescriptionListDescription>
                        {complianceChecked.length > 0 ? (
                          <ClusterReviewPillGroup>
                            {complianceChecked.map((label) => (
                              <ClusterReviewPill key={label} color="green">
                                {label}
                              </ClusterReviewPill>
                            ))}
                          </ClusterReviewPillGroup>
                        ) : (
                          '(none)'
                        )}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </ClusterReviewSection>

                <Divider component="div" />

                <ClusterReviewSection title="Add-ons & Features">
                  <DescriptionList isCompact>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Selected add-ons</DescriptionListTerm>
                      <DescriptionListDescription>
                        {selectedAddons.length > 0 ? (
                          <ClusterReviewPillGroup>
                            {selectedAddons.map((opt) => (
                              <ClusterReviewPill key={opt.id} color={opt.badgeColor}>
                                {opt.title}
                                {opt.badge.startsWith('+') ? ` · ${opt.badge}` : ''}
                              </ClusterReviewPill>
                            ))}
                          </ClusterReviewPillGroup>
                        ) : (
                          '(none)'
                        )}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </ClusterReviewSection>
              </div>
            </div>
          </WizardStep>
        </Wizard>
      </Modal>
    </>
  )
})

CreateClusterLaunchButton.displayName = 'CreateClusterLaunchButton'
