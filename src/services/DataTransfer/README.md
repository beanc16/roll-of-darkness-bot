# Data Transfer Pattern

A composable architecture for transforming and transferring data across multiple destinations using the Adapter, Strategy, and Mediator patterns with a service layer.

## Architecture

### Adapter Pattern
**`Adapter<Input, Output>`** transforms data from one format to another.
- `transform()` - Converts a single input to the target format
- `transformBulk()` - Batch transforms multiple inputs

### Strategy Pattern
**`DataTransferDestination<Input, Source>`** defines how data is written to a specific destination.
- `create()` - Writes data to the destination
- `createBulk()` - Batch write operation
- `validateInput()` - Validates data before transfer
- `wasTransferred()` - Checks if data already exists at destination

### Mediator Pattern
**`DataTransferPipeline<Input, Output>`** coordinates an Adapter with a Destination, mediating the flow from source to target.
- Transforms input data using the adapter
- Routes transformed data to the destination
- Supports single and bulk operations

### Service Layer
**`DataTransferService<Input, Output>`** orchestrates multiple pipelines, enabling parallel transfers to different destinations.
- Manages multiple transfer pipelines
- Executes all pipelines concurrently
- Provides unified interface for single and bulk operations

## Usage Flow

```
Input → Service → Pipeline(s) → Adapter → Destination
                     ↓
                  Transform
                     ↓
                  Validate & Create
```

Each pipeline combines one adapter with one destination. The service can run multiple pipelines in parallel, allowing simultaneous transfers to different targets (e.g., database, API, file system).
