import { Shape } from "../types";



export function refreshCanvas( ctx:CanvasRenderingContext2D ,canvas: HTMLCanvasElement, existingShapes : Shape[]){
    ctx.clearRect(0 , 0 , canvas.width , canvas.height);
    ctx.fillStyle = 'rgba(0,0,0)';
    ctx.fillRect(0,0,canvas.width , canvas.height);

    if(existingShapes){
        existingShapes.map( (shape)=>{
            drawSahpes(ctx , shape)
        })
    }
}


export function drawSahpes(ctx : CanvasRenderingContext2D , shape : Shape){


    switch(shape.type){
        case "Rect":
            ctx.strokeStyle = 'rgba(255,255,255)';
            ctx.strokeRect(shape.x , shape.y , shape.width , shape.height)
            break;
        case "Circle" :
            ctx.beginPath()
            // ctx.strokeStyle = 'rgba(255,255,255)';
            ctx.arc(shape.x , shape.y , shape.radius , 0 , Math.PI*2)
            ctx.stroke()
            ctx.closePath()
            break;
        case "Line":
            ctx.beginPath()
            // ctx.strokeStyle = 'rgba(255,255,255)';
            ctx.moveTo(shape.x , shape.y)
            ctx.lineTo(shape.x + shape.endx , shape.y + shape.endy)
            ctx.stroke()
            ctx.closePath()
            break;
        case "Pencil":
            if(shape.points.length < 2) return; 
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                ctx.moveTo(shape.points[0].x, shape.points[0].y);
                
                for(let i = 1; i < shape.points.length; i++) {
                    ctx.lineTo(shape.points[i].x, shape.points[i].y);
                }
                
                ctx.stroke();
                ctx.closePath();
            break;
        case "Arrow" : 
            const endX = shape.x + shape.endx;
            const endY = shape.y + shape.endy;
            
            // Draw the main line
            ctx.beginPath();
            ctx.moveTo(shape.x, shape.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Calculate angle
            const angle = Math.atan2(endY - shape.y, endX - shape.x);
            const headLength = 15;
            
            ctx.fillStyle = "rgba(255, 255, 255)";
            // Draw arrowhead
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
            ctx.fill();
        break;

    }
}