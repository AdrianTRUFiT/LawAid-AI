import { RevenueEvent } from './casePathContracts';
import { RevenueDashboardViewModel } from './shellViewContracts';
import { calculateRevenueSnapshot } from './revenueTracking';

export function buildRevenueDashboardViewModel(event?: RevenueEvent): RevenueDashboardViewModel {
  if (!event) {
    return {
      status: 'UNPROVEN',
      roas: 0,
      cacPaidOnly: 0,
      netProfit: 0,
      message: 'No revenue event available. Channel economics are unproven.'
    };
  }

  const snapshot = calculateRevenueSnapshot(event);

  return {
    status: snapshot.status,
    roas: snapshot.roas,
    cacPaidOnly: snapshot.cacPaidOnly,
    netProfit: snapshot.netProfit,
    message: snapshot.status === 'PROFITABLE'
      ? 'Channel currently satisfies the $1 to $2+ revenue rule.'
      : 'Channel should not scale until paid conversion economics improve.'
  };
}
