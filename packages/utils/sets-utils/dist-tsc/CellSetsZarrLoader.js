import { InternMap } from 'internmap';
import { treeInitialize, nodeAppendChild, } from './cell-set-utils.js';
import { SETS_DATATYPE_OBS, } from './constants.js';
export function dataToCellSetsTree(data, options) {
    // obsIndex is an array of all cell IDs, for the purposes of set complement operations only.
    // cellNames is per-cellSets arrays of cell IDs.
    const [cellNames, cellSets, cellSetScores] = data;
    const cellSetsTree = treeInitialize(SETS_DATATYPE_OBS);
    cellSets.forEach((cellSetIds, j) => {
        const { name } = options[j];
        let levelZeroNode = {
            name,
            children: [],
        };
        if (cellSetIds.length > 0 && Array.isArray(cellSetIds[0])) {
            // Multi-level case.
            // TODO: throw a warning if the levels are not in order coarser->finer.
            const levelSets = new InternMap([], JSON.stringify);
            cellNames[j].forEach((id, i) => {
                const classes = cellSetIds.map(col => col[i]);
                if (levelSets.has(classes)) {
                    levelSets.get(classes).push([id, null]);
                }
                else {
                    levelSets.set(classes, [[id, null]]);
                }
            });
            const levels = Array.from(levelSets.keys());
            const getNextLevelNames = (levelSuffixes) => {
                const nextLevelNames = Array.from(new Set(levelSuffixes.map(l => l[0])));
                return nextLevelNames.sort((a, b) => a.localeCompare(b));
            };
            // Recursive function to create nodes.
            const getNode = (parentLevelPrefixes, currLevelName, childLevelSuffixes) => {
                const isLeaf = childLevelSuffixes.length === 0;
                const resultNode = {
                    name: currLevelName,
                };
                if (isLeaf) {
                    // Base case: this is a leaf node.
                    resultNode.set = levelSets.get([...parentLevelPrefixes, currLevelName]);
                }
                else {
                    // Are the remaining suffices redundant?
                    // Consider ["Parent", "Child", "Child"]
                    // where parentLevelPrefixes is ["Parent"] and currLevelName is "Child".
                    const shouldBeLeaf = (childLevelSuffixes.length === 1
                        && currLevelName === childLevelSuffixes[0][childLevelSuffixes[0].length - 1]);
                    if (shouldBeLeaf) {
                        resultNode.set = levelSets.get([...parentLevelPrefixes, currLevelName, ...childLevelSuffixes[0]]);
                    }
                    else {
                        // Recursion, run getNode() on each of the unique names at the next level.
                        const nextLevelNames = getNextLevelNames(childLevelSuffixes);
                        resultNode.children = nextLevelNames
                            .map(nextLevelName => getNode([...parentLevelPrefixes, currLevelName], nextLevelName, childLevelSuffixes
                            .filter(l => l[0] === nextLevelName)
                            .map(l => l.slice(1))
                            .filter(v => v.length > 0)));
                    }
                }
                return resultNode;
            };
            // Start the recursion.
            const levelOneNodes = getNextLevelNames(levels)
                .map(levelOneName => getNode([], levelOneName, levels.filter(l => l[0] === levelOneName).map(l => l.slice(1))));
            levelZeroNode.children = levelOneNodes;
        }
        else {
            // Single-level case.
            // Check for the optional corresponding confidence score column name.
            const uniqueCellSetIds = Array.from(new Set(cellSetIds)).sort();
            const clusters = {};
            // eslint-disable-next-line no-return-assign
            uniqueCellSetIds.forEach(id => (clusters[id] = { name: id, set: [] }));
            if (cellSetScores[j]) {
                cellSetIds
                    .forEach((id, i) => clusters[id].set.push([cellNames[j][i], cellSetScores[j][i]]));
            }
            else {
                cellSetIds
                    .forEach((id, i) => clusters[id].set.push([cellNames[j][i], null]));
            }
            Object.values(clusters).forEach(
            // eslint-disable-next-line no-return-assign
            cluster => (levelZeroNode = nodeAppendChild(levelZeroNode, cluster)));
        }
        cellSetsTree.tree.push(levelZeroNode);
    });
    return cellSetsTree;
}
