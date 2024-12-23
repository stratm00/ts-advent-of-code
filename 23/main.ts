import fs from "node:fs";

type Link = string[];

fs.readFile("./23/input.txt", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const dataString = data.toString();

    const linksPresent: Link[] = dataString.trim().split("\r\n").map((s) =>
        s.split("-")
    );

    const threeLengthLoopsDiscovered: Link[] = [];
    const _addThreeLengthLoop = (link: Link) => {
        if (!threeLengthLoopsDiscovered.find((l) => linksEqual(l, link))) {
            threeLengthLoopsDiscovered.push(link);
        }
    };

    //We can reduce our initial iteration size by starting with only the ones that contain computers that begin with a "t"
    const choiceLinksPresent = linksPresent.filter((l) =>
        l[0].startsWith("t") || l[1].startsWith("t")
    );

    for (const link of choiceLinksPresent) {
        const relevantLinks = linksPresent.filter((l) =>
            l.includes(link[0]) || l.includes(link[1])
        );
        for (const l2 of relevantLinks) {
            const third_comp = l2.find((s) => !link.includes(s));

            if (
                third_comp &&
                relevantLinks.find((l) =>
                    linksEqual(l, [link[0], third_comp]) &&
                    relevantLinks.find((l) =>
                        linksEqual(l, [third_comp, link[1]])
                    )
                )
            ) {
                _addThreeLengthLoop([link[0], link[1], third_comp]);
            }
        }
    }

    console.log(
        "# of loops that could include the historian:",
        threeLengthLoopsDiscovered.length,
    );
});
//dirty filthy hack
function linksEqual(l1: Link, l2: Link) {
    return JSON.stringify(l1.toSorted()) == JSON.stringify(l2.toSorted());
}
