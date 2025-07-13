# Inside the docker/backend/Dockerfile

# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files and restore dependencies. This layer is cached unless .csproj changes.
COPY ["backend/src/Hyperspace.API/Hyperspace.API.csproj", "Hyperspace.API/"]
RUN dotnet restore "Hyperspace.API/Hyperspace.API.csproj"

# Copy the rest of the backend source code
COPY backend/src/. ./Hyperspace.API/

# Publish the application
WORKDIR "/src/Hyperspace.API"
# --- THIS IS THE CORRECTED LINE ---
RUN dotnet publish "Hyperspace.API.csproj" -c Release -o /app/publish --no-restore /p:UseAppHost=false

# Stage 2: Create the final, lean runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Expose the port the app will run on
EXPOSE 8080

# Define the entrypoint
ENTRYPOINT ["dotnet", "Hyperspace.API.dll"]