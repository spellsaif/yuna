import { kamiJson, nekoTrace } from "./middleware";
import { Context } from "./types";
import createYuna from "./yuna";

const app = createYuna();

//middlewares
app.summon(nekoTrace);
app.summon(kamiJson);


app.get("/", (ctx:Context) => {
    ctx.reply({
        message: "Hello, Yuna!"
    });

});

app.get("/about/:name", (ctx: Context) => {
    const {name} = ctx.params;
    ctx.reply(`<h1> Hi, ${name}</h1>`)
})

app.post("/login", (ctx: Context) => {
    console.log(ctx.body);
    ctx.reply("object received");
})

app.serve(3000, () => {
    console.log("Server is running on port http://localhost:3000");
})