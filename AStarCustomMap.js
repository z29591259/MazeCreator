class Point {
    /**@type {number} */
    Id = -1;
    /**@type {number} */
    X = -1;
    /**@type {number} */
    Y = -1;

    /**
     * @param {number} id 
     * @param {number} x
     * @param {number} y
     */
    constructor(id, x, y) {
        this.Id = id;
        this.X = x;
        this.Y = y;
    }
}

class PointCost extends Point {
    /**@type {number} */
    Cost = -1;
    /**@type {number[]} */
    Path = [];

    /**
    * @param {Point} here
    * @param {PointCost} last
    */
    constructor(here, last = null) {
        super(here.Id, here.X, here.Y);
        if (last !== null) {
            this.Path = last.Path.concat();
        }
        this.Path.push(here.Id);
    }
}

class AStarConfig {
    /**
     * Straight first, avoid rotation
     * @type {boolean}
     */
    AvoidRotation = false;
}

class AStarCustomMap {
    /** If turn one time, add the cost */
    _TURN_COST_VALUE = 200;
    /**
     * Map Points
     * @type {Point[]}
     */
    Points = [];
    /**
     * Map Points
     * @type {number[][]}
     */
    Lines = [];
    /**
     * List to calculate path
     * @type {PointCost[]}
     */
    OpenList = [];
    /**@type {AStarConfig} */
    Config = null;

    /**
     * 
     * @param {Point} points 
     * @param {number[][]} lines 
     * @param {AStarConfig} config
     */
    constructor(points, lines, config = null) {
        this.Points = points;
        this.Lines = lines;
        if (config !== null) {
            this.Config = config;
        }
    }

    /**
     * Generate new PointCost and calculate cost by condition
     * @param {Point} here
     * @param {Point} start
     * @param {Point} end
     * @param {PointCost} last
     * @returns 
     */
    NewPointCost(here, start, end, last = null) {
        let point_cost = new PointCost(here, last)
        point_cost.Cost = this.CalCost(point_cost, start, end);
        return point_cost;
    }

    /**
    * Calculate cost
    * @param {PointCost} here current point
    * @param {Point} start start point
    * @param {Point} end end point
    */
    CalCost(here, start, end) {
        //distance between start and end points
        let cost = (Math.abs(here.X - start.X) + Math.abs(here.Y - start.Y) + Math.abs(here.X - end.X) + Math.abs(here.Y - end.Y));

        //calculate turn need at least 3 points
        if (this.Config?.AvoidRotation && here.Path.length >= 3) {
            let turn_cost = 0;
            for (let i = 0; i < here.Path.length - 2; i++) {
                let x_offset = Math.abs(this.Points[here.Path[i]].X - this.Points[here.Path[i + 1]].X);
                let y_offset = Math.abs(this.Points[here.Path[i]].Y - this.Points[here.Path[i + 1]].Y);
                x_offset += Math.abs(this.Points[here.Path[i + 1]].X - this.Points[here.Path[i + 2]].X);
                y_offset += Math.abs(this.Points[here.Path[i + 1]].Y - this.Points[here.Path[i + 2]].Y);

                if (x_offset > 0 && y_offset > 0) {
                    turn_cost += this._TURN_COST_VALUE;
                }
            }
            cost += turn_cost;
        }
        return cost;
    }

    /**
     * Find near point id
     * @param {number} id Point Id
     * @returns {number[][]} Near point id list
     */
    FindNearPoint(id) {
        let near_id =
            this.Lines.filter(x => x.includes(id))
                .flat()
                .filter(x => x != id);
        return near_id;
    }

    /**
    * @param {Point} start start point
    * @param {Point} end end point
    */
    GetPath(start, end) {
        let first_point_cost = this.NewPointCost(start, start, end);
        this.OpenList.push(first_point_cost);
        let min_idx = 0;
        /**
         * @type {number[]}
         */
        let short_path = null;
        while (this.OpenList.length > 0) {
            //Find minimum cost in openlist
            min_idx = 0;
            let next = this.OpenList.length === 1 ? this.OpenList[0] : this.OpenList.reduce((prev, curr, idx) => {
                if (prev.Cost < curr.Cost) {
                    return prev;
                } else {
                    min_idx = idx;
                    return curr;
                }
            });
            //Make sure path is minimum cost, not fisrt calculate result
            if (next.Id === end.Id) {
                short_path = next.Path;
                this.OpenList.length = 0;
                break;
            }
            let near_point_ids = this.FindNearPoint(next.Id);
            this.OpenList.splice(min_idx, 1);

            for (let i = 0; i < near_point_ids.length; i++) {
                //Make sure not turn back
                if (next.Path.includes(near_point_ids[i])) {
                    continue;
                }
                let point_cost = this.NewPointCost(this.Points[near_point_ids[i]], start, end, next);
                this.OpenList.push(point_cost);
            }
        }
        return short_path;
    }
}