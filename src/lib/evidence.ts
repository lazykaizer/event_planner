/**
 * Evidence verification utility for Quote X-Ray.
 *
 * Verifies that extracted snippets for perUnitPrice, fixedCharges, advance,
 * taxes, paymentMode, and cancellationTerms actually appear in the user's
 * original quote text (case-insensitive, whitespace-trimmed).
 */

export const UNVERIFIED_EVIDENCE = 'Could not verify from your text';

export interface EvidenceVerificationResult {
  verified: boolean;
  snippet: string;
}

export interface ExtractedEvidence {
  perUnitPrice?: string | null;
  fixedCharges?: string | null;
  advance?: string | null;
  taxes?: string | null;
  paymentMode?: string | null;
  cancellationTerms?: string | null;
}

export interface VerifiedEvidence {
  perUnitPrice?: EvidenceVerificationResult;
  fixedCharges?: EvidenceVerificationResult;
  advance?: EvidenceVerificationResult;
  taxes?: EvidenceVerificationResult;
  paymentMode?: EvidenceVerificationResult;
  cancellationTerms?: EvidenceVerificationResult;
}

/**
 * Verifies that an individual evidence snippet exists within the raw quote text.
 * Performs a case-insensitive, whitespace-trimmed substring search.
 *
 * @param snippet - The snippet extracted by the AI model.
 * @param quoteText - The user's original unformatted quote text.
 * @returns Verification result indicating if the snippet is found and the verified snippet.
 */
export function verifyEvidence(
  snippet: string | null | undefined,
  quoteText: string
): EvidenceVerificationResult {
  if (!snippet || typeof snippet !== 'string' || snippet.trim() === '') {
    return {
      verified: false,
      snippet: UNVERIFIED_EVIDENCE,
    };
  }

  const cleanSnippet = snippet.trim();
  const cleanQuote = (quoteText || '').trim();

  if (!cleanQuote) {
    return {
      verified: false,
      snippet: UNVERIFIED_EVIDENCE,
    };
  }

  // Case-insensitive substring verification
  const isPresent = cleanQuote.toLowerCase().includes(cleanSnippet.toLowerCase());

  if (isPresent) {
    return {
      verified: true,
      snippet: cleanSnippet,
    };
  }

  return {
    verified: false,
    snippet: UNVERIFIED_EVIDENCE,
  };
}

/**
 * Verifies all 6 key quote evidence fields against the original quote text.
 */
export function verifyAllEvidence(
  evidence: ExtractedEvidence | undefined | null,
  quoteText: string
): VerifiedEvidence {
  return {
    perUnitPrice: verifyEvidence(evidence?.perUnitPrice, quoteText),
    fixedCharges: verifyEvidence(evidence?.fixedCharges, quoteText),
    advance: verifyEvidence(evidence?.advance, quoteText),
    taxes: verifyEvidence(evidence?.taxes, quoteText),
    paymentMode: verifyEvidence(evidence?.paymentMode, quoteText),
    cancellationTerms: verifyEvidence(evidence?.cancellationTerms, quoteText),
  };
}
