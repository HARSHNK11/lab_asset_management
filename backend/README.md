# Lab Asset Management Backend

Backend server for the Lab Asset Management system using Node.js, Express, and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env` and update `MONGODB_URI`, `JWT_SECRET`, and the GCS variables below

3. Make sure MongoDB is running:
   - Local: `mongodb://localhost:27017/lab-asset-management`
   - Or update `.env` with your MongoDB connection string

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Seeding Test Users

Create test user accounts:
```bash
npm run seed:users
```

This creates the following test accounts:
- **Admin**: `admin@lab.com` / `admin123`
- **Manager**: `manager@lab.com` / `manager123`
- **Technician**: `tech@lab.com` / `tech123`
- **Viewer**: `viewer@lab.com` / `viewer123`

## Importing Data

### Import from Excel:
```bash
npm run import:excel path/to/your/data.xlsx
```

Excel file should have sheets named "Labs" and "Assets" with appropriate columns.

### Import from DOC:
```bash
npm run import:doc path/to/your/data.doc
```

Note: DOC parsing may need adjustment based on your document format.

### Import predefined lab documents from Google Cloud Storage

The CSE, DSE, and ICT import scripts retrieve private documents from GCS using
Application Default Credentials. They do not fall back to local files:

```bash
npm run test:gcs
npm run import:cse
npm run import:dse
npm run import:ict
```

`npm run test:gcs` retrieves and parses all three configured documents without
connecting to or modifying MongoDB. The general `import:excel` script and the
`POST /api/import/excel` upload endpoint continue to use caller-provided local
files/uploads.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and password

### Labs
- `GET /api/labs` - Get all labs
- `GET /api/labs/:id` - Get lab by ID
- `POST /api/labs` - Create lab (protected)

### Assets
- `GET /api/assets` - Get all assets (supports `?labId=` and `?status=` filters)
- `GET /api/assets/:id` - Get asset by ID
- `POST /api/assets` - Create asset (protected)

### Import/Export
- `POST /api/import/excel` - Import Excel file (protected)
- `GET /api/import/excel` - Export to Excel (protected)

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)
- `GCS_BUCKET_NAME` - Private GCS bucket containing the source documents
- `GCS_CSE_FILE` - CSE object URI, for example `gs://your-bucket-name/labs/CSE.xlsx`
- `GCS_DSE_FILE` - DSE object URI, for example `gs://your-bucket-name/labs/DSE.docx`
- `GCS_ICT_FILE` - ICT object URI, for example `gs://your-bucket-name/labs/ICT.docx`

The bucket and object URIs are placeholders in `.env.example`; configure the
real values only in the backend `.env`, which must not be committed.

## GCS and Docker deployment

Upload the original documents to the configured object paths:

```bash
gcloud storage cp CSE.xlsx gs://your-bucket-name/labs/CSE.xlsx
gcloud storage cp DSE.docx gs://your-bucket-name/labs/DSE.docx
gcloud storage cp ICT.docx gs://your-bucket-name/labs/ICT.docx
```

The Compute Engine VM service account needs the `Storage Object Viewer`
permission on the bucket (for example, the `roles/storage.objectViewer` IAM
role). Enable the Cloud Storage API and attach that service account to the VM.
Do not add a service-account JSON key to the image or repository. Pass the
variables through the container runtime, for example with `--env-file .env`:

```bash
docker build -t lab-asset-backend .
docker stop lab-asset-backend
docker rm lab-asset-backend
docker run -d --name lab-asset-backend --env-file .env -p 5000:5000 lab-asset-backend
```
