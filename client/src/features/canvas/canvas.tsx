import initDraw from "@/features/canvas/draw/index"
import { useEffect, useRef, useState } from "react";
import { IconButtons } from "./iconline";
import { Circle, Pencil, RectangleHorizontalIcon ,PenLine , ArrowRight  } from "lucide-react";

import { AllSahpes } from "./types";

export function Canvas({roomId , socket} : {roomId: string, socket : WebSocket}){
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [selectedTool , setSelectedTool] = useState<AllSahpes>("Rect")

    useEffect ( ()=>{
        // @ts-ignore // check
        window.selectedTool = selectedTool
    } , [selectedTool])

    useEffect(()=>{
        if(canvasRef.current){
            initDraw(canvasRef.current , roomId , socket);
        }
    },[roomId, socket])

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
                <IconButtons onClick={ ()=>{ setSelectedTool("Line")}} icon={<PenLine/>} activated={ selectedTool === "Line"}  />
                <IconButtons onClick={ ()=>{setSelectedTool("Rect")}} icon={<RectangleHorizontalIcon/>} activated={ selectedTool === "Rect"}  />
                <IconButtons onClick={ ()=>{setSelectedTool("Circle")}} icon={<Circle/>} activated={ selectedTool === "Circle"}  />
                <IconButtons onClick={ ()=>{setSelectedTool("Arrow")}} icon={<ArrowRight/>} activated={ selectedTool === "Arrow"}  />
                <IconButtons onClick={ ()=>{ setSelectedTool("Pencil")}} icon={<Pencil/>} activated={ selectedTool === "Pencil"} />
            </div>
        </div>
    )
}