const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('8947538704:AAGUHNPwy2gqpoACi3aJgieeJlYbzNGVzQQ');

const userStates = {};

bot.start(async (ctx) => {
    await ctx.reply(
        '👑 *HỆ THỐNG KÍCH HOẠT LOCKET GOLD*\n\n' +
        'Nhập username để hệ thống tạo trực tiếp file cấu hình DNS.',
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('🔓 Nhập Username Kích Hoạt Ngay', 'btn_start_input')]
            ])
        }
    );
});

bot.action('btn_start_input', async (ctx) => {
    await ctx.answerCbQuery();
    userStates[ctx.from.id] = { step: 'WAITING_INPUT' };
    await ctx.reply('✍️ Vui lòng nhập **Username hoặc UID Locket** của bạn:');
});

bot.on('text', async (ctx) => {
    const userId = ctx.from.id;

    if (userStates[userId] && userStates[userId].step === 'WAITING_INPUT') {
        const inputName = ctx.message.text.trim();
        delete userStates[userId];

        const processingMsg = await ctx.reply(`⚡ Đang tạo file cấu hình cho \`@${inputName}\`...`, { parse_mode: 'Markdown' });

        const targetDownloadUrl = `https://160-191-242-70.sslip.io/locket_gold.mobileconfig?token=b68e2c860b21&uid=s1f61KsMMlMgKt5qxRoDtAx9KXy1&username=${encodeURIComponent(inputName)}`;

        await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id);

        await ctx.reply(
            `👑 *ĐÃ TẠO FILE CẤU HÌNH CHO @${inputName}!*\n\n` +
            `Bấm vào nút bên dưới để Safari tự động tải hồ sơ về máy:`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.url('📥 Tải File Cấu Hình Ngay (.mobileconfig)', targetDownloadUrl)],
                    [Markup.button.callback('🔄 Nhập Tên Khác', 'btn_start_input')]
                ])
            }
        );
    }
});

bot.launch();
console.log('Bot Locket Gold đang chạy mượt mà!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

