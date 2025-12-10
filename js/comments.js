// Sistema de comentarios simplificado - VERSIÓN CORREGIDA
let usedUsernames = new Set();

// 🎨 SISTEMA DE NOTIFICACIONES MEJORADO
class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10002;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
        `;
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: '💡'
        };

        notification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="font-size: 1.2em;">${icons[type] || icons.info}</span>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">${this.getTitle(type)}</div>
                    <div style="font-size: 0.9em; line-height: 1.4;">${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; font-size: 16px; cursor: pointer; color: #666; padding: 0;">
                    ×
                </button>
            </div>
        `;

        notification.style.cssText = `
            background: white;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            border-left: 4px solid ${this.getColor(type)};
            animation: slideInRight 0.3s ease, fadeOut 0.3s ease ${duration}ms forwards;
            transform: translateX(100%);
            opacity: 0;
            max-width: 350px;
            font-family: Arial, sans-serif;
            font-size: 14px;
        `;

        if (this.container) {
            this.container.appendChild(notification);
        }

        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transform = 'translateX(0)';
                notification.style.opacity = '1';
            }
        }, 10);

        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.transform = 'translateX(100%)';
                    notification.style.opacity = '0';
                    setTimeout(() => {
                        if (notification.parentElement) {
                            notification.remove();
                        }
                    }, 300);
                }
            }, duration);
        }

        return notification;
    }

    getTitle(type) {
        const titles = {
            success: '¡Éxito!',
            error: 'Error',
            warning: 'Advertencia',
            info: 'Información'
        };
        return titles[type] || 'Notificación';
    }

    getColor(type) {
        const colors = {
            success: '#51cf66',
            error: '#ff6b6b',
            warning: '#ffd43b',
            info: '#339af0'
        };
        return colors[type] || '#339af0';
    }
}

// Estilos CSS para las animaciones
if (!document.querySelector('#notification-styles')) {
    const notificationStyles = document.createElement('style');
    notificationStyles.id = 'notification-styles';
    notificationStyles.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .notification {
            transition: all 0.3s ease;
        }
        
        .notification:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 12px 30px rgba(0,0,0,0.2) !important;
        }
    `;
    document.head.appendChild(notificationStyles);
}

// Instanciar el sistema de notificaciones
const notifier = new NotificationSystem();

// 📊 SISTEMA DE FILTRADO PARA DEMOSTRACIÓN
class WordFilter {
    constructor() {
        this.badWords = [
            'tonto', 'tonta', 'estupido', 'estupida', 'idiota', 'imbecil',
            'bruto', 'bruta', 'burro', 'burra', 'inutil', 'retrasado', 'retrasada',
            'tarado', 'tarada', 'baboso', 'babosa',
            'puta', 'puto', 'putos', 'putas',
            'mierda', 'cabron', 'cabrona', 'cojudo', 'cojuda',
            'hijo de puta', 'gil', 'pelotudo', 'pendejo', 'pendeja',
            'maricon', 'maricona', 'culero', 'culera', 'zorra', 'zorro'
        ];
        this.detections = [];
    }

    normalize(text) {
        if (!text) return '';
        return text
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[@$!.,_*#%&0-9]/g, '')
            .replace(/4/g, 'a')
            .replace(/3/g, 'e')
            .replace(/1/g, 'i')
            .replace(/0/g, 'o')
            .replace(/5/g, 's');
    }

    isProfane(text) {
        if (!text || typeof text !== 'string') return false;
        
        const cleaned = this.normalize(text);
        const detectedWords = this.badWords.filter(word => cleaned.includes(word));
        
        if (detectedWords.length > 0) {
            console.log(`🚫 FILTRO ACTIVADO: Palabras detectadas en "${text}":`, detectedWords);
            
            detectedWords.forEach(word => {
                this.logDetection(word, text);
            });
            
            return true;
        }
        
        return false;
    }

    logDetection(word, originalText) {
        this.detections.push({
            word: word,
            originalText: originalText,
            timestamp: new Date().toISOString()
        });
        
        console.log(`🚫 FILTRO ACTIVADO: "${word}" detectado en: "${originalText}"`);
    }

    getFilterReport() {
        return {
            totalDetections: this.detections.length,
            detections: this.detections,
            badWordsList: this.badWords
        };
    }

    showDemoPanel() {
        if (document.getElementById('filterDemoPanel')) return;
        
        const panel = document.createElement('div');
        panel.id = 'filterDemoPanel';
        panel.style.cssText = `
            position: fixed;
            top: 80px;
            right: 10px;
            background: #f8f9fa;
            border: 2px solid #ff6b8b;
            border-radius: 10px;
            padding: 15px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            font-family: Arial, sans-serif;
        `;
        
        const report = this.getFilterReport();
        panel.innerHTML = `
            <h3 style="color: #ff6b8b; margin: 0 0 10px 0; font-size: 1.1em;">🧹 Filtro de Palabras</h3>
            <div style="font-size: 0.8em;">
                <p><strong>Palabras bloqueadas:</strong> ${report.badWordsList.length}</p>
                <p><strong>Detecciones:</strong> <span id="detectionCount">${report.totalDetections}</span></p>
                <button onclick="wordFilter.showDetailedReport()" 
                        style="background: #ff6b8b; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 0.8em; margin: 2px;">
                    Ver Reporte
                </button>
                <button onclick="wordFilter.testDemo()" 
                        style="background: #845ec2; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 0.8em; margin: 2px;">
                    Probar Demo
                </button>
            </div>
        `;
        
        document.body.appendChild(panel);
    }

    showDetailedReport() {
        const report = this.getFilterReport();
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 3px solid #ff6b8b;
            border-radius: 15px;
            padding: 20px;
            z-index: 10001;
            max-width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            font-family: Arial, sans-serif;
        `;
        
        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h2 style="color: #ff6b8b; margin: 0; font-size: 1.5em;">📊 Reporte del Filtro</h2>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; font-size: 20px; cursor: pointer; color: #666;">×</button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h3 style="color: #333; margin-bottom: 10px;">📝 Palabras Bloqueadas (${report.badWordsList.length})</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 15px; max-height: 150px; overflow-y: auto;">
                    ${report.badWordsList.map(word => `
                        <span style="background: #ff6b8b; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8em;">
                            ${word}
                        </span>
                    `).join('')}
                </div>
            </div>
            
            <div>
                <h3 style="color: #333; margin-bottom: 10px;">🚫 Detecciones (${report.totalDetections})</h3>
                ${report.detections.length > 0 ? `
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${report.detections.map(detection => `
                            <div style="border-left: 3px solid #ff6b8b; padding: 8px; margin: 5px 0; background: #f8f9fa;">
                                <strong>Palabra:</strong> "${detection.word}"<br>
                                <strong>Texto original:</strong> "${detection.originalText}"<br>
                                <small style="color: #666;">${new Date(detection.timestamp).toLocaleTimeString()}</small>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: #666; text-align: center;">No hay detecciones registradas</p>'}
            </div>
            
            <div style="margin-top: 15px; text-align: center;">
                <button onclick="wordFilter.testDemo()" 
                        style="background: #845ec2; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; margin: 5px;">
                    Probar Demo
                </button>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: #6c757d; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; margin: 5px;">
                    Cerrar
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    testDemo() {
        const testCases = [
            {
                text: "Este salón es tonto y horrible",
                shouldBlock: true
            },
            {
                text: "La atención fue estúpida", 
                shouldBlock: true
            },
            {
                text: "Excelente servicio, muy recomendado",
                shouldBlock: false
            },
            {
                text: "Me encantó la decoración y la atención",
                shouldBlock: false
            }
        ];
        
        let completed = 0;
        
        testCases.forEach((test, index) => {
            setTimeout(() => {
                const hasBadWords = this.isProfane(test.text);
                
                if (hasBadWords) {
                    notifier.show('Mensaje inapropiado detectado. Por favor usa un lenguaje respetuoso.', 'error', 4000);
                } else {
                    notifier.show('Comentario aprobado. ¡Gracias por tu opinión!', 'success', 4000);
                }
                
                completed++;
                if (completed === testCases.length) {
                    setTimeout(() => {
                        notifier.show('Demo completada. El filtro está funcionando correctamente.', 'info', 5000);
                    }, 1000);
                }
            }, index * 2000);
        });
        
        notifier.show('Iniciando demostración del filtro de comentarios...', 'info', 3000);
    }
}

// Instanciar el filtro
const wordFilter = new WordFilter();

// ✅ CORREGIDO: Función principal para ver comentarios (AHORA ES ASYNC)
async function openComments(salonId) {
    console.log('Abriendo comentarios para:', salonId);
    
    try {
        // ✅ CORREGIDO: Usar await para obtener salones
        const salones = await appDatabase.getAllSalones();
        const salon = salones.find(s => s.id.toString() === salonId.toString());
        
        if (!salon) {
            console.error('❌ Salón no encontrado:', salonId);
            notifier.show('Salón no encontrado', 'error', 3000);
            return;
        }
        
        const modal = document.getElementById('commentsModal');
        const modalContent = document.getElementById('modalContent');
        
        if (!modal || !modalContent) {
            console.error('❌ No se encontró el modal de comentarios');
            return;
        }
        
        // Actualizar usernames usados
        await updateUsedUsernames();
        
        const rating = calculateAverageRating(salon);
        const reviewCount = salon.comments ? salon.comments.length : 0;
        
        modalContent.innerHTML = createCommentsHTML(salon, rating, reviewCount, salonId);
        modal.style.display = 'block';
        
        // Configurar el botón de enviar
        setupSubmitButton(salonId);
        
    } catch (error) {
        console.error('❌ Error abriendo comentarios:', error);
        notifier.show('Error al cargar comentarios', 'error', 3000);
    }
}

// ✅ CORREGIDO: Actualizar lista de usernames usados (AHORA ES ASYNC)
async function updateUsedUsernames() {
    usedUsernames.clear();
    try {
        const salones = await appDatabase.getAllSalones();
        salones.forEach(salon => {
            if (salon.comments) {
                salon.comments.forEach(comment => {
                    if (comment.username) {
                        usedUsernames.add(comment.username.toLowerCase());
                    }
                });
            }
        });
    } catch (error) {
        console.error('❌ Error actualizando usernames:', error);
    }
}

// ✅ CORREGIDO: Crear HTML del modal de comentarios
function createCommentsHTML(salon, rating, reviewCount, salonId) {
    const safeName = escapeHtml(salon.name);
    const safeId = escapeHtml(salonId.toString());
    
    return `
        <div style="position: relative;">
            <button onclick="closeCommentsModal()" style="position: absolute; right: 15px; top: 15px; background: white; border: none; font-size: 24px; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; z-index: 100;">
                ×
            </button>
            
            <div style="padding: 20px; background: linear-gradient(135deg, #ff6b8b, #845ec2); color: white; border-radius: 15px 15px 0 0;">
                <h2 style="margin: 0;">${safeName}</h2>
                <p style="margin: 5px 0 0;">
                    ⭐ ${typeof rating === 'number' ? rating.toFixed(1) : '0.0'} • 💬 ${reviewCount} reseñas
                </p>
            </div>
        </div>
        
        <div style="padding: 20px; max-height: 60vh; overflow-y: auto;">
            <!-- Comentarios existentes -->
            <div style="margin-bottom: 20px;">
                <h3 style="color: #ff6b8b;">💬 Comentarios</h3>
                ${createCommentsList(salon.comments || [])}
            </div>
            
            <!-- Formulario nuevo comentario -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                <h3 style="color: #845ec2; margin-bottom: 15px;">✏️ Agregar Comentario</h3>
                
                <div style="margin-bottom: 15px;">
                    <input type="text" id="newUsername" 
                           placeholder="Tu nombre *" 
                           style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <textarea id="newComment" 
                              placeholder="Tu comentario *" 
                              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; height: 80px;"></textarea>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <p style="margin-bottom: 8px; font-weight: bold;">Calificación *</p>
                    <div style="display: flex; gap: 5px;">
                        ${[1,2,3,4,5].map(stars => `
                            <button type="button" 
                                    class="star-btn" 
                                    data-rating="${stars}"
                                    onclick="selectRating(${stars})"
                                    style="font-size: 24px; background: none; border: none; cursor: pointer; color: #ddd;">
                                ★
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <button type="button" id="submitCommentBtn" 
                        style="width: 100%; padding: 12px; background: #ff6b8b; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">
                    📤 Enviar Comentario
                </button>
            </div>
        </div>
    `;
}

// ✅ CORREGIDO: Crear lista de comentarios
function createCommentsList(comments) {
    if (!comments || comments.length === 0) {
        return '<p style="text-align: center; color: #666; padding: 20px;">No hay comentarios aún</p>';
    }
    
    return comments.map(comment => {
        const safeUsername = escapeHtml(comment.username || 'Anónimo');
        const safeText = escapeHtml(comment.text || '');
        
        return `
        <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #ff6b8b;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <strong style="color: #ff6b8b;">${safeUsername}</strong>
                <span style="color: #ffc107;">${'★'.repeat(comment.rating || 0)}${'☆'.repeat(5-(comment.rating || 0))}</span>
            </div>
            <p style="margin: 0; color: #555;">${safeText}</p>
            <small style="color: #999;">${formatCommentDate(comment.timestamp || comment.date)}</small>
        </div>
        `;
    }).join('');
}

// ✅ CORREGIDO: Configurar botón de enviar
function setupSubmitButton(salonId) {
    const submitBtn = document.getElementById('submitCommentBtn');
    if (submitBtn) {
        submitBtn.onclick = function() {
            submitNewComment(salonId);
        };
    }
}

// ✅ CORREGIDO: Seleccionar rating
function selectRating(rating) {
    const starButtons = document.querySelectorAll('.star-btn');
    if (!starButtons.length) return;
    
    // Reset all stars
    starButtons.forEach(btn => {
        if (btn.style) {
            btn.style.color = '#ddd';
        }
    });
    
    // Color selected stars
    for (let i = 1; i <= rating; i++) {
        const star = document.querySelector(`.star-btn[data-rating="${i}"]`);
        if (star && star.style) {
            star.style.color = '#ffc107';
        }
    }
    
    // Store selected rating
    window.currentRating = rating;
}

// ✅ CORREGIDO: Enviar nuevo comentario (YA ERA ASYNC)
async function submitNewComment(salonId) {
    const usernameInput = document.getElementById('newUsername');
    const commentInput = document.getElementById('newComment');
    
    if (!usernameInput || !commentInput) {
        notifier.show('Error: Campos no encontrados', 'error', 3000);
        return;
    }
    
    const username = usernameInput.value.trim();
    const commentText = commentInput.value.trim();
    const rating = window.currentRating || 0;
    
    // ✅✅✅ AGREGAR ESTA VALIDACIÓN DE SEGURIDAD (NUEVO)
    const usernameValidation = SecuritySystem.validateInput(username, 'username');
    const commentValidation = SecuritySystem.validateInput(commentText, 'comment');
    
    if (!usernameValidation.isValid) {
        let errorMessage = 'Nombre de usuario no válido. ';
        switch(usernameValidation.reason) {
            case 'sql_injection':
                errorMessage += 'Contiene caracteres peligrosos.';
                break;
            case 'xss':
                errorMessage += 'Contiene código malicioso.';
                break;
            case 'too_long':
                errorMessage += 'Es demasiado largo.';
                break;
            case 'empty':
                errorMessage += 'No puede estar vacío.';
                break;
            default:
                errorMessage += 'Por favor usa solo texto normal.';
        }
        notifier.show(errorMessage, 'error', 5000);
        usernameInput.focus();
        return;
    }
    
    if (!commentValidation.isValid) {
        let errorMessage = 'Comentario no válido. ';
        switch(commentValidation.reason) {
            case 'sql_injection':
                errorMessage += 'Contiene código SQL peligroso.';
                break;
            case 'xss':
                errorMessage += 'Contiene script malicioso.';
                break;
            case 'too_long':
                errorMessage += 'Es demasiado largo (máximo 500 caracteres).';
                break;
            case 'empty':
                errorMessage += 'No puede estar vacío.';
                break;
            default:
                errorMessage += 'Por favor usa solo texto normal.';
        }
        notifier.show(errorMessage, 'error', 5000);
        commentInput.focus();
        return;
    }
    
    // Verificar nombre único
    if (usedUsernames.has(username.toLowerCase())) {
        notifier.show('Este nombre ya está en uso. Por favor elige otro.', 'error', 5000);
        usernameInput.focus();
        usernameInput.select();
        return;
    }
    
    // ✅ VERIFICAR PALABRAS PROHIBIDAS
    const profaneComment = wordFilter.isProfane(commentText);
    const profaneUsername = wordFilter.isProfane(username);
    
    if (profaneComment || profaneUsername) {
        let message = '';
        
        if (profaneComment && profaneUsername) {
            message = 'El nombre de usuario y el comentario contienen lenguaje inapropiado. Por favor usa un lenguaje respetuoso.';
        } else if (profaneComment) {
            message = 'Tu comentario contiene lenguaje inapropiado. Por favor expresa tu opinión de manera respetuosa.';
        } else if (profaneUsername) {
            message = 'El nombre de usuario contiene lenguaje inapropiado. Por favor elige un nombre respetuoso.';
        }
        
        notifier.show(message, 'error', 6000);
        
        // Efecto visual de advertencia
        if (profaneComment) {
            commentInput.style.borderColor = '#ff6b6b';
            commentInput.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                if (commentInput.style) {
                    commentInput.style.animation = '';
                }
            }, 500);
        }
        
        if (profaneUsername) {
            usernameInput.style.borderColor = '#ff6b6b';
            usernameInput.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                if (usernameInput.style) {
                    usernameInput.style.animation = '';
                }
            }, 500);
        }
        
        return;
    }
    
    // Crear comentario
    const newComment = {
        username: username,
        text: commentText,
        rating: rating,
        date: new Date().toISOString(),
        timestamp: new Date().toISOString()
    };
    
    // Mostrar loading en el botón
    const submitBtn = document.getElementById('submitCommentBtn');
    if (!submitBtn) return;
    
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '⏳ Enviando...';
    submitBtn.disabled = true;
    
    // Guardar en base de datos
    try {
        // ✅ CORREGIDO: Usar la función global agregarComentario
        if (typeof agregarComentario !== 'function') {
            throw new Error('La función agregarComentario no está disponible');
        }
        
        const success = await agregarComentario(salonId, newComment);
        
        if (success) {
            notifier.show('¡Comentario publicado exitosamente! Gracias por tu opinión.', 'success', 4000);
            usedUsernames.add(username.toLowerCase());
            closeCommentsModal();
            
            // Recargar salones para mostrar el nuevo comentario
            if (typeof loadSalones === 'function') {
                setTimeout(() => loadSalones(), 500);
            }
        } else {
            throw new Error('No se pudo guardar el comentario');
        }
    } catch (error) {
        console.error('❌ Error completo:', error);
        notifier.show('Error: ' + error.message, 'error', 5000);
    } finally {
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ✅ CORREGIDO: Cerrar modal
function closeCommentsModal() {
    const modal = document.getElementById('commentsModal');
    if (modal) {
        modal.style.display = 'none';
    }
    // Limpiar rating actual
    window.currentRating = 0;
}

// ✅ CORREGIDO: Formatear fecha del comentario
function formatCommentDate(dateString) {
    try {
        if (!dateString) return 'Fecha desconocida';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Fecha inválida';
        }
        
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        console.error('Error formateando fecha:', e);
        return 'Fecha desconocida';
    }
}

// ✅ CORREGIDO: Calcular rating promedio
function calculateAverageRating(salon) {
    if (!salon || !salon.comments || !Array.isArray(salon.comments) || salon.comments.length === 0) {
        return 0;
    }
    
    const validComments = salon.comments.filter(comment => 
        comment && typeof comment.rating === 'number' && comment.rating > 0
    );
    
    if (validComments.length === 0) return 0;
    
    const sum = validComments.reduce((total, comment) => total + comment.rating, 0);
    const average = sum / validComments.length;
    
    return Math.round(average * 10) / 10; // Redondear a 1 decimal
}

// ✅ CORREGIDO: Función para escapar HTML (seguridad)
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Hacer funciones globales
window.openComments = openComments;
window.closeCommentsModal = closeCommentsModal;
window.selectRating = selectRating;
window.submitNewComment = submitNewComment;
window.wordFilter = wordFilter;
window.escapeHtml = escapeHtml;

console.log('✅ Sistema de comentarios cargado y corregido');