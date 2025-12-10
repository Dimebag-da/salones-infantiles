// js/database-firebase.js
class FirebaseDatabase {
    constructor() {
        console.log('🔄 Inicializando Database con Firebase...');
        this.initialized = false;
        this.db = null;
        this.init();
    }

    async init() {
        try {
            if (typeof firebase === 'undefined') {
                console.error('❌ Firebase no está cargado');
                setTimeout(() => this.init(), 2000);
                return;
            }
            
            // Esperar a que Firebase esté listo
            if (!firebase.apps.length) {
                await firebase.initializeApp(firebaseConfig);
            }
            
            this.db = firebase.firestore();
            this.initialized = true;
            console.log('✅ Firebase Database lista');
            
        } catch (error) {
            console.error('❌ Error inicializando Firebase:', error);
            setTimeout(() => this.init(), 2000);
        }
    }

    async waitForInit() {
        if (this.initialized && this.db) return true;
        
        return new Promise((resolve) => {
            const checkInit = () => {
                if (this.initialized && this.db) {
                    resolve(true);
                } else {
                    setTimeout(checkInit, 100);
                }
            };
            checkInit();
        });
    }

    async getAllSalones() {
        await this.waitForInit();
        
        if (!this.initialized || !this.db) {
            console.error('❌ Firebase no inicializado');
            return [];
        }

        try {
            console.log('📥 Obteniendo salones desde Firebase...');
            const snapshot = await this.db.collection('salones').get();
            const salones = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log('✅ Salones obtenidos:', salones.length);
            return salones;
        } catch (error) {
            console.error('❌ Error obteniendo salones:', error);
            return [];
        }
    }

    async addSalon(salonData) {
        await this.waitForInit();
        
        if (!this.initialized || !this.db) {
            throw new Error('Firebase no inicializado');
        }

        try {
            const docRef = await this.db.collection('salones').add({
                ...salonData,
                createdAt: new Date().toISOString()
            });
            console.log('➕ Salón agregado con ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error agregando salón:', error);
            throw error;
        }
    }

    async updateSalon(salonId, salonData) {
        await this.waitForInit();
        
        if (!this.initialized || !this.db) {
            console.error('❌ Firebase no inicializado');
            return false;
        }

        try {
            await this.db.collection('salones').doc(salonId).update(salonData);
            console.log('✏️ Salón actualizado:', salonId);
            return true;
        } catch (error) {
            console.error('❌ Error actualizando salón:', error);
            return false;
        }
    }

    async deleteSalon(salonId) {
        await this.waitForInit();
        
        if (!this.initialized || !this.db) {
            console.error('❌ Firebase no inicializado');
            return false;
        }

        try {
            await this.db.collection('salones').doc(salonId).delete();
            console.log('🗑️ Salón eliminado:', salonId);
            return true;
        } catch (error) {
            console.error('❌ Error eliminando salón:', error);
            return false;
        }
    }

    async addComment(salonId, comment) {
        await this.waitForInit();
        
        if (!this.initialized || !this.db) {
            console.error('❌ Firebase no inicializado');
            return false;
        }

        try {
            const salonRef = this.db.collection('salones').doc(salonId);
            const salonDoc = await salonRef.get();
            
            if (!salonDoc.exists) {
                console.error('❌ Salón no encontrado:', salonId);
                return false;
            }

            const salonData = salonDoc.data();
            const comments = salonData.comments || [];
            
            const newComment = {
                username: comment.username,
                text: comment.text,
                rating: comment.rating,
                timestamp: new Date().toISOString(),
                id: Date.now().toString()
            };
            
            comments.push(newComment);
            
            await salonRef.update({
                comments: comments
            });
            
            console.log('💬 Comentario agregado a salón:', salonId);
            return true;
        } catch (error) {
            console.error('❌ Error agregando comentario:', error);
            return false;
        }
    }

    async deleteComment(salonId, username) {
        await this.waitForInit();
        
        if (!this.initialized || !this.db) {
            console.error('❌ Firebase no inicializado');
            return false;
        }

        try {
            const salonRef = this.db.collection('salones').doc(salonId);
            const salonDoc = await salonRef.get();
            
            if (!salonDoc.exists) {
                console.error('❌ Salón no encontrado');
                return false;
            }

            const salonData = salonDoc.data();
            const comments = salonData.comments || [];
            const updatedComments = comments.filter(comment => comment.username !== username);
            
            await salonRef.update({ comments: updatedComments });
            console.log('🗑️ Comentario eliminado de:', salonId);
            return true;
        } catch (error) {
            console.error('❌ Error eliminando comentario:', error);
            return false;
        }
    }

    async resetToSampleData() {
        await this.waitForInit();
        
        if (!this.initialized || !this.db) {
            console.error('❌ Firebase no inicializado');
            return false;
        }

        try {
            // Eliminar todos los salones existentes
            const snapshot = await this.db.collection('salones').get();
            const batch = this.db.batch();
            
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            
            // Agregar datos de ejemplo
            const sampleData = this.getSampleData();
            for (const salon of sampleData) {
                await this.db.collection('salones').add(salon);
            }
            
            console.log('🔄 Datos restablecidos a valores de ejemplo');
            return true;
        } catch (error) {
            console.error('❌ Error restableciendo datos:', error);
            return false;
        }
    }

    getSampleData() {
        return [
            {
                name: 'Salon Infantil JOELITO',
                description: 'Un lugar mágico lleno de diversión con toboganes gigantes y piscinas de pelotas. Perfecto para cumpleaños infantiles.',
                image: 'images/salones/salon1.jpg',
                gallery: ['images/gallery/salon1-1.jpg'],
                lat: -16.485206082135807,
                lng: -68.17963284118407,
                comments: [
                    {
                        username: 'María López',
                        text: '¡Mi hijo amó su fiesta aquí! Los toboganes son increíbles.',
                        rating: 5,
                        timestamp: '2024-01-15T10:30:00Z',
                        id: '1'
                    }
                ]
            },
            // Salones en Zona Ballivián, El Alto
            {
                name: 'M&L salón de eventos infantiles y familiares',
                description: 'Amplio salón con decoración temática y área de juegos infantiles',
                image: 'images/salones/salon2.jpg',
                gallery: ['images/gallery/salon2-1.jpg'],
                lat: -16.491625566631164,
                lng: -68.18057697871292,
                comments: [
                    {
                        username: 'Carlos Rojas',
                        text: 'Excelente atención y espacio amplio para los niños.',
                        rating: 4,
                        timestamp: '2024-02-10T14:20:00Z',
                        id: '2'
                    }
                ]
            },
            {
                name: 'Salón de Eventos "Thundercats"',
                description: 'Salón con castillos inflables',
                image: 'images/salones/salon3.jpg',
                gallery: ['images/gallery/salon3-1.jpg'],
                lat: -16.490805861322816,
                lng: -68.17624008135503,
                comments: [
                    {
                        username: 'Ana Vargas',
                        text: 'Los shows de magia son fascinantes, los niños no querían irse.',
                        rating: 5,
                        timestamp: '2024-02-28T11:45:00Z',
                        id: '3'
                    }
                ]
            },
            {
                name: 'Salon de Eventos Infantiles Pequeño Gigante',
                description: 'Parque de diversiones indoor con carrusel, mini montaña rusa y juegos interactivos.',
                image: 'images/salones/salon4.jpg',
                gallery: ['images/gallery/salon4-1.jpg'],
                lat: -16.494133709935806,
                lng: -68.17620500942633,
                comments: [
                    {
                        username: 'Roberto Paz',
                        text: 'Perfecto para fiestas de niños grandes, los juegos son muy divertidos.',
                        rating: 4,
                        timestamp: '2024-03-05T16:30:00Z',
                        id: '4'
                    }
                ]
            },
            {
                name: 'Salon de eventos infantiles "El Principito"',
                description: 'Salón con temática de superhéroes, ideal para cumpleaños de niños aventureros.',
                image: 'images/salones/salon5.jpg',
                gallery: ['images/gallery/salon5-1.jpg'],
                lat: -16.493299269009974,
                lng: -68.17692287751306,
                comments: [
                    {
                        username: 'Lucía Fernández',
                        text: 'A mi hijo le encantó la decoración de superhéroes, muy creativo.',
                        rating: 5,
                        timestamp: '2024-03-12T10:15:00Z',
                        id: '5'
                    }
                ]
            },
            {
                name: 'Salon ANGELITO',
                description: 'Acogedor salón para bebés y niños pequeños, con zona suave y juegos educativos.',
                image: 'images/salones/salon6.jpg',
                gallery: ['images/gallery/salon6-1.jpg'],
                lat: -16.487497101998244,
                lng: -68.17230947808011,
                comments: [
                    {
                        username: 'Sofía Mendoza',
                        text: 'Ideal para primera comunión y bautizos, muy bien decorado.',
                        rating: 4,
                        timestamp: '2024-03-18T13:20:00Z',
                        id: '6'
                    }
                ]
            },
            // Salones en Zona Los Andes, El Alto
            {
                name: 'Salon De Eventos Infantiles "La Casita"',
                description: 'Gran salón con capacidad para 200 personas, ideal para fiestas grandes familiares.',
                image: 'images/salones/salon7.jpg',
                gallery: ['images/gallery/salon7-1.jpg'],
                lat: -16.486597696331124,
                lng: -68.17183897892045,
                comments: [
                    {
                        username: 'Juan Pérez',
                        text: 'Excelente para quinceañeros, el espacio es enorme y bien equipado.',
                        rating: 5,
                        timestamp: '2024-01-25T18:45:00Z',
                        id: '7'
                    }
                ]
            },
            {
                name: 'J&J salon de eventos infantiles',
                description: 'Salón temático con diferentes áreas: princesas, piratas, animales y espacio exterior.',
                image: 'images/salones/salon8.jpg',
                gallery: ['images/gallery/salon8-1.jpg'],
                lat: -16.49326543074569,
                lng: -68.18120197298242,
                comments: [
                    {
                        username: 'Patricia Cruz',
                        text: 'Las diferentes áreas temáticas son un éxito, cada niño encuentra su espacio favorito.',
                        rating: 4,
                        timestamp: '2024-02-14T12:30:00Z',
                        id: '8'
                    }
                ]
            },
            {
                name: 'Salon de eventos infantiles Disney',
                description: 'Salón colorido con payasos, globoflexia y pintacaritas incluidos en el paquete básico.',
                image: 'images/salones/salon9.jpg',
                gallery: ['images/gallery/salon9-1.jpg'],
                lat: -16.49119338285067,
                lng: -68.20877244531772,
                comments: [
                    {
                        username: 'Miguel Ángel',
                        text: 'Los animadores son profesionales y los niños se divierten muchísimo.',
                        rating: 5,
                        timestamp: '2024-02-22T15:10:00Z',
                        id: '9'
                    }
                ]
            },
            {
                name: 'Salón de eventos infantiles Condorito',
                description: 'Especialistas en fiestas temáticas personalizadas según los intereses del niño.',
                image: 'images/salones/salon10.jpg',
                gallery: ['images/gallery/salon10-1.jpg'],
                lat: -16.479834495292742,
                lng: -68.17790688397788,
                comments: [
                    {
                        username: 'Elena Torres',
                        text: 'Hicieron una fiesta de dinosaurios personalizada, ¡fue increíble!',
                        rating: 5,
                        timestamp: '2024-03-08T17:20:00Z',
                        id: '10'
                    }
                ]
            }
        ];
    }
}

// Crear instancia global
console.log('🚀 Creando instancia de Firebase Database...');
const appDatabase = new FirebaseDatabase();