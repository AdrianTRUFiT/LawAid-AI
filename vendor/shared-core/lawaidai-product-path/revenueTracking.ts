import { RevenueEvent, RevenueSnapshot } from './casePathContracts';

export function calculateRevenueSnapshot(event: RevenueEvent): RevenueSnapshot {
  const totalCost = event.adSpend + event.aiCost + event.hostingCost;
  const netRevenue = event.grossRevenue - totalCost - event.refunds;
  const roas = event.adSpend > 0 ? event.grossRevenue / event.adSpend : 0;
  const cacPaidOnly = event.paidConversions > 0 ? event.adSpend / event.paidConversions : event.adSpend;

  let status: RevenueSnapshot['status'] = 'UNPROVEN';

  if (event.paidConversions === 0 || event.grossRevenue === 0) {
    status = 'UNPROVEN';
  } else if (roas >= 2 && netRevenue > 0) {
    status = 'PROFITABLE';
  } else {
    status = 'UNPROFITABLE';
  }

  return {
    status,
    roas,
    cacPaidOnly,
    netProfit: netRevenue,
    rule: '$1_SPEND_MUST_RETURN_$2_PLUS_REVENUE'
  };
}
