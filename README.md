# 🐾 Pet Adoption System 🐾

A full-stack Pet Adoption platform built with vanilla JavaScript, featuring a pure Node.js REST API backend and a modern, responsive frontend. This project demonstrates CRUD operations, REST API design, and interactive UI development without external frameworks.

## Features

### Backend (REST API)
- **RESTful API Endpoints**: Full CRUD operations for pet management
  - `GET /pets` - Retrieve all available pets
  - `GET /pets/:name` - Get specific pet details
  - `POST /pets` - Add new pets with image URLs
  - `PUT /pets/:name` - Update pet information
  - `DELETE /pets/:name` - Remove pets from adoption
- **In-Memory Data Storage**: Uses JavaScript `Map` for fast data access
- **CORS Support**: Seamless cross-origin requests for frontend-backend integration
- **Pet Attributes Stored**:
  - Name
  - Species (Dogs, Cats, etc.)
  - Breed
  - Age
  - Image URL

### Frontend
- **Responsive Grid Layout**: Pet cards displayed side-by-side in a beautiful square grid
- **Pet Images**: Display pet photos with fallback placeholders
- **Interactive Sections**:
  - View all available pets for adoption
  - Search for specific pets by name
  - Add new pets with image URLs
  - Update existing pet details
  - Delete pets from the system
- **Modern Design**: 
  - Custom CSS styling with smooth transitions and hover effects
  - Google Fonts integration (Roboto)
  - Color-coordinated UI with professional palette
  - Mobile-friendly responsive design

## Getting Started

### Prerequisites
- Node.js installed on your machine
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A code editor (VS Code recommended)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/coconath0/pet-adoption-system.git
   cd pet-adoption-system
   ```

2. **Start the REST API server:**
   ```bash
   node PetRESTServer.js
   ```
   You should see:
   ```
   🐾 Pet REST Server running at http://localhost:8000
   📋 Initial pets loaded: 5
   ```

3. **Open the frontend:**
   - Use VS Code Live Server extension (or any local server)
   - Navigate to `http://127.0.0.1:5500/public/pet.html` (or your local server port)
   - The page will automatically load the pet list on page load

4. **Start adopting!**

## Project Structure

```
pet-adoption-system/
├── PetRESTServer.js          # Node.js REST API backend
├── public/
│   ├── pet.html              # Main HTML interface
│   ├── script.js             # Frontend JavaScript logic
│   └── styles.css            # Styling and responsive design
└── README.md                 # This file
```

## API Endpoints Reference

### Get All Pets
```bash
GET http://127.0.0.1:8000/pets
```
Response:
```json
{
  "success": true,
  "data": [
    {
      "name": "Max",
      "species": "Dog",
      "breed": "Golden Retriever",
      "age": 3,
      "imageUrl": "https://..."
    }
  ]
}
```

### Get Pet by Name
```bash
GET http://127.0.0.1:8000/pets/Max
```

### Add New Pet
```bash
POST http://127.0.0.1:8000/pets
Content-Type: application/json

{
  "name": "Rossy",
  "species": "Cat",
  "breed": "Persian",
  "age": 2,
  "imageUrl": "https://example.com/cat.jpg"
}
```

### Update Pet Details
```bash
PUT http://127.0.0.1:8000/pets/Max
Content-Type: application/json

{
  "breed": "Golden Doodle",
  "age": 4,
  "imageUrl": "https://example.com/newimage.jpg"
}
```

### Delete Pet
```bash
DELETE http://127.0.0.1:8000/pets/Max
```

## Customization 🎨 

### Adding Custom Images
When adding a new pet, simply paste a valid image URL in the "Image URL" field. The system will display any valid image URL from the internet.

### Styling
All styles are in `public/styles.css`. Key color scheme:
- Primary: `#f1642e` (Orange - headings)
- Secondary: `#f7c050` (Gold - subheadings)
- Background: `#fdfbe2` (Light cream)
- Button: `#a3b565` (Sage green)

## Future Enhancements~

- **AI-Powered Chat Agent**: Ask natural language questions like:
  - "How many dogs are available?"
  - "Show me all cats under 3 years old"
  - "What breeds do you have?"
  
- **Database Integration**: 
  - Migrate from in-memory storage to **MongoDB** for persistent data
  - User authentication and adoption history tracking
  
- **Advanced Features**:
  - User registration and login system
  - Favorites/wishlist functionality
  - Adoption application forms
  - Admin dashboard for pet management
  - Image upload functionality (instead of URLs)
  - Email notifications for new pets matching user preferences
  - Pet matching algorithm based on user preferences

- **AI/ML Components**:
  - Recommend pets based on user lifestyle
  - Chatbot powered by OpenAI API for FAQs
  - Image recognition for automatic breed identification

## Data Persistence Note

Currently, the application uses in-memory storage. **Data resets when the server restarts.** For a production application, you would need to integrate a database like MongoDB to persist data across sessions.

## Tech Stack 🛠️ 

- **Backend**: Node.js (pure HTTP module, no Express)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **API**: RESTful architecture
- **Styling**: Custom CSS with responsive grid layout
- **Fonts**: Google Fonts (Roboto)

## Contributing

Feel free to fork this project and submit pull requests for any improvements!

## License

This project is open source and available under the MIT License.

## Contact

For questions or suggestions, feel free to reach out or open an issue on GitHub! ~ 🌸