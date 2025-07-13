using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Hyperspace.API.Hubs
{
    public class NeuroHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"--> Client connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine($"--> Client disconnected: {Context.ConnectionId}");
            if (exception != null)
            {
                Console.WriteLine($"--> Reason: {exception.Message}");
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}