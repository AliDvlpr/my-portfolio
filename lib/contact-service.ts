import type { ContactPayload } from "./contact-validation";
import { normalizeForHash, scoreSpam, validateContactPayload } from "./contact-validation";

export type ContactErrorCode =
  | "VALIDATION_ERROR"
  | "VERIFICATION_ERROR"
  | "RATE_LIMITED"
  | "DUPLICATE_SUBMISSION"
  | "SPAM_DETECTED"
  | "PERSISTENCE_ERROR"
  | "EMAIL_DELIVERY_FAILED"
  | "SERVER_ERROR";

export type ContactOutcome =
  | { success: true; status: 201; requestId: string; message: string }
  | { success: false; status: number; code: ContactErrorCode; message: string; requestId?: string; retryAfter?: number; fields?: Record<string, string> };

export type StoredContact = ContactPayload & {
  id: string;
  requestId: string;
  payloadHash: string;
  sourceHash: string;
  spamScore: number;
  status: "new" | "spam" | "failed";
  createdAt: string;
};

export type ContactDependencies = {
  now(): number;
  createId(): string;
  hash(value: string): Promise<string>;
  verifyTurnstile(token: string, requestId: string): Promise<boolean>;
  checkRateLimit(sourceHash: string, payloadHash: string, now: number): Promise<{ allowed: boolean; duplicate?: boolean; retryAfter?: number }>;
  recordAttempt(sourceHash: string, payloadHash: string, accepted: boolean, now: number): Promise<void>;
  persist(contact: StoredContact): Promise<void>;
  updateDelivery(requestId: string, status: "sent" | "failed" | "skipped"): Promise<void>;
  sendEmails(contact: StoredContact): Promise<void>;
};

export async function processContactSubmission(
  input: unknown,
  sourceIdentity: string,
  dependencies: ContactDependencies,
): Promise<ContactOutcome> {
  const validation = validateContactPayload(input);
  if (!validation.success) {
    return { success: false, status: 400, code: "VALIDATION_ERROR", message: "The submitted form is invalid.", fields: validation.fields };
  }

  const now = dependencies.now();
  const payload = validation.data;
  const requestId = dependencies.createId();
  const [sourceHash, payloadHash] = await Promise.all([
    dependencies.hash(sourceIdentity),
    dependencies.hash(normalizeForHash(payload)),
  ]);
  const rate = await dependencies.checkRateLimit(sourceHash, payloadHash, now);
  if (!rate.allowed) {
    await dependencies.recordAttempt(sourceHash, payloadHash, false, now);
    return rate.duplicate
      ? { success: false, status: 409, code: "DUPLICATE_SUBMISSION", message: "This message was already accepted recently.", requestId }
      : { success: false, status: 429, code: "RATE_LIMITED", message: "Submission rate exceeded. Please try again later.", requestId, retryAfter: rate.retryAfter ?? 600 };
  }

  if (!(await dependencies.verifyTurnstile(payload.turnstileToken, requestId))) {
    await dependencies.recordAttempt(sourceHash, payloadHash, false, now);
    return { success: false, status: 403, code: "VERIFICATION_ERROR", message: "Client verification failed. Refresh the challenge and try again.", requestId };
  }

  const spam = scoreSpam(payload, now);
  const contact: StoredContact = {
    ...payload,
    id: crypto.randomUUID(),
    requestId,
    sourceHash,
    payloadHash,
    spamScore: spam.score,
    status: spam.score >= 6 ? "spam" : "new",
    createdAt: new Date(now).toISOString(),
  };

  try {
    await dependencies.persist(contact);
    await dependencies.recordAttempt(sourceHash, payloadHash, true, now);
  } catch {
    return { success: false, status: 503, code: "PERSISTENCE_ERROR", message: "The message could not be stored safely. Please try again.", requestId };
  }

  if (contact.status === "spam") {
    await dependencies.updateDelivery(requestId, "skipped");
    return { success: false, status: 422, code: "SPAM_DETECTED", message: "The message was rejected by abuse protection.", requestId };
  }

  try {
    await dependencies.sendEmails(contact);
    await dependencies.updateDelivery(requestId, "sent");
    return { success: true, status: 201, requestId, message: "Message accepted" };
  } catch {
    await dependencies.updateDelivery(requestId, "failed");
    return { success: false, status: 502, code: "EMAIL_DELIVERY_FAILED", message: "The message was stored, but email delivery failed. Please try again later.", requestId };
  }
}
