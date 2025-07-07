# Backend Data Directory

This directory contains the backend data for the blog platform, managed via GitHub Actions.

## Structure

```
data/
├── users/          # User account data
│   └── {username}.json
├── blogs/          # Blog metadata
│   └── {username}.json
└── README.md       # This file
```

## User Data Format

`data/users/{username}.json`:
```json
{
  "id": "user_timestamp_username",
  "username": "username",
  "email": "user@example.com",
  "blogTitle": "My Blog Title",
  "description": "Blog description",
  "theme": "papermod",
  "createdAt": "2025-01-07T05:00:00.000Z",
  "status": "active",
  "postsCount": 0,
  "lastActivity": "2025-01-07T05:00:00.000Z"
}
```

## Blog Data Format

`data/blogs/{username}.json`:
```json
{
  "username": "username",
  "title": "My Blog Title",
  "description": "Blog description",
  "theme": "papermod",
  "url": "https://blog.mypp.site/username",
  "githubUrl": "https://antonio-parada.github.io/parada-site/blogs/username",
  "createdAt": "2025-01-07T05:00:00.000Z",
  "posts": [
    {
      "filename": "welcome-post.md",
      "title": "Welcome Post",
      "date": "2025-01-07T05:00:00.000Z",
      "published": true
    }
  ]
}
```

## API Operations

The backend supports these operations via GitHub Issues API:

- `create-blog`: Creates a new blog and user account
- `create-post`: Adds a new post to an existing blog
- `update-user`: Updates user information
- `get-user-data`: Retrieves user data (via direct file access)

## How It Works

1. Frontend submits API requests by creating GitHub Issues with specific titles
2. GitHub Actions workflow detects these issues and processes them
3. Data is committed to this directory structure
4. Issues are automatically closed with status updates
5. GitHub Pages rebuilds automatically with new content
