require('dotenv').config()
const MongoClient = require("mongodb").MongoClient;
const client = new MongoClient(`mongodb://${process.env.LOCALHOST}`);

class TypesController {
	// GET /iot/types
	// Получение списка существующих типов
	async getAllTypes(req, res) {
		try {
			client.connect().then(client =>
				client.db(`${process.env.DB_NAME}`).listCollections().toArray())
				.then(cols => {
					let collection_names = new Array()
					for (let col of cols) {
						collection_names.push(col.name)
					}
					res.send(collection_names)
				})
				.finally(() => client.close());
		} catch (e) {
			res.send(`entities ${req.method} error`);
		}
	}
}

module.exports = new TypesController;
