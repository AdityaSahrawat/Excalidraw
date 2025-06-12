
import { useEffect, useRef, useState } from "react";
import { IconButtons } from "./iconline";
import { Circle, Pencil, RectangleHorizontalIcon ,PenLine , ArrowRight , MousePointer , Hand  } from "lucide-react";

import { AllSahpes, Shape } from "./types";
import initDraw from "./draw";

export function Canvas({roomId , socket} : {roomId: string, socket : WebSocket}){
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [selectedTool , setSelectedTool] = useState<AllSahpes>("Rect")
    // const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
    console.log("called Canvas" , Math.random())

    useEffect ( ()=>{
        // @ts-ignore // check
        window.selectedTool = selectedTool
    } , [selectedTool])

    const initializedRef = useRef(false);

useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !socket || initializedRef.current){
        console.log("called!!!!!!!!" , initializedRef.current)
        return
    } ;

    let cleanupFn: (() => void) | undefined;

    const init = async () => {
        cleanupFn = await initDraw(canvas, roomId, socket);
        initializedRef.current = true;
    };

    init();

    return () => {
        cleanupFn?.();
        initializedRef.current = false;
    };
}, [roomId, socket]);


    return (
        <div className="h-[100vh] overflow-hidden relative">
            <div className="">
                <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} ></canvas>
            </div>
            <TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool}/>
        </div>
    )
}


const TopBar = ({selectedTool , setSelectedTool}:
    {
        selectedTool : AllSahpes,
        setSelectedTool : (s : AllSahpes) =>void
    }
 )=>{

    return (
        <div className="top-5 left-1/3 fixed">
            <div className="flex gap-5">
                <IconButtons onClick={ ()=>{ setSelectedTool("Hand")}} icon={<Hand/>} activated={ selectedTool === "Hand"}  />
                <IconButtons onClick={ ()=>{ setSelectedTool("Pointer")}} icon={<MousePointer/>} activated={ selectedTool === "Pointer"}  />
                <IconButtons onClick={ ()=>{ setSelectedTool("Line")}} icon={<PenLine/>} activated={ selectedTool === "Line"}  />
                <IconButtons onClick={ ()=>{setSelectedTool("Rect")}} icon={<RectangleHorizontalIcon/>} activated={ selectedTool === "Rect"}  />
                <IconButtons onClick={ ()=>{setSelectedTool("Circle")}} icon={<Circle/>} activated={ selectedTool === "Circle"}  />
                <IconButtons onClick={ ()=>{setSelectedTool("Arrow")}} icon={<ArrowRight/>} activated={ selectedTool === "Arrow"}  />
                <IconButtons onClick={ ()=>{ setSelectedTool("Pencil")}} icon={<Pencil/>} activated={ selectedTool === "Pencil"} />
            </div>
        </div>
    )
}