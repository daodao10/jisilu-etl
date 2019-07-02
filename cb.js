
import superagent from 'superagent';
import cheerio from 'cheerio'
import * as util from './util';
const cpn = require('./cpn.json')

// "bond_id": "110031",
// "bond_nm": "航信转债",
// "stock_id": "sh600271",
// "stock_nm": "航天信息",
// "issue_dt": "2015-06-12",
// "maturity_dt": "2021-06-12",
// "put_price": "100.000",赎回价
// "cpn_desc": "第一年0.20%、第二年0.50%、第三年1.00%、第四年1.50%、第五年1.50%、 第六年1.60%",
// "redeem_price": "107.000",
// "year_left": "3.378",
// "premium_rt": "-15.19%"
// "ytm_rt": "2.47%",
// "ytm_rt_tax": "1.85%",
// "full_price": "102.380"
// convert_value

const
    cbUrl = "https://www.jisilu.cn/data/cbnew/cb_list/?___jsl=LST___t=",
    IrRegex = /\w+\s*(\d*\.?\d*)%/ig

function parseIr(str) {
    let result = [];
    let arr;
    while ((arr = IrRegex.exec(str)) !== null) {
        result.push(Number(arr[0].slice(0, -1)));
    }
    return result;
}

function calcBondValue(irs, redeemPrice, yearLeft, discount = 0.04) {
    let cbValue = redeemPrice;
    let bondValue = redeemPrice / Math.pow(1 + discount, yearLeft);

    let idx = irs.length - Math.ceil(yearLeft);
    let power = yearLeft - Math.floor(yearLeft);
    for (let i = 0; i < Math.floor(yearLeft); i++) {
        cbValue += irs[idx + 1] * power * 0.8; // minus tax 20%
        bondValue += irs[idx + i] / Math.pow(1 + discount, power + i);
    }

    return { cb_value: util.trunc(cbValue, 3), bond_value: util.trunc(bondValue, 3) };
}
function calcIssueDate(maturityDate) {
    let year = parseInt(maturityDate.substr(0, 4), 10)
    return (year - 6).toString() + maturityDate.substr(4, 10)
}
async function getIrs(bondId) {
    return await superagent
        .get(`https://www.jisilu.cn/data/convert_bond_detail/${bondId}`)
        .then(res => {
            const $ = cheerio.load(res.text)
            return parseIr($('#cpn_desc').text())
        })
}

if (require.main === module) {
    const getCDs = superagent
        .post(cbUrl + new Date().getTime())
        .send("btype=C")
        .send("rp=50")
        .set('Accept', 'application/json')
        .then((res) => {
            return res.body.rows.map((row) => {
                let cell = row.cell;
                // the order is important, please place in order of the headers
                return {
                    id: cell.bond_id,
                    name: cell.bond_nm,
                    issue_dt: calcIssueDate(cell.maturity_dt), //cell.issue_dt,
                    maturity_dt: cell.maturity_dt,
                    irs: undefined, //parseIr(cell.cpn_desc),
                    year_left: Number(cell.year_left),
                    // convert_value: Number(cell.convert_value),
                    redeem_price: Number(cell.redeem_price),
                    price: Number(cell.full_price),
                    cb_value: undefined,
                    bond_value: undefined,
                    rating_cd: cell.rating_cd,
                    premium_rt: cell.premium_rt,
                    ytm_rt: cell.ytm_rt
                };
            });
        });

    (async () => {
        let items = await getCDs
        for (let item of items) {
            if (cpn[item.id] === undefined) {
                item.irs = await getIrs(item.id)
                console.log(item.id, ',', item.irs)
            } else {
                item.irs = cpn[item.id]
            }

            let { cb_value: cbValue, bond_value: bondValue } = calcBondValue(item.irs, item.redeem_price, item.year_left);
            item['cb_value'] = cbValue;
            item['bond_value'] = bondValue;

            delete item.irs;
            delete item.year_left;
        }

        items.sort((x, y) => x.issue_dt.localeCompare(y.issue_dt));
        util.toMarkdownTable(items);
    })()

} else {
    exports.parseIr = parseIr;
}