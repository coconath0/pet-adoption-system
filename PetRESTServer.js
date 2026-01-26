const http = require('http');

// In-memory database for pets
const pets = new Map();

// Initialize with sample dogs
const initializeSamplePets = () => {
    pets.set('Max', {
        name: 'Max',
        species: 'Dog',
        breed: 'Golden Retriever',
        age: 3,
        imageUrl: 'https://www.vidavetcare.com/wp-content/uploads/sites/234/2022/04/golden-retriever-dog-breed-info.jpeg?w=300&h=300&fit=crop'
    });

    pets.set('Bella', {
        name: 'Bella',
        species: 'Dog',
        breed: 'Labrador',
        age: 2,
        imageUrl: 'https://www.vidavetcare.com/wp-content/uploads/sites/234/2022/04/labrador-retriever-dog-breed-info.jpeg?w=300&h=300&fit=crop'
    });

    pets.set('Charlie', {
        name: 'Charlie',
        species: 'Dog',
        breed: 'German Shepherd',
        age: 4,
        imageUrl: 'https://www.carecredit.com/sites/cc/image/german_shepherd_dog_guide.jpg?w=300&h=300&fit=crop'
    });

    pets.set('Daisy', {
        name: 'Daisy',
        species: 'Dog',
        breed: 'Beagle',
        age: 1,
        imageUrl: 'https://www.zooplus.ie/magazine/wp-content/uploads/2018/05/2-Jahre-Beagle-768x512.webp?w=300&h=300&fit=crop'
    });

    pets.set('Rocky', {
        name: 'Rocky',
        species: 'Dog',
        breed: 'Bulldog',
        age: 5,
        imageUrl: 'https://cdn.britannica.com/07/234207-050-0037B589/English-bulldog-dog.jpg?w=300&h=300&fit=crop'
    });
};

// Enable CORS headers
const setCORSHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
};

// Helper function to send JSON response
const sendJSON = (res, statusCode, data) => {
    res.writeHead(statusCode);
    res.end(JSON.stringify(data));
};

// GET /pets - Get all pets
const getAllPets = (res) => {
    const petsList = Array.from(pets.values());
    sendJSON(res, 200, { success: true, data: petsList });
};

// GET /pets/:name - Get pet by name
const getPetByName = (res, name) => {
    const decodedName = decodeURIComponent(name);
    const pet = pets.get(decodedName);

    if (pet) {
        sendJSON(res, 200, { success: true, data: pet });
    } else {
        sendJSON(res, 404, { success: false, message: `Pet named "${decodedName}" not found` });
    }
};

// POST /pets - Add a new pet
const addPet = (req, res) => {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const newPet = JSON.parse(body);

            if (!newPet.name || !newPet.species || !newPet.breed || newPet.age === undefined) {
                sendJSON(res, 400, {
                    success: false,
                    message: 'Missing required fields: name, species, breed, age'
                });
                return;
            }

            if (pets.has(newPet.name)) {
                sendJSON(res, 409, {
                    success: false,
                    message: `Pet named "${newPet.name}" already exists`
                });
                return;
            }

            // Set default image if not provided
            if (!newPet.imageUrl) {
                newPet.imageUrl = 'https://via.placeholder.com/300?text=No+Image';
            }

            pets.set(newPet.name, newPet);
            sendJSON(res, 201, {
                success: true,
                message: `Pet "${newPet.name}" added successfully`,
                data: newPet
            });
        } catch (error) {
            sendJSON(res, 400, {
                success: false,
                message: 'Invalid JSON in request body'
            });
        }
    });
};

// PUT /pets/:name - Update a pet
const updatePet = (req, res, name) => {
    const decodedName = decodeURIComponent(name);

    if (!pets.has(decodedName)) {
        sendJSON(res, 404, {
            success: false,
            message: `Pet named "${decodedName}" not found`
        });
        return;
    }

    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const updates = JSON.parse(body);
            const pet = pets.get(decodedName);
            if (updates.imageUrl) pet.imageUrl = updates.imageUrl;

            // Update only provided fields
            if (updates.species) pet.species = updates.species;
            if (updates.breed) pet.breed = updates.breed;
            if (updates.age !== undefined) pet.age = updates.age;

            sendJSON(res, 200, {
                success: true,
                message: `Pet "${decodedName}" updated successfully`,
                data: pet
            });
        } catch (error) {
            sendJSON(res, 400, {
                success: false,
                message: 'Invalid JSON in request body'
            });
        }
    });
};

// DELETE /pets/:name - Delete a pet
const deletePet = (res, name) => {
    const decodedName = decodeURIComponent(name);

    if (pets.has(decodedName)) {
        pets.delete(decodedName);
        sendJSON(res, 200, {
            success: true,
            message: `Pet "${decodedName}" deleted successfully`
        });
    } else {
        sendJSON(res, 404, {
            success: false,
            message: `Pet named "${decodedName}" not found`
        });
    }
};

// Request handler
const requestHandler = (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    setCORSHeaders(res);

    // Handle OPTIONS request for CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Route: GET /pets
    if (method === 'GET' && pathname === '/pets') {
        getAllPets(res);
    }

    // Route: GET /pets/:name
    else if (method === 'GET' && pathname.startsWith('/pets/')) {
        const name = pathname.slice(6); // Remove '/pets/' prefix
        getPetByName(res, name);
    }

    // Route: POST /pets
    else if (method === 'POST' && pathname === '/pets') {
        addPet(req, res);
    }

    // Route: PUT /pets/:name
    else if (method === 'PUT' && pathname.startsWith('/pets/')) {
        const name = pathname.slice(6); // Remove '/pets/' prefix
        updatePet(req, res, name);
    }

    // Route: DELETE /pets/:name
    else if (method === 'DELETE' && pathname.startsWith('/pets/')) {
        const name = pathname.slice(6); // Remove '/pets/' prefix
        deletePet(res, name);
    }

    // 404 Not Found
    else {
        sendJSON(res, 404, {
            success: false,
            message: 'Endpoint not found'
        });
    }
};

// Create server
const PORT = 8000;
const server = http.createServer(requestHandler);

// Initialize sample pets
initializeSamplePets();

// Start server
server.listen(PORT, () => {
    console.log(`🐾 Pet REST Server running at http://localhost:${PORT}`);
    console.log(`📋 Initial pets loaded: ${pets.size}`);
});
