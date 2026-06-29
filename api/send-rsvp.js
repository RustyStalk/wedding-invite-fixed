module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const {
    name,
    attendance,
    companionship,
    partner_name,
    alcohol,
    alcohol_other,
    comment,
  } = req.body || {};

  if (!name || !attendance || !companionship) {
    return res.status(400).json({ ok: false, error: 'Required fields are missing' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ ok: false, error: 'Telegram environment variables are missing' });
  }

  const alcoholList = Array.isArray(alcohol)
    ? alcohol.filter(Boolean)
    : alcohol
      ? [alcohol]
      : [];

  let alcoholText = alcoholList.length ? alcoholList.join(', ') : 'не указано';

  if (alcoholList.includes('Другое') && alcohol_other) {
    alcoholText += ` (${alcohol_other})`;
  }

  const text = [
    '💍 Новый ответ на свадебное приглашение',
    '',
    `👤 Имя: ${name}`,
    `✅ Присутствие: ${attendance}`,
    `👥 Формат: ${companionship}`,
    `❤️ Имя пары: ${partner_name || 'не указано'}`,
    `🥂 Алкоголь: ${alcoholText}`,
    `💬 Комментарий: ${comment || 'нет'}`,
  ].join('\n');

  try {
    const tgResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });

    if (!tgResponse.ok) {
      const errorText = await tgResponse.text();
      return res.status(500).json({ ok: false, error: `Telegram send failed: ${errorText}` });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Unexpected server error' });
  }
};
