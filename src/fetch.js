import got from "got";
import fs from "fs";

import query from "./query";

got.post(process.env.WINGS_ENDPOINT || 'https://api.wings.dev', {
    headers: {
        "Authorization": "Bearer " + process.env.WINGS_APP_KEY,
        "X-Wings-Project": process.env.WINGS_PROJECT
    },
    json: {query}
}).json().then((data) => {
    fs.writeFileSync("content.json", JSON.stringify(data, null, 2));
    console.log("fetched content");
});



