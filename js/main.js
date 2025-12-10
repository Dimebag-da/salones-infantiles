// Variables globales
let salones = [];
let filteredSalones = [];

// ✅ CORREGIDO: Función para esperar a que Firebase esté listo
function waitForFirebase() {
    return new Promise((resolve) => {
        const checkFirebase = () => {
            if (typeof appDatabase !== 'undefined' && appDatabase.db) {
                console.log('✅ Firebase está listo');
                resolve();
            } else {
                console.log('⏳ Esperando Firebase...');
                setTimeout(checkFirebase, 100);
            }
        };
        checkFirebase();
    });
}

// ✅ CORREGIDO: Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎬 DOM cargado - Iniciando aplicación');
    
    try {
        // Esperar a que Firebase esté listo
        await waitForFirebase();
        initializeApp();
    } catch (error) {
        console.error('❌ Error inicializando la aplicación:', error);
        showErrorState('Error inicializando: ' + error.message);
    }
});

function initializeApp() {
    console.log('🔄 Inicializando aplicación...');
    showLoadingState();
    
    setTimeout(() => {
        console.log('⏰ Timeout completado, cargando salones...');
        loadSalones();
        setupEventListeners();
    }, 300);
}

function showLoadingState() {
    const container = document.getElementById('salonesContainer');
    if (container) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <div class="spinner" style="width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff6b8b; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <p style="color: #666; font-size: 1.1rem;">Cargando salones...</p>
            </div>
        `;
    }
}

// ✅ CORREGIDO: MODIFICAR ESTA FUNCIÓN PARA FIREBASE (AHORA ES ASYNC)
async function loadSalones() {
    console.log('📥 Cargando salones...');
    
    try {
        if (typeof appDatabase === 'undefined') {
            throw new Error('appDatabase no está definido');
        }
        
        // ✅ CORREGIDO: Firebase es async - necesitamos await
        const salonesData = await appDatabase.getAllSalones();
        console.log('📊 Datos obtenidos de Firebase:', salonesData);
        
        if (!Array.isArray(salonesData)) {
            throw new Error('Los datos no son un array válido');
        }
        
        salones = salonesData;
        filteredSalones = [...salones];
        
        console.log('✅ Salones cargados:', salones.length);
        renderSalones();
        
    } catch (error) {
        console.error('❌ Error al cargar salones:', error);
        showErrorState('Error: ' + error.message);
    }
}

function showErrorState(message) {
    const container = document.getElementById('salonesContainer');
    if (container) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: white; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ff6b6b; margin-bottom: 20px;"></i>
                <h3 style="color: #ff6b6b; margin-bottom: 15px;">Error de carga</h3>
                <p style="color: #666; margin-bottom: 25px;">${escapeHtml(message)}</p>
                <button class="btn btn-primary" onclick="location.reload()" style="padding: 10px 20px; background: #ff6b8b; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-redo"></i> Recargar Página
                </button>
            </div>
        `;
    }
}

function renderSalones() {
    const container = document.getElementById('salonesContainer');
    
    console.log('🎨 Iniciando renderizado...');
    console.log('- Container:', container);
    console.log('- Salones a renderizar:', filteredSalones.length);
    
    if (!container) {
        console.error('❌ No se encontró el contenedor salonesContainer');
        return;
    }
    
    if (filteredSalones.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 4rem; color: #ccc; margin-bottom: 20px;"></i>
                <h3 style="color: #666; margin-bottom: 15px;">No se encontraron salones</h3>
                <p style="color: #999;">Intenta con otros términos de búsqueda</p>
            </div>
        `;
        return;
    }
    
    // Crear HTML de los salones
    container.innerHTML = filteredSalones.map(salon => {
        const averageRating = getAverageRating(salon);
        const reviewCount = salon.comments ? salon.comments.length : 0;
        const safeName = escapeHtml(salon.name);
        const safeDescription = escapeHtml(salon.description);
        const safeImage = escapeHtml(salon.image);
        const safeId = escapeHtml(salon.id.toString());
        
        return `
        <div class="salon-card" style="background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">
            <div class="gallery" style="position: relative; height: 200px; overflow: hidden;">
                <img src="${safeImage}" alt="${safeName}" 
                     class="gallery-image" 
                     style="width: 100%; height: 100%; object-fit: cover;"
                     onerror="this.src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'">
            </div>
            
            <div class="salon-content" style="padding: 20px;">
                <h3 class="salon-name" style="color: #ff6b8b; font-size: 1.5rem; margin: 0 0 10px 0; font-weight: 700;">
                    ${safeName}
                </h3>
                
                <p class="salon-description" style="color: #666; margin: 0 0 15px 0; font-size: 0.95rem; line-height: 1.5;">
                    ${safeDescription}
                </p>
                
                <div class="salon-rating" style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                    <div class="stars" style="color: #ffc107;">
                        ${generateStars(averageRating)}
                    </div>
                    <span class="rating-value" style="font-weight: 600; color: #333;">
                        ${averageRating}
                    </span>
                    <span class="review-count" style="color: #666; font-size: 0.9em;">
                        (${reviewCount} reseña${reviewCount !== 1 ? 's' : ''})
                    </span>
                </div>
                
                <div class="salon-actions" style="display: flex; gap: 10px;">
                    <button class="btn btn-primary" onclick="openComments('${safeId}')" style="flex: 1; padding: 10px; background: #ff6b8b; color: white; border: none; border-radius: 5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; transition: all 0.3s ease;">
                        <i class="fas fa-comments"></i> Comentarios
                    </button>
                    
                    <button class="btn btn-outline" 
                            onclick="viewSalonDetails('${safeId}')"
                            style="flex: 1; padding: 10px; background: transparent; color: #ff6b8b; border: 2px solid #ff6b8b; border-radius: 5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; transition: all 0.3s ease;">
                        <i class="fas fa-eye"></i> Ver Más
                    </button>
                    
                    <button class="btn btn-secondary" 
                            onclick="openInMaps('${safeId}')"
                            style="flex: 1; padding: 10px; background: #845ec2; color: white; border: none; border-radius: 5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; transition: all 0.3s ease;">
                        <i class="fas fa-map-marker-alt"></i> Maps
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    console.log('✅ Salones renderizados correctamente');
    
    // ✅✅✅ AGREGAR ESTO - FORZAR VISIBILIDAD
    if (container) {
        // Forzar estilos directamente en el contenedor
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
        container.style.gap = '20px';
        container.style.padding = '20px';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        container.style.backgroundColor = '#f5f5f5';
        container.style.border = '2px solid red'; // Para debug
    }
    
    // Forzar que las tarjetas se vean
    const cards = container.querySelectorAll('.salon-card');
    cards.forEach(card => {
        card.style.display = 'block';
        card.style.visibility = 'visible';
        card.style.opacity = '1';
        card.style.backgroundColor = 'white';
        card.style.border = '1px solid #ddd';
        card.style.borderRadius = '10px';
        card.style.padding = '15px';
        card.style.margin = '10px';
    });
    
    // Agregar estilos hover para las tarjetas
    const salonCards = container.querySelectorAll('.salon-card');
    salonCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Agregar estilos hover para los botones
    const buttons = container.querySelectorAll('.btn');
    buttons.forEach(button => {
        if (!button.style) return;
        
        button.addEventListener('mouseenter', function() {
            if (this.classList.contains('btn-primary')) {
                this.style.background = '#ff4d7a';
                this.style.transform = 'translateY(-2px)';
            } else if (this.classList.contains('btn-outline')) {
                this.style.background = '#ff6b8b';
                this.style.color = 'white';
                this.style.transform = 'translateY(-2px)';
            } else if (this.classList.contains('btn-secondary')) {
                this.style.background = '#6b4cb3';
                this.style.transform = 'translateY(-2px)';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            if (this.classList.contains('btn-primary')) {
                this.style.background = '#ff6b8b';
                this.style.transform = 'translateY(0)';
            } else if (this.classList.contains('btn-outline')) {
                this.style.background = 'transparent';
                this.style.color = '#ff6b8b';
                this.style.transform = 'translateY(0)';
            } else if (this.classList.contains('btn-secondary')) {
                this.style.background = '#845ec2';
                this.style.transform = 'translateY(0)';
            }
        });
    });
}

function setupEventListeners() {
    console.log('🔧 Configurando event listeners...');
    
    // Búsqueda en tiempo real
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            const cleanSearchTerm = SecuritySystem.sanitizeSearchInput(searchTerm);
            console.log('🔍 Búsqueda sanitizada:', { original: searchTerm, cleaned: cleanSearchTerm });
            
            filteredSalones = salones.filter(salon => 
                salon.name.toLowerCase().includes(cleanSearchTerm) ||
                salon.description.toLowerCase().includes(cleanSearchTerm)
            );
            renderSalones();
        });
    }
    
    // ✅✅✅ AGREGAR EVENT LISTENER PARA PRUEBAS DE SEGURIDAD (NUEVO)
    document.addEventListener('keydown', function(e) {
        // Ctrl+Shift+L para ver logs de seguridad
        if (e.ctrlKey && e.shiftKey && e.key === 'L') {
            e.preventDefault();
            SecuritySystem.showSecurityLogs();
            notifier.show('📋 Logs de seguridad mostrados en consola', 'info', 3000);
        }
    });
    
    // Modal de comentarios
    const modal = document.getElementById('commentsModal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            console.log('❌ Cerrando modal...');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Cerrar modal al hacer clic fuera del contenido
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            console.log('📌 Clic fuera del modal, cerrando...');
            if (modal) {
                modal.style.display = 'none';
            }
        }
    });

    // Botón de administración
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        // ✅ CORREGIDO: Mejor manejo del evento admin
        adminBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖱️ Clic en botón admin');
            
            if (typeof handleAdminAccess === 'function') {
                handleAdminAccess();
            } else {
                console.error('❌ handleAdminAccess no está disponible');
                if (typeof notifier !== 'undefined') {
                    notifier.show('Error: Módulo de admin no cargado', 'error', 3000);
                }
            }
        });
    }
}

// Función para cerrar modal desde cualquier lugar
function closeModal() {
    const modal = document.getElementById('commentsModal');
    if (modal) {
        console.log('🔒 Cerrando modal mediante función');
        modal.style.display = 'none';
    }
}

// Añadir estilos de animación
if (!document.querySelector('#app-styles')) {
    const style = document.createElement('style');
    style.id = 'app-styles';
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// ✅ CORREGIDO: viewSalonDetails para Firebase (AHORA ES ASYNC)
async function viewSalonDetails(salonId) {
    console.log('🔍 Abriendo detalles para salón:', salonId);
    
    try {
        const salones = await appDatabase.getAllSalones();
        const salon = salones.find(s => s.id.toString() === salonId.toString());
        
        if (!salon) {
            if (typeof notifier !== 'undefined') {
                notifier.show('Salón no encontrado', 'error');
            }
            return;
        }
        
        const modal = document.getElementById('commentsModal');
        const modalContent = document.getElementById('modalContent');
        
        if (!modal || !modalContent) return;
        
        const averageRating = getAverageRating(salon);
        const reviewCount = salon.comments ? salon.comments.length : 0;
        const safeName = escapeHtml(salon.name);
        const safeDescription = escapeHtml(salon.description);
        const safeImage = escapeHtml(salon.image);
        const safeId = escapeHtml(salonId.toString());
        
        modalContent.innerHTML = `
            <div style="position: relative;">
                <button onclick="closeModal()" style="position: absolute; right: 15px; top: 15px; background: rgba(255,255,255,0.9); border: none; font-size: 24px; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 100; transition: all 0.3s ease;">
                    &times;
                </button>
                
                <div style="padding: 20px; border-bottom: 1px solid #eee; background: linear-gradient(135deg, #ff6b8b, #845ec2); color: white; border-radius: 15px 15px 0 0; padding-top: 60px;">
                    <h2 style="margin: 0; font-size: 1.8rem;">${safeName}</h2>
                    <p style="margin: 5px 0 0; opacity: 0.9;">
                        <i class="fas fa-star" style="color: #ffc107;"></i> ${averageRating} • 
                        <i class="fas fa-comments"></i> ${reviewCount} reseñas
                    </p>
                </div>
            </div>
            
            <div style="padding: 20px; max-height: 70vh; overflow-y: auto;">
                <!-- Galería de imágenes -->
                <div style="margin-bottom: 20px;">
                    <img src="${safeImage}" alt="${safeName}" 
                         style="width: 100%; height: 250px; object-fit: cover; border-radius: 10px; margin-bottom: 10px;">
                    
                    ${salon.gallery && salon.gallery.length > 1 ? `
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px; margin-top: 10px;">
                            ${salon.gallery.map((img, index) => {
                                const safeImg = escapeHtml(img);
                                return `
                                <img src="${safeImg}" alt="Galería ${index + 1}" 
                                     style="width: 100%; height: 80px; object-fit: cover; border-radius: 5px; cursor: pointer; border: 2px solid transparent; transition: all 0.3s ease;"
                                     onmouseover="this.style.borderColor='#ff6b8b'; this.style.transform='scale(1.05)'" 
                                     onmouseout="this.style.borderColor='transparent'; this.style.transform='scale(1)'"
                                     onclick="this.closest('.modal-content').querySelector('img').src = '${safeImg}'">
                            `}).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <!-- Descripción -->
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #ff6b8b; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-info-circle"></i> Descripción
                    </h3>
                    <p style="line-height: 1.6; color: #555; background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 0;">
                        ${safeDescription}
                    </p>
                </div>
                
                <!-- Información de ubicación -->
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #ff6b8b; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-map-marker-alt"></i> Ubicación
                    </h3>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 3rem; color: #ff6b8b; margin-bottom: 10px;">
                            <i class="fas fa-map-pin"></i>
                        </div>
                        <p style="color: #666; margin-bottom: 15px; font-size: 1.1rem;">
                            Ubicación disponible en Google Maps
                        </p>
                        <button onclick="openInMaps('${safeId}')" 
                                style="padding: 12px 24px; background: linear-gradient(135deg, #845ec2, #6b4cb3); color: white; border: none; border-radius: 25px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s ease;"
                                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.2)'"
                                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                            <i class="fas fa-external-link-alt"></i> Ver en Google Maps
                        </button>
                    </div>
                </div>
                
                <!-- Acciones rápidas -->
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button onclick="closeModal(); setTimeout(() => openComments('${safeId}'), 300)" 
                            style="flex: 1; padding: 15px; background: linear-gradient(135deg, #ff6b8b, #ff4d7a); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s ease;"
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.2)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        <i class="fas fa-comment"></i> Dejar Reseña
                    </button>
                    
                    <button onclick="openInMaps('${safeId}')" 
                            style="flex: 1; padding: 15px; background: linear-gradient(135deg, #845ec2, #6b4cb3); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s ease;"
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.2)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        <i class="fas fa-directions"></i> Cómo Llegar
                    </button>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('❌ Error cargando detalles del salón:', error);
        if (typeof notifier !== 'undefined') {
            notifier.show('Error al cargar detalles', 'error');
        }
    }
}

// ✅ CORREGIDO: openInMaps para Firebase (AHORA ES ASYNC)
async function openInMaps(salonId) {
    try {
        const salones = await appDatabase.getAllSalones();
        const salon = salones.find(s => s.id.toString() === salonId.toString());
        
        if (salon && salon.lat && salon.lng) {
            window.open(`https://www.google.com/maps?q=${salon.lat},${salon.lng}`, '_blank');
        } else {
            if (typeof notifier !== 'undefined') {
                notifier.show('Ubicación no disponible', 'error');
            }
        }
    } catch (error) {
        console.error('❌ Error abriendo mapa:', error);
        if (typeof notifier !== 'undefined') {
            notifier.show('Error al abrir mapa', 'error');
        }
    }
}

// ✅ CORREGIDO: getAverageRating con mejor manejo de errores
function getAverageRating(salon) {
    if (!salon) return '0.0';
    
    if (salon.ratings && Array.isArray(salon.ratings) && salon.ratings.length > 0) {
        const validRatings = salon.ratings.filter(rating => typeof rating === 'number' && rating > 0);
        if (validRatings.length === 0) return '0.0';
        
        const sum = validRatings.reduce((total, rating) => total + rating, 0);
        const average = sum / validRatings.length;
        return average.toFixed(1);
    } 
    else if (salon.comments && Array.isArray(salon.comments) && salon.comments.length > 0) {
        const ratings = salon.comments
            .map(comment => comment.rating || 0)
            .filter(rating => typeof rating === 'number' && rating > 0);
            
        if (ratings.length === 0) return '0.0';
        
        const sum = ratings.reduce((total, rating) => total + rating, 0);
        const average = sum / ratings.length;
        return average.toFixed(1);
    }
    else {
        return '0.0';
    }
}

// ✅ CORREGIDO: generateStars con mejor manejo de errores
function generateStars(rating) {
    let numericRating;
    
    if (typeof rating === 'string') {
        numericRating = parseFloat(rating);
    } else if (typeof rating === 'number') {
        numericRating = rating;
    } else {
        numericRating = 0;
    }
    
    if (isNaN(numericRating) || numericRating === 0) {
        return '<span style="color: #999;">Sin calificaciones</span>';
    }
    
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= numericRating) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= numericRating) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// ✅ CORREGIDO: Función para escapar HTML (seguridad)
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ✅ AGREGAR FUNCIÓN DE DEBUG
function forceShow() {
    alert('Forzando visibilidad de salones...');
    
    const container = document.getElementById('salonesContainer');
    if (!container) {
        alert('No se encontró el contenedor');
        return;
    }
    
    // 1. Hacer el contenedor visible
    container.style.cssText = `
        display: grid !important;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
        gap: 20px !important;
        padding: 20px !important;
        background: #f5f5f5 !important;
        border: 3px solid red !important;
        visibility: visible !important;
        opacity: 1 !important;
    `;
    
    // 2. Contar cuántas tarjetas hay
    const cards = container.querySelectorAll('.salon-card');
    alert(`Se encontraron ${cards.length} salones`);
    
    // 3. Hacer cada tarjeta visible
    cards.forEach((card, index) => {
        card.style.cssText = `
            background: white !important;
            border: 2px solid #ff6b8b !important;
            border-radius: 10px !important;
            padding: 15px !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            margin: 10px !important;
        `;
    });
    
    // 4. Recargar si no hay tarjetas
    if (cards.length === 0) {
        if (confirm('No hay tarjetas. ¿Recargar datos?')) {
            location.reload();
        }
    }
}

// Hacer funciones globales
window.viewSalonDetails = viewSalonDetails;
window.openInMaps = openInMaps;
window.generateStars = generateStars;
window.getAverageRating = getAverageRating;
window.closeModal = closeModal;
window.loadSalones = loadSalones;
window.escapeHtml = escapeHtml;
window.forceShow = forceShow;

console.log('✅ Main.js cargado y corregido');