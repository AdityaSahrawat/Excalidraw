// initDraw.ts
import { getExistingShapes } from "./http";
import { refreshCanvas } from "./drawing";
import {HandleMouseDown,HandleMouseMove,HandleMouseUp,HandleWheel,} from "./handlers";
import { AllShapes, Shape, State } from "../types";
import { cva } from "class-variance-authority";

export type DrawProps = {
  strokeWidth: number;
  fillColor: string;
  opacity: number;
  strokeColor: string;
  selectedTool: AllShapes;
};

export default async function initDraw(canvas: HTMLCanvasElement,roomId: string,socket: WebSocket , drawProps :React.RefObject<DrawProps> ) {
  const ctx = canvas.getContext("2d");
  if (!ctx){
    return { 
        updateStyle :()=> {},
        cleanup: ()=> {} ,
        deleteShape : ()=> {}
    };
  } 

const state: State = {
    existingShapes: [],
    selectedShape: null,
    isDrawing: false,
    currentPencilPath: [],
    clicked: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    movedShapeIndex: "-1",
    resizeHandle: null,
    endOffsetX: 0,
    endOffsetY: 0,
    canvasOffsetX: 0,
    canvasOffsetY: 0,
    canvasScale: 1,
    lastPanx: 0,
    lastPany: 0,
  };

  state.existingShapes = await getExistingShapes(roomId);
  refreshCanvas(ctx,canvas,state.existingShapes,state.selectedShape,state.canvasOffsetX,state.canvasOffsetY,state.canvasScale);

  socket.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === "addShape") {
      state.existingShapes.push(JSON.parse(msg.shape));
    } else if (msg.type === "deleteShape") {
      const del = JSON.parse(msg.shape);
      state.existingShapes = state.existingShapes.filter((s) => s.id !== del.id);
    } else if (msg.type === "moveShape") {
      const moved = typeof msg.shape === "string" ? JSON.parse(msg.shape) : msg.shape;
      const idx = state.existingShapes.findIndex((s) => s.id === moved.id);
      if (idx !== -1) state.existingShapes[idx] = moved;
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
  };

  const onUp   = (e: MouseEvent) => HandleMouseUp(e, state, socket, roomId, canvas , drawProps );
  const onDown = (e: MouseEvent) => HandleMouseDown(ctx, canvas, e, state , drawProps);
  const onMove = (e: MouseEvent) => HandleMouseMove(e, state, socket, roomId, ctx, canvas , drawProps);
  const onWheel = (e: WheelEvent) => HandleWheel(ctx, canvas, e, state , drawProps);

  canvas.addEventListener("mousedown", onDown);
  canvas.addEventListener("mousemove", onMove);
  canvas.addEventListener("mouseup",   onUp);
  canvas.addEventListener("wheel",     onWheel);

  function updateStyle(drawProps : DrawProps) {
    if (!state.clicked && state.selectedShape && drawProps.selectedTool === "Pointer") {
      const shape = state.selectedShape
      shape.opacity = drawProps.opacity;
      shape.strokeColor = drawProps.strokeColor;
      shape.strokeWidth = drawProps.strokeWidth;

      if (
        shape.type === "Rect" ||
        shape.type === "Circle"
      ) {
        shape.fillColor = drawProps.fillColor;
      }
      if(socket.readyState === WebSocket.OPEN){
        socket.send(JSON.stringify({
          type : "updateShape",
          roomId ,
          shape : JSON.stringify(shape),
          shapeId : shape.id
        }))
      }

      refreshCanvas(ctx!,canvas,state.existingShapes,state.selectedShape,state.canvasOffsetX,state.canvasOffsetY,state.canvasScale);
    }
  }

  function deleteShape(){
    if(!state.selectedShape){
      return;
    }
    console.log("req came !!!!!")
    const shape = state.selectedShape
    state.existingShapes = state.existingShapes.filter((s)=>s.id != shape.id)

    if(socket.readyState === WebSocket.OPEN){
      socket.send(JSON.stringify({
        type : "deleteShape",
        roomId ,
        shape : JSON.stringify(shape),
        shapeId : shape.id
      }))
    }
    state.selectedShape = null;
    refreshCanvas(ctx! , canvas , state.existingShapes , state.selectedShape , state.canvasOffsetX , state.canvasOffsetY , state.canvasScale)

  }


  function cleanup() {
    canvas.removeEventListener("mousedown", onDown);
    canvas.removeEventListener("mousemove", onMove);
    canvas.removeEventListener("mouseup",   onUp);
    canvas.removeEventListener("wheel",     onWheel);
  }

  return {
    updateStyle,
    cleanup,
    deleteShape,
  };
}
