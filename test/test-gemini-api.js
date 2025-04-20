// test-gemini-api.mjs
const fetch = require('node-fetch');

async function testGeminiRoadmap() {
  const url = 'http://localhost:3001/api/gemini/roadmap';
  const body = {
    age: 30,
    income: 1000000,
    increment: 5,
    expenses: 25000,
    retirementAge: 60,
    risk: 'moderate'
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('API Test Error:', err);
  }
}

testGeminiRoadmap();