"use client"

const http_backend = "http://localhost:3009"
import { getExistingShapes } from "./http";

import { Shape, State } from "../types";
import { refreshCanvas } from "./drawing";
import { HandleMouseDown, HandleMouseMove, HandleMouseUp, HandleWheel } from "./handlers";


let stableMouseUp: ((e: MouseEvent) => void) | null = null;
let stableMouseDown: ((e: MouseEvent) => void) | null = null;
let stableMouseMove: ((e: MouseEvent) => void) | null = null;
let stableWheel: ((e: WheelEvent) => void) | null = null;

export default async function initDraw(canvas : HTMLCanvasElement , roomId : string , socket : WebSocket){
    
    const ctx = canvas.getContext("2d");
    if(!ctx){
        return;
    }

    let state : State = {
            existingShapes: [],
            selectedShape: null,
            isDrawing: false,
            currentPencilPath: [] as {x: number, y: number}[],
            clicked: false,
            startX: 0,
            startY: 0,
            offsetX: 0,
            offsetY: 0,
            movedShapeIndex: "-1" ,
            resizeHandle : null,
            endOffsetX : 0,
            endOffsetY : 0 ,
            canvasOffsetX: 0,
            canvasOffsetY: 0,
            canvasScale: 1,
            lastPanx : 0,
            lastPany : 0,
        }
    
    state.existingShapes = await getExistingShapes(roomId)
    refreshCanvas(ctx , canvas , state.existingShapes , state.selectedShape, state.canvasOffsetX , state.canvasOffsetY , state.canvasScale)
    console.log(state.existingShapes)
    
    socket.onmessage = (event)=>{
        const message = JSON.parse(event.data);
        
        if(message.type == "addShape"){
            const parsedShape = JSON.parse(message.shape)
            state.existingShapes.push(parsedShape)
            refreshCanvas(ctx , canvas , state.existingShapes ,state.selectedShape, state.canvasOffsetX , state.canvasOffsetY , state.canvasScale)
        }
        if(message.type === "deleteShape"){
            // const parsedShape
            const parsedShape = JSON.parse(message.shape)
            state.existingShapes = state.existingShapes.filter(e => e.id != parsedShape.id)
        }
        if(message.type == "moveShape"){
            console.log("message at moveShape")
            // const parsedShape
            if(!message){return}
            let parsedShape;
            if (typeof message.shape === 'string') {
                parsedShape = JSON.parse(message.shape);
            } else {
                parsedShape = message.shape;
            }
            const id = parsedShape.id
            const index : number = state.existingShapes.findIndex(s => s.id == id)
            if(index != -1){
                state.existingShapes[index] =parsedShape
                refreshCanvas(ctx , canvas , state.existingShapes ,state.selectedShape, state.canvasOffsetX , state.canvasOffsetY , state.canvasScale)
            }
        }
    }

    stableMouseUp = (e: MouseEvent) => HandleMouseUp(e, state, socket, roomId , canvas);
    stableMouseDown = (e: MouseEvent) => HandleMouseDown(ctx , canvas , e, state);
    stableMouseMove = (e: MouseEvent) => HandleMouseMove(e, state, socket, roomId, ctx, canvas);
    stableWheel = (e: WheelEvent) => HandleWheel(ctx, canvas,  e, state );

    canvas.addEventListener('mousedown', stableMouseDown);
    canvas.addEventListener('mousemove', stableMouseMove);
    canvas.addEventListener('mouseup', stableMouseUp);
    canvas.addEventListener('wheel', stableWheel);

    return () => {
        canvas.removeEventListener('mousedown', stableMouseDown!);
        canvas.removeEventListener('mousemove', stableMouseMove!);
        canvas.removeEventListener('mouseup', stableMouseUp!);
        canvas.removeEventListener('wheel', stableWheel!);
    };
}