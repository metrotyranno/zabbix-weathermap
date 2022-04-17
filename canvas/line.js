//Import canvas shapes
import Arrowhead from "./arrowhead.js";
import Label from "./label.js";

// Create a line class
function Line(ctx, start, end, width, leftColor, rightColor, leftLabel, rightLabel, outlineColor, outlineWidth) {
    this.ctx = ctx;
    this.start = start;
    this.end = end;
    this.width = width;
    this.leftColor = leftColor;
    this.rightColor = rightColor;
    this.outlineColor = outlineColor;
    this.outlineWidth = outlineWidth;

    // Get the middle point of the line
    this.midpoint = {
        x: (this.start.x + this.end.x) / 2,
        y: (this.start.y + this.end.y) / 2
    };

    // get the first midpoint of the line
    this.leftMidpoint = {
        x: (this.start.x + this.midpoint.x) / 2,
        y: (this.start.y + this.midpoint.y) / 2
    };

    // Get the right midpoint
    this.rightMidpoint = {
        x: (this.end.x + this.midpoint.x) / 2,
        y: (this.end.y + this.midpoint.y) / 2
    };

    //Get the angle from the last point of left points to the midpoint
    this.leftAngle = Math.atan2(this.midpoint.y - this.leftMidpoint.y, this.midpoint.x - this.leftMidpoint.x);

    //Get the angle from the first point of right points to the midpoint
    this.rightAngle = Math.atan2(this.midpoint.y - this.rightMidpoint.y, this.midpoint.x - this.rightMidpoint.x);

    //Get a point width units away from the midpoint along left angle\
    this.leftEnd = {
        x: this.midpoint.x - this.width * Math.cos(this.leftAngle),
        y: this.midpoint.y - this.width * Math.sin(this.leftAngle)
    };

    //Get a point width units away from the midpoint along right angle
    this.rightEnd = {
        x: this.midpoint.x - this.width * Math.cos(this.rightAngle),
        y: this.midpoint.y - this.width * Math.sin(this.rightAngle)
    };

    // Create the left and right arrowheads
    this.leftArrowhead = new Arrowhead(ctx, this.midpoint, this.leftAngle, this.width, this.leftColor, this.outlineColor, this.outlineWidth);
    this.rightArrowhead = new Arrowhead(ctx, this.midpoint, this.rightAngle, this.width, this.rightColor, this.outlineColor, this.outlineWidth);

    // Draw Outline
    this.drawOutline = function() {
        // Draw the arrowheads outline
        this.leftArrowhead.drawOutline();
        this.rightArrowhead.drawOutline();

        // Draw the left outline from start to leftend
        this.ctx.beginPath();
        this.ctx.moveTo(this.start.x, this.start.y);
        this.ctx.lineTo(this.leftEnd.x, this.leftEnd.y);
        this.ctx.lineWidth = this.width + this.outlineWidth;
        this.ctx.strokeStyle = this.outlineColor;
        this.ctx.stroke();

        // Draw the right outline from end to rightend
        this.ctx.beginPath();
        this.ctx.moveTo(this.end.x, this.end.y);
        this.ctx.lineTo(this.rightEnd.x, this.rightEnd.y);
        this.ctx.lineWidth = this.width + this.outlineWidth;
        this.ctx.strokeStyle = this.outlineColor;
        this.ctx.stroke();
    }

    // Draw
    this.drawFill = function() {
        // Draw the arrowheads
        this.leftArrowhead.drawFill();
        this.rightArrowhead.drawFill();

        // Draw the left line from start to leftend
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.leftEnd.x, this.leftEnd.y);
        ctx.lineWidth = this.width;
        ctx.strokeStyle = this.leftColor;
        ctx.stroke();

        // Draw the right line from end to rightend
        ctx.beginPath();
        ctx.moveTo(this.end.x, this.end.y);
        ctx.lineTo(this.rightEnd.x, this.rightEnd.y);
        ctx.lineWidth = this.width;
        ctx.strokeStyle = this.rightColor;
        ctx.stroke();
    }

    this.drawLabel = function() {
        // Create a label
        this.leftLabel = new Label(ctx, this.leftMidpoint, leftLabel, "black", {size: 10, family: "Arial"}, "white", "black", 1);
        this.rightLabel = new Label(ctx, this.rightMidpoint, rightLabel, "black", {size: 10, family: "Arial"}, "white", "black", 1);

        // Draw the label
        this.leftLabel.draw();
        this.rightLabel.draw();
    }

    // Draw
    this.draw = function() {
        this.drawOutline();
        this.drawFill();
        this.drawLabel();
    }
}

//Export
export default Line;