const socket = require('socket.io');
const ProductsDb = require('../Models/Products');
const Mating = require("../Models/PetMating");

const users = {};
// eslint-disable-next-line require-jsdoc
function getKeyByValue(object, value) {
    return Object.keys(object).find((key) => object[key] === value);
}


// eslint-disable-next-line require-jsdoc
class SocketService {
    // eslint-disable-next-line require-jsdoc
    constructor(server) {
        this.io = socket(server);
        this.io.on('connection', (socket) => {
            // console.log('connection---->', socket);
            console.log('new-user----->>', users);


            /**
           * User Connected
           */
            socket.on('new-user', (userId) => {
                console.log('new-user----->>', userId);
                const isUserExist = getKeyByValue(users, userId);
                if (isUserExist) {
                    delete users[isUserExist];
                    users[socket.id] = userId;
                } else {
                    users[socket.id] = userId;
                    console.log('total users-new---->>', users);
                }
            });


            /**
             * User Chat Messages
             */
            socket.on('message', async (data) => {
                console.log('message----->>', data);
                const {message, requestedByPetId, requestedToPetId, requestedByParentId, requestedToParentId, receiverId, senderId} = data
                let messageObj = {
                    message,
                    senderId,
                    receiverId,
                    date: new Date()
                };

                console.log('messageObj---->', messageObj);
                const mating = await Mating.findOne({
                    requestedByParentId: requestedByParentId,
                    requestedToParentId: requestedToParentId,
                    requestedByPetId: requestedByPetId,
                    requestedToPetId: requestedToPetId
                });

                if (mating) {
                    mating.messages.push(messageObj);
                    await mating.save();
                    console.log('Success --->')
                } else {
                    console.log('No matching document found for the given criteria.');
                }

                const receiver = getKeyByValue(users, receiverId);
                console.log('receiver----->>', receiver)
                this.io.to(receiver).emit('message', messageObj);
            });

            /**
             * Product Status Update
             */
            socket.on('product-status', async (data) => {
                console.log('total users---message-->>', users);
                console.log('accepted----->>', data);

                const product = await ProductsDb.findOne({
                    _id: data.productId,
                });
                console.log('product--->', product);
                    const receiver = getKeyByValue(users, data.userId);
                    console.log('receiver----->>', receiver);
                    this.io.to(receiver).emit('message', product);
            });


            // /**
            //  * Disconnected
            //  */
            // socket.on('disconnect', (id) => {
            // 	console.log('disconnect----->>', id, 'Total--->', users);
            // 	const userSocketId = getKeyByValue(users, id);
            // 	console.log('userSocketId----->>', socket.id);
            // 	socket.broadcast.emit('user-disconnected', socket.id);
            // 	delete users[socket.id];
            // });

            /**
           * Typing
           */
            socket.on('typing', (msg) => {
                msg = JSON.parse(msg);
                const receiver = getKeyByValue(users, msg.reciever);
                this.io.to(receiver).emit('typing', msg);
            });

            /**
           * StopTyping
           */
            socket.on('stopTyping', (msg) => {
                msg = JSON.parse(msg);
                const receiver = getKeyByValue(users, msg.reciever);
                this.io.to(receiver).emit('stopTyping', msg);
            });
        });
    }
}

module.exports = SocketService;



async function test(data) {
    console.log('message----->>', data);
    const {message, requestedByPetId, requestedToPetId, requestedByParentId, requestedToParentId, receiverId} = data
    let messageObj = {
        message,
        date: new Date()
    };

    console.log('messageObj---->', messageObj);
    const mating = await Mating.findOne({
        requestedByParentId: requestedByParentId,
        requestedToParentId: requestedToParentId,
        requestedByPetId: requestedByPetId,
        requestedToPetId: requestedToPetId
    });

    if (mating) {
        mating.messages.push(messageObj);
        await mating.save();
        console.log('Success --->')
    } else {
        console.log('No matching document found for the given criteria.');
    }
}


let obj = {
    "message": "hiii there how are you?",
    "requestedByParentId": "65068b511f02d589bbebc7b4",
    "requestedToParentId": "656b3657c500d26a2933898c",
    "requestedByPetId": "65068d231f02d589bbebcb6f",
    "requestedToPetId": "656b3684c500d26a29338a11",
    "receiverId": "656b3657c500d26a2933898c"
}
// test(obj)
