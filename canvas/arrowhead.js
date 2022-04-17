// Arrowhead Class
function Arrowhead(ctx, point, angle, width, color, outlineColor, outlineWidth) {
    this.ctx = ctx;
    this.point = point;
    this.angle = angle;
    this.width = width;
    this.color = color;
    this.outlineColor = outlineColor;
    this.outlineWidth = outlineWidth;

    this.drawFill = function(){
        // Transform canvas around the Point using angle
        this.ctx.translate(this.point.x, this.point.y);
        this.ctx.rotate(this.angle);
        this.ctx.translate(-this.point.x, -this.point.y);

        // Draw the arrowhead
        this.ctx.beginPath();
        this.ctx.moveTo(point.x, point.y);
        this.ctx.lineTo(point.x - this.width * 2, point.y + this.width * 1.5);
        this.ctx.lineTo(point.x - this.width * 2, point.y - this.width * 1.5);
        this.ctx.lineTo(point.x, point.y);
        this.ctx.lineWidth = this.width;
        this.ctx.fillStyle = this.color;
        this.ctx.fill();

        // Reset canvas
        this.ctx.translate(this.point.x, this.point.y);
        this.ctx.rotate(-this.angle);
        this.ctx.translate(-this.point.x, -this.point.y);

    }

    this.drawOutline = function(){
        // Transform canvas around the Point using angle
        this.ctx.translate(this.point.x, this.point.y);
        this.ctx.rotate(this.angle);
        this.ctx.translate(-this.point.x, -this.point.y);

        // Draw the outline
        this.ctx.beginPath();
        this.ctx.moveTo(point.x, point.y);
        this.ctx.lineTo(point.x - this.width * 2, point.y + this.width * 1.5);
        this.ctx.lineTo(point.x - this.width * 2, point.y - this.width * 1.5);
        this.ctx.lineTo(point.x, point.y);
        this.ctx.lineWidth = this.outlineWidth;
        this.ctx.strokeStyle = this.outlineColor;
        this.ctx.stroke();

        // Reset canvas
        this.ctx.translate(this.point.x, this.point.y);
        this.ctx.rotate(-this.angle);
        this.ctx.translate(-this.point.x, -this.point.y);
    }
}

// Export Class
export default Arrowhead;