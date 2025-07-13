using Hyperspace.API.Hubs;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Hyperspace.API.Services
{
    public class TrigonometricEngineService : IHostedService, IDisposable
    {
        private readonly ILogger<TrigonometricEngineService> _logger;
        private readonly IHubContext<NeuroHub> _hubContext;
        private Timer? _timer = null;
        private int _tickCount = 0;

        public TrigonometricEngineService(ILogger<TrigonometricEngineService> logger, IHubContext<NeuroHub> hubContext)
        {
            _logger = logger;
            _hubContext = hubContext;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Trigonometric Engine Service is starting.");

            _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromSeconds(1));

            return Task.CompletedTask;
        }

        private async void DoWork(object? state)
        {
            _tickCount++;
            _logger.LogInformation($"Engine tick #{_tickCount}. Broadcasting scene update.");

            var sceneUpdate = new
            {
                Timestamp = DateTime.UtcNow,
                Tick = _tickCount,
                Message = "This is a heartbeat from the Hyperspace Engine."
            };

            await _hubContext.Clients.All.SendAsync("ReceiveSceneUpdate", sceneUpdate);
        }

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