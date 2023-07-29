using UfoGameLib.Lib;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var randomGen = new RandomGen(new Random());

app.MapGet("/", () => $"Hello World! Coin flip: {randomGen.FlipCoin()}");

app.Run();
