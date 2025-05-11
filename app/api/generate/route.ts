import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();

  const { subject, grade, unit, hours, genre } = body;

  const prompt = `
あなたは小学校の国語教師アシスタントです。
以下の情報をもとに、学習目標や授業展開を含む国語の授業案を作成してください。

【教科書】${subject}
【学年】${grade}
【単元名】${unit}
【授業時間数】${hours}
【ジャンル】${genre}

※ 児童が意欲的に取り組めるように工夫してください。
`;

  console.log('送信されたプロンプト:', prompt); // デバッグ用

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY が設定されていません。');
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'あなたは優秀な国語教師です。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    const data = await res.json();console.log('GPTからの返答:', data);
    
    return NextResponse.json({ result: data.choices?.[0]?.message?.content ?? '生成に失敗しました。' });

  } catch (err: any) {
    console.error('エラー:', err);
    return NextResponse.json({ result: 'エラーが発生しました。' });
  }
}
