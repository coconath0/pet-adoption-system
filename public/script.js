const API_URL = "http://127.0.0.1:8000";

// Fetch all pets
async function fetchAllPets() {
    try {
        const response = await fetch(`${API_URL}/pets`);
        const result = await response.json();

        if (!result.success) {
            alert('Error fetching pets: ' + result.message);
            return;
        }

        const petList = document.getElementById("pets");
        petList.innerHTML = '';

        if (result.data.length === 0) {
            petList.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No pets available</p>';
            return;
        }

        result.data.forEach(pet => {
            const card = document.createElement("div");
            card.className = "pet-card";
            const imageUrl = pet.imageUrl || 'https://via.placeholder.com/300?text=No+Image';
            card.innerHTML = `
                <img src="${imageUrl}" alt="${pet.name}" class="pet-card-image" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
                <div class="pet-card-info">
                    <div class="pet-card-name">${pet.name}</div>
                    <div class="pet-card-details">
                        <div class="pet-card-detail-line"><strong>Species:</strong> ${pet.species}</div>
                        <div class="pet-card-detail-line"><strong>Breed:</strong> ${pet.breed}</div>
                        <div class="pet-card-detail-line"><strong>Age:</strong> ${pet.age} years old</div>
                    </div>
                </div>
            `;
            petList.appendChild(card);
        });
    } catch (error) {
        alert('Failed to connect to server: ' + error.message);
    }
}

// Fetch details for a single pet
async function fetchPetDetails() {
    const name = document.getElementById("petName").value.trim();
    
    if (!name) {
        alert('Please enter a pet name');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/pets/${encodeURIComponent(name)}`);
        const result = await response.json();
        
        if (!result.success) {
            document.getElementById("pet-info").textContent = result.message;
            return;
        }
        
        const pet = result.data;
        document.getElementById("pet-info").innerHTML = `
            <div style="background: #f0f0f0; padding: 10px; border-radius: 5px;">
                <p><strong>Name:</strong> ${pet.name}</p>
                <p><strong>Species:</strong> ${pet.species}</p>
                <p><strong>Breed:</strong> ${pet.breed}</p>
                <p><strong>Age:</strong> ${pet.age} years old</p>
            </div>
        `;
        document.getElementById("petName").value = '';
    } catch (error) {
        alert('Error fetching pet details: ' + error.message);
    }
}

// Add new pet
async function addPet() {
    const name = document.getElementById("newPetName").value.trim();
    const species = document.getElementById("newPetSpecies").value.trim();
    const breed = document.getElementById("newPetBreed").value.trim();
    const age = parseInt(document.getElementById("newPetAge").value);
    const imageUrl = document.getElementById("newPetImage").value.trim();

    if (!name || !species || !breed || isNaN(age)) {
        alert('Please fill in all required fields with valid values');
        return;
    }

    const newPet = { name, species, breed, age };
    if (imageUrl) {
        newPet.imageUrl = imageUrl;
    }

    try {
        const response = await fetch(`${API_URL}/pets`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPet)
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            document.getElementById("newPetName").value = '';
            document.getElementById("newPetSpecies").value = '';
            document.getElementById("newPetBreed").value = '';
            document.getElementById("newPetAge").value = '';
            document.getElementById("newPetImage").value = '';
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        alert('Failed to add pet: ' + error.message);
    }
}

// Update pet details
async function updatePet() {
    const name = document.getElementById("updatePetName").value.trim();
    const species = document.getElementById("updatePetSpecies").value.trim();
    const breed = document.getElementById("updatePetBreed").value.trim();
    const age = parseInt(document.getElementById("updatePetAge").value);
    
    if (!name) {
        alert('Please enter a pet name to update');
        return;
    }
    
    const updatedPet = {};
    if (species) updatedPet.species = species;
    if (breed) updatedPet.breed = breed;
    if (!isNaN(age)) updatedPet.age = age;
    
    if (Object.keys(updatedPet).length === 0) {
        alert('Please enter at least one field to update');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/pets/${encodeURIComponent(name)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedPet)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            document.getElementById("updatePetName").value = '';
            document.getElementById("updatePetSpecies").value = '';
            document.getElementById("updatePetBreed").value = '';
            document.getElementById("updatePetAge").value = '';
            fetchAllPets();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        alert('Failed to update pet: ' + error.message);
    }
}

// Delete pet
async function deletePet() {
    const name = document.getElementById("deletePetName").value.trim();
    
    if (!name) {
        alert('Please enter a pet name to delete');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/pets/${encodeURIComponent(name)}`, {
            method: "DELETE"
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            document.getElementById("deletePetName").value = '';
            fetchAllPets();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        alert('Failed to delete pet: ' + error.message);
    }
}

// Load pets when page loads
document.addEventListener('DOMContentLoaded', fetchAllPets);
