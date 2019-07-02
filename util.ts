
function _getDateRange() {
    let dt = new Date();
    let
        within6Months = new Date(new Date().setMonth(dt.getMonth() - 6)),
        within2Years = new Date(new Date().setFullYear(dt.getFullYear() - 2));

    return [within6Months.toISOString().substr(0, 10), within2Years.toISOString().substr(0, 10)];
}

function toMarkdownTable_jsl(rows: Array<Object>): void {
    let
        [within6Months, within2Years] = _getDateRange(),
        [within2YearsAdded, within6MonthsAdded] = [false, false];

    let headers = Object.keys(rows[0]);

    console.log('| 序号 | 代码 | 名称 | 发行日 | 到期日 | 赎回价 | 现价 | 转债价值 | 纯债价值 | 评级 | 溢价率 | 到期收益 |');
    console.log('| :--: | :--: | :--: | :--: | :--: | ---: | ---: | ---: | ---: | :--: | ---: | ---: |');

    rows.forEach((row, idx) => {
        let cells = headers.map(header => {
            if (header === "id") {
                return `[${row[header]}](https://www.jisilu.cn/data/convert_bond_detail/${row[header]})`;
            }
            return row[header];
        });

        // special period
        if (row["issue_dt"] > within6Months) {
            // within 6 months
            if (!within6MonthsAdded) {
                within6MonthsAdded = true;
                console.log('| 6个月内 |');
            }
            if (cells[5] < cells[7]) {
                // 现价 < 纯债价值
                cells[5] = `**${cells[5]}**`;
            } else if (cells[5] > 131) {
                // 现价 > 131
                cells[5] = `~~${cells[5]}~~`;
            }
        } else if (row["issue_dt"] > within2Years) {
            // 6 months ~ 2 years
            if (!within2YearsAdded) {
                console.log('| 2年内 |');
                within2YearsAdded = true;
            }
            if (cells[5] < cells[7]) {
                // 现价 < 纯债价值
                cells[5] = `**${cells[5]}**`;
            } else if (cells[5] < 100) {
                // 现价 < 100
                cells[5] = `*${cells[5]}*`;
            } else if (cells[5] > 130) {
                cells[5] = `~~${cells[5]}~~`;
            }
        } else {
            // above 2 years
            if (cells[5] < cells[7]) {
                // 现价 < 纯债价值
                cells[5] = `**${cells[5]}**`;
            } else if (cells[5] < 101) {
                // 现价 < 101
                cells[5] = `*${cells[5]}*`;
            } else if (cells[5] > cells[6] || cells[5] > 131) {
                // 现价 > 转债价值 || 现价 > 131
                cells[5] = `~~${cells[5]}~~`;
            }
        }

        cells.unshift(idx + 1)
        console.log(`| ${cells.join(' | ')} |`);
    });
    console.log(`updated @ ${new Date().toLocaleDateString()}`)
}

function toMarkdownTable(rows: Array<Object>): void {
    let headers = Object.keys(rows[0]);
    let seperators = headers.map(item => {
        return '--';
    });
    console.log(headers.join('|'));
    console.log(seperators.join('|'));

    rows.forEach(row => {
        let cells = headers.map(header => {
            return row[header];
        });
        console.log(cells.join('|'));
    });
}

function trunc(num: number, digits: number): number {
    let power = Math.pow(10, digits);
    return Math.trunc(num * power) * 1.0 / power;
}

// export default { toMarkdownTable, trunc };
export { toMarkdownTable_jsl as toMarkdownTable, trunc };
