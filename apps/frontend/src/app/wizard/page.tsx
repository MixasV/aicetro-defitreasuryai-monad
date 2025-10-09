'use client';
import { AppShell } from '../../components/layout/AppShell';
import { CorporateSetupWizard } from '../../components/setup/CorporateSetupWizard';

export default function WizardPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <CorporateSetupWizard />
      </div>
    </AppShell>
  );
}
