// index.js
const {SMTPServer} = require('smtp-server');
const fs = require('fs');
const Database = require('./database.js');

const messages = new Database('messages.json', []);

const server = new SMTPServer({
	// disable STARTTLS to allow authentication in clear text mode
	disabledCommands: ['STARTTLS', 'AUTH'],
	logger: true,
	onData(stream, session, callback){
		stream.pipe(fs.createWriteStream('message.txt'));
		stream.on('end', async (...args) => {
			const message = fs.readFileSync('message.txt', 'utf8');
			const messagesData = await messages.getAll();
			messagesData.push(message);
			await messages.setAll(messagesData);
			fs.unlinkSync('message.txt');
			callback(...args);
		});
	},
});

server.listen(25);

const express = require('express');

const app = express();

app.get('/messages', async (req, res) => {
	const messagesData = await messages.getAll();
	res.send(messagesData);
});

app.listen(3000);