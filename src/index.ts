import { Context } from "./types";
import createYuna from "./yuna";
import { nekoTrace, kamiJson } from "./middlewares";

const app = createYuna();

//middlewares
app.summon(nekoTrace());
app.summon(kamiJson);


app.get("/", (ctx:Context) => {
    ctx.whisper({
        message: "Hello, Yuna!"
    });

});

app.tribe('/api', (api) => {
    api.get('/users', (ctx) => ctx.whisper({ message: 'List of users' }));
    api.post('/users', (ctx) => ctx.whisper({ message: 'User created' }));
    api.get('/users/:id', (ctx) => ctx.whisper({ message: `User ID: ${ctx.params.id}` }));
});

app.get("/about/:name", (ctx: Context) => {
    const {name} = ctx.params;
    ctx.whisper(`<h1> Hi, ${name}</h1>`)
})

app.post("/login", (ctx: Context) => {
    console.log(ctx.body);
    ctx.whisper("object received");
})

app.serve(3000, () => {
    console.log("Server is running on port http://localhost:3000");
})