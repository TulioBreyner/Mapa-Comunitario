var map;
var markers = [];

// Função para inicializar o mapa
function initMap() {
    // Coordenadas iniciais do mapa
    map = L.map('mapid').setView([-18.9846, -49.4614], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Controles de zoom no lado direito
    map.zoomControl.setPosition('topright');

    map.on('click', function(event) {
        openInfoPopup(event.latlng);
    });

    createFilterMenu();

    // Adiciona o listener para a busca por nome
    document.getElementById('searchInput').addEventListener('input', function() {
        filterMarkersByName(this.value);
    });
}

// Função para abrir o popup de informações ao clicar no mapa
// Está comentada para garantir que o usuario não consiga adicionar locais localmente, já que não ficará salvo
/*
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
// Está comentada para garantir que o usuario não consiga adicionar locais localmente, já que não ficará salvo
function saveMarkerInfo(lat, lng) {
    var name = document.getElementById('popupName').value;
    var description = document.getElementById('popupDescription').value;
    var address = document.getElementById('popupAddress').value;
    var routeUrl = document.getElementById('popupRouteUrl').value;
    var type = document.getElementById('popupType').value;
    var imageInput = document.getElementById('popupImage');
    var imageUrl = '';

    if (imageInput.files && imageInput.files[0]) {
        imageUrl = URL.createObjectURL(imageInput.files[0]);
    }

    if (!name) {
        alert('O nome é obrigatório para adicionar um marcador.');
        return;
    }

    var marker = L.marker([lat, lng]).addTo(map);
    marker.markerId = generateUniqueId();
    marker.name = name;
    marker.description = description;
    marker.address = address;
    marker.routeUrl = routeUrl;
    marker.type = type;
    marker.imageUrl = imageUrl;
    marker.hasInfo = true;
    markers.push(marker);

    marker.bindPopup(name);

    marker.on('click', function() {
        this.openPopup();
    });

    marker.on('dblclick', function() {
        map.removeLayer(this);

        var index = markers.indexOf(this);
        if (index !== -1) {
            markers.splice(index, 1);
        }
        removeCard(marker.markerId);
    });

    addCard(marker.markerId, name, description, address, routeUrl, imageUrl);

    map.closePopup();
}
*/

// Função para adicionar cards ao menu lateral
function addCard(markerId, name, description, address, routeUrl, imageUrl) {
    var sidebar = document.getElementById('sidebar');
    var card = document.getElementById('card-' + markerId);
    if (card) {
        card.innerHTML = `
            <h3>${name}</h3>
            <p><strong>Descrição:</strong> ${description}</p>
            <p><strong>Endereço:</strong> ${address}</p>
            ${imageUrl ? `<img src="${imageUrl}" alt="Imagem do marcador">` : ''}
            <button onclick="window.open('${routeUrl}', '_blank')">Obter Rota</button>
        `;
    } else {
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

// Função para remover cards do menu lateral
function removeCard(markerId) {
    var card = document.getElementById('card-' + markerId);
    if (card) {
        card.remove();
    }
}

// Função para gerar IDs únicos
function generateUniqueId() {
    return 'marker-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Função para criar o menu de filtros
function createFilterMenu() {
    var sidebar = document.getElementById('sidebar');

    // Remove o menu de filtro existente
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
            <option value="PostoSaude">Posto de saúde</option>
            <option value="Farmacia">Farmácia</option>
            <option value="CentroApoio">Centro de Apoio</option>
            <option value="Reabilitação">Centro de Reabilitação</option>
            <option value="AssistenciaPublica">Assistência pública</option>
            <option value="Outros">Outros</option>
        </select>
    `;
    sidebar.appendChild(filterMenu);
}

// Função para filtrar os marcadores por tipo
function filterMarkersByType(selectedType) {
    markers.forEach(marker => {
        var card = document.getElementById('card-' + marker.markerId);
        if (selectedType === 'Todos' || marker.type === selectedType) {
            if (!card) {
                addCard(marker.markerId, marker.name, marker.description, marker.address, marker.routeUrl, marker.imageUrl);
            } else {
                card.style.display = 'block';
            }
            marker.addTo(map);  // Exibe o marcador no mapa
        } else {
            if (card) {
                card.style.display = 'none';
            }
            map.removeLayer(marker);  // Remove o marcador do mapa
        }
    });
}


// Função para abrir o menu lateral
function openSidebar() {
    document.getElementById("sidebar").style.left = "0";
    document.getElementById("openSidebarBtn").style.left = "320px";
}

// Função para fechar o menu lateral
function closeSidebar() {
    document.getElementById("sidebar").style.left = "-400px";
    document.getElementById("openSidebarBtn").style.left = "15px";
}

// Função para alternar o estado do menu lateral
function toggleSidebar(x) {
    x.classList.toggle("change");
    if (document.getElementById("sidebar").style.left === "0px") {
        closeSidebar();
    } else {
        openSidebar();
    }
}

// Função para carregar os marcadores a partir do JSON
function loadMarkers() {
    fetch('marcadores.json')
        .then(response => response.json())
        .then(data => {
            data.marcadores.forEach(marcador => {
                // Adiciona cada marcador ao mapa
                var marker = L.marker([marcador.lat, marcador.lng]).addTo(map);
                marker.markerId = generateUniqueId();
                marker.name = marcador.nome;
                marker.description = marcador.descricao;
                marker.address = marcador.endereco;
                marker.routeUrl = marcador.urlRota;
                marker.type = marcador.tipo;
                marker.hasInfo = true;

                // Adiciona um popup ao marcador que exibe o nome
                marker.bindPopup(marcador.nome);

                // Adiciona evento de clique para abrir o popup
                marker.on('click', function() {
                    this.openPopup();
                });

                // Adiciona o marcador ao array de marcadores
                markers.push(marker);

                // Adiciona um card ao menu lateral
                addCard(marker.markerId, marcador.nome, marcador.descricao, marcador.endereco, marcador.urlRota, marcador.imagem);
            });
        })
        .catch(error => console.error('Erro ao carregar o JSON:', error));
}

// Função para filtrar marcadores por nome
function filterMarkersByName(searchText) {
    markers.forEach(marker => {
        var card = document.getElementById('card-' + marker.markerId);
        if (marker.name.toLowerCase().includes(searchText.toLowerCase())) {
            if (!card) {
                addCard(marker.markerId, marker.name, marker.description, marker.address, marker.routeUrl, marker.imageUrl);
            } else {
                card.style.display = 'block';
            }
            marker.addTo(map);  // Exibe o marcador no mapa
        } else {
            if (card) {
                card.style.display = 'none';
            }
            map.removeLayer(marker);  // Remove o marcador do mapa
        }
    });
}

// Chama a função para inicializar o mapa e carregar os marcadores ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    loadMarkers();
});