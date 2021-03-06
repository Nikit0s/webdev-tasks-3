'use strict';
var Promise = require('bluebird');

module.exports.serial = function (functions, callback) {
    if (functions.length === 0) {
        callback(null, null);
        return;
    }
    var counter = 0;
    var cb = function (error, data) {
        if (error) {
            return callback(error, data);
        }
        counter += 1;
        if (counter >= functions.length) {
            return callback(error, data);
        }
        functions[counter](data, cb);
    };
    functions[counter](cb);
};

module.exports.parallel = function (functions, callback) {
    if (functions.length === 0) {
        callback(null, []);
        return;
    }
    Promise.map(functions, function (func) {
        return new Promise(function (resolve, reject) {
            var next = function (error, data) {
                if (error) {
                    resolve([]);
                } else {
                    resolve(data);
                }
            };
            func(next);
        });
    })
        .then(function (dataArray) {
            callback(null, dataArray);
        });
};

module.exports.map = function (values, func, callback) {
    var result = [];
    var counter = 0;
    var flag = false;
    var cb = function (index) {
        return function (error, data) {
            counter += 1;
            result[index] = data;
            if (flag) {
                return;
            }
            if (error || counter === values.length) {
                flag = true;
                callback(error, result);
            }
        };
    };
    for (var i = 0; i < values.length; i++) {
        func(values[i], cb(i));
    }
};

