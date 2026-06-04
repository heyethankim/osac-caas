import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { BarsIcon } from '@patternfly/react-icons/dist/esm/icons/bars-icon'
import { BellIcon } from '@patternfly/react-icons/dist/esm/icons/bell-icon'
import { CogIcon } from '@patternfly/react-icons/dist/esm/icons/cog-icon'
import { MoonIcon } from '@patternfly/react-icons/dist/esm/icons/moon-icon'
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon'
import { SunIcon } from '@patternfly/react-icons/dist/esm/icons/sun-icon'
import { UserIcon } from '@patternfly/react-icons/dist/esm/icons/user-icon'
import { NorthstarBankMastheadLogo } from './NorthstarBankMastheadLogo'
import { EvergreenFinancialGroupMastheadLogo } from './EvergreenFinancialGroupMastheadLogo'
import { VertexaCloudMastheadLogo } from './VertexaCloudMastheadLogo'
import { VertexaCloudLoginPage } from './VertexaCloudLoginPage'
import {
  type BankTenantUserEntry,
  type DemoShellRole,
  type DemoTenantId,
  DEMO_TENANT_LABEL,
  demoAccountDisplayName,
  demoLoginEmailForRole,
  demoMastheadAccountControlKey,
  DEMO_VM_POWER_COUNTS,
  demoVmPowerTotal,
} from './demoTenant'
import { DemoTenantLandingPage } from './DemoTenantLandingPage'
import {
  readInitialSessionFromLandingEntry,
  stripOsacLandingEntryParamsFromUrl,
} from './osacLandingEntry'
import { EvergreenFinancialGroupLoginPage } from './EvergreenFinancialGroupLoginPage'
import {
  CreateClusterLaunchButton,
  type CreateClusterLaunchHandle,
} from './CreateClusterLaunchModal'
import {
  CreateVirtualMachineLaunchButton,
  type CreateVirtualMachineLaunchHandle,
} from './CreateVirtualMachineLaunchModal'
import { TenantVmTemplatesCatalog, getTenantVmTemplateById } from './TenantVmTemplatesCatalog'
import { TenantClusterTemplatesCatalog } from './TenantClusterTemplatesCatalog'
import { TenantClustersPage } from './TenantClustersPage'
import {
  TenantVirtualMachinesPage,
  buildTenantVirtualMachineFromCatalogTemplate,
  buildTenantVirtualMachinesForTenant,
  buildTenantVmFromModalNewPayload,
  type ProvisionNewVmFromModalPayload,
  type TenantOs,
  type TenantVirtualMachine,
  type VmPowerState,
} from './TenantVirtualMachinesPage'
import type { ClusterProvisioningNoticeState } from './ClusterProvisioningNoticeAlert'
import { TenantUserDashboardClusterSection } from './TenantUserDashboardClusterSection'
import {
  buildTenantClusterFromModalPayload,
  type ClusterStatus,
  type ProvisionClusterFromModalPayload,
  type TenantCluster,
} from './dashboardClusterDemo'
import { ProviderAdminInfrastructurePage } from './ProviderAdminInfrastructurePage'
import { ProviderAdminSecurityCompliancePage } from './ProviderAdminSecurityCompliancePage'
import { ProviderAdminPlatformSettingsPage } from './ProviderAdminPlatformSettingsPage'
import { NorthstarBankLoginPage } from './NorthstarBankLoginPage'
import { VmConsoleDemoPage } from './VmConsoleDemoPage'
import { DashboardVmUtilizationSection } from './DashboardVmUtilizationSection'
import { RecentActivitiesPage } from './RecentActivitiesPage'
import { DashboardVmQuotaSection } from './DashboardVmQuotaSection'
import { TenantAdminNetworksPage } from './TenantAdminNetworksPage'
import { TenantAdminStoragePage } from './TenantAdminStoragePage'
import { TenantAdminProjectsPage } from './TenantAdminProjectsPage'
import { TenantAdminQuotaControlPage } from './TenantAdminQuotaControlPage'
import { TenantAdminUserManagementPage } from './TenantAdminUserManagementPage'
import {
  TenantAdminDashboardPage,
  type TenantAdminDashboardNavTarget,
} from './TenantAdminDashboardPage'
import { TenantAdminOrganizationSettingsPage } from './TenantAdminOrganizationSettingsPage'
import { TenantAdminSecurityCompliancePage } from './TenantAdminSecurityCompliancePage'
import {
  ProviderAdminDashboardPage,
  type ProviderAdminDashboardNavTarget,
} from './ProviderAdminDashboardPage'
import { ProviderAdminTenantOrganizationsPage } from './ProviderAdminTenantOrganizationsPage'
import { ProviderAdminUserManagementPage } from './ProviderAdminUserManagementPage'
import { ProviderAdminResourceAllocationPage } from './ProviderAdminResourceAllocationPage'
import { ProviderOnboardTenantModal } from './ProviderOnboardTenantModal'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  Dropdown,
  DropdownItem,
  DropdownList,
  Breadcrumb,
  BreadcrumbItem,
  Label,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadLogo,
  MastheadMain,
  MastheadToggle,
  MenuToggle,
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  Page,
  PageSection,
  PageSidebar,
  PageSidebarBody,
  PageToggleButton,
  SearchInput,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core'

type ShellNavRow =
  | { kind: 'link'; id: string; label: string }
  | {
      kind: 'expand'
      label: string
      groupId: string
      children: { id: string; label: string }[]
    }

const clustersGroupId = 'nav-clusters'
const virtualMachinesGroupId = 'nav-virtual-machines'
const myClustersNavItemId = 'clusters-my-clusters'
const clusterTemplatesNavItemId = 'clusters-templates'

const shellNavRows: ShellNavRow[] = [
  { kind: 'link', id: 'dashboard', label: 'Dashboard' },
  {
    kind: 'expand',
    label: 'Clusters',
    groupId: clustersGroupId,
    children: [
      { id: myClustersNavItemId, label: 'My clusters' },
      { id: clusterTemplatesNavItemId, label: 'Cluster templates' },
    ],
  },
  {
    kind: 'expand',
    label: 'Virtual machines',
    groupId: virtualMachinesGroupId,
    children: [
      { id: 'compute-vms', label: 'My VMs' },
      { id: 'catalog', label: 'VM templates' },
    ],
  },
]

const catalogNavItemId = 'catalog'
const dashboardNavItemId = 'dashboard'
const virtualMachinesNavItemId = 'compute-vms'
const adminDashboardNavId = 'admin-dashboard'
const adminManagementGroupId = 'nav-tenant-admin-management'
const adminInfraGroupId = 'nav-tenant-admin-infrastructure'
const adminOrgGroupId = 'nav-tenant-admin-organization'
const adminMgmtProjectsNavId = 'admin-mgmt-projects'
const adminMgmtUsersNavId = 'admin-mgmt-users'
const adminMgmtQuotaNavId = 'admin-mgmt-quota'
const adminMgmtTemplatesNavId = 'admin-mgmt-templates'
const adminInfraNetworksNavId = 'admin-infra-networks'
const adminInfraStorageNavId = 'admin-infra-storage'
const adminOrgSettingsNavId = 'admin-org-settings'
const adminOrgSecurityNavId = 'admin-org-security'

const tenantAdminNavRows: ShellNavRow[] = [
  { kind: 'link', id: adminDashboardNavId, label: 'Dashboard' },
  {
    kind: 'expand',
    label: 'Project management',
    groupId: adminManagementGroupId,
    children: [
      { id: adminMgmtProjectsNavId, label: 'Projects' },
      { id: adminMgmtQuotaNavId, label: 'Quota control' },
      { id: adminMgmtUsersNavId, label: 'Users' },
    ],
  },
  {
    kind: 'expand',
    label: 'Infrastructure',
    groupId: adminInfraGroupId,
    children: [
      { id: adminMgmtTemplatesNavId, label: 'VM templates' },
      { id: adminInfraNetworksNavId, label: 'Networks' },
      { id: adminInfraStorageNavId, label: 'Storage' },
    ],
  },
  {
    kind: 'expand',
    label: 'Organization',
    groupId: adminOrgGroupId,
    children: [
      { id: adminOrgSettingsNavId, label: 'Organization settings' },
      { id: adminOrgSecurityNavId, label: 'Security & Compliance' },
    ],
  },
]

const providerDashboardNavId = 'provider-dashboard'
const providerManagementGroupId = 'nav-provider-management'
const providerSystemGroupId = 'nav-provider-system'
const providerMgmtTenantsNavId = 'provider-mgmt-tenant-orgs'
const providerMgmtUsersNavId = 'provider-mgmt-users'
const providerMgmtAllocNavId = 'provider-mgmt-resource-allocation'
const providerMgmtGlobalTemplatesNavId = 'provider-mgmt-global-templates'
const providerSystemInfraNavId = 'provider-system-infrastructure'
const providerSystemSecurityNavId = 'provider-system-security-compliance'
const providerSystemSettingsNavId = 'provider-system-platform-settings'

const providerAdminNavRows: ShellNavRow[] = [
  { kind: 'link', id: providerDashboardNavId, label: 'Dashboard' },
  {
    kind: 'expand',
    label: 'Management',
    groupId: providerManagementGroupId,
    children: [
      { id: providerMgmtTenantsNavId, label: 'Tenant organizations' },
      { id: providerMgmtAllocNavId, label: 'Resource allocation' },
      { id: providerMgmtGlobalTemplatesNavId, label: 'Global templates' },
      { id: providerMgmtUsersNavId, label: 'Users' },
    ],
  },
  {
    kind: 'expand',
    label: 'System',
    groupId: providerSystemGroupId,
    children: [
      { id: providerSystemInfraNavId, label: 'Infrastructure' },
      { id: providerSystemSecurityNavId, label: 'Security & compliance' },
      { id: providerSystemSettingsNavId, label: 'Platform settings' },
    ],
  },
]

const dashboardVmPageSubtitle =
  'This workspace is for VM as a Service — create, run, and manage virtual machines.'

const dashboardClusterPageSubtitle =
  'This workspace is for Cluster as a Service — provision, run, and manage clusters.'

type DashboardInfrastructureType = 'clusters' | 'virtual-machines'

function buildDashboardVmStatusStats(tenantId: DemoTenantId) {
  const c = DEMO_VM_POWER_COUNTS[tenantId]
  const total = demoVmPowerTotal(tenantId)
  return [
    {
      key: 'all-vms',
      label: 'All VMs',
      value: total,
      caption: 'Total VMs across your workspaces',
    },
    {
      key: 'running',
      label: 'Running',
      value: c.running,
      valueColor: 'var(--pf-t--global--color--status--success--default)',
      caption: 'On and ready for workloads',
    },
    {
      key: 'paused',
      label: 'Paused',
      value: c.paused,
      valueColor: 'var(--pf-t--global--color--status--warning--default)',
      caption: 'Suspended with memory and disks retained',
    },
    {
      key: 'stopped',
      label: 'Stopped',
      value: c.stopped,
      valueColor: 'var(--pf-t--global--color--status--danger--default)',
      caption: 'Powered off storage may still incur cost',
    },
  ] as const
}

function navLabelForItemId(
  rows: ShellNavRow[],
  itemId: string | number,
): string {
  const id = String(itemId)
  for (const row of rows) {
    if (row.kind === 'link' && row.id === id) return row.label
    if (row.kind === 'expand') {
      const child = row.children.find((c) => c.id === id)
      if (child) return child.label
    }
  }
  return 'Workspace'
}

function parseGuestOsQueryParam(raw: string | null): TenantOs {
  if (raw === 'rhel' || raw === 'windows' || raw === 'linux') return raw
  return 'linux'
}

function readVmConsoleDemoQuery(): {
  vmId: string
  vmName: string
  guestOs: TenantOs
} | null {
  if (typeof window === 'undefined') return null
  const p = new URLSearchParams(window.location.search)
  if (p.get('demo') !== 'vm-console') return null
  const rawName = p.get('name')
  let vmName = 'Virtual machine'
  if (rawName) {
    try {
      vmName = decodeURIComponent(rawName)
    } catch {
      vmName = rawName
    }
  }
  return {
    vmId: p.get('vm') ?? '',
    vmName,
    guestOs: parseGuestOsQueryParam(p.get('os')),
  }
}

const initialAppRouteBootstrap = ((): {
  vmConsoleDemo: ReturnType<typeof readVmConsoleDemoQuery>
  session: ReturnType<typeof readInitialSessionFromLandingEntry>
} => {
  const emptySession = (): ReturnType<typeof readInitialSessionFromLandingEntry> => ({
    selectedDemoTenant: null,
    demoShellRole: 'tenantUser',
    bankTenantUserEntry: null,
    hadLandingEntryQuery: false,
  })
  if (typeof window === 'undefined') {
    return { vmConsoleDemo: null, session: emptySession() }
  }
  const vm = readVmConsoleDemoQuery()
  if (vm) {
    return { vmConsoleDemo: vm, session: emptySession() }
  }
  return {
    vmConsoleDemo: null,
    session: readInitialSessionFromLandingEntry(),
  }
})()

/** Persona switch row in account dropdown — same name + grey role pill as masthead. */
function accountDropdownPersonaSwitchLabel(
  displayName: string,
  rolePill: 'User' | 'Admin',
): ReactNode {
  return (
    <span className="osac-masthead-account-toggle osac-masthead-account-toggle--account-dropdown-item">
      <span className="osac-masthead-account-toggle__name">{displayName}</span>
      <Label color="grey" className="osac-masthead-account-toggle__role-label">
        {rolePill}
      </Label>
    </span>
  )
}

/** Masthead account toggle: all signed-in shells show PF role pill (User/Admin). */
function mastheadAccountToggleContent(
  role: DemoShellRole,
  tenantId: DemoTenantId,
  bankTenantUserEntry: BankTenantUserEntry | null,
): { node: ReactNode; ariaLabel: string } {
  if (role === 'providerAdmin') {
    const name = demoAccountDisplayName(tenantId, role, null)
    return {
      node: (
        <span className="osac-masthead-account-toggle">
          <span className="osac-masthead-account-toggle__name">{name}</span>
          <Label color="grey" className="osac-masthead-account-toggle__role-label">
            Admin
          </Label>
        </span>
      ),
      ariaLabel: `Account menu, ${name}, provider administrator`,
    }
  }
  if (role === 'tenantAdmin') {
    const name = demoAccountDisplayName(tenantId, role, null)
    return {
      node: (
        <span className="osac-masthead-account-toggle">
          <span className="osac-masthead-account-toggle__name">{name}</span>
          <Label color="grey" className="osac-masthead-account-toggle__role-label">
            Admin
          </Label>
        </span>
      ),
      ariaLabel: `Account menu, ${name}, tenant administrator`,
    }
  }
  const name = demoAccountDisplayName(tenantId, role, bankTenantUserEntry)
  return {
    node: (
      <span className="osac-masthead-account-toggle">
        <span className="osac-masthead-account-toggle__name">{name}</span>
        <Label color="grey" className="osac-masthead-account-toggle__role-label">
          User
        </Label>
      </span>
    ),
    ariaLabel: `Account menu, ${name}, tenant user`,
  }
}

function App() {
  const [vmConsoleDemo, setVmConsoleDemo] = useState(() => initialAppRouteBootstrap.vmConsoleDemo)
  const [selectedDemoTenant, setSelectedDemoTenant] = useState<DemoTenantId | null>(
    () => initialAppRouteBootstrap.session.selectedDemoTenant,
  )
  const [demoShellRole, setDemoShellRole] = useState<DemoShellRole>(
    () => initialAppRouteBootstrap.session.demoShellRole,
  )
  const demoShellRoleRef = useRef<DemoShellRole>(initialAppRouteBootstrap.session.demoShellRole)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLandingPageLoading, setIsLandingPageLoading] = useState(false)
  const [activeItem, setActiveItem] = useState<string | number>(() => {
    const role = initialAppRouteBootstrap.session.demoShellRole
    if (role === 'tenantAdmin') return adminDashboardNavId
    if (role === 'providerAdmin') return providerDashboardNavId
    return dashboardNavItemId
  })
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [clustersNavExpanded, setClustersNavExpanded] = useState(true)
  const [virtualMachinesNavExpanded, setVirtualMachinesNavExpanded] = useState(true)
  const [adminManagementNavExpanded, setAdminManagementNavExpanded] = useState(true)
  const [adminInfraNavExpanded, setAdminInfraNavExpanded] = useState(true)
  const [adminOrgNavExpanded, setAdminOrgNavExpanded] = useState(true)
  const [providerManagementNavExpanded, setProviderManagementNavExpanded] = useState(true)
  const [providerSystemNavExpanded, setProviderSystemNavExpanded] = useState(true)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  /** Bank tenants: Chris/Emerson (vmWorkspace) vs Priya/Marcus operator user (adminPortal). */
  const [bankTenantUserEntry, setBankTenantUserEntry] = useState<BankTenantUserEntry | null>(
    () => initialAppRouteBootstrap.session.bankTenantUserEntry,
  )
  const [vmListPowerFilterIntent, setVmListPowerFilterIntent] =
    useState<VmPowerState | null>(null)
  const [clusterListStatusFilterIntent, setClusterListStatusFilterIntent] =
    useState<ClusterStatus | null>(null)
  const [clusterListStatusFilterIntentSource, setClusterListStatusFilterIntentSource] = useState<
    'dashboard' | null
  >(null)
  const [vmsCreatedFromTemplate, setVmsCreatedFromTemplate] = useState<
    TenantVirtualMachine[]
  >([])
  const [clustersCreatedFromModal, setClustersCreatedFromModal] = useState<TenantCluster[]>(
    [],
  )
  const [clusterProvisioningNotice, setClusterProvisioningNotice] =
    useState<ClusterProvisioningNoticeState | null>(null)
  const [vmListCreatedFilterNavigateSeq, setVmListCreatedFilterNavigateSeq] = useState(0)
  /** Bumps when user re-selects My VMs while already on that nav (return to list from detail). */
  const [vmListNavReselectSeq, setVmListNavReselectSeq] = useState(0)
  /** Bumps when user re-selects My clusters while already on that nav (return to list from detail). */
  const [clusterListNavReselectSeq, setClusterListNavReselectSeq] = useState(0)
  /** Bumps when user re-selects Templates while already on that nav (close drawer, show grid). */
  const [catalogNavReselectSeq, setCatalogNavReselectSeq] = useState(0)
  const [clusterCatalogNavReselectSeq, setClusterCatalogNavReselectSeq] = useState(0)
  const [recentActivitiesPageOpen, setRecentActivitiesPageOpen] = useState(false)
  const [dashboardInfrastructureType, setDashboardInfrastructureType] =
    useState<DashboardInfrastructureType>('clusters')
  const [globalSearchQuery, setGlobalSearchQuery] = useState('')
  const [tenantAdminStorageExpansionDemoNotice, setTenantAdminStorageExpansionDemoNotice] =
    useState(false)
  const [tenantAdminCreateProjectModalOpen, setTenantAdminCreateProjectModalOpen] = useState(false)
  const [providerOnboardTenantModalOpen, setProviderOnboardTenantModalOpen] = useState(false)
  const [tenantAdminNetworkSegmentDemoNotice, setTenantAdminNetworkSegmentDemoNotice] =
    useState(false)
  const createVmLaunchRef = useRef<CreateVirtualMachineLaunchHandle>(null)
  const createClusterLaunchRef = useRef<CreateClusterLaunchHandle>(null)
  const clusterCreateLaunchOriginRef = useRef<'catalog-templates' | 'default'>('default')
  const loginTransitionTimerRef = useRef<number | null>(null)

  useEffect(() => {
    demoShellRoleRef.current = demoShellRole
  }, [demoShellRole])
  const openCreateVirtualMachineModal = useCallback(() => {
    createVmLaunchRef.current?.open()
  }, [])

  const openCreateClusterModal = useCallback(() => {
    clusterCreateLaunchOriginRef.current = 'default'
    createClusterLaunchRef.current?.open()
  }, [])

  const openCreateClusterWizardFromCatalogTemplate = useCallback(
    (templateId: string, initialClusterName: string) => {
      clusterCreateLaunchOriginRef.current = 'catalog-templates'
      createClusterLaunchRef.current?.openFromCatalogTemplate(templateId, initialClusterName)
    },
    [],
  )

  const openCreateVirtualMachineWizardFromCatalogTemplate = useCallback(
    (templateId: string, initialVmName: string) => {
      createVmLaunchRef.current?.openFromCatalogTemplate(templateId, initialVmName)
    },
    [],
  )

  const openCreateVirtualMachineWizardFromCloneSource = useCallback((sourceVmId: string) => {
    createVmLaunchRef.current?.openFromCloneSource(sourceVmId)
  }, [])

  const seedFleetVirtualMachines = useMemo(() => {
    if (!selectedDemoTenant) return []
    if (selectedDemoTenant === 'vertexa') {
      return [
        ...buildTenantVirtualMachinesForTenant('northstar'),
        ...buildTenantVirtualMachinesForTenant('evergreen'),
      ]
    }
    return buildTenantVirtualMachinesForTenant(selectedDemoTenant)
  }, [selectedDemoTenant])

  const allTenantVirtualMachines = useMemo(
    () => [...vmsCreatedFromTemplate, ...seedFleetVirtualMachines],
    [vmsCreatedFromTemplate, seedFleetVirtualMachines],
  )

  const dashboardVmStatusStats = useMemo(
    () =>
      selectedDemoTenant && selectedDemoTenant !== 'vertexa'
        ? buildDashboardVmStatusStats(selectedDemoTenant)
        : [],
    [selectedDemoTenant],
  )

  const createVirtualMachineFromCatalogTemplate = useCallback(
    (templateId: string, vmName: string, vmDescription?: string) => {
      const tpl = getTenantVmTemplateById(templateId)
      if (!tpl || !selectedDemoTenant || selectedDemoTenant === 'vertexa') return
      const vm = buildTenantVirtualMachineFromCatalogTemplate(
        tpl,
        vmName,
        selectedDemoTenant,
        vmDescription,
      )
      setVmsCreatedFromTemplate((prev) => [vm, ...prev])
      setVmListCreatedFilterNavigateSeq((s) => s + 1)
      setActiveItem(virtualMachinesNavItemId)
    },
    [selectedDemoTenant],
  )

  const provisionNewVmFromModal = useCallback(
    (payload: ProvisionNewVmFromModalPayload) => {
      if (!selectedDemoTenant || selectedDemoTenant === 'vertexa') return
      const vm = buildTenantVmFromModalNewPayload(payload, selectedDemoTenant)
      setVmsCreatedFromTemplate((prev) => [vm, ...prev])
      setVmListCreatedFilterNavigateSeq((s) => s + 1)
    },
    [selectedDemoTenant],
  )

  const provisionClusterFromModal = useCallback(
    (payload: ProvisionClusterFromModalPayload) => {
      if (
        !selectedDemoTenant ||
        selectedDemoTenant === 'vertexa' ||
        (selectedDemoTenant !== 'northstar' && selectedDemoTenant !== 'evergreen')
      ) {
        return
      }
      const cluster = buildTenantClusterFromModalPayload(payload, selectedDemoTenant)
      const fromCatalogTemplates =
        clusterCreateLaunchOriginRef.current === 'catalog-templates'
      clusterCreateLaunchOriginRef.current = 'default'

      setClustersCreatedFromModal((prev) => [cluster, ...prev])
      setClusterProvisioningNotice({
        clusterId: cluster.id,
        clusterName: cluster.name,
        target: fromCatalogTemplates ? 'my-clusters' : 'dashboard',
      })

      if (fromCatalogTemplates) {
        setClusterListStatusFilterIntent('provisioning')
        setClusterListStatusFilterIntentSource(null)
        setActiveItem(myClustersNavItemId)
      } else {
        setDashboardInfrastructureType('clusters')
        setClusterListStatusFilterIntent(null)
        setClusterListStatusFilterIntentSource(null)
        setActiveItem(dashboardNavItemId)
      }
    },
    [selectedDemoTenant],
  )

  const provisionVmCloneFromModal = useCallback(
    (sourceVmId: string, newName: string) => {
      const src = allTenantVirtualMachines.find((v) => v.id === sourceVmId)
      if (!src) return
      const now = Date.now()
      const cloned: TenantVirtualMachine = {
        ...src,
        id: `vm-clone-${now}`,
        name: newName.trim() || `${src.name}-clone`,
        description: `Cloned from ${src.name}.`,
        created: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        createdAtMs: now,
      }
      setVmsCreatedFromTemplate((prev) => [cloned, ...prev])
      setVmListCreatedFilterNavigateSeq((s) => s + 1)
    },
    [allTenantVirtualMachines],
  )

  const effectiveShellNavRows = useMemo(() => {
    if (demoShellRole === 'providerAdmin') return providerAdminNavRows
    if (demoShellRole === 'tenantAdmin') return tenantAdminNavRows
    return shellNavRows
  }, [demoShellRole])

  const navigateTenantAdminFromDashboard = useCallback((target: TenantAdminDashboardNavTarget) => {
    switch (target) {
      case 'projects':
        setActiveItem(adminMgmtProjectsNavId)
        break
      case 'users':
        setActiveItem(adminMgmtUsersNavId)
        break
      case 'networks':
        setActiveItem(adminInfraNetworksNavId)
        break
      case 'storage':
        setActiveItem(adminInfraStorageNavId)
        break
      case 'templates':
        setActiveItem(adminMgmtTemplatesNavId)
        break
      default:
        break
    }
  }, [])

  const tenantAdminShortcutOnboardUser = useCallback(() => {
    setActiveItem(adminMgmtUsersNavId)
  }, [])

  const tenantAdminShortcutCreateProject = useCallback(() => {
    setActiveItem(adminMgmtProjectsNavId)
    setTenantAdminCreateProjectModalOpen(true)
  }, [])

  /** Bank tenants only: switch shell between tenant admin and tenant user without re-signing in. */
  const switchSignedInShellToTenantUser = useCallback(() => {
    setIsUserMenuOpen(false)
    setRecentActivitiesPageOpen(false)
    setGlobalSearchQuery('')
    setVmListPowerFilterIntent(null)
    setBankTenantUserEntry('adminPortal')
    setDemoShellRole('tenantUser')
    setActiveItem(dashboardNavItemId)
  }, [])

  const switchSignedInShellToTenantAdmin = useCallback(() => {
    setIsUserMenuOpen(false)
    setRecentActivitiesPageOpen(false)
    setGlobalSearchQuery('')
    setVmListPowerFilterIntent(null)
    setBankTenantUserEntry(null)
    setDemoShellRole('tenantAdmin')
    setActiveItem(adminDashboardNavId)
  }, [])

  const navigateProviderAdminFromDashboard = useCallback((target: ProviderAdminDashboardNavTarget) => {
    switch (target) {
      case 'tenant-organizations':
        setActiveItem(providerMgmtTenantsNavId)
        break
      case 'users':
        setActiveItem(providerMgmtUsersNavId)
        break
      case 'global-templates':
        setActiveItem(providerMgmtGlobalTemplatesNavId)
        break
      case 'resource-allocation':
        setActiveItem(providerMgmtAllocNavId)
        break
      case 'system-infrastructure':
        setActiveItem(providerSystemInfraNavId)
        break
      default:
        break
    }
  }, [])

  useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.toggle('pf-v6-theme-dark', isDarkTheme)
    root.dataset.osacTheme = isDarkTheme ? 'dark' : 'light'
  }, [isDarkTheme])

  useLayoutEffect(() => {
    if (initialAppRouteBootstrap.session.hadLandingEntryQuery) {
      stripOsacLandingEntryParamsFromUrl()
    }
  }, [])

  useEffect(() => {
    document.title = 'OSAC — Cluster as a Service Prototypes'
  }, [])

  /**
   * Pre-login: institution pick + sign-in screens. North Summit / Vertexa login use dark; BlueSolace login uses light.
   */
  useEffect(() => {
    if (isLoggedIn) return
    if (selectedDemoTenant === 'northstar' || selectedDemoTenant === 'vertexa') {
      setIsDarkTheme(true)
    } else if (selectedDemoTenant === 'evergreen') {
      setIsDarkTheme(false)
    }
  }, [isLoggedIn, selectedDemoTenant])

  /**
   * Logged-in bank tenants: each visit to the tenant user or tenant admin dashboard applies that institution’s
   * default appearance (North Summit → dark, BlueSolace → light). Other pages keep the user’s toggle.
   */
  useEffect(() => {
    if (!isLoggedIn) return
    const tid = selectedDemoTenant
    if (tid !== 'northstar' && tid !== 'evergreen') return

    const onTenantUserDashboard =
      demoShellRole === 'tenantUser' && activeItem === dashboardNavItemId
    const onTenantAdminDashboard =
      demoShellRole === 'tenantAdmin' && activeItem === adminDashboardNavId

    if (!onTenantUserDashboard && !onTenantAdminDashboard) return

    setIsDarkTheme(tid === 'northstar')
  }, [isLoggedIn, selectedDemoTenant, demoShellRole, activeItem])

  /**
   * Role landing (no tenant): always light theme on `documentElement`, regardless of prior
   * Provider / Tenant admin / Tenant user shell appearance.
   */
  useEffect(() => {
    if (vmConsoleDemo) return
    if (!selectedDemoTenant) {
      setIsDarkTheme(false)
    }
  }, [selectedDemoTenant, vmConsoleDemo])

  useEffect(() => {
    if (activeItem !== virtualMachinesNavItemId) {
      setVmListPowerFilterIntent(null)
      setVmListCreatedFilterNavigateSeq(0)
    }
  }, [activeItem])

  useEffect(() => {
    if (activeItem !== myClustersNavItemId) {
      setClusterListStatusFilterIntent(null)
      setClusterListStatusFilterIntentSource(null)
    }
  }, [activeItem])

  useEffect(() => {
    setRecentActivitiesPageOpen(false)
  }, [activeItem])

  const clearInstitutionLoginTransition = useCallback(() => {
    if (loginTransitionTimerRef.current != null) {
      clearTimeout(loginTransitionTimerRef.current)
      loginTransitionTimerRef.current = null
    }
    setIsLandingPageLoading(false)
  }, [])

  useEffect(
    () => () => {
      clearInstitutionLoginTransition()
    },
    [clearInstitutionLoginTransition],
  )

  useEffect(() => {
    const onTenantAdminStorage =
      demoShellRole === 'tenantAdmin' && activeItem === adminInfraStorageNavId
    if (!onTenantAdminStorage) setTenantAdminStorageExpansionDemoNotice(false)
  }, [demoShellRole, activeItem])

  useEffect(() => {
    const onTenantAdminProjects =
      demoShellRole === 'tenantAdmin' && activeItem === adminMgmtProjectsNavId
    if (!onTenantAdminProjects) setTenantAdminCreateProjectModalOpen(false)
  }, [demoShellRole, activeItem])

  useEffect(() => {
    const onTenantAdminNetworks =
      demoShellRole === 'tenantAdmin' && activeItem === adminInfraNetworksNavId
    if (!onTenantAdminNetworks) setTenantAdminNetworkSegmentDemoNotice(false)
  }, [demoShellRole, activeItem])

  if (vmConsoleDemo) {
    return (
      <VmConsoleDemoPage
        vmId={vmConsoleDemo.vmId}
        vmName={vmConsoleDemo.vmName}
        guestOs={vmConsoleDemo.guestOs}
        onClose={() => {
          setVmConsoleDemo(null)
          window.history.replaceState({}, '', window.location.pathname)
        }}
      />
    )
  }

  if (!isLoggedIn) {
    if (!selectedDemoTenant) {
      return (
        <DemoTenantLandingPage />
      )
    }
    if (selectedDemoTenant === 'vertexa') {
      return (
        <VertexaCloudLoginPage
          key="vx-login-provider"
          defaultUsername={demoLoginEmailForRole('vertexa', demoShellRole)}
          isLandingPageLoading={isLandingPageLoading}
          onChooseAnotherInstitution={() => {
            clearInstitutionLoginTransition()
            setSelectedDemoTenant(null)
          }}
          onLoginSuccess={() => {
            setIsLandingPageLoading(true)
            if (loginTransitionTimerRef.current != null) {
              clearTimeout(loginTransitionTimerRef.current)
            }
            loginTransitionTimerRef.current = window.setTimeout(() => {
              loginTransitionTimerRef.current = null
              setIsLandingPageLoading(false)
              setActiveItem(providerDashboardNavId)
              setIsLoggedIn(true)
            }, 2000)
          }}
        />
      )
    }
    if (selectedDemoTenant === 'northstar') {
      return (
        <NorthstarBankLoginPage
          key={`ns-login-${demoShellRole}`}
          defaultUsername={demoLoginEmailForRole('northstar', demoShellRole)}
          isLandingPageLoading={isLandingPageLoading}
          onChooseAnotherInstitution={() => {
            clearInstitutionLoginTransition()
            setSelectedDemoTenant(null)
          }}
          onLoginSuccess={() => {
            const roleForTransition = demoShellRoleRef.current
            setIsLandingPageLoading(true)
            if (loginTransitionTimerRef.current != null) {
              clearTimeout(loginTransitionTimerRef.current)
            }
            loginTransitionTimerRef.current = window.setTimeout(() => {
              loginTransitionTimerRef.current = null
              setIsLandingPageLoading(false)
              setActiveItem(
                roleForTransition === 'tenantAdmin'
                  ? adminDashboardNavId
                  : dashboardNavItemId,
              )
              setIsLoggedIn(true)
            }, 2000)
          }}
        />
      )
    }
    return (
      <EvergreenFinancialGroupLoginPage
        key={`eg-login-${demoShellRole}`}
        defaultEmail={demoLoginEmailForRole('evergreen', demoShellRole)}
        isLandingPageLoading={isLandingPageLoading}
        onChooseAnotherInstitution={() => {
          clearInstitutionLoginTransition()
          setSelectedDemoTenant(null)
        }}
        onLoginSuccess={() => {
          const roleForTransition = demoShellRoleRef.current
          setIsLandingPageLoading(true)
          if (loginTransitionTimerRef.current != null) {
            clearTimeout(loginTransitionTimerRef.current)
          }
          loginTransitionTimerRef.current = window.setTimeout(() => {
            loginTransitionTimerRef.current = null
            setIsLandingPageLoading(false)
            setActiveItem(
              roleForTransition === 'tenantAdmin'
                ? adminDashboardNavId
                : dashboardNavItemId,
            )
            setIsLoggedIn(true)
          }, 2000)
        }}
      />
    )
  }

  /** Invariant when logged in: tenant is set (see log out). Kept for type narrowing. */
  if (!selectedDemoTenant) {
    return <DemoTenantLandingPage />
  }

  const demoTenantId = selectedDemoTenant
  const mastheadAccountToggle = mastheadAccountToggleContent(
    demoShellRole,
    demoTenantId,
    bankTenantUserEntry,
  )
  const showTenantPersonaSwitcher =
    demoTenantId === 'northstar' || demoTenantId === 'evergreen'

  const showProviderDashboardPage =
    demoShellRole === 'providerAdmin' && activeItem === providerDashboardNavId
  const showProviderMgmtTenantsPage =
    demoShellRole === 'providerAdmin' && activeItem === providerMgmtTenantsNavId
  const showProviderMgmtUsersPage =
    demoShellRole === 'providerAdmin' && activeItem === providerMgmtUsersNavId
  const showProviderMgmtAllocPage =
    demoShellRole === 'providerAdmin' && activeItem === providerMgmtAllocNavId
  const showProviderMgmtTemplatesPage =
    demoShellRole === 'providerAdmin' && activeItem === providerMgmtGlobalTemplatesNavId
  const showProviderSystemInfraPage =
    demoShellRole === 'providerAdmin' && activeItem === providerSystemInfraNavId
  const showProviderSystemSecurityPage =
    demoShellRole === 'providerAdmin' && activeItem === providerSystemSecurityNavId
  const showProviderSystemSettingsPage =
    demoShellRole === 'providerAdmin' && activeItem === providerSystemSettingsNavId

  const showCatalogPage =
    demoShellRole === 'tenantUser' && activeItem === catalogNavItemId
  const showClusterTemplatesPage =
    demoShellRole === 'tenantUser' && activeItem === clusterTemplatesNavItemId
  const showMyClustersPage =
    demoShellRole === 'tenantUser' && activeItem === myClustersNavItemId
  const showVirtualMachinesPage =
    demoShellRole === 'tenantUser' && activeItem === virtualMachinesNavItemId
  const showAdminDashboardPage =
    demoShellRole === 'tenantAdmin' && activeItem === adminDashboardNavId
  const showAdminMgmtProjectsPage =
    demoShellRole === 'tenantAdmin' && activeItem === adminMgmtProjectsNavId
  const showAdminMgmtUsersPage =
    demoShellRole === 'tenantAdmin' && activeItem === adminMgmtUsersNavId
  const showAdminMgmtQuotaPage =
    demoShellRole === 'tenantAdmin' && activeItem === adminMgmtQuotaNavId
  const showAdminMgmtTemplatesPage =
    demoShellRole === 'tenantAdmin' && activeItem === adminMgmtTemplatesNavId
  const showAdminInfraNetworksPage =
    demoShellRole === 'tenantAdmin' && activeItem === adminInfraNetworksNavId
  const showAdminInfraStoragePage =
    demoShellRole === 'tenantAdmin' && activeItem === adminInfraStorageNavId
  const showAdminOrgSettingsPage =
    demoShellRole === 'tenantAdmin' && activeItem === adminOrgSettingsNavId
  const showAdminOrgSecurityPage =
    demoShellRole === 'tenantAdmin' && activeItem === adminOrgSecurityNavId

  const recentActivitiesBreadcrumb = recentActivitiesPageOpen ? (
    <Breadcrumb>
      <BreadcrumbItem>
        <Button
          variant="link"
          isInline
          onClick={() => {
            setRecentActivitiesPageOpen(false)
            setActiveItem(
              demoShellRole === 'providerAdmin'
                ? providerDashboardNavId
                : demoShellRole === 'tenantAdmin'
                  ? adminDashboardNavId
                  : dashboardNavItemId,
            )
          }}
        >
          Dashboard
        </Button>
      </BreadcrumbItem>
      <BreadcrumbItem isActive>Recent activities</BreadcrumbItem>
    </Breadcrumb>
  ) : undefined

  const showTenantTrustStrip =
    isLoggedIn &&
    (demoShellRole === 'tenantUser' ||
      demoShellRole === 'tenantAdmin' ||
      demoShellRole === 'providerAdmin')

  const masthead = (
    <Masthead>
      <MastheadMain>
        <MastheadToggle>
          <PageToggleButton variant="plain" aria-label="Global navigation">
            <BarsIcon />
          </PageToggleButton>
        </MastheadToggle>
        <MastheadLogo
          className={
            demoTenantId === 'vertexa'
              ? 'vertexa-masthead-logo'
              : demoTenantId === 'evergreen'
                ? 'evergreen-masthead-logo'
                : 'northstar-masthead-logo'
          }
        >
          <MastheadBrand>
            {demoTenantId === 'vertexa' ? (
              <VertexaCloudMastheadLogo />
            ) : demoTenantId === 'evergreen' ? (
              <EvergreenFinancialGroupMastheadLogo />
            ) : (
              <NorthstarBankMastheadLogo />
            )}
          </MastheadBrand>
        </MastheadLogo>
      </MastheadMain>
      <MastheadContent className="northstar-masthead-content">
        {showTenantTrustStrip ? (
          <div className="osac-masthead-tenant-trust-strip" aria-label="Data residency and compliance">
            <div className="osac-masthead-tenant-trust-strip__residency">
              <span className="osac-masthead-region-flag" role="img" aria-label="United Kingdom">
                🇬🇧
              </span>
              <span className="osac-masthead-region-line" title="UK, London, EU-West-1-DC-A">
                UK, London, EU-West-1-DC-A
              </span>
            </div>
            <div className="osac-masthead-tenant-trust-strip__compliance">
              <Label color="blue" variant="outline" isCompact>
                GDPR
              </Label>
              <Label color="teal" variant="outline" isCompact>
                ISO27001
              </Label>
            </div>
          </div>
        ) : null}
        <span className="northstar-masthead-content__spacer" aria-hidden />
        <div className="northstar-masthead-search">
          <SearchInput
            placeholder="Search"
            value={globalSearchQuery}
            onChange={(_e, value) => setGlobalSearchQuery(value)}
            onClear={() => setGlobalSearchQuery('')}
            aria-label="Global search"
          />
        </div>
        <span className="northstar-masthead-content__spacer" aria-hidden />
        <Toolbar
          ouiaId="masthead-utilities-toolbar"
          className="northstar-masthead-utilities-toolbar"
        >
          <ToolbarContent alignItems="center">
            <ToolbarGroup
              align={{ default: 'alignEnd' }}
              variant="action-group-plain"
              gap={{ default: 'gapSm' }}
            >
              <ToolbarItem>
                <Button
                  variant="plain"
                  aria-label={isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'}
                  onClick={() => setIsDarkTheme((prev) => !prev)}
                >
                  {isDarkTheme ? <SunIcon /> : <MoonIcon />}
                </Button>
              </ToolbarItem>
              <ToolbarItem>
                <Button
                  variant="plain"
                  aria-label="Recent activities"
                  onClick={() => setRecentActivitiesPageOpen(true)}
                >
                  <BellIcon />
                </Button>
              </ToolbarItem>
              <ToolbarItem>
                <Button
                  variant="plain"
                  aria-label="Help"
                  onClick={(e) => e.preventDefault()}
                >
                  <OutlinedQuestionCircleIcon />
                </Button>
              </ToolbarItem>
              <ToolbarItem>
                <Button
                  variant="plain"
                  aria-label="Settings"
                  onClick={(e) => e.preventDefault()}
                >
                  <CogIcon />
                </Button>
              </ToolbarItem>
              <ToolbarItem>
                <Dropdown
                  key={demoMastheadAccountControlKey(demoTenantId, demoShellRole, bankTenantUserEntry)}
                  isOpen={isUserMenuOpen}
                  onSelect={() => setIsUserMenuOpen(false)}
                  onOpenChange={setIsUserMenuOpen}
                  popperProps={{ position: 'right' }}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      isExpanded={isUserMenuOpen}
                      onClick={() => setIsUserMenuOpen((o) => !o)}
                      icon={<UserIcon />}
                      className="osac-masthead-account-menu-toggle"
                      aria-label={mastheadAccountToggle.ariaLabel}
                    >
                      {mastheadAccountToggle.node}
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    {showTenantPersonaSwitcher && demoShellRole === 'tenantAdmin' ? (
                      <DropdownItem
                        value="switch-tenant-user"
                        onClick={switchSignedInShellToTenantUser}
                        aria-label={`Switch to tenant user workspace as ${demoAccountDisplayName(demoTenantId, 'tenantUser', 'adminPortal')}`}
                      >
                        {accountDropdownPersonaSwitchLabel(
                          demoAccountDisplayName(demoTenantId, 'tenantUser', 'adminPortal'),
                          'User',
                        )}
                      </DropdownItem>
                    ) : null}
                    {showTenantPersonaSwitcher &&
                    demoShellRole === 'tenantUser' &&
                    bankTenantUserEntry === 'adminPortal' ? (
                      <DropdownItem
                        value="switch-tenant-admin"
                        onClick={switchSignedInShellToTenantAdmin}
                        aria-label={`Switch to tenant admin console as ${demoAccountDisplayName(demoTenantId, 'tenantAdmin', null)}`}
                      >
                        {accountDropdownPersonaSwitchLabel(
                          demoAccountDisplayName(demoTenantId, 'tenantAdmin', null),
                          'Admin',
                        )}
                      </DropdownItem>
                    ) : null}
                    <DropdownItem value="profile" onClick={(e) => e.preventDefault()}>
                      Account settings
                    </DropdownItem>
                    <DropdownItem
                      value="logout"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        setGlobalSearchQuery('')
                        setIsLandingPageLoading(false)
                        setVmsCreatedFromTemplate([])
                        setSelectedDemoTenant(null)
                        setBankTenantUserEntry(null)
                        setDemoShellRole('tenantUser')
                        setActiveItem(dashboardNavItemId)
                        setIsLoggedIn(false)
                      }}
                    >
                      Log out
                    </DropdownItem>
                  </DropdownList>
                </Dropdown>
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </MastheadContent>
    </Masthead>
  )

  const sidebar = (
    <PageSidebar>
      <PageSidebarBody isFilled>
        <div
          className="osac-shell-sidebar-inner"
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
            width: '100%',
            gap: 'var(--pf-t--global--spacer--md)',
          }}
        >
          <Nav
            className="osac-app-shell-nav"
            aria-label="Primary"
            onSelect={(_e, item) => {
              setRecentActivitiesPageOpen(false)
              const id = String(item.itemId)
              if (id === virtualMachinesNavItemId) {
                setVmListPowerFilterIntent(null)
              }
              if (id === virtualMachinesNavItemId && String(activeItem) === virtualMachinesNavItemId) {
                setVmListNavReselectSeq((s) => s + 1)
              }
              if (id === myClustersNavItemId && String(activeItem) === myClustersNavItemId) {
                setClusterListNavReselectSeq((s) => s + 1)
              }
              if (id === catalogNavItemId && String(activeItem) === catalogNavItemId) {
                setCatalogNavReselectSeq((s) => s + 1)
              }
              if (
                id === clusterTemplatesNavItemId &&
                String(activeItem) === clusterTemplatesNavItemId
              ) {
                setClusterCatalogNavReselectSeq((s) => s + 1)
              }
              if (
                id === adminMgmtTemplatesNavId &&
                String(activeItem) === adminMgmtTemplatesNavId
              ) {
                setCatalogNavReselectSeq((s) => s + 1)
              }
              if (
                id === providerMgmtGlobalTemplatesNavId &&
                String(activeItem) === providerMgmtGlobalTemplatesNavId
              ) {
                setCatalogNavReselectSeq((s) => s + 1)
              }
              setActiveItem(item.itemId)
            }}
          >
            <NavList>
              {effectiveShellNavRows.map((row) =>
                row.kind === 'link' ? (
                  <NavItem
                    key={row.id}
                    itemId={row.id}
                    isActive={activeItem === row.id}
                    to="#"
                    preventDefault
                  >
                    {row.label}
                  </NavItem>
                ) : (
                  <NavExpandable
                    key={row.groupId}
                    title={row.label}
                    groupId={row.groupId}
                    isExpanded={
                      row.groupId === adminManagementGroupId
                        ? adminManagementNavExpanded
                        : row.groupId === adminInfraGroupId
                          ? adminInfraNavExpanded
                          : row.groupId === adminOrgGroupId
                            ? adminOrgNavExpanded
                            : row.groupId === providerManagementGroupId
                              ? providerManagementNavExpanded
                              : row.groupId === providerSystemGroupId
                                ? providerSystemNavExpanded
                                : row.groupId === clustersGroupId
                                  ? clustersNavExpanded
                                  : row.groupId === virtualMachinesGroupId
                                    ? virtualMachinesNavExpanded
                                    : true
                    }
                    onExpand={(_event, expanded) => {
                      if (row.groupId === adminManagementGroupId) {
                        setAdminManagementNavExpanded(expanded)
                      } else if (row.groupId === adminInfraGroupId) {
                        setAdminInfraNavExpanded(expanded)
                      } else if (row.groupId === adminOrgGroupId) {
                        setAdminOrgNavExpanded(expanded)
                      } else if (row.groupId === providerManagementGroupId) {
                        setProviderManagementNavExpanded(expanded)
                      } else if (row.groupId === providerSystemGroupId) {
                        setProviderSystemNavExpanded(expanded)
                      } else if (row.groupId === clustersGroupId) {
                        setClustersNavExpanded(expanded)
                      } else if (row.groupId === virtualMachinesGroupId) {
                        setVirtualMachinesNavExpanded(expanded)
                      }
                    }}
                    isActive={row.children.some((c) => c.id === String(activeItem))}
                  >
                    {row.children.map((child) => (
                      <NavItem
                        key={child.id}
                        itemId={child.id}
                        groupId={row.groupId}
                        isActive={activeItem === child.id}
                        to="#"
                        preventDefault
                      >
                        {child.label}
                      </NavItem>
                    ))}
                  </NavExpandable>
                ),
              )}
            </NavList>
          </Nav>
          <div className="osac-shell-sidebar-footer">
            <div className="osac-shell-sidebar-sticker">
              <span className="osac-shell-sidebar-sticker__label">Conceptual design</span>
            </div>
          </div>
        </div>
      </PageSidebarBody>
    </PageSidebar>
  )

  const isSparseShellPage =
    demoShellRole !== 'tenantAdmin' &&
    demoShellRole !== 'providerAdmin' &&
    !recentActivitiesPageOpen &&
    !showCatalogPage &&
    !showClusterTemplatesPage &&
    !showMyClustersPage &&
    !showVirtualMachinesPage &&
    activeItem !== dashboardNavItemId

  return (
    <Page
      className="northstar-tenant-app"
      masthead={masthead}
      sidebar={sidebar}
      breadcrumb={recentActivitiesBreadcrumb}
      isManagedSidebar
      isContentFilled={!isSparseShellPage}
      mainAriaLabel={`${DEMO_TENANT_LABEL[demoTenantId]} cloud workspace`}
    >
      <PageSection
        isFilled={!isSparseShellPage}
        className={`osac-page-main-section${
          showAdminInfraNetworksPage ? ' osac-page-main-section--topology' : ''
        }`}
      >
        <CreateVirtualMachineLaunchButton
          ref={createVmLaunchRef}
          hideTriggerButton
          existingVirtualMachines={allTenantVirtualMachines}
          onProvisionNewVm={provisionNewVmFromModal}
          onProvisionFromTemplate={createVirtualMachineFromCatalogTemplate}
          onProvisionClone={provisionVmCloneFromModal}
        />
        <CreateClusterLaunchButton
          ref={createClusterLaunchRef}
          hideTriggerButton
          onProvisionCluster={provisionClusterFromModal}
        />
        {recentActivitiesPageOpen ? (
          <div className="osac-non-catalog-main">
            <RecentActivitiesPage
              fleetVirtualMachines={allTenantVirtualMachines}
              demoTenantId={demoTenantId}
            />
          </div>
        ) : demoShellRole === 'providerAdmin' ? (
          showProviderMgmtTemplatesPage ? (
            <TenantVmTemplatesCatalog
              navReselectSeq={catalogNavReselectSeq}
              pageTitle="Global templates"
              pageDescription="Publish and manage VM templates available across tenant organizations."
              toolbarActions={
                <Button
                  variant="primary"
                  type="button"
                  ouiaId="provider-add-vm-template"
                  onClick={() => {}}
                >
                  Add template
                </Button>
              }
              onOpenCreateVirtualMachineWizardFromTemplate={
                openCreateVirtualMachineWizardFromCatalogTemplate
              }
            />
          ) : showProviderSystemInfraPage ? (
            <div className="osac-non-catalog-main">
              <ProviderAdminInfrastructurePage isDarkTheme={isDarkTheme} />
            </div>
          ) : showProviderSystemSecurityPage ? (
            <div className="osac-non-catalog-main">
              <ProviderAdminSecurityCompliancePage />
            </div>
          ) : showProviderSystemSettingsPage ? (
            <div className="osac-non-catalog-main">
              <ProviderAdminPlatformSettingsPage />
            </div>
          ) : (
            <div className="osac-non-catalog-main">
              <div
                className="osac-page-toolbar-sticky"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 'var(--pf-t--global--spacer--md)',
                }}
              >
                <div className="osac-page-toolbar-sticky__lead">
                  <Title headingLevel="h1" size="2xl" style={{ margin: 0 }}>
                    {navLabelForItemId(effectiveShellNavRows, activeItem)}
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
                    {showProviderMgmtUsersPage
                      ? 'Manage provider users and tenant access assignments.'
                      : showProviderMgmtAllocPage
                        ? 'Capacity pools, region quotas, and fair-share limits across tenants.'
                      : 'Manage and monitor all tenant organizations.'}
                  </Content>
                </div>
                {showProviderMgmtTenantsPage ? (
                  <div className="osac-page-toolbar-sticky__actions">
                    <Button
                      variant="primary"
                      type="button"
                      onClick={() => setProviderOnboardTenantModalOpen(true)}
                      ouiaId="provider-onboard-tenant-open"
                    >
                      Onboard tenant
                    </Button>
                  </div>
                ) : showProviderMgmtUsersPage ? (
                  <div className="osac-page-toolbar-sticky__actions">
                    <Button variant="primary" type="button" onClick={() => {}}>
                      Add user
                    </Button>
                  </div>
                ) : null}
              </div>
              <ProviderOnboardTenantModal
                isOpen={providerOnboardTenantModalOpen}
                onClose={() => setProviderOnboardTenantModalOpen(false)}
              />
              {showProviderDashboardPage ? (
                <ProviderAdminDashboardPage onNavigate={navigateProviderAdminFromDashboard} />
              ) : showProviderMgmtTenantsPage ? (
                <ProviderAdminTenantOrganizationsPage />
              ) : showProviderMgmtUsersPage ? (
                <ProviderAdminUserManagementPage />
              ) : showProviderMgmtAllocPage ? (
                <ProviderAdminResourceAllocationPage />
              ) : (
                <ProviderAdminDashboardPage onNavigate={navigateProviderAdminFromDashboard} />
              )}
            </div>
          )
        ) : demoShellRole === 'tenantAdmin' ? (
          showAdminMgmtTemplatesPage ? (
            <TenantVmTemplatesCatalog
              navReselectSeq={catalogNavReselectSeq}
              onOpenCreateVirtualMachineWizardFromTemplate={
                openCreateVirtualMachineWizardFromCatalogTemplate
              }
            />
          ) : (
            <div className="osac-non-catalog-main">
              <div
                className="osac-page-toolbar-sticky"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--pf-t--global--spacer--md)',
                }}
              >
                <div className="osac-page-toolbar-sticky__lead">
                  <Title headingLevel="h1" size="2xl" style={{ margin: 0 }}>
                    {navLabelForItemId(effectiveShellNavRows, activeItem)}
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
                    Tenant administration for {DEMO_TENANT_LABEL[demoTenantId]}.
                  </Content>
                </div>
                {showAdminMgmtUsersPage ? (
                  <div className="osac-page-toolbar-sticky__actions">
                    <Button variant="primary" type="button" onClick={() => {}}>
                      Add user
                    </Button>
                  </div>
                ) : showAdminInfraStoragePage ? (
                  <div className="osac-page-toolbar-sticky__actions">
                    <Button
                      variant="primary"
                      type="button"
                      onClick={() => setTenantAdminStorageExpansionDemoNotice(true)}
                    >
                      Request storage expansion
                    </Button>
                  </div>
                ) : showAdminMgmtProjectsPage ? (
                  <div className="osac-page-toolbar-sticky__actions">
                    <Button
                      variant="primary"
                      type="button"
                      onClick={() => setTenantAdminCreateProjectModalOpen(true)}
                    >
                      Create project
                    </Button>
                  </div>
                ) : showAdminInfraNetworksPage ? (
                  <div className="osac-page-toolbar-sticky__actions">
                    <Button
                      variant="primary"
                      type="button"
                      onClick={() => setTenantAdminNetworkSegmentDemoNotice(true)}
                    >
                      Request network segment
                    </Button>
                  </div>
                ) : null}
              </div>
              {showAdminDashboardPage ? (
                <TenantAdminDashboardPage
                  demoTenantId={demoTenantId}
                  fleetVirtualMachines={allTenantVirtualMachines}
                  isDarkTheme={isDarkTheme}
                  onNavigateToTenantAdmin={navigateTenantAdminFromDashboard}
                  onShortcutOnboardUser={tenantAdminShortcutOnboardUser}
                  onShortcutCreateProject={tenantAdminShortcutCreateProject}
                />
              ) : showAdminMgmtProjectsPage ? (
                <TenantAdminProjectsPage
                  demoTenantId={demoTenantId}
                  createProjectModalOpen={tenantAdminCreateProjectModalOpen}
                  onCloseCreateProjectModal={() => setTenantAdminCreateProjectModalOpen(false)}
                />
              ) : showAdminMgmtUsersPage ? (
                <TenantAdminUserManagementPage demoTenantId={demoTenantId} />
              ) : showAdminMgmtQuotaPage ? (
                <TenantAdminQuotaControlPage demoTenantId={demoTenantId} />
              ) : showAdminInfraNetworksPage ? (
                <TenantAdminNetworksPage
                  demoTenantId={demoTenantId}
                  segmentRequestNotice={tenantAdminNetworkSegmentDemoNotice}
                />
              ) : showAdminInfraStoragePage ? (
                <TenantAdminStoragePage
                  demoTenantId={demoTenantId}
                  expansionRequestNotice={tenantAdminStorageExpansionDemoNotice}
                />
              ) : showAdminOrgSettingsPage ? (
                <TenantAdminOrganizationSettingsPage demoTenantId={demoTenantId} />
              ) : showAdminOrgSecurityPage ? (
                <TenantAdminSecurityCompliancePage demoTenantId={demoTenantId} />
              ) : (
                <TenantAdminDashboardPage
                  demoTenantId={demoTenantId}
                  fleetVirtualMachines={allTenantVirtualMachines}
                  isDarkTheme={isDarkTheme}
                  onNavigateToTenantAdmin={navigateTenantAdminFromDashboard}
                  onShortcutOnboardUser={tenantAdminShortcutOnboardUser}
                  onShortcutCreateProject={tenantAdminShortcutCreateProject}
                />
              )}
            </div>
          )
        ) : showClusterTemplatesPage &&
          (demoTenantId === 'northstar' || demoTenantId === 'evergreen') ? (
          <TenantClusterTemplatesCatalog
            navReselectSeq={clusterCatalogNavReselectSeq}
            onOpenCreateClusterFromTemplate={openCreateClusterWizardFromCatalogTemplate}
          />
        ) : showCatalogPage ? (
          <TenantVmTemplatesCatalog
            navReselectSeq={catalogNavReselectSeq}
            onOpenCreateVirtualMachineWizardFromTemplate={
              openCreateVirtualMachineWizardFromCatalogTemplate
            }
          />
        ) : showMyClustersPage &&
          (demoTenantId === 'northstar' || demoTenantId === 'evergreen') ? (
          <TenantClustersPage
            demoTenantId={demoTenantId}
            navReselectSeq={clusterListNavReselectSeq}
            statusFilterIntent={clusterListStatusFilterIntent}
            statusFilterIntentSource={clusterListStatusFilterIntentSource}
            clustersCreatedFromModal={clustersCreatedFromModal}
            provisioningNotice={
              clusterProvisioningNotice?.target === 'my-clusters'
                ? clusterProvisioningNotice
                : null
            }
            onDismissProvisioningNotice={() => setClusterProvisioningNotice(null)}
            onOpenCreateCluster={openCreateClusterModal}
          />
        ) : showVirtualMachinesPage ? (
          <TenantVirtualMachinesPage
            onOpenCreateVirtualMachineModal={openCreateVirtualMachineModal}
            onOpenCloneVirtualMachine={openCreateVirtualMachineWizardFromCloneSource}
            navReselectSeq={vmListNavReselectSeq}
            powerFilterIntent={vmListPowerFilterIntent}
            seedVirtualMachines={seedFleetVirtualMachines}
            vmsCreatedFromTemplate={vmsCreatedFromTemplate}
            createdFilterNavigateSeq={vmListCreatedFilterNavigateSeq}
          />
        ) : (
          <div
            className={
              activeItem === dashboardNavItemId
                ? 'osac-non-catalog-main'
                : 'osac-non-catalog-main osac-non-catalog-main--sparse'
            }
          >
            <div
              className="osac-page-toolbar-sticky"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 'var(--pf-t--global--spacer--md)',
              }}
            >
              {activeItem === dashboardNavItemId ? (
                <div className="osac-page-toolbar-sticky__lead">
                  <Title headingLevel="h1" size="2xl" style={{ margin: 0 }}>
                    {`Welcome ${demoAccountDisplayName(demoTenantId, 'tenantUser', bankTenantUserEntry)}`}
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
                    {dashboardInfrastructureType === 'clusters'
                      ? dashboardClusterPageSubtitle
                      : dashboardVmPageSubtitle}
                  </Content>
                </div>
              ) : (
                <div className="osac-page-toolbar-sticky__lead">
                  <Title headingLevel="h1" size="2xl" style={{ margin: 0 }}>
                    {navLabelForItemId(effectiveShellNavRows, activeItem)}
                  </Title>
                </div>
              )}
              {activeItem === dashboardNavItemId ? (
                <div style={{ flexShrink: 0 }}>
                  {dashboardInfrastructureType === 'clusters' ? (
                    <Button
                      variant="primary"
                      type="button"
                      onClick={openCreateClusterModal}
                      aria-label="Create cluster"
                    >
                      Create cluster
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={openCreateVirtualMachineModal}
                      aria-label="Create virtual machine"
                    >
                      Create virtual machine
                    </Button>
                  )}
                </div>
              ) : null}
            </div>
            {activeItem === dashboardNavItemId && (
              <>
              <div
                className="osac-dashboard-infrastructure-type"
                role="group"
                aria-labelledby="osac-dashboard-infrastructure-type-label"
              >
                <span
                  id="osac-dashboard-infrastructure-type-label"
                  className="osac-dashboard-infrastructure-type__label"
                >
                  Infrastructure type:
                </span>
                <ToggleGroup
                  className="osac-dashboard-infrastructure-type__toggle-group"
                  aria-label="Infrastructure type"
                >
                  <ToggleGroupItem
                    text="Clusters"
                    buttonId="osac-dashboard-infrastructure-clusters"
                    isSelected={dashboardInfrastructureType === 'clusters'}
                    onChange={() => setDashboardInfrastructureType('clusters')}
                  />
                  <ToggleGroupItem
                    text="Virtual machines"
                    buttonId="osac-dashboard-infrastructure-vms"
                    isSelected={dashboardInfrastructureType === 'virtual-machines'}
                    onChange={() => setDashboardInfrastructureType('virtual-machines')}
                  />
                </ToggleGroup>
              </div>
              {dashboardInfrastructureType === 'virtual-machines' ? (
              <>
              <div className="osac-dashboard-vm-stats-grid">
                {dashboardVmStatusStats.map((stat) => {
                  const statCardBodyStyle = {
                    display: 'flex' as const,
                    flexDirection: 'column' as const,
                    gap: 'var(--pf-t--global--spacer--xs)',
                    height: '100%',
                  }
                  const labelTextStyle = {
                    margin: 0,
                    color: 'var(--pf-t--global--text--color--regular)',
                    fontSize: 'var(--pf-t--global--font--size--heading--xs)',
                    fontWeight: 'var(--pf-t--global--font--weight--heading--bold)',
                    lineHeight: 'var(--pf-t--global--font--line-height--heading)',
                    whiteSpace: 'nowrap' as const,
                    overflow: 'hidden' as const,
                    textOverflow: 'ellipsis' as const,
                    minWidth: 0,
                  }
                  const valueTitleStyle = {
                    margin: 0,
                    ...('valueColor' in stat ? { color: stat.valueColor } : {}),
                    fontWeight: 'var(--pf-t--global--font--weight--heading--bold)',
                    whiteSpace: 'nowrap' as const,
                    overflow: 'hidden' as const,
                    textOverflow: 'ellipsis' as const,
                    minWidth: 0,
                  }
                  const valueTitleClassName =
                    stat.key === 'all-vms' ? 'osac-dashboard-clickable-kpi-value' : undefined
                  const captionStyle = {
                    margin: 0,
                    marginTop: 'auto',
                    paddingTop: 'var(--pf-t--global--spacer--xs)',
                    color: 'var(--pf-t--global--text--color--subtle)',
                    fontSize: 'var(--pf-t--global--font--size--body--sm)',
                    lineHeight: 'var(--pf-t--global--font--line-height--body)',
                    whiteSpace: 'nowrap' as const,
                    overflow: 'hidden' as const,
                    textOverflow: 'ellipsis' as const,
                    minWidth: 0,
                  }

                  if (stat.key === 'all-vms') {
                    return (
                      <Card
                        key={stat.key}
                        id="osac-dashboard-all-vms-card"
                        isClickable
                        isFullHeight
                        component="article"
                        className="osac-dashboard-vm-stat-card osac-dashboard-vm-stat-card--link"
                      >
                        <CardHeader
                          selectableActions={{
                            onClickAction: () => {
                              setVmListPowerFilterIntent(null)
                              setActiveItem(virtualMachinesNavItemId)
                            },
                            selectableActionAriaLabel: `${stat.label}, ${stat.value}, ${stat.caption}. Open My VMs`,
                          }}
                        >
                          <CardTitle component="h2" style={labelTextStyle}>
                            {stat.label}
                          </CardTitle>
                        </CardHeader>
                        <CardBody style={statCardBodyStyle}>
                          <Title
                            headingLevel="h3"
                            size="4xl"
                            className={valueTitleClassName}
                            style={valueTitleStyle}
                          >
                            {stat.value}
                          </Title>
                          <Content component="p" title={stat.caption} style={captionStyle}>
                            {stat.caption}
                          </Content>
                        </CardBody>
                      </Card>
                    )
                  }

                  if (stat.key === 'running') {
                    return (
                      <Card
                        key={stat.key}
                        id="osac-dashboard-running-vms-card"
                        isClickable
                        isFullHeight
                        component="article"
                        className="osac-dashboard-vm-stat-card osac-dashboard-vm-stat-card--link"
                      >
                        <CardHeader
                          selectableActions={{
                            onClickAction: () => {
                              setVmListPowerFilterIntent('running')
                              setActiveItem(virtualMachinesNavItemId)
                            },
                            selectableActionAriaLabel: `${stat.label}, ${stat.value}, ${stat.caption}. Open My VMs filtered to running`,
                          }}
                        >
                          <CardTitle component="h2" style={labelTextStyle}>
                            {stat.label}
                          </CardTitle>
                        </CardHeader>
                        <CardBody style={statCardBodyStyle}>
                          <Title
                            headingLevel="h3"
                            size="4xl"
                            className={valueTitleClassName}
                            style={valueTitleStyle}
                          >
                            {stat.value}
                          </Title>
                          <Content component="p" title={stat.caption} style={captionStyle}>
                            {stat.caption}
                          </Content>
                        </CardBody>
                      </Card>
                    )
                  }

                  if (stat.key === 'paused') {
                    return (
                      <Card
                        key={stat.key}
                        id="osac-dashboard-paused-vms-card"
                        isClickable
                        isFullHeight
                        component="article"
                        className="osac-dashboard-vm-stat-card osac-dashboard-vm-stat-card--link"
                      >
                        <CardHeader
                          selectableActions={{
                            onClickAction: () => {
                              setVmListPowerFilterIntent('paused')
                              setActiveItem(virtualMachinesNavItemId)
                            },
                            selectableActionAriaLabel: `${stat.label}, ${stat.value}, ${stat.caption}. Open My VMs filtered to paused`,
                          }}
                        >
                          <CardTitle component="h2" style={labelTextStyle}>
                            {stat.label}
                          </CardTitle>
                        </CardHeader>
                        <CardBody style={statCardBodyStyle}>
                          <Title
                            headingLevel="h3"
                            size="4xl"
                            className={valueTitleClassName}
                            style={valueTitleStyle}
                          >
                            {stat.value}
                          </Title>
                          <Content component="p" title={stat.caption} style={captionStyle}>
                            {stat.caption}
                          </Content>
                        </CardBody>
                      </Card>
                    )
                  }

                  if (stat.key === 'stopped') {
                    return (
                      <Card
                        key={stat.key}
                        id="osac-dashboard-stopped-vms-card"
                        isClickable
                        isFullHeight
                        component="article"
                        className="osac-dashboard-vm-stat-card osac-dashboard-vm-stat-card--link"
                      >
                        <CardHeader
                          selectableActions={{
                            onClickAction: () => {
                              setVmListPowerFilterIntent('stopped')
                              setActiveItem(virtualMachinesNavItemId)
                            },
                            selectableActionAriaLabel: `${stat.label}, ${stat.value}, ${stat.caption}. Open My VMs filtered to stopped`,
                          }}
                        >
                          <CardTitle component="h2" style={labelTextStyle}>
                            {stat.label}
                          </CardTitle>
                        </CardHeader>
                        <CardBody style={statCardBodyStyle}>
                          <Title
                            headingLevel="h3"
                            size="4xl"
                            className={valueTitleClassName}
                            style={valueTitleStyle}
                          >
                            {stat.value}
                          </Title>
                          <Content component="p" title={stat.caption} style={captionStyle}>
                            {stat.caption}
                          </Content>
                        </CardBody>
                      </Card>
                    )
                  }

                  return null
                })}
              </div>
              <DashboardVmUtilizationSection
                isDarkTheme={isDarkTheme}
                onOpenRecentActivities={() => setRecentActivitiesPageOpen(true)}
                fleetVirtualMachines={allTenantVirtualMachines}
                demoTenantId={demoTenantId}
              />
              <DashboardVmQuotaSection
                isDarkTheme={isDarkTheme}
                fleetVirtualMachines={allTenantVirtualMachines}
                tenantUserPersona={
                  demoTenantId === 'northstar' || demoTenantId === 'evergreen' ? demoTenantId : undefined
                }
              />
              </>
              ) : demoTenantId === 'northstar' || demoTenantId === 'evergreen' ? (
                <TenantUserDashboardClusterSection
                  demoTenantId={demoTenantId}
                  isDarkTheme={isDarkTheme}
                  fleetVirtualMachines={allTenantVirtualMachines}
                  clustersCreatedFromModal={clustersCreatedFromModal}
                  provisioningNotice={
                    clusterProvisioningNotice?.target === 'dashboard'
                      ? clusterProvisioningNotice
                      : null
                  }
                  onDismissProvisioningNotice={() => setClusterProvisioningNotice(null)}
                  onNavigateToMyClusters={(statusFilter) => {
                    setClusterListStatusFilterIntent(statusFilter ?? null)
                    setClusterListStatusFilterIntentSource(statusFilter ? 'dashboard' : null)
                    setActiveItem(myClustersNavItemId)
                  }}
                  onOpenRecentActivities={() => setRecentActivitiesPageOpen(true)}
                />
              ) : null}
              </>
            )}
          </div>
        )}
      </PageSection>
    </Page>
  )
}

export default App
