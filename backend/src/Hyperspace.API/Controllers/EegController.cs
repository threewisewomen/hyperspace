using Microsoft.AspNetCore.Mvc;

namespace Hyperspace.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EegController : ControllerBase
    {
        private readonly ILogger<EegController> _logger;

        public EegController(ILogger<EegController> logger)
        {
            _logger = logger;
        }

        [HttpPost("upload")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        // This attribute increases the maximum request body size to allow for larger files
        [RequestSizeLimit(100_000_000)] // 100 MB limit
        public async Task<IActionResult> UploadEegFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file was uploaded." });
            }

            // --- Real-world scenario would be: ---
            // 1. Save the file to a temporary location or blob storage.
            // 2. Add a message to a queue (like RabbitMQ) to process the file.
            // 3. A background service would pick it up, parse the CSV/EDF,
            //    run it through the trigonometric engine, and save the result.

            // --- For this guide, we will SIMULATE processing: ---
            _logger.LogInformation($"Received file: {file.FileName} ({file.Length} bytes)");

            // Let's create a unique shape based on the filename length.
            // This simulates getting different results for different files.
            var fileNameLength = file.FileName.Length;
            Random rand = new Random();

            // Simulate generating a 3D shape's vertices.
            // In the future, this data will come from the real trigonometric engine.
            var vertices = new List<float>();
            int numberOfVertices = 1000 + (fileNameLength % 100); // Unique number of points

            for (int i = 0; i < numberOfVertices * 3; i++) // x, y, z for each vertex
            {
                // Generate a random point in a sphere-like shape
                vertices.Add((float)(rand.NextDouble() * 2 - 1));
            }

            // This is the data "snapshot" we send back to the client.
            var shapeData = new
            {
                SourceFile = file.FileName,
                Vertices = vertices.ToArray(),
                // We could also send color data, metadata, etc.
            };

            // Return the shape data directly as a JSON response.
            return Ok(shapeData);
        }
    }
}