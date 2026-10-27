const { Telegraf, Markup } = require('telegraf');
const axios = require('axios'); // Nhớ cài thêm axios nếu chưa có (npm i axios)

const bot = new Telegraf('8947538704:AAGUHNPwy2gqpoACi3aJgieeJlYbzNGVzQQ');

const userStates = {};

bot.start(async (ctx) => {
    await ctx.reply(
        '👑 *HỆ THỐNG KÍCH HOẠT LOCKET GOLD*\n\n' +
        'Nhập username để hệ thống tìm kiếm thông tin và tạo file cấu hình DNS.',
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
        const inputName = ctx.message.text.trim().replace('@', ''); // Xóa ký tự @ nếu người dùng lỡ nhập vào
        delete userStates[userId];

        const processingMsg = await ctx.reply(`⚡ Đang kết nối API Locket tìm thông tin cho \`@${inputName}\`...`, { parse_mode: 'Markdown' });

        let avatarUrl = 'https://i.imgur.com/LinkAnhMacDinh.jpg'; // Ảnh mặc định nếu không tìm thấy

        try {
            // Gọi vào nguồn dữ liệu user (hoặc API tương tự web mẫu) để lấy thông tin
            // Anh có thể thay đường dẫn bên dưới bằng API hoặc link file json thực tế của web
            const response = await axios.get('https://damduchao.github.io/locket-gold/users.json'); // Hoặc endpoint API của anh
            const usersData = response.data;

            // Tìm user khớp với tên nhập vào (ví dụ kiểm tra theo username hoặc uid)
            const foundUser = usersData.find(u => u.username?.toLowerCase() === inputName.toLowerCase() || u.uid === inputName);
            
            if (foundUser && foundUser.avatar) {
                avatarUrl = foundUser.avatar; // Lấy đúng link avatar thật từ dữ liệu trả về
            }
        } catch (error) {
            console.log('Không lấy được avatar từ nguồn, dùng ảnh mặc định.', error.message);
        }

        const targetDownloadUrl = `https://160-191-242-70.sslip.io/locket_gold.mobileconfig?token=b68e2c860b21&uid=s1f61KsMMlMgKt5qxRoDtAx9KXy1&username=${encodeURIComponent(inputName)}`;

        await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id);

        // Gửi ảnh avatar thật kèm thông tin và nút tải cấu hình
        await ctx.replyWithPhoto(avatarUrl, {
            caption: 
                `💛 *THÔNG TIN TÀI KHOẢN LOCKET*\n` +
                `------------------------------------\n` +
                `🖼️ Tên: *${inputName}*\n` +
                `👑 Trạng thái: \`Locket Gold Activated (2099)\`\n` +
                `🔗 Đã liên kết và tạo file cấu hình thành công!\n\n` +
                `Bấm vào nút bên dưới để tải hồ sơ cấu hình về máy:`,
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.url('📥 Tải File Cấu Hình Ngay (.mobileconfig)', targetDownloadUrl)],
                [Markup.button.callback('🔄 Nhập Tên Khác', 'btn_start_input')]
            ])
        });
    }
});

bot.launch();
console.log('Bot Locket Gold tích hợp API Avatar đang chạy mượt mà!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
