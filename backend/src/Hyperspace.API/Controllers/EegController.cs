using Hyperspace.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hyperspace.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EegController : ControllerBase
    {
        private readonly ILogger<EegController> _logger;
        private readonly IFileProcessingService _fileProcessor;

        // We now inject our new processing service.
        public EegController(ILogger<EegController> logger, IFileProcessingService fileProcessor)
        {
            _logger = logger;
            _fileProcessor = fileProcessor;
        }

        [HttpPost("upload")]
        [ProducesResponseType(StatusCodes.Status202Accepted)] // 202 Accepted is the correct code for an async task
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [RequestSizeLimit(100_000_000)]
        public IActionResult UploadEegFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file was uploaded." });
            }

            _logger.LogInformation($"Accepted file for processing: {file.FileName}");

            // 1. Create a unique ID for this processing task.
            string trackingId = Guid.NewGuid().ToString();

            // 2. Start the background task. We use Task.Run to fire-and-forget,
            // allowing our API to respond immediately.
            Task.Run(() => _fileProcessor.ProcessFileInBackground(file, trackingId));

            // 3. IMMEDIATELY return the trackingId to the client.
            _logger.LogInformation($"Returning TrackingId {trackingId} to client immediately.");
            return Accepted(new { trackingId = trackingId });
        }
    }
}