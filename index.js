const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

const userTimers = new Map();
const userState = {};

// Escanear QR Code
client.on('qr', (qr) => {
    console.log('Escaneie o QR Code abaixo:');
    qrcode.generate(qr, { small: true });
});

// Quando o bot estiver pronto
client.on('ready', () => {
    console.log('✅ Bot conectado ao WhatsApp!');
});

// Função para verificar se a mensagem vem de um grupo
const isGroupMessage = (msg) => msg.from.endsWith('@g.us');

client.on('message', async (msg) => {
    // Se for mensagem de grupo, ignorar
    if (isGroupMessage(msg)) return;

    const lowerMsg = msg.body.toLowerCase();
    const userId = msg.from;

    // Se o usuário não tem um estado salvo, inicia no menu inicial
    if (!userState[userId]) {
        userState[userId] = { stage: 'menu_inicial' };
        msg.reply('Ola!\nSim, isso é um chatbot criado por mim.\nAgora escolha uma das opções:\n1️⃣ - Família e/ou amigos\n2️⃣ - Trabalho TG\n3️⃣ - Projetos Dev\n4️⃣ - TV\n5️⃣ - VPN\n6️⃣ - Fofoca');
        
        // Define um temporizador para resetar o estado após 10 minutos
        const resetTimer = setTimeout(() => {
            client.sendMessage(userId, 'Bem-vindo ao menu inicial...\n\nDigite qualquer coisa para começar novamente.');
            delete userState[userId];
            userTimers.delete(userId);
        }, 10 * 60 * 1000);

        userTimers.set(userId, resetTimer);
        return;
    }

    const state = userState[userId].stage;

    if (lowerMsg === '/voltar') {
        userState[userId].stage = 'menu_inicial';
        msg.reply('Você voltou ao menu inicial.');
        return;
    }

    if (state === 'menu_inicial') {
        switch (lowerMsg) {
            case '1':
                msg.reply('Pow! Foi mal, sei que to ausente, assim que der prometo que vou mandar msg. Dessa vez não vou falar "vamos marcar!"');
                break;
            case '2':
                msg.reply('Ótimo! Deixe sua mensagem, estarei respondendo o mais breve possível.');
                break;
            case '3':
                msg.reply('Obrigado por sua mensagem!\nPoderia me dizer onde encontrou nosso contato:\n1️⃣ - 99Freela\n2️⃣ - Facebook\n3️⃣ - Outros\n\n*A qualquer momento pode voltar ao menu inicial digitando /voltar*');
                userState[userId].stage = 'projetos_dev';
                break;
            case '4':
            case '5':
                msg.reply('Perfeito!\nEscolha uma opção:\n1️⃣ - Contratação\n2️⃣ - Renovação\n3️⃣ - Suporte\n4️⃣ - Outros\n\n*A qualquer momento pode voltar ao menu inicial digitando /voltar*');
                userState[userId].stage = 'vpn_tv';
                break;
            case '6':
                msg.reply('Fala logo!');
                setTimeout(() => {
                    msg.reply('Conte-me!');
                }, 5000);
                setTimeout(() => {
                    msg.reply('Vai fala!!!');
                }, 5000);
                break;
            default:
                msg.reply('Opção inválida, favor escolha uma das opções acima!');
                break;
        }
        return;
    }

    if (state === 'projetos_dev') {
        switch (lowerMsg) {
            case '1':
                msg.reply('Entendido! Você nos encontrou no 99Freela. Como posso te ajudar com o projeto?');
                break;
            case '2':
                msg.reply('Entendido! Você nos encontrou no Facebook. O projeto é um desenvolvimento novo ou continuação?');
                break;
            case '3':
                msg.reply('Sem problemas! Poderia me informar mais detalhes sobre o projeto?');
                break;
            default:
                msg.reply('Opção inválida, favor escolher 1, 2 ou 3.');
                break;
        }
        userState[userId].stage = 'menu_inicial'; // Voltar ao menu após resposta
        return;
    }

    if (state === 'vpn_tv') {
        switch (lowerMsg) {
            case '1':
                msg.reply('Ótimo! Seja bem-vindo, já conhece nosso produto?\n1️⃣ - Sim\n2️⃣ - Não');
                userState[userId].stage = 'vpn_contratacao';
                break;
            case '2':
                msg.reply('Renovação escolhida! O número de telefone é esse mesmo?\n1️⃣ - Sim\n2️⃣ - Não');
                userState[userId].stage = 'vpn_renovacao';
                break;
            case '3':
                msg.reply('Precisa de suporte? Fale um pouco mais sobre o problema para que possamos ajudar.');
                userState[userId].stage = 'menu_inicial';
                break;
            case '4':
                msg.reply('Certo! Como posso ajudar?');
                userState[userId].stage = 'menu_inicial';
                break;
            default:
                msg.reply('Opção inválida, favor escolher 1, 2, 3 ou 4.');
                break;
        }
        return;
    }

    if (state === 'vpn_contratacao') {
        if (lowerMsg === '1') {
            msg.reply('Ótimo! Em breve entraremos em contato para explicar o processo.');
        } else if (lowerMsg === '2') {
            msg.reply('Sem problemas! Podemos agendar um horário para explicar como funciona.');
        } else {
            msg.reply('Opção inválida. Responda com 1 ou 2.');
            return;
        }
        userState[userId].stage = 'menu_inicial';
        return;
    }

    if (state === 'vpn_renovacao') {
        if (lowerMsg === '1') {
            msg.reply('Entendi, confirme se o login está correto:\nLogin: *seu_login_aqui*\n1️⃣ - Sim\n2️⃣ - Não');
            userState[userId].stage = 'vpn_login';
        } else if (lowerMsg === '2') {
            msg.reply('Qual o número de telefone do responsável pelo ponto?');
            userState[userId].stage = 'menu_inicial';
        } else {
            msg.reply('Opção inválida. Responda com 1 ou 2.');
            return;
        }
        return;
    }

    if (state === 'vpn_login') {
        if (lowerMsg === '1') {
            msg.reply('Obrigado! Sua renovação está sendo processada.');
        } else if (lowerMsg === '2') {
            msg.reply('Por favor, envie o login correto.');
        } else {
            msg.reply('Opção inválida. Responda com 1 ou 2.');
            return;
        }
        userState[userId].stage = 'menu_inicial';
        return;
    }
});

client.initialize();
