var map; // Variável global para o mapa
var markers = []; // Array para armazenar marcadores adicionados

// Função para inicializar o mapa
function initMap() {
    // Coordenadas iniciais do mapa
    map = L.map('mapid').setView([-18.9846, -49.4614], 13);

    // Adiciona camada do OpenStreetMap ao mapa
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Move os controles de zoom para o lado direito
    map.zoomControl.setPosition('topright');

    // Adiciona um evento de clique no mapa para adicionar marcadores
    map.on('click', function(event) {
        openInfoPopup(event.latlng); // Abre o popup para inserir informações do marcador
    });

    // Cria o menu de filtro
    createFilterMenu();
}

// Função para abrir o popup de informações
function openInfoPopup(coords) {
    var popupContent = `
        <div>
            <label>Forneça as informações do local</label>
            <input type="text" id="popupName" placeholder="Nome">
            <br>
            <input type="text" id="popupDescription" placeholder="Descrição">
            <br>
            <input type="text" id="popupAddress" placeholder="Endereço">
            <br>
            <input type="text" id="popupRouteUrl" placeholder="URL da Rota">
            <br>
            <label>Tipo:</label>
            <select id="popupType">
                <option value="Hospital">Hospital</option>
                <option value="UBS">UBS</option>
                <option value="Farmacia">Farmácia Pública</option>
                <option value="Abrigo">Abrigo</option>
                <option value="Reabilitação">Centro de Reabilitação</option>
                <!-- Adicione mais opções conforme necessário -->
            </select>
            <br>
            <label>Imagem:</label>
            <input type="file" id="popupImage">
            <br>
            <button onclick="saveMarkerInfo(${coords.lat}, ${coords.lng})">Salvar</button>
        </div>
    `;
    L.popup()
        .setLatLng(coords)
        .setContent(popupContent)
        .openOn(map);
}

// Função para salvar as informações do marcador
function saveMarkerInfo(lat, lng) {
    var name = document.getElementById('popupName').value;
    var description = document.getElementById('popupDescription').value;
    var address = document.getElementById('popupAddress').value;
    var routeUrl = document.getElementById('popupRouteUrl').value;
    var type = document.getElementById('popupType').value;
    var imageInput = document.getElementById('popupImage');
    var imageUrl = '';

    if (imageInput.files && imageInput.files[0]) {
        // Cria um objeto URL para o arquivo de imagem selecionado
        imageUrl = URL.createObjectURL(imageInput.files[0]);
    }

    if (!name) {
        alert('O nome é obrigatório para adicionar um marcador.');
        return;
    }

    // Cria e adiciona o marcador ao mapa
    var marker = L.marker([lat, lng]).addTo(map);
    marker.markerId = generateUniqueId(); // Gera um ID único para o marcador
    marker.name = name;
    marker.description = description;
    marker.address = address;
    marker.routeUrl = routeUrl; // Salva a URL da rota
    marker.type = type; // Salva o tipo do local
    marker.imageUrl = imageUrl; // Salva a URL da imagem
    marker.hasInfo = true; // Marca o marcador como tendo informações inseridas
    markers.push(marker); // Adiciona o marcador ao array de marcadores

    // Adiciona um popup ao marcador que exibe o nome
    marker.bindPopup(name);

    // Adiciona evento de clique para abrir o popup
    marker.on('click', function() {
        this.openPopup(); // Apenas abre o popup que exibe o nome do marcador
    });

    // Adiciona evento de duplo clique para remover o marcador
    marker.on('dblclick', function() {
        map.removeLayer(this); // Remove o marcador do mapa

        // Remove o marcador do array de marcadores
        var index = markers.indexOf(this);
        if (index !== -1) {
            markers.splice(index, 1);
        }
        removeCard(marker.markerId); // Remove o card associado
    });

    // Adiciona um card ao menu lateral
    addCard(marker.markerId, name, description, address, routeUrl, imageUrl);

    map.closePopup(); // Fecha o popup
}

// Função para adicionar um card ao menu lateral
function addCard(markerId, name, description, address, routeUrl, imageUrl) {
    var sidebar = document.getElementById('sidebar');
    var card = document.getElementById('card-' + markerId);
    if (card) {
        // Se o card já existir, atualiza o conteúdo
        card.innerHTML = `
            <h3>${name}</h3>
            <p><strong>Descrição:</strong> ${description}</p>
            <p><strong>Endereço:</strong> ${address}</p>
            ${imageUrl ? `<img src="${imageUrl}" alt="Imagem do marcador">` : ''}
            <button onclick="window.open('${routeUrl}', '_blank')">Obter Rota</button>
        `;
    } else {
        // Se o card não existir, cria um novo
        card = document.createElement('div');
        card.className = 'card';
        card.id = 'card-' + markerId;
        card.innerHTML = `
            <h3>${name}</h3>
            <p><strong>Descrição:</strong> ${description}</p>
            <p><strong>Endereço:</strong> ${address}</p>
            ${imageUrl ? `<img src="${imageUrl}" alt="Imagem do marcador">` : ''}
            <button onclick="window.open('${routeUrl}', '_blank')">Obter Rota</button>
        `;
        sidebar.appendChild(card);
    }
}

// Função para remover um card do menu lateral
function removeCard(markerId) {
    var card = document.getElementById('card-' + markerId);
    if (card) {
        card.remove();
    }
}

// Função para gerar um ID único para cada marcador
function generateUniqueId() {
    return 'marker-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Função para criar o menu de filtro
function createFilterMenu() {
    var sidebar = document.getElementById('sidebar');
    
    // Remove o menu de filtro existente, se houver
    var existingFilterMenu = document.querySelector('.filter-menu');
    if (existingFilterMenu) {
        existingFilterMenu.remove();
    }

    var filterMenu = document.createElement('div');
    filterMenu.className = 'filter-menu';
    filterMenu.innerHTML = `
        <label for="filterType">Filtrar por tipo:</label>
        <select id="filterType" onchange="filterMarkersByType(this.value)">
            <option value="Todos">Todos</option>
            <option value="Hospital">Hospital</option>
            <option value="UBS">UBS</option>
            <option value="Farmacia">Farmácia Pública</option>
            <option value="Abrigo">Abrigo</option>
            <option value="Reabilitação">Centro de Reabilitação</option>
            <!-- Adicione mais opções conforme necessário -->
        </select>
    `;
    sidebar.appendChild(filterMenu);
}

// Função para filtrar os marcadores por tipo
function filterMarkersByType(selectedType) {
    // Filtra e exibe os marcadores correspondentes ao tipo selecionado
    markers.forEach(marker => {
        var card = document.getElementById('card-' + marker.markerId);
        if (selectedType === 'Todos' || marker.type === selectedType) {
            // Adiciona ou mantém o card visível
            if (!card) {
                addCard(marker.markerId, marker.name, marker.description, marker.address, marker.routeUrl, marker.imageUrl);
            } else {
                card.style.display = 'block';
            }
        } else {
            // Oculta o card que não corresponde ao filtro
            if (card) {
                card.style.display = 'none';
            }
        }
    });
}

// Função para abrir o menu lateral
function openSidebar() {
    document.getElementById("sidebar").style.left = "0";
    document.getElementById("openSidebarBtn").style.left = "320px"; // Ajusta a posição do ícone quando o menu está aberto
}

// Função para fechar o menu lateral
function closeSidebar() {
    document.getElementById("sidebar").style.left = "-400px";
    document.getElementById("openSidebarBtn").style.left = "15px"; // Ajusta a posição do ícone quando o menu está fechado
}

// Função para alternar o menu lateral e o ícone sanduíche
function toggleSidebar(x) {
    x.classList.toggle("change");
    if (document.getElementById("sidebar").style.left === "0px") {
        closeSidebar();
    } else {
        openSidebar();
    }
}

// Chama a função para inicializar o mapa quando a página estiver carregada
document.addEventListener('DOMContentLoaded', initMap);
