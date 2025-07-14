// Import all necessary 'using' statements at the top
using Hyperspace.API.Hubs;
using Hyperspace.API.Services;

// 1. --- CREATE THE BUILDER ---
var builder = WebApplication.CreateBuilder(args);


// 2. --- REGISTER ALL SERVICES (THE 'builder.Services' section) ---
// This is the ONLY place you should call `builder.Services.Add...`

// Add services to the dependency injection container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

// Add CORS policy to allow our Angular clients to connect
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularClient", policy =>
    {
        // Add BOTH origins for dev (4200) and prod (8080)
        policy.WithOrigins("http://localhost:8080", "http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Important for SignalR
    });
});

// Register our services
builder.Services.AddScoped<IFileProcessingService, FileProcessingService>();
// NOTE: I changed TrigonometricEngineService to be a Scoped service as well, as Singleton
// can sometimes cause issues with ILogger injection if not careful. This is safer.
builder.Services.AddScoped<TrigonometricEngineService>(); // The real-time service for the future


// 3. --- BUILD THE APP ---
// After this line, you CANNOT add any more services.
var app = builder.Build();


// 4. --- CONFIGURE THE HTTP PIPELINE (THE 'app.' section) ---
// This is where you configure middleware. The order is important.

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting(); // This must come before UseCors and UseAuthorization

app.UseCors("AllowAngularClient"); // Use the CORS policy we defined

app.UseAuthorization();

app.MapControllers();

app.MapHub<NeuroHub>("/neurohub");


// 5. --- RUN THE APP ---
app.Run();