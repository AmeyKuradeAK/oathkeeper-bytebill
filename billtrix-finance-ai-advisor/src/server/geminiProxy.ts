import express, { Request, Response, Router } from 'express';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const router: Router = express.Router();

// Get Gemini API Key
const getGeminiApiKey = () =>
  process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

// Just return the raw text
const parseGeminiResponse = (result: any) => {
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');

  try {
    // Attempt to parse the raw text into a valid JSON object
    const json = JSON.parse(text);
    console.log('Gemini raw response parsed successfully:', json);
    return { raw: json };  // Return the parsed JSON object
  } catch (err) {
    // If parsing fails, log and throw an error
    console.error('Failed to parse Gemini response text:', text);
    throw new Error('Invalid JSON format received from Gemini');
  }
};

// --- Types ---
interface PredictRequestBody {
  expenses: any;
  months: number;
}

interface RoadmapRequestBody {
  age: number;
  income: number;
  increment: number;
  expenses: number;
  retirementAge: number;
  risk: string;
}

// --- /predict ---
router.post(
  '/predict',
  async (
    req: Request<{}, {}, PredictRequestBody>,
    res: Response
  ): Promise<void> => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      res.status(500).json({ error: 'Missing Gemini API key' });
      return;
    }

    const { expenses, months } = req.body;

    const prompt = `You are an AI financial advisor. Given the following user's monthly categorized expenses for the last ${months} months, predict the next month's total and category-wise spending. Also, for each category, provide: trend (up/down/neutral), and flag if there is a spending risk. Respond with a valid JSON object in this format:

{
  "totalExpected": number,
  "previousMonth": number,
  "categories": [
    {
      "name": string,
      "predicted": number,
      "previous": number,
      "trend": "up" | "down" | "neutral",
      "warning": boolean
    }
  ]
}

Expenses data: ${JSON.stringify(expenses)}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, // Use gemini-2.0-flash
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
          }),
        }
      );

      // Check if response is okay (status 200)
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', errorText);
        res.status(500).json({ error: 'Gemini API request failed', details: errorText });
        return;
      }

      const result = await response.json();  // Parse the response as JSON
      const output = parseGeminiResponse(result);  // Parse the response content
      res.json(output);  // Send the valid JSON response back to the client
    } catch (err: any) {
      console.error('Error in /predict handler:', err);
      res.status(500).json({ error: err.message });
    }
  }
);

// --- /roadmap ---
router.post(
  '/roadmap',
  async (
    req: Request<{}, {}, RoadmapRequestBody>,
    res: Response
  ): Promise<void> => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      res.status(500).json({ error: 'Missing Gemini API key' });
      return;
    }

    const { age, income, increment, expenses, retirementAge, risk } = req.body;
    console.log('Received /roadmap request body:', req.body);

    const prompt = `You are an AI financial advisor. Given the user's age (${age}), income (${income}), annual increment (${increment}), monthly expenses (${expenses}), desired retirement age (${retirementAge}), and risk appetite (${risk}), generate a step-by-step financial roadmap for their future.

Respond with a valid JSON object like:

{
  "roadmap": [
    {
      "year": number,
      "age": number,
      "income": number,
      "expenses": number,
      "savings": number,
      "investmentFocus": string
    }
  ]
}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, // Use gemini-2.0-flash
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
          }),
        }
      );

      // Check if response is okay (status 200)
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', errorText);
        res.status(500).json({ error: 'Gemini API request failed', details: errorText });
        return;
      }

      const result = await response.json();  // Parse the response as JSON
      const output = parseGeminiResponse(result);  // Parse the response content
      res.json(output);  // Send the valid JSON response back to the client
    } catch (err: any) {
      console.error('Error in /roadmap handler:', err);
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
