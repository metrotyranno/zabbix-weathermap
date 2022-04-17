//Label Class
function Label(ctx, point, text, color, font, backgroundColor, outlineColor, outlineWidth) {
    this.ctx = ctx;
    this.point = point;
    this.text = text;
    this.color = color;
    this.font = font;
    this.backgroundColor = backgroundColor;
    this.outlineColor = outlineColor;
    this.outlineWidth = outlineWidth;

    this.textWidth = this.ctx.measureText(this.text).width *1.2;
    
    //Get height of text
    this.textHeight = this.ctx.measureText('M').width*1.1;

    this.draw = function(){
        //Calculate box width
        var boxWidth = this.textWidth + this.outlineWidth*2;
        var boxHeight = this.textHeight * 2 + this.outlineWidth*2 + 4;

        //Transform canvas to center box
        this.ctx.translate(-boxWidth / 2, -boxHeight / 2);

        //Draw box with outline and background color
        this.ctx.beginPath();
        this.ctx.rect(this.point.x, this.point.y, boxWidth, boxHeight);
        this.ctx.lineWidth = this.outlineWidth;
        this.ctx.strokeStyle = this.outlineColor;
        this.ctx.stroke();
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fill();

        //Restore canvas
        this.ctx.translate(boxWidth / 2, boxHeight / 2);

        // Draw the text
        // split text on newline
        var lines = this.text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            // Get line width
            var lineWidth = this.ctx.measureText(lines[i]).width;

            //Transform canvas to center text
            this.ctx.translate(-lineWidth / 2, -this.textHeight / 2 - this.outlineWidth * 2 + i * this.textHeight);

            //Draw text
            this.ctx.fillStyle = this.color;
            this.ctx.font = this.font.size + "px " + this.font.family;
            this.ctx.fillText(lines[i], this.point.x, this.point.y + this.font.size / 2);

            //Restore canvas
            this.ctx.translate(lineWidth / 2, this.textHeight / 2 + this.outlineWidth * 2 - i * this.textHeight);
        }
    }
}

// Export Class
export default Label;