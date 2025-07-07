"use client";

import { useEffect, useReducer, useRef } from "react";
import initDraw, { DrawProps } from "./draw/index";
import ToolSidebar from "./toolBar";
import { useSeletedTool, useSideBarStore } from "./store";

type CanvasProps = {
  roomId: string;
  socket: WebSocket;
};

const Canvas = ({ roomId, socket }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const strokeWidth = useSideBarStore((s) => s.strokeWidth);
  const fillColor = useSideBarStore((s) => s.fillColor);
  const opacity = useSideBarStore((s) => s.opacity);
  const strokeColor = useSideBarStore((s) => s.strokeColor);
  const selectedTool = useSeletedTool((s) => s.selectedTool);

  const drawPropsRef = useRef({
    strokeWidth,
    fillColor,
    opacity,
    strokeColor,
    selectedTool,
  });


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    initDraw(canvas, roomId, socket ,drawPropsRef)

  }, [roomId, socket]);
  useEffect(()=>{
      drawPropsRef.current= {
        strokeWidth,
        fillColor,
        opacity,
        strokeColor,
        selectedTool,
      };
  },[strokeWidth, fillColor, opacity, strokeColor, selectedTool])

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <canvas
        ref={canvasRef}
        width={typeof window !== "undefined" ? window.innerWidth : 1920}
        height={typeof window !== "undefined" ? window.innerHeight : 1080}
      />
      <ToolSidebar />
    </div>
  );
};

export default Canvas;
