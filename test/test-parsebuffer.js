var parsebuffer = require('../lib/parsebuffer');

var testCounter = 0;
function testBuffer (length) {
    var buff = new Buffer(length);
    for(var i = 0; i < length; i++) {
        buff[i] = testCounter++;
    }
    return buff;
}

exports.testRequest = function (test) {
    test.expect(1);

    var pb = new parsebuffer.ParseBuffer();
    var result = [];
    pb.request(8, parsebuffer.setter(result));
    pb.request(8, parsebuffer.setter(result));
    pb.request(4, parsebuffer.setter(result, function () {
        test.deepEqual(result, [new Buffer([0,1,2,3,4,5,6,7]),
            new Buffer([8,9,10,11,12,13,14,15]),
            new Buffer([16,17,18,19])]);
    }));

    pb.onData(testBuffer(6));
    pb.onData(testBuffer(6));
    pb.onData(testBuffer(4));
    pb.onData(testBuffer(4));

    test.done();
};

exports.testGroup = function (test) {
    test.expect(3);

    var pb = new parsebuffer.ParseBuffer();
    var result = [];
    var theGroup = pb.enterGroup(20, function() {
        console.log("XXXXXXXXXXX");
        test.deepEqual(result, [new Buffer([20,21,22,23,24,25,26,27]),
            new Buffer([28,29,30,31,32,33,34,35]),
            new Buffer([36,37,38,39])]);
        test.ok(! theGroup.active);
    });
    pb.request(8, parsebuffer.setter(result));
    pb.request(8, parsebuffer.setter(result));
    pb.request(4, function (buff) {
        result.push(buff);
        console.debug("final callback", buff);
        // in the callback of the last group member, this is false
        // before reading the dataelement value, it would be true
        test.ok(! theGroup.active);
    });

    pb.onData(testBuffer(20));

    test.done();
};
