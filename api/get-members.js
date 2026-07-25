export default async function handler(req, res) {
  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  const GUILD_ID = '1502453998052180079';

  if (!BOT_TOKEN) {
    return res.status(500).json({ error: 'DISCORD_BOT_TOKEN が設定されていません。' });
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members?limit=1000`, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` }
    });

    if (!response.ok) throw new Error(`Discord API Error: ${response.statusText}`);

    const data = await response.json();
    const members = data
      .filter(m => !m.user.bot)
      .map(m => ({
        name: m.nick || m.user.global_name || m.user.username,
        id: m.user.id
      }));

    members.sort((a, b) => a.name.localeCompare(b.name, 'ja'));

    return res.status(200).json(members);
  } catch (error) {
    return res.status(500).json({ error: '取得に失敗しました。' });
  }
}
