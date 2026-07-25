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
    const { title, content, color, version } = JSON.parse(event.body);

    // 16進数カラーコード処理
    let colorDecimal = 3447003;
    if (color) {
      colorDecimal = parseInt(color.replace("#", ""), 16);
    }

    // フッターテキストの設定 (N84ボット v〇〇)
    const footerText = version ? `N84ボット v${version}` : undefined;

    // Embedデータの作成 (timestampを削除)
    const embedPayload = {
      embeds: [
        {
          title: title || "📜 利用規約",
          description: content || "",
          color: colorDecimal,
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
