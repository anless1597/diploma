module.exports.printErrorFromIotAgent = (err) => {
    console.log('\x1b[33m%s\x1b[0m', err.message);
    if (err.response) {
        console.log('\x1b[33m%s\x1b[0m', err.response.data);
    }
    console.log();
}
module.exports.printSuccessfulResponseFromIotAgent = (response) => {
    console.log('\x1b[33m%s\x1b[0m', `Answer: status ${response.status}`);
    console.log('\x1b[33m%s\x1b[0m', response.data);
    console.log();
}