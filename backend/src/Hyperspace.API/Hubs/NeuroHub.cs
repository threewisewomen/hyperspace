using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Hyperspace.API.Hubs
{
    public class NeuroHub : Hub
    {
        private readonly ILogger<NeuroHub> _logger;

        public NeuroHub(ILogger<NeuroHub> logger)
        {
            _logger = logger;
        }

        // A new method that the client will call immediately after starting a file upload.
        // It tells the server, "Hey, for tracking ID 'xyz', send results to ME."
        // We'll add the user's connection to a SignalR Group named after the trackingId.
        public async Task AssociateWithTrackingId(string trackingId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, trackingId);
            _logger.LogInformation($"--> Client {Context.ConnectionId} is now tracking session {trackingId}");
        }

        public override Task OnConnectedAsync()
        {
            _logger.LogInformation($"--> Client connected: {Context.ConnectionId}");
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation($"--> Client disconnected: {Context.ConnectionId}");
            if (exception != null)
            {
                _logger.LogError($"--> Disconnect Reason: {exception.Message}");
            }
            return base.OnDisconnectedAsync(exception);
        }
    }
}