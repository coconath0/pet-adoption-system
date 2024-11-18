const URL = "http://127.0.0.1:8000";

// Fetch all pets
async function fetchAllPets() {
    const response = await fetch(URL);
    const pets = await response.json();
    const petList = document.getElementById("pets");
    petList.innerHTML = '';
    pets.forEach(pet => {
        const listItem = document.createElement("li");
        listItem.textContent = pet;
        petList.appendChild(listItem);
    });
}

// Fetch details for a single pet
async function fetchPetDetails() {
    const name = document.getElementById("petName").value;
    const response = await fetch(`${URL}/${name}`);
    const petInfo = await response.json();
    document.getElementById("pet-info").textContent = JSON.stringify(petInfo, null, 2);
}

// Add new pet
async function addPet() {
    const name = document.getElementById("newPetName").value;
    const species = document.getElementById("newPetSpecies").value;
    const breed = document.getElementById("newPetBreed").value;
    const age = parseInt(document.getElementById("newPetAge").value);
    const newPet = { species, breed, age };

    const response = await fetch(`${URL}/${name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPet)
    });
    alert(await response.text());
    fetchAllPets();
}

// Update details
async function updatePet() {
    const name = document.getElementById("updatePetName").value;
    const species = document.getElementById("updatePetSpecies").value;
    const breed = document.getElementById("updatePetBreed").value;
    const age = parseInt(document.getElementById("updatePetAge").value);
    const updatedPet = { species, breed, age };

    const response = await fetch(`${URL}/${name}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPet)
    });
    alert(await response.text());
    fetchAllPets();
}

// Delete pet
async function deletePet() {
    const name = document.getElementById("deletePetName").value;
    const response = await fetch(`${URL}/${name}`, { method: "DELETE" });
    alert(await response.text());
    fetchAllPets();
}
