# CMS + Discovery System

Backend system for managing and discovering programs
(podcasts/documentaries) and episodes.

Designed with clean module boundaries, strong data integrity, and
scalable architecture decisions.

------------------------------------------------------------------------

## System Overview

Two logically separated components:

-   **CMS Module (Internal)** → Write operations + Import
-   **Discovery Module (Public)** → Read-only browsing & search


```
                        ┌──────────────┐
                        │     User     │
                        └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │  Discovery   │  (Read-only)
                        └──────┬───────┘
                               │
                              DB
                               ▲
                        ┌──────┴───────┐
                        │     CMS      │  (Write + Import)
                        └──────┬───────┘
                               │
                          Primary DB
                               │
                        External Source
                           (YouTube)

```

CMS and Discovery are separated to reduce coupling and allow independent
scaling.

------------------------------------------------------------------------

## Tech Stack

-   NestJS + TypeScript\
-   PostgreSQL 16\
-   TypeORM\
-   Docker Compose

------------------------------------------------------------------------

## Architectural Decisions

### Database Choice --- PostgreSQL 16

PostgreSQL was selected because:

-   Strong consistency guarantees
-   Mature indexing capabilities
-   Native full-text search
-   Lower operational complexity than introducing a separate search
    engine

------------------------------------------------------------------------

### Read / Write Database Separation

The system is designed for logical and physical read/write separation:

-   CMS writes only to the **Primary Database**
-   Discovery reads from **Read Replicas**
-   Replication handled at infrastructure level (PostgreSQL streaming
    replication)
-   Ensures:
    -   High write integrity
    -   Read scalability
    -   Reduced contention under heavy traffic

Application layer remains stateless and horizontally scalable.

------------------------------------------------------------------------

### Search Strategy

-   `tsvector` columns on Programs and Episodes
-   GIN indexes on `search_vector`
-   Ranked results using `ts_rank`
-   Arabic + English support

PostgreSQL full-text search was chosen to avoid operational overhead of
a distributed search cluster while keeping strong consistency and
adequate performance for the defined scope.

------------------------------------------------------------------------

### Indexing Strategy

-   UNIQUE (source, externalProgramId) on programs
-   UNIQUE (source, sourceId) on episodes
-   GIN INDEX on programs.search_vector
-   GIN INDEX on episodes.search_vector
-   INDEX on episodes.program_id
-   INDEX on programs.created_at
-   INDEX on episodes(published_at DESC)
-   COMPOSITE INDEX on programs(category_id, language, created_at DESC)

------------------------------------------------------------------------

### Pagination Strategy

Limit/Offset with deterministic ordering (`created_at DESC`).

Chosen for simplicity and predictable behavior.\
Cursor pagination can be introduced later if deep pagination becomes
heavy.

------------------------------------------------------------------------

## Scalability Considerations

-   Stateless API → horizontal scaling
-   Discovery optimized for read-heavy traffic
-   Database read replicas for high throughput
-   Proper database indexing
-   Ready for Redis caching or ElasticSearch if complexity grows

------------------------------------------------------------------------

## API Documentation

API endpoints are fully documented using **Swagger (OpenAPI)**.

Swagger UI available at:

    /api-docs

Includes:

-   Request/response schemas
-   DTO validation rules
-   Query parameters
-   Example responses

Designed to support frontend teams with clear contract definitions.

------------------------------------------------------------------------

## API Endpoints

### CMS (Internal – Authenticated)

POST /cms/categories\
GET /cms/categories\
GET /cms/categories/:id\
PUT /cms/categories/:id\
DELETE /cms/categories/:id

GET /cms/programs\
GET /cms/programs/:id\
POST /cms/programs\
PUT /cms/programs/:id\
DELETE /cms/programs/:id

POST /cms/programs/:id/episodes\
PUT /cms/episodes/:id\
DELETE /cms/episodes/:id

POST /cms/import/youtube

### Discovery (Public – Read Only)

GET /discovery/search\
GET /discovery/programs\
GET /discovery/programs/:id\
GET /discovery/episodes\
GET /discovery/episodes/:id

------------------------------------------------------------------------

## Import System

-   Extensible abstraction (`ImportSource` interface)
-   Concrete YouTube implementation
-   Database-level deduplication
-   Transactional execution
-   Returns summary only

------------------------------------------------------------------------

## Assumptions & Tradeoffs

-   Dataset size assumed moderate at initial launch
-   Search scope limited to title + description
-   Elasticsearch intentionally avoided to reduce operational
    complexity
-   Read replicas expected in production for high traffic scenarios

------------------------------------------------------------------------

## Quick Start

### Using Docker

    cp .env.example .env
    docker-compose up -d
    docker-compose exec app npm run migration:run
    docker-compose exec app npm run seed

### Local Development

    npm install
    cp .env.example .env
    npm run migration:run
    npm run seed
    npm run start:dev

App runs at:

http://localhost:3000

------------------------------------------------------------------------

## Environment Variables

DB_HOST=localhost\
DB_PORT=5432\
DB_NAME=cms_discovery\
DB_USERNAME=postgres\
DB_PASSWORD=postgres

------------------------------------------------------------------------

## Project Structure

    src/
    ├── cms/
    ├── discovery/
    ├── database/
    │   ├── entities/
    │   ├── migrations/
    │   └── seed/
    ├── common/
    └── config/

------------------------------------------------------------------------

## Final Notes

This architecture balances simplicity, performance, strong consistency,
operational cost, and extensibility without premature complexity.
