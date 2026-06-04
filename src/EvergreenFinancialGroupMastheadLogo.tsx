import { BluestoneMarkIcon } from './BluestoneMarkIcon'

export type EvergreenFinancialGroupMastheadLogoProps = {
  /** Kept for call sites; tenant and provider org views use the same demo brand. */
  brandPresentation?: 'tenantShell' | 'providerOrg'
}

/** Masthead mark + wordmark (BlueSolace Financial Group in tenant and provider contexts). Demo id: `evergreen`. */
export function EvergreenFinancialGroupMastheadLogo({
  brandPresentation: _brandPresentation = 'tenantShell',
}: EvergreenFinancialGroupMastheadLogoProps) {
  const line1 = 'BlueSolace'
  const ariaLabel = 'BlueSolace Financial Group'
  return (
    <div className="evergreen-masthead-brand" role="img" aria-label={ariaLabel}>
      <span className="evergreen-masthead-brand__mark" aria-hidden>
        <BluestoneMarkIcon className="evergreen-masthead-brand__logo-img" />
      </span>
      <span className="evergreen-masthead-brand__text">
        <span className="evergreen-masthead-brand__line1">{line1}</span>
        <span className="evergreen-masthead-brand__line2">Financial Group</span>
      </span>
    </div>
  )
}
