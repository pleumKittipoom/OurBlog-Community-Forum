# OurBlog Community Forum

A full-stack web application for building a community forum with user authentication, note management, comments, and reactions. Built with NestJS (backend) and React (frontend).

## 🚀 Features

- **User Authentication**: JWT-based authentication with role-based access control (RBAC)
- **Note Management**: Create, read, update, and delete notes with public/private visibility
- **Comments System**: Nested comments on notes with parent-child relationships
- **Reactions**: React to notes and comments with various emoji reactions
- **Admin Dashboard**: Admin panel for managing users and content
- **User Management**: User profile management and role assignment
- **Database Migrations**: TypeORM migrations for schema versioning
- **Docker Support**: Full containerization with Docker and Docker Compose

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS 11
- **Language**: TypeScript 5.7
- **Database**: PostgreSQL 14
- **ORM**: TypeORM 0.3
- **Authentication**: JWT (Passport.js)
- **Validation**: class-validator, class-transformer
- **Password Hashing**: bcryptjs
- **Testing**: Jest, Supertest

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Routing**: React Router 7
- **Language**: JavaScript/JSX
- **Styling**: CSS

## 📁 Project Structure

```
my-auth-project/           # Backend (NestJS)
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── app.controller.ts          # Main controller
│   ├── app.service.ts             # Main service
│   │
│   ├── auth/                      # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts        # JWT strategy
│   │   ├── roles.guard.ts         # Role-based access guard
│   │   └── roles.decorator.ts     # Role decorator
│   │
│   ├── admin/                     # Admin module
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   └── admin.module.ts
│   │
│   ├── user/                      # User management
│   │   ├── user.entity.ts
│   │   ├── user.service.ts
│   │   └── user.module.ts
│   │
│   ├── note/                      # Note management
│   │   ├── note.entity.ts
│   │   ├── note.controller.ts
│   │   ├── note.service.ts
│   │   └── note.module.ts
│   │
│   ├── comment/                   # Comment system
│   │   ├── comment.entity.ts
│   │   ├── comment.controller.ts
│   │   ├── comment.service.ts
│   │   └── comment.module.ts
│   │
│   ├── comment-reaction/          # Comment reactions
│   │   ├── comment-reaction.entity.ts
│   │   ├── comment-reaction.service.ts
│   │   └── comment-reaction.module.ts
│   │
│   ├── reaction/                  # Note reactions
│   │   ├── reaction.entity.ts
│   │   ├── reaction.service.ts
│   │   └── reaction.module.ts
│   │
│   ├── migrations/                # Database migrations
│   │   ├── 1763212741832-AddCreatedAtToCommentReaction.ts
│   │   ├── 1763303537525-AddParentToComment.ts
│   │   ├── 1763305547824-AddCommentReactions.ts
│   │   └── 1763514703413-AddImageUrlToNote.ts
│   │
│   └── test/                      # E2E tests
│       └── app.e2e-spec.ts
│
├── Dockerfile                     # Docker image configuration
├── docker-compose.yml             # Docker Compose setup
├── data-source.ts                 # TypeORM data source configuration
├── package.json                   # Project dependencies
├── tsconfig.json                  # TypeScript configuration
└── nest-cli.json                  # NestJS CLI configuration

my-react-app/                      # Frontend (React)
├── src/
│   ├── main.jsx                   # React entry point
│   ├── App.jsx                    # Root component
│   ├── App.css                    # Global styles
│   ├── index.css                  # Base styles
│   │
│   ├── components/                # React components
│   │   ├── AdminPage.jsx          # Admin dashboard
│   │   ├── AuthPage.jsx           # Authentication page
│   │   ├── DashboardPage.jsx      # User dashboard
│   │   ├── PublicNotesPage.jsx    # Public notes view
│   │   ├── NoteDetailPage.jsx     # Note detail view
│   │   ├── CommentItem.jsx        # Comment component
│   │   └── ReactionModal.jsx      # Reaction modal
│   │
│   └── assets/                    # Static assets
│
├── public/                        # Public files
├── index.html                     # HTML template
├── vite.config.js                 # Vite configuration
├── eslint.config.js               # ESLint rules
├── package.json                   # Project dependencies
└── README.md                      # Frontend README
```

## 📋 Prerequisites

- **Node.js**: v18+ (v22 recommended)
- **npm**: v9+
- **Docker** & **Docker Compose** (for containerized setup)
- **PostgreSQL**: v14+ (if running without Docker)

## 🔧 Installation

### Option 1: Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Drive D/OurBlog Community Forum"
   ```

2. **Start the application**
   ```bash
   cd my-auth-project
   docker-compose up -d
   ```

3. **Apply database migrations** (inside the container)
   ```bash
   docker exec <container-name> npm run migration:run
   ```

The application will be available at:
- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5173 (after starting frontend dev server)

### Option 2: Local Development Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd my-auth-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in `my-auth-project/`:
   ```env
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=auth_db
   JWT_SECRET=your_jwt_secret_key
   PORT=3003
   ```

4. **Set up PostgreSQL**
   - Install PostgreSQL v14+
   - Create a database: `auth_db`
   - Update connection details in `.env`

5. **Run database migrations**
   ```bash
   npm run migration:run
   ```

6. **Start the backend**
   ```bash
   npm run start:dev
   ```
   Backend runs on: http://localhost:3003

#### Frontend Setup

1. **Navigate to frontend directory** (in a new terminal)
   ```bash
   cd my-react-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend runs on: http://localhost:5173

## 📚 Available Scripts

### Backend (`my-auth-project/`)

```bash
# Development
npm run start              # Start the application
npm run start:dev         # Start with watch mode
npm run start:debug       # Start with debugger

# Production
npm run build             # Build for production
npm run start:prod        # Run production build

# Database
npm run migration:generate # Generate new migration (after schema changes)
npm run migration:run      # Apply pending migrations
npm run migration:revert   # Revert last migration

# Code Quality
npm run lint              # Run ESLint with auto-fix
npm run format            # Format code with Prettier

# Testing
npm test                  # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:cov         # Generate coverage report
npm run test:debug       # Debug tests
npm run test:e2e         # Run E2E tests
```

### Frontend (`my-react-app/`)

```bash
# Development
npm run dev               # Start dev server

# Production
npm run build             # Build for production
npm run preview           # Preview production build

# Code Quality
npm run lint              # Run ESLint
```

## 🗄️ Database Setup

### Database Entities

1. **User** - User profiles with roles
2. **Note** - Main content with visibility settings
3. **Comment** - Comments on notes with nesting support
4. **Reaction** - Reactions to notes
5. **CommentReaction** - Reactions to comments

### Migrations

The project uses TypeORM migrations for schema versioning. Recent migrations include:

- Adding `createdAt` to CommentReaction
- Adding `parent` field for comment nesting
- CommentReactions table setup
- Adding `imageUrl` to Note

To create a new migration:
```bash
npm run migration:generate -- -n MigrationName
npm run migration:run
```

## 🔐 Authentication

The application uses **JWT (JSON Web Tokens)** for authentication with role-based access control:

- **JWT Strategy**: Passport.js JWT strategy for route protection
- **Roles Guard**: Custom guard to enforce role-based access
- **Roles Decorator**: Decorator to specify required roles for endpoints

### Default Roles
- `admin` - Full access to admin features
- `user` - Standard user access
- `public` - No authentication required

## 🌐 API Endpoints (Basic Structure)

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile

### Users
- `GET /users` - List all users (admin only)
- `GET /users/:id` - Get user details
- `PUT /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user (admin only)

### Notes
- `GET /notes` - List public notes
- `GET /notes/:id` - Get note details
- `POST /notes` - Create a new note (authenticated)
- `PUT /notes/:id` - Update note (owner/admin)
- `DELETE /notes/:id` - Delete note (owner/admin)

### Comments
- `GET /notes/:noteId/comments` - List note comments
- `POST /notes/:noteId/comments` - Add comment (authenticated)
- `PUT /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment

### Reactions
- `POST /notes/:noteId/reactions` - Add reaction to note
- `DELETE /notes/:noteId/reactions/:reactionId` - Remove reaction
- `POST /comments/:commentId/reactions` - Add reaction to comment

## 🧪 Testing

### Run Tests

```bash
# Backend unit tests
cd my-auth-project
npm test

# Backend with coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

### Test Files
- `**/*.spec.ts` - Unit tests for services and controllers
- `test/app.e2e-spec.ts` - End-to-end tests

## 📝 Environment Variables

Create `.env` file in `my-auth-project/` directory:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=auth_db

# JWT Configuration
JWT_SECRET=your_super_secret_key

# Server Configuration
PORT=3003
NODE_ENV=development
```

For Docker Compose, update environment variables in `docker-compose.yml`.

## 🐳 Docker Usage

### Build and Run with Docker Compose

```bash
# Navigate to backend directory
cd my-auth-project

# Start services (PostgreSQL + API)
docker-compose up -d

# View logs
docker-compose logs -f api

# Run migrations
docker-compose exec api npm run migration:run

# Stop services
docker-compose down

# Remove volumes (careful: deletes database data)
docker-compose down -v
```

### Dockerfile

The `Dockerfile` is configured for a NestJS application with:
- Multi-stage build for optimization
- Node Alpine image for small size
- Production-ready setup

## 📦 Dependencies

### Backend Key Dependencies
- `@nestjs/*` - NestJS framework packages
- `typeorm` - ORM for database operations
- `passport-jwt` - JWT authentication strategy
- `pg` - PostgreSQL driver
- `bcryptjs` - Password hashing
- `class-validator` - Input validation
- `dotenv` - Environment variable management

### Frontend Key Dependencies
- `react` - UI library
- `react-dom` - React DOM rendering
- `react-router-dom` - Client-side routing

## 🚨 Troubleshooting

### Backend won't start
- Ensure PostgreSQL is running
- Check database connection string in `.env`
- Verify PORT 3003 is available
- Run `npm install` to ensure all dependencies are installed

### Frontend won't start
- Check NODE_VERSION compatibility (v18+)
- Clear `node_modules` and `package-lock.json`, then reinstall
- Ensure PORT 5173 is available

### Database migrations fail
- Verify database is created
- Check user permissions
- Run: `npm run migration:run`

### Docker issues
- Ensure Docker daemon is running
- Check port availability (3000, 5432, 5433)
- View logs: `docker-compose logs`

## 📖 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 📄 License

UNLICENSED

## 👥 Contributing

Contributions are welcome! Please follow these guidelines:

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📞 Support

For issues, questions, or suggestions, please:
- Open an issue on the repository
- Contact the development team
- Check existing documentation

---

**Version**: 0.0.1  
**Last Updated**: April 2026
