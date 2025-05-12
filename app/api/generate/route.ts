import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

// ✅ OpenAI クライアント初期化（App Router用）
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const {
      subject,
      grade,
      genre,
      unit,
      hours,
      unitGoal,
      lessonPlan,
      languageActivities,
      evaluationPoints,
      childImage,
    } = await req.json();

    // ✅ プロンプト（順番・語尾指定あり）
    const prompt = `
以下の情報をもとに、小学校国語の授業案を作成してください。
出力は以下の順番・見出しに従って、実践的でわかりやすく整えてください。

1. 教科書名
2. 学年
3. ジャンル
4. 単元名
5. 授業時間数

■ 単元の目標：
〜することができる。で終わる文にしてください。

■ 評価の観点：
〜することができる。で終わる文にしてください。

■ 育てたい子どもの姿：
自然で簡潔な表現で。

■ 授業の展開：
各時間ごとに1時間目〜○時間目の構成で整理してください。

■ 言語活動の工夫：
自然な語尾（〜する。）や丁寧な表現で記述してください。

以下の情報を参考にしてください：

教科書名：${subject}
学年：${grade}
ジャンル：${genre}
単元名：${unit}
授業時間数：${hours}

■ 単元の目標：
${unitGoal}

${evaluationPoints}

■ 育てたい子どもの姿：
${childImage}

${lessonPlan}

■ 言語活動の工夫：
${languageActivities}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'あなたは小学校の国語の授業を支援する専門アシスタントです。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const message = completion.choices[0]?.message?.content || '出力がありませんでした。';

    return NextResponse.json({ result: message });
  } catch (error) {
    console.error('生成エラー:', error);
    return NextResponse.json({ error: '授業案の生成に失敗しました。' }, { status: 500 });
  }
}

