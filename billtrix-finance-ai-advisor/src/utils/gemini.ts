// server.ts
// Gemini API call utility for expense prediction (runs on frontend)
// Make sure the proxy route is served from your dev server

export interface PredictRequestBody {
  expenses: any[];
  months: number;
}

export interface PredictionResponse {
  totalExpected: number;
  previousMonth: number;
  categories: {
    name: string;
    predicted: number;
    previous: number;
    trend: 'up' | 'down' | 'neutral';
    warning: boolean;
  }[];
}

export async function predictExpensesWithGemini(
  expenses: any[],
  months: number = 6
): Promise<PredictionResponse> {
  // Call local backend proxy instead of Gemini directly
  const response = await fetch('/api/gemini-predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expenses, months }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get prediction from Gemini proxy');
  }

  const result = await response.json();

  // Defensive: If result is not a valid structure, return a base structure
  if (
    !result ||
    typeof result !== 'object' ||
    !('totalExpected' in result && 'previousMonth' in result && Array.isArray(result.categories))
  ) {
    return {
      totalExpected: 0,
      previousMonth: 0,
      categories: [],
    };
  }
  return result;
}
