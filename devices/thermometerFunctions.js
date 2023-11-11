const random = require("random");
exports.getMessage = () => {
    return {
        t: String(random.float(15, 17).toFixed(2)),
        h: String(random.int(40, 50)),
    }
}
exports.getMs = () => 5000;