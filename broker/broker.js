const express = require('express');
const mongoose = require('mongoose');
const broker = express();
const cors = require('cors')
const router = require('./routes/routes')
const expressValidator = require('express-validator')
const jsonParser = express.json();
const StartTimeSubs = require('./subs/startTimeSubs')
require('dotenv').config()

const DB = `mongodb://${process.env.LOCALHOST}/${process.env.DB_NAME}`

broker.use(jsonParser)
broker.use(cors())
broker.use(expressValidator())
broker.use('/iot', router)

// Запуск брокера
const start = async ()=>{
	try{
		await mongoose.connect(DB, { useUnifiedTopology: true }) 
		broker.listen(process.env.PORT, () => console.log('broker is running'));
		await StartTimeSubs();
	} catch (e){
			console.log(e);
	}
}

start();
