"use client"

import axios from "axios";
const http_backend = "http://localhost:3009"
import { getExistingShapes } from "./http";

import { Shape } from "../types";
import { refreshCanvas } from "./drawing";
import { handleMouseEvents } from "./handlers";

export default async function initDraw(canvas : HTMLCanvasElement , roomId : string , socket : WebSocket){


    handleMouseEvents(canvas, roomId , socket);

    
}