// netlify/functions/update-terms.js

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

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
    const { action, title, content, color, version } = JSON.parse(event.body);

    // カラーコードの処理 (#ffffff -> 10進数数値)
    let colorDecimal = 3447003; // デフォルト色
    if (color) {
      colorDecimal = parseInt(color.replace("#", ""), 16);
    }

    // フッターテキストの生成
    const footerText = version ? `N84ボット v${version}` : undefined;

    // リクエストに応じたEmbedデータの作成
    const embedPayload = {
      embeds: [
        {
          title: title || "📜 利用規約",
          description: content || "",
          color: colorDecimal,
          timestamp: new Date().toISOString(),
          ...(footerText && { footer: { text: footerText } })
        }
      ]
    };

    // Discord APIへPATCH送信
    const discordRes = await fetch(
      `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages/${MESSAGE_ID}`,
      {
        method: "PATCH",
        headers: {
          "Authorization": `Bot ${BOT_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(embedPayload)
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
