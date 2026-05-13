export type JobInput = {
  issue: string;
  urgency: string;
  address: string;
};

export type TriageResult = {
  riskScore: number;          // 0–100
  priorityBand: 'low' | 'normal' | 'high' | 'critical';
  category: 'leak' | 'clog' | 'no_water' | 'gas' | 'fixture' | 'other';
  recommendedAction: 'call_now' | 'same_day_visit' | 'next_day_visit' | 'schedule_window';
};

export function triageJob(job: JobInput): TriageResult {
  const text = (job.issue || '').toLowerCase();
  const urgency = (job.urgency || '').toLowerCase();

  let baseRisk = 10;
  let category: TriageResult['category'] = 'other';

  if (text.includes('burst') || text.includes('gushing') || text.includes('flood') || text.includes('ceiling')) {
    baseRisk += 50;
    category = 'leak';
  }
  if (text.includes('leak') || text.includes('drip') || text.includes('water')) {
    baseRisk += 25;
    if (category === 'other') category = 'leak';
  }
  if (text.includes('clog') || text.includes('backing up') || text.includes('backed up') || text.includes('slow drain')) {
    baseRisk += 20;
    if (category === 'other') category = 'clog';
  }
  if (text.includes('no water') || text.includes('no running water')) {
    baseRisk += 40;
    category = 'no_water';
  }
  if (text.includes('gas') || text.includes('smell') || text.includes('odor')) {
    baseRisk += 60;
    category = 'gas';
  }
  if (text.includes('toilet') || text.includes('faucet') || text.includes('sink') || text.includes('shower')) {
    baseRisk += 10;
    if (category === 'other') category = 'fixture';
  }

  if (urgency.includes('emergency')) baseRisk += 30;
  if (urgency.includes('same')) baseRisk += 15;
  if (urgency.includes('flexible')) baseRisk -= 5;

  let priorityBand: TriageResult['priorityBand'] = 'normal';
  if (baseRisk >= 80) priorityBand = 'critical';
  else if (baseRisk >= 50) priorityBand = 'high';
  else if (baseRisk <= 20) priorityBand = 'low';

  let recommendedAction: TriageResult['recommendedAction'] = 'schedule_window';
  if (priorityBand === 'critical') recommendedAction = 'call_now';
  else if (priorityBand === 'high') recommendedAction = 'same_day_visit';
  else if (priorityBand === 'normal') recommendedAction = 'next_day_visit';

  return {
    riskScore: Math.max(0, Math.min(100, baseRisk)),
    priorityBand,
    category,
    recommendedAction,
  };
}
