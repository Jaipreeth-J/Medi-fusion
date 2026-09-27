import { toast } from "sonner";

/**
 * Checks if a Supabase edge function response indicates a rate limit (429).
 * Shows a user-friendly toast and returns true if rate limited.
 */
export function isRateLimited(response: { data?: any; error?: any }): boolean {
  // Check if the response data contains a rate limit error
  const errorMsg =
    response.data?.error ||
    response.error?.message ||
    (typeof response.error === 'string' ? response.error : '');

  const isLimited =
    errorMsg?.toLowerCase?.()?.includes?.('rate limit') ||
    response.error?.status === 429;

  if (isLimited) {
    toast.error("You're making requests too quickly", {
      description: 'Please wait a moment before trying again.',
      duration: 5000,
    });
  }

  return isLimited;
}
