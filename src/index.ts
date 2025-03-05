import { jsonParser, log } from "./middleware";
import { Context } from "./types";
import createYuna from "./yuna";

const app = createYuna();

//middlewares
app.wield(log);


app.get("/", (ctx:Context) => {
    ctx.reply!({
        message: "Hello, Yuna!"
    });

});

app.serve(3000, () => {
    console.log("Server is running on port http://localhost:3000");
})