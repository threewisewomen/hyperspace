

Here is the complete blueprint for the **HYPERSPACE Engine**.

***

## System Design Blueprint: The NeuroSphere 3D Engine

### 1. Project Vision & System Overview

**Project Vision:** To create a premier, open, and modular platform that transforms the abstract world of EEG brain signals into intuitive, interactive, and beautiful 3D geometric art. The **NeuroSphere 3D Engine** will serve not only as a powerful real-time visualization tool for researchers and enthusiasts but also as a developer-friendly, API-driven backend for a new generation of neuro-tech applications.

**System Overview:**
The NeuroSphere 3D Engine is a distributed, web-based system architected for modularity, real-time performance, and extensibility. It ingests EEG data from live devices or uploaded files, channels it through a robust processing pipeline, and uses a core **Trigonometric Visualization Engine** to map neural activity to dynamic 3D shapes. All functionality is exposed via a secure and well-documented API, with a feature-rich Angular frontend serving as the primary user interface. The entire system is containerized with Docker for seamless development, deployment, and scaling.

### 2. System Design Principles

*   **Modularity & Decoupling:** Every component (data ingestion, processing, visualization, UI) is an independent service communicating via well-defined APIs and message queues. This allows for independent development, deployment, and scaling.
*   **API-First Design:** All functionality is accessible through a secure API Gateway. The primary Angular UI is just one client; third-party applications are first-class citizens.
*   **Real-time Performance:** The architecture prioritizes low-latency data flow (<100ms from acquisition to visualization) using high-performance technologies like WebSockets (SignalR) and message brokers.
*   **Extensibility:** The system is designed for growth. Adding support for new EEG devices, signal processing algorithms, or 3D visualization shaders will be achieved by adding new, self-contained modules without altering the core.
*   **Scalability:** The containerized, microservices-based architecture allows for scaling individual components based on load. The processing services can be replicated to handle hundreds of concurrent EEG streams.
*   **Configurability & Creativity:** Users and developers can define their own visualization rules, mapping specific brainwave patterns (e.g., alpha waves) to geometric properties (e.g., spiral tightness, color, pulsation), empowering endless creative expression.

### 3. Requirements

#### Functional Requirements
1.  **Dual-Mode Data Acquisition:**
    *   **Real-time Streaming:** Connect to and stream live EEG data from devices supporting LSL (Lab Streaming Layer), or from custom drivers for devices like Muse, OpenBCI, etc.
    *   **Offline File Upload:** Upload and process historical EEG data in standard formats like EDF/EDF+, BDF, and developer-friendly CSV.
2.  **Advanced Signal Processing Pipeline:**
    *   Perform robust preprocessing: band-pass filtering, 50/60Hz notch filtering for line noise removal, and baseline correction.
    *   Execute Fast Fourier Transform (FFT) on sliding windows of data to compute power spectral density (PSD) across standard frequency bands (Delta, Theta, Alpha, Beta, Gamma).
    *   (Future) Support for advanced techniques like Independent Component Analysis (ICA) for artifact removal.
3.  **Trigonometric Visualization Engine:**
    *   **Spatial Mapping:** Map discrete electrode data onto a 3D scalp model using standard 10-20 system coordinates.
    *   **Surface Interpolation:** Use trigonometric and spatial algorithms (e.g., Inverse Distance Weighting, Spherical Splines) to create a smooth, continuous representation of neural activity across the scalp surface.
    *   **Generative Geometry:** Generate dynamic 3D meshes where vertex positions, colors, and textures are driven by processed EEG features (e.g., band power).
4.  **User-Defined Visualization Rules:**
    *   Provide a mechanism (via API and UI) for users to create and save "visualization presets."
    *   These presets will declaratively map EEG features to visual parameters. For example: `Alpha Power -> Color Hue`, `Beta Power -> Mesh Deformation Scale`, `Theta/Beta Ratio -> Pulsation Speed`.
5.  **Interactive Frontend UI:**
    *   Render the dynamic 3D visualization in a web browser with interactive camera controls (rotate, zoom, pan).
    *   Display synchronized auxiliary data: multi-channel 2D waveform plots, real-time power spectrum bar charts, and a 3D model showing electrode locations.
    *   Provide UI controls for selecting live/offline data sources, managing visualization presets, and configuring processing parameters.
6.  **Secure, Modular API:**
    *   Expose all system capabilities via RESTful and WebSocket APIs.
    *   Secure API endpoints with modern authentication standards (JWT).
    *   Provide clear Swagger/OpenAPI documentation for third-party developers.

#### Non-Functional Requirements
1.  **Latency:** End-to-end latency from data acquisition to visualization must be under 100ms.
2.  **Throughput:** The system must handle EEG data sampling rates up to 1024 Hz. The backend must be scalable to support dozens of concurrent users/streams.
3.  **Portability:** The entire system must run on any OS (Windows, macOS, Linux) via Docker and Docker Compose.
4.  **Security:** All data transfer must be encrypted (HTTPS, WSS). Sensitive user data and EEG recordings at rest must be handled securely.
5.  **Usability:** The UI must be intuitive and responsive. The API documentation must be comprehensive and easy to follow.
6.  **Reliability:** Services must be resilient to failures. The system should handle device disconnections gracefully and recover.

### 4. Tech Stack

| Layer                         | Technology / Tool                       | Purpose                                                                |
| ----------------------------- | --------------------------------------- | ---------------------------------------------------------------------- |
| **Frontend UI**               | Angular 16+ (TypeScript)                | Reactive, component-based single-page application.                     |
| **3D Rendering**              | Three.js (WebGL)                        | High-performance, flexible 3D graphics in the browser.                 |
| **2D Charting**               | Chart.js or ECharts                     | For real-time waveform and power spectrum plots.                       |
| **UI Components**             | Angular Material or PrimeNG             | Professional, responsive, and accessible UI controls.                  |
| **Backend Framework**         | C# with .NET 8 (ASP.NET Core)           | High-performance, cross-platform services and APIs.                    |
| **Real-time Comms**           | SignalR                                 | Robust WebSocket communication between backend and clients.            |
| **API Gateway**               | Nginx or built-in ASP.NET Core YARP     | Single entry point for all API requests, routing, and load balancing.  |
| **Signal Processing**         | Math.NET Numerics                       | Powerful library for FFT, filtering, and numerical computation.         |
| **Message Broker (Optional)** | RabbitMQ                                | For advanced decoupling and resilience between backend microservices.  |
| **Database**                  | PostgreSQL                              | For storing user configurations, presets, and session metadata.        |
| **Containerization**          | Docker & Docker Compose                 | For packaging, distributing, and running the entire application stack. |
| **Authentication**            | JWT (JSON Web Tokens)                   | For securing API endpoints.                                            |

### 5. System Architecture

The NeuroSphere 3D Engine employs a decoupled microservices architecture to ensure scalability and modularity. An API Gateway acts as the single "front door," routing requests to the appropriate backend services.

#### Architecture Diagram
```
                               +-----------------------------+
[EEG Device / LSL]------------>|  (1) EEG Acquisition Service|------+
                               +-----------------------------+      |
                                                                    | (Raw EEG Data)
[File Upload UI]-------------->[API Gateway]----------------------> |
                                 ^       ^                          V
                                 |       |        +--------------------------------+
                                 |       |        | (Optional) RabbitMQ / Kafka  |
                                 |       |        +--------------------------------+
                                 |       |                          | (Normalized Data)
                                 |       +--------------------------V-----------------+
                                 |                                                      |
                 +-------------------------------+        +-----------------------------+
(API Calls) <----|       API GATEWAY (YARP)      |<------>|  (2) Signal Processing Service|
                 |      (REST & SignalR Hub)     |        +-----------------------------+
                 +-------------------------------+                         | (Frequency Power Data)
                                 ^                                         |
                                 | (WebSocket Data)                        V
                                 |                             +-----------------------------+
+--------------------------------+                             | (3) Trigonometric Viz Engine|
|                                                              +-----------------------------+
|    +-----------------------------+                                        | (3D Mesh/Scene Data)
|    |      Frontend Client        |                                        |
|    | (Angular, Three.js, SignalR)|<---------------------------------------+
|    +-----------------------------+
|
+--->[Other 3rd Party Apps] (via API)

```
*Note: For simplicity, the initial implementation can bypass the message broker and have services communicate directly via HTTP/gRPC, but the design accounts for its inclusion.*

#### Data Flow (Real-time Example)
1.  **Acquisition:** The `EEG Acquisition Service` (a standalone C# process) connects to an LSL stream, receives a raw data sample (e.g., `[v1, v2, ..., v16]`).
2.  **Ingestion:** The sample is sent to the `Signal Processing Service`.
3.  **Processing:** This service applies filters and runs FFT on a sliding window. It calculates the power for Alpha, Beta, etc., for each channel.
4.  **Visualization Generation:** The frequency power data is sent to the `Trigonometric Visualization Engine`.
5.  **Transformation:** This engine uses the active "visualization preset" to map the power data to 3D mesh vertex positions and colors.
6.  **Streaming:** The resulting 3D mesh data is sent to the `API Gateway's SignalR Hub`.
7.  **Rendering:** The SignalR Hub broadcasts the mesh data to all subscribed clients. The Angular frontend receives the data and instructs Three.js to update the 3D model on screen. The entire flow executes in milliseconds.

### 6. Detailed Module Design

#### Module 1: EEG Acquisition Service
*   **Purpose:** The sole responsibility is to interface with hardware (or simulators) and stream raw data.
*   **Responsibilities:**
    *   Manages a library of "drivers" for different EEG sources (LSL, Muse SDK, etc.).
    *   Receives connection requests (e.g., "Connect to Muse device XYZ").
    *   Streams raw, timestamped EEG channel data to the Signal Processing Service.
    *   Handles hardware-specific errors and disconnections gracefully.

#### Module 2: Signal Processing Service
*   **Purpose:** The number-crunching brain of the operation.
*   **Responsibilities:**
    *   Receives raw EEG data (from acquisition service) or historical data (from file uploads via the API Gateway).
    *   Maintains a pipeline of configurable processing steps (filtering, referencing).
    *   Performs windowed FFT and computes frequency band powers.
    *   Forwards the processed, feature-rich data to the Visualization Engine.

#### Module 3: Trigonometric Visualization Engine
*   **Purpose:** The artistic heart of the system. Translates numbers into geometry.
*   **Responsibilities:**
    *   Receives processed EEG feature data (e.g., band powers).
    *   Loads and manages user-defined "Visualization Presets" from the database.
    *   Applies the rules from the active preset to generate 3D scene data. This involves:
        *   Interpolating scalp activity.
        *   Deforming a base 3D mesh.
        *   Calculating vertex colors.
        *   Generating data for other visual effects (e.g., particle systems, shaders).
    *   Outputs a stream of lightweight 3D scene-update instructions (e.g., JSON objects describing updated vertex positions and colors) to the API Gateway.

#### Module 4: API Gateway & Data Hub
*   **Purpose:** The central communications hub and security checkpoint.
*   **Responsibilities:**
    *   **REST API:** Exposes endpoints for file uploads, managing presets, user authentication, and system configuration.
    *   **WebSocket Hub (SignalR):** Manages real-time client connections. It receives the final 3D scene data from the Visualization Engine and broadcasts it efficiently to all subscribed frontend clients.
    *   **Routing:** Directs incoming requests to the correct backend service.
    *   **Security:** Handles JWT validation and enforces API access rules.

#### Module 5: Frontend Application (Angular)
*   **Purpose:** The interactive window into the NeuroSphere.
*   **Responsibilities:**
    *   Handles user authentication and session management.
    *   Provides the UI for uploading files and managing visualization presets.
    *   Connects to the SignalR hub to receive real-time 3D scene data.
    *   Uses **Three.js** to render and animate the 3D scene based on data from the hub.
    *   Provides interactive camera controls and UI elements to switch between presets and view modes.
    *   Displays secondary 2D charts (waveforms, power spectrum) that are synchronized with the 3D view.

### 7. Implementation Plan

**Phase 1: The Core Foundation (2 Weeks)**
*   Setup monorepo with C# solution and Angular workspace.
*   **Backend:** Create the C# project for a single, monolith-style backend (to be broken up later). Implement a basic LSL simulator.
*   **Frontend:** Scaffold the Angular app with basic routing.
*   **Goal:** Stream simulated raw data from backend to frontend console log via SignalR.

**Phase 2: The Visual Spark (3 Weeks)**
*   **Backend:** Implement basic filtering and FFT in the C# service.
*   **Frontend:** Integrate Three.js. Create a static 3D sphere.
*   **Integration:** Connect the backend FFT output to the sphere. Make the sphere change color or pulsate based on the average alpha power.
*   **Goal:** A live, pulsating sphere in the browser, driven by simulated EEG data.

**Phase 3: The Trigonometric Engine & Interactivity (3 Weeks)**
*   **Backend:** Develop the core Trigonometric Engine. Implement spatial interpolation and mesh deformation. Create the first "Visualization Preset" data model.
*   **Frontend:** Replace the simple sphere with a deformable mesh (e.g., a head model). Implement dynamic updates to mesh vertices based on incoming SignalR data. Add orbit camera controls.
*   **Goal:** A fully interactive, deforming 3D head model reacting in real-time.

**Phase 4: API, UI Polish & Data Upload (2 Weeks)**
*   **Backend:** Formalize the REST API for uploading files and managing presets. Implement EDF/CSV file parsing. Store presets in PostgreSQL.
*   **Frontend:** Build the UI for file upload and preset management. Add 2D charts. Polish the overall user experience.
*   **Goal:** Users can upload an EEG file, select it, and see the visualization play back.

**Phase 5: Dockerization & Decoupling (2 Weeks)**
*   Create Dockerfiles for the frontend and backend.
*   Write a `docker-compose.yml` file to orchestrate the entire system (UI, Backend, DB).
*   **(Stretch Goal):** Begin refactoring the monolith backend into the separate microservices defined in the architecture.
*   **Goal:** The entire application can be started with a single `docker-compose up` command.

**Phase 6: Testing, Optimization & Documentation (Ongoing)**
*   Write unit and integration tests.
*   Profile and optimize the data pipeline for latency.
*   Write comprehensive API documentation (Swagger/OpenAPI).
*   Create a user guide.
*   **Goal:** A stable, performant, and well-documented version 1.0.

### 8. Prompts for AI / Developer Implementation

Here are the detailed, "fool-proof" prompts for generating the core components.

---
#### **Prompt 1: Backend - Signal Processing Service**

"Create a C# .NET 8 background service (implementing `IHostedService`). This service's role is to process EEG data.
**Responsibilities:**
1.  It should listen for incoming raw EEG data. For now, simulate this with a `System.Threading.Timer` that generates a `double[]` for 16 channels at 256 Hz.
2.  Implement a processing pipeline using **Math.NET Numerics**. The pipeline for each channel must include:
    *   A 4th order Butterworth band-pass filter from 1-50 Hz.
    *   A 50Hz notch filter.
3.  Process data in sliding windows of 1 second (256 samples) with 50% overlap.
4.  For each window, perform an FFT and calculate the average power for these frequency bands: Delta (1-4 Hz), Theta (4-8 Hz), Alpha (8-13 Hz), Beta (13-30 Hz), Gamma (30-50 Hz).
5.  The final output of this service for each processing tick should be a data structure containing the band powers for all 16 channels.
6.  Log the output to the console. Do not implement API endpoints or SignalR in this service; it will only perform processing. Design it to be stateless."

---
#### **Prompt 2: Backend - Trigonometric Visualization Engine & Presets**

"Create a C# .NET 8 class library project. This project defines the core visualization logic.
**Classes to Create:**
1.  `VisualizationPreset.cs`: A model class with properties like `Name (string)`, `BaseMesh (string)`, and a `List<MappingRule> Rules`.
2.  `MappingRule.cs`: A model class defining a rule, with properties like `SourceFeature` (enum: AlphaPower, BetaPower, etc.), `TargetVisual` (enum: ColorHue, DeformationScale, PulseSpeed, etc.), and `ScalingFactor (float)`.
3.  `TrigonometricEngine.cs`: This is the main class.
    *   It should have a method: `GenerateSceneUpdate(EegFeatures features, VisualizationPreset preset)`.
    *   `EegFeatures` will be the input containing the band powers for all channels.
    *   Inside this method, it will:
        *   Load a standard set of 3D coordinates for the 10-20 electrode system.
        *   Use Inverse Distance Weighting (IDW) to interpolate the power of the `SourceFeature` (from the rules) across a virtual scalp grid. This involves using trigonometric principles on a sphere.
        *   Generate a `SceneUpdate` object.
4.  `SceneUpdate.cs`: A data transfer object (DTO) containing `float[] VertexPositions` and `float[] VertexColors` that will be sent to the frontend for rendering.
The logic should be pure and stateless. Its only job is to translate EEG features into 3D mesh data based on a given preset."

---
#### **Prompt 3: Backend - API Gateway & Real-time Hub**

"Create a C# ASP.NET Core 8 Web API project. This will serve as the **API Gateway**.
**Responsibilities:**
1.  **REST Endpoints:**
    *   `POST /api/files/upload`: A stub for uploading EEG files.
    *   `GET /api/presets`: A stub that returns a hardcoded list of `VisualizationPreset` objects.
    *   `POST /api/presets`: A stub to save a new preset.
2.  **SignalR Hub (`NeuroSphereHub`):**
    *   This hub will be responsible for real-time communication.
    *   Internally, it will instantiate and use the `SignalProcessingService` logic and the `TrigonometricEngine` from the other projects.
    *   It will run a loop (e.g., using a timer) that:
        1.  Gets the latest processed features from the signal processor.
        2.  Passes them to the trigonometric engine to get a `SceneUpdate`.
        3.  Broadcasts this `SceneUpdate` object to all connected clients using a method like `Clients.All.SendAsync("ReceiveSceneUpdate", sceneUpdate)`.
3.  **Security:** Add JWT Bearer authentication scheme services to the dependency injection container, and apply the `[Authorize]` attribute to the REST endpoints.
4.  **CORS:** Configure a CORS policy that allows requests from the Angular app's development server (`http://localhost:4200`)."

---
#### **Prompt 4: Frontend - Core 3D Visualization Component**

"Build an Angular 16+ component named `visualization-canvas`.
**Requirements:**
1.  **Three.js Integration:** Set up a Three.js scene, perspective camera, and WebGL renderer within the component's template.
2.  **Initial Scene:** Load and display a simple 3D head model (from a .gltf or .obj file which you can assume is in the `/assets` folder). Add basic lighting (ambient and directional) and camera orbit controls (`THREE.OrbitControls`).
3.  **Real-time Updates:** This component must connect to a `SignalRService` (to be created in the next prompt). It will subscribe to an `Observable<SceneUpdate>` from that service.
4.  **Dynamic Rendering:** On receiving a `SceneUpdate` object, the component must:
    *   Access the geometry of the loaded 3D head model.
    *   Update the `position` buffer attribute with the `VertexPositions` from the `SceneUpdate` object.
    *   Update the `color` buffer attribute (if it exists, otherwise add it) with the `VertexColors` from the `SceneUpdate`.
    *   Set the `needsUpdate` flag on these buffer attributes to `true` so Three.js re-renders the changes.
5.  Implement an animation loop using `requestAnimationFrame` to continuously render the scene."

---
#### **Prompt 5: Frontend - SignalR & State Management Service**

"Create an injectable Angular service named `SignalRService`.
**Responsibilities:**
1.  **Connection Management:** Use the `@microsoft/signalr` client library to establish and manage a connection to the backend `NeuroSphereHub` (`http://localhost:5000/neurohub`). Include methods like `startConnection()` and `stopConnection()`. Implement basic reconnection logic if the connection is lost.
2.  **State Management:**
    *   Create a public RxJS `BehaviorSubject<SceneUpdate>` to hold the latest scene update data.
    *   Create a public observable from this subject: `public sceneUpdate$ = this.sceneUpdateSubject.asObservable()`.
3.  **Event Listener:** When the SignalR connection is established, register a listener for the `ReceiveSceneUpdate` event from the server.
4.  **Data Flow:** When a `SceneUpdate` message is received, call `.next()` on the `sceneUpdateSubject` to push the new data to all subscribers (like the `visualization-canvas` component)."

---
#### **Prompt 6: DevOps - Dockerization**

"Create the full Dockerization setup for the NeuroSphere 3D Engine.
**Deliverables:**
1.  **Dockerfile for Frontend:** A multi-stage Dockerfile that first uses a `node` image to build the Angular application (`npm run build`), and then copies the output from the `/dist` folder into a lightweight `nginx` image to be served as a static site.
2.  **Dockerfile for Backend:** A multi-stage Dockerfile that uses the `mcr.microsoft.com/dotnet/sdk:8.0` image to build and publish the C# ASP.NET Core API Gateway project, and then copies the published output into a lean `mcr.microsoft.com/dotnet/aspnet:8.0` runtime image.
3.  **`docker-compose.yml` file:**
    *   Define three services: `frontend`, `backend`, and `db`.
    *   The `frontend` service should build from its Dockerfile and map port 80 to the host.
    *   The `backend` service should build from its Dockerfile, map its application port to the host (e.g., 5000), and depend on the `db` service.
    *   The `db` service should use the official `postgres:15` image.
    *   Configure environment variables for the backend to connect to the PostgreSQL database.
    *   Use a named volume to persist the PostgreSQL data."