// Configuración de Supabase - REEMPLAZA con tus credenciales reales
const SUPABASE_URL = 'https://tapvkxfblkbarskdmxdo.supabase.co';  // Cambiar por tu URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhcHZreGZibGtiYXJza2RteGRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzE1OTAsImV4cCI6MjA3NjAwNzU5MH0._AaRXoxSzTyY5FTpX7sD3f6WnlKiLCk1DkpixmTyP8o';           // Cambiar por tu key

// Inicializar Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función para login
async function loginUser(email, password) {
    try {
        console.log('Intentando login con:', email);
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('Error en login:', error);
            throw error;
        }
        
        console.log('Login exitoso:', data);
        return { success: true, data };
        
    } catch (error) {
        console.error('Error completo:', error);
        return { success: false, error: error.message };
    }
}

// Función para obtener trabajos del alumno
async function getStudentWorks(studentId) {
    try {
        const { data, error } = await supabase
            .from('works')
            .select('*')
            .eq('student_id', studentId)
            .order('submitted_at', { ascending: false });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error obteniendo trabajos:', error);
        return [];
    }
}

// Función para obtener trabajos para evaluación
async function getWorksForEvaluation() {
    try {
        const { data, error } = await supabase
            .from('works')
            .select('*')
            .order('submitted_at', { ascending: false });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error obteniendo trabajos para evaluación:', error);
        return [];
    }
}

// Función para enviar nuevo trabajo
async function submitWork(workData) {
    try {
        const { data, error } = await supabase
            .from('works')
            .insert([workData]);
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error enviando trabajo:', error);
        return { success: false, error: error.message };
    }
}

// Verificar si el usuario está autenticado
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// Cerrar sesión
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error cerrando sesión:', error);
    return !error;
}