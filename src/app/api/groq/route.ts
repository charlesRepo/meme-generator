import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://meme-generator-9bb1gcp01-charles-projects-c6138544.vercel.app',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY not set' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://meme-generator-9bb1gcp01-charles-projects-c6138544.vercel.app',
      }
    });
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192', 
      messages: [
        { role: 'system', content: 'You are a creative meme generator.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { 
      status: res.status,
      headers: {
        'Access-Control-Allow-Origin': 'https://meme-generator-9bb1gcp01-charles-projects-c6138544.vercel.app',
      }
    });
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content || '';
  const suggestions = content
    .split(/\n|\*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return NextResponse.json({ suggestions }, {
    headers: {
      'Access-Control-Allow-Origin': 'https://meme-generator-9bb1gcp01-charles-projects-c6138544.vercel.app',
    },
  });
}
