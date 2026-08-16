using Compacting.Api;
using Compacting.Api.Utils;
using Microsoft.AspNetCore.Builder;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAppServices(builder.Configuration, builder.Environment);

var app = builder.Build();

app.UseAppMiddleware();
app.MapApiRoutes();

Log.Success("COMPACTING API engine initialized successfully.");
Log.Info("Swagger UI ready at http://localhost:5126/swagger");

app.Run();
