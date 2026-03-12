const http = require('http');
const fs = require('fs');
const path = require('path');

// In-memory database for pets
let pets = {};

// File path for persistence
const PETS_FILE = 'pets.json';

// Directory for uploaded images
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Load pets from file
const loadPets = () => {
    try {
        if (fs.existsSync(PETS_FILE)) {
            const data = fs.readFileSync(PETS_FILE, 'utf8');
            pets = JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading pets from file:', error);
    }
};

// Save pets to file
const savePets = () => {
    try {
        fs.writeFileSync(PETS_FILE, JSON.stringify(pets, null, 2));
    } catch (error) {
        console.error('Error saving pets to file:', error);
    }
};

// Parse multipart form data for file uploads
const parseMultipart = (req, callback) => {
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=([^;]+)/);
    if (!boundaryMatch) {
        callback(new Error('No boundary found in multipart form'));
        return;
    }

    const boundary = boundaryMatch[1];
    let body = Buffer.alloc(0);

    req.on('data', chunk => {
        body = Buffer.concat([body, chunk]);
    });

    req.on('end', () => {
        try {
            const bodyStr = body.toString();
            // Split by boundary and filter out empty parts
            const boundaryDelimiter = '--' + boundary;
            const parts = bodyStr.split(boundaryDelimiter).filter(part =>
                part.trim() && part !== '--' && part !== '--\r\n'
            );

            const fields = {};
            let fileData = null;
            let fileName = null;
            let fileType = null;

            for (const part of parts) {
                const lines = part.trim().split('\r\n');
                let dispositionLine = null;
                let contentTypeLine = null;
                let contentStartIndex = -1;

                // Parse headers
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.startsWith('Content-Disposition:')) {
                        dispositionLine = line;
                    } else if (line.startsWith('Content-Type:')) {
                        contentTypeLine = line;
                    } else if (line.trim() === '') {
                        // Empty line marks start of content
                        contentStartIndex = i + 1;
                        break;
                    }
                }

                if (dispositionLine) {
                    // Parse disposition header
                    const filenameMatch = dispositionLine.match(/filename="([^"]*)"/);
                    const nameMatch = dispositionLine.match(/name="([^"]*)"/);

                    if (filenameMatch && nameMatch[1] === 'imageFile') {
                        // This is a file part
                        fileName = filenameMatch[1];
                        if (contentTypeLine) {
                            fileType = contentTypeLine.split(':')[1].trim();
                        }

                        if (contentStartIndex !== -1) {
                            // Extract file content (everything after headers until next boundary)
                            const contentLines = [];
                            for (let k = contentStartIndex; k < lines.length; k++) {
                                const line = lines[k];
                                // Stop at the next boundary
                                if (line.includes('--' + boundary)) {
                                    break;
                                }
                                contentLines.push(line);
                            }
                            // Remove the last line if it's empty
                            if (contentLines[contentLines.length - 1] === '') {
                                contentLines.pop();
                            }
                            fileData = Buffer.from(contentLines.join('\r\n'), 'binary');
                        }
                    } else if (nameMatch) {
                        // This is a regular field
                        const fieldName = nameMatch[1];

                        if (contentStartIndex !== -1) {
                            // Extract field value
                            const valueLines = [];
                            for (let k = contentStartIndex; k < lines.length; k++) {
                                const line = lines[k];
                                // Stop at the next boundary
                                if (line.includes('--' + boundary)) {
                                    break;
                                }
                                valueLines.push(line);
                            }
                            // Remove the last line if it's empty
                            if (valueLines[valueLines.length - 1] === '') {
                                valueLines.pop();
                            }
                            fields[fieldName] = valueLines.join('\r\n').trim();
                        }
                    }
                }
            }

            callback(null, { fields, fileData, fileName, fileType });
        } catch (error) {
            console.error('Parse error:', error);
            callback(error);
        }
    });
};

// Initialize with sample dogs (only if no pets loaded from file)
const initializeSamplePets = () => {
    // Load existing pets first
    loadPets();

    // Only add samples if no pets exist
    if (Object.keys(pets).length === 0) {
        pets['Max'] = {
            name: 'Max',
            species: 'Dog',
            breed: 'Golden Retriever',
            age: 3,
            imageUrl: 'https://www.vidavetcare.com/wp-content/uploads/sites/234/2022/04/golden-retriever-dog-breed-info.jpeg?w=300&h=300&fit=crop'
        };

        pets['Bella'] = {
            name: 'Bella',
            species: 'Dog',
            breed: 'Labrador',
            age: 2,
            imageUrl: 'https://www.vidavetcare.com/wp-content/uploads/sites/234/2022/04/labrador-retriever-dog-breed-info.jpeg?w=300&h=300&fit=crop'
        };

        pets['Charlie'] = {
            name: 'Charlie',
            species: 'Dog',
            breed: 'German Shepherd',
            age: 4,
            imageUrl: 'https://www.carecredit.com/sites/cc/image/german_shepherd_dog_guide.jpg?w=300&h=300&fit=crop'
        };

        pets['Daisy'] = {
            name: 'Daisy',
            species: 'Dog',
            breed: 'Beagle',
            age: 1,
            imageUrl: 'https://www.zooplus.ie/magazine/wp-content/uploads/2018/05/2-Jahre-Beagle-768x512.webp?w=300&h=300&fit=crop'
        };

        pets['Rocky'] = {
            name: 'Rocky',
            species: 'Dog',
            breed: 'Bulldog',
            age: 5,
            imageUrl: 'https://cdn.britannica.com/07/234207-050-0037B589/English-bulldog-dog.jpg?w=300&h=300&fit=crop'
        };

        savePets(); // Save initial pets to file
    }
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
    const petsList = Object.values(pets);
    sendJSON(res, 200, { success: true, data: petsList });
};

// GET /pets/:name - Get pet by name
const getPetByName = (res, name) => {
    const decodedName = decodeURIComponent(name);
    const pet = pets[decodedName];

    if (pet) {
        sendJSON(res, 200, { success: true, data: pet });
    } else {
        sendJSON(res, 404, { success: false, message: `Pet named "${decodedName}" not found` });
    }
};

// POST /pets - Add a new pet
const addPet = (req, res) => {
    const contentType = req.headers['content-type'] || '';

    if (contentType.includes('multipart/form-data')) {
        // Handle file upload
        parseMultipart(req, (error, result) => {
            if (error) {
                console.error('Multipart parse error:', error);
                sendJSON(res, 400, { success: false, message: 'Error parsing form data: ' + error.message });
                return;
            }

            const { fields, fileData, fileName, fileType } = result;

            console.log('Parsed fields:', fields);
            console.log('File info:', { fileName, fileType, hasData: !!fileData });

            if (!fields.name || !fields.species || !fields.breed || !fields.age) {
                sendJSON(res, 400, {
                    success: false,
                    message: 'Missing required fields: name, species, breed, age'
                });
                return;
            }

            if (pets[fields.name]) {
                sendJSON(res, 409, {
                    success: false,
                    message: `Pet named "${fields.name}" already exists`
                });
                return;
            }

            const newPet = {
                name: fields.name,
                species: fields.species,
                breed: fields.breed,
                age: parseInt(fields.age)
            };

            // Handle image upload
            if (fileData && fileName) {
                const ext = path.extname(fileName);
                const safeName = fields.name.replace(/[^a-zA-Z0-9]/g, '_');
                const filePath = path.join(UPLOAD_DIR, `${safeName}_${Date.now()}${ext}`);

                try {
                    fs.writeFileSync(filePath, fileData);
                    newPet.imageUrl = `http://127.0.0.1:8000/uploads/${path.basename(filePath)}`;
                    console.log('File saved to:', filePath);
                } catch (error) {
                    console.error('Error saving image:', error);
                    newPet.imageUrl = 'https://via.placeholder.com/300?text=No+Image';
                }
            } else {
                newPet.imageUrl = fields.imageUrl || 'https://via.placeholder.com/300?text=No+Image';
            }

            pets[fields.name] = newPet;
            savePets();
            console.log('Pet added successfully:', newPet);
            sendJSON(res, 201, {
                success: true,
                message: `Pet "${fields.name}" added successfully`,
                data: newPet
            });
        });
    } else {
        // Handle JSON request (existing functionality)
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

                if (pets[newPet.name]) {
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

                pets[newPet.name] = newPet;
                savePets(); // Save to file
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
    }
};

// PUT /pets/:name - Update a pet
const updatePet = (req, res, name) => {
    const decodedName = decodeURIComponent(name);

    if (!pets[decodedName]) {
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
            const pet = pets[decodedName];
            if (updates.imageUrl) pet.imageUrl = updates.imageUrl;

            // Update only provided fields
            if (updates.species) pet.species = updates.species;
            if (updates.breed) pet.breed = updates.breed;
            if (updates.age !== undefined) pet.age = updates.age;

            savePets(); // Save to file
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

    if (pets[decodedName]) {
        delete pets[decodedName];
        savePets(); // Save to file
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
    try {
        console.log(`Incoming request: ${req.method} ${req.url}`);
        console.log('Headers:', JSON.stringify(req.headers, null, 2));

        const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
        const pathname = parsedUrl.pathname;
        const method = req.method;

        console.log(`Parsed URL: ${pathname}`);

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
            console.log('Routing to addPet');
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

        // Route: GET /uploads/* - Serve uploaded images
        else if (method === 'GET' && pathname.startsWith('/uploads/')) {
            const fileName = pathname.slice(9); // Remove '/uploads/' prefix
            const filePath = path.join(UPLOAD_DIR, fileName);

            console.log(`Serving image: ${fileName}, full path: ${filePath}`);

            if (fs.existsSync(filePath)) {
                const ext = path.extname(filePath).toLowerCase();
                const mimeTypes = {
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.png': 'image/png',
                    '.gif': 'image/gif',
                    '.webp': 'image/webp'
                };

                const contentType = mimeTypes[ext] || 'application/octet-stream';
                console.log(`File exists, content-type: ${contentType}, size: ${fs.statSync(filePath).size} bytes`);

                try {
                    const fileContent = fs.readFileSync(filePath);
                    console.log(`File read successfully, sending ${fileContent.length} bytes`);
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(fileContent);
                    console.log('Image sent successfully');
                } catch (error) {
                    console.error('Error reading file:', error);
                    sendJSON(res, 500, { success: false, message: 'Error reading file' });
                }
            } else {
                console.log(`File not found: ${filePath}`);
                sendJSON(res, 404, { success: false, message: 'File not found' });
            }
        }

        // 404 Not Found
        else {
            sendJSON(res, 404, {
                success: false,
                message: 'Endpoint not found'
            });
        }
    } catch (error) {
        console.error('Unhandled error in request handler:', error);
        try {
            sendJSON(res, 500, { success: false, message: 'Internal server error' });
        } catch (e) {
            // If sendJSON fails, try basic response
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Internal server error' }));
        }
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
    console.log(`📋 Pets loaded: ${Object.keys(pets).length}`);
});
