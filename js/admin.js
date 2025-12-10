// Panel de Administración - Versión CORREGIDA
let isAdmin = false;
let adminSessionTimeout = null;
const ADMIN_SESSION_DURATION = 30 * 60 * 1000; // 30 minutos

// Inicializar panel de admin
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
    checkExistingSession();
});

function initializeAdminPanel() {
    const adminBtn = document.getElementById('adminBtn');
    const closeAdminBtn = document.getElementById('closeAdminBtn');
    const addSalonBtn = document.getElementById('addSalonBtn');
    const refreshDataBtn = document.getElementById('refreshDataBtn');
    const resetDataBtn = document.getElementById('resetDataBtn');
    
    if (adminBtn) {
        adminBtn.addEventListener('click', handleAdminAccess);
    }
    
    if (closeAdminBtn) {
        closeAdminBtn.addEventListener('click', closeAdminPanel);
    }
    
    if (addSalonBtn) {
        addSalonBtn.addEventListener('click', showAddSalonForm);
    }
    
    if (refreshDataBtn) {
        refreshDataBtn.addEventListener('click', refreshData);
    }
    
    if (resetDataBtn) {
        resetDataBtn.addEventListener('click', resetData);
    }
}

// Verificar si hay sesión activa
function checkExistingSession() {
    const session = localStorage.getItem('adminSession');
    if (session) {
        try {
            const sessionData = JSON.parse(session);
            if (sessionData.expires > Date.now()) {
                isAdmin = true;
                updateAdminUI();
                startSessionTimer();
            } else {
                localStorage.removeItem('adminSession');
            }
        } catch (error) {
            console.error('❌ Error parseando sesión:', error);
            localStorage.removeItem('adminSession');
        }
    }
}

// Manejar acceso de admin
function handleAdminAccess() {
    console.log('🔐 Intentando acceso admin, estado:', isAdmin);
    
    if (isAdmin) {
        openAdminPanel();
    } else {
        showAdminLoginModal();
        
        setTimeout(() => {
            const passwordInput = document.getElementById('adminPasswordInput');
            if (passwordInput) {
                passwordInput.focus();
                passwordInput.select();
            }
        }, 100);
    }
}

// Mostrar modal de login elegante
function showAdminLoginModal() {
    // Verificar si ya existe el modal
    if (document.getElementById('adminLoginModal')) {
        return;
    }

    const modalHTML = `
        <div class="modal-overlay" id="adminLoginModal">
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <div style="padding: 30px 20px;">
                    <div style="font-size: 3rem; color: var(--primary-color); margin-bottom: 15px;">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h3 style="color: var(--dark-color); margin-bottom: 10px;">Acceso Administrador</h3>
                    <p style="color: #666; margin-bottom: 25px;">Ingrese la contraseña para continuar</p>
                    
                    <div class="form-group">
                        <input type="password" 
                               id="adminPasswordInput" 
                               class="form-control" 
                               placeholder="Contraseña de administrador"
                               style="text-align: center; font-size: 1.1rem; padding: 12px;"
                               onkeypress="handleAdminPasswordKeypress(event)">
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 25px;">
                        <button class="btn btn-primary" onclick="verifyAdminCredentials()" 
                                style="flex: 1; padding: 12px;">
                            <i class="fas fa-sign-in-alt"></i> Ingresar
                        </button>
                        <button class="btn btn-secondary" onclick="closeAdminLoginModal()" 
                                style="flex: 1; padding: 12px;">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                    
                    <div id="loginError" style="color: var(--danger-color); margin-top: 15px; display: none;">
                        <i class="fas fa-exclamation-circle"></i> Contraseña incorrecta
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    setTimeout(() => {
        const passwordInput = document.getElementById('adminPasswordInput');
        if (passwordInput) {
            passwordInput.focus();
        }
    }, 100);
    
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAdminLoginModal();
            }
        });
    }
}

// Manejar tecla Enter en el input de contraseña
function handleAdminPasswordKeypress(event) {
    if (event.key === 'Enter') {
        verifyAdminCredentials();
    }
}

// Verificar credenciales (contraseña segura)
function verifyAdminCredentials() {
    const passwordInput = document.getElementById('adminPasswordInput');
    const errorDiv = document.getElementById('loginError');
    
    if (!passwordInput) {
        console.error('❌ No se encontró el input de contraseña');
        return;
    }
    
    const enteredPassword = passwordInput.value;
    const correctPassword = 'darrell25'; 
    
    if (enteredPassword === correctPassword) {
        isAdmin = true;
        createAdminSession();
        closeAdminLoginModal();
        openAdminPanel();
        if (typeof notifier !== 'undefined') {
            notifier.show('✅ Sesión de administrador iniciada', 'success', 3000);
        }
    } else {
        if (errorDiv) {
            errorDiv.style.display = 'block';
            errorDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Contraseña incorrecta. Intenta nuevamente.';
        }
        passwordInput.style.borderColor = 'var(--danger-color)';
        passwordInput.focus();
        passwordInput.select();
        
        passwordInput.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            passwordInput.style.animation = '';
        }, 500);
    }
}

// Crear sesión de administrador
function createAdminSession() {
    const sessionData = {
        expires: Date.now() + ADMIN_SESSION_DURATION,
        created: Date.now()
    };
    localStorage.setItem('adminSession', JSON.stringify(sessionData));
    startSessionTimer();
}

// Iniciar timer de sesión
function startSessionTimer() {
    if (adminSessionTimeout) {
        clearTimeout(adminSessionTimeout);
    }
    
    adminSessionTimeout = setTimeout(() => {
        logoutAdmin();
        if (typeof notifier !== 'undefined') {
            notifier.show('🔒 Sesión expirada por seguridad', 'warning', 5000);
        }
    }, ADMIN_SESSION_DURATION);
}

// Cerrar modal de login
function closeAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 300);
    }
}

// Abrir panel de administración
function openAdminPanel() {
    if (!isAdmin) {
        showAdminLoginModal();
        return;
    }
    
    const adminPanel = document.getElementById('adminPanel');
    if (!adminPanel) {
        console.error('❌ No se encontró el panel de administración');
        return;
    }
    
    adminPanel.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: white;
        z-index: 10000;
        display: block !important;
        overflow-y: auto;
    `;
    
    loadAdminSalones();
    updateAdminUI();
}

// Cerrar panel de administración
function closeAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.style.display = 'none';
    }
    if (typeof notifier !== 'undefined') {
        notifier.show('Panel de administración cerrado', 'info', 2000);
    }
}

// Cerrar sesión de administrador
function logoutAdmin() {
    isAdmin = false;
    localStorage.removeItem('adminSession');
    
    if (adminSessionTimeout) {
        clearTimeout(adminSessionTimeout);
        adminSessionTimeout = null;
    }
    
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.style.display = 'none';
    }
    
    updateAdminUI();
    
    if (typeof notifier !== 'undefined') {
        notifier.show('🔒 Sesión de administrador cerrada', 'info', 3000);
    }
}

// Actualizar UI según estado de admin
function updateAdminUI() {
    const adminBtn = document.getElementById('adminBtn');
    if (!adminBtn) return;
    
    if (isAdmin) {
        adminBtn.innerHTML = '<i class="fas fa-user-shield"></i> Cerrar Sesión';
        adminBtn.style.background = 'var(--success-color)';
        adminBtn.onclick = logoutAdmin;
    } else {
        adminBtn.innerHTML = '<i class="fas fa-user-cog"></i> Panel Admin';
        adminBtn.style.background = 'var(--warning-color)';
        adminBtn.onclick = handleAdminAccess;
    }
}

// ✅ CORREGIDO: Cargar salones para administración (AHORA ES ASYNC)
async function loadAdminSalones() {
    const container = document.getElementById('adminSalonesList');
    if (!container) {
        console.error('❌ No se encontró adminSalonesList');
        return;
    }
    
    try {
        // ✅ CORREGIDO: Usar await para obtener salones
        const salones = await appDatabase.getAllSalones();
        
        if (!Array.isArray(salones)) {
            throw new Error('Los datos no son un array válido');
        }
        
        container.innerHTML = salones.map(salon => {
            // ✅ CORREGIDO: Escapar HTML y usar comillas simples para IDs string
            const safeName = escapeHtml(salon.name);
            const safeDescription = escapeHtml(salon.description.substring(0, 100));
            const safeId = escapeHtml(salon.id.toString());
            
            return `
            <div class="admin-salon-item" style="background: #f8f9fa; padding: 15px; border-radius: 10px; border-left: 4px solid #ff6b8b; margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #333;">${safeName}</h4>
                <p style="margin: 0 0 10px 0; color: #666; font-size: 0.9em;">${safeDescription}...</p>
                <div class="admin-salon-actions" style="display: flex; gap: 10px;">
                    <button class="btn btn-primary" onclick="editSalon('${safeId}')" style="padding: 8px 15px; background: #ff6b8b; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger" onclick="deleteSalon('${safeId}')" style="padding: 8px 15px; background: #ff6b6b; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
                ${salon.comments && salon.comments.length > 0 ? `
                    <div style="margin-top: 10px;">
                        <h5 style="margin: 15px 0 10px 0; color: #333;">Comentarios (${salon.comments.length})</h5>
                        ${salon.comments.map(comment => {
                            const safeUsername = escapeHtml(comment.username);
                            const safeText = escapeHtml(comment.text);
                            return `
                            <div style="background: white; padding: 10px; margin: 5px 0; border-radius: 5px; border: 1px solid #ddd;">
                                <strong style="color: #ff6b8b;">${safeUsername}</strong> 
                                <span style="color: #ffc107;">${'★'.repeat(comment.rating)}${'☆'.repeat(5-comment.rating)}</span>
                                <p style="margin: 5px 0; color: #555;">${safeText}</p>
                                <button class="btn btn-danger btn-sm" onclick="deleteComment('${safeId}', '${safeUsername}')" style="padding: 4px 8px; background: #ff6b6b; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.8em;">
                                    <i class="fas fa-trash"></i> Eliminar
                                </button>
                            </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}
            </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('❌ Error cargando salones para admin:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #ff6b6b;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <p>Error al cargar los salones: ${error.message}</p>
                <button onclick="loadAdminSalones()" class="btn btn-primary">Reintentar</button>
            </div>
        `;
    }
}

// ✅ CORREGIDO: Mostrar formulario para agregar salón
function showAddSalonForm() {
    if (!isAdmin) {
        if (typeof notifier !== 'undefined') {
            notifier.show('Debe iniciar sesión como administrador', 'error', 3000);
        }
        return;
    }

    // Verificar si ya existe el modal
    if (document.getElementById('addSalonModal')) {
        return;
    }

    const modalHTML = `
        <div class="modal-overlay" id="addSalonModal">
            <div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
                <div style="padding: 25px; position: relative;">
                    <!-- Header del modal -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0;">
                        <h3 style="margin: 0; color: var(--primary-color); display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-plus-circle"></i> Agregar Nuevo Salón
                        </h3>
                        <button onclick="closeAddSalonModal()" style="background: none; border: none; font-size: 24px; color: #999; cursor: pointer; padding: 5px; border-radius: 50%; transition: all 0.3s ease;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <!-- Formulario -->
                    <form id="addSalonForm" onsubmit="handleAddSalonSubmit(event)">
                        <!-- Información Básica -->
                        <div class="form-section" style="margin-bottom: 30px;">
                            <h4 style="color: var(--secondary-color); margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-info-circle"></i> Información Básica
                            </h4>
                            
                            <div class="form-group">
                                <label for="salonName" style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                                    <i class="fas fa-signature"></i> Nombre del Salón *
                                </label>
                                <input type="text" id="salonName" class="form-control" required 
                                       placeholder="Ej: Fiesta Mágica Infantil" 
                                       style="width: 100%; padding: 12px 15px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem; transition: all 0.3s ease;">
                            </div>

                            <div class="form-group">
                                <label for="salonDescription" style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                                    <i class="fas fa-align-left"></i> Descripción *
                                </label>
                                <textarea id="salonDescription" class="form-control" required rows="4"
                                          placeholder="Describa las características, servicios y atracciones del salón..."
                                          style="width: 100%; padding: 12px 15px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem; resize: vertical; transition: all 0.3s ease;"></textarea>
                            </div>
                        </div>

                        <!-- Imágenes -->
                        <div class="form-section" style="margin-bottom: 30px;">
                            <h4 style="color: var(--secondary-color); margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-images"></i> Imágenes
                            </h4>
                            
                            <div class="form-group">
                                <label for="mainImage" style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                                    <i class="fas fa-image"></i> Imagen Principal *
                                </label>
                                <input type="url" id="mainImage" class="form-control" required 
                                       placeholder="https://ejemplo.com/imagen-principal.jpg"
                                       style="width: 100%; padding: 12px 15px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem; transition: all 0.3s ease;">
                            </div>

                            <div class="form-group">
                                <label for="galleryImages" style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                                    <i class="fas fa-photo-video"></i> Galería de Imágenes
                                </label>
                                <textarea id="galleryImages" class="form-control" rows="3"
                                          placeholder="https://ejemplo.com/imagen1.jpg, https://ejemplo.com/imagen2.jpg"
                                          style="width: 100%; padding: 12px 15px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem; resize: vertical; transition: all 0.3s ease;"></textarea>
                            </div>

                            <!-- Vista previa de imágenes -->
                            <div id="imagePreview" style="margin-top: 15px; display: none;">
                                <h5 style="margin-bottom: 10px; color: #666; font-size: 0.9rem;">Vista Previa:</h5>
                                <div id="previewContainer" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 10px;"></div>
                            </div>
                        </div>

                        <!-- Ubicación -->
                        <div class="form-section" style="margin-bottom: 30px;">
                            <h4 style="color: var(--secondary-color); margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-map-marker-alt"></i> Ubicación
                            </h4>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div class="form-group">
                                    <label for="salonLat" style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                                        <i class="fas fa-globe-americas"></i> Latitud *
                                    </label>
                                    <input type="number" id="salonLat" class="form-control" required step="any"
                                           placeholder="Ej: -34.603722"
                                           style="width: 100%; padding: 12px 15px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem; transition: all 0.3s ease;">
                                </div>

                                <div class="form-group">
                                    <label for="salonLng" style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                                        <i class="fas fa-globe-americas"></i> Longitud *
                                    </label>
                                    <input type="number" id="salonLng" class="form-control" required step="any"
                                           placeholder="Ej: -58.381592"
                                           style="width: 100%; padding: 12px 15px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem; transition: all 0.3s ease;">
                                </div>
                            </div>
                        </div>

                        <!-- Botones de acción -->
                        <div style="display: flex; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0;">
                            <button type="button" onclick="closeAddSalonModal()" 
                                    style="flex: 1; padding: 15px; background: #6c757d; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s ease;">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                            <button type="submit" 
                                    style="flex: 2; padding: 15px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s ease;">
                                <i class="fas fa-plus-circle"></i> Agregar Salón
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Inicializar funcionalidades del formulario
    initializeFormFeatures();
}

// ✅ CORREGIDO: Inicializar características del formulario
function initializeFormFeatures() {
    const mainImageInput = document.getElementById('mainImage');
    const galleryInput = document.getElementById('galleryImages');
    
    if (mainImageInput) {
        mainImageInput.addEventListener('blur', updateImagePreview);
    }
    if (galleryInput) {
        galleryInput.addEventListener('blur', updateImagePreview);
    }
}

// ✅ CORREGIDO: Actualizar vista previa de imágenes
function updateImagePreview() {
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    
    if (!previewContainer) return;
    
    const mainImageInput = document.getElementById('mainImage');
    const galleryInput = document.getElementById('galleryImages');
    
    if (!mainImageInput || !galleryInput) return;
    
    const mainImage = mainImageInput.value;
    const galleryText = galleryInput.value;
    const galleryUrls = galleryText ? galleryText.split(',').map(url => url.trim()).filter(url => url) : [];
    
    let previewHTML = '';
    
    if (mainImage) {
        previewHTML += `
            <div style="text-align: center;">
                <div style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">Principal</div>
                <img src="${escapeHtml(mainImage)}" alt="Vista previa" 
                     style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid var(--primary-color);"
                     onerror="this.style.display='none'">
            </div>
        `;
    }
    
    galleryUrls.forEach((url, index) => {
        previewHTML += `
            <div style="text-align: center;">
                <div style="font-size: 0.7rem; color: #666; margin-bottom: 5px;">${index + 1}</div>
                <img src="${escapeHtml(url)}" alt="Galería ${index + 1}" 
                     style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;"
                     onerror="this.style.display='none'">
            </div>
        `;
    });
    
    previewContainer.innerHTML = previewHTML;
    
    if (imagePreview) {
        imagePreview.style.display = (mainImage || galleryUrls.length > 0) ? 'block' : 'none';
    }
}

// ✅ CORREGIDO: Manejar envío del formulario (AHORA ES ASYNC)
async function handleAddSalonSubmit(event) {
    event.preventDefault();
    // ✅✅✅ AGREGAR VALIDACIÓN DE SEGURIDAD AL INICIO (NUEVO)
    const salonName = document.getElementById('salonName').value.trim();
    const salonDescription = document.getElementById('salonDescription').value.trim();
    
    const nameValidation = SecuritySystem.validateInput(salonName, 'salon_name');
    const descValidation = SecuritySystem.validateInput(salonDescription, 'salon_description');
    
    if (!nameValidation.isValid || !descValidation.isValid) {
        let errorMessage = 'Datos del salón no válidos. ';
        if (!nameValidation.isValid) {
            errorMessage += `Nombre: ${getValidationMessage(nameValidation.reason)}. `;
        }
        if (!descValidation.isValid) {
            errorMessage += `Descripción: ${getValidationMessage(descValidation.reason)}.`;
        }
        notifier.show(errorMessage, 'error', 5000);
        return;
    }

    if (!validateAddSalonForm()) {
        return;
    }
    
    const formData = {
        name: document.getElementById('salonName').value.trim(),
        description: document.getElementById('salonDescription').value.trim(),
        image: document.getElementById('mainImage').value.trim(),
        gallery: document.getElementById('galleryImages').value 
                ? document.getElementById('galleryImages').value.split(',').map(url => url.trim()).filter(url => url)
                : [],
        lat: parseFloat(document.getElementById('salonLat').value),
        lng: parseFloat(document.getElementById('salonLng').value),
        capacity: document.getElementById('salonCapacity') ? 
                 (document.getElementById('salonCapacity').value ? parseInt(document.getElementById('salonCapacity').value) : null)
                 : null,
        price: document.getElementById('salonPrice') ? document.getElementById('salonPrice').value || null : null,
        features: getSelectedFeatures()
    };
    
    if (isNaN(formData.lat) || isNaN(formData.lng)) {
        if (typeof notifier !== 'undefined') {
            notifier.show('Las coordenadas deben ser números válidos', 'error', 3000);
        }
        return;
    }
    
    if (!isValidUrl(formData.image)) {
        if (typeof notifier !== 'undefined') {
            notifier.show('La URL de la imagen principal no es válida', 'error', 3000);
        }
        return;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agregando...';
    submitBtn.disabled = true;
    
    try {
        // ✅ CORREGIDO: Usar await para agregar salón
        await appDatabase.addSalon(formData);
        
        closeAddSalonModal();
        
        if (typeof notifier !== 'undefined') {
            notifier.show('🎉 Salón agregado exitosamente!', 'success', 4000);
        }
        
        // ✅ CORREGIDO: Recargar datos
        await loadAdminSalones();
        if (typeof loadSalones === 'function') {
            loadSalones();
        }
        
    } catch (error) {
        console.error('❌ Error agregando salón:', error);
        if (typeof notifier !== 'undefined') {
            notifier.show('❌ Error al agregar salón: ' + error.message, 'error', 5000);
        }
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}
// ✅✅✅ AGREGAR FUNCIÓN AUXILIAR PARA MENSAJES (NUEVO)
function getValidationMessage(reason) {
    const messages = {
        'sql_injection': 'contiene código SQL peligroso',
        'xss': 'contiene script malicioso', 
        'too_long': 'es demasiado largo',
        'empty': 'no puede estar vacío',
        'invalid_type': 'tipo de dato inválido'
    };
    return messages[reason] || 'no válido';
}

// ✅ CORREGIDO: Validar formulario
function validateAddSalonForm() {
    const requiredFields = [
        { id: 'salonName', name: 'Nombre del salón' },
        { id: 'salonDescription', name: 'Descripción' },
        { id: 'mainImage', name: 'Imagen principal' },
        { id: 'salonLat', name: 'Latitud' },
        { id: 'salonLng', name: 'Longitud' }
    ];
    
    for (let field of requiredFields) {
        const element = document.getElementById(field.id);
        if (!element || !element.value.trim()) {
            if (typeof notifier !== 'undefined') {
                notifier.show(`El campo "${field.name}" es requerido`, 'error', 3000);
            }
            if (element) {
                element.focus();
                element.style.borderColor = 'var(--danger-color)';
            }
            return false;
        }
        if (element) {
            element.style.borderColor = '#e9ecef';
        }
    }
    
    return true;
}

// ✅ CORREGIDO: Obtener características seleccionadas
function getSelectedFeatures() {
    const checkboxes = document.querySelectorAll('input[name="features"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// ✅ CORREGIDO: Validar URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// ✅ CORREGIDO: Cerrar modal de agregar salón
function closeAddSalonModal() {
    const modal = document.getElementById('addSalonModal');
    if (modal) {
        modal.remove();
    }
}

// ✅ CORREGIDO: Función para escapar HTML (SEGURIDAD)
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ✅ CORREGIDO: Eliminar salón (AHORA ES ASYNC)
async function deleteSalon(salonId) {
    if (!isAdmin) {
        if (typeof notifier !== 'undefined') {
            notifier.show('Debe iniciar sesión como administrador', 'error', 3000);
        }
        return;
    }
    
    if (!confirm('¿Estás seguro de que quieres eliminar este salón? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        // ✅ CORREGIDO: Usar await para eliminar
        const success = await appDatabase.deleteSalon(salonId);
        if (success) {
            if (typeof notifier !== 'undefined') {
                notifier.show('Salón eliminado exitosamente', 'success', 3000);
            }
            await loadAdminSalones();
            if (typeof loadSalones === 'function') {
                loadSalones();
            }
        } else {
            if (typeof notifier !== 'undefined') {
                notifier.show('Error al eliminar salón', 'error', 3000);
            }
        }
    } catch (error) {
        console.error('❌ Error eliminando salón:', error);
        if (typeof notifier !== 'undefined') {
            notifier.show('Error al eliminar salón: ' + error.message, 'error', 5000);
        }
    }
}

async function handleEditSalonSubmit(event, salonId) {
    event.preventDefault();
    
    // ✅✅✅ AGREGAR LA MISMA VALIDACIÓN (NUEVO)
    const salonName = document.getElementById('editSalonName').value.trim();
    const salonDescription = document.getElementById('editSalonDescription').value.trim();
    
    const nameValidation = SecuritySystem.validateInput(salonName, 'salon_name');
    const descValidation = SecuritySystem.validateInput(salonDescription, 'salon_description');
    
    if (!nameValidation.isValid || !descValidation.isValid) {
        let errorMessage = 'Datos del salón no válidos. ';
        if (!nameValidation.isValid) {
            errorMessage += `Nombre: ${getValidationMessage(nameValidation.reason)}. `;
        }
        if (!descValidation.isValid) {
            errorMessage += `Descripción: ${getValidationMessage(descValidation.reason)}.`;
        }
        notifier.show(errorMessage, 'error', 5000);
        return;
    }
    
    // ... resto del código existente
}

// ✅ CORREGIDO: Eliminar comentario (AHORA ES ASYNC)
async function deleteComment(salonId, username) {
    if (!isAdmin) {
        if (typeof notifier !== 'undefined') {
            notifier.show('Debe iniciar sesión como administrador', 'error', 3000);
        }
        return;
    }
    
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
        return;
    }
    
    try {
        // ✅ CORREGIDO: Usar await para eliminar comentario
        const success = await appDatabase.deleteComment(salonId, username);
        if (success) {
            if (typeof notifier !== 'undefined') {
                notifier.show('Comentario eliminado exitosamente', 'success', 3000);
            }
            await loadAdminSalones();
            if (typeof loadSalones === 'function') {
                loadSalones();
            }
        } else {
            if (typeof notifier !== 'undefined') {
                notifier.show('Error al eliminar comentario', 'error', 3000);
            }
        }
    } catch (error) {
        console.error('❌ Error eliminando comentario:', error);
        if (typeof notifier !== 'undefined') {
            notifier.show('Error al eliminar comentario: ' + error.message, 'error', 5000);
        }
    }
}

// ✅ CORREGIDO: Actualizar datos
async function refreshData() {
    await loadAdminSalones();
    if (typeof notifier !== 'undefined') {
        notifier.show('Datos actualizados', 'success', 2000);
    }
}

// ✅ CORREGIDO: Restablecer datos (AHORA ES ASYNC)
async function resetData() {
    if (!isAdmin) {
        if (typeof notifier !== 'undefined') {
            notifier.show('Debe iniciar sesión como administrador', 'error', 3000);
        }
        return;
    }
    
    if (!confirm('¿Estás seguro de que quieres restablecer todos los datos a los valores de ejemplo? Se perderán todos los cambios.')) {
        return;
    }
    
    try {
        // ✅ CORREGIDO: Usar await para reset
        const success = await appDatabase.resetToSampleData();
        if (success) {
            if (typeof notifier !== 'undefined') {
                notifier.show('Datos restablecidos exitosamente', 'success', 3000);
            }
            await loadAdminSalones();
            if (typeof loadSalones === 'function') {
                loadSalones();
            }
        } else {
            throw new Error('No se pudo restablecer los datos');
        }
    } catch (error) {
        console.error('❌ Error restableciendo datos:', error);
        if (typeof notifier !== 'undefined') {
            notifier.show('Error al restablecer datos: ' + error.message, 'error', 5000);
        }
    }
}

// Hacer funciones disponibles globalmente
window.handleAdminAccess = handleAdminAccess;
window.verifyAdminCredentials = verifyAdminCredentials;
window.closeAdminLoginModal = closeAdminLoginModal;
window.handleAdminPasswordKeypress = handleAdminPasswordKeypress;
window.logoutAdmin = logoutAdmin;
window.closeAdminPanel = closeAdminPanel;
window.editSalon = editSalon;
window.deleteSalon = deleteSalon;
window.deleteComment = deleteComment;
window.showAddSalonForm = showAddSalonForm;
window.closeAddSalonModal = closeAddSalonModal;
window.handleAddSalonSubmit = handleAddSalonSubmit;
window.loadAdminSalones = loadAdminSalones;
window.refreshData = refreshData;
window.resetData = resetData;
window.escapeHtml = escapeHtml;

console.log('✅ Admin panel cargado y corregido');