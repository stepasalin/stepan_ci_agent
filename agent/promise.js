var promise = new Promise(function(resolve, reject) {
    setTimeout(function() {
        var randomNo = Math.floor(Math.random() * 10);
        resolve(randomNo);
    }, 3000);
});
promise.then(function(data) {
    console.log('resolved! ', data);
});
