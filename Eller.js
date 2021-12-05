class EllerMaze {
    LengthOfRow = 0;
    NumberOfRow = 0;
    PreviousRow = null;
    VerticalBias = 0.0; // 0..1, the higher, the less vertical walls
    HorizontalBias = 0.0; // 0..1, the higher, the less horizontal walls
    Maze = [];
    constructor(lengthOfRow = 8, numberOfRow = 8, verticalBias = 0.5, horizontalBias = 0.5) {
        this.LengthOfRow = lengthOfRow;
        this.NumberOfRow = numberOfRow;
        this.VerticalBias = verticalBias;
        this.HorizontalBias = horizontalBias;
    }

    GenerateMaze() {
        this.PreviousRow = null;
        this.Maze.length = 0;
        for (let i = 0; i < this.NumberOfRow; i++) {
            let row = new EllerRow(this.LengthOfRow, (i + 1) === this.NumberOfRow, this.PreviousRow, this.VerticalBias, this.HorizontalBias);
            this.Maze.push(row);
            this.PreviousRow = row;
        }
        return this.Maze;
    }
}

class EllerRow {
    //Handle next row, depending on the previous row
    constructor(lengthOfRow, isLastRow, previousRow, verticalBias, horizontalBias) {
        this.LengthOfRow = lengthOfRow;
        this.IsLastRow = isLastRow;
        this.PreviousRow = previousRow;
        this.verticalBias = verticalBias;
        this.HorizontalBias = horizontalBias;
        this.Sets = Array(this.LengthOfRow).fill(0);
        this.Cells = [];
        if (this.PreviousRow !== null) {
            this.CopyRowSets();
        }
        this.BuildCells();
        this.AssignRightWalls();
        this.AssignBottomWalls();
    }

    // method to copy the sets from previous row
    CopyRowSets() {
        for (let i = 0; i < this.LengthOfRow; i++) {
            if (!this.PreviousRow.Cells[i].BottomWall) {
                this.Sets[this.PreviousRow.Cells[i].Set]++;
            }
        }
    }

    // method to build cells and assign them a set
    BuildCells() {
        for (let i = 0; i < this.LengthOfRow; i++) {
            let set = (this.PreviousRow === null || this.PreviousRow.Cells[i].BottomWall) ? -1 : this.PreviousRow.Cells[i].Set;
            this.Cells.push(new EllerCell(set));
            this.AssignUniqueSet(this.Cells[i]);
        }
    }

    // method to assign right walls
    AssignRightWalls() {
        for (let i = 0; i < this.LengthOfRow; i++) {
            this.Cells[i].RightWall =
                (i === this.LengthOfRow - 1) || //is last cell of row
                (this.Cells[i].Set === this.Cells[i + 1].Set) || //is same set with right cell
                (Math.random() >= this.verticalBias && !this.IsLastRow);//random decide right wall
            if (!this.Cells[i].RightWall) {
                this.MergeSets(i, i + 1);
            }
        }
    }

    // method to assign bottom walls
    AssignBottomWalls() {
        for (let i = 0; i < this.LengthOfRow; i++) {
            this.Cells[i].BottomWall =
                (this.Sets[this.Cells[i].Set] !== 1 && Math.random() >= this.HorizontalBias) || //if the number of sets is 1, must not have a bottom wall
                this.IsLastRow;
            if (this.Cells[i].BottomWall) {
                this.Sets[this.Cells[i].Set] -= 1;
            }
        }
    }

    // method to assign "cell" a set, if it doesn't have one already
    AssignUniqueSet(cell) {
        if (cell.Set === -1) {
            for (let i = 0; i < this.LengthOfRow; i++) {
                if (this.Sets[i] === 0) {
                    cell.Set = i
                    this.Sets[i]++;
                    break;
                }
            }
        }
    }

    // method to merge two sets
    // all cells in the same set as "cellTo" are placed in the same set as "cellFrom"
    MergeSets(cellFrom, cellTo) {
        let setFrom = this.Cells[cellFrom].Set;
        let setTo = this.Cells[cellTo].Set;
        for (let i = 0; i < this.LengthOfRow; i++) {
            if (this.Cells[i].Set === setTo) {
                this.Cells[i].Set = setFrom;
                this.Sets[setFrom]++;
                this.Sets[setTo]--;
            }
        }
    }

    // export the row in JSON format to use it in your projects
    ExportToObj() {
        let row = {
            walls: []
        }
        for (let i = 0; i < this.LengthOfRow; i++) {
            row.walls.push({
                up: this.PreviousRow === null || this.PreviousRow.Cells[i].BottomWall,
                down: this.Cells[i].BottomWall,
                left: i === 0 || this.Cells[i - 1].RightWall,
                right: this.Cells[i].RightWall
            })
        }
        return row;
    }
}

class EllerCell {
    constructor(set) {
        this.BottomWall = true;
        this.RightWall = true;
        this.Set = set;
    }
}
