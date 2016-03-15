'use strict';

var flow = require('../lib/flow.js');
var expect = require('chai').expect;
var sinon = require('sinon');

describe('Flow Library', function () {
    describe('Serial Function', function () {
        it('Should execute functions in right order', function () {
            flow.serial([
                function (next) {
                    setTimeout(function () {
                        next(null, 'Hello');
                    }, 500);
                },
                function (data, next) {
                    setTimeout(function () {
                        next(null, data + ', ');
                    }, 1000);
                },
                function (data, next) {
                    setTimeout(function () {
                        next(null, data + 'World');
                    }, 1500);
                },
                function (data, next) {
                    setTimeout(function () {
                        next(null, data + '!');
                    }, 500);
                }
            ], function (error, data) {
                expect(data).to.be.equal('Hello, World!');
            });
        });
        it('Should execute callback with null parameters, if no functions in array', function () {
            var cbSpy = sinon.spy();
            flow.serial([], cbSpy);
            sinon.assert.calledOnce(cbSpy);
            sinon.assert.calledWith(cbSpy, null, null);
        });
        it('Should execute callback with error, if error occured', function () {
            flow.serial([
                function (next) {
                    next(null, 1);
                },
                function (data, next) {
                    next(true, 2);
                }
            ], function (error, data) {
                expect(error).to.not.be.null;
            });
        });
        it('Should not execute functions after error', function () {
            var cbSpy = sinon.spy(function (data, next) {
                next(null, 1);
            });
            flow.serial([
                function (next) {
                    next(true, 2);
                },
                cbSpy
            ], function (error, data) {
                sinon.assert.notCalled(cbSpy);
            });
        });
    });
    describe('Parallel Function', function () {
        it('Should execute functions in right order', function () {
            flow.parallel([
                function (next) {
                    setTimeout(function () {
                        next(null, 1);
                    }, 3000);
                },
                function (data, next) {
                    setTimeout(function () {
                        next(null, 2);
                    }, 1000);
                },
                function (data, next) {
                    setTimeout(function () {
                        next(null, 3);
                    }, 2000);
                }
            ], function (err, dataArray) {
                expect(dataArray).to.be.deep.equal([1, 2, 3]);
            });
        });
        it('Should call callback with (null, []) if length = 0', function () {
            var cbSpy = sinon.spy();
            flow.parallel([], cbSpy);
            sinon.assert.calledWith(cbSpy, null, []);
        });
        it('Should execute all functions even with error', function () {
            var cbSpy1 = sinon.spy(function (next) {
                next(null, 1);
            });
            var cbSpy2 = sinon.spy(function (next) {
                next(null, 2);
            });
            flow.parallel([
                function (next) {
                    next(true, 0);
                },
                cbSpy1,
                cbSpy2
            ], function (error, dataArray) {
                sinon.assert.called(cbSpy1);
                sinon.assert.called(cbSpy2);
            });
        });
    });
    describe('Map Function', function () {
        it('Should execute function with values from array', function () {
            flow.map([1, 2, 3], function (value, next) {
                next(null, value + 1);
            }, function (error, data) {
                expect(data).to.be.deep.equal([2, 3, 4]);
            });
        });
        it('Should call callback once', function () {
            var cbSpy = sinon.spy(function (err, data) {
                sinon.assert.calledOnce(cbSpy);
            });
            flow.map([1, 2, 3], function (value, next) {
                next(null, value + 1);
            }, cbSpy);
        });
        it('Should execute callback with error, if error occured', function () {
            flow.map([1, 2, 3], function (value, next) {
                next(true, value + 1);
            }, function (error, data) {
                expect(error).to.not.be.null;
            });
        });
        it('Should execute callback with values in right order', function () {
            flow.map([1, 2, 3], function (value, next) {
                setTimeout(function () {
                    next(null, value + 3);
                }, 3000 / value);
            }, function (error, data) {
                console.log('hey');
                expect(data).to.be.deep.equal([4, 7, 6]);
            });
        });
    });
});
