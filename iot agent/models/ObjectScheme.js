const mongoose = require("mongoose");
const Counter = require("./Counter");
const Schema = mongoose.Schema;
const deviceScheme = new Schema({
    _id: String,
}, {strict: false});
deviceScheme.pre('save', function (next) {
    const doc = this;
    const entityType = doc.constructor.modelName;
    Counter.findById({_id: entityType}, (err, counter) => {
        if (!counter) {
            counter = new Counter({_id: entityType});
        }
        counter.seq++;
        const zeroLength = 3;
        const idString = (counter.seq).toString().padStart(zeroLength, '0');
        doc["_id"] = `broker:${entityType}:${idString}`;
        counter.save((err) => {
            if (err) console.log(err);
        });
        next();
    });
});
module.exports = deviceScheme;
