# Chatbot Feature - Frontend Integration Guide

## Overview

The Chatbot feature provides an intelligent AI assistant that enables users to have conversations based on uploaded documents. The system uses RAG (Retrieval-Augmented Generation) with Pinecone vector storage and Groq LLM.

## Structure

```
chatbot/
├── index.ts                      # Feature exports and routes
├── apis/                         # HTTP endpoints
│   ├── send-message.ts           # Send msg to AI
│   ├── get-session.ts            # Fetch chat session
│   ├── list-sessions.ts          # List all user sessions
│   ├── delete-session.ts         # Delete user session
│   ├── upload-document.ts        # Admin: Upload doc for embedding
│   ├── list-documents.ts         # Admin: List uploaded docs
│   └── delete-document.ts        # Admin: Delete uploaded doc
├── config/                       # AI context configs
│   └── prompts.ts                # System AI prompts
├── services/                     # Business logic
│   ├── chat.service.ts           # Core messaging orchestration
│   ├── chatbot-cache.service.ts  # Redis cache for documents
│   ├── chunker.service.ts        # Text splitting logic
│   ├── document-processor.service.ts # Doc parsing and extraction
│   ├── document-utils.service.ts # File utilities
│   ├── embedding.service.ts      # LLM vector embeddings
│   ├── pinecone.service.ts       # Vector database client
│   ├── search.service.ts         # Semantic search matching
│   └── vector.service.ts         # Vector operations and inserts
└── shared/                       # Shared resources
    ├── chatbot.schema.ts         # Database schema
    ├── interface.ts              # TypeScript interfaces
    └── queries.ts                # Database query logic
```

## Base URL

```
/api/chatbot
```

## Authentication Requirements

| Endpoint                | Authentication | Authorization | Description                  |
| ----------------------- | -------------- | ------------- | ---------------------------- |
| `POST /chat`            | ✅ Required    | All users     | Send message to AI           |
| `GET /sessions`         | ✅ Required    | All users     | List user's sessions         |
| `GET /sessions/:id`     | ✅ Required    | All users     | Get session with messages    |
| `DELETE /sessions/:id`  | ✅ Required    | All users     | Delete session               |
| `POST /documents`       | ✅ Required    | Admin only    | Upload document for training |
| `GET /documents`        | ✅ Required    | Admin only    | List all documents           |
| `GET /documents/stats`  | ✅ Required    | Admin only    | Get document statistics      |
| `DELETE /documents/:id` | ✅ Required    | Admin only    | Delete document              |

---

## Chat Endpoints

### 1. Send Message

Send a message to NIRA AI and receive a response. Automatically creates a new session if `sessionId` is not provided.

**Endpoint:** `POST /api/chatbot/chat`

**Authentication:** Required (Bearer Token)

**Authorization:** All authenticated users

#### Request Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "message": "What are the key findings from the climate report?",
  "sessionId": 1
}
```

#### Request Schema

| Field       | Type   | Required | Description                                          |
| ----------- | ------ | -------- | ---------------------------------------------------- |
| `message`   | string | ✅       | User's message (1-10,000 chars)                      |
| `sessionId` | number | ❌       | Existing session ID. If omitted, creates new session |

#### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "sessionId": 1,
    "sessionTitle": "Climate Report Discussion",
    "isNewSession": false,
    "userMessage": {
      "id": 15,
      "role": "user",
      "content": "What are the key findings from the climate report?",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "assistantMessage": {
      "id": 16,
      "role": "assistant",
      "content": "Based on the uploaded climate report, the key findings are:\n\n1. Global temperatures have risen by 1.2°C since pre-industrial levels\n2. Sea levels are projected to rise 30-60cm by 2100\n3. Extreme weather events have increased by 40%\n\nThese findings are documented in the 'Climate Assessment 2024' report.",
      "sources": [
        {
          "documentId": 5,
          "documentName": "Climate Assessment 2024.pdf",
          "relevance": 0.92
        }
      ],
      "createdAt": "2024-01-15T10:30:02.000Z"
    }
  }
}
```

#### Response Fields

| Field                      | Type    | Description                                 |
| -------------------------- | ------- | ------------------------------------------- |
| `sessionId`                | number  | Session ID (use for follow-up messages)     |
| `sessionTitle`             | string  | Auto-generated title based on first message |
| `isNewSession`             | boolean | Whether a new session was created           |
| `userMessage`              | object  | Stored user message                         |
| `assistantMessage`         | object  | AI response with optional sources           |
| `assistantMessage.sources` | array   | Documents referenced in the response        |

#### Error Responses

| Status | Error            | Description                                         |
| ------ | ---------------- | --------------------------------------------------- |
| `400`  | Validation Error | Invalid message or session ID                       |
| `401`  | Unauthorized     | Missing or invalid JWT token                        |
| `404`  | Not Found        | Session ID doesn't exist or belongs to another user |

---

### 2. List Sessions

Get paginated list of user's chat sessions.

**Endpoint:** `GET /api/chatbot/sessions`

**Authentication:** Required (Bearer Token)

#### Request Headers

```http
Authorization: Bearer <jwt_token>
```

#### Query Parameters

| Parameter | Type   | Default | Description                       |
| --------- | ------ | ------- | --------------------------------- |
| `page`    | number | `1`     | Page number (min: 1)              |
| `limit`   | number | `20`    | Items per page (min: 1, max: 100) |

#### Example Request

```
GET /api/chatbot/sessions?page=1&limit=10
```

#### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Sessions retrieved successfully",
  "data": [
    {
      "id": 5,
      "title": "Climate Report Discussion",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:45:00.000Z"
    },
    {
      "id": 3,
      "title": "Health Policy Questions",
      "createdAt": "2024-01-14T09:00:00.000Z",
      "updatedAt": "2024-01-14T09:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2
  }
}
```

---

### 3. Get Session

Get a specific session with all its messages.

**Endpoint:** `GET /api/chatbot/sessions/:id`

**Authentication:** Required (Bearer Token)

#### Request Headers

```http
Authorization: Bearer <jwt_token>
```

#### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | number | Session ID  |

#### Query Parameters

| Parameter | Type   | Default | Description                  |
| --------- | ------ | ------- | ---------------------------- |
| `page`    | number | `1`     | Page number for messages     |
| `limit`   | number | `50`    | Messages per page (max: 100) |

#### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Session retrieved successfully",
  "data": {
    "session": {
      "id": 5,
      "title": "Climate Report Discussion",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:45:00.000Z"
    },
    "messages": [
      {
        "id": 15,
        "role": "user",
        "content": "What are the key findings from the climate report?",
        "sources": null,
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": 16,
        "role": "assistant",
        "content": "Based on the uploaded climate report...",
        "sources": [
          {
            "documentId": 5,
            "documentName": "Climate Assessment 2024.pdf",
            "relevance": 0.92
          }
        ],
        "createdAt": "2024-01-15T10:30:02.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

#### Error Responses

| Status | Error        | Description                                  |
| ------ | ------------ | -------------------------------------------- |
| `401`  | Unauthorized | Missing or invalid JWT token                 |
| `404`  | Not Found    | Session not found or belongs to another user |

---

### 4. Delete Session

Delete a chat session and all its messages.

**Endpoint:** `DELETE /api/chatbot/sessions/:id`

**Authentication:** Required (Bearer Token)

#### Request Headers

```http
Authorization: Bearer <jwt_token>
```

#### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | number | Session ID  |

#### Success Response

**Status Code:** `204 No Content`

(Empty response body)

#### Error Responses

| Status | Error        | Description                                  |
| ------ | ------------ | -------------------------------------------- |
| `401`  | Unauthorized | Missing or invalid JWT token                 |
| `404`  | Not Found    | Session not found or belongs to another user |

---

## Document Management Endpoints (Admin Only)

### 5. Upload Document

Upload a document for NIRA AI training. The document is processed asynchronously (text extraction, chunking, and vector embedding).

**Endpoint:** `POST /api/chatbot/documents`

**Authentication:** Required (Bearer Token)

**Authorization:** Admin only

#### Request Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

#### Request Body (Form Data)

| Field         | Type   | Required | Description                                 |
| ------------- | ------ | -------- | ------------------------------------------- |
| `file`        | File   | ✅       | Document file to upload                     |
| `name`        | string | ❌       | Custom document name (defaults to filename) |
| `description` | string | ❌       | Document description (max 1000 chars)       |

#### Supported File Types

| Type          | MIME Type                                                                 | Max Size |
| ------------- | ------------------------------------------------------------------------- | -------- |
| PDF           | `application/pdf`                                                         | 20 MB    |
| Plain Text    | `text/plain`                                                              | 20 MB    |
| Markdown      | `text/markdown`                                                           | 20 MB    |
| Word Document | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | 20 MB    |

#### Success Response

**Status Code:** `201 Created`

```json
{
  "success": true,
  "message": "Document uploaded and processing started",
  "data": {
    "id": 10,
    "name": "Climate Assessment 2024.pdf",
    "description": "Annual climate assessment report",
    "fileSize": 2456789,
    "mimeType": "application/pdf",
    "status": "pending",
    "chunkCount": 0,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

> **Note:** Processing happens asynchronously. The document status will change from `pending` → `processing` → `completed` (or `failed`).

#### Error Responses

| Status | Error        | Description                  |
| ------ | ------------ | ---------------------------- |
| `400`  | Bad Request  | No file uploaded             |
| `400`  | Bad Request  | Invalid file type            |
| `400`  | Bad Request  | File too large (> 20MB)      |
| `401`  | Unauthorized | Missing or invalid JWT token |
| `403`  | Forbidden    | User is not an admin         |

---

### 6. List Documents

Get paginated list of all uploaded documents.

**Endpoint:** `GET /api/chatbot/documents`

**Authentication:** Required (Bearer Token)

**Authorization:** Admin only

#### Request Headers

```http
Authorization: Bearer <jwt_token>
```

#### Query Parameters

| Parameter | Type   | Default | Description                       |
| --------- | ------ | ------- | --------------------------------- |
| `page`    | number | `1`     | Page number (min: 1)              |
| `limit`   | number | `20`    | Items per page (min: 1, max: 100) |

#### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Documents retrieved successfully",
  "data": [
    {
      "id": 10,
      "name": "Climate Assessment 2024.pdf",
      "description": "Annual climate assessment report",
      "fileSize": 2456789,
      "mimeType": "application/pdf",
      "status": "completed",
      "chunkCount": 45,
      "errorMessage": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:32:00.000Z"
    },
    {
      "id": 9,
      "name": "Policy Guidelines.docx",
      "description": null,
      "fileSize": 156789,
      "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "status": "completed",
      "chunkCount": 12,
      "errorMessage": null,
      "createdAt": "2024-01-14T09:00:00.000Z",
      "updatedAt": "2024-01-14T09:01:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2
  }
}
```

---

### 7. Get Document Statistics

Get statistics about all uploaded documents.

**Endpoint:** `GET /api/chatbot/documents/stats`

**Authentication:** Required (Bearer Token)

**Authorization:** Admin only

#### Request Headers

```http
Authorization: Bearer <jwt_token>
```

#### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Document statistics retrieved successfully",
  "data": {
    "totalDocuments": 15,
    "totalChunks": 450,
    "byStatus": {
      "pending": 1,
      "processing": 0,
      "completed": 13,
      "failed": 1
    },
    "totalFileSize": 45678901
  }
}
```

---

### 8. Delete Document

Delete a document and its vectors from the system.

**Endpoint:** `DELETE /api/chatbot/documents/:id`

**Authentication:** Required (Bearer Token)

**Authorization:** Admin only

#### Request Headers

```http
Authorization: Bearer <jwt_token>
```

#### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | number | Document ID |

#### Success Response

**Status Code:** `204 No Content`

(Empty response body)

#### Error Responses

| Status | Error        | Description                  |
| ------ | ------------ | ---------------------------- |
| `401`  | Unauthorized | Missing or invalid JWT token |
| `403`  | Forbidden    | User is not an admin         |
| `404`  | Not Found    | Document not found           |

---

## Chat Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NIRA AI CHAT FLOW                            │
└─────────────────────────────────────────────────────────────────────┘

1. USER STARTS NEW CONVERSATION
   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
   │   Frontend  │ ──POST──▶│   Backend   │ ─────▶ │   New       │
   │   Chat UI   │  /chat   │  Creates    │        │   Session   │
   │   (no ID)   │  message │  Session    │        │   Created   │
   └─────────────┘          └─────────────┘        └──────┬──────┘
                                                          │
2. MESSAGE PROCESSING                                     ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │                      BACKEND PROCESSING                          │
   │                                                                  │
   │  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
   │  │ Store    │───▶│ Search   │───▶│ Build    │───▶│ Generate │  │
   │  │ User     │    │ Pinecone │    │ Context  │    │ Response │  │
   │  │ Message  │    │ Vectors  │    │ + History│    │ (Groq)   │  │
   │  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
   │                                                                  │
   └─────────────────────────────────────────────────────────────────┘
                                    │
3. RESPONSE RETURNED                ▼
   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
   │  Frontend   │◀────────│   Backend   │         │  Assistant  │
   │  Displays   │ Response│  Returns    │◀────────│  Message    │
   │  Message +  │ + Sources│ sessionId  │         │  + Sources  │
   │  Sources    │         │ + messages  │         │             │
   └─────────────┘         └─────────────┘         └─────────────┘

4. FOLLOW-UP MESSAGES (include sessionId)
   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
   │  Frontend   │ ──POST──▶│   Backend   │        │   Same      │
   │  Chat UI    │  /chat   │  Uses       │ ─────▶ │   Session   │
   │  (with ID)  │  message │  Existing   │        │   Context   │
   │             │  +sessId │  Session    │        │             │
   └─────────────┘          └─────────────┘        └─────────────┘
```

---

## Document Training Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DOCUMENT TRAINING PIPELINE                        │
└─────────────────────────────────────────────────────────────────────┘

1. ADMIN UPLOADS DOCUMENT
   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
   │   Admin     │ ──POST──▶│   Backend   │ ──────▶│   S3        │
   │  Dashboard  │ /documents│ Validates   │ Upload │   Storage   │
   │   Upload    │  (file)  │  + Stores   │        │             │
   └─────────────┘          └─────────────┘        └──────┬──────┘
                                                          │
2. ASYNC PROCESSING STARTS                                ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │                    BACKGROUND PROCESSING                         │
   │                                                                  │
   │  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
   │  │ Extract  │───▶│ Chunk    │───▶│ Generate │───▶│ Store in │  │
   │  │ Text     │    │ Text     │    │ Embeddings│    │ Pinecone │  │
   │  │ (PDF,DOC)│    │ (800char)│    │ (BGE-M3) │    │ Vectors  │  │
   │  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
   │                                                                  │
   │  Status: pending ──▶ processing ──▶ completed                   │
   └─────────────────────────────────────────────────────────────────┘

3. DOCUMENT READY FOR QUERIES
   - Status changes to "completed"
   - Chunk count updated
   - Document searchable via chat
```

---

        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask NIRA anything..."
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
```

---

## Data Types

### Document Status

| Status       | Description                                |
| ------------ | ------------------------------------------ |
| `pending`    | Document uploaded, waiting to be processed |
| `processing` | Text extraction and embedding in progress  |
| `completed`  | Document fully processed and searchable    |
| `failed`     | Processing failed (check `errorMessage`)   |

### Message Role

| Role        | Description           |
| ----------- | --------------------- |
| `user`      | Message from the user |
| `assistant` | Response from NIRA AI |

### Message Source

| Field          | Type   | Description                 |
| -------------- | ------ | --------------------------- |
| `documentId`   | number | ID of the source document   |
| `documentName` | string | Name of the source document |
| `relevance`    | number | Relevance score (0-1)       |

---

## Configuration

### LLM Settings

| Setting     | Value                     | Description             |
| ----------- | ------------------------- | ----------------------- |
| Provider    | Groq                      | LLM API provider        |
| Model       | `llama-3.3-70b-versatile` | Default model           |
| Max Tokens  | 2048                      | Maximum response length |
| Temperature | 0.7                       | Response creativity     |

### Document Processing

| Setting         | Value      | Description              |
| --------------- | ---------- | ------------------------ |
| Max File Size   | 20 MB      | Maximum upload size      |
| Chunk Size      | ~800 chars | Target chunk size        |
| Overlap         | 25%        | Chunk overlap percentage |
| Embedding Model | BGE-M3     | Vector embedding model   |

### Search Settings

| Setting        | Value | Description                  |
| -------------- | ----- | ---------------------------- |
| Top K          | 5     | Number of chunks to retrieve |
| Min Similarity | 0.3   | Minimum relevance threshold  |

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "message",
      "message": "Message is required"
    }
  ]
}
```

---

## Related Endpoints

- **Auth Feature**: `/api/auth` - User authentication
- **User Feature**: `/api/users` - User profile management
