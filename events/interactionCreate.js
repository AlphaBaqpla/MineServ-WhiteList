//============INTEGRATION CREATE EVENT============
module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client){
        const {MessageEmbed, MessageActionRow, MessageButton} = require('discord.js')
        const { Modal, TextInputComponent, showModal } = require('discord-modals')
        var conf = client.config
        if (!interaction.isButton()) return
        if (interaction.customId == "requestEmbed"){
            if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)){
                return interaction.reply({
                    content: 'У вас уже есть заявка!',
                    ephemeral: true
                })
            }
            interaction.guild.channels.create(`заявка-${interaction.user.username}`,{
                parent: client.config.requestParent,
                topic: interaction.user.id,
                permissionOverwrites: [{
                    id: interaction.user.id,
                    allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                  },
                  {
                    id: client.config.adminRole,
                    allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                  },
                  {
                    id: interaction.guild.roles.everyone,
                    deny: ['VIEW_CHANNEL'],
                  },
                ],
                type: 'text'
            }).then(async c => {
                const sendChannel = client.channels.cache.get(c.id)
                interaction.reply({
                    content: `Заявка создана! Пожалуйста заполните анкету! <#${c.id}>`,
                    ephemeral: true
                })
                const embed = new MessageEmbed()
                .setColor('#00ffe1')
                .setAuthor(
                    {
                        name: 'Заполните Анкету'
                    })
                .setDescription('**Нажмите на кнопку ниже, чтобы заполнить анкету для входа на сервер!**')
                .setThumbnail(client.config.thumbImage)
                .setFooter(
                    {
                        text: client.config.footerText
                    })
                const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('requestChanEmbed')
                        .setLabel('Заполнить Анкету')
                        .setEmoji('💫')
                        .setStyle('SUCCESS')
                        )
                    sendChannel.send(
                        {
                            embeds: [embed],
                            components: [row]
                        }
                    )
                }
            ).catch(e =>{console.log(e)})
        }
        const reqModal = new Modal()
        .setCustomId('requestModal')
        .setTitle('Заполнить Анкету')
        .addComponents(
            new TextInputComponent()
            .setCustomId('nickInput')
            .setLabel('ваш никнейм')
            .setStyle('SHORT')
            .setPlaceholder('напишите свой никнейм в Minecraft')
            .setRequired(true),
            new TextInputComponent()
            .setCustomId('nameInput')
            .setLabel('ваше имя / возраст')
            .setStyle('SHORT')
            .setPlaceholder('напишите своё имя и возраст')
            .setRequired(true),
            new TextInputComponent()
            .setCustomId('cheatsInput')
            .setLabel('как относитесь к читам')
            .setStyle('SHORT')
            .setPlaceholder('напишите, как вы относитесь к читам')
            .setRequired(true),
            new TextInputComponent()
            .setCustomId('findInput')
            .setLabel('как вы узнали о сервере')
            .setStyle('SHORT')
            .setPlaceholder('напишите, как вы узнали о сервере')
            .setRequired(true),
            new TextInputComponent()
            .setCustomId('buildInput')
            .setLabel('что вы собираетесь делать')
            .setStyle('LONG') //'SHORT' or 'LONG'
            .setPlaceholder('напишите, что вы собираетесь делать на сервере')
            .setRequired(true)
            )
            if (!interaction.isButton()) return
            if (interaction.customId == "requestChanEmbed"){
                showModal(reqModal, {
                    client: client,
                    interaction: interaction
                }
            )   
        }

        const admin = '<@'+interaction.user.id+'>'
        const nickname = interaction.channel.topic
        
        if (interaction.customId == "addPlayer"){
            if(interaction.member.permissions.has("ADMINISTRATOR")){
                interaction.reply({
                    content: '**Заявка одобрена админом '+admin+' и игрок "'+nickname+'" успешно добавлен в вайтлист!**'
                })
                const Rcon = require('rcon')
                const o = {tcp:true,challenge:false}
                const conn = new Rcon(conf.RCon.IP, conf.RCon.Port, conf.RCon.Password, o)
                conn.on('auth', function(){
                  var cmd = conf.WhiteList.addCommand.replaceAll('$user',nickname)
                    console.log("Authenticated")
                    console.log("Sending command: "+cmd)
                    conn.send(cmd)
                }).on('response', function(str){
                    console.log("Response: " + str)
                    conn.disconnect()
                }).on('error', function(err){
                    console.log("Error: " + err)
                }).on('end', function(){
                    console.log("Connection closed")
                })
                conn.connect()
                console.info('Игрок "'+nickname+'" добавлен в вайтлист')
                //var role = message.guild.roles.cache.find(role => role.id === conf.playerRole);
                //var user = message.guild.members.cache.get('');
                //user.roles.add(role)
            }
            else{
                interaction.reply({
                    content: '**У вас недостаточно прав для использования данной кнопки!**',
                    ephemeral: true
                })
            }
        }

        if (interaction.customId == "removePlayer"){
            if(interaction.member.permissions.has("ADMINISTRATOR") || interaction.user.id == '993970004615757906'){
                interaction.reply({
                    content: '**Заявка отклонена '+admin+' и игрок "'+nickname+'" удалён из в вайтлиста!**',
                })
                const Rcon = require('rcon')
                const o = {tcp:true,challenge:false}
                const conn = new Rcon(conf.RCon.IP, conf.RCon.Port, conf.RCon.Password, o)
                conn.on('auth', function(){
                  var cmd = conf.WhiteList.remCommand.replaceAll('$user',nickname)
                    console.log("Authenticated")
                    console.log("Sending command: "+cmd)
                    conn.send(cmd)
                }).on('response', function(str){
                    console.log("Response: " + str)
                    conn.disconnect()
                }).on('error', function(err){
                    console.log("Error: " + err)
                }).on('end', function(){
                    console.log("Connection closed")
                })
                conn.connect()
                console.info('Игрок "'+nickname+'" удалён из ВЛ')
            }
            else{
                interaction.reply({
                    content: '**У вас недостаточно прав для использования данной кнопки!**',
                    ephemeral: true
                })
            }
        }
        if (interaction.customId == "deleteChan"){
            const embed = new MessageEmbed()
                .setColor('#00ffe1')
                .setAuthor({
                    name: 'подтвердить удаление заявки!'
                })
                .setDescription('**Вы точно хотите удалить заявку? Это действие невозможно отменить!**')
                .setThumbnail(client.config.thumbImage)
                .setFooter({
                    text: client.config.footerText
                })
            const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('not')
                .setLabel('отменить')
                .setEmoji('💚')
                .setStyle('SUCCESS'),
                new MessageButton()
                .setCustomId('yes')
                .setLabel('удалить')
                .setEmoji('❤️')
                .setStyle('DANGER'),
            )
            interaction.reply({
                embeds: [embed],
                components: [row]
            })
        }
        if (interaction.customId == "not"){
            const embed = new MessageEmbed()
            .setColor('#00ffe1')
            .setAuthor({
                name: 'удаление заявки отменено!'
            })
            .setDescription('**мяу!**')
            .setThumbnail(client.config.thumbImage)
            .setFooter({
                text: client.config.footerText
            })
            interaction.reply({
                embeds: [embed]
            })
        }
        if (interaction.customId == "yes"){
            const embed = new MessageEmbed()
            .setColor('#00ffe1')
            .setAuthor({
                name: 'заявка будет удалена через 10 секунд!'
            })
            .setDescription('**Эх, прощай, мы с тобой больше не увидимся (но это не точно)**')
            .setThumbnail(client.config.thumbImage)
            .setFooter({
                text: client.config.footerText
            })
            interaction.reply({
                embeds: [embed]
            })
            setTimeout(() => {
                const delChan = client.channels.cache.get(interaction.channel.id)
                delChan.delete()
            }, 10000)
        }
    }
}