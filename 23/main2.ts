import fs from "node:fs";

type Link = string[];

fs.readFile("./23/input.txt", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const dataString = data.toString();

    let linksPresent: Link[] = dataString.trim().split("\r\n").map((s) =>
        s.split("-")
    );

    let [largestClusterSize, largestCluster]: [number, Link] = [0, []];

    //Greedy: continue the algorithm until you find a largest sum.
    //for each [c1, c2] in links
    for (const link of linksPresent) {
        let [runningClusterSize, runningCluster]: [number, Link] = [2, [
            link[0],
            link[1],
        ]];
        const relevantLinks = linksPresent.filter((l) =>
            l.includes(link[0]) || l.includes(link[1])
        );

        for (const nextLink of relevantLinks) {
            const nextValue = nextLink.find((s) => !runningCluster.includes(s));
            if (nextValue) {
                let formsCluster = true;
                runningCluster.forEach((c) => {
                    if (
                        !linksPresent.find((l) => linksEqual(l, [c, nextValue]))
                    ) formsCluster = false;
                });
                if (formsCluster) {
                    [runningClusterSize, runningCluster] = [
                        runningClusterSize + 1,
                        [...runningCluster, nextValue],
                    ];
                    if (runningClusterSize > largestClusterSize) {
                        //cut away the unused clusters to optimize here. EDIT: This does not actually reduce runtime since we are in the for-of loop for linksPresent :<
                        linksPresent = linksPresent.filter((l) =>
                            !runningCluster.includes(l[0]) &&
                            !runningCluster.includes(l[1])
                        );
                        //proceed
                        [largestClusterSize, largestCluster] = [
                            runningClusterSize,
                            runningCluster,
                        ];
                        console.log([largestClusterSize, largestCluster]);
                    }
                }
            }
        }
    }
    //this shall
    //We can try this with each [c1, c2] of LinksPresent and track the maximum size and the contents
    console.log(
        "Largest cluster discovered: ",
        largestCluster.toSorted().join(),
    );
});

//dirty filthy hack
function linksEqual(l1: Link, l2: Link) {
    return JSON.stringify(l1.toSorted()) == JSON.stringify(l2.toSorted());
}
