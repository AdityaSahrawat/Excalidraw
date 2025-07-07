"use client"

import { DrawProps } from ".";
import { Shape, State } from "../types";
import { getCanvasPoints, getElementOnPointer, getPosiToShape, getShapeBounds, refreshCanvas } from "./drawing";


export const HandleMouseDown = (ctx :CanvasRenderingContext2D , canvas : HTMLCanvasElement  , e: MouseEvent , state : State , drawProps :React.RefObject<DrawProps>)=>{
    const strokeWidth = drawProps.current.strokeWidth
    const fillColor = drawProps.current.fillColor
    const opacity = drawProps.current.opacity
    const strokeColor = drawProps.current.strokeColor
    const selectedTool = drawProps.current.selectedTool
    state.clicked = true
    let {x : canvasX ,y : canvasY} = getCanvasPoints(e.clientX , e.clientY , canvas , state)
    state.startX = canvasX;
    state.startY = canvasY;
    if(selectedTool === "Pencil"){
        state.isDrawing = true
        state.currentPencilPath = [];
        state.currentPencilPath.push({x : state.startX , y : state.startY})
    }else if(selectedTool === "Pointer"){

        const resizeShape = getPosiToShape(canvasX , canvasY , state.selectedShape)
        if(state.selectedShape && resizeShape){
            state.resizeHandle = resizeShape
            return
        }


        const element = getElementOnPointer(canvasX , canvasY , state.existingShapes)
        // setSelectedShape(element ?? null) // undefined to null
        state.selectedShape = element ?? null
        console.log("selected shape :  " , state.selectedShape)
        refreshCanvas(ctx , canvas , state.existingShapes, state.selectedShape, state.canvasOffsetX , state.canvasOffsetY , state.canvasScale)
        
        if(element){

            state.movedShapeIndex = element.id;

            // Only calculate offsets for shapes that have x/y properties
            if (element.type === "Rect" || element.type === "Circle" || 
                element.type === "Line" || element.type === "Arrow") {
                state.offsetX = canvasX - element.x;
                state.offsetY = canvasY - element.y;
                
                // Additional offset calculations for Line/Arrow if needed
                if (element.type === "Line" || element.type === "Arrow") {
                    state.endOffsetX = canvasX - (element.x + element.endx);
                    state.endOffsetY = canvasY - (element.y + element.endy);
                }
            } else if (element.type === "Pencil") {
                // For pencil, use the first point as reference
                const firstPoint = element.points[0];
                state.offsetX = canvasX - firstPoint.x;
                state.offsetY = canvasY - firstPoint.y;
            }
        }
    }else if(selectedTool === "Hand"){
        state.lastPanx = canvasX;
        state.lastPany = canvasY
    }
}

export const HandleMouseUp = (e:MouseEvent , state : State , socket : WebSocket , roomId : string , canvas : HTMLCanvasElement , drawProps :React.RefObject<DrawProps> )=>{
    const strokeWidth = drawProps.current.strokeWidth
    const fillColor = drawProps.current.fillColor
    const opacity = drawProps.current.opacity
    const strokeColor = drawProps.current.strokeColor
    const selectedTool = drawProps.current.selectedTool
    
    e.stopPropagation();
    // e.stopImmediatePropagation();
    let {x : canvasX ,y : canvasY} = getCanvasPoints(e.clientX , e.clientY , canvas , state)

    state.resizeHandle = null


    if(state.clicked && state.selectedShape){
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "shapeMoved",
                roomId,  
                shapeId : state.selectedShape.id,
                shape : state.selectedShape
            }));

            // state.selectedShape = null
        }
    }
    state.clicked = false;
    const width = canvasX - state.startX;
    const height = canvasY - state.startY;
    
    let shape: Shape;
    const uuid = crypto.randomUUID() 
    
    if (selectedTool === "Circle") {
        const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
        const centerX = state.startX + width/2;
        const centerY = state.startY + height/2;
                    
        shape = {
            id : uuid,
            type: "Circle",
            x: centerX,
            y: centerY,
            radius: radius,
            strokeWidth: strokeWidth,
            fillColor: fillColor,
            strokeColor: strokeColor,
            opacity: opacity
        };
    } else if (selectedTool === "Rect") {
        console.log("strclr : " , strokeColor)
        shape = {
            id : uuid,
            type: "Rect",
            x: state.startX,
            y: state.startY,
            width: width,
            height: height,
            strokeWidth: strokeWidth,
            fillColor: fillColor,
            strokeColor: strokeColor,
            opacity: opacity
        };
    }else if (selectedTool === "Line"){
        shape = {
            id : uuid,
            type : "Line",
            x : state.startX,
            y : state.startY,
            endx : width,
            endy : height,
            strokeWidth: strokeWidth,
            strokeColor: strokeColor,
            opacity: opacity
        }
    }else if (selectedTool === "Pencil"){
        shape ={
            id : uuid,
            type : "Pencil",
            points : [...state.currentPencilPath],
            strokeWidth: strokeWidth,
            strokeColor: strokeColor,
            opacity: opacity
        }
        state.currentPencilPath = []
        state.isDrawing = false
    }else if (selectedTool === "Arrow"){
        shape = {
            id : uuid,
            type: "Arrow",
            x: state.startX,
            y: state.startY,
            endx: canvasX - state.startX,
            endy: canvasY - state.startY,
            strokeWidth: strokeWidth,
            strokeColor: strokeColor,
            opacity: opacity
        }
    }else{
        return;
    }
    state.existingShapes.push(shape);
    
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: "addShape",
            roomId,  
            shape: JSON.stringify(shape),
            shapeId : shape.id
        }));
    }
}

export const HandleMouseMove = (e:MouseEvent , state : State , socket : WebSocket , roomId : string , ctx: CanvasRenderingContext2D , canvas:HTMLCanvasElement , drawProps :React.RefObject<DrawProps>)=>{
    const strokeWidth = drawProps.current.strokeWidth
    const fillColor = drawProps.current.fillColor
    const opacity = drawProps.current.opacity
    const strokeColor = drawProps.current.strokeColor
    const selectedTool = drawProps.current.selectedTool
    
    let {x : canvasX ,y : canvasY} = getCanvasPoints(e.clientX , e.clientY , canvas , state);
    
    if(state.clicked && selectedTool === "Hand"){
        let dx = (canvasX - state.lastPanx) * state.canvasScale;
        let dy = (canvasY - state.lastPany) * state.canvasScale;

        state.canvasOffsetX += dx;
        state.canvasOffsetY += dy;

        state.lastPanx = canvasX;
        state.lastPany = canvasY;
        refreshCanvas(ctx , canvas  , state.existingShapes , state.selectedShape, state.canvasOffsetX , state.canvasOffsetY , state.canvasScale)
    }
    if (selectedTool === "Hand") {
        document.body.style.cursor = state.clicked ? "grabbing" : "grab";
    }


    if(!state.clicked && selectedTool != "Hand"){
        const mouseStyleForShape = getPosiToShape(canvasX  , canvasY , state.selectedShape)
        if(state.selectedShape && mouseStyleForShape){
            
            if(mouseStyleForShape === "top-left" || mouseStyleForShape === "bottom-right"){
                document.body.style.cursor = "nwse-resize"
            }else if (mouseStyleForShape === "bottom-left" || mouseStyleForShape === "top-right"){
                document.body.style.cursor = "nesw-resize"
                
            }else if (mouseStyleForShape === "roatate"){
                document.body.style.cursor = "grab"
            }else if (mouseStyleForShape === "top" || mouseStyleForShape === "bottom"){
                document.body.style.cursor = "ns-resize"
            }else if(mouseStyleForShape === "left" || mouseStyleForShape === "right"){
                document.body.style.cursor = "ew-resize"
            }
        }
        else if( selectedTool === "Pointer" &&  getElementOnPointer(canvasX , canvasY , state.existingShapes)){
            document.body.style.cursor = "move"  
        }
        else{
            document.body.style.cursor = "default"
        }
        return
    }
    

    const width = canvasX - state.startX;
    const height = canvasY - state.startY;
    refreshCanvas(ctx , canvas , state.existingShapes , state.selectedShape, state.canvasOffsetX , state.canvasOffsetY , state.canvasScale);
    
    ctx.save();
    ctx.setTransform(state.canvasScale, 0, 0, state.canvasScale, state.canvasOffsetX, state.canvasOffsetY);
    ctx.globalAlpha = opacity/100;
    ctx.lineWidth = strokeWidth
    ctx.strokeStyle = strokeColor
    if(selectedTool === "Rect"){
        ctx.beginPath();
        ctx.rect(state.startX, state.startY, width, height);
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
        ctx.closePath();
    }else if (selectedTool === "Circle"){
        ctx.fillStyle = fillColor;
        let radius = Math.max(height , width)/2
        if(radius <0){  radius = -radius}      //////////////////////////////////imp
        ctx.beginPath();
        ctx.arc(state.startX + width/2 ,state.startY + height/2 , radius ,0 , Math.PI * 2)
        ctx.fill();
        ctx.stroke();
        
    } else if(selectedTool === "Line"){
        ctx.beginPath();
        ctx.moveTo(state.startX , state.startY)
        ctx.lineTo(state.startX + width , state.startY + height)
        ctx.stroke()
    }else if (selectedTool === "Pencil" && state.isDrawing){
        state.currentPencilPath.push({x: canvasX , y: canvasY})
        if(state.currentPencilPath.length >2){
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'

            ctx.moveTo(state.currentPencilPath[0].x , state.currentPencilPath[0].y);
            for(let i = 1;i<state.currentPencilPath.length ; i++){
                ctx.lineTo(state.currentPencilPath[i].x , state.currentPencilPath[i].y)
            }
            ctx.stroke()
            ctx.closePath()

        }
    }else if (selectedTool === "Arrow"){
        ctx.beginPath();
        ctx.moveTo(state.startX, state.startY);
        ctx.lineTo(canvasX, canvasY);
        ctx.stroke();
    
        // Calculate angle of the line
        const angle = Math.atan2(canvasY - state.startY, canvasX - state.startX);
        const headLength = 15;
        ctx.fillStyle = "rgba(255, 255, 255)";
        // Draw arrowhead
        ctx.beginPath();
        ctx.moveTo(canvasX, canvasY);
        ctx.lineTo(
            canvasX - headLength * Math.cos(angle - Math.PI / 6),
            canvasY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            canvasX - headLength * Math.cos(angle + Math.PI / 6),
            canvasY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
        
    }else if(selectedTool === "Pointer"){ 
        // if(!selectedShape){return;}
        // logic to move this shape

        if(state.resizeHandle && state.selectedShape){
            const updatedShape = {...state.selectedShape};
            const deltaX = canvasX - state.startX;
            const deltaY = canvasY - state.startY;
        
            switch(updatedShape.type) {
                case "Rect":
                    handleRectResize(updatedShape, state.resizeHandle, deltaX, deltaY);
                    break;
                case "Circle":
                    handleCircleResize(updatedShape, state.resizeHandle, deltaX, deltaY);
                    break;
                case "Line":
                case "Arrow":
                    handleLineResize(updatedShape, state.resizeHandle, deltaX, deltaY);
                    break;
                case "Pencil":
                    handlePencilResize(updatedShape, state.resizeHandle, deltaX, deltaY);
                    break;
                
            }
            
        
        // Update the start position for next move event
            state.startX = canvasX;
            state.startY = canvasY;
            
            const index = state.existingShapes.findIndex(s => s.id === updatedShape.id);
            state.existingShapes[index] = updatedShape;
            state.selectedShape = updatedShape;
            refreshCanvas(ctx, canvas, state.existingShapes, state.selectedShape, state.canvasOffsetX , state.canvasOffsetY , state.canvasScale);
            return;
        }

        if(!state.selectedShape ||state.movedShapeIndex === "-1"){return;}   

        const newX = canvasX - state.offsetX;
        const newY = canvasY - state.offsetY;

        const updatedShape = {...state.selectedShape};
        if(updatedShape.type === "Rect" || updatedShape.type === "Circle"){
            updatedShape.x = newX
            updatedShape.y = newY
        }else if(updatedShape.type === "Line" || updatedShape.type === "Arrow"){
            updatedShape.x = newX;
            updatedShape.y = newY;
        }else if(updatedShape.type === "Pencil"){
            const firstPoint = updatedShape.points[0]
            const deltaX = newX - firstPoint.x;
            const deltaY = newY - firstPoint.y;
            updatedShape.points = updatedShape.points.map(point => ({
                x: point.x + deltaX,
                y: point.y + deltaY
            }));
        }
        const index = state.existingShapes.findIndex(s => s.id === updatedShape.id);
        state.existingShapes[index] = updatedShape
        if(!updatedShape){return;}
        socket.send(JSON.stringify({
            type : "moveShape", 
            roomId,
            shape: JSON.stringify(updatedShape),
            shapeId : updatedShape.id
        }))
        state.selectedShape = updatedShape
        
        refreshCanvas(ctx, canvas, state.existingShapes , state.selectedShape, state.canvasOffsetX , state.canvasOffsetY , state.canvasScale);
        return;
    }
    ctx.restore();
}

export const HandleWheel = (ctx :CanvasRenderingContext2D , canvas : HTMLCanvasElement  , e: WheelEvent , state : State , drawProps :React.RefObject<DrawProps>)=>{
    const selectedTool = drawProps.current.selectedTool
    
    if(selectedTool != "Hand"){return}
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    let {x : canvasX ,y : canvasY} = getCanvasPoints(e.clientX , e.clientY , canvas , state)

    const mouseX = canvasX - rect.left;
    const mouseY = canvasY - rect.top;

    if (e.ctrlKey) {
        const zoomIntensity = 0.1;
        const direction = e.deltaY > 0 ? -1 : 1;
        const scaleFactor = 1 + direction * zoomIntensity;

        const prevScale = state.canvasScale;
        const newScale = state.canvasScale * scaleFactor;

    // Limit zoom range
        if (newScale < 0.2 || newScale > 5) return;

    // Keep zoom centered on mouse position
        state.canvasOffsetX = mouseX - ((mouseX - state.canvasOffsetX) / prevScale) * newScale;
        state.canvasOffsetY = mouseY - ((mouseY - state.canvasOffsetY) / prevScale) * newScale;
        state.canvasScale = newScale;
    } else {
        const panSpeed = 1; 
        state.canvasOffsetY -= (e.deltaY * panSpeed) / state.canvasScale;
        state.canvasOffsetX -= (e.deltaX * panSpeed) / state.canvasScale;
    }

    refreshCanvas(
        ctx,
        canvas,
        state.existingShapes,
        state.selectedShape,
        state.canvasOffsetX,
        state.canvasOffsetY,
        state.canvasScale
    );
}

function handleRectResize(shape: Shape, handle: string, deltaX: number, deltaY: number) {
    if(shape.type != "Rect"){return}
    switch(handle) {
        case "top-left":
            shape.x += deltaX;
            shape.y += deltaY;
            shape.width -= deltaX;
            shape.height -= deltaY;
            break;
        case "top-right":
            shape.y += deltaY;
            shape.width += deltaX;
            shape.height -= deltaY;
            break;
        case "bottom-left":
            shape.x += deltaX;
            shape.width -= deltaX;
            shape.height += deltaY;
            break;
        case "bottom-right":
            shape.width += deltaX;
            shape.height += deltaY;
            break;
        case "top":
            shape.y += deltaY;
            shape.height -= deltaY;
            break;
        case "bottom":
            shape.height += deltaY;
            break;
        case "left":
            shape.x += deltaX;
            shape.width -= deltaX;
            break;
        case "right":
            shape.width += deltaX;
            break;
    }
    
    // Ensure width and height don't go negative
    // if(shape.width < 0) {
    //     shape.x += shape.width;
    //     shape.width = Math.abs(shape.width);
    // }
    // if(shape.height < 0) {
    //     shape.y += shape.height;
    //     shape.height = Math.abs(shape.height);
    // }
}

function handleCircleResize(shape: Shape, handle: string, deltaX: number, deltaY: number) {
    if(shape.type != "Circle") return;
    
    // Determine direction multipliers based on handle position
    let xDir = 1;
    let yDir = 1;
    
    switch(handle) {
        case "top-left":
            xDir = -1;
            yDir = -1;
            break;
        case "top-right":
            xDir = 1;
            yDir = -1;
            break;
        case "bottom-left":
            xDir = -1;
            yDir = 1;
            break;
        case "bottom-right":
            xDir = 1;
            yDir = 1;
            break;
        case "top":
            yDir = -1;
            break;
        case "bottom":
            yDir = 1;
            break;
        case "left":
            xDir = -1;
            break;
        case "right":
            xDir = 1;
            break;
    }
    
    // Calculate scale factors with direction
    const scaleX = 1 + (xDir * deltaX) / shape.radius;
    const scaleY = 1 + (yDir * deltaY) / shape.radius;
    
    // Apply scaling
    switch(handle) {
        case "top-left":
        case "top-right":
        case "bottom-left":
        case "bottom-right":
            // For corners, average both directions
            shape.radius *= Math.max(0.1, (scaleX + scaleY) / 2);
            break;
        case "top":
        case "bottom":
            // Only vertical scaling
            shape.radius *= Math.max(0.1, scaleY);
            break;
        case "left":
        case "right":
            // Only horizontal scaling
            shape.radius *= Math.max(0.1, scaleX);
            break;
    }
    
    // Ensure minimum radius
    shape.radius = Math.max(1, shape.radius);
}

function handleLineResize(shape: Shape, handle: string, deltaX: number, deltaY: number) {
    if(shape.type != "Line"){return}
    switch(handle) {
        case "top-left":
            shape.x += deltaX;
            shape.y += deltaY;
            break;
        case "top-right":
            shape.endx += deltaX;
            shape.y += deltaY;
            break;
        case "bottom-left":
            shape.x += deltaX;
            shape.endy += deltaY;
            break;
        case "bottom-right":
            shape.endx += deltaX;
            shape.endy += deltaY;
            break;
        case "top":
            case "bottom":
            // For vertical resizing, adjust y components
            if (handle === "top") {
                shape.y += deltaY;
            } else {
                shape.endy += deltaY;
            }
            break;
        case "left":
        case "right":
            // For horizontal resizing, adjust x components
            if (handle === "left") {
                shape.x += deltaX;
            } else {
                shape.endx += deltaX;
            }
            break;
    }
}

function handlePencilResize(shape: Shape, handle: string, deltaX: number, deltaY: number) {
    if(shape.type != "Pencil"){return}
    const bounds = getShapeBounds(shape);
    const scaleX = 1 + deltaX / bounds.width;
    const scaleY = 1 + deltaY / bounds.height;
    
    // Calculate center point
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    
    // Apply scaling relative to center
    shape.points = shape.points.map(point => {
        // Translate to origin
        let newX = point.x - centerX;
        let newY = point.y - centerY;
        
        // Apply scaling based on handle
        switch(handle) {
            case "top-left":
            case "bottom-right":
                newX *= scaleX;
                newY *= scaleY;
                break;
            case "top-right":
            case "bottom-left":
                newX *= scaleX;
                newY *= scaleY;
                break;
            case "top":
            case "bottom":
                newY *= scaleY;
                break;
            case "left":
            case "right":
                newX *= scaleX;
                break;
        }
        
        // Translate back
        return {
            x: newX + centerX,
            y: newY + centerY
        };
    });
}