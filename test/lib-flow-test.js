'use strict';

var flow = require('../lib/flow.js');
var expect = require('chai').expect;
var sinon = require('sinon');

describe('Flow Library', function () {
    describe('Serial Function', function () {
        it('Should execute functions in right order', function () {
            flow.serial([
                function (next) {
                    next(null, 'Hello');
                },
                function (data, next) {
                    next(null, data + ', ');
                },
                function (data, next) {
                    next(null, data + 'World');
                }
            ], function (error, data) {
                expect(data).to.be.equal('Hello, World');
            });
        });
        it('Should execute callback with null parameters, if no functions in array', function () {
            var cbSpy = sinon.spy();
            flow.serial([], cbSpy);
            expect(cbSpy.calledOnce).to.be.ok;
            expect(cbSpy.calledWith(null, null)).to.be.ok;
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
    });
    describe('Parallel Function', function () {
        it('Should execute functions in right order', function () {
            flow.parallel([
                function (next) {
                    next(null, 1);
                },
                function (next) {
                    next(null, 2);
                }
            ], function (err, dataArray) {
                expect(dataArray).to.be.deep.equal([1, 2]);
            });
        });
        it('Should call callback with (null, []) if length = 0', function () {
            var cbSpy = sinon.spy();
            flow.parallel([], cbSpy);
            expect(cbSpy.calledWith(null, [])).to.be.ok;
        });
        it('Should execute callback with error, if error occured', function () {
            flow.map([1, 2, 3], function (value, next) {
                next(true, value + 1);
            }, function (error, data) {
                expect(error).to.not.be.null;
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
        it('Should execute callback with error, if error occured', function () {
            flow.map([1, 2, 3], function (value, next) {
                next(true, value + 1);
            }, function (error, data) {
                expect(error).to.not.be.null;
            });
        });
    });
});
