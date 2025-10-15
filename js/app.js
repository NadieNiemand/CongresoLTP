// Aplicación principal
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    // Manejar formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Cargar contenido específico de cada página
    const path = window.location.pathname;
    
    if (path.includes('student-dashboard')) {
        await loadStudentDashboard();
    } else if (path.includes('evaluator-dashboard')) {
        await loadEvaluatorDashboard();
    } else if (path.includes('submit-work')) {
        setupSubmitForm();
    }

    // Verificar autenticación en páginas protegidas
    await checkPageAuth();
}

// Manejar login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginText = document.getElementById('loginText');
    const loginSpinner = document.getElementById('loginSpinner');
    
    // Mostrar loading
    loginText.textContent = 'Iniciando sesión...';
    loginSpinner.classList.remove('d-none');
    
    try {
        const result = await loginUser(email, password);
        
        if (result.success) {
            // Login exitoso - redirigir según tipo de usuario
            const userType = determineUserType(email);
            
            setTimeout(() => {
                if (userType === 'evaluator') {
                    window.location.href = 'evaluator-dashboard.html';
                } else {
                    window.location.href = 'student-dashboard.html';
                }
            }, 1000);
            
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        // Mostrar error
        loginText.textContent = 'Ingresar al Portal';
        loginSpinner.classList.add('d-none');
        
        alert('Error al iniciar sesión: ' + error.message);
    }
}

// Determinar tipo de usuario por email (simulación)
function determineUserType(email) {
    if (email.includes('profesor') || email.includes('evaluador') || email.includes('comite')) {
        return 'evaluator';
    }
    return 'student';
}

// Cargar dashboard del alumno
async function loadStudentDashboard() {
    // Por ahora usamos datos de ejemplo
    const works = [
        {
            id: 1,
            title: "Investigación sobre Inteligencia Artificial en Educación",
            status: "En revisión",
            date: "2024-01-15",
            modality: "Ponencia",
            filename: "tesis_IA_educacion.pdf",
            score: null
        },
        {
            id: 2,
            title: "Análisis de Datos Educativos con Machine Learning", 
            status: "Aceptado",
            date: "2024-01-10",
            modality: "Póster",
            filename: "analisis_datos_ML.pdf",
            score: 92
        },
        {
            id: 3,
            title: "Estudio de Caso: Métodos de Enseñanza Innovadores",
            status: "Pendiente",
            date: "2024-01-08", 
            modality: "Ponencia",
            filename: "estudio_caso_ensenianza.pdf",
            score: null
        }
    ];
    
    displayWorks(works, 'student');
}

// Cargar dashboard del evaluador  
async function loadEvaluatorDashboard() {
    const works = [
        {
            id: 1,
            title: "Investigación sobre Inteligencia Artificial en Educación",
            student: "Juan Pérez",
            status: "En revisión", 
            date: "2024-01-15",
            modality: "Ponencia",
            filename: "tesis_IA_educacion.pdf",
            evaluations: 1
        },
        {
            id: 2,
            title: "Análisis de Datos Educativos con Machine Learning",
            student: "María García", 
            status: "Pendiente",
            date: "2024-01-10",
            modality: "Póster", 
            filename: "analisis_datos_ML.pdf",
            evaluations: 0
        }
    ];
    
    displayWorks(works, 'evaluator');
}

// Mostrar trabajos en la lista
function displayWorks(works, userType) {
    const worksContainer = document.getElementById('worksList');
    if (!worksContainer) return;
    
    if (works.length === 0) {
        worksContainer.innerHTML = `
            <div class="text-center py-5">
                <p class="text-muted">No hay trabajos para mostrar</p>
            </div>
        `;
        return;
    }
    
    worksContainer.innerHTML = works.map(work => {
        const statusClass = `status-${work.status.toLowerCase().replace(' ', '-')}`;
        
        if (userType === 'student') {
            return `
                <div class="work-card">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h5>${work.title}</h5>
                            <p class="mb-1"><strong>Estado:</strong> <span class="${statusClass}">${work.status}</span></p>
                            <p class="mb-1"><strong>Fecha de envío:</strong> ${work.date}</p>
                            <p class="mb-1"><strong>Modalidad:</strong> ${work.modality}</p>
                            <p class="mb-1"><strong>Archivo:</strong> ${work.filename}</p>
                            ${work.score ? `<p class="mb-0"><strong>Calificación:</strong> ${work.score}/100</p>` : ''}
                        </div>
                        <div class="ms-3">
                            <span class="badge bg-secondary">${work.modality}</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Vista para evaluador
            return `
                <div class="work-card">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h5>${work.title}</h5>
                            <p class="mb-1"><strong>Estudiante:</strong> ${work.student}</p>
                            <p class="mb-1"><strong>Estado:</strong> <span class="${statusClass}">${work.status}</span></p>
                            <p class="mb-1"><strong>Fecha de envío:</strong> ${work.date}</p>
                            <p class="mb-1"><strong>Modalidad propuesta:</strong> ${work.modality}</p>
                            <p class="mb-2"><strong>Evaluaciones realizadas:</strong> ${work.evaluations}</p>
                            <button class="btn btn-sm btn-outline-primary" onclick="evaluateWork(${work.id})">
                                Evaluar Trabajo
                            </button>
                        </div>
                        <div class="ms-3">
                            <span class="badge bg-secondary">${work.modality}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }).join('');
}

// Configurar formulario de envío
function setupSubmitForm() {
    const form = document.getElementById('submitWorkForm');
    if (form) {
        form.addEventListener('submit', handleWorkSubmit);
    }
}

// Manejar envío de trabajo
async function handleWorkSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const workData = {
        title: formData.get('title'),
        abstract: formData.get('abstract'),
        modality: formData.get('modality')
    };
    
    // Aquí iría la lógica para subir el archivo y guardar en Supabase
    alert('Trabajo enviado correctamente (simulación)');
    window.location.href = 'student-dashboard.html';
}

// Verificar autenticación en páginas protegidas
async function checkPageAuth() {
    const protectedPages = ['student-dashboard', 'evaluator-dashboard', 'submit-work'];
    const currentPage = window.location.pathname;
    
    const isProtected = protectedPages.some(page => currentPage.includes(page));
    
    if (isProtected) {
        const session = await checkAuth();
        if (!session) {
            // Simulación - en producción redirigiría a login
            console.log('No autenticado, redirigiendo...');
        }
    }
}

// Función para evaluar trabajo (simulación)
function evaluateWork(workId) {
    alert(`Evaluando trabajo ID: ${workId} - Esta funcionalidad se implementará después`);
}