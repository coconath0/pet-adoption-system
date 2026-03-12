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
            card.dataset.species = (pet.species || '').toLowerCase();
            card.dataset.breed = (pet.breed || '').toLowerCase();
            const imageUrl = pet.imageUrl || 'https://via.placeholder.com/300?text=No+Image';
            card.innerHTML = `
                <div class="pet-card-image-wrap">
                    <img src="${imageUrl}" alt="${pet.name}" class="pet-card-image" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
                </div>
                <div class="pet-card-info">
                    <div class="pet-card-name">${pet.name}</div>
                    <div class="pet-card-details">
                        <div class="pet-card-detail-line">${pet.species} • ${pet.breed}</div>
                        <div class="pet-card-detail-line">${pet.age} years old</div>
                    </div>
                </div>
            `;
            petList.appendChild(card);
        });

        // Reset and animate carousel after cards are in the DOM
        if (typeof carouselIndex !== 'undefined') {
            carouselIndex = 0;
            requestAnimationFrame(() => updateCarousel());
        }

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

// Add new pet (updated to handle file uploads)
document.getElementById('addPetForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const fileInput = document.getElementById('newPetImage');
    const urlInput = document.getElementById('newPetImageUrl');

    // If no file is selected but URL is provided, use the old JSON method
    if (!fileInput.files[0] && urlInput.value.trim()) {
        // Use JSON method for URL
        const newPet = {
            name: formData.get('name').trim(),
            species: formData.get('species').trim(),
            breed: formData.get('breed').trim(),
            age: parseInt(formData.get('age')),
            imageUrl: urlInput.value.trim()
        };

        if (!newPet.name || !newPet.species || !newPet.breed || isNaN(newPet.age)) {
            alert('Please fill in all required fields with valid values');
            return;
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
                this.reset();
                fetchAllPets();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            alert('Failed to add pet: ' + error.message);
        }
    } else if (fileInput.files[0]) {
        // Use FormData for file upload
        if (!formData.get('name').trim() || !formData.get('species').trim() || !formData.get('breed').trim() || !formData.get('age')) {
            alert('Please fill in all required fields with valid values');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/pets`, {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message);
                this.reset();
                fetchAllPets();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            alert('Failed to add pet: ' + error.message);
        }
    } else {
        alert('Please either select an image file or provide an image URL');
    }
});

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
