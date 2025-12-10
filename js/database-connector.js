// js/database-connector.js - CONEXIÓN ENTRE COMMENTS.JS Y FIREBASE CORREGIDA

// Funciones puente para comments.js
class DatabaseConnector {
    constructor() {
        console.log('🔌 DatabaseConnector inicializado');
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            // Esperar a que appDatabase esté disponible
            await this.waitForAppDatabase();
            this.initialized = true;
            console.log('✅ DatabaseConnector listo');
        } catch (error) {
            console.error('❌ Error inicializando DatabaseConnector:', error);
        }
    }

    async waitForAppDatabase() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 segundos máximo
            
            const checkAppDatabase = () => {
                attempts++;
                
                if (typeof appDatabase !== 'undefined' && appDatabase.db) {
                    console.log('✅ appDatabase disponible para DatabaseConnector');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('appDatabase no disponible después de ' + maxAttempts + ' intentos'));
                } else {
                    console.log('⏳ Esperando appDatabase... intento', attempts);
                    setTimeout(checkAppDatabase, 100);
                }
            };
            
            checkAppDatabase();
        });
    }

    // Agregar comentario a un salón - FUNCIÓN PRINCIPAL CORREGIDA
    async addComment(salonId, commentData) {
        console.log('📝 DatabaseConnector: Agregando comentario a salón:', salonId, commentData);
        
        try {
            // Verificar que appDatabase existe y está inicializado
            if (typeof appDatabase === 'undefined') {
                throw new Error('appDatabase no está disponible');
            }

            // Esperar a que Firebase esté inicializado
            if (typeof appDatabase.waitForInit === 'function') {
                await appDatabase.waitForInit();
            }

            // Verificar que la función addComment existe en appDatabase
            if (typeof appDatabase.addComment !== 'function') {
                throw new Error('appDatabase.addComment no es una función');
            }

            console.log('✅ Llamando a appDatabase.addComment...');
            const result = await appDatabase.addComment(salonId, commentData);
            console.log('✅ Resultado de appDatabase.addComment:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error en DatabaseConnector.addComment:', error);
            
            // Intentar método alternativo si el principal falla
            try {
                console.log('🔄 Intentando método alternativo...');
                return await this.addCommentAlternative(salonId, commentData);
            } catch (fallbackError) {
                console.error('❌ Error en método alternativo:', fallbackError);
                throw new Error('No se pudo agregar el comentario: ' + error.message);
            }
        }
    }

    // Método alternativo si el principal falla
    async addCommentAlternative(salonId, commentData) {
        console.log('🔄 Usando método alternativo para agregar comentario...');
        
        try {
            // Obtener todos los salones
            const salones = await appDatabase.getAllSalones();
            const salonIndex = salones.findIndex(s => s.id.toString() === salonId.toString());
            
            if (salonIndex === -1) {
                throw new Error('Salón no encontrado: ' + salonId);
            }
            
            // Preparar el comentario
            const commentWithId = {
                ...commentData,
                id: this.generateId(),
                timestamp: new Date().toISOString()
            };
            
            // Inicializar array de comentarios si no existe
            if (!salones[salonIndex].comments) {
                salones[salonIndex].comments = [];
            }
            
            // Agregar comentario
            salones[salonIndex].comments.push(commentWithId);
            
            // Actualizar en Firebase usando updateSalon si existe
            if (typeof appDatabase.updateSalon === 'function') {
                await appDatabase.updateSalon(salonId, {
                    comments: salones[salonIndex].comments
                });
            } else {
                // Fallback: recargar todos los datos (menos eficiente)
                console.warn('⚠️ updateSalon no disponible, usando fallback');
                await appDatabase.saveData(salones);
            }
            
            console.log('✅ Comentario agregado con método alternativo');
            return true;
            
        } catch (error) {
            console.error('❌ Error en método alternativo:', error);
            throw error;
        }
    }

    // Obtener comentarios de un salón - CORREGIDO
    async getComments(salonId) {
        try {
            console.log('📥 DatabaseConnector: Obteniendo comentarios para salón:', salonId);
            
            if (typeof appDatabase === 'undefined') {
                console.error('appDatabase no disponible');
                return [];
            }
            
            // ✅ CORREGIDO: Usar await
            const salones = await appDatabase.getAllSalones();
            const salon = salones.find(s => s.id.toString() === salonId.toString());
            
            if (!salon) {
                console.warn('⚠️ Salón no encontrado:', salonId);
                return [];
            }
            
            return salon.comments || [];
        } catch (error) {
            console.error('❌ Error obteniendo comentarios:', error);
            return [];
        }
    }

    // Generar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// ✅ CORREGIDO: Instanciar y hacer global DE FORMA SEGURA
let databaseConnector;

try {
    console.log('🚀 Inicializando DatabaseConnector...');
    databaseConnector = new DatabaseConnector();
} catch (error) {
    console.error('❌ Error creando DatabaseConnector:', error);
    // Crear una instancia básica como fallback
    databaseConnector = {
        addComment: async () => { 
            throw new Error('DatabaseConnector no inicializado correctamente');
        },
        getComments: async () => []
    };
}

// ✅ CORREGIDO: Funciones globales con mejor manejo de errores
window.agregarComentario = async (salonId, commentData) => {
    console.log('🌍 agregarComentario llamado con:', { salonId, commentData });
    
    try {
        if (!databaseConnector) {
            throw new Error('DatabaseConnector no está disponible');
        }
        
        if (typeof databaseConnector.addComment !== 'function') {
            throw new Error('databaseConnector.addComment no es una función');
        }
        
        const result = await databaseConnector.addComment(salonId, commentData);
        console.log('✅ agregarComentario resultado:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Error en agregarComentario:', error);
        
        // Mostrar notificación al usuario
        if (typeof notifier !== 'undefined') {
            notifier.show('Error al guardar comentario: ' + error.message, 'error', 5000);
        }
        
        throw error;
    }
};

window.obtenerComentarios = async (salonId) => {
    console.log('🌍 obtenerComentarios llamado para salón:', salonId);
    
    try {
        if (!databaseConnector || typeof databaseConnector.getComments !== 'function') {
            console.warn('DatabaseConnector no disponible, retornando array vacío');
            return [];
        }
        
        return await databaseConnector.getComments(salonId);
    } catch (error) {
        console.error('❌ Error en obtenerComentarios:', error);
        return [];
    }
};

// ✅ Función de utilidad para verificar el estado
window.verificarEstadoConexion = () => {
    const estado = {
        appDatabase: typeof appDatabase,
        appDatabaseAddComment: typeof appDatabase !== 'undefined' ? typeof appDatabase.addComment : 'no disponible',
        databaseConnector: typeof databaseConnector,
        databaseConnectorAddComment: typeof databaseConnector !== 'undefined' ? typeof databaseConnector.addComment : 'no disponible',
        agregarComentario: typeof agregarComentario
    };
    
    console.log('🔍 Estado de la conexión:', estado);
    return estado;
};

console.log('✅ DatabaseConnector cargado - Comentarios listos');

// ✅ Inicialización diferida para asegurar que todo esté listo
setTimeout(() => {
    console.log('🔍 Verificando estado final de DatabaseConnector...');
    window.verificarEstadoConexion();
}, 2000);