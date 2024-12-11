import fs from "node:fs";

const rule_regex = /(\d+)\|(\d+)/gm;
type RuleStatement = { req: number; out: number };
type PrintOrder = number[];
fs.readFile("./5/input.txt", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const dataString = data.toString();
    //Delimiter: \n\r\n
    const splitIndex = dataString.indexOf("\n\r\n");

    //First part of the input: rule declarations
    //The notation X|Y means that if both page number X and page number Y are to be produced as part of an update, page number X must be printed at some point before page number Y.
    const ruleStatementsString = dataString.substring(0, splitIndex);

    //Second Part is printing orders
    const printStatementsString = dataString.substring(
        splitIndex + 3,
        dataString.length,
    );

    const rulesList: RuleStatement[] = [
        ...ruleStatementsString.matchAll(rule_regex),
    ]
        .map((match) => {
            return { req: Number(match[1]), out: Number(match[2]) };
        });

    const printOrdersList: PrintOrder[] = printStatementsString.split("\n")
        .filter((lineString) => lineString !== "")
        .map((lineString) => {
            return lineString.split(",").map(Number);
        });
    //Find orders that go wrong
    const problemOrders = printOrdersList.filter((order) =>
        orderViolatesRules(order, rulesList)
    );

    const fixedOrders = problemOrders.map((order) =>
        fixOrder(order, rulesList)
    );

    const sumOfMiddlePages = fixedOrders.map((ord) =>
        ord[Math.floor(ord.length / 2)]
    ).reduce((a, b) => a + b, 0);

    console.log(`Sum of middle pages in corrected orders: ${sumOfMiddlePages}`);
});

function orderViolatesRules(
    order: PrintOrder,
    rules: RuleStatement[],
): boolean {
    const applicableRules = _getApplicableRules(order, rules);

    const printedPages: number[] = [];
    let ruleWasViolated = false;
    order.forEach((page) => {
        const prereqsForPage = applicableRules.filter((rule) =>
            rule.out == page
        );

        //page can be printed if there are no prereq rules, or all requisites in the rule have already been printed
        const pagePrintable = prereqsForPage.reduce(
            (prev, rule) => prev && printedPages.includes(rule.req),
            true,
        );
        if (pagePrintable) {
            printedPages.push(page);
        } else {
            //If a rule is found to be violated
            ruleWasViolated = true;
        }
    });

    return ruleWasViolated;
}

function fixOrder(order: PrintOrder, rules: RuleStatement[]): PrintOrder {
    const applicableRules = _getApplicableRules(order, rules);

    let recheckOrder = true;
    while (recheckOrder && orderViolatesRules(order, rules)) {
        let changed = false;
        //Take pair (order_n, order_n+1)
        for (let n = 0; n < order.length - 1; n++) {
            //Find rule that says order_n+1 | order_n
            /*This breaks, probably because the equality does not work
             if(applicableRules.includes({out:order[n], req:order[n+1]})){ */
            if (
                applicableRules.find((rule) =>
                    rule.out == order[n] && rule.req == order[n + 1]
                )
            ) {
                //Swap order_n and order_n+1 and recheck
                const swap = order[n];
                order[n] = order[n + 1];
                order[n + 1] = swap;
                changed = true;
            }
        }
        recheckOrder = changed;
    }
    return order;
}

function _getApplicableRules(
    order: PrintOrder,
    rules: RuleStatement[],
): RuleStatement[] {
    return rules.filter((rule) => {
        return order.includes(rule.req) && order.includes(rule.out);
    });
}
