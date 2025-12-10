// js/admin-essentials.js - FUNCIONES ESENCIALES PARA ADMIN CORREGIDAS

// 1. ✅ CORREGIDO: FUNCIÓN PARA EL FORMULARIO DE EDICIÓN
function getAverageRating(salon) {
    if (!salon || !salon.comments || !Array.isArray(salon.comments) || salon.comments.length === 0) {
        return 0;
    }
    
    try {
        const validComments = salon.comments.filter(comment => 
            comment && typeof comment.rating === 'number' && comment.rating > 0
        );
        
        if (validComments.length === 0) return 0;
        
        const total = validComments.reduce((sum, comment) => sum + comment.rating, 0);
        const average = total / validComments.length;
        
        // Asegurar que sea un número antes de redondear
        const numericAverage = Number(average);
        return isNaN(numericAverage) ? 0 : Math.round(numericAverage * 10) / 10;
    } catch (error) {
        console.error('❌ Error calculando rating promedio:', error);
        return 0;
    }
}

// 2. ✅ CORREGIDO: FUNCIONES DE ADMINISTRACIÓN BÁSICAS (AHORA SON ASYNC)
async function eliminarSalon(salonId) {
    if (!confirm('¿Estás seguro de eliminar este salón?')) return;
    
    try {
        await appDatabase.deleteSalon(salonId);
        console.log('✅ Salón eliminado:', salonId);
        
        // ✅ CORREGIDO: Usar await para recargar
        if (typeof loadAdminSalones === 'function') {
            await loadAdminSalones();
        }
        if (typeof loadSalones === 'function') {
            loadSalones();
        }
        
        if (typeof notifier !== 'undefined') {
            notifier.show('Salón eliminado exitosamente', 'success', 3000);
        }
    } catch (error) {
        console.error('❌ Error eliminando salón:', error);
        if (typeof notifier !== 'undefined') {
            notifier.show('Error eliminando salón: ' + error.message, 'error', 5000);
        }
    }
}

async function editarSalon(salonId, nuevosDatos) {
    try {
        await appDatabase.updateSalon(salonId, nuevosDatos);
        console.log('✅ Salón actualizado:', salonId);
        
        // ✅ CORREGIDO: Usar await para recargar
        if (typeof loadAdminSalones === 'function') {
            await loadAdminSalones();
        }
        if (typeof loadSalones === 'function') {
            loadSalones();
        }
        
        if (typeof notifier !== 'undefined') {
            notifier.show('Salón actualizado exitosamente', 'success', 3000);
        }
    } catch (error) {
        console.error('❌ Error actualizando salón:', error);
        if (typeof notifier !== 'undefined') {
            notifier.show('Error actualizando salón: ' + error.message, 'error', 5000);
        }
    }
}

async function agregarSalon(datosSalon) {
    try {
        await appDatabase.addSalon(datosSalon);
        console.log('✅ Salón agregado:', datosSalon.name);
        
        // ✅ CORREGIDO: Usar await para recargar
        if (typeof loadAdminSalones === 'function') {
            await loadAdminSalones();
        }
        if (typeof loadSalones === 'function') {
            loadSalones();
        }
        
        if (typeof notifier !== 'undefined') {
            notifier.show('Salón agregado exitosamente', 'success', 3000);
        }
    } catch (error) {
        console.error('❌ Error agregando salón:', error);
        if (typeof notifier !== 'undefined') {
            notifier.show('Error agregando salón: ' + error.message, 'error', 5000);
        }
    }
}

async function eliminarComentario(salonId, username) {
    if (!confirm('¿Estás seguro de eliminar este comentario?')) return;
    
    try {
        await appDatabase.deleteComment(salonId, username);
        console.log('✅ Comentario eliminado');
        
        // ✅ CORREGIDO: Usar await para recargar
        if (typeof loadAdminSalones === 'function') {
            await loadAdminSalones();
        }
        
        if (typeof notifier !== 'undefined') {
            notifier.show('Comentario eliminado exitosamente', 'success', 3000);
        }
    } catch (error) {
        console.error('❌ Error eliminando comentario:', error);
        if (typeof notifier !== 'undefined') {
            notifier.show('Error eliminando comentario: ' + error.message, 'error', 5000);
        }
    }
}

// 3. ✅ CORREGIDO: FUNCIÓN EDITAR SALÓN COMPLETA
async function editSalon(salonId) {
    console.log('✏️ Editando salón:', salonId);
    
    if (!isAdmin) {
        if (typeof notifier !== 'undefined') {
            notifier.show('Debe iniciar sesión como administrador', 'error', 3000);
        }
        return;
    }

    try {
        const salones = await appDatabase.getAllSalones();
        const salon = salones.find(s => s.id.toString() === salonId.toString());
        
        if (!salon) {
            if (typeof notifier !== 'undefined') {
                notifier.show('Salón no encontrado', 'error', 3000);
            }
            return;
        }

        // Verificar si ya existe el modal
        if (document.getElementById('editSalonModal')) {
            document.getElementById('editSalonModal').remove();
        }

        const safeName = escapeHtml(salon.name);
        const safeDescription = escapeHtml(salon.description);
        const safeImage = escapeHtml(salon.image);
        const safeId = escapeHtml(salonId.toString());
        const safeLat = salon.lat ? salon.lat.toString() : '';
        const safeLng = salon.lng ? salon.lng.toString() : '';
        const safeCapacity = salon.capacity ? salon.capacity.toString() : '';
        const safePrice = salon.price ? escapeHtml(salon.price) : '';
        const safeGallery = salon.gallery ? salon.gallery.join(', ') : '';

        const modalHTML = `
            <div class="modal-overlay" id="editSalonModal">
                <div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
                    <div style="padding: 25px; position: relative;">
                        <!-- Header del modal -->
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0;">
                            <h3 style="margin: 0; color: var(--primary-color); display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-edit"></i> Editar Salón
                            </h3>
                            <button onclick="closeEditSalonModal()" style="background: none; border: none; font-size: 24px; color: #999; cursor: pointer; padding: 5px; border-radius: 50%; transition: all 0.3s ease;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>

                        <!-- Información del salón actual -->
                        <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 15px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid var(--secondary-color);">
                            <h4 style="margin: 0 0 10px 0; color: var(--dark-color); display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-info-circle"></i> Editando: ${safeName}
                            </h4>
                            <p style="margin: 0; color: #666; font-size: 0.9rem;">
                                ID: ${safeId} | ${salon.comments ? salon.comments.length : 0} comentarios | 
                                Rating: ${getAverageRating(salon).toFixed(1)} ⭐
                            </p>
                        </div>

                        <!-- Formulario -->
                        <form id="editSalonForm" onsubmit="handleEditSalonSubmit(event, '${safeId}')">
                            <!-- Información Básica -->
                            <div class="form-section" style="margin-bottom: 30px;">
                                <h4 style="color: var(--secondary-color); margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-info-circle"></i> Información Básica
                                </h4>
                                
                                <div class="form-group">
                                    <label for="editSalonName" style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                                        <i class="fas fa-signature"></i> Nombre del Salón *
                                    </label>
                                    <input type="text" id="editSalonName" class="form-control" required 
                                           value="${safeName}"
                                           placeholder="Ej: Fiesta Mágica Infantil" 
                                           style="width: 100%; padding: 12px 15px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem; transition: all 0.3s ease;">
                                </div>

                                <div class="form-group">
                                    <label for="editSalonDescription" style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                                        <i class="fas fa-align-left"></i> Descripción *
                                    </label>
                                    <textarea id="editSalonDescription" class="form-control" required rows="4"
                                              placeholder="Describa las características, servicios y atracciones del salón..."
                                              style="width: 100%; padding: 12px 15px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem; resize: vertical; transition: all 0.3s ease;">${safeDescription}</textarea>
                                </div>
                            </div>

                            <!-- Imágenes -->
                            <div class="form-section" style="margin-bottom: 30px;">
                                <h4 style="color: var(--secondary-color); margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-images"></i> Imágenes
                                </h4>
                                
                                <div class="form-group">
                                    <label for="editMainImage" style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                                        <i class="fas fa-image"></i> Imagen Principal *
                                    </label>
                                    <input type="url" id="editMainImage" class="form-control" required 
                                           value="${safeImage}"
                                           placeholder="https://ejemplo.com/imagen-principal.jpg"
                                           style="width: 100%; padding: 12px 15px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem; transition: all 0.3s ease;">
                                </div>

                                <div class="form-group">
                                    <label for="editGalleryImages" style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                                        <i class="fas fa-photo-video"></i> Galería de Imágenes
                                    </label>
                                    <textarea id="editGalleryImages" class="form-control" rows="3"
                                              placeholder="https://ejemplo.com/imagen1.jpg, https://ejemplo.com/imagen2.jpg"
                                              style="width: 100%; padding: 12px 15px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem; resize: vertical; transition: all 0.3s ease;">${safeGallery}</textarea>
                                </div>
                            </div>

                            <!-- Ubicación -->
                            <div class="form-section" style="margin-bottom: 30px;">
                                <h4 style="color: var(--secondary-color); margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-map-marker-alt"></i> Ubicación
                                </h4>
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                    <div class="form-group">
                                        <label for="editSalonLat" style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                                            <i class="fas fa-globe-americas"></i> Latitud *
                                        </label>
                                        <input type="number" id="editSalonLat" class="form-control" required step="any"
                                               value="${safeLat}"
                                               placeholder="Ej: -34.603722"
                                               style="width: 100%; padding: 12px 15px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem; transition: all 0.3s ease;">
                                    </div>

                                    <div class="form-group">
                                        <label for="editSalonLng" style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                                            <i class="fas fa-globe-americas"></i> Longitud *
                                        </label>
                                        <input type="number" id="editSalonLng" class="form-control" required step="any"
                                               value="${safeLng}"
                                               placeholder="Ej: -58.381592"
                                               style="width: 100%; padding: 12px 15px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem; transition: all 0.3s ease;">
                                    </div>
                                </div>
                            </div>

                            <!-- Información Adicional -->
                            <div class="form-section" style="margin-bottom: 30px;">
                                <h4 style="color: var(--secondary-color); margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-star"></i> Información Adicional
                                </h4>
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                    <div class="form-group">
                                        <label for="editSalonCapacity" style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                                            <i class="fas fa-users"></i> Capacidad
                                        </label>
                                        <input type="number" id="editSalonCapacity" class="form-control" 
                                               value="${safeCapacity}"
                                               placeholder="Ej: 50"
                                               style="width: 100%; padding: 12px 15px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem; transition: all 0.3s ease;">
                                    </div>

                                    <div class="form-group">
                                        <label for="editSalonPrice" style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                                            <i class="fas fa-tag"></i> Precio Base
                                        </label>
                                        <input type="text" id="editSalonPrice" class="form-control" 
                                               value="${safePrice}"
                                               placeholder="Ej: $50,000"
                                               style="width: 100%; padding: 12px 15px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem; transition: all 0.3s ease;">
                                    </div>
                                </div>
                            </div>

                            <!-- Botones de acción -->
                            <div style="display: flex; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0;">
                                <button type="button" onclick="closeEditSalonModal()" 
                                        style="flex: 1; padding: 15px; background: #6c757d; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s ease;">
                                    <i class="fas fa-times"></i> Cancelar
                                </button>
                                <button type="submit" 
                                        style="flex: 2; padding: 15px; background: linear-gradient(135deg, var(--warning-color), #ff9a44); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s ease;">
                                    <i class="fas fa-save"></i> Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
    } catch (error) {
        console.error('❌ Error cargando formulario de edición:', error);
        if (typeof notifier !== 'undefined') {
            notifier.show('Error al cargar formulario de edición: ' + error.message, 'error', 5000);
        }
    }
}

// ✅ CORREGIDO: Manejar envío del formulario de edición
async function handleEditSalonSubmit(event, salonId) {
    event.preventDefault();
    console.log('💾 Guardando cambios para salón:', salonId);
    
    try {
        const formData = {
            name: document.getElementById('editSalonName').value.trim(),
            description: document.getElementById('editSalonDescription').value.trim(),
            image: document.getElementById('editMainImage').value.trim(),
            gallery: document.getElementById('editGalleryImages').value 
                    ? document.getElementById('editGalleryImages').value.split(',').map(url => url.trim()).filter(url => url)
                    : [],
            lat: parseFloat(document.getElementById('editSalonLat').value),
            lng: parseFloat(document.getElementById('editSalonLng').value),
            capacity: document.getElementById('editSalonCapacity').value ? parseInt(document.getElementById('editSalonCapacity').value) : null,
            price: document.getElementById('editSalonPrice').value || null
        };
        
        // Validaciones básicas
        if (!formData.name || !formData.description || !formData.image) {
            throw new Error('Todos los campos requeridos deben estar completos');
        }
        
        if (isNaN(formData.lat) || isNaN(formData.lng)) {
            throw new Error('Las coordenadas deben ser números válidos');
        }
        
        // Mostrar loading
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        submitBtn.disabled = true;
        
        const success = await appDatabase.updateSalon(salonId, formData);
        
        if (success) {
            closeEditSalonModal();
            
            if (typeof notifier !== 'undefined') {
                notifier.show('✅ Salón actualizado exitosamente!', 'success', 4000);
            }
            
            // Actualizar vistas
            if (typeof loadAdminSalones === 'function') {
                await loadAdminSalones();
            }
            if (typeof loadSalones === 'function') {
                loadSalones();
            }
        } else {
            throw new Error('No se pudo actualizar el salón');
        }
        
    } catch (error) {
        console.error('❌ Error al actualizar salón:', error);
        if (typeof notifier !== 'undefined') {
            notifier.show('❌ Error al actualizar salón: ' + error.message, 'error', 5000);
        }
        
        // Restaurar botón
        const submitBtn = event.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
            submitBtn.disabled = false;
        }
    }
}

// ✅ CORREGIDO: Cerrar modal de editar salón
function closeEditSalonModal() {
    const modal = document.getElementById('editSalonModal');
    if (modal) {
        modal.remove();
    }
}

// 4. ✅ CORREGIDO: FUNCIONES PARA LA SESIÓN DE ADMIN
function openAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.style.display = 'block';
        if (typeof loadAdminSalones === 'function') {
            loadAdminSalones();
        }
    }
}

function closeAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.style.display = 'none';
    }
}

// ✅ CORREGIDO: Función para escapar HTML (seguridad)
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Hacer disponibles globalmente
window.getAverageRating = getAverageRating;
window.eliminarSalon = eliminarSalon;
window.editarSalon = editarSalon;
window.agregarSalon = agregarSalon;
window.eliminarComentario = eliminarComentario;
window.editSalon = editSalon;
window.handleEditSalonSubmit = handleEditSalonSubmit;
window.closeEditSalonModal = closeEditSalonModal;
window.openAdminPanel = openAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.escapeHtml = escapeHtml;

console.log('✅ Admin essentials cargado y corregido');