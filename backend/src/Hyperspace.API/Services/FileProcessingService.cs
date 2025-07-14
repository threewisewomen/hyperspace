using Hyperspace.API.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.Text.Json;

namespace Hyperspace.API.Services
{
    public interface IFileProcessingService
    {
        Task ProcessFileInBackground(IFormFile file, string trackingId);
    }

    public class FileProcessingService : IFileProcessingService
    {
        private readonly ILogger<FileProcessingService> _logger;
        private readonly IHubContext<NeuroHub> _hubContext;

        public FileProcessingService(ILogger<FileProcessingService> logger, IHubContext<NeuroHub> hubContext)
        {
            _logger = logger;
            _hubContext = hubContext;
        }

        public async Task ProcessFileInBackground(IFormFile file, string trackingId)
        {
            _logger.LogInformation($"Starting background processing for file: {file.FileName} with TrackingId: {trackingId}");

            // --- 1. SIMULATE LONG-RUNNING TASK ---
            // In a real app, this is where you'd parse the CSV/EDF file.
            await Task.Delay(5000); // Simulate 5 seconds of processing.

            // --- 2. SIMULATE TRIGONOMETRIC ENGINE ---
            // We'll generate a unique shape just like before.
            var fileNameLength = file.FileName.Length;
            Random rand = new Random();
            var vertices = new List<float>();
            int numberOfVertices = 1000 + (fileNameLength % 100);

            for (int i = 0; i < numberOfVertices * 3; i++)
            {
                vertices.Add((float)(rand.NextDouble() * 2 - 1));
            }

            // This is our final result object.
            var shapeData = new
            {
                SourceFile = file.FileName,
                Vertices = vertices.ToArray(),
            };

            _logger.LogInformation($"Processing complete for TrackingId: {trackingId}. Sending result to clients in this group.");

            // --- 3. PUSH RESULT VIA WEBSOCKET ---
            // Send the result to the SignalR Group that is named with our trackingId.
            // Only the client that initiated this process will receive this message.
            await _hubContext.Clients.Group(trackingId).SendAsync("ShapeProcessingComplete", shapeData);
        }
    }
}