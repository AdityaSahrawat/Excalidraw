"use client";

import { useEffect, useReducer, useRef } from "react";
import initDraw, { DrawProps } from "./draw/index";
import ToolSidebar from "./toolBar";
import { useSeletedTool, useSideBarStore } from "./store";
import { Shape } from "./types";

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

  const drawAPIRef = useRef<{
    updateStyle: (props: DrawProps) => void;
    cleanup: () => void;
    deleteShape : () =>void;
  } | null>(null);



  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    initDraw(canvas, roomId, socket ,drawPropsRef).then((api)=>{drawAPIRef.current = api;})

  }, [roomId, socket]);

  useEffect(()=>{
      drawPropsRef.current= {
        strokeWidth,
        fillColor,
        opacity,
        strokeColor,
        selectedTool,
      };

      if (drawAPIRef.current) {
        drawAPIRef.current.updateStyle({
          strokeWidth,
          fillColor,
          opacity,
          strokeColor,
          selectedTool,
        });
      }
  },[strokeWidth, fillColor, opacity, strokeColor, selectedTool])

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <canvas
        ref={canvasRef}
        width={typeof window !== "undefined" ? window.innerWidth : 1920}
        height={typeof window !== "undefined" ? window.innerHeight : 1080}
      />
      <ToolSidebar onDelete={() => drawAPIRef.current?.deleteShape()} />
    </div>
  );
};

export default Canvas;
