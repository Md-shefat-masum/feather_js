import { feathers } from '@feathersjs/feathers'
import { koa, rest, bodyParser, errorHandler, serveStatic } from '@feathersjs/koa'
import socketio from '@feathersjs/socketio'
const cors = require('@koa/cors');

// This is the interface for the message data
interface Message {
    id?: number
    text: string
}

// A messages service that allows us to create new
// and return all existing messages
class MessageService {
    messages: Message[] = []

    async find() {
        // Just return all our messages
        return this.messages
    }

    async create(data: Pick<Message, 'text'>) {
        // The new message is the data text with a unique identifier added
        // using the messages length since it changes whenever we add one
        const message: Message = {
            id: this.messages.length,
            text: data.text
        }

        // Add new message to the list
        this.messages.push(message)

        return message
    }
}

class UserService {
    messages: Message[] = []

    async find() {
        // Just return all our messages
        return this.messages
    }

    async create(data: Pick<Message, 'text'>) {
        // The new message is the data text with a unique identifier added
        // using the messages length since it changes whenever we add one
        const message: Message = {
            id: this.messages.length,
            text: data.text
        }

        // Add new message to the list
        this.messages.push(message)

        return message
    }
}

// This tells TypeScript what services we are registering
type ServiceTypes = {
    messages: MessageService,
    users2: UserService,
}

// Creates an KoaJS compatible Feathers application
const app = koa<ServiceTypes>(feathers())

// Use the current folder for static file hosting
app.use(serveStatic('.'))
// Register the error handle
app.use(errorHandler())
// Parse JSON request bodies
app.use(bodyParser())
app.use(cors())
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));

// Register REST service handler
app.configure(rest())
// Configure Socket.io real-time APIs
app.configure(socketio())
// Register our messages service
app.use('messages', new MessageService())
app.use('users2', new UserService())

// Add any new real-time connection to the `everybody` channel
app.on('connection', (connection) => {
    // console.log(connection);
    
    return app.channel('everybody').join(connection)
})
// Publish all events to the `everybody` channel
app.publish((_data) => app.channel('everybody'))

// Start the server
app
    .listen(3031)
    .then(() => console.log('Feathers server listening on localhost:3031'))

// For good measure let's create a message
// So our API doesn't look so empty
app.service('messages').create({
    text: 'Hello world from the server'
})
app.service('users2').create({
    text: 'create new user'
})