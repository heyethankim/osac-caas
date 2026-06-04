import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  Button,
  Content,
} from '@patternfly/react-core'

export type ClusterProvisioningNotice = {
  clusterId: string
  clusterName: string
}

export type ClusterProvisioningNoticeTarget = 'dashboard' | 'my-clusters'

export type ClusterProvisioningNoticeState = ClusterProvisioningNotice & {
  target: ClusterProvisioningNoticeTarget
}

export function ClusterProvisioningNoticeAlert({
  clusterName,
  onDismiss,
  showViewProvisioningLink = false,
  onViewProvisioning,
  className,
}: {
  clusterName: string
  onDismiss?: () => void
  showViewProvisioningLink?: boolean
  onViewProvisioning?: () => void
  className?: string
}) {
  return (
    <Alert
      isInline
      variant={AlertVariant.info}
      title="Cluster provisioning started"
      className={['create-cluster-provisioning-notice', className].filter(Boolean).join(' ')}
      actionClose={
        onDismiss ? (
          <AlertActionCloseButton
            aria-label="Dismiss cluster provisioning notice"
            onClose={onDismiss}
          />
        ) : undefined
      }
    >
      <div className="create-cluster-provisioning-notice__body">
        <Content component="p" className="create-cluster-provisioning-notice__message">
          <strong>{clusterName}</strong> is provisioning. Control plane and worker nodes are still
          coming online.
          {showViewProvisioningLink ? null : (
            <>
              {' '}
              The list below is filtered to <strong>Provisioning</strong> so you can follow every
              cluster still coming online.
            </>
          )}
        </Content>
        {showViewProvisioningLink && onViewProvisioning ? (
          <div className="create-cluster-provisioning-notice__actions">
            <Button variant="link" isInline onClick={onViewProvisioning}>
              View provisioning clusters
            </Button>
          </div>
        ) : null}
      </div>
    </Alert>
  )
}
