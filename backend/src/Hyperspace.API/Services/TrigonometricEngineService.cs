using Hyperspace.API.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Hyperspace.API.Services
{
    // This is a long-running background service that simulates our engine's "game loop".
    public class TrigonometricEngineService : IHostedService, IDisposable
    {
        private readonly ILogger<TrigonometricEngineService> _logger;
        private readonly IHubContext<NeuroHub> _hubContext;
        private Timer? _timer = null;

        // NEW: Property to hold the current rotation angle
        private float _currentYRotation = 0.0f;

        public TrigonometricEngineService(ILogger<TrigonometricEngineService> logger, IHubContext<NeuroHub> hubContext)
        {
            _logger = logger;
            _hubContext = hubContext;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Trigonometric Engine Service is starting.");

            // Let's make the loop faster for smoother animation, every 50ms (20 frames per second)
            _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromMilliseconds(50));

            return Task.CompletedTask;
        }

        private async void DoWork(object? state)
        {
            // Update the rotation. We'll add a small amount each tick.
            _currentYRotation += 0.01f;
            // Wrap the rotation around 2*PI to prevent the number from getting too large
            if (_currentYRotation > Math.PI * 2)
            {
                _currentYRotation -= (float)(Math.PI * 2);
            }

            // Create a new scene update object that now includes rotation.
            var sceneUpdate = new
            {
                // This object defines the "contract" between the backend and frontend
                // for real-time data.
                Timestamp = DateTime.UtcNow,
                Rotation = new
                {
                    Y = _currentYRotation
                }
                // Later, this will also include Vertices, Colors, etc.
            };

            // Broadcast this new object to all connected clients.
            await _hubContext.Clients.All.SendAsync("ReceiveSceneUpdate", sceneUpdate);
        }

        // ... (StopAsync and Dispose methods remain the same) ...
        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Trigonometric Engine Service is stopping.");
            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}