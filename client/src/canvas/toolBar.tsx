import {Hand,MousePointer,PenLine,RectangleHorizontalIcon,Circle,ArrowRight,Pencil, Trash,} from "lucide-react";
import { useSeletedTool, useSideBarStore } from "./store";
import { ReactNode } from "react"
import { Shape } from "./types";

const strokeOptions = ["#FFFFFF", "#dc2626", "#2563eb", "#16a34a"];
const fillOptions = ["#FFFFFF", "#f05454", "#4d7ef0", "#3bbf6d"];
const strokeWidths = [1, 2, 3];

export default function ToolSidebar( {onDelete , selectedShape} : {onDelete : ()=>void , selectedShape : Shape | null}) {

  const strokeWidth = useSideBarStore((state)=> state.strokeWidth)
  const setStrokeWidth = useSideBarStore((state)=> state.setStrokeWidth)
  const fillColor = useSideBarStore((state)=> state.fillColor)
  const setFillColor = useSideBarStore((state)=> state.setFillColor)
  const opacity = useSideBarStore((state)=> state.opacity)
  const setOpacity = useSideBarStore((state)=> state.setOpacity)
  const strokeColor = useSideBarStore((state)=> state.strokeColor)
  const setStrokeColor = useSideBarStore((state)=> state.setStrokeColor)

  const selectedTool = useSeletedTool((state)=> {return state.selectedTool})
  const setSelectedTool = useSeletedTool((state)=> {return state.setSelectedTool})

  return (
    <div>
      {/* Top Toolbar */}
      <div className="top-5 left-1/3 fixed">
        <div className="flex gap-5">
          <IconButtons
            onClick={() => setSelectedTool("Hand")}
            icon={<Hand />}
            activated={selectedTool === "Hand"}
          />
          <IconButtons
            onClick={() => setSelectedTool("Pointer")}
            icon={<MousePointer />}
            activated={selectedTool === "Pointer"}
          />
          <IconButtons
            onClick={() => setSelectedTool("Line")}
            icon={<PenLine />}
            activated={selectedTool === "Line"}
          />
          <IconButtons
            onClick={() => setSelectedTool("Rect")}
            icon={<RectangleHorizontalIcon />}
            activated={selectedTool === "Rect"}
          />
          <IconButtons
            onClick={() => setSelectedTool("Circle")}
            icon={<Circle />}
            activated={selectedTool === "Circle"}
          />
          <IconButtons
            onClick={() => setSelectedTool("Arrow")}
            icon={<ArrowRight />}
            activated={selectedTool === "Arrow"}
          />
          <IconButtons
            onClick={() => setSelectedTool("Pencil")}
            icon={<Pencil />}
            activated={selectedTool === "Pencil"}
          />
        </div>
      </div>

      {/* Sidebar */}

      {selectedShape || selectedTool != "Pointer" ? (
        <div className="h-80 top-32 fixed left-6 overflow-y-auto rounded w-52 bg-gray-800 text-white p-4 shadow-xl">
        {/* Stroke */}
        <div className="mb-5">
          <p className="text-sm mb-2">Stroke</p>
          <div className="flex gap-2">
            {strokeOptions.map((color) => (
              <div
                key={color}
                className={`w-6 h-6 rounded-sm border-2 ${
                  strokeColor === color ? "border-white" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setStrokeColor(color)}
              />
            ))}
          </div>
        </div>
        {/* Stroke width */}
        <div className="text-white space-y-2">
          <p className="text-gray-300">Stroke width</p>
          <div className="flex gap-2">
            {strokeWidths.map((width) => (
              <button
                key={width}
                onClick={() => setStrokeWidth(width)}
                className={`w-10 h-10 flex items-center justify-center rounded-md
                  ${strokeWidth === width ? 'bg-indigo-600' : 'bg-gray-800'}
                  transition duration-200`}
              >
                <div
                  style={{ height: `${width}px`, width: '16px' }}
                  className={`rounded bg-white`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Background / Fill */}
        <div className="mb-5">
          <p className="text-sm mb-2">Background</p>
          <div className="flex gap-2">
            {fillOptions.map((color) => (
              <div
                key={color}
                className={`w-6 h-6 rounded-sm border-2 ${
                  fillColor === color ? "border-white" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setFillColor(color)}
              />
            ))}
          </div>
        </div>

        {/* Opacity */}
        <div className="mb-2">
          <label htmlFor="opacity" className="block text-sm mb-1">
            Opacity
          </label>
          <input
            id="opacity"
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <p>{opacity}</p>

          {/* delete */}
        </div>
        <div onClick={onDelete} className="mb-2 w-10 py-2 px-2 block text-sm rounded-xl hover:cursor-pointer hover:bg-gray-700 hover:text-black">
            <Trash/>
        </div>
      </div>
      ) : null}
      
    </div>
  );
}


const IconButtons = ({icon , onClick , activated}: 
    {
        icon : ReactNode,
        onClick : ()=>void,
        activated : boolean
    }
)=>{
    return (
        <div className={`${activated ? "text-red-400" : "text-white"} m-2 cursor-pointer rounded-full border p-2 bg-black hover:bg-gray-500 `} onClick={onClick} >
            {icon}
        </div>
    )
}