const SKIPCALLS_API_KEY = process.env.SKIPCALLS_API_KEY!;
const SKIPCALLS_API_URL = process.env.SKIPCALLS_API_URL || 'https://be.skipcalls.com/sms/send';

export interface SMSResult {
  phoneNumber: string;
  success: boolean;
  messageId?: string;
  status?: string;
  error?: unknown;
}

export interface SendSMSResponse {
  success: boolean;
  results: SMSResult[];
  totalSent: number;
  totalFailed: number;
}

export async function sendSMSSkipCalls(phoneNumber: string, message: string): Promise<SendSMSResponse> {
  if (!phoneNumber || !message) {
    throw new Error('phoneNumber and message are required');
  }

  if (!SKIPCALLS_API_KEY) {
    throw new Error('SKIPCALLS_API_KEY environment variable is required');
  }

  const results: SMSResult[] = [];

  try {
    const response = await fetch(SKIPCALLS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SKIPCALLS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: phoneNumber,
        message: message
      })
    });

    const data = await response.json();

    results.push({
      phoneNumber: phoneNumber,
      success: response.ok,
      messageId: data.id || data.messageId,
      status: data.status,
      error: !response.ok ? data : undefined
    });
  } catch (err) {
    console.error(err);
    results.push({
      phoneNumber: phoneNumber,
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }

  return {
    success: results.some(r => r.success),
    results: results,
    totalSent: results.filter(r => r.success).length,
    totalFailed: results.filter(r => !r.success).length
  };
}