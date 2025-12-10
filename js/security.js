class SecuritySystem {
    
    // Detector de patrones SQL maliciosos
    static containsSQLInjection(text) {
        if (!text || typeof text !== 'string') return false;
        
        const sqlPatterns = [
            // Comandos SQL peligrosos
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC)\b)/i,
            // Palabras clave de manipulación
            /(\b(UNION|WHERE|FROM|TABLE|DATABASE|COLUMN)\b)/i,
            // Caracteres de inyección
            /('|"|;|--|\/\*|\*\/|\\\\)/g,
            // Condiciones de bypasseo
            /(\b(OR|AND)\s+['"]?[\d\w]+['"]?\s*=[\s]*['"]?[\d\w]+)/i
        ];
        
        const attackDetected = sqlPatterns.some(pattern => pattern.test(text));
        
        if (attackDetected) {
            console.warn('🚨 SQL Injection detectado y bloqueado:', text.substring(0, 50));
            this.logSecurityEvent('sql_injection_blocked', { input: text.substring(0, 50) });
            return true;
        }
        
        return false;
    }
    
    // Detector de XSS
    static containsXSS(text) {
        if (!text || typeof text !== 'string') return false;
        
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe/gi,
            /<object/gi,
            /data:/gi
        ];
        
        const xssDetected = xssPatterns.some(pattern => pattern.test(text));
        
        if (xssDetected) {
            console.warn('🚨 XSS detectado y bloqueado:', text.substring(0, 50));
            this.logSecurityEvent('xss_blocked', { input: text.substring(0, 50) });
            return true;
        }
        
        return false;
    }
    
    // Limpiador de entradas de búsqueda
    static sanitizeSearchInput(text) {
        if (!text) return '';
        // Elimina caracteres peligrosos pero mantiene la funcionalidad
        return text.replace(/[<>"'%;()&+]/g, '');
    }
    
    // Validador completo de entradas
    static validateInput(text, inputType = 'general') {
        if (!text || typeof text !== 'string') {
            return { isValid: false, reason: 'invalid_type' };
        }
        
        if (this.containsSQLInjection(text)) {
            return { isValid: false, reason: 'sql_injection' };
        }
        
        if (this.containsXSS(text)) {
            return { isValid: false, reason: 'xss' };
        }
        
        if (text.length > 500) {
            return { isValid: false, reason: 'too_long' };
        }
        
        if (text.trim().length === 0) {
            return { isValid: false, reason: 'empty' };
        }
        
        return { isValid: true, reason: 'safe' };
    }
    
    // Logger de eventos de seguridad
    static logSecurityEvent(eventType, details) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp: timestamp,
            event: eventType,
            details: details,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.log('🔒 Evento de seguridad:', logEntry);
        
        // Guardar en localStorage para auditoría
        try {
            const existingLogs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
            existingLogs.push(logEntry);
            // Mantener solo los últimos 100 eventos
            if (existingLogs.length > 100) {
                existingLogs.splice(0, existingLogs.length - 100);
            }
            localStorage.setItem('securityLogs', JSON.stringify(existingLogs));
        } catch (e) {
            console.error('Error guardando log de seguridad:', e);
        }
    }
    
    // Función para ver logs de seguridad (útil para debugging)
    static showSecurityLogs() {
        try {
            const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
            console.log('📋 Logs de seguridad:', logs);
            return logs;
        } catch (e) {
            console.error('Error leyendo logs de seguridad:', e);
            return [];
        }
    }
}

// Hacer disponible globalmente
window.SecuritySystem = SecuritySystem;
console.log('🛡️ Sistema de seguridad cargado');