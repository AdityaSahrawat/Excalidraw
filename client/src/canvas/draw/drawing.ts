import {Shape, State } from "../types";



export function refreshCanvas( ctx:CanvasRenderingContext2D ,canvas: HTMLCanvasElement, existingShapes : Shape[] , selectedShape: Shape | null , canvasOffSetX : number , canvasOffSetY: number , canvasScale: number ){
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear entire visible canvas

    ctx.fillStyle = 'rgba(0,0,0)';
    ctx.fillRect(0,0,canvas.width , canvas.height);
    ctx.save();

    ctx.setTransform(canvasScale, 0,0, canvasScale, canvasOffSetX, canvasOffSetY );

      existingShapes.forEach( (shape)=>{
          if(selectedShape?.id && shape.id === selectedShape.id){
              drawSelectionUI(ctx , shape)
          }
          drawShape(ctx , shape)
      })
      ctx.restore();
    
}

export function drawShape(ctx : CanvasRenderingContext2D , shape : Shape){
    ctx.globalAlpha = shape.opacity/100;
    ctx.lineWidth = shape.strokeWidth
    ctx.strokeStyle = shape.strokeColor
    switch(shape.type){
        case "Rect":
            ctx.fillStyle = shape.fillColor
            ctx.beginPath();
            ctx.rect(shape.x, shape.y, shape.width, shape.height);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
          break;
        case "Circle" :
            ctx.fillStyle = shape.fillColor;
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
            break;
        case "Line":
            ctx.beginPath();
            ctx.moveTo(shape.x, shape.y);
            ctx.lineTo(shape.x + shape.endx, shape.y + shape.endy);
            ctx.stroke();
            ctx.closePath();
            break;
        case "Pencil":
            if (shape.points.length < 2) return;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            ctx.moveTo(shape.points[0].x, shape.points[0].y);
            for (let i = 1; i < shape.points.length; i++) {
                ctx.lineTo(shape.points[i].x, shape.points[i].y);
            }
            ctx.stroke();
            ctx.closePath();
            break;
        case "Arrow" : 
            const endX = shape.x + shape.endx;
            const endY = shape.y + shape.endy;
            const angle = Math.atan2(endY - shape.y, endX - shape.x);
            const headLength = 15;

            // Line
            ctx.beginPath();
            ctx.moveTo(shape.x, shape.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            ctx.closePath();

            // Arrowhead
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(
                endX - headLength * Math.cos(angle - Math.PI / 6),
                endY - headLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                endX - headLength * Math.cos(angle + Math.PI / 6),
                endY - headLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fillStyle = shape.strokeColor;
            ctx.fill();
            break;

    }
}

export function getElementOnPointer(x : number , y : number , shapes : Shape[]){    
    // const elements = shapes.find(isWithinElement(x , y , shape))
    const shape =  shapes.find(shape => isWithinElement(x , y , shape))
    // console.log("shape selected:  " , shape)
    return shape
}

function getDistance( a : {x : number , y : number} , b : {x : number , y : number} ) : number{
    return  ((a.x - b.x)**2 + (a.y - b.y)**2)**0.5 
}

function isWithinElement(x: number , y: number , shape : Shape) : boolean{

    if(shape.type === "Rect"){
        const leftx = Math.min(shape.x , shape.x + shape.width)
        const topy = Math.min(shape.y , shape.y + shape.height)
        const rightx = Math.max(shape.x , shape.x + shape.width)
        const bottomy = Math.max(shape.y , shape.y + shape.height)
        return x>=leftx && x<=rightx && y<=bottomy && y>=topy;
    }
    if(shape.type === "Circle"){
        const dist = getDistance( {x,y} , {x : shape.x ,y : shape.y})
        return dist<=shape.radius
    }
    if(shape.type === "Line" || shape.type === "Arrow" ){
        const a = {x:shape.x , y : shape.y}
        const b = {x : shape.endx +x , y : y+ shape.endy}
        const c = { x, y }
        // const offSet = getDistance(a , b) - getDistance(b , c) - getDistance(a , c);
        // const threshold = 0.1 * getDistance(a,b);
        // return offSet < threshold
    
        return distanceToLineSegment(a, b, c) < 10;
    }
    if(shape.type === "Pencil"){
        for(let i =0; i<shape.points.length-1 ;i++){
            const p1 = shape.points[i]
            const p2 = shape.points[i+1]
            if(distanceToLineSegment(p1 , p2 , {x , y}) < 10 ){
                return true
            }
        }
    }

    return false;
}

function distanceToLineSegment(a: {x : number , y : number}, b: {x : number , y : number}, c: {x : number , y : number}): number {
    // Vector AB
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    
    // Vector AC
    const acx = c.x - a.x;
    const acy = c.y - a.y;
    
    // Dot product of AB and AC
    const dot = abx * acx + aby * acy;
    
    // Length of AB squared
    const lenABsq = abx * abx + aby * aby;
    
    // Normalized distance along AB (0 to 1)
    const d = dot / lenABsq;
    
    // Projected point
    let px, py;
    
    if (d <= 0) {
        // Beyond A end of segment
        px = a.x;
        py = a.y;
    } else if (d >= 1) {
        // Beyond B end of segment
        px = b.x;
        py = b.y;
    } else {
        // Projection falls on the segment
        px = a.x + d * abx;
        py = a.y + d * aby;
    }
    
    // Distance to projected point
    const dx = c.x - px;
    const dy = c.y - py;
    
    return Math.sqrt(dx * dx + dy * dy);
}

// Fix for the TypeScript error - replace String with string type
export function drawSelectionUI(
  ctx: CanvasRenderingContext2D,
  shape: Shape
) {
  const bounds = getShapeBounds(shape); 
  const padding = 14; 
  const handleSize = 8;
  const rotationRadius = 6;

  ctx.save();
  
  // ---- 1. Draw Bounding Box ----
  ctx.strokeStyle = "#3b82f6"; // Blue border
  ctx.lineWidth = 1;
  
  if (shape.type === "Line" || shape.type === "Arrow") {
    // Draw selection for Line/Arrow
    ctx.beginPath();
    ctx.moveTo(shape.x, shape.y);
    ctx.lineTo(shape.x + shape.endx, shape.y + shape.endy);
    ctx.stroke();
    
    // Draw handles at both ends
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#3b82f6";
    
    // Start point handle
    ctx.beginPath();
    ctx.arc(shape.x, shape.y, handleSize/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // End point handle
    ctx.beginPath();
    ctx.arc(shape.x + shape.endx, shape.y + shape.endy, handleSize/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Rotation handle (midpoint + offset)
    const midX = shape.x + shape.endx / 2;
    const midY = shape.y + shape.endy / 2;
    const angle = Math.atan2(shape.endy, shape.endx);
    const rotationHandleX = midX + Math.cos(angle + Math.PI/2) * padding;
    const rotationHandleY = midY + Math.sin(angle + Math.PI/2) * padding;
    
    ctx.beginPath();
    ctx.arc(rotationHandleX, rotationHandleY, rotationRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
    return;
  }

  // Original selection UI for other shapes
  ctx.strokeRect(
    bounds.x - 6, // Slightly larger than shape
    bounds.y - 6,
    bounds.width + 12,
    bounds.height + 12
  );

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 1;
  ctx.setLineDash([]); 

  // Top-left
  ctx.fillRect(bounds.x-6 - handleSize/2, bounds.y-6 - handleSize/2, handleSize, handleSize);
  ctx.strokeRect(bounds.x-6 - handleSize/2, bounds.y-6 - handleSize/2, handleSize, handleSize);

  // Top-right
  ctx.fillRect(bounds.x+6 + bounds.width - handleSize/2, bounds.y-6 - handleSize/2, handleSize, handleSize);
  ctx.strokeRect(bounds.x+6 + bounds.width - handleSize/2, bounds.y-6 - handleSize/2, handleSize, handleSize);

  // Bottom-left
  ctx.fillRect(bounds.x-6 - handleSize/2, bounds.y+6 + bounds.height - handleSize/2, handleSize, handleSize);
  ctx.strokeRect(bounds.x-6 - handleSize/2, bounds.y+6 + bounds.height - handleSize/2, handleSize, handleSize);

  // Bottom-right
  ctx.fillRect(bounds.x+6 + bounds.width - handleSize/2, bounds.y+6 + bounds.height - handleSize/2, handleSize, handleSize);
  ctx.strokeRect(bounds.x+6 + bounds.width - handleSize/2, bounds.y+6 + bounds.height - handleSize/2, handleSize, handleSize);

  // Rotation handle
  ctx.beginPath();
  ctx.arc(
    bounds.x + bounds.width/2,
    bounds.y - padding,
    rotationRadius,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

export function getShapeBounds(shape: Shape): { 
  x: number, 
  y: number, 
  width: number, 
  height: number 
} {
  switch (shape.type) {
    case "Rect":
      const x = Math.min(shape.x, shape.x + shape.width);
      const y = Math.min(shape.y, shape.y + shape.height);
      const width = Math.abs(shape.width);
      const height = Math.abs(shape.height);
      return { x, y, width, height };

    case "Circle":
      return {
        x: shape.x - shape.radius,
        y: shape.y - shape.radius,
        width: shape.radius * 2,
        height: shape.radius * 2
      };

    case "Line":
    case "Arrow":
      // For lines/arrows, use start/end points
      const minX = Math.min(shape.x, shape.x + shape.endx);
      const minY = Math.min(shape.y, shape.y + shape.endy);
      return {
        x: minX,
        y: minY,
        width: Math.abs(shape.endx),
        height: Math.abs(shape.endy)
      };

    case "Pencil":
      // Calculate min/max from all points
      let minXP = Infinity, minYP = Infinity;
      let maxXP = -Infinity, maxYP = -Infinity;
      
      shape.points.forEach(point => {
        minXP = Math.min(minXP, point.x);
        minYP = Math.min(minYP, point.y);
        maxXP = Math.max(maxXP, point.x);
        maxYP = Math.max(maxYP, point.y);
      });
      
      return {
        x: minXP,
        y: minYP,
        width: maxXP - minXP,
        height: maxYP - minYP
      };

    default:
      return { x: 0, y: 0, width: 0, height: 0 };
  }
}

export function getPosiToShape(x: number, y: number, shape: Shape | null): string | null {
  if (!shape) return null;

  const handleSize = 8;
  const bounds = getShapeBounds(shape);
  const padding = 6; // Changed from offset to padding to match drawSelectionUI

  // Define the bounding box with padding (matches what's drawn in drawSelectionUI)
  const paddedBounds = {
    x: bounds.x - padding,
    y: bounds.y - padding,
    width: bounds.width + padding * 2,
    height: bounds.height + padding * 2
  };

  // Edge handles (top, right, bottom, left)
  const edgeThreshold = 5; // How close to the edge to consider it a hit

  // Check top edge
  if (Math.abs(y - paddedBounds.y) < edgeThreshold && 
      x >= paddedBounds.x && x <= paddedBounds.x + paddedBounds.width) {
    return "top";
  }

  // Check right edge
  if (Math.abs(x - (paddedBounds.x + paddedBounds.width)) < edgeThreshold && 
      y >= paddedBounds.y && y <= paddedBounds.y + paddedBounds.height) {
    return "right";
  }

  // Check bottom edge
  if (Math.abs(y - (paddedBounds.y + paddedBounds.height)) < edgeThreshold && 
      x >= paddedBounds.x && x <= paddedBounds.x + paddedBounds.width) {
    return "bottom";
  }

  // Check left edge
  if (Math.abs(x - paddedBounds.x) < edgeThreshold && 
      y >= paddedBounds.y && y <= paddedBounds.y + paddedBounds.height) {
    return "left";
  }

  // Corner handles
  const cornerHandles = {
    "top-left": {
      x: paddedBounds.x - handleSize/2,
      y: paddedBounds.y - handleSize/2
    },
    "top-right": {
      x: paddedBounds.x + paddedBounds.width - handleSize/2,
      y: paddedBounds.y - handleSize/2
    },
    "bottom-left": {
      x: paddedBounds.x - handleSize/2,
      y: paddedBounds.y + paddedBounds.height - handleSize/2
    },
    "bottom-right": {
      x: paddedBounds.x + paddedBounds.width - handleSize/2,
      y: paddedBounds.y + paddedBounds.height - handleSize/2
    }
  };

  for (const [position, handle] of Object.entries(cornerHandles)) {
    const rect: Shape = {
      id: "-1",
      type: "Rect",
      x: handle.x,
      y: handle.y,
      width: handleSize,
      height: handleSize,
      strokeWidth: 2,
      fillColor: "random",
      strokeColor: "random",
      opacity: 100
    };

    if (isWithinElement(x, y, rect)) {
      return position;
    }
  }

  // Rotation handle
  const rotationHandle: Shape = {
    id: "-1",
    type: "Circle",
    x: bounds.x + bounds.width/2,
    y: bounds.y - 14,
    radius: 6,
    strokeWidth: 2,
    fillColor: "random",
    strokeColor: "random",
    opacity: 100

  };
  
  if (isWithinElement(x, y, rotationHandle)) {
    return "rotate";
  }

  return null;
}

export function getCanvasPoints(clientX: number, clientY: number, canvas: HTMLCanvasElement, state: State) {
  const rect = canvas.getBoundingClientRect();
  const x = (clientX - rect.left - state.canvasOffsetX) / state.canvasScale;
  const y = (clientY - rect.top - state.canvasOffsetY) / state.canvasScale;
  return { x, y };
}
