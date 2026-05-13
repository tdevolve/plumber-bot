import { Router } from 'express';
import twilio from 'twilio';
import { config } from '../lib/config';
import { handleSmsIntake } from '../services/intake';

const router = Router();
const { twiml } = twilio;

function validateTwilio(req: any): boolean {
  const signature = req.headers['x-twilio-signature'] as string;
  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  return twilio.validateRequest(config.twilioAuthToken, signature, url, req.body);
}

router.post('/sms/incoming', async (req, res) => {
  if (!validateTwilio(req)) return res.status(403).send('Forbidden');

  const from = req.body.From as string;
  const body = (req.body.Body as string || '').trim();
  const reply = await handleSmsIntake({ from, body });

  const response = new twiml.MessagingResponse();
  response.message(reply);
  res.type('text/xml').send(response.toString());
});

router.post('/voice/incoming', (req, res) => {
  if (!validateTwilio(req)) return res.status(403).send('Forbidden');

  const response = new twiml.VoiceResponse();
  response.say(
    { voice: 'alice' },
    'Thanks for calling. Please send a text to this number with your name and plumbing issue, and we will begin intake immediately.'
  );
  response.hangup();
  res.type('text/xml').send(response.toString());
});

export { router as twilioRouter };
