// A successful HTTP response is not enough to claim registration or email send.
export function withdrawalReceipt(response) {
  if (!response || typeof response.reference !== 'string' || !response.reference.trim()
      || response.reference.length > 160 || typeof response.received_at !== 'string'
      || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(response.received_at)
      || !Number.isFinite(Date.parse(response.received_at)) || typeof response.receipt_text !== 'string'
      || !response.receipt_text.trim() || response.receipt_text.length > 20000 || typeof response.email_sent !== 'boolean') {
    throw new Error('Withdrawal receipt not confirmed');
  }
  return response;
}
