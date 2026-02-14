using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.AspNetCore.HttpOverrides;
using System.Text.Json.Serialization;
using QuietWord.Api.Data;
using QuietWord.Api.Endpoints;
using QuietWord.Api.Services;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Postgres")
    ?? builder.Configuration["DATABASE_URL"]
    ?? "Host=localhost;Port=5432;Database=quietword;Username=quietword;Password=quietword";

builder.Services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(connectionString));
builder.Services.AddCors(options =>
{
    options.AddPolicy("web", policy =>
    {
        var origin = builder.Configuration["WEB_ORIGIN"] ?? "http://localhost:5173";
        policy.WithOrigins(origin).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
    });
});
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient("bible-api", client =>
{
    client.BaseAddress = new Uri("https://bible-api.com");
    client.Timeout = TimeSpan.FromSeconds(15);
});
builder.Services.AddHttpClient("openai-tts", client =>
{
    client.BaseAddress = new Uri("https://api.openai.com");
    client.Timeout = TimeSpan.FromSeconds(60);
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddScoped<ITextProvider, BibleApiTextProvider>();
builder.Services.AddSingleton<IChunkingService, ChunkingService>();
builder.Services.AddScoped<PlanSeeder>();
builder.Services.AddScoped<UserBootstrapper>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAudioSynthesisService, OpenAiAudioSynthesisService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});
app.UseCors("web");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
    await InitializeDatabaseAsync(db, app.Environment, scope.ServiceProvider, logger);
}

app.MapQuietWordApi();

app.Run();

static async Task InitializeDatabaseAsync(AppDbContext db, IWebHostEnvironment env, IServiceProvider services, ILogger logger)
{
    const int maxAttempts = 12;

    for (var attempt = 1; attempt <= maxAttempts; attempt++)
    {
        try
        {
            if (db.Database.IsRelational())
            {
                await db.Database.MigrateAsync();
            }
            else
            {
                await db.Database.EnsureCreatedAsync();
            }

            if (env.IsDevelopment())
            {
                var seeder = services.GetRequiredService<PlanSeeder>();
                await seeder.SeedAsync(db);
            }

            return;
        }
        catch (Exception ex) when (attempt < maxAttempts)
        {
            logger.LogWarning(ex, "Database not ready (attempt {Attempt}/{MaxAttempts}). Retrying...", attempt, maxAttempts);
            await Task.Delay(TimeSpan.FromSeconds(3));
        }
    }

    // Let final failure surface with full error details.
    if (db.Database.IsRelational())
    {
        await db.Database.MigrateAsync();
    }
    else
    {
        await db.Database.EnsureCreatedAsync();
    }
}

public partial class Program;
