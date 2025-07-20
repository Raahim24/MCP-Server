import Exa from "exa-js";
import { env } from "../config/env";

const exa = new Exa(env.EXA_API_KEY); 

export const exaSearch = async (query: string) => {
    const result = await exa.searchAndContents(
        query,
        {
            // text: true, 
            summary: true,
            // context: true,
            // numResults: 5,
        }
    ) 
    return result || "no result found";  
}