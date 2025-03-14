import  jwt  from "jsonwebtoken";
import { Request , Response , NextFunction} from "express";


const jwt_Secret = "123"

export function UserMeddleware(req: Request , res: Response , next:NextFunction): void{
    
    // const token = req.headers.get("authorization") ?? "";
    const token = req.headers["authorization"] ?? "";


    if (!token) {
        res.status(404).json({
            message: "Unauthorized: No token provided"
        })
    }
    console.log(token)
    try {
        const decoded = jwt.verify(token, jwt_Secret) as { id: string };
        req.userId = decoded.id;
        // Alternative: (res as any).userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({
            message: "Unauthorized: Invalid or expired token",
        });
    }

}