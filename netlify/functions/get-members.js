// netlify/functions/get-members.js

exports.handler = async function(event, context) {
  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN; // 環境変数にセットしたBotトークン
  const GUILD_ID = '1502453998052180079'; // サーバーID

  if (!BOT_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'DISCORD_BOT_TOKEN が設定されていません。' })
    };
  }

  try {
    // Node.js標準の fetch を使用してDiscord APIからメンバーを取得
    const response = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members?limit=1000`, {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Discord API Error: ${response.statusText}`);
    }

    const members = await response.json();

    // 必要なデータ（表示名 と ID）を抽出
    let memberList = members.map(m => {
      const name = m.nick || (m.user && m.user.global_name) || (m.user && m.user.username) || '不明';
      return {
        id: m.user.id,
        name: name
      };
    });

    // 50音順にソート
    memberList.sort((a, b) => a.name.localeCompare(b.name, 'ja'));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberList)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'メンバー一覧の取得に失敗しました。' })
    };
  }
};
