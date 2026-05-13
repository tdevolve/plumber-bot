import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export const config = {
  port: Number(process.env.PORT || 3000),
  twilioAuthToken: required('TWILIO_AUTH_TOKEN'),
  twilioAccountSid: required('TWILIO_ACCOUNT_SID'),
  twilioNumber: required('TWILIO_NUMBER')
};
