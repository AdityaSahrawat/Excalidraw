import {Hand,MousePointer,PenLine,RectangleHorizontalIcon,Circle,ArrowRight,Pencil, Trash, Plus, Minus} from "lucide-react";
import { useSeletedTool, useSideBarStore } from "./store";
import { ReactNode } from "react"
import { DrawProps, Shape} from "./types";

const strokeOptions = ["#FFFFFF", "#dc2626", "#2563eb", "#16a34a"];
const fillOptions = ["transparent", "#FFFFFF", "#f05454", "#4d7ef0", "#3bbf6d"];
const strokeWidths = [1, 2, 3];

export default function ToolSidebar( {zoom , onDelete, onZoomIn, onZoomOut, onResetZoom, onStyleChange} : {
  zoom : number,
  onDelete : ()=>void,
  selectedShape? : Shape | null,
  onZoomIn: () => void,
  onZoomOut: () => void,
  onResetZoom: () => void,
  onStyleChange: (props: Partial<DrawProps>) => void
}) {

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
      <div className="top-4 left-1/2 -translate-x-1/2 fixed z-20">
        <div className="flex items-center gap-2 bg-black/70 backdrop-blur rounded-full px-3 py-2 border border-white/10 shadow-lg">
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
          <div className="w-px h-6 bg-white/20 mx-1" />
          <IconButtons onClick={onZoomOut} icon={<Minus />} activated={false} />
          <button className="text-white text-sm px-2 py-1 rounded hover:bg-white/10 transition" onClick={onResetZoom} title="Reset to 100%">
            {Math.round(zoom * 100)}%
          </button>
          <IconButtons onClick={onZoomIn} icon={<Plus />} activated={false} />
        </div>
      </div>


      {/* Sidebar: Always render when state exists */}
      {zoom && (
        <div>
          <div className="max-h-[70vh] top-28 fixed left-6 overflow-y-auto rounded-xl w-60 bg-black/70 backdrop-blur text-white p-4 shadow-2xl border border-white/10">
            {/* Stroke */}
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide text-white/70 mb-2">Stroke</p>
              <div className="flex gap-2">
                {strokeOptions.map((color) => (
                  <div
                    key={color}
                    className={`w-6 h-6 rounded-sm border-2 ${
                      strokeColor === color ? "border-white" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => { setStrokeColor(color); onStyleChange({ strokeColor: color }); }}
                  />
                ))}
              </div>
            </div>
            {/* Stroke width */}
            <div className="text-white space-y-2 mb-4">
              <p className="text-xs uppercase tracking-wide text-white/70">Stroke width</p>
              <div className="flex gap-2">
                {strokeWidths.map((width) => (
                  <button
                    key={width}
                    onClick={() => { setStrokeWidth(width); onStyleChange({ strokeWidth: width }); }}
                    className={`w-10 h-10 flex items-center justify-center rounded-md
                      ${strokeWidth === width ? 'bg-indigo-600' : 'bg-gray-900'}
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
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide text-white/70 mb-2">Background</p>
              <div className="flex gap-2">
                {fillOptions.map((color) => (
                  <div
                    key={color}
                    className={`w-6 h-6 rounded-sm border-2 ${
                      fillColor === color ? "border-white" : "border-transparent"
                    }`}
                    style={ color === 'transparent' 
                      ? { background: 'linear-gradient(45deg, #444 25%, transparent 25%), linear-gradient(-45deg, #444 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #444 75%), linear-gradient(-45deg, transparent 75%, #444 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px' }
                      : { backgroundColor: color } }
                    title={color === 'transparent' ? 'No fill' : undefined}
                    onClick={() => { setFillColor(color); onStyleChange({ fillColor: color }); }}
                  />
                ))}
              </div>
            </div>

            {/* Opacity */}
            <div className="mb-3">
              <label htmlFor="opacity" className="block text-xs uppercase tracking-wide text-white/70 mb-1">
                Opacity
              </label>
              <input
                id="opacity"
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => { const v = Number(e.target.value); setOpacity(v); onStyleChange({ opacity: v }); }}
                className="w-full accent-blue-500"
              />
              <p className="text-right text-xs text-white/70">{opacity}%</p>

              {/* delete */}
            </div>
            <button onClick={onDelete} className="mb-1 flex items-center gap-2 text-red-300 hover:text-red-200 text-sm px-2 py-2 rounded hover:bg-white/5 transition">
                <Trash size={16}/> Delete
            </button>
          </div>

          {/* Bottom-left quick zoom */}
          <div className="bottom-6 left-6 fixed text-white/90 bg-black/70 backdrop-blur px-2 py-1 rounded border border-white/10 shadow">
            <div className="flex items-center gap-2">
              <button onClick={onZoomOut} className="p-1 hover:bg-white/10 rounded" aria-label="Zoom out"><Minus size={16}/></button>
              <button onClick={onResetZoom} className="text-sm" title="Reset to 100%">{Math.round(zoom * 100)}%</button>
              <button onClick={onZoomIn} className="p-1 hover:bg-white/10 rounded" aria-label="Zoom in"><Plus size={16}/></button>
            </div>
          </div>
        </div>
      )}

  
      
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