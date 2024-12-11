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

    //Find sum of middle page numbers
    const printedPageOrders = printOrdersList.map((order) =>
        getPrintableOrder(order, rulesList)
    ).filter((x) => x != undefined);

    const sumOfMiddlePages = printedPageOrders.map((order) =>
        order[Math.floor(order.length / 2)]
    ).reduce((a, b) => a + b, 0);
    console.log(`Sum of middle pages: ${sumOfMiddlePages}`);
});

function getPrintableOrder(
    order: PrintOrder,
    rules: RuleStatement[],
): number[] | undefined {
    //Use only applicable rules (where req or out is among the pages to be printed)
    const applicableRules = rules.filter((rule) => {
        return order.includes(rule.req) && order.includes(rule.out);
    });

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

    return ruleWasViolated ? undefined : printedPages;
}
