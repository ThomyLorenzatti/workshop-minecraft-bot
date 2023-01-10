const mineflayer = require('mineflayer')
const Item = require('prismarine-item')('1.18.1')
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear } = require('mineflayer-pathfinder').goals
const mcData = require('minecraft-data')('1.18.1')
const vec3 = require('vec3').Vec3
// const { mineflayer: mineflayerViewer } = require('prismarine-viewer')


const bot = mineflayer.createBot({ username: 'WorkshopBot' })
const sleep = ms => new Promise(r => setTimeout(r, ms));


// bot.once('spawn', () => {
    //   mineflayerViewer(bot, { port: 3007, firstPerson: true })
    // })

function goAtPlayer(defaultMove, target) {
    var p;
    p = target.position
    bot.pathfinder.setMovements(defaultMove)
    bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 1))
}

function goAtCoord(defaultMove, coords) {
    coords = coords[1].split(" ")
    bot.pathfinder.setMovements(defaultMove)
    bot.pathfinder.setGoal(new GoalNear(coords[0], coords[1], coords[2], 1))
}
    
bot.once('spawn', () => {
    
    bot.loadPlugin(pathfinder)
    const defaultMove = new Movements(bot, mcData)

    bot.on('chat', (username, message) => {
        if (username === bot.username) return
        if (message == "Ping") bot.chat("Pong!")
        const target = bot.players[username] ? bot.players[username].entity : null
        if (message === 'come' && username === 'ZaToX3005') {
            if (!target) {
                bot.chat('I don\'t see you !')
                return
            }
            goAtPlayer(defaultMove, target);
            bot.chat('I\'m here master!')
        }
        if (message.startsWith('come at') && username === 'ZaToX3005') {
            if (!target) {
                bot.chat('I don\'t see you !')
                return
            }
            let coords = message.split('come at ')
            goAtCoord(defaultMove, coords);
            if (bot)
            bot.whisper(username, 'I\'m at the indicated point master!')
        }
        if (message === 'How are you?' && username === 'ZaToX3005')
            bot.chat('There are my stats master!\nHealth: ' + bot.health + '\nFood: ' + bot.food + '\nLevels: ' + bot.experience.level)
        if (message === 'Play me music') {
            setItemInHand(608)
            placeBlock()
            usingBelowBlock(100);
        }
        if (message === 'go') {
            console.log(bot.heldItem)
        }
        if (message.startsWith('place ')) {
            var block = message.split('place ');
            block = block[1].split(' ');
            const blockId = mcData.blocksByName[block[0]].id
            setItemInHand(blockId)
            placeBlock()
        }
    })
    bot.on('entityHurt', (entity) => {
        bot.chat('Ouchh!')
    })

    async function usingBelowBlock (ms) {
        for (var i = 0; i <= 20; i++) {
            bot.activateBlock(bot.blockAt(bot.entity.position.offset(0, -1, 0)))
            await sleep(ms)
        }
    }

    function setItemInHand (itemId) {
        const item = new Item(itemId, 1)
        bot.creative.setInventorySlot(36, item)
        bot.inventory.updateSlot(36, item);
        bot.equip(item, 'hand')
        bot.updateHeldItem()
    }

    function placeBlock () {
        const blockToPutOn = bot.blockAt(bot.entity.position.offset(0, -1, 0))
        const jumpCoords = Math.floor(bot.entity.position.y) + 1.0
        bot.setControlState('jump', true)
        bot.on('move', placing)
        let nbTry = 0
      
        async function placing () {
            if (bot.entity.position.y > jumpCoords) {
                try {
                    await bot.placeBlock(blockToPutOn, new vec3(0, 1, 0))
                    bot.setControlState('jump', false)
                    bot.removeListener('move', placing)
                } catch (err) {
                    nbTry++
                    if (nbTry > 10) {
                        bot.chat(err.message)
                        bot.setControlState('jump', false)
                        bot.removeListener('move', placing)
                    }
                }
            }
        }
    }
    // bot.on('windowOpen', (window) => {
    //     window.on('windowUpdate', (slot, oldItem, newItem) => {
    //         if(window) {
    //             if (slot >= window.inventoryStart && slot < window.inventoryEnd) {
    //                 slot -= window.inventoryStart - 9
    //                 if (newItem) newItem.slot = slot
    //                 bot.inventory.updateSlot(slot, newItem);
    //             }
    //         }
    //     })
    // })
})

bot.on('kicked', console.log)
bot.on('error', console.log)
bot.on("end", () => bot = createBot());