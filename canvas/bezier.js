//Import classes
import Arrowhead from "./arrowhead.js";
import Label from "./label.js";

// Create a bezier curve that takes 2 control points
function BezierCurve(ctx, start, control1, control2, end, width, leftColor, rightColor, leftLabel, rightLabel, outlineColor, outlineWidth, resolution) {
    this.ctx = ctx;
    this.start = start;
    this.control1 = control1;
    this.control2 = control2;
    this.end = end;
    this.width = width;
    this.leftColor = leftColor;
    this.rightColor = rightColor;
    this.leftLabel = leftLabel;
    this.rightLabel = rightLabel;
    this.outlineColor = outlineColor;
    this.outlineWidth = outlineWidth;
    this.resolution = resolution;

    // Resolution must be even
    if (this.resolution % 2 != 0) {
        this.resolution += 1;
    }

    // Get the point on the curve at a given t
    this.getPoint = function(t) {
        var x = (1 - t) * (1 - t) * (1 - t) * this.start.x + 3 * (1 - t) * (1 - t) * t * this.control1.x + 3 * (1 - t) * t * t * this.control2.x + t * t * t * this.end.x;
        var y = (1 - t) * (1 - t) * (1 - t) * this.start.y + 3 * (1 - t) * (1 - t) * t * this.control1.y + 3 * (1 - t) * t * t * this.control2.y + t * t * t * this.end.y;
        return {x: x, y: y};
    };

    // Get all points along the curve using the resolution
    this.getPoints = function() {
        var points = [];
        for (var i = 0; i <= resolution; i++) {
            var t = i / resolution;
            var point = this.getPoint(t);
            points.push(point);
        }
        return points;
    };

    this.points = this.getPoints();

    // Split the points in half
    var leftPoints = this.points.slice(0, this.points.length / 2);
    var rightPoints = this.points.slice(this.points.length / 2);

    // Remove first element from right points
    const midpoint = rightPoints.shift();
    
    // Get middle point of 2 arrays
    this.leftMidpoint = leftPoints[leftPoints.length / 2];
    this.rightMidpoint = rightPoints[rightPoints.length / 2];

    // Get the angle from the last point of left points to the midpoint
    var leftAngle = Math.atan2(midpoint.y - leftPoints[leftPoints.length - 1].y, midpoint.x - leftPoints[leftPoints.length - 1].x);

    // Get the angle from the first point of right points to the midpoint
    var rightAngle = Math.atan2(midpoint.y - rightPoints[0].y, midpoint.x - rightPoints[0].x);

    // Get a point 5 units away from the midpoint along left angle
    var leftEnd = {
        x: midpoint.x - 10 * Math.cos(leftAngle),
        y: midpoint.y - 10 * Math.sin(leftAngle)
    };

    // Get a point 5 units away from the midpoint along right angle
    var rightEnd = {
        x: midpoint.x - 10 * Math.cos(rightAngle),
        y: midpoint.y - 10 * Math.sin(rightAngle)
    };
    
    // Right points needs to be inverted for propper drawing
    rightPoints.reverse();

    // Create the left and right arrowheads
    var leftArrowhead = new Arrowhead(this.ctx, midpoint, leftAngle, this.width, this.leftColor, this.outlineColor, this.outlineWidth);
    var rightArrowhead = new Arrowhead(this.ctx, midpoint, rightAngle, this.width, this.rightColor, this.outlineColor, this.outlineWidth);

    this.drawOutline = function() {
        // Draw the arrowheads outline
        leftArrowhead.drawOutline();
        rightArrowhead.drawOutline();

        // Draw a outline along all left points and end at the middle
        ctx.beginPath();
        ctx.moveTo(leftPoints[0].x, leftPoints[0].y);
        for (var i = 1; i < leftPoints.length; i++) {
            // Point is not within 5 pixels of the midpoint
            if (Math.abs(leftPoints[i].x - midpoint.x) > 5 || Math.abs(leftPoints[i].y - midpoint.y) > 5) {
                ctx.lineTo(leftPoints[i].x, leftPoints[i].y);
            }
        }
        ctx.lineTo(leftEnd.x, leftEnd.y);
        ctx.lineWidth = this.outlineWidth + this.width;
        ctx.strokeStyle = this.outlineColor;
        ctx.stroke();

        // Draw a outline along all right points and end at the middle
        ctx.beginPath();
        ctx.moveTo(rightPoints[0].x, rightPoints[0].y);
        for (var i = 1; i < rightPoints.length; i++) {
            // Point is not within 5 pixels of the midpoint
            if (Math.abs(rightPoints[i].x - midpoint.x) > 5 || Math.abs(rightPoints[i].y - midpoint.y) > 5) {
                ctx.lineTo(rightPoints[i].x, rightPoints[i].y);
            }
        }
        ctx.lineTo(rightEnd.x, rightEnd.y);
        ctx.lineWidth = this.outlineWidth + this.width;
        ctx.strokeStyle = this.outlineColor;
        ctx.stroke();
    }

    this.drawFill = function() {
        // Draw the arrowheads
        leftArrowhead.drawFill();
        rightArrowhead.drawFill();

        // Draw a line along all left points and end at the middle
        ctx.beginPath();
        ctx.moveTo(leftPoints[0].x, leftPoints[0].y);
        for (var i = 1; i < leftPoints.length; i++) {
            // Point is not within width pixels of the midpoint
            if (Math.abs(leftPoints[i].x - midpoint.x) > 5 || Math.abs(leftPoints[i].y - midpoint.y) > this.width) {
                ctx.lineTo(leftPoints[i].x, leftPoints[i].y);
            }
        }
        ctx.lineTo(leftEnd.x, leftEnd.y);
        ctx.strokeStyle = this.leftColor;
        ctx.lineWidth = this.width;
        ctx.stroke();

        // Draw a line along all right points and end at the middle
        ctx.beginPath();
        ctx.moveTo(rightPoints[0].x, rightPoints[0].y);
        for (var i = 1; i < rightPoints.length; i++) {
            // Point is not within width pixels of the midpoint
            if (Math.abs(rightPoints[i].x - midpoint.x) > 5 || Math.abs(rightPoints[i].y - midpoint.y) > this.width) {
                ctx.lineTo(rightPoints[i].x, rightPoints[i].y);
            }
            
        }
        ctx.lineTo(rightEnd.x, rightEnd.y);
        ctx.strokeStyle = this.rightColor;
        ctx.lineWidth = this.width;
        ctx.stroke();
    }

    // Draw Label
    this.drawLabel = function() {
        // Create a label
        this.leftLabel = new Label(ctx, this.leftMidpoint, leftLabel, "black", {size: 10, family: "Arial"}, "white", "black", 1);
        this.rightLabel = new Label(ctx, this.rightMidpoint, rightLabel, "black", {size: 10, family: "Arial"}, "white", "black", 1);

        // Draw the label
        this.leftLabel.draw();
        this.rightLabel.draw();
    }

    // Draw the curve
    this.draw = function() {
        this.drawOutline();
        this.drawFill();
        this.drawLabel();
    }
}

// Export Class
export default BezierCurve;