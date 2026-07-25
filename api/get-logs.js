// api/get-logs.js

export default async function handler(req, res) {
  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  const GUILD_ID = '1502453998052180079'; // サーバーID

  if (!BOT_TOKEN) {
    return res.status(500).json({ error: 'DISCORD_BOT_TOKEN が設定されていません。' });
  }

  try {
    // Discord APIから監査ログ（Audit Logs）を取得 (最新50件)
    const response = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/audit-logs?limit=50`, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` }
    });

    if (!response.ok) {
      throw new Error(`Discord API Error: ${response.statusText}`);
    }

    const data = await response.json();

    // ユーザーIDと名前のマップを作成
    const userMap = new Map();
    (data.users || []).forEach(u => userMap.set(u.id, u.global_name || u.username));

    // 監査ログのアクションタイプ変換テーブル
    const actionTypes = {
      1: "サーバー更新",
      10: "チャンネル作成", 11: "チャンネル更新", 12: "チャンネル削除",
      13: "チャンネル権限作成", 14: "チャンネル権限更新", 15: "チャンネル権限削除",
      20: "メンバーキック", 22: "メンバーBAN追加", 23: "メンバーBAN削除",
      24: "メンバー更新", 25: "ロール付与/剥奪", 26: "メンバー移動", 27: "メンバー切断",
      30: "ロール作成", 31: "ロール更新", 32: "ロール削除",
      40: "招待作成", 41: "招待削除",
      72: "メッセージ削除"
    };

    // 取得したログを画面表示用に整形
    const logs = (data.audit_log_entries || []).map(entry => {
      const executor = userMap.get(entry.user_id) || entry.user_id || "不明";
      const actionName = actionTypes[entry.action_type] || `イベント(${entry.action_type})`;
      
      // Snowflake ID から日時を計算
      const timestamp = new Date(Number(BigInt(entry.id) >> 22n) + 1420070400000);
      const timeStr = `${String(timestamp.getMonth() + 1).padStart(2, '0')}/${String(timestamp.getDate()).padStart(2, '0')} ${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}`;

      return {
        id: entry.id,
        time: timeStr,
        type: actionName,
        user: executor,
        details: entry.reason ? `理由: ${entry.reason}` : `対象ID: ${entry.target_id || '-'}`
      };
    });

    return res.status(200).json(logs);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'ログの取得に失敗しました。' });
  }
}
