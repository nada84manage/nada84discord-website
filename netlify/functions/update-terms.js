// netlify/functions/update-terms.js

exports.handler = async (event, context) => {
  // POSTリクエスト以外を拒否
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  // Netlifyの環境変数からトークンを取得
  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  const CHANNEL_ID = "1514032284934733864";
  const MESSAGE_ID = "1529705454496911472";

  if (!BOT_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "環境変数 DISCORD_BOT_TOKEN が設定されていません。" })
    };
  }

  try {
    const { content } = JSON.parse(event.body);

    if (!content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "更新内容が空です。" })
      };
    }

    // Discord APIへPATCHリクエスト送信
    const discordRes = await fetch(
      `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages/${MESSAGE_ID}`,
      {
        method: "PATCH",
        headers: {
          "Authorization": `Bot ${BOT_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          embeds: [
            {
              title: "📜 利用規約 - 灘校84回生＋αグループ",
              description: content,
              color: 3447003,
              timestamp: new Date().toISOString()
            }
          ]
        })
      }
    );

    if (discordRes.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "正常に更新されました。" })
      };
    } else {
      const errorData = await discordRes.json();
      return {
        statusCode: discordRes.status,
        body: JSON.stringify({ error: "Discord API Error", details: errorData })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "サーバー内部エラーが発生しました。", details: error.message })
    };
  }
};
