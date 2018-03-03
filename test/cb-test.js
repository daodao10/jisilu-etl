
import chai, { expect } from 'chai';
// const should = chai.should();

var app = require('../cb');

describe('ir parser', function () {
    it('normal parser ...', function () {
        let irs = app.parseIr("第一年0.20%、第二年0.50%、第三年1.00%、第四年1.50%、第五年1.50%、 第六年1.60%");
        // irs[0].should.equal(0.2);
        expect(irs).to.include(1.60);
    });

    it('special parser ...', function () {
        let irs = app.parseIr("第1年0.5%,第2年0.7%,第3年1.0%,第4年1.5%,第5年1.8%,第6年2%");
        // irs[0].should.equal(0.5);
        expect(irs[0]).to.equal(0.5);
    });
});
