# Getting Started
This application should allow users to perform basic operations—viewing, adding, editing, and deleting user data—using a mock backend API. This project is a practical exercise in front-end development, focusing on API interaction, dynamic UI updates, and data handling.

##  1. Clone the repo
```sh
git clone https://github.com/YOUR-USERNAME/user-management-dashboard.git
cd user-management-dashboard
```

##  2. Install the dependencies
```sh
npm install
```

##  3.  Start the application
```sh
npm start
# Visit http://localhost:3000 in your browser
```


## API Usage
- GET /users – Fetches user list
- POST /users – Adds a new user (response is simulated, data is not persisted)
- PUT /users/:id – Updates user info (response is simulated)
- DELETE /users/:id – Deletes a user (response is simulated)

All data operations are simulated and performed optimistically on the local client.

## Error Handling & Validation
- Catches and displays API/network errors to users
- Validates all form fields before submission (including email format)

 ## Assumptions
- The mock API does not persist changes, so the UI is updated optimistically
- Department field is mocked, as JSONPlaceholder does not provide it
- User avatars are optional; fallback to initials if not provided

