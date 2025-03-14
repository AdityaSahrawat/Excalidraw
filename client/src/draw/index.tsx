"use client"

import axios from "axios";
const http_backend = "http://localhost:3009"


type shape = {
    type : "rect" ,
    x : number,
    y : number,
    width : number , 
    height : number
} | {
    type : "circle",
    x : number ,
    y : number , 
    radius : number
}

export default async function initDraw(canvas : HTMLCanvasElement , roomId : string , socket : WebSocket){

    let existingShapes : shape[] = await getExistingShapes(roomId)


    const ctx = canvas.getContext("2d");
    if(!ctx){
        return;
    }

    socket.onmessage = (event)=>{
        const message = JSON.parse(event.data);
        
        if(message.type == "chat"){
            const parsedShape = JSON.parse(message.message)
            existingShapes.push(parsedShape)
            clearCanvas(ctx , canvas , existingShapes)
        }

        
    }

    clearCanvas(ctx , canvas , existingShapes)
    
    let clicked = false;
    let startX = 0;
    let startY = 0;

    canvas.addEventListener( "mousedown", (e)=>{
        clicked = true
        startX = e.clientX;
        startY = e.clientY;
    }) 
    canvas.addEventListener( "mouseup", (e)=>{
        clicked = false;
        const width = e.clientX - startX;
        const height = e.clientY - startY

        const shape : shape = {
            type: "rect",
            x: startX,
            y: startY,
            height,
            width
        }
        existingShapes.push(shape)
        
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "chat",
                roomId,  
                message: JSON.stringify(shape)
            }));
        } else {
            console.warn("WebSocket is not open. Cannot send message.");
        }
    })
    canvas.addEventListener( "mousemove", (e)=>{
        if(clicked){
            const width = e.clientX - startX;
            const height = e.clientY - startY;
            clearCanvas(ctx , canvas , existingShapes);
            ctx.strokeRect(startX , startY , width ,height)
        }
    })
}


function clearCanvas(ctx : CanvasRenderingContext2D , canvas: HTMLCanvasElement , existingShapes: shape[]){
       ctx.clearRect(0 , 0 , canvas.width , canvas.height);
       ctx.fillStyle = 'rgba(0,0,0)';
       ctx.fillRect(0,0,canvas.width , canvas.height);

       if(existingShapes){
            existingShapes.map( (shape)=>{
                if(shape.type === "rect"){
                    ctx.strokeStyle = 'rgba(255,255,255)';
                    ctx.strokeRect(shape.x , shape.y , shape.width , shape.height)
                }
        })
       }
}

async function getExistingShapes (rootId :String){
    const response = await axios.get(`${http_backend}/v1/web/chats/${rootId}`)
    console.log(response)
    const shapesArray = response.data.chats
    if (!shapesArray){
        return []
    }
    const shapes = shapesArray.map( (x: {message: string})=>{
        const shapeData = JSON.parse(x.message);
        return shapeData
    })

    return shapes
 
}