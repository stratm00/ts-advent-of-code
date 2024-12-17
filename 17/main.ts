import fs from "node:fs";

const PROGRAM_REGEX = /Program: ([\d,]+)|Register (\w): (\d+)/gm;

fs.readFile("./17/input.txt", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const dataString = data.toString();

    const instructions: number[] = [];
    let [registerA, registerB, registerC] = [0, 0, 0];

    [...dataString.matchAll(PROGRAM_REGEX)].forEach((regexp) => {
        if (regexp[1] != undefined) {
            regexp[1].split(",").map(Number).forEach((x) =>
                instructions.push(x)
            );
        } else if (regexp[2] != undefined) {
            if (regexp[2] == "A") registerA = Number(regexp[3]);
            else if (regexp[2] == "B") registerB = Number(regexp[3]);
            else if (regexp[2] == "C") registerC = Number(regexp[3]);
        }
    });

    console.log("REG A", registerA);
    console.log("REG B", registerB);
    console.log("REG C", registerC);
    console.log("PROG: ", instructions.join(" "));

    const _parseComboOp = (op: number): number => {
        switch (op) {
            case 0:
                return 0;
            case 1:
                return 1;
            case 2:
                return 2;
            case 3:
                return 3;

            case 4:
                return registerA;
            case 5:
                return registerB;
            case 6:
                return registerC;

            case 7: {
                console.error("BAD COMBO OPERAND (7)");
                return -1;
            }
            default:
                console.error("unknown combo operand", op);
                return -1;
        }
    };
    const outputBuf: number[] = [];
    let insCounter = 0;
    while (instructions.length > insCounter) {
        const inst = instructions[insCounter];
        const operand = instructions[insCounter + 1];

        let jumpCompleted = false;
        switch (inst) {
            case 0: {
                //adv
                const resolvedCombo = _parseComboOp(operand);
                const numerator = registerA;
                //denominator
                const denominator = resolvedCombo;

                registerA = Math.floor(numerator / Math.pow(2, denominator));
                break;
            }
            case 1: {
                //bxl
                //bitwise or of b and the literal operand
                registerB = registerB ^ operand;
                break;
            }
            case 2: {
                //bst
                registerB = _parseComboOp(operand) % 8;
                break;
            }
            case 3: {
                //jnz
                if (registerA != 0) {
                    insCounter = operand;
                    jumpCompleted = true;
                }
                break;
            }
            case 4: {
                //bxc
                registerB = registerB ^ registerC;
                break;
            }
            case 5: {
                //out
                outputBuf.push(_parseComboOp(operand) % 8);
                break;
            }
            case 6: {
                //bdv
                const resolvedCombo = _parseComboOp(operand);
                const numerator = registerA;
                //denominator
                const denominator = resolvedCombo;

                registerB = Math.floor(numerator / Math.pow(2, denominator));
                break;
            }
            case 7: {
                //cdv
                const resolvedCombo = _parseComboOp(operand);
                const numerator = registerA;
                //denominator
                const denominator = resolvedCombo;

                registerC = Math.floor(numerator / Math.pow(2, denominator));
                break;
            }
            default:
                console.error("inst not comprehended", inst);
        }

        if (!jumpCompleted) insCounter += 2;
        console.log("REG A", registerA);
        console.log("REG B", registerB);
        console.log("REG C", registerC);
        console.log(
            "PREV IN PROG: ",
            instructions.filter((_, i) => i < insCounter).join(" "),
        );
        console.log(
            "NEXT IN PROG: ",
            instructions.filter((_, i) => i >= insCounter).join(" "),
        );
        console.log();
    }
    console.log("OUTPUT", outputBuf.join(","));
});
