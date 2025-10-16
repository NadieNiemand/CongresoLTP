// Configuración de Supabase - REEMPLAZA con tus credenciales reales
const SUPABASE_URL = 'https://tapvkxfblkbarskdmxdo.supabase.co';  // Cambiar por tu URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhcHZreGZibGtiYXJza2RteGRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzE1OTAsImV4cCI6MjA3NjAwNzU5MH0._AaRXoxSzTyY5FTpX7sD3f6WnlKiLCk1DkpixmTyP8o';           // Cambiar por tu key

// Inicializar Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función para login MEJORADA
async function loginUser(email, password) {
    try {
        console.log('🔐 Intentando login con:', email);
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('❌ Error en login:', error);
            throw error;
        }
        
        console.log('✅ Login exitoso:', data);
        
        // Obtener el perfil del usuario (FORZAR la obtención)
        let profile = null;
        try {
            profile = await getUserProfile(data.user.id);
            console.log('📋 Perfil obtenido:', profile);
        } catch (profileError) {
            console.warn('⚠️ No se pudo obtener el perfil:', profileError);
            // Continuar sin perfil
        }
        
        return { 
            success: true, 
            data: {
                ...data,
                profile: profile
            }
        };
        
    } catch (error) {
        console.error('❌ Error completo:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}
// Obtener perfil del usuario
async function getUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) {
            console.error('Error obteniendo perfil:', error);
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Función para registrar nuevo usuario
async function registerUser(email, password, name, userType) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                    user_type: userType
                }
            }
        });
        
        if (error) throw error;
        
        // Crear perfil de usuario
        if (data.user) {
            const { error: profileError } = await supabase
                .from('user_profiles')
                .insert([
                    {
                        id: data.user.id,
                        email: email,
                        name: name,
                        user_type: userType
                    }
                ]);
            
            if (profileError) throw profileError;
        }
        
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Verificar sesión activa
async function getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
}

// Obtener usuario actual
async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
}

// Cerrar sesión
async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
}

// Obtener trabajos del alumno (REAL)
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

// Función MEJORADA para obtener trabajos para evaluación
// Función CORREGIDA para obtener trabajos para evaluación
async function getWorksForEvaluation() {
    try {
        console.log('🔍 Ejecutando consulta CORREGIDA...');
        
        // PRIMERO: Probar una consulta simple sin relaciones
        const { data: simpleData, error: simpleError } = await supabase
            .from('works')
            .select('*')
            .order('submitted_at', { ascending: false });
            
        if (simpleError) {
            console.error('❌ Error en consulta simple:', simpleError);
            throw simpleError;
        }
        
        console.log('✅ Consulta simple exitosa. Trabajos:', simpleData);
        
        // Si hay trabajos, obtener los nombres de los estudiantes por separado
        if (simpleData && simpleData.length > 0) {
            console.log('🔄 Obteniendo información de estudiantes...');
            
            // Obtener todos los student_ids únicos
            const studentIds = [...new Set(simpleData.map(work => work.student_id))];
            
            // Consultar los perfiles de los estudiantes
            const { data: studentProfiles, error: profileError } = await supabase
                .from('user_profiles')
                .select('id, name, email')
                .in('id', studentIds);
                
            if (profileError) {
                console.error('❌ Error obteniendo perfiles:', profileError);
                // Continuar sin los nombres de estudiantes
            }
            
            // Combinar los datos
            const worksWithStudents = simpleData.map(work => {
                const studentProfile = studentProfiles?.find(profile => profile.id === work.student_id);
                return {
                    ...work,
                    user_profiles: studentProfile ? {
                        name: studentProfile.name,
                        email: studentProfile.email
                    } : null
                };
            });
            
            console.log('✅ Datos combinados exitosamente');
            return worksWithStudents;
        }
        
        return simpleData || [];
        
    } catch (error) {
        console.error('❌ Error completo en getWorksForEvaluation:', error);
        throw error;
    }
}

// Enviar nuevo trabajo (REAL)
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

// Función para obtener evaluaciones existentes
async function getWorkEvaluations(workId) {
    try {
        const { data, error } = await supabase
            .from('evaluations')
            .select('*')
            .eq('work_id', workId);
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error obteniendo evaluaciones:', error);
        return [];
    }
}


// Función ACTUALIZADA para crear evaluación
async function createEvaluation(evaluationData) {
    try {
        console.log('💾 Guardando evaluación en la base de datos...');
        
        const { data, error } = await supabase
            .from('evaluations')
            .insert([evaluationData]);
        
        if (error) {
            console.error('❌ Error guardando evaluación:', error);
            throw error;
        }
        
        console.log('✅ Evaluación guardada correctamente');
        return { success: true, data };
        
    } catch (error) {
        console.error('Error creando evaluación:', error);
        return { success: false, error: error.message };
    }
}

// Funciones para gestión de códigos de invitación

// Validar código de invitación
async function validateInvitationCode(code) {
    try {
        // Limpiar el código (quitar guiones si los tiene)
        const cleanCode = code.replace(/-/g, '').toUpperCase();
        
        console.log('🔍 Validando código:', cleanCode);
        
        const { data, error } = await supabase
            .from('invitation_codes')
            .select('*')
            .eq('code', cleanCode)
            .eq('is_active', true)
            .gte('expires_at', new Date().toISOString())
            .is('used_by', null)
            .single();
        
        if (error) {
            console.error('❌ Error validando código:', error);
            return { 
                valid: false, 
                error: 'Código no encontrado o ya utilizado' 
            };
        }
        
        if (!data) {
            return { 
                valid: false, 
                error: 'Código inválido, expirado o ya utilizado' 
            };
        }
        
        console.log('✅ Código válido encontrado:', data);
        return { 
            valid: true, 
            codeData: data 
        };
        
    } catch (error) {
        console.error('❌ Error en validateInvitationCode:', error);
        return { 
            valid: false, 
            error: 'Error validando el código de invitación' 
        };
    }
}

// Marcar código como usado
async function markInvitationCodeAsUsed(code, userId) {
    try {
        const cleanCode = code.replace(/-/g, '').toUpperCase();
        
        console.log('📝 Marcando código como usado:', cleanCode, 'por usuario:', userId);
        
        const { error } = await supabase
            .from('invitation_codes')
            .update({ 
                used_by: userId,
                used_at: new Date().toISOString()
            })
            .eq('code', cleanCode)
            .eq('is_active', true)
            .is('used_by', null);
        
        if (error) {
            console.error('❌ Error marcando código como usado:', error);
            throw error;
        }
        
        console.log('✅ Código marcado como usado exitosamente');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error en markInvitationCodeAsUsed:', error);
        throw error;
    }
}

// Obtener códigos de invitación (para admin)
async function getInvitationCodes() {
    try {
        const { data, error } = await supabase
            .from('invitation_codes')
            .select(`
                *,
                user_profiles!created_by (name),
                used_profiles:user_profiles!used_by (name)
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error obteniendo códigos:', error);
        return [];
    }
}

