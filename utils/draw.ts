import { DetectedObject } from "@tensorflow-models/coco-ssd";


// mirrored, predictions, canvasRef.current?.getContext('2d')
export function drawOnCanvas(
    mirrored: boolean,
    predictions: DetectedObject[],
    ctx: CanvasRenderingContext2D | null | undefined
  ) {
    predictions.forEach((detectedObject: DetectedObject) => {
      const { class: name, bbox, score } = detectedObject;
      const [x, y, width, height] = bbox;
  
      if (ctx) {
        ctx.beginPath();
  
        // styling
        ctx.fillStyle = name === "person" ? "#FFFF00" : "#00B612";
        ctx.globalAlpha = 0.4;
  
        mirrored
          ? ctx.roundRect(ctx.canvas.width - x, y, -width, height, 8)
          : ctx.roundRect(x, y, width, height, 8);
  
        // draw stroke or fill
        ctx.fill();
  
        // text styling
        ctx.font = "20px bold Courier New";
        ctx.fillStyle = 'black'
        ctx.globalAlpha = 1;
        mirrored
          ? ctx.fillText(name, ctx.canvas.width - x -width + 10, y + 20)
          : ctx.fillText(name, x + 10 , y + 20);
      }
    });
  }