"use client";

import { useEffect, useRef, useState } from "react";
import initDraw from "./draw/index";
import ToolSidebar from "./toolBar";
import { useSeletedTool, useSideBarStore } from "./store";
import { Shape, State , DrawProps } from "./types";

type CanvasProps = {
  roomId: string;
  socket: WebSocket;
};

const Canvas = ({ roomId, socket }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
  const [zoom , setZoom] = useState(1)

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
    state : State;
    setZoom: (scale: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
  } | null>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);



  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsCanvasReady(false);
    initDraw(canvas, roomId, socket, drawPropsRef, setSelectedShape).then((api) => {
      drawAPIRef.current = api;
      setIsCanvasReady(true);
      if (api.state) {
        setZoom(api.state.canvasScale);
      }
    });
  }, [roomId, socket]);

  // Stop default browser zoom (Ctrl +, Ctrl -, Ctrl 0) and map to canvas zoom
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Avoid interfering with typing in inputs/textareas/contentEditable
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (!e.ctrlKey) return;
      const key = e.key;
      if (key === '+' || key === '=' ) {
        e.preventDefault();
        drawAPIRef.current?.zoomIn();
        if (drawAPIRef.current) setZoom(drawAPIRef.current.state.canvasScale);
      } else if (key === '-') {
        e.preventDefault();
        drawAPIRef.current?.zoomOut();
        if (drawAPIRef.current) setZoom(drawAPIRef.current.state.canvasScale);
      } else if (key === '0') {
        e.preventDefault();
        drawAPIRef.current?.resetZoom();
        setZoom(1);
      }
    };
    window.addEventListener('keydown', handler, { passive: false });
  return () => window.removeEventListener('keydown', handler);
  }, []);

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
        setZoom(drawAPIRef.current.state.canvasScale);
      }
  },[strokeWidth, fillColor, opacity, strokeColor, selectedTool])

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <canvas
        ref={canvasRef}
        width={typeof window !== "undefined" ? window.innerWidth : 1920}
        height={typeof window !== "undefined" ? window.innerHeight : 1080}
      />
      {isCanvasReady && drawAPIRef.current?.state && (
        <ToolSidebar
          zoom={zoom}
          selectedShape={selectedShape}
          onDelete={() => drawAPIRef.current?.deleteShape()}
          onZoomIn={() => { drawAPIRef.current?.zoomIn(); setZoom(drawAPIRef.current!.state.canvasScale); }}
          onZoomOut={() => { drawAPIRef.current?.zoomOut(); setZoom(drawAPIRef.current!.state.canvasScale); }}
          onResetZoom={() => { drawAPIRef.current?.resetZoom(); setZoom(1); }}
          onStyleChange={(props) => {
            const next: DrawProps = {
              strokeWidth: props.strokeWidth ?? drawPropsRef.current.strokeWidth,
              fillColor: props.fillColor ?? drawPropsRef.current.fillColor,
              opacity: props.opacity ?? drawPropsRef.current.opacity,
              strokeColor: props.strokeColor ?? drawPropsRef.current.strokeColor,
              selectedTool: selectedTool,
            };
            drawPropsRef.current = next;
            drawAPIRef.current?.updateStyle(next);
          }}
        />
      )}
    </div>
  );
};

export default Canvas;
