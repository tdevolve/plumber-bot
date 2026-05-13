import { closeConversation, createConversation, createJob, getConversation, updateConversation } from '../db/db';
import { triageJob } from './triage';

export async function handleSmsIntake({ from, body }: { from: string; body: string }): Promise<string> {
  let convo = getConversation(from);
  if (!convo) convo = createConversation(from);

  const text = (body || '').trim();

  switch (convo.step) {
    case 'ask_name':
      updateConversation(from, { name: text, step: 'ask_address' });
      return 'Thanks. What is the service address for this plumbing issue?';

    case 'ask_address':
      updateConversation(from, { address: text, step: 'ask_issue' });
      return 'Got it. Briefly describe the plumbing issue.';

    case 'ask_issue':
      updateConversation(from, { issue: text, step: 'ask_urgency' });
      return 'How urgent is it: emergency, same day, next day, or flexible?';

    case 'ask_urgency':
      updateConversation(from, { urgency: text, step: 'ask_window' });
      return 'When would you prefer service: today, tomorrow morning, tomorrow afternoon, or flexible?';

    case 'ask_window': {
      const finalConvo = updateConversation(from, { preferred_window: text });

      const triage = triageJob({
        issue: finalConvo.issue || '',
        urgency: finalConvo.urgency || '',
        address: finalConvo.address || ''
      });

      const job = createJob({
        phone: from,
        customer_name: finalConvo.name || '',
        address: finalConvo.address || '',
        issue: finalConvo.issue || '',
        urgency: finalConvo.urgency || '',
        preferred_window: text,
        notes: 'Captured by Twilio plumbing bot.',
        triage_risk_score: triage.riskScore,
        triage_priority_band: triage.priorityBand,
        triage_category: triage.category,
        triage_action: triage.recommendedAction
      });

      closeConversation(from);
      return `Thank you ${job.customer_name || ''}. Your request is logged as ${triage.priorityBand.toUpperCase()} priority. Job #${job.id} is pending confirmation from the office.`;
    }

    default:
      return 'We already captured your request. The office will follow up shortly.';
  }
}
