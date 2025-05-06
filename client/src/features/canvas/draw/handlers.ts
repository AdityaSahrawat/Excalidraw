import { Shape } from "../types";
import { refreshCanvas } from "./drawing";
import { getExistingShapes } from "./http";


export async function handleMouseEvents(canvas : HTMLCanvasElement ,roomId : string , socket : WebSocket ){

    const ctx = canvas.getContext("2d");
    if(!ctx){
        return;
    }

    let existingShapes : Shape[] = await getExistingShapes(roomId)

    socket.onmessage = (event)=>{
        const message = JSON.parse(event.data);
        
        if(message.type == "chat"){
            const parsedShape = JSON.parse(message.message)
            existingShapes.push(parsedShape)
            refreshCanvas(ctx , canvas , existingShapes)
        }
    }

    refreshCanvas(ctx , canvas , existingShapes)
    
    let isDrawing = false;
    let currentPencilPath: {x: number, y: number}[] = [];
    let pencilSettings = {
        color: '#ffffff',
        width: 2
    };  

    let clicked = false;
    let startX = 0;
    let startY = 0;


    const HandleMouseDown = (e: MouseEvent)=>{
        clicked = true
        startX = e.clientX;
        startY = e.clientY;
        // @ts-ignore
        const selectedTool = window.selectedTool;
        if(selectedTool === "Pencil"){
            isDrawing = true
            currentPencilPath = [];
            currentPencilPath.push({x : startX , y : startY})
        }
    }

    const HandleMouseUpOrNot = (e:MouseEvent)=>{
        clicked = false;
        const width = e.clientX - startX;
        const height = e.clientY - startY;
        // @ts-ignore
        const selectedTool = window.selectedTool;
        
        let shape: Shape;
        
        if (selectedTool === "Circle") {
            const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
            const centerX = startX + width/2;
            const centerY = startY + height/2;
            
            shape = {
                type: "Circle",
                x: centerX,
                y: centerY,
                radius: radius
            };
        } else if (selectedTool === "Rect") {
            shape = {
                type: "Rect",
                x: startX,
                y: startY,
                width: width,
                height: height
            };
        }else if (selectedTool === "Line"){
            console.log(selectedTool , " in mouseup")
            shape = {
                type : "Line",
                x : startX,
                y : startY,
                endx : width,
                endy : height
            }
        }else if (selectedTool === "Pencil"){
            shape ={
                type : "Pencil",
                points : [...currentPencilPath],
                color : pencilSettings.color,
                width : pencilSettings.width 
            }
            currentPencilPath = []
        }else if (selectedTool === "Arrow"){
            shape = {
                type: "Arrow",
                x: startX,
                y: startY,
                endx: e.clientX - startX,
                endy: e.clientY - startY,
            }
        }else{
            return;
        }
        
        existingShapes.push(shape);
        
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "chat",
                roomId,  
                message: JSON.stringify(shape)
            }));
        }
    }

    const HandleMouseMove = (e:MouseEvent)=>{
        if(!clicked)return;
        const width = e.clientX - startX;
        const height = e.clientY - startY;
        refreshCanvas(ctx , canvas , existingShapes);
        
        ctx.strokeStyle = "rgba(255 , 255 , 255)"
        // @ts-ignore
        const selectedTool = window.selectedTool;
        if(selectedTool === "Rect"){
            ctx.strokeRect(startX , startY , width ,height)
        }else if (selectedTool === "Circle"){
            let radius = Math.max(height , width)/2
            if(radius <0){  radius = -radius}      //////////////////////////////////imp
            ctx.beginPath();
            ctx.arc(startX + width/2 ,startY + height/2 , radius ,0 , Math.PI * 2)
            ctx.stroke()
            ctx.closePath()
        } else if(selectedTool === "Line"){
            console.log(selectedTool , " in mousemove")
            ctx.beginPath();
            ctx.moveTo(startX , startY)
            ctx.lineTo(startX + width , startY + height)
            ctx.stroke()
        }else if (selectedTool === "Pencil" && isDrawing){
            currentPencilPath.push({x:e.clientX , y: e.clientY})
            if(currentPencilPath.length >2){
                ctx.lineCap = 'round'
                ctx.lineJoin = 'round'

                ctx.moveTo(currentPencilPath[0].x , currentPencilPath[0].y);
                for(let i = 1;i<currentPencilPath.length ; i++){
                    ctx.lineTo(currentPencilPath[i].x , currentPencilPath[i].y)
                }
                ctx.stroke()
                ctx.closePath()

            }
        }else if (selectedTool === "Arrow"){
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(e.clientX, e.clientY);
            ctx.stroke();
        
            // Calculate angle of the line
            const angle = Math.atan2(e.clientY - startY, e.clientX - startX);
            const headLength = 15;
            ctx.fillStyle = "rgba(255, 255, 255)";
            // Draw arrowhead
            ctx.beginPath();
            ctx.moveTo(e.clientX, e.clientY);
            ctx.lineTo(
                e.clientX - headLength * Math.cos(angle - Math.PI / 6),
                e.clientY - headLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                e.clientX - headLength * Math.cos(angle + Math.PI / 6),
                e.clientY - headLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fill();
            
        }
    }

    canvas.addEventListener('mousedown', HandleMouseDown);
    canvas.addEventListener('mousemove', HandleMouseMove);
    canvas.addEventListener('mouseup', HandleMouseUpOrNot);
    canvas.addEventListener('mouseout', HandleMouseUpOrNot);
}